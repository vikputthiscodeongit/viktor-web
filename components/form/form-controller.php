<?PHP
include __DIR__ . "/../../admin/global-vars.php";
include __DIR__ . "/../../admin/form-constants.php";
include "form-content.php";

enum FormSubmitStatusses: int {
    case UNKNOWN_ERROR = 500;
    case REQUEST_METHOD_INVALID = 405;
    case REQUIRED_INPUT_MISSING = 400;
    case INPUT_INVALID = 422;
    case MAIL_FAILED = 502;
    case SUCCESS = 200;
}

enum FormInputs: string {
    case NAME = "cf-name";
    case EMAIL = "cf-email";
    case SUBJECT = "cf-subject";
    case MESSAGE = "cf-message";
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    redirectToForm(FormSubmitStatusses::REQUEST_METHOD_INVALID);
}

$validation_conditions_per_input = getValidationConditionsForInputs($FORM["fieldsets"]);
$required_inputs = getRequiredInputs($validation_conditions_per_input);
$names_of_empty_required_inputs = getEmptyPostVars($required_inputs);

if (!empty($names_of_empty_required_inputs)) {
    redirectToForm(FormSubmitStatusses::REQUIRED_INPUT_MISSING, $names_of_empty_required_inputs);
}

$cf_name_clean = !empty($_POST[FormInputs::NAME->value])
    ? htmlspecialchars(trim($_POST[FormInputs::NAME->value]))
    : null;
$cf_email_trimmed = trim($_POST[FormInputs::EMAIL->value]);
$cf_subject_clean = htmlspecialchars(trim($_POST[FormInputs::SUBJECT->value]));
$cf_message_clean = htmlspecialchars(trim($_POST[FormInputs::MESSAGE->value]));
$all_inputs_and_values = array(
    FormInputs::NAME->value => $cf_name_clean,
    FormInputs::EMAIL->value => $cf_email_trimmed,
    FormInputs::SUBJECT->value => $cf_subject_clean,
    FormInputs::MESSAGE->value => $cf_message_clean
);

$names_of_invalid_inputs =
    getNamesOfInvalidFormInputs($validation_conditions_per_input, $all_inputs_and_values);

if (!empty($names_of_invalid_inputs)) {
    redirectToForm(FormSubmitStatusses::INPUT_INVALID, $names_of_invalid_inputs);
}

$mail_sent = sendMail($all_inputs_and_values);

$status = $mail_sent
    ? redirectToForm(FormSubmitStatusses::SUCCESS)
    : redirectToForm(FormSubmitStatusses::MAIL_FAILED, $all_inputs_and_values);

function redirectToForm($status, $values = false) {
    http_response_code($status->value);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($values);

    exit();
}

function getValidationConditionsForInputs($fieldsets) {
    $INPUT_VALIDATION_PROPS = ["type", "required", "minlength", "maxlength", "pattern"];
    $array_of_inputs = array();

    foreach($fieldsets as $fieldset) {
        foreach($fieldset as $field) {
            $input = $field["input"];

            $input_validation_props_and_values = array();

            foreach($input as $input_prop => $input_prop_value) {
                if (in_array($input_prop, $INPUT_VALIDATION_PROPS)) {
                    if ($input_prop === "type") {
                        if ($input_prop_value === "submit") {
                            continue 2;
                        }

                        if ($input_prop_value === "email") {
                            $input_validation_props_and_values["email"] = true;
                        }
                    } else {
                        $input_validation_props_and_values[$input_prop] = $input_prop_value;
                    }
                }

                if ($input_prop === array_key_last($input)) {
                    $array_of_inputs[$input["id"]] = $input_validation_props_and_values;
                }
            }
        }
    }

    return $array_of_inputs;
}

function getRequiredInputs($inputs) {
    $required_inputs = array();

    foreach($inputs as $input_name => $input_props) {
        if (isset($input_props["required"]) && $input_props["required"] === "true") {
            array_push($required_inputs, $input_name);
        }
    }

    return $required_inputs;
}

function getEmptyPostVars($values) {
    $empty = array();

    foreach($values as $value) {
        if (empty($_POST[$value])) {
            array_push($empty, $value);
        }
    }

    return $empty;
}

function getNamesOfInvalidFormInputs($validation_conditions_per_input, $values_per_input) {
    $errors = array();

    foreach($values_per_input as $input_for => $input_value) {
        if (
            !isset($validation_conditions_per_input[$input_for]["required"]) ||
            $validation_conditions_per_input[$input_for]["required"] === "false"
        ) {
            continue;
        }

        $condition_passed = null;

        foreach($validation_conditions_per_input[$input_for] as $condition_key => $condition_value) {
            if ($condition_passed !== null) {
                break;
            }

            switch($condition_key) {
                case "email":
                    $condition_passed = isValidEmailAddress($input_value);
                    break;

                case "minlength":
                    $condition_passed = strlen($input_value) >= (int) $condition_value;
                    break;

                case "maxlength":
                    $condition_passed = strlen($input_value) <= (int) $condition_value;
                    break;

                default:
                    $condition_passed = false;
            }

            if ($condition_passed === false) {
                array_push($errors, $input_for);
            }
        }
    }

    return $errors;
}

function isValidEmailAddress($email) {
    // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
    $REGEX = "/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";

    return preg_match($REGEX, $email) === 1;
}

function sendMail($values) {
    $mail_to = EMAIL_ADDRESS_PERSONAL;
    $mail_subject = sprintf(
        'Inzending contactformulier %1$s van %2$s', WEBSITE_DOMAIN, $values[FormInputs::EMAIL->value]
    );
    $mail_message = sprintf(
        'Het onderstaande bericht is door %1$s op %2$s om %3$s verstuurd via het contactformulier op %4$s.' . "\n\n" . '%5$s' . "\n\n" . '%6$s',
        $values[FormInputs::NAME->value] ?? "een bezoeker",
        date("j F Y"),
        date("H:i:s"),
        WEBSITE_DOMAIN,
        $values[FormInputs::SUBJECT->value],
        $values[FormInputs::MESSAGE->value]
    );
    $mail_headers = array(
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $values[FormInputs::EMAIL->value]
    );

    mail($mail_to, $mail_subject, $mail_message, $mail_headers);
}
