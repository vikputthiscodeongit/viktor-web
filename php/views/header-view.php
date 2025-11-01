<!DOCTYPE html>
<html class="js-disabled" lang="en">

<head>
    <?php
    require ROOT_DIR . "/content/header-content.php";

    function get_versioned_asset_href($relative_file_path)
    {
        if (is_null($relative_file_path) || trim($relative_file_path) === "") {
            return $relative_file_path;
        }

        $file_mtime = date("Ymd_His", filemtime(ROOT_DIR . $relative_file_path));

        return $relative_file_path . "?v=" . $file_mtime;
    }
    ?>
    <meta charset="UTF-8">

    <!--
                                       ___                         ___           ___
             ___                      /|  |                       /\  \         /\  \
            /\  \        ___         |:|  |          ___         /::\  \       /::\  \
            \:\  \      /\__\        |:|  |         /\__\       /:/\:\  \     /:/\:\__\
             \:\  \    /:/__/      __|:|  |        /:/  /      /:/  \:\  \   /:/ /:/  /
         ___  \:\__\  /::\  \     /\ |:|__|____   /:/__/      /:/__/ \:\__\ /:/_/:/__/___
        /\  \ |:|  |  \/\:\  \__  \:\/:::::/__/  /::\  \      \:\  \ /:/  / \:\/:::::/  /
        \:\  \|:|  |   ~~\:\/\__\  \::/~~/~     /:/\:\  \      \:\  /:/  /   \::/~~/~~~~
         \:\__|:|__|      \::/  /   \:\~~\      \/__\:\  \      \:\/:/  /     \:\~~\
          \::::/__/       /:/  /     \:\__\          \:\__\      \::/  /       \:\__\
           ~~~~           \/__/       \/__/           \/__/       \/__/         \/__/

        -->

    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Site information -->
    <title><?php echo $SITE_TITLE; ?></title>
    <meta name="keywords" content="<?php echo $META_KEYWORDS; ?>">
    <meta name="description" content="<?php echo $META_DESCRIPTION; ?>">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Recursive:wght@300..1000&display=swap" rel="stylesheet">

    <!-- Styles -->
    <link rel="stylesheet" href="<?php echo get_versioned_asset_href('/dist/style.css'); ?>">

    <!-- Scripts -->
    <script src="<?php echo get_versioned_asset_href('/dist/index.js'); ?>" defer></script>

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/public/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/public/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/public/favicon/favicon-16x16.png">
    <link rel="manifest" href="/public/favicon/site.webmanifest">
    <link rel="mask-icon" href="/public/favicon/safari-pinned-tab.svg" color="#000000">
    <meta name="msapplication-TileColor" content="#000000">
    <meta name="theme-color" content="#000000">
</head>

<body>
    <main>
