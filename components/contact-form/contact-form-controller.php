<?php
// TODO:
// * Set $_SESSION variable with form data hash on succesful submit.
//   Compare on next submit. If equal > reject.

include __DIR__ . "/../../global.php";
include ROOT_DIR . "/session.php";
include ROOT_DIR . "/_folder/values.php";
include ROOT_DIR . "/helpers/php/return-http-response.php";
include ROOT_DIR . "/components/contact-form/helpers/email-address-validator.php";
// include ROOT_DIR . "/components/form-mc/form-mc-validator.php";
include ROOT_DIR . "/content/form-content.php";

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
    $form_control_id_prefix = "contact-form-";

    foreach ($form_items_flat as $field_items) {
        if (
            !isset($field_items["control"]) ||
            (isset($field_items["control"]["el"]) && $field_items["control"]["el"] === "button")
        ) {
            continue;
        }

        $form_control_attrs = array_filter(
            $field_items["control"],
            function ($value, $attr) {
                if (in_array($attr, ["id", "type", "minlength", "maxlength", "pattern", "required"])) {
                    return $attr;
                }
            },
            1
        );
        $form_control_attrs["id"] = $form_control_id_prefix . $form_control_attrs["id"];
        array_push($form_controls_attrs, $form_control_attrs);
    }

    return $form_controls_attrs;
}

function validateFormData($form_controls_attrs, $form_data)
{
    $validated_form_data = [];

    foreach ($form_controls_attrs as $form_control_attrs) {
        $form_control_value = $form_data[$form_control_attrs["id"]];

        // An input that isn't required may be empty.
        if (
            $form_control_value === "" &&
            (!isset($form_control_attrs["required"]) ||
                (isset($form_control_attrs["required"]) &&
                    $form_control_attrs["required"] === "false"))
        ) {
            array_push($validated_form_data, [
                "id" => $form_control_attrs["id"],
                "validation_errors" => []
            ]);

            continue;
        }

        $form_control_valiation_result = [
            "id" => $form_control_attrs["id"],
            "validation_errors" => []
        ];

        foreach ($form_control_attrs as $attr => $attr_value) {
            if ($attr === "id" || $attr === "required") continue;

            $condition_name = $attr;
            $form_control_value_valid = false;

            switch ($attr) {
                // case "id":
                //     if ($attr_value !== FormInput::MC->value) continue 2;

                //     $condition_name = "form-mc";

                //     // TODO: Come up wih something better.
                //     if (
                //         !array_key_exists($attr_value . "-d1", $form_data) ||
                //         !array_key_exists($attr_value . "-d2", $form_data)
                //     ) {
                //         break;
                //     }

                //     $form_control_value_valid = isValidProblem(
                //         $form_control_value,
                //         $form_data[$attr_value . "-d1"],
                //         $form_data[$attr_value . "-d2"]
                //     );
                //     break;

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
                array_push($form_control_valiation_result["validation_errors"], $condition_name);
            }
        }

        array_push($validated_form_data, $form_control_valiation_result);
    }

    return $validated_form_data;
}

function getInvalidFormControls($form_data)
{
    $invalid_form_controls = array_filter($form_data, function ($form_control_data, $key) {
        return count($form_control_data["validation_errors"]) > 0;
    }, 1);

    return $invalid_form_controls;
}

function sendMail($values)
{
    $date_formatter_nl = datefmt_create(
        "nl_NL",
        IntlDateFormatter::FULL,
        IntlDateFormatter::FULL,
        "Europe/Amsterdam",
        IntlDateFormatter::GREGORIAN,
        "EEEE d MMMM YYYY"
    );

    $mail_to = EMAIL_ADDRESS_PERSONAL;
    $mail_subject = "Contactformulier inzending van " . $values["contact-form-email"];
    $mail_message = sprintf(
        'Het onderstaande bericht is door %1$s op %2$s om %3$s verstuurd.' . "\n\n" . '%4$s' . "\n\n" . '%5$s',
        $values["contact-form-name"] ?? "een bezoeker",
        datefmt_format($date_formatter_nl, time()),
        date("H:i:s"),
        $values["contact-form-subject"],
        $values["contact-form-message"]
    );
    $mail_headers = [
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $values["contact-form-email"]
    ];

    $mail_sent = mail($mail_to, $mail_subject, $mail_message, $mail_headers);

    return $mail_sent;
}

function handleFormSubmit($form_items)
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            // unset($_SESSION["form_mc_cf"]);
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED);
        }

        $clean_form_data = sanitizeFormData($_POST);
        // var_dump($clean_form_data);

        $form_controls_attrs = getFormControlsAttributes($form_items);
        // var_dump($form_controls_attrs);

        $validated_form_data = validateFormData($form_controls_attrs, $clean_form_data);
        // var_dump($validated_form_data);

        $invalid_form_controls = getInvalidFormControls(($validated_form_data));
        // var_dump($invalid_form_controls);

        // unset($_SESSION["form_mc_cf"]);

        if (count($invalid_form_controls) > 0) {
            returnHttpResponse(HttpStatus::UNPROCESSABLE_CONTENT, ["validated_form_data" => $validated_form_data]);
        }

        $mail_sent = sendMail($clean_form_data);

        $mail_sent
            ? returnHttpResponse(HttpStatus::NO_CONTENT)
            : returnHttpResponse(HttpStatus::BAD_GATEWAY);
    } catch (Exception $exception) {
        // var_dump($exception);

        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

handleFormSubmit($FORM_ITEMS);
