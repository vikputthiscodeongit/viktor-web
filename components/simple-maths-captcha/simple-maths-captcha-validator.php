<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/session.php";
require_once ROOT_DIR . "/components/simple-maths-captcha/simple-maths-captcha-global.php";

function isSimpleMathsCaptchaFormControl($form_control_id)
{
    return strpos($form_control_id, SIMPLE_MATHS_CATPCHA_BASE_ID) !== false;
}

function getSimpleMathsCaptchaActivatorButtonElId()
{
    return SIMPLE_MATHS_CATPCHA_BASE_ID . "-activator";
}

function getSimpleMathsCaptchaAnswerInputElId()
{
    return SIMPLE_MATHS_CATPCHA_BASE_ID . "-answer";
}

function isSimpleMathsCaptchaAnswerValid($digit_1, $digit_2, $answer)
{
    // Contains the problem digits and a unix timestamp.
    $stored_problem_data = $_SESSION[SIMPLE_MATHS_CATPCHA_BASE_ID];

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
        floor(microtime(true) * 1000) < (($stored_problem_data[2]) + SIMPLE_MATHS_CAPTCHA_PROBLEM_VALIDATION_SLACK_TIME);

    return $answer_valid;
}

function getSimpleMathsCaptchaValidationState($form_data)
{
    $state = "inactive";

    if (
        array_key_exists(SIMPLE_MATHS_CATPCHA_BASE_ID . "-digit-1", $form_data) &&
        array_key_exists(SIMPLE_MATHS_CATPCHA_BASE_ID . "-digit-2", $form_data) &&
        array_key_exists(SIMPLE_MATHS_CATPCHA_BASE_ID . "-answer", $form_data)
    ) {
        $state = isSimpleMathsCaptchaAnswerValid(
            (int) $form_data[SIMPLE_MATHS_CATPCHA_BASE_ID . "-digit-1"],
            (int) $form_data[SIMPLE_MATHS_CATPCHA_BASE_ID . "-digit-2"],
            (int) $form_data[SIMPLE_MATHS_CATPCHA_BASE_ID . "-answer"],
        ) ? "valid" : "invalid";
    }

    return $state;
}
