<?php
// TODO: Set this variable to false after disabling JavaScript in a session where it was previously enabled.
if (!isset($_SESSION["js_enabled"])) {
    $_SESSION["js_enabled"] = false;
}
