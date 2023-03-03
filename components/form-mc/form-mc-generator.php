<?php
include __DIR__ . "/../../admin/session.php";
include __DIR__ . "/../form/helpers.php";

getProblem();

function makeProblem() {
    $unix_time = floor(microtime(true) * 1000);
    $FORM_MC_REFRESH_TIME_MS = 15000;

    $invalid_after = $unix_time + $FORM_MC_REFRESH_TIME_MS;
    $problem = [rand(1, 9), rand(1, 9), $invalid_after];

    $_SESSION["cf_mc_problem"] = $problem;
    return $problem;
}

function getProblem() {
    $problem = makeProblem();

    return returnStatus(200, $problem);
}
