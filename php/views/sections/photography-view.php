<?php require ROOT_DIR . "/content/sections/photography-content.php"; ?>

<section class="site-section" id="photography">
    <div class="container">
        <h1 class="visually-hidden"><?php echo $PHOTOGRAPHY_SECTION_TITLE; ?></h1>

        <?php require ROOT_DIR . "/php/views/photo-grid-view.php"; ?>
    </div>

    <?php require ROOT_DIR . "/php/views/photo-dialog-view.php"; ?>
</section>
