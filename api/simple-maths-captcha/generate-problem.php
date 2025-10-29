<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/php/helpers/return-http-response.php";
require ROOT_DIR . "/php/controllers/simple-maths-captcha/Generate.php";
require_once ROOT_DIR . "/content/contact-form-content.php";

use SimpleMathsCaptcha\Generate as CaptchaGenerator;

function requestHandler()
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "POST"]]);
        }

        $request_body = json_decode(file_get_contents('php://input'));
        $captcha_id = $request_body->id;

        if (!isset($captcha_id)) {
            returnHttpResponse(HttpStatus::UNPROCESSABLE_CONTENT, [
                "message" => "CAPTCHA ID must be provided."
            ]);
        }

        $captcha_generator = new CaptchaGenerator($captcha_id);
        $problem_data = $captcha_generator->generateProblem(15000);

        returnHttpResponse(
            HttpStatus::OK,
            $problem_data
        );
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler();
