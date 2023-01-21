<?php
if (!session_id()) {
    session_start();
}

include "global-vars.php";

$response_code = 405;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $response_code = 403;

    // TODO: Add UA string browser engine check.
    if (!empty($_SERVER["HTTP_USER_AGENT"])) {
        $BROWSER_ENGINE_UA_REGEX = "/(AppleWebKit|Chrome|Edge|Gecko|Opera|Trident)+/";

        if (preg_match($BROWSER_ENGINE_UA_REGEX, $_SERVER["HTTP_USER_AGENT"]) === 1) {
            $_SESSION["js_enabled"] = true;

            // TODO: Check if $_SESSION is set when cookies are disabled. If so, this check can be skipped.
            if ($_SESSION["js_enabled"]) {
                $response_code = 204;
            }
        };
    }
}

header("Location: http://" . WEBSITE_DOMAIN, true, $response_code);

exit();
