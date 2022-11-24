<div class="viktor-info">
    <?php include __DIR__ . "/../../components/about-me/about-me-content.php"; ?>

    <div class="viktor-name">
        <h1>
            <span><?php echo $MY_NAME_FIRST; ?></span>
            <span><?php echo $MY_NAME_LAST_SHORT; ?></span>
        </h1>
    </div>

    <div class="viktor-about-wrapper">
        <div class="viktor-about viktor-about--typeit" aria-hidden="true">
            <span></span>
        </div>

        <div class="viktor-about viktor-about--static visually-hidden">
            <?php
                foreach($MY_PROPERTIES as $PROPERTY) {
                    echo "<span>" . $PROPERTY . "</span>\n";
                }
            ?>
		</div>
    </div>
</div>
