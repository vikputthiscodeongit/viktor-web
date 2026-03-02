<?php

/**
 * Parallel cURL transfer.
 *
 * @param array    $urls            URLs to operate on.
 * @param callable $callback        Callback to execute after every transfer. Called with 3 arguments: transfer URL, transfer response body & the transfer's `curl_getinfo()` result.
 * @param int      $max_connections Amount of simultaneously allowed connections.
 * @param array    $curl_options    cURL handle options.
 * @see https://stackoverflow.com/a/75480028 for source.
 */
function curl_multi_transfer($urls, $callback, $max_connections = 5, $curl_options = [])
{
    // Initialize cURL multi handle & its workers.
    $max_connections = min($max_connections, count($urls));
    $unemployed_workers = [];

    for ($i = 0; $i < $max_connections; ++$i) {
        $unemployed_worker = curl_init();

        if ($unemployed_worker === false) {
            throw new \RuntimeException("Failed to initialize unemployed worker " . $i . " .");
        }

        if (count($curl_options) > 0) {
            $result = curl_setopt_array($unemployed_worker, $curl_options);
        }

        $unemployed_workers[] = $unemployed_worker;
    }

    unset($i, $unemployed_worker);

    // Process workers.
    $multi_handle = curl_multi_init();
    $employed_workers_count = 0;

    $do_work = function () use (&$employed_workers_count, &$unemployed_workers, &$multi_handle, $callback): void {
        if ($employed_workers_count < 1) return;

        for (;;) {
            $still_running = 0;
            $result = curl_multi_exec($multi_handle, $still_running);

            if ($result !== CURLM_OK) {
                throw new \RuntimeException("curl_multi_exec error: " . curl_multi_strerror($result));
            }

            // Processed finished workers.
            if ($still_running < $employed_workers_count) break;

            // Wait for workers' transfers to finish.
            curl_multi_select($multi_handle, 1);
        }

        while (($info = curl_multi_info_read($multi_handle)) !== false) {
            // Checking against CURLMSG_DONE is all that's needed as no other messages are defined.
            // See https://curl.se/libcurl/c/curl_multi_info_read.html for more information.
            if ($info["msg"] !== CURLMSG_DONE) continue;

            // PHP docs say to use CURLE_OK here but we're using CURLM_OK instead.
            // 20251225: I'm not sure why though. See also
            // https://www.php.net/manual/en/function.curl-multi-info-read.php
            // https://curl.se/libcurl/c/curl_multi_info_read.html
            // https://curl.se/libcurl/c/libcurl-errors.html
            if ($info["result"] !== CURLM_OK) {
                throw new \RuntimeException("curl_multi worker error: " . curl_multi_strerror($info["result"]));
            }

            $handle = $info["handle"];
            $url = curl_getinfo($handle, CURLINFO_PRIVATE);
            $body = curl_multi_getcontent($handle);
            $curl_info = curl_getinfo($handle);
            $callback($url, $body, $curl_info);

            $employed_workers_count -= 1;
            curl_multi_remove_handle($multi_handle, $handle);
            $unemployed_workers[] = $handle;
        }
    };

    // Main loop
    $base_curl_options = [CURLOPT_RETURNTRANSFER => true];

    foreach ($urls as $url) {
        if (count($unemployed_workers) === 0) {
            $do_work();
        }

        $new_worker = array_pop($unemployed_workers);
        $base_curl_options[CURLOPT_URL] = $url;
        $base_curl_options[CURLOPT_PRIVATE] = $url;
        $result = curl_setopt_array($new_worker, $base_curl_options);

        if ($result === false) {
            throw new \RuntimeException("curl_setopt_array error: " . curl_error($new_worker));
        }

        $employed_workers_count += 1;

        $result = curl_multi_add_handle($multi_handle, $new_worker);

        if ($result === false) {
            throw new \RuntimeException("curl_multi_add_handle error: " . curl_error($new_worker));
        }
    }

    while ($employed_workers_count > 0) {
        $do_work();
    }

    curl_multi_close($multi_handle);
}
