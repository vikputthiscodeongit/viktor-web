<?php
require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/components/simple-maths-captcha/simple-maths-captcha-validator.php";

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

    foreach ($form_items_flat as $field_items) {
        if (isset($field_items["control"]["type"]) && $field_items["control"]["type"] === "submit") continue;

        $form_control_attrs = array_filter(
            $field_items["control"],
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
        if (isFormControlSimpleMathsCaptchaActivator($form_control_attrs["id"])) {
            $validation_result = getSimpleMathsCaptchaValidationState($form_data);

            if ($validation_result === "empty" || $validation_result === "invalid") {
                $form_control_validation_result["validation_errors"] = $validation_result === "empty" ? [true] : [$validation_result];
            }

            array_push($validated_form_data, $form_control_validation_result);

            continue;
        }

        if (!array_key_exists($form_control_attrs["id"], $form_data)) {
            $form_control_validation_result["validation_errors"] = [true];
            array_push($validated_form_data, $form_control_validation_result);

            continue;
        }

        $form_control_value = $form_data[$form_control_attrs["id"]];

        // Empty, non-required form controls.
        if (
            $form_control_value === "" &&
            (!isset($form_control_attrs["required"]) || $form_control_attrs["required"] === "false")
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
