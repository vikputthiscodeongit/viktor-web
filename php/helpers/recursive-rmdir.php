<?php
function rrmdir(string $dir_path)
{
    if (!file_exists($dir_path)) return;

    $dir_handle = opendir($dir_path);
    while (($file_name = readdir($dir_handle)) !== false) {
        if ($file_name === "." || $file_name === "..") continue;

        $file_path = $dir_path . "/" . $file_name;
        is_dir($file_path) ? rrmdir($file_path) : unlink($file_path);
    }
    closedir($dir_handle);

    rmdir($dir_path);
}
