<?php
require_once ROOT_DIR . "/php/helpers/render-html-el.php";
require ROOT_DIR . "/content/about-me-content.php";
?>

<div class="my-details">
    <div class="viktor-name">
        <h1>
            <?php
            foreach ($MY_NAMES as $NAME) {
                echo "<span>" . $NAME . "</span>";
            }
            ?>
        </h1>
    </div>

    <div class="viktor-properties-typeit" aria-hidden="true">
        <span></span>
    </div>

    <div class="visually-hidden">
        <?php
        foreach ($MY_PROPERTIES_ITEMS as $PROPERTY) {
            echo "<span>" . $PROPERTY . "</span>";
        }
        ?>
    </div>
</div>
