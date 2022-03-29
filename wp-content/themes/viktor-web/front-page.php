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
                        <span>Photographer</span>
                    </div>

                    <div>
                        <span>Web developer</span>
                    </div>

                    <div>
                        <span>Motoring enthusiast</span>
                    </div>

                    <div>
                        <span>Human</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="home-nav">
            <ul class="home-nav__items">
                <li class="home-nav__item">
                    <a class="home-nav__link" href="#contact" target="_self">Contact</a>
                </li>
            </ul>
        </div>

        <div class="blob blob--left">
            <img src="<?php echo THEME_DIR_URI; ?>/dist/images/static/blobs/blob-1.svg" alt="">
        </div>

        <div class="blob blob--right">
            <img src="<?php echo THEME_DIR_URI; ?>/dist/images/static/blobs/blob-2.svg" alt="">
        </div>
    </div>
</section>

<section class="site-section" id="contact">
    <div class="container">
        <div class="section-title">
            <h1>Contact</h1>
        </div>

        <div class="section-content">
            <p>You can connect with me on one of the following services.</p>

            <div>
                <a href="https://www.linkedin.com/in/viktor-cks/" target="_blank" rel="noopener">
                    <img class="icon" src="<?php echo THEME_DIR_URI; ?>/dist/images/static/icons/icon-linkedin-color-64x64.png" alt="LinkedIn">
                </a>
            </div>
        </div>

        <div class="section-content">
            <p>To get in touch directly, fill in the form below.</p>

            <?php echo do_shortcode('[contact-form-7 id="5" title="Contact form 1" html_class="form form--contact"]'); ?>
        </div>
    </div>
</section>

<?php get_footer(); ?>
