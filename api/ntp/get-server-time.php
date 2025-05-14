<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/helpers/php/return-http-response.php";

function requestHandler()
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "GET") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "GET"]]);
        }

        returnHttpResponse(
            HttpStatus::OK,
            ["request_time" => $_SERVER["REQUEST_TIME_FLOAT"]],
        );
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler();
