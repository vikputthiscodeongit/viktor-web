<?php
include_once ROOT_DIR . "/helpers/php/render-html-el.php";
include ROOT_DIR . "/content/sections/home/about-me-content.php";
?>

<div class="viktor-info">
    <div class="viktor-name">
        <h1>
            <?php
            foreach ($MY_NAMES as $NAME) {
                echo "<span>" . $NAME . "</span>";
            }
            ?>
        </h1>
    </div>

    <div class="viktor-about viktor-about--typeit" aria-hidden="true">
        <span></span>
    </div>

    <div class="viktor-about viktor-about--static visually-hidden">
        <?php
        foreach ($MY_PROPERTIES_ITEMS as $PROPERTY) {
            echo "<span>" . $PROPERTY . "</span>";
        }
        ?>
    </div>
</div>
