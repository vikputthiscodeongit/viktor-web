<?php
// This relies entirely on some internal Instagram App API ID being whitelisted for the `web_profile_info`
// API endpoint. It will definitely break some day - let's hope that day is in a very distant future.

require __DIR__ . "/../../global.php";
require ROOT_DIR . "/_folder/values.php";
require ROOT_DIR . "/php/helpers/curl-multi-transfer.php";
require ROOT_DIR . "/php/helpers/recursive-rmdir.php";
require ROOT_DIR . "/php/helpers/return-http-response.php";
require ROOT_DIR . "/content/global-content.php";

function fetchPostsData(string $instagram_username)
{
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://www.instagram.com/api/v1/users/web_profile_info/?username=" . $instagram_username,
        CURLOPT_HTTPHEADER => ["X-IG-App-ID: " . IG_APP_ID],
        CURLOPT_HEADER => false,
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $ch_result = curl_exec($ch);

    if (curl_getinfo($ch, CURLINFO_RESPONSE_CODE) !== 200) {
        return false;
    }

    $fetched_data = json_decode($ch_result);
    $fetched_posts_data = isset($fetched_data->data->user->edge_owner_to_timeline_media->edges)
        ? $fetched_data->data->user->edge_owner_to_timeline_media->edges
        : [];

    return $fetched_posts_data;
}

function getMediaFileName(string $url)
{
    $file_name_parts = preg_match("/([^\/]+)(\.[A-Za-z0-9]+)\?+/", $url, $name_matches) === 1
        ? [
            "name" => $name_matches[1],
            "extension" => $name_matches[2]
        ] : null;

    if (!$file_name_parts) return null;

    $media_dimensions = preg_match("/_s([0-9]+x[0-9]+)[^0-9]/", $url, $dimensions_matches) === 1
        ? $dimensions_matches[1]
        : null;
    $file_name = $media_dimensions
        ? $file_name_parts["name"] . "-" . $media_dimensions . $file_name_parts["extension"]
        : $file_name_parts["name"] . $file_name_parts["extension"];

    return $file_name;
}

function fetchStorePostMedia(array $urls, string $post_media_dir_uri)
{
    $curl_urls = array_filter($urls, function ($url) use ($post_media_dir_uri) {
        $file_name = getMediaFileName($url);
        return $file_name ? !file_exists($post_media_dir_uri . "/" . $file_name) : false;
    });
    curl_multi_transfer(
        $curl_urls,
        function ($url, $body, $info) use ($post_media_dir_uri) {
            if ($info === false || $info["http_code"] !== 200) {
                error_log("Fetch failed: HTTP " . $info["http_code"] . " - " . $url);
                return;
            }

            $file_name = getMediaFileName($url);

            if (!$file_name) return;

            $media_write_result = file_put_contents($post_media_dir_uri . "/" . $file_name, $body);
            if ($media_write_result === false) error_log("Media file write failed.");
        },
        2,
    );
}

function processPostsData(array $fetched_posts_data, string $posts_media_dir_uri)
{
    $processed_posts = [];

    foreach ($fetched_posts_data as $fetched_data_post) {
        $post = $fetched_data_post->node;

        $fetched_data_post_caption = $post->edge_media_to_caption->edges;
        $caption_text = count($fetched_data_post_caption) > 0
            ? $fetched_data_post_caption[0]->node->text
            : null;

        $fetched_data_post_media = isset($post->edge_sidecar_to_children->edges)
            ? $post->edge_sidecar_to_children->edges
            : null;
        $curl_urls = [];
        $media_files = [];

        if (!is_null($fetched_data_post_media)) {
            foreach ($fetched_data_post_media as $item) {
                $url = $item->node->display_url;
                $file_name = getMediaFileName($url);

                if (!$file_name) continue;

                array_push($curl_urls, $url);
                array_push($media_files, $file_name);
            }
        } else {
            $url = $post->display_url;
            $file_name = getMediaFileName($url);

            if (!$file_name) continue;

            array_push($curl_urls, $url);
            array_push($media_files, $file_name);
        };

        $media_thumbnail_files = [];

        foreach ($post->thumbnail_resources as $item) {
            if ($item->config_width !== 240 && $item->config_width !== 320) continue;

            $url = $item->src;
            $file_name = getMediaFileName($url);

            if (!$file_name) continue;

            array_push($curl_urls, $url);
            array_push($media_thumbnail_files, $file_name);
        };

        $post_media_dir_uri = $posts_media_dir_uri . "/" . $post->shortcode;

        if (!is_dir($post_media_dir_uri)) {
            mkdir($post_media_dir_uri, 0777, true);
        }

        fetchStorePostMedia($curl_urls, $post_media_dir_uri);

        array_push($processed_posts, [
            "shortcode" => $post->shortcode,
            "date" => $post->taken_at_timestamp,
            "caption" => $caption_text,
            "media" => $media_files,
            "media_thumbnails" => $media_thumbnail_files,
        ]);
    }

    return $processed_posts;
}

function cleanPostsMedia(array $processed_posts, string $media_dir_uri)
{
    $post_data_dir_names = array_filter(scandir($media_dir_uri), function ($dir_name) {
        return !str_starts_with($dir_name, ".");
    });
    $dir_names_to_remove = array_diff($post_data_dir_names, array_map(function ($post) {
        return $post["shortcode"];
    }, $processed_posts));
    foreach ($dir_names_to_remove as $dir_name) {
        rrmdir($media_dir_uri . "/" . $dir_name);
    }
}

function requestHandler(string $instagram_username, string $data_dir_uri)
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "GET") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "GET"]]);
        }

        $post_data_cache = file_exists($data_dir_uri . "/posts.json")
            ? json_decode(file_get_contents($data_dir_uri . "/posts.json"))
            : null;

        $data_revalidation_time = (24 * 60 * 60 * 1000);
        $current_time = (int) floor(microtime(true) * 1000);

        if (
            !is_null($post_data_cache) &&
            // Don't allow data fetch too often - I want to minimize the risk of an IP ban.
            $current_time < $post_data_cache->fetch_time + $data_revalidation_time
        ) {
            // echo "Stored post data fresh for " . ($post_data_cache->fetch_time + $data_revalidation_time - $current_time) / 1000 / 60 . " more minutes.";
            returnHttpResponse(HttpStatus::NO_CONTENT);
        }

        $fetch_time = (int) floor(microtime(true) * 1000);
        $fetched_posts_data = fetchPostsData($instagram_username);

        if ($fetched_posts_data === false) {
            returnHttpResponse(HttpStatus::BAD_GATEWAY);
        }

        $media_dir_uri = $data_dir_uri . "/media";

        if (!is_dir($media_dir_uri)) {
            mkdir($media_dir_uri, 0777, true);
        }

        $processed_posts = processPostsData($fetched_posts_data, $media_dir_uri);
        $json_write_result = file_put_contents($data_dir_uri . "/posts.json", json_encode([
            "fetch_time" => $fetch_time,
            "revalidation_time" => $data_revalidation_time,
            "posts" => $processed_posts,
        ]));
        if ($json_write_result === false) error_log("Post data file write failed.");
        cleanPostsMedia($processed_posts, $media_dir_uri);

        returnHttpResponse(HttpStatus::NO_CONTENT);
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler($INSTAGRAM_USERNAME, ROOT_DIR . "/public/instagram");
