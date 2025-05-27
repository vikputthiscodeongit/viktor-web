<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/php/controllers/simple-maths-captcha-validator.php";

function isValidEmailAddress(string $email_address)
{
    // RegEx used by browsers for the `email` input type.
    // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
    $REGEX = "/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";

    return preg_match($REGEX, $email_address) === 1;
}

function sanitizeFormData($form_data)
{
    $clean_form_data = [];

    foreach ($form_data as $form_control_name => $form_control_value) {
        $form_control_value_trimmed = trim($form_control_value);
        $clean_form_data[$form_control_name] = $form_control_value_trimmed !== ""
            ? htmlspecialchars($form_control_value_trimmed)
            : "";
    }

    return $clean_form_data;
}

function getFormControlsAttributes($form_items)
{
    $form_items_flat = array_merge([], ...$form_items);
    $form_controls_attrs = [];

    foreach ($form_items_flat as $key => $item) {
        if ($key === "legend") continue;

        if (isset($item["control"]["type"]) && $item["control"]["type"] === "submit")
            continue;

        $form_control_attrs = array_filter(
            $item["control"],
            function ($attr) {
                if (in_array($attr, ["id", "type", "minlength", "maxlength", "pattern", "required"])) {
                    return $attr;
                }
            },
            ARRAY_FILTER_USE_KEY
        );

        array_push($form_controls_attrs, $form_control_attrs);
    }

    return $form_controls_attrs;
}

function validateFormData($form_controls_attrs, $form_data)
{
    $validated_form_data = [];

    foreach ($form_controls_attrs as $form_control_attrs) {
        $form_control_validation_result = [
            "id" => $form_control_attrs["id"],
            "validation_errors" => []
        ];

        // Simple Maths CAPTCHA
        if (isSimpleMathsCaptchaFormControl($form_control_attrs["id"])) {
            $simple_maths_captcha_id =
                getSimpleMathsCaptchaId($form_control_attrs["id"]) ?? $form_control_attrs["id"];
            $validation_result =
                getSimpleMathsCaptchaValidationState($simple_maths_captcha_id, $form_data);

            if ($validation_result !== "valid") {
                $form_control_validation_result["id"] =
                    getSimpleMathsCaptchaInvalidControlId($simple_maths_captcha_id, $validation_result);
                $form_control_validation_result["validation_errors"] = [true];
            }

            array_push($validated_form_data, $form_control_validation_result);

            continue;
        }

        // Each form control must be reflected in the form data.
        if (!array_key_exists($form_control_attrs["id"], $form_data)) {
            $form_control_validation_result["validation_errors"] = [true];
            array_push($validated_form_data, $form_control_validation_result);

            continue;
        }

        $form_control_value = $form_data[$form_control_attrs["id"]];

        // Empty, non-required form controls.
        if (
            $form_control_value === "" &&
            (
                !isset($form_control_attrs["required"]) ||
                $form_control_attrs["required"] === false ||
                $form_control_attrs["required"] === "false"
            )
        ) {
            array_push($validated_form_data, $form_control_validation_result);

            continue;
        }

        foreach ($form_control_attrs as $attr => $attr_value) {
            if ($attr === "id" || $attr === "required") continue;

            $condition_name = $attr;
            $form_control_value_valid = false;

            switch ($attr) {
                case "type":
                    // Continue with next attribute.
                    if ($attr_value !== "email") continue 2;

                    $condition_name = "email";
                    $form_control_value_valid = isValidEmailAddress($form_control_value);
                    break;

                case "minlength";
                    $form_control_value_valid = strlen($form_control_value) >= (int) $attr_value;
                    break;

                case "maxlength";
                    $form_control_value_valid = strlen($form_control_value) <= (int) $attr_value;
                    break;
            }

            if ($form_control_value_valid === false) {
                array_push($form_control_validation_result["validation_errors"], $condition_name);
            }
        }

        array_push($validated_form_data, $form_control_validation_result);
    }

    return $validated_form_data;
}

function getFormControlsErrors($validated_form_data)
{
    $invalid_form_controls = array_filter($validated_form_data, function ($form_control_data) {
        return count($form_control_data["validation_errors"]) > 0;
    });

    return $invalid_form_controls;
}
