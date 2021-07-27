<?php
    /* Template name: Website settings */

    get_header();
?>

<?php
    $site_settings = get_field("website_settings");
    // var_dump($site_settings);
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
        ?>

        <?php
            $label = get_the_content();
        ?>
        <ul class="site-settings" <?php if (!empty($label)) { echo 'aria-label="' . $label . '"'; } ?>>
            <li class="site-settings__item">
                <label for="setting-dark-theme"><?php echo $site_settings["dark_theme"];?></label>
                <input type="checkbox" class="toggle" id="setting-dark-theme">
            </li>

            <li class="site-settings__item">
                <label for="setting-reduced-motion"><?php echo $site_settings["reduced_motion"];?></label>
                <input type="checkbox" class="toggle" id="setting-reduced-motion">
            </li>

            <li class="site-settings__item">
                <label for="setting-increased-contrast"><?php echo $site_settings["increased_contrast"];?></label>
                <input type="checkbox" class="toggle" id="setting-increased-contrast">
            </li>

            <li class="site-settings__item">
                <label for="setting-site-header-auto-hide"><?php echo $site_settings["site_header_auto_hide"];?></label>
                <input type="checkbox" class="toggle" id="setting-site-header-auto-hide">
            </li>

            <li class="site-settings__item">
                <label for="setting-dark-theme"><?php echo $site_settings["lang_select"];?></label>
                <?php do_action('wpml_add_language_selector'); ?>
            </li>
        </ul>

        <div>
            <?php
                $post_id = apply_filters("wpml_object_id", 100, "post");
                $link_href = get_permalink($post_id);
                $link_text = get_the_title($post_id);
            ?>
            <a href="<?php echo $link_href; ?>" target="_self"><?php echo $link_text; ?></a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
