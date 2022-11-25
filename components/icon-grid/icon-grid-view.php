<?php include "./icon-grid-data.php"; ?>

<ul class="icon-grid" aria-label="<?php echo $ICON_GRID_LABEL; ?>">
    <?php
        foreach($ICON_GRID_ITEMS as $ITEM) {
            ?>
            <li class="icon <?php if (isset($ITEM['item_class'])) echo $ITEM['item_class']; ?>">
                <a href="<?php echo $ITEM['link_href']; ?>" target="_blank" rel="noopener">
                    <img class="icon" src="<?php echo $ITEM['icon_src']; ?>" alt="<?php echo $ITEM['title']; ?>">
                </a>
            </li>
            <?php
        }
    ?>
</ul>
