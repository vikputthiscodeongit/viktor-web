<?php
// TODO: For improved clarity, include session?
include ROOT_DIR . "/components/sections/contact/form-mc/helpers/get-unix-time-micro.php";

define("VALIDATION_SLACK_TIME_MS", 1500);

function isValidProblem($answer, $digit_1, $digit_2)
{
    if (
        $answer === "" || $digit_1 === "" || $digit_2 === "" ||
        // $_SESSION contains the problem digits and the unix time after which the problem is invalidated.
        empty($_SESSION["form_mc_cf"]) || count($_SESSION["form_mc_cf"]) !== 3
    ) {
        return false;
    }

    $unix_time = getUnixTimeMicro();
    $answer_valid =
        // Digit 1 returned by user matches digit 1 created by generator.
        (int) $digit_1 === $_SESSION["form_mc_cf"][0] &&
        // Digit 2 returned by user matches digit 2 created by generator.
        (int) $digit_2 === $_SESSION["form_mc_cf"][1] &&
        // Answer to the problem is correct (checked against digits created by generator).
        (int) $answer === $_SESSION["form_mc_cf"][0] + $_SESSION["form_mc_cf"][1] &&
        // Answer was provided within the allowed time.
        $unix_time < (($_SESSION["form_mc_cf"][2]) + VALIDATION_SLACK_TIME_MS);

    return $answer_valid;
}
