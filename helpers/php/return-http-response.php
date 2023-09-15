<?php
enum StatusCode: int {
    case SUCCESS = 200;
    case REQUEST_METHOD_INVALID = 405;
    case INPUT_INVALID = 422;
    case TOO_MANY_REQUESTS = 429;
    case UNKNOWN_ERROR = 500;
    case MAIL_FAILED = 502;
}

function returnHttpResponse(
    StatusCode $status,
    array|string $headers = [],
    mixed $data = [],
    string $content_type = "application/json"
) {
    http_response_code($status->value);

    if ($headers) {
        $headers = is_string($headers) ? [$headers] : $headers;

        foreach($headers as $header) {
            header($header);
        }
    }

    if ($data) {
        header("Content-Type: " . $content_type . "; charset=utf-8");
        echo str_contains($content_type, "application/json")
            ? json_encode($data)
            : $data;
    }

    exit();
}
