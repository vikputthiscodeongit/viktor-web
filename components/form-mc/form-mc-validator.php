<?php
function isValidProblem($problem) {
    // Both the user input $problem and $_SESSION should contain the problem digits
    // and the unix time after which the problem is invalidated.
    // The user input should of course also contain the answer to the problem.
    if (
        empty($problem) || count($problem) !== 4 ||
        empty($_SESSION["cf_mc_problem"]) || count($_SESSION["cf_mc_problem"]) !== 3
    ) {
        return false;
    }

    // Validate that each individual digit matches, that the user's answer is correct
    // and that the problem was solved within the set time.
    $VALIDATION_SLACK_TIME_MS = 500;
    $answer_valid =
        $problem[1] === $_SESSION["cf_mc_problem"][0] &&
        $problem[2] === $_SESSION["cf_mc_problem"][1] &&
        $problem[0] === $_SESSION["cf_mc_problem"][0] + $_SESSION["cf_mc_problem"][1] &&
        floor(microtime(true) * 1000) < (($_SESSION["cf_mc_problem"][2]) + $VALIDATION_SLACK_TIME_MS);

    return $answer_valid;
}
