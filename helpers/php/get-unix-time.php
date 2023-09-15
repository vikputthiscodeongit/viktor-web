<?php
function getUnixTime() {
    return (int) floor(microtime(true) * 1000);
}
