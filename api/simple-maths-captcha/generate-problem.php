<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/php/helpers/return-http-response.php";
require_once ROOT_DIR . "/php/controllers/simple-maths-captcha-global.php";
require_once ROOT_DIR . "/php/controllers/simple-maths-captcha-generator.php";
require_once ROOT_DIR . "/content/form-content.php";

function requestHandler($simple_maths_captcha_base_id)
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "GET") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "GET"]]);
        }

        returnHttpResponse(
            HttpStatus::OK,
            ["problem_data" => makeSimpleMathsCaptchaProblem($simple_maths_captcha_base_id)]
        );
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler(SIMPLE_MATHS_CATPCHA_BASE_ID);
