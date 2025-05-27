<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/session.php";

function isSimpleMathsCaptchaFormControl($form_control_id)
{
    return strpos($form_control_id, "simple-maths-captcha") !== false;
}

function getSimpleMathsCaptchaId($form_control_id)
{
    $default_id = "simple-maths-captcha";
    $default_id_start_pos = strpos($form_control_id, $default_id);

    if ($default_id_start_pos === false) {
        return null;
    }

    return substr($form_control_id, 0, $default_id_start_pos + strlen($default_id));
}

function getSimpleMathsCaptchaInvalidControlId($simple_maths_captcha_id, $validation_state)
{
    if ($validation_state === "invalid") {
        return $simple_maths_captcha_id . "-answer";
    }

    return $simple_maths_captcha_id . "-activator";
}

function isSimpleMathsCaptchaAnswerValid($simple_maths_captcha_id, $digit_1, $digit_2, $answer)
{
    // Contains the problem digits and a unix timestamp.
    $stored_problem_data = $_SESSION[$simple_maths_captcha_id];

    if (
        !is_int($digit_1) || !is_int($digit_2) || !is_int($answer) ||
        is_null($stored_problem_data) || count($stored_problem_data) !== 3
    ) {
        return false;
    }

    $answer_valid =
        // Digit 1 returned by user matches digit 1 created by generator.
        $digit_1 === $stored_problem_data[0] &&
        // Digit 2 returned by user matches digit 2 created by generator.
        $digit_2 === $stored_problem_data[1] &&
        // Answer to the problem is correct.
        $answer === $stored_problem_data[0] + $stored_problem_data[1] &&
        // Answer was submitted within the allowed time.
        floor(microtime(true) * 1000) < (($stored_problem_data[2]) + 1500);

    return $answer_valid;
}

function getSimpleMathsCaptchaValidationState($simple_maths_captcha_id, $form_data)
{
    $has_all_captcha_data =
        array_key_exists($simple_maths_captcha_id . "-digit-1", $form_data) &&
        array_key_exists($simple_maths_captcha_id . "-digit-2", $form_data) &&
        array_key_exists($simple_maths_captcha_id . "-answer", $form_data);

    if (!$has_all_captcha_data) {
        return "inactive";
    }

    return isSimpleMathsCaptchaAnswerValid(
        $simple_maths_captcha_id,
        (int) $form_data[$simple_maths_captcha_id . "-digit-1"],
        (int) $form_data[$simple_maths_captcha_id . "-digit-2"],
        (int) $form_data[$simple_maths_captcha_id . "-answer"],
    ) ? "valid" : "invalid";
}
