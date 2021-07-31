<?php get_header(); ?>

<section class="site-section" id="home">
    <div class="container">
        <div class="viktor-info">
            <div class="viktor-name">
                <h1>
                    <span>Viktor </span>
                    <span>Chin</span>
                </h1>
            </div>

            <div class="viktor-about-wrapper">
                <div class="viktor-about viktor-about--typeit" aria-hidden="true">
                    <span></span>
                </div>

                <div class="viktor-about viktor-about--static visually-hidden">
                    <div>
                        <span>Homo sapiens</span>
                    </div>

                    <div>
                        <span>Autoliefhebber</span>
                    </div>

                    <div>
                        <span>Hobbyfotograaf</span>
                    </div>

                    <div>
                        <span>Webdeveloper</span>
                    </div>

                    <div>
                        <span>Part-time superman</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="home-nav">
            <ul class="home-nav__items">
                <li class="home-nav__item">
                    <a class="home-nav__link" href="#photography" target="_self">Photography</a>
                </li>

                <li class="home-nav__item">
                    <a class="home-nav__link" href="#contact" target="_self">Contact</a>
                </li>
            </ul>
        </div>

        <div class="blob blob--left">
            <img src="<?php echo THEME_DIR_URI; ?>/dist/images/static/blobs/blob-1.svg')" alt="">
        </div>

        <div class="blob blob--right">
            <img src="<?php echo THEME_DIR_URI; ?>/dist/images/static/blobs/blob-2.svg')" alt="">
        </div>
    </div>
</section>

<section class="site-section" id="photography">
    <div class="container">

    </div>
</section>

<section class="site-section" id="contact">
    <div class="container">
        <div class="section-title">
            <h1>Contact</h1>
        </div>

        <?php echo do_shortcode('[contact-form-7 id="5" title="Contact form 1" html_class="form form--contact"]'); ?>
    </div>
</section>

<?php get_footer(); ?>
