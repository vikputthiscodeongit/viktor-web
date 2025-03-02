<?php
include __DIR__ . "/../../../../global.php";
include ROOT_DIR . "/helpers/php/return-http-response.php";

$options = [
    "status" => HttpStatus::OK,
    "data" => $_SERVER["REQUEST_TIME_FLOAT"],
    "headers" => [
        "Content-Type" => "text/plain; charset=utf-8"
    ]
];
returnHttpResponse(...$options);
