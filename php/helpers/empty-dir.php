<?php
function emptyDir($directory)
{
    $files = glob($directory . "/*");
    foreach ($files as $file) {
        if (!is_file($file)) continue;

        unlink($file);
    }
}
