<?PHP
//
// TODO:
// * Set $_SESSION variable with form data hash on succesful submit.
//   Compare on next submit. If equal > reject.
//



include __DIR__ . "/../../admin/global.php";
include __DIR__ . "/../../admin/not-dotenv.php";
// include __DIR__ . "/../form-mc/form-mc-validator.php";
include __DIR__ . "/../../helpers/php/return-http-response.php";
include "form-content.php";

enum FormInput: string {
    case NAME = "cf-name";
    case EMAIL = "cf-email";
    case SUBJECT = "cf-subject";
    // case MC = "cf-mc";
    case MESSAGE = "cf-message";
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    returnHttpResponse(StatusCode::REQUEST_METHOD_INVALID);
}

$input_array = getInputElArray($FORM["fieldsets"]);
// var_dump($input_array);

$validation_conditions_per_input = getValidationConditionsOfInputs($input_array);
// var_dump($validation_conditions_per_input);

$inputs_and_values = getSanitizedInputsAndValues();
// var_dump($inputs_and_values);

$invalid_inputs = getInvalidInputs($inputs_and_values, $validation_conditions_per_input);
// var_dump($invalid_inputs);

if (!empty($invalid_inputs)) {
    returnHttpResponse(StatusCode::INPUT_INVALID, ...["data" => $invalid_inputs]);
}

$mail_sent = sendMail($inputs_and_values);

$status = $mail_sent
    ? returnHttpResponse(StatusCode::SUCCESS)
    : returnHttpResponse(StatusCode::MAIL_FAILED, ...["data" => $inputs_and_values]);

returnHttpResponse(StatusCode::UNKNOWN_ERROR);

function getInputElArray($fieldsets) {
    $input_array = [];

    foreach(array_values($fieldsets) as $entry) {
        foreach($entry as $key => $value) {
            if ($key !== "fields") continue;

            foreach($value as $field) {
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
                // TODO: Dit kan beter.
                if (
                    $input_prop === "type" && $input_prop_value === "email"
                    // $input_prop === "id" && $input_prop_value === FormInput::MC->value
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

function getSanitizedInputsAndValues() {
    $inputs_and_values = [];

    foreach (FormInput::cases() as $input_name) {
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
    $invalid_inputs = array();

    foreach($inputs_and_values as $input_name => $input_value) {
        $condition_passed = null;

        if (is_null($input_value)) {
            if (in_array("required", $validation_conditions_per_input[$input_name])) {
                $condition_passed = false;
            } else {
                continue;
            }
        }

        foreach($validation_conditions_per_input[$input_name] as $condition_key => $condition_value) {
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

                // case "mc":
                //     $condition_passed = isValidProblem($input_value);
                //     break;

                default:
                    $condition_passed = false;
            }
        }

        if ($condition_passed === false) {
            $invalid_inputs[$input_name] = false;
        }
    }

    return $invalid_inputs;
}

function isValidEmailAddress($email) {
    // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
    $REGEX = "/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";

    return preg_match($REGEX, $email) === 1;
}

function sendMail($values) {
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
    $mail_headers = array(
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $values[FormInput::EMAIL->value]
    );

    mail($mail_to, $mail_subject, $mail_message, $mail_headers);
}
