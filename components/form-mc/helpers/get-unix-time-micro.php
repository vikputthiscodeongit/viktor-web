<?php
function getUnixTimeMicro() {
    return (int) floor(microtime(true) * 1000);
}
