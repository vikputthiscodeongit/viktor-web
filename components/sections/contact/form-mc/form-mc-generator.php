<?php
include __DIR__ . "/../../../../global.php";
include ROOT_DIR . "/session.php";
include ROOT_DIR . "/helpers/php/return-http-response.php";
include ROOT_DIR . "/components/sections/contact/form-mc/helpers/get-unix-time-micro.php";

// TODO: These should be user definable.
define("FORM_MC_REFRESH_TIME_MS", DEBUG ? 5000 : 15000);
define("FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS", FORM_MC_REFRESH_TIME_MS / 2);
define("FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS", DEBUG ? 2500 : 5000);
define(
    "FORM_MC_MIN_GEN_TIME_DELAY_MS",
    FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS >= FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS
        ? FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS
        : FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS
);

function makeProblem($reference_time)
{
    $invalid_after = $reference_time + FORM_MC_REFRESH_TIME_MS;
    $problem = [rand(1, 9), rand(1, 9), $invalid_after];

    $_SESSION["form_mc_cf"] = $problem;

    return $problem;
}

function getProblem()
{
    $unix_time = getUnixTimeMicro();
    $problem = makeProblem($unix_time);

    returnHttpResponse(StatusCode::OK, $problem);
}

getProblem();
