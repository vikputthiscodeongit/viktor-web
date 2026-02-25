<?php
// https://www.php.net/manual/en/function.file-put-contents.php#123657
function file_force_contents($fullPath, $contents, $flags = 0)
{
    $parts = explode("/", $fullPath);
    array_pop($parts);
    $dir = implode("/", $parts);

    if (!is_dir($dir))
        mkdir($dir, 0777, true);

    file_put_contents($fullPath, $contents, $flags);
}
