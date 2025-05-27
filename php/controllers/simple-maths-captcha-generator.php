<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/session.php";

function makeSimpleMathsCaptchaProblem($base_id, $valid_for_time)
{
    $invalid_after_time = (int) floor(microtime(true) * 1000) + $valid_for_time;
    $problem_data = [rand(1, 9), rand(1, 9), $invalid_after_time];

    $simple_maths_captcha_id = "simple-maths-captcha";

    if ($base_id) {
        $simple_maths_captcha_id = $base_id . "-" . $simple_maths_captcha_id;
    }

    $_SESSION[$simple_maths_captcha_id] = $problem_data;

    return $problem_data;
}
