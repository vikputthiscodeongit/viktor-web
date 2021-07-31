<?php
    // Initializer
    function wpcf7mc_add_shortcode() {
        wpcf7_add_form_tag("wpcf7mc", "wpcf7mc_init", true);
    }
    add_action("wpcf7_init", "wpcf7mc_add_shortcode");

    function wpcf7mc_init($tag) {
        $tag = new WPCF7_FormTag($tag);

        $digit1 = mt_rand(1, 10);
        $digit2 = mt_rand(1, 10);

        $output = '
        <div class="field field--inline">
            <label for="wpcf7-mc-answer">' . $digit1 . ' + ' . $digit2 . ' =</label>
            <input type="text" name="wpcf7-mc-answer" class="wpcf7-validates-as-required" id="wpcf7-mc-answer" inputmode="numeric" pattern="[0-9]*" aria-required="true">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="wpcf7-mc-hf field field--inline">
            <label for="wpcf7-mc-d1">First number of the sum</label>
            <input type="text" name="wpcf7-mc-d1" class="wpcf7-validates-as-required" id="wpcf7-mc-d1" inputmode="numeric">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="wpcf7-mc-hf field field--inline">
            <label for="wpcf7-mc-d2">Second number of the sum</label>
            <input type="text" name="wpcf7-mc-d2" class="wpcf7-validates-as-required" id="wpcf7-mc-d2" inputmode="numeric">
            <span class="wpcf7-mc-field-star">*</span>
        </div>

        <div class="wpcf7-mc-hf field field--inline">
            <label for="city">Leave this field empty</label>
            <input type="text" name="city" id="city">
        </div>
        ';

        return $output;
    }


    // Validator
    function wpcf7mc_validator($result, $tag) {
        // Search the tags to see if wpcf7mc is being used before initializing the validator.
        $key = array_search("wpcf7mc", array_column($tag, "type"));

        if (empty($key))
            return $result;
            // return;

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

            $result->invalidate($tag, __("You didn't do any maths.", "wpcf7-mc"));
        } elseif (empty($digit1) || empty($digit2) || $digit1 + $digit2 !== $answer) {
            // If this condition evaluates to true, the most obvious reason would be because a wrong answer is given.
            // It will however also evaluate to true if either:
            //  * The form gets sent whilst either one of the digit fields is empty, or
            //  * If an incorrect digit is filled in in either one of the digit fields.
            // Stictly speaking, in these cases the validation message as it stands is incorrect.
            $tag->name = "captcha_resp";

            $result->invalidate($tag, __("There was an error in your maths.", "wpcf7-mc"));
        }

        return $result;
    }
    add_filter("wpcf7_validate", "wpcf7mc_validator", 99, 2);


    // Tag generator
    function wpcf7mc_add_tag_generator() {
        $tag_generator = WPCF7_TagGenerator::get_instance();

        // TODO: Check arguments
        $tag_generator->add("wpcf7mc", __("maths challenge", "wpcf7-mc"), "wpcf7mc_tag_generator");
    }
    add_action("wpcf7_admin_init", "wpcf7mc_add_tag_generator", 55);

    function wpcf7mc_tag_generator($contact_form, $args = "") {
        $args = wp_parse_args($args, array());
        ?>
        <div class="control-box">
            <p>
                A lightweight mathematics based CAPTCHA that's not too difficult to solve.
            </p>
        </div>

        <div class="insert-box">
            <input type="text" name="wpcf7mc" class="tag code" readonly="readonly" onfocus="this.select()">

            <div class="submitbox">
                <input type="button" class="button button-primary insert-tag" value="<?php echo esc_attr(__('Insert tag', 'wpcf7-mc')); ?>">
            </div>
        </div>
        <?php
    }
