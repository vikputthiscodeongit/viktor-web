<?php
function returnStatus($status, array|false $values = false) {
    http_response_code($status instanceof \UnitEnum ? $status->value : $status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($values);

    exit();
}
