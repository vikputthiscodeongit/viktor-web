<?PHP
include __DIR__ . "/../../admin/session.php";
include __DIR__ . "/../../admin/not-dotenv.php";
include __DIR__ . "/../form-mc/form-mc-validator.php";
include "helpers.php";
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
    case MC = "cf-mc";
    case MESSAGE = "cf-message";
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    returnStatus(FormSubmitStatusses::REQUEST_METHOD_INVALID);
}

$input_array = getInputArray($FORM["fieldsets"]);
var_dump($input_array);

$validation_conditions_per_input = getValidationConditionsOfInputs($input_array);
var_dump($validation_conditions_per_input);

$required_inputs = array_filter($validation_conditions_per_input, function($key, $value) {
    return $key === "required" && $value === "true";
}, ARRAY_FILTER_USE_BOTH );

$names_of_empty_required_inputs = getEmptyPostVars($required_inputs);

if (!empty($names_of_empty_required_inputs)) {
    returnStatus(FormSubmitStatusses::REQUIRED_INPUT_MISSING, $names_of_empty_required_inputs);
}

$cf_name_clean = !empty($_POST[FormInputs::NAME->value])
    ? htmlspecialchars(trim($_POST[FormInputs::NAME->value]))
    : null;
$cf_email_trimmed = trim($_POST[FormInputs::EMAIL->value]);
$cf_subject_clean = htmlspecialchars(trim($_POST[FormInputs::SUBJECT->value]));
$cf_mc_clean = htmlspecialchars(trim($_POST[FormInputs::MC->value]));
$cf_message_clean = htmlspecialchars(trim($_POST[FormInputs::MESSAGE->value]));
$all_inputs_and_values = array(
    FormInputs::NAME->value => $cf_name_clean,
    FormInputs::EMAIL->value => $cf_email_trimmed,
    FormInputs::SUBJECT->value => $cf_subject_clean,
    FormInputs::MC->value => $cf_mc_clean,
    FormInputs::MESSAGE->value => $cf_message_clean
);
var_dump($all_inputs_and_values);

$names_of_invalid_inputs =
    getNamesOfInvalidFormInputs($validation_conditions_per_input, $all_inputs_and_values);
var_dump($names_of_invalid_inputs);

if (!empty($names_of_invalid_inputs)) {
    returnStatus(FormSubmitStatusses::INPUT_INVALID, $names_of_invalid_inputs);
}

$mail_sent = sendMail($all_inputs_and_values);

$status = $mail_sent
    ? returnStatus(FormSubmitStatusses::SUCCESS)
    : returnStatus(FormSubmitStatusses::MAIL_FAILED, $all_inputs_and_values);

function getInputArray($fieldsets) {
    $input_array = [];

    foreach(array_values($fieldsets) as $fieldset) {
        foreach($fieldset as $fields) {
            foreach($fields as $field) {
                array_push($input_array, $field["input"]);
            }
        }
    }

    return $input_array;
}

function getValidationConditionsOfInputs($input_array) {
    $PROPS_TO_CHECK = ["minlength", "maxlength", "pattern", "required"];
    $VALUES_TO_CHECK = ["id", "type"];
    $validation_props_per_input = array();

    foreach($input_array as $input) {
        $input_validation_props_and_values = array();

        foreach($input as $input_prop => $input_prop_value) {
            if (in_array($input_prop, $PROPS_TO_CHECK)) {
                $input_validation_props_and_values[$input_prop] = $input_prop_value;
            } else if (in_array($input_prop, $VALUES_TO_CHECK)) {
                if (
                    $input_prop === "type" && $input_prop_value === "email" ||
                    $input_prop === "id" && $input_prop_value === FormInputs::MC->value
                ) {
                    $input_validation_props_and_values[$input_prop_value] = true;
                }
            }

            if ($input_prop === array_key_last($input)) {
                $validation_props_per_input[$input["id"]] = $input_validation_props_and_values;
            }
        }
    }

    return $validation_props_per_input;
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

function getSanitizedInputsAndValues() {
    $inputs_and_values = [];

    foreach (FormInputs::cases() as $input_name) {
        if (!empty($_POST[$input_name->value])) {
            $input_value_sanitized = htmlspecialchars(trim($_POST[$input_name->value]));
            $inputs_and_values[$input_name->value] = $input_value_sanitized;
        } else {
            $inputs_and_values[$input_name->value] = null;
        }
    }

    return $inputs_and_values;
}

function getInvalidInputs($inputs_and_values, $validation_conditions_per_input) {
    $errors = array();

    foreach($values_per_input as $input_for => $input_value) {
        $condition_passed = null;

        foreach($validation_conditions_per_input[$input_for] as $condition_key => $condition_value) {
            var_dump($condition_key);

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

                case "mc":
                    $condition_passed = isValidProblem($input_value);
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
