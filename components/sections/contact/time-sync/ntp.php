<?php
include __DIR__ . "/../../helpers/php/return-http-response.php";

$options = [
    "data" => round($_SERVER["REQUEST_TIME_FLOAT"] * 1000),
    "content_type" => "text/plain"
];
returnHttpResponse(StatusCode::SUCCESS, ...$options);
