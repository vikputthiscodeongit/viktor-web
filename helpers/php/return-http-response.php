<?php
enum HttpStatus: int
{
    case OK = 200;
    case NO_CONTENT = 204;
    case METHOD_NOT_ALLOWED = 405;
    case UNPROCESSABLE_CONTENT = 422;
    case INTERNAL_SERVER_ERROR = 500;
    case BAD_GATEWAY = 502;
}

function returnHttpResponse(
    HttpStatus $status_code,
    mixed $data = null,
    array $headers = []
) {
    http_response_code($status_code->value);

    $is_json_data = false;

    if (!is_null($data) && !array_key_exists("Content-Type", $headers)) {
        array_push($headers, ["Content-Type" => "application/json"]);
    }

    foreach ($headers as $header) {
        if (key($header) === "Content-Type" && strpos(current($header), "/json") !== false) {
            $is_json_data = true;
        }

        header(key($header) . ":" . current($header));
    }

    if (!is_null($data)) {
        echo $is_json_data ? json_encode($data) : $data;
    }

    exit();
}
