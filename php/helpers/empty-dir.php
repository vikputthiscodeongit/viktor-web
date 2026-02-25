<?php
function emptyDir($dir)
{
    $files = glob($dir . "/*");
    foreach ($files as $file) {
        if (!is_file($file)) continue;

        unlink($file);
    }
}
