<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/php/helpers/return-http-response.php";
require_once ROOT_DIR . "/php/controllers/simple-maths-captcha-generator.php";
require_once ROOT_DIR . "/content/contact-form-content.php";

function requestHandler()
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "POST"]]);
        }

        $request_body = json_decode(file_get_contents('php://input'));

        if (!isset($request_body->base_id)) {
            returnHttpResponse(HttpStatus::UNPROCESSABLE_CONTENT, [
                "message" => "CAPTCHA base ID must be provided."
            ]);
        }

        returnHttpResponse(
            HttpStatus::OK,
            ["problem_data" => makeSimpleMathsCaptchaProblem($request_body->base_id, 15000)]
        );
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler();
