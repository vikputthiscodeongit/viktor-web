<?PHP
// Todo:
// * Check setFormStatusCookie::INPUT_INVALID case.
include __DIR__ . "/../../admin/form-constants.php";

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

$validation_conditions_per_input = getValidationConditionsForInputs($FIELDSETS);
$required_inputs = getRequiredInputs($validation_conditions_per_input);
$names_of_empty_required_inputs = getEmptyPostVars($required_inputs);

if (!empty($names_of_empty_required_inputs)) {
    redirectToForm(FormSubmitStatusses::REQUIRED_INPUT_MISSING, $names_of_empty_required_inputs);
}

$cf_name_clean = isset($_POST[FormInputs::NAME->value]) ? htmlspecialchars(trim($_POST[FormInputs::NAME->value])) : false;
$cf_email_trimmed = trim($_POST[FormInputs::EMAIL->value]);
$cf_subject_clean = htmlspecialchars(trim($_POST[FormInputs::SUBJECT->value]));
$cf_message_clean = htmlspecialchars(trim($_POST[FormInputs::MESSAGE->value]));
$all_input_values = array(
    FormInputs::NAME->value => $cf_name_clean,
    FormInputs::EMAIL->value => $cf_email_trimmed,
    FormInputs::SUBJECT->value => $cf_subject_clean,
    FormInputs::MESSAGE->value => $cf_message_clean
);

$names_of_invalid_inputs = getNamesOfInvalidFormInputs($all_input_values);

if (!empty($names_of_invalid_inputs)) {
    redirectToForm(FormSubmitStatusses::INPUT_INVALID, $names_of_invalid_inputs);
}

$mail_sent = sendMail($all_input_values);

$status = $mail_sent
    ? redirectToForm(FormSubmitStatusses::SUCCESS)
    : redirectToForm(FormSubmitStatusses::MAIL_FAILED, $all_input_values);

function redirectToForm($status, $values = false) {
    setFormStatusCookie($status, $values);
    http_response_code($status->value);
    header("Location: " . getUrlProtocol() . $_SERVER["SERVER_NAME"] . "/#contact");

    exit();
}

function setFormStatusCookie($status, $values) {
    $cookie_key = "cf_s_";

    switch($status) {
        case FormSubmitStatusses::REQUEST_METHOD_INVALID:
            $cookie_key .= "rmi";
            break;

        case FormSubmitStatusses::REQUIRED_INPUT_MISSING:
            $cookie_key .= "rim";
            break;

        case FormSubmitStatusses::INPUT_INVALID:
            $cookie_key .= "ii";
            break;

        case FormSubmitStatusses::MAIL_FAILED:
            $cookie_key .= "mf";
            break;

        default:
            $cookie_key .= "error";
    }

    $cookie_value = empty($values) ? "0" : json_encode($values);
    setcookie($cookie_key, $cookie_value, 0, "/");
}

function getUrlProtocol() {
    $url_protocol =
        isset($_SERVER["HTTPS"]) && ($_SERVER["HTTPS"] == "on" || $_SERVER["HTTPS"] == 1) ||
        isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] == "https"
            ? "https://"
            : "http://";

    return $url_protocol;
}

function getValidationConditionsForInputs($fieldsets) {
    $INPUT_VALIDATION_PROPS = ["required", "minlength", "maxlength", "pattern"];
    $array_of_inputs = array();

    foreach($fieldsets as $fieldset) {
        foreach($fieldset as $field) {
            $input = $field["input"];

            if (isset($input["type"]) && $input["type"] === "submit") continue;

            $input_validation_props_and_values = array();

            foreach($input as $input_prop => $input_prop_value) {
                if (in_array($input_prop, $INPUT_VALIDATION_PROPS)) {
                    $input_validation_props_and_values[$input_prop] = $input_prop_value;
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

function getNamesOfInvalidFormInputs($values) {
    $errors = array();

    foreach($values as $input_for => $input_value) {
        switch($input_for) {
            case FormInputs::NAME;
                if (isset($input_for) && !isValidName($input_value)) {
                    array_push($errors, $input_for);
                }
                break;

            case FormInputs::EMAIL;
                if (!isValidEmailAddress($input_value)) {
                    array_push($errors, $input_for);
                }
                break;

            case FormInputs::SUBJECT;
                if (!isValidSubject($input_value)) {
                    array_push($errors, $input_for);
                }
                break;

            case FormInputs::MESSAGE;
                if (!isValidMessage($input_value)) {
                    array_push($errors, $input_for);
                }
                break;
        }
    }

    return $errors;
}

function isValidEmailAddress($email) {
    // https://stackoverflow.com/a/14075810
    $VALID_EMAIL_RFC5321_REGEX = '/^([-!#-\'*+\/-9=?A-Z^-~]+(\.[-!#-\'*+\/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+$/';

    return preg_match($VALID_EMAIL_RFC5321_REGEX, $email);
}

function isValidName($name) {
    $MIN_LENGTH = 2;

    return $name >= $MIN_LENGTH;
}

function isValidSubject($subject) {
    $MIN_LENGTH = 8;

    return $subject >= $MIN_LENGTH;
}

function isValidMessage($message) {
    $MIN_LENGTH = 12;

    return $message >= $MIN_LENGTH;
}

function sendMail($values) {
    $mail_to = EMAIL_ADDRESS_PERSONAL;
    $mail_subject = "Inzending contactformulier " . WEBSITE_DOMAIN . " van " . $values[FormInputs::EMAIL->value];
    $mail_message = "Het onderstaande bericht is op " . date("j F Y") . " om " . date("H:i:s") . " verstuurd via het contactformulier op " . WEBSITE_DOMAIN . ".\n\nDoor: " . $values[FormInputs::NAME->value] . "\nE-mail adres: " . $values[FormInputs::EMAIL->value] . "\n\n" . $values[FormInputs::SUBJECT->value] . "\n\n " . $values[FormInputs::MESSAGE->value];
    $mail_headers = array(
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $values[FormInputs::EMAIL->value]
    );

    mail($mail_to, $mail_subject, $mail_message, $mail_headers);
}
