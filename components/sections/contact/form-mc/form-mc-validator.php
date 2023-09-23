<?php
include __DIR__ . "/../../../../helpers/php/get-unix-time-micro.php";

define("VALIDATION_SLACK_TIME_MS", 1500);

function isValidProblem($problem) {
    // Both the user input $problem and $_SESSION should contain the problem digits
    // and the unix time after which the problem is invalidated.
    // The user input should of course also contain the answer to the problem.
    if (
        empty($problem) || count($problem) !== 4 ||
        empty($_SESSION["cf_mc_prlm"]) || count($_SESSION["cf_mc_prlm"]) !== 3
    ) {
        return false;
    }

    $unix_time = getUnixTimeMicro();
    // Validate that each individual digit matches, that the user's answer is correct
    // and that the problem was solved within the set time.
    $answer_valid =
        $problem[1] === $_SESSION["cf_mc_prlm"][0] &&
        $problem[2] === $_SESSION["cf_mc_prlm"][1] &&
        $problem[0] === $_SESSION["cf_mc_prlm"][0] + $_SESSION["cf_mc_prlm"][1] &&
        $unix_time < (($_SESSION["cf_mc_prlm"][2]) + VALIDATION_SLACK_TIME_MS);

    return $answer_valid;
}
