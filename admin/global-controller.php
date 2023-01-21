<?php
if (!session_id()) {
    session_start();
}

include "global-vars.php";

$response_code = 405;

// Set the $_SESSION["js_enabled"] variable after determining as accurately as possible
// if the request is coming from a human using a web browser that has JavaScript enabled.
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $response_code = 403;

    // By default pretty much all browsers sends a user agent alongside each HTTP request.
    if (!empty($_SERVER["HTTP_USER_AGENT"])) {
        // Check if the user agent string contains any of the major render engines.
        // By doing this we filter search engine bots, but also for example requests originating from
        // tools like Postman which allow you to send POST requests without a web browser.
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
