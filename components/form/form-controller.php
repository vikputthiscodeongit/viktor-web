<?PHP
include __DIR__ . "/../../admin/session.php";
include __DIR__ . "/../../admin/not-dotenv.php";
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
    returnStatus(FormSubmitStatusses::REQUEST_METHOD_INVALID);
}

$fieldsets = array_filter($FORM["fieldsets"], function($key) { $key !== "disabled"; }, ARRAY_FILTER_USE_KEY);
$validation_conditions_per_input = getValidationConditionsForInputs($fieldsets);
$required_inputs = getRequiredInputs($validation_conditions_per_input);
$names_of_empty_required_inputs = getEmptyPostVars($required_inputs);

if (!empty($names_of_empty_required_inputs)) {
    returnStatus(FormSubmitStatusses::REQUIRED_INPUT_MISSING, $names_of_empty_required_inputs);
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
    returnStatus(FormSubmitStatusses::INPUT_INVALID, $names_of_invalid_inputs);
}

$mail_sent = sendMail($all_inputs_and_values);

$status = $mail_sent
    ? returnStatus(FormSubmitStatusses::SUCCESS)
    : returnStatus(FormSubmitStatusses::MAIL_FAILED, $all_inputs_and_values);

// Store hash of last successful submission in $_SESSION. Compare on next new successful submission.
// Reject if equal, clear if not.

// Success
//  JS:   Respond with 200
//  NOJS: Respond with 200 and redirect with GET ?cf_status=mail_sent
//  JS/NOJS: Show response code mapped to message as notification
//  JS: Clear form
//
// Invalid fields
//  JS:   Respond with 400 / 422 and return input names
//  NOJS: Respond with 400 / 422 and redirect with GET ?cf_status=invalid_fields[input names]
//  JS/NOJS: Show response code mapped to message as notification
//  JS/NOJS: Show validation message at inputs
//
// Mail failed
//  JS:   Respond with 502 and return input names & values
//  NOJS: Respond with 502, save values to cookie
//  (clear on next successful submit (add a clear form button)), and redirect with GET ?cf_status=mail_failed
//  JS: Save message to localStorage (clear on next successful submit (add a clear form button))
//  JS/NOJS: Show response code mapped to message as notification

function returnStatus($status, array|false $values = false) {
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
    $fmt = datefmt_create(
        "nl_NL",
        IntlDateFormatter::FULL,
        IntlDateFormatter::FULL,
        "Europe/Amsterdam",
        IntlDateFormatter::GREGORIAN,
        "EEEE d MMMM YYYY"
    );

    $mail_to = EMAIL_ADDRESS_PERSONAL;
    $mail_subject = "Contactformulier inzending van " . $values[FormInputs::EMAIL->value];
    $mail_message = sprintf(
        'Het onderstaande bericht is door %1$s op %2$s om %3$s verstuurd.' . "\n\n" . '%4$s' . "\n\n" . '%5$s',
        $values[FormInputs::NAME->value] ?? "een bezoeker",
        datefmt_format($fmt, time()),
        date("H:i:s"),
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
