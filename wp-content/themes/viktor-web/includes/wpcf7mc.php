<?php
    // Disable loading of JavaScript bundle by default.
    // add_filter("wpcf7_load_js", "__return_false");

    // Load front-end assets - function taken from Contact Form 7 5.4.2's source.
    // Load bundle-main.js before loading the plugin's JavaScript assets.
    // When the submit event fires, wpcf7.submit.do() (my function) calls
    // stopImmediatePropagation() to prevent wpcf7.submit() (the plugin's function) from running.
    // This can only be done if bundle-main.js is loaded before wpcf7's JavaScript bundle,
    // else the JavaScript event handlers would be added in the right order.
    // function add_wpcf7_scripts() {
    //     $assets = array();
    //     $asset_file = wpcf7_plugin_path( 'includes/js/index.asset.php' );

    //     if ( file_exists( $asset_file ) ) {
    //         $assets = include( $asset_file );
    //     }

    //     $assets = wp_parse_args( $assets, array(
    //         'src' => wpcf7_plugin_url( 'includes/js/index.js' ),
    //         'dependencies' => array(
    //             'wp-polyfill',
    //         ),
    //         'version' => WPCF7_VERSION,
    //         'in_footer' => false,
    //     ) );

    //     wp_register_script(
    //         'contact-form-7#defer',
    //         $assets['src'],
    //         $assets['dependencies'],
    //         $assets['version'],
    //         $assets['in_footer']
    //     );

    //     wp_enqueue_script( 'contact-form-7#defer' );

    //     $wpcf7 = array(
    //         'api' => array(
    //             'root' => esc_url_raw( get_rest_url() ),
    //             'namespace' => 'contact-form-7/v1',
    //         ),
    //     );

    //     if ( defined( 'WP_CACHE' ) and WP_CACHE ) {
    //         $wpcf7['cached'] = 1;
    //     }

    //     wp_localize_script( 'contact-form-7#defer', 'wpcf7', $wpcf7 );
    // }
    // add_action( 'wp_enqueue_scripts', 'add_wpcf7_scripts' );
    //

    // Add shortcode support
    function wpcf7mc_init() {
        wpcf7_add_form_tag("wpcf7mc", "wpcf7mc_make_tag", true);

        add_filter("wpcf7_form_class_attr", "wpcf7mc_add_form_classes");
    }
    add_action("wpcf7_init", "wpcf7mc_init");

    // Make tag
    function wpcf7mc_make_tag($tag) {
        $tag = new WPCF7_FormTag($tag);
    }

    // Add classes
    function wpcf7mc_add_form_classes($classes) {
        $classes .= " has-wpcf7mc";

        return $classes;
    }

    // Validate presence
    function wpcf7mc_check_init($result, $tag) {
        // Because the validator is triggered on every submission,
        // search the form tags to see if wpcf7mc is initiated.
        $key = array_search("wpcf7mc", array_column($tag, "type"));

        if (!empty($key)) {
            $tag = new WPCF7_FormTag($tag);
            $tag->name = "wpcf7mc_answer";

            $user_answer = isset($_POST["wpcf7mc-input"]) ? trim($_POST["wpcf7mc-input"]) : "";

            if (!$user_answer) {
                $tag->name = "wpcf7mc_answer";

                $result->invalidate($tag, __("Your answer to the maths problem was incorrect.", "contact-form-7-maths-captcha"));
            }
        }

        return $result;
    }
    add_filter("wpcf7_validate", "wpcf7mc_check_init", 99, 2);
