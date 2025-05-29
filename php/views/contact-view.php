<?php require_once ROOT_DIR . "/content/contact-content.php"; ?>

<section class="site-section" id="contact">
    <div class="container">
        <h1 class="site-section-title"><?php echo $CONTACT_SECTION_TITLE; ?></h1>

        <div class="section-content">
            <h2 class="section-title"><?php echo $CONTACT_SECTION_SOCIAL_ICONS_TITLE; ?></h2>

            <?php require ROOT_DIR . "/php/views/social-icons-view.php"; ?>
        </div>

        <div class="section-content">
            <h2 class="section-title"><?php echo $CONTACT_SECTION_FORM_TITLE; ?></h2>

            <?php include ROOT_DIR . "/php/views/contact-form-view.php"; ?>
        </div>
    </div>
</section>
