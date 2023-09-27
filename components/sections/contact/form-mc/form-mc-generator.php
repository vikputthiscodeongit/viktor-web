<?php
include __DIR__ . "/../../../../global.php";
include __DIR__ . "/../../../../helpers/php/get-unix-time-micro.php";
include __DIR__ . "/../../../../helpers/php/return-http-response.php";

// TODO: These should be user definable.
define("FORM_MC_REFRESH_TIME_MS", DEBUG ? 5000: 15000);
define("FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS", FORM_MC_REFRESH_TIME_MS / 2);
define("FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS", DEBUG ? 2500 : 5000);
define("FORM_MC_MIN_GEN_TIME_DELAY_MS",
    FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS >= FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS
        ? FORM_MC_MIN_GEN_TIME_DELAY_PREFERRED_MS
        : FORM_MC_MIN_GEN_TIME_DELAY_CAP_MS
);

getProblem();

function makeProblem($reference_time) {
    $invalid_after = $reference_time + FORM_MC_REFRESH_TIME_MS;
    $problem = [rand(1, 9), rand(1, 9), $invalid_after];

    $_SESSION["cf_mc_prlm"] = $problem;

    return $problem;
}

function getProblem() {
    $unix_time = getUnixTimeMicro();
    $problem = makeProblem($unix_time);

    returnHttpResponse(StatusCode::SUCCESS, ...["data" => $problem]);
}
