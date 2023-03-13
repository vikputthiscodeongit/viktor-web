<?php
function returnStatus(FormSubmitStatusses|int $status, array|false $values = false) {
    http_response_code($status instanceof \FormSubmitStatusses ? $status->value : $status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($values);

    exit();
}
