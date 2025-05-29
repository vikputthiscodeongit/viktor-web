<!DOCTYPE html>

<html class="js-disabled" lang="en">

<head>
    <?php
    require ROOT_DIR . "/content/header-content.php";

    function does_file_exist($relative_file_path)
    {
        if (is_null($relative_file_path)) {
            return false;
        }

        return file_exists(ROOT_DIR . $relative_file_path);
    }

    function get_file_mtime($file_path)
    {
        return date("Ymd_His", filemtime($file_path));
    }

    function get_versioned_asset_href($relative_file_path)
    {
        if (!does_file_exist($relative_file_path)) {
            return $relative_file_path;
        }

        return $relative_file_path . "?v=" . get_file_mtime(ROOT_DIR . $relative_file_path);
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
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Recursive:wght@400;600&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Recursive:wght@400;600&display=swap">

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
