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
        $array_length = count($THINGS_I_LIKE);
        $i = 0;

        foreach ($THINGS_I_LIKE as $item) {
            echo $item;

            if ($i < $array_length - 2) {
                echo ", ";
            } else if ($i === $array_length - 2) {
                echo " & ";
            }

            $i++;
        }
        ?>
    </div>
</div>
