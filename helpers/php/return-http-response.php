<?php
enum StatusCode: int
{
    case OK = 200;
    case NO_CONTENT = 204;
    case METHOD_NOT_ALLOWED = 405;
    case UNPROCESSABLE_CONTENT = 422;
    case INTERNAL_SERVER_ERROR = 500;
    case BAD_GATEWAY = 502;
}

function returnHttpResponse(
    StatusCode $status,
    mixed $data = [],
    array $headers = []
) {
    http_response_code($status->value);

    $header_content_type = null;

    if (!empty($headers)) {
        foreach ($headers as $header => $value) {
            if ($header === "Content-Type") {
                $header_content_type = $value;

                continue;
            }

            header($header);
        }
    }

    if (!empty($data)) {
        if ($header_content_type === null) {
            $header_content_type = "application/json; charset=utf-8";
        }

        header("Content-Type:" . $header_content_type);

        echo str_contains($header_content_type, "application/json")
            ? json_encode($data)
            : $data;
    }

    exit();
}
