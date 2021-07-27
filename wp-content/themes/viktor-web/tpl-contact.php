<?php
    /* Template name: Contact */

    // Enqueue Contact Form 7 assets
    if (function_exists("wpcf7_enqueue_scripts")) {
        wpcf7_enqueue_scripts();
    }

    if (function_exists("wpcf7_enqueue_styles")) {
        wpcf7_enqueue_styles();
    }

    get_header();
?>

<section class="site-section">
    <div class="container">
        <?php
            $title = get_the_title();
            if (!empty($title)) {
                ?>
                <div class="title">
                    <h1>
                        <?php echo $title; ?>
                    </h1>
                </div>
                <?php
            }

            if (!empty(get_the_content())) {
                ?>
                <div class="text">
                    <?php the_content(); ?>
                </div>
                <?php
            }

            echo do_shortcode('[contact-form-7 id="162" title="Contact form 1" html_class="form form--contact"]');
        ?>
    </div>
</section>

<?php get_footer(); ?>
