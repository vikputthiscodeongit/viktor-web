<?php
function rrmdir($src)
{
    if (!file_exists($src)) return;

    $dir = opendir($src);
    while (($file = readdir($dir)) !== false) {
        if ($file === "." || $file === "..") continue;

        $full = $src . "/" . $file;
        is_dir($full) ? rrmdir($full) : unlink($full);
    }
    closedir($dir);

    rmdir($src);
}
