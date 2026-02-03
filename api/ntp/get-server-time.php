<?php
require __DIR__ . "/../../global.php";
require ROOT_DIR . "/php/helpers/return-http-response.php";

function requestHandler()
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "GET") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "GET"]]);
        }

        returnHttpResponse(
            HttpStatus::OK,
            ["received_time_micro" => (int) str_replace(".", "", $_SERVER["REQUEST_TIME_FLOAT"])],
        );
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler();
