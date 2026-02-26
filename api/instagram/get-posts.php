<?php
// This relies entirely on some internal Instagram App API ID being whitelisted for the `web_profile_info`
// JSON API. It will definitely break some day - let's hope that day is in the very distant future.

require __DIR__ . "/../../global.php";
require ROOT_DIR . "/_folder/values.php";
require ROOT_DIR . "/php/helpers/curl-multi-transfer.php";
require ROOT_DIR . "/php/helpers/empty-dir.php";
require ROOT_DIR . "/php/helpers/file-force-contents.php";
require ROOT_DIR . "/php/helpers/recursive-rmdir.php";
require ROOT_DIR . "/php/helpers/return-http-response.php";
require ROOT_DIR . "/content/global-content.php";

function getFileNamePartsFromUrl(string $url)
{
    preg_match("/([^\/]+)(\.[A-Za-z0-9]+)\?+/", $url, $matches);
    return count($matches) > 0 ? [
        "name" => $matches[1],
        "extension" => $matches[2]
    ] : null;
}

function getMediaSizeFromUrl(string $url)
{
    preg_match("/_s([0-9]{3,4}x[0-9]{3,4})_/", $url, $matches);
    return count($matches) > 0 ? $matches[1] : "0x0";
}

function checkFetchStoreMedia($urls, $media_data, string $post_dir_uri, bool $thumbnails = false)
{
    $target_dir = $thumbnails ? $post_dir_uri . "/thumbnails" : $post_dir_uri;

    foreach ($media_data as $item) {
        if (file_exists($target_dir . "/" . $item["file_name"])) continue;

        is_dir($target_dir)
            ? emptyDir($target_dir)
            : mkdir($target_dir, 0777, true);
        curl_multi_transfer(
            $urls,
            function ($url, $body, $info) use ($target_dir, $thumbnails) {
                if ($info === false || $info["http_code"] !== 200) {
                    error_log("Fetch failed: HTTP " . $info["http_code"] . " - " . $url);
                    return;
                }

                $file_name_parts = getFileNamePartsFromUrl($url);

                if (!$file_name_parts) return;

                $file_name = $thumbnails
                    ? $file_name_parts["name"] . "-" . getMediaSizeFromUrl($url) . $file_name_parts["extension"]
                    : $file_name_parts["name"] . $file_name_parts["extension"];
                file_put_contents($target_dir . "/" . $file_name, $body);
            },
            2,
        );
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

        // Don't refetch data if it's still fresh.
        $data_revalidation_time = (12 * 60 * 60 * 1000);
        $current_time = (int) floor(microtime(true) * 1000);

        if (
            !is_null($post_data_cache) &&
            $post_data_cache->prev_fetch_status_code === 200 &&
            $current_time < $post_data_cache->prev_fetch_time + $data_revalidation_time
        ) {
            // echo "Stored post data fresh for " . ($post_data_cache->prev_fetch_time + $data_revalidation_time - $current_time) / 1000 / 60 . " more minutes.";
            returnHttpResponse(HttpStatus::NO_CONTENT);
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://www.instagram.com/api/v1/users/web_profile_info/?username=" . $instagram_username,
            CURLOPT_HTTPHEADER => ["X-IG-App-ID: " . IG_APP_ID],
            CURLOPT_HEADER => false,
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $ch_result = curl_exec($ch);

        $prev_fetch_status_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $prev_fetch_time = (int) floor(microtime(true) * 1000);

        if ($prev_fetch_status_code !== 200) {
            returnHttpResponse(HttpStatus::BAD_GATEWAY);
        }

        $media_dir_uri = $data_dir_uri . "/media";

        if (!is_dir($media_dir_uri)) {
            mkdir($media_dir_uri, 0777, true);
        }

        $fetched_data = json_decode($ch_result);
        $fetched_data_posts = isset($fetched_data->data->user->edge_owner_to_timeline_media->edges)
            ? $fetched_data->data->user->edge_owner_to_timeline_media->edges
            : [];
        $processed_posts = [];

        foreach ($fetched_data_posts as $fetched_data_post) {
            $post = $fetched_data_post->node;

            // Caption
            $fetched_data_post_caption = $post->edge_media_to_caption->edges;
            $processed_caption = count($fetched_data_post_caption) > 0
                ? $fetched_data_post_caption[0]->node->text
                : null;

            // Media
            $post_media_dir_uri = $media_dir_uri . "/" . $post->shortcode;
            $fetched_data_post_media = isset($post->edge_sidecar_to_children->edges)
                ? $post->edge_sidecar_to_children->edges
                : null;
            $processed_media = [];
            $media_urls = [];

            if (!is_null($fetched_data_post_media)) {
                foreach ($fetched_data_post_media as $item) {
                    $file_name_parts = getFileNamePartsFromUrl($item->node->display_url);
                    array_push($processed_media, [
                        "file_name" => $file_name_parts["name"] . $file_name_parts["extension"],
                        "width" => $item->node->dimensions->width,
                        "height" => $item->node->dimensions->height,
                    ]);
                    array_push($media_urls, $item->node->display_url);
                }
            } else {
                $url = $post->display_url;
                $file_name_parts = getFileNamePartsFromUrl($url);
                $processed_media = [[
                    "file_name" => $file_name_parts["name"] . $file_name_parts["extension"],
                    "width" => $post->dimensions->width,
                    "height" => $post->dimensions->height,
                ]];
                $media_urls = [$url];
            };

            checkFetchStoreMedia($media_urls, $processed_media, $post_media_dir_uri);

            // Media - thumbnails
            $filtered_thumbnail_resources = array_filter($post->thumbnail_resources, function ($item) {
                return $item->config_width === 240 || $item->config_width === 320;
            });
            $processed_media_thumbnails = [];
            $media_thumbnail_urls = [];

            foreach ($filtered_thumbnail_resources as $item) {
                $file_name_parts = getFileNamePartsFromUrl($item->src);
                array_push($processed_media_thumbnails, [
                    "file_name" => $file_name_parts["name"] . "-" . getMediaSizeFromUrl($item->src) . $file_name_parts["extension"],
                    "width" => $item->config_width,
                    "height" => $item->config_height,
                ]);
                array_push($media_thumbnail_urls, $item->src);
            };

            checkFetchStoreMedia($media_thumbnail_urls, $processed_media_thumbnails, $post_media_dir_uri, true);

            array_push($processed_posts, [
                "shortcode" => $post->shortcode,
                "date" => $post->taken_at_timestamp,
                "caption" => $processed_caption,
                "media" => $processed_media,
                "media_thumbnails" => $processed_media_thumbnails,
            ]);
        }

        $result = file_force_contents($data_dir_uri . "/posts.json", json_encode([
            "prev_fetch_status_code" => $prev_fetch_status_code,
            "prev_fetch_time" => $prev_fetch_time,
            "revalidation_time" => $data_revalidation_time,
            "posts" => $processed_posts,
        ]));

        if ($result === false) {
            throw new Exception("Post data file write failed.");
        }

        // Remove media for non-existent posts
        $post_data_dir_names = array_filter(scandir($media_dir_uri), function ($dir_name) {
            return !str_starts_with($dir_name, ".");
        });
        $dir_names_to_remove = array_diff($post_data_dir_names, array_keys($processed_posts));
        foreach ($dir_names_to_remove as $dir_name) {
            rrmdir($media_dir_uri . "/" . $dir_name);
        }

        returnHttpResponse(HttpStatus::NO_CONTENT);
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler($INSTAGRAM_USERNAME, ROOT_DIR . "/public/instagram");
