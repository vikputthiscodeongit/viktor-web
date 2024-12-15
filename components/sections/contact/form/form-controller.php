<?php
// TODO:
// * Set $_SESSION variable with form data hash on succesful submit.
//   Compare on next submit. If equal > reject.

include __DIR__ . "/../../../../global.php";
include ROOT_DIR . "/session.php";
include ROOT_DIR . "/_folder/values.php";
include ROOT_DIR . "/helpers/php/return-http-response.php";
include ROOT_DIR . "/components/sections/contact/form/helpers/email-address-validator.php";
include ROOT_DIR . "/components/sections/contact/form-mc/form-mc-validator.php";
include ROOT_DIR . "/content/sections/contact/form-content.php";

enum FormInput: string
{
    case EMAIL = "cf-email";
    case MC = "cf-form-mc";
    case MESSAGE = "cf-message";
    case NAME = "cf-name";
    case SUBJECT = "cf-subject";
}

function sanitizeInputsValues($inputs_values)
{
    $clean_inputs_values = [];

    foreach ($inputs_values as $input_name => $input_value) {
        $input_post_value_trimmed = trim($input_value);
        $clean_inputs_values[$input_name] = $input_post_value_trimmed !== "" ? htmlspecialchars($input_post_value_trimmed) : "";
    }

    return $clean_inputs_values;
}

function getInputsSkeletons($fieldsets)
{
    $inputs_skeletons = [];

    foreach (array_values($fieldsets) as $fieldset) {
        foreach ($fieldset as $key => $fields) {
            // Skip other attributes such as HTML class name.
            if ($key !== "fields") continue;

            foreach ($fields as $field_type => $fields_skeleton) {
                if ($field_type === "submit" || str_ends_with($field_type, "_submit")) continue;

                array_push($inputs_skeletons, $fields_skeleton["input"]);
            }
        }
    }

    return $inputs_skeletons;
}

function filterInputsAndProps($inputs_skeletons, $props_to_retain)
{
    $filtered_input_props = [];

    foreach ($inputs_skeletons as $input_skeleton) {
        $input_props_filtered = array_filter($input_skeleton, function ($key) use ($props_to_retain) {
            return in_array($key, $props_to_retain);
        }, ARRAY_FILTER_USE_KEY);

        array_push($filtered_input_props, $input_props_filtered);
    }

    return $filtered_input_props;
}

function validateInputs($inputs_props, $inputs_data_values)
{
    $validated_inputs_props = [];

    foreach ($inputs_props as $input_props) {
        $input_data_value = $inputs_data_values[$input_props["id"]];

        $validation_errors = [];

        // An input that isn't required may be empty.
        if ($input_data_value !== "" || $input_data_value === "" && in_array("required", $input_props)) {
            foreach ($input_props as $input_prop => $input_prop_value) {
                if ($input_prop === "required") continue;

                $condition_name = $input_prop;
                $input_value_valid = false;

                switch ($input_prop) {
                    case "id":
                        if ($input_prop_value !== FormInput::MC->value) continue 2;

                        $condition_name = "form-mc";

                        // TODO: Come up wih something better.
                        if (
                            !array_key_exists($input_prop_value . "-d1", $inputs_data_values) ||
                            !array_key_exists($input_prop_value . "-d2", $inputs_data_values)
                        ) {
                            break;
                        }

                        $input_value_valid = isValidProblem(
                            $input_data_value,
                            $inputs_data_values[$input_prop_value . "-d1"],
                            $inputs_data_values[$input_prop_value . "-d2"]
                        );
                        break;

                    case "type":
                        if ($input_prop_value !== "email") continue 2;

                        $condition_name = "email";
                        $input_value_valid = isValidEmailAddress($input_data_value);
                        break;

                    case "minlength";
                        $input_value_valid = strlen($input_data_value) >= (int) $input_prop_value;
                        break;

                    case "maxlength";
                        $input_value_valid = strlen($input_data_value) <= (int) $input_prop_value;
                        break;

                    default:
                        break;
                }

                if (!$input_value_valid) {
                    array_push($validation_errors, $condition_name);
                }
            }
        }

        $input_props_with_validation_errors = $input_props;
        $input_props_with_validation_errors["validation_errors"] = $validation_errors;
        array_push($validated_inputs_props, $input_props_with_validation_errors);
    }

    return $validated_inputs_props;
}

function getInvalidInputs($validated_inputs_props)
{
    $invalid_inputs = [];

    foreach ($validated_inputs_props as $input_props) {
        if (count($input_props["validation_errors"]) > 0) {
            $invalid_inputs[$input_props["id"]] = $input_props["validation_errors"];
        }
    }

    return $invalid_inputs;
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
    $mail_subject = "Contactformulier inzending van " . $values[FormInput::EMAIL->value];
    $mail_message = sprintf(
        'Het onderstaande bericht is door %1$s op %2$s om %3$s verstuurd.' . "\n\n" . '%4$s' . "\n\n" . '%5$s',
        $values[FormInput::NAME->value] ?? "een bezoeker",
        datefmt_format($date_formatter_nl, time()),
        date("H:i:s"),
        $values[FormInput::SUBJECT->value],
        $values[FormInput::MESSAGE->value]
    );
    $mail_headers = [
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $values[FormInput::EMAIL->value]
    ];

    $mail_sent = mail($mail_to, $mail_subject, $mail_message, $mail_headers);

    return $mail_sent;
}

function handleFormSubmit($form_skeleton)
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            unset($_SESSION["form_mc_cf"]);
            returnHttpResponse(StatusCode::METHOD_NOT_ALLOWED);
        }

        $clean_inputs_post_values = sanitizeInputsValues($_POST);
        // var_dump($clean_inputs_post_values);

        $inputs_skeletons = getInputsSkeletons($form_skeleton);
        // var_dump($inputs_skeletons);

        $inputs_props = filterInputsAndProps($inputs_skeletons, ["id", "type", "minlength", "maxlength", "pattern", "required"]);
        // var_dump($inputs_props);

        $validated_inputs_props = validateInputs($inputs_props, $clean_inputs_post_values);
        // var_dump($validated_inputs_props);

        unset($_SESSION["form_mc_cf"]);

        $invalid_inputs = getInvalidInputs($validated_inputs_props);
        // var_dump($invalid_inputs);

        if (!empty($invalid_inputs)) {
            returnHttpResponse(StatusCode::UNPROCESSABLE_CONTENT, $invalid_inputs);
        }

        $mail_sent = sendMail($clean_inputs_post_values);

        $mail_sent
            ? returnHttpResponse(StatusCode::NO_CONTENT)
            : returnHttpResponse(StatusCode::BAD_GATEWAY);
    } catch (Exception $exception) {
        var_dump($exception);

        returnHttpResponse(StatusCode::INTERNAL_SERVER_ERROR);
    }
}

handleFormSubmit($FORM["fieldsets"]);
