<?php get_header(); ?>

<section class="site-section" id="home">
    <div class="container">
        <div class="home-title">
            <h1>
                <span>Viktor </span>
                <span>Chin</span>
            </h1>
        </div>

        <div class="home-about-wrapper">
            <div class="home-about home-about--typeit" aria-hidden="true"></div>

            <div class="home-about home-about--static visually-hidden">
                <div>
                    <span>Homo sapiens</span>
                </div>

                <div>
                    <span>Webdeveloper</span>
                </div>

                <div>
                    <span>Autoliefhebber</span>
                </div>

                <div>
                    <span>Hobbyfotograaf</span>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="site-section" id="photography">
    <div class="container">

    </div>
</section>

<section class="site-section" id="contact">
    <div class="container">
        <?php echo do_shortcode('[contact-form-7 id="5" title="Contact form 1" html_class="form form--contact"]'); ?>
    </div>
</section>

<?php get_footer(); ?>
