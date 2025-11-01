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

    <div class="viktor-properties">
        <p>
            <span id="viktor-properties-typeit" aria-hidden="true"></span>
            <span class="visually-hidden"><?php echo $THINGS_I_LIKE_HIDDEN; ?></span>
        </p>
    </div>
</div>
