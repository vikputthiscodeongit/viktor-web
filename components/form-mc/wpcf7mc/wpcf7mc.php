<?php
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

                $result->invalidate($tag, __("Your message has not been sent because you didn't complete the required challenge.", "contact-form-7-maths-captcha"));
            }
        }

        return $result;
    }
    add_filter("wpcf7_validate", "wpcf7mc_check_init", 99, 2);
