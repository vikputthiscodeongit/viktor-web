<?php get_header(); ?>

<section class="site-section" id="home">
    <div class="container">
        <div class="home-viktor">
            <div class="viktor-name">
                <h1>
                    <span>Viktor </span>
                    <span>Chin</span>
                </h1>
            </div>

            <div class="viktor-about-wrapper">
                <div class="viktor-about viktor-about--typeit" aria-hidden="true"></div>

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

        <div class="home-nav nav">
            <ul class="nav__items">
                <li class="nav__item">
                    <a class="nav__link" href="#photography" target="_self">Photography</a>
                </li>

                <li class="nav__item">
                    <a class="nav__link" href="#contact" target="_self">Contact</a>
                </li>
            </ul>
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
