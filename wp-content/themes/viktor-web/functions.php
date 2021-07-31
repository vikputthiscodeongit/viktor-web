<?php
    //
    // Define constants
    define("THEME_DIR_URI", get_template_directory_uri());
    define("THEME_DIR_PATH", get_template_directory());
    define("SITE_URL", get_site_url());


    //
    // Custom navigation walker
    // include "includes/walker-nav-menu-viktor-2020.php";


    //
    // Update WordPress's is_email() to comply with the RFC 5322 specification.
    function is_valid_email($is_email, $email, $context) {
        $is_email = false;

        // Use a RegEx instead of FILTER_VALIDATE_EMAIL because FILTER_VALIDATE_EMAIL validates email addresses against the superseded RFC 822 specification. See also https://stackoverflow.com/a/201378/6396604 & https://emailregex.com/.
        // Don't put the RegEx in a variable to prevent my editor's syntax highlighting from going bananas.
        if (preg_match('/^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/iD', $email)) {
            $is_email = true;
        }

        return $is_email;
    }
    add_filter("is_email", "is_valid_email", 99, 3);


    //
    // Updates
    add_filter("auto_update_theme", "__return_true");


    //
    // Disable XML-RPC - https://www.scottbrownconsulting.com/2020/03/two-ways-to-fully-disable-wordpress-xml-rpc/
    function remove_xmlrpc_methods($methods) {
        return array();
    }
    add_filter("xmlrpc_methods", "remove_xmlrpc_methods");


    //
    // https://www.dev4press.com/blog/wordpress/2015/canonical-redirect-problem-and-solutions/
    // function disable_canonical_redirects() {
    //     remove_action("template_redirect", "redirect_canonical");
    // }
    // add_action("after_setup_theme", "disable_canonical_redirects");


    //
    //
    function generate_meta_description() {
        echo '<meta name="description" content="' . esc_attr(get_bloginfo("description")) . '" />' . "\n";
    }


    //
    //
    function edit_wp_head() {
        remove_action("wp_head", "rsd_link");
        remove_action("wp_head", "wlwmanifest_link");
        remove_action("wp_head", "wp_generator");

        add_action("wp_head", "generate_meta_description", 1);
    }
    add_action("after_setup_theme", "edit_wp_head");


    //
    //
    function add_theme_features() {
        add_theme_support("post-thumbnails");
        add_theme_support("automatic-feed-links");
        add_theme_support("html5", array("comment-form", "comment-list", "gallery", "caption"));
        add_theme_support("title-tag");
    }
    add_action("after_setup_theme", "add_theme_features");


    //
    // Add extra MIME types
    function extra_mime_types($mimes) {
        $mimes["svg"] = "image/svg";

        return $mimes;
    }
    add_filter("upload_mimes", "extra_mime_types");


    //
    // Remove default image sizes
    function remove_image_sizes() {
        remove_image_size("1536x1536");
        remove_image_size("2048x2048");
    }
    add_action("init", "remove_image_sizes");


    //
    // Add extra image sizes
    function add_image_sizes() {
        add_image_size("extra_small", 360, 360);
        add_image_size("small", 480, 480);
    }
    add_action("after_setup_theme", "add_image_sizes");


    //
    // Remove links from admin bar
    function remove_admin_bar_links() {
        global $wp_admin_bar;

        // WordPress Core
        $wp_admin_bar->remove_menu("wp-logo"); // WordPress logo & its sub-menu items
        $wp_admin_bar->remove_menu("new-user"); // New - user
    }
    add_action("wp_before_admin_bar_render", "remove_admin_bar_links", 999);


    //
    // Hide admin bar on the front end
    add_filter("show_admin_bar", "__return_false");


    //
    // Add ACF "Options" page
    // function add_acf_options() {
    //     if (function_exists("acf_add_options_page")) {
    //         acf_add_options_page();
    //     }
    // }
    // add_action("after_setup_theme", "add_acf_options");


    //
    // Remove meta boxes from the editor
    function remove_meta_boxes() {
        remove_post_type_support("page", "page-attributes");
    }
    add_action("init", "remove_meta_boxes");


    //
    // Register menus
    // function register_custom_nav_menus() {
    //     register_nav_menus(array(
    //         "site_header" => "Site header"
    //     ));
    // }
    // add_action("after_setup_theme", "register_custom_nav_menus");


    //
    // Register custom styles & scripts
    function add_styles_scripts() {
        $style_version = date("Ymd_His", filemtime(plugin_dir_path(__FILE__) . "/dist/css/style.css"));
        $bundle_version  = date("Ymd_His", filemtime(plugin_dir_path(__FILE__) . "/dist/js/bundle-main.js"));

        wp_enqueue_style("fonts", "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Recursive:wght@400;600&display=swap", false, null);
        wp_enqueue_style("style", THEME_DIR_URI . "/dist/css/style.css", false, $style_version);
        wp_enqueue_script("bundle#defer", THEME_DIR_URI . "/dist/js/bundle-main.js", false, $bundle_version);
    }
    add_action("wp_enqueue_scripts", "add_styles_scripts");


    //
    // Add async/defer attribute to custom scripts - https://stackoverflow.com/a/40553706, somewhat modified.
    if (!is_admin()) {
        function add_async_defer_attribute($tag, $handle) {
            if (
                strpos($handle, "async") ||
                strpos($handle, "defer")
            ) {
                if (strpos($handle, "async")) {
                    return str_replace("<script ", "<script async ", $tag);
                }
                if (strpos($handle, "defer")) {
                    return str_replace("<script ", "<script defer ", $tag);
                }
            } else {
                return $tag;
            }
        }
        add_filter("script_loader_tag", "add_async_defer_attribute", 10, 2);
    }


    //
    // WPCF7 - Mathematical CAPTCHA
    // Start the initializer
    function wpcf7mc_add_shortcode() {
        wpcf7_add_form_tag("wpcf7mc", "wpcf7mc_init", true);
    }
    add_action("wpcf7_init", "wpcf7mc_add_shortcode");

    // Initializer
    function wpcf7mc_init($tag) {
        $tag = new WPCF7_FormTag($tag);

        $digit1 = mt_rand(1, 10);
        $digit2 = mt_rand(1, 10);

        $sum = $digit1 + $digit2;

        $output = '
        <div class="field field--inline">
            <label for="wpcf7-mc-answer" class="form__label">' . $digit1 . ' + ' . $digit2 . ' =</label>
            <input type="text" name="wpcf7-mc-answer" class="wpcf7-validates-as-required form__input" id="wpcf7-mc-answer" inputmode="numeric" pattern="[0-9]*" aria-required="true">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="field field--inline wpcf7-mc-hf">
            <label for="wpcf7-mc-d1" class="form__label">First number of the sum</label>
            <input type="text" name="wpcf7-mc-d1" class="wpcf7-validates-as-required form__input" id="wpcf7-mc-d1" inputmode="numeric">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="field field--inline wpcf7-mc-hf">
            <label for="wpcf7-mc-d2" class="form__label">Second number of the sum</label>
            <input type="text" name="wpcf7-mc-d2" class="wpcf7-validates-as-required form__input" id="wpcf7-mc-d2" inputmode="numeric">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="field field--inline wpcf7-mc-hf">
            <label for="city" class="form__label">Leave this field empty</label>
            <input type="text" name="city" class="form__input" id="city">
        </div>
        ';

        return $output;
    }

    // Validator
    function wpcf7mc_validator($result, $tag) {
        // Search the tags to see if wpcf7mc is being used before initializing validation.
        $key = array_search("wpcf7mc", array_column($tag, "type"));

        if (!empty($key)) {
            $tag = new WPCF7_FormTag($tag);
            $tag->name = "captcha";

            $answer = $_POST["wpcf7-mc-answer"];
            $digit1 = $_POST["wpcf7-mc-d1"];
            $digit2 = $_POST["wpcf7-mc-d2"];
            $honeypot = $_POST["city"];

            if (!empty($honeypot)) {
                $tag->name = "captcha_hp";

                $result->invalidate($tag, wpcf7_get_message("spam"));
            } elseif (empty($answer)) {
                $tag->name = "captcha_resp";

                $result->invalidate($tag, __("You didn't do any maths.", "contact-form-7-maths-captcha"));
            } elseif (
                !$digit1 || !$digit2 ||
                $digit1 + $digit2 !== $answer
            ) {
                // If this condition evaluates to true, the most obvious reason would be because a wrong answer is given.
                // It however will also be true if either the form gets sent within the first 3 seconds after page load,
                // or if a spam bot (/ human who is actively trying to break my site) fills in a value in the digit 1 and/or digit 2 field
                // and proceeds to submit the form. In these cases the validation message as it is would be wrong.
                $tag->name = "captcha_resp";

                $result->invalidate($tag, __("There was an error in your maths.", "contact-form-7-maths-captcha"));
            }
        }

        return $result;
    }
    add_filter("wpcf7_validate", "wpcf7mc_validator", 99, 2);

    // Tag generator
    function wpcf7mc_add_tag_generator() {
        $tag_generator = WPCF7_TagGenerator::get_instance();

        // TODO: Check arguments
        $tag_generator->add("wpcf7mc", __("maths challenge", "contact-form-7-maths-captcha"), "wpcf7mc_tag_generator", array("nameless" => 1));
    }
    add_action("wpcf7_admin_init", "wpcf7mc_add_tag_generator", 55);

    function wpcf7mc_tag_generator($contact_form, $args = '') {
        $args = wp_parse_args($args, array()); ?>
        <div class="control-box">
            <p>
                A lightweight mathematics based CAPTCHA that's not too difficult to solve.
            </p>
        </div>

        <div class="insert-box">
            <input type="text" name="wpcf7mc" class="tag code" readonly="readonly" onfocus="this.select()">

            <div class="submitbox">
                <input type="button" class="button button-primary insert-tag" value="<?php echo esc_attr(__('Insert tag', 'contact-form-7-maths-captcha')); ?>">
            </div>
        </div>
    <?php
    }
