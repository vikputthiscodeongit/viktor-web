<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/session.php";
require_once ROOT_DIR . "/components/simple-maths-captcha/simple-maths-captcha-global.php";

function makeSimpleMathsCaptchaProblem($base_id)
{
    $invalid_after_time = (int) floor(microtime(true) * 1000) + SIMPLE_MATHS_CAPTCHA_PROBLEM_INVALID_AFTER_TIME_MS;
    $problem_data = [rand(1, 9), rand(1, 9), $invalid_after_time];

    $_SESSION[$base_id] = $problem_data;

    return $problem_data;
}
