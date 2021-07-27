<?php
    /* Template name: About */

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

            if (has_post_thumbnail()) {
                ?>
                <div class="media">
                    <figure>
                        <?php echo get_the_post_thumbnail(); ?>
                    </figure>
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
        ?>
    </div>
</section>

<?php get_footer(); ?>
