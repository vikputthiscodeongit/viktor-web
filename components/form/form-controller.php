<?PHP
enum FormSubmitStatusses {
    case REQUEST_METHOD_INVALID;
    case INPUT_MISSING;
    case INPUT_INVALID;
    case MAIL_FAILED;
    case SUCCESS;
}

$server_protocol = "http://";

if (isset($_SERVER["HTTPS"]) && ($_SERVER["HTTPS"] == "on" || $_SERVER["HTTPS"] == 1) ||
    isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] == "https") {
  $server_protocol = "https://";
}

// Check if this is a POST request
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $query_string = makeStatusQueryString(FormSubmitStatusses::REQUEST_METHOD_INVALID);

    http_response_code(405);
    header("Location: " . $server_protocol . $_SERVER["SERVER_NAME"] . "/#contact?" . $query_string);
    exit();
}

// Check if all required values are set
$REQUIRED_VALUES = array(
    "email" => "cf-email",
    "subject" => "cf-subject",
    "message" => "cf-message"
);

$errors = getMissingRequiredFormValues($REQUIRED_VALUES);

if (!empty($errors)) {
    $query_string = makeStatusQueryString(FormSubmitStatusses::INPUT_MISSING, $errors);

    http_response_code(400);
    header("Location: " . $server_protocol . $_SERVER["SERVER_NAME"] . "/#contact?" . $query_string);
    exit();
}

// Sanitize values
$cf_name_clean = isset($_POST["cf-name"]) ? htmlspecialchars(trim($_POST["cf-name"])) : false;
$cf_email_trimmed = trim($_POST["cf-email"]);
$cf_subject_clean = htmlspecialchars(trim($_POST["cf-subject"]));
$cf_message_clean = htmlspecialchars(trim($_POST["cf-message"]));
$all_values = array(
    "name" => $cf_name_clean,
    "email" => $cf_email_trimmed,
    "subject" => $cf_subject_clean,
    "message" => $cf_message_clean
);

// Check if all values are valid
$errors = getInvalidFormValues($all_values);

if (!empty($errors)) {
    $query_string = makeStatusQueryString(FormSubmitStatusses::INPUT_INVALID, $errors);

    http_response_code(422);
    header("Location: " . $server_protocol . $_SERVER["SERVER_NAME"] . "/#contact?" . $query_string);
    exit();
}

// Send email
$mail_sent = sendMail($all_values);

$query_string = $mail_sent
    ? makeStatusQueryString(FormSubmitStatusses::SUCCESS)
    : makeStatusQueryString(FormSubmitStatusses::MAIL_FAILED);

http_response_code(303);
header("Location: " . $server_protocol . $_SERVER["SERVER_NAME"] . "/#contact?" . $query_string);
exit();

function makeStatusQueryString($status, $errors = []) {
    $status_string = "status=";

    switch($status) {
        case FormSubmitStatusses::INPUT_MISSING:
            $status_string .= "input_missing";
            break;

        case FormSubmitStatusses::INPUT_INVALID:
            $status_string .= "input_invalid";
            break;

        case FormSubmitStatusses::MAIL_FAILED:
            $status_string .= "mail_failed";
            break;

        case FormSubmitStatusses::SUCCESS:
            $status_string .= "success";
            break;

        default:
            $status_string .= "unknown_error";
    }

    if ($errors) {
        $status_string .= "&";

        foreach($errors as $error) {
            $status_string .= $error;

            if ($error !== array_key_last($errors)) {
                $status_string .= ",";
            }
        }
    }

    return $status_string;
}

function getMissingRequiredFormValues($values) {
    $errors = array();

    foreach($values as $key => $value) {
        if (empty($_POST[$value])) {
            array_push($errors, $key);
        }
    }

    return $errors;
}

function getInvalidFormValues($values) {
    $errors = array();

    foreach($values as $key => $value) {
        switch($key) {
            case "name";
                if ($value && !isValidName($value)) {
                    array_push($errors, $key);
                }
                break;

            case "email";
                if (!isValidEmailAddress($value)) {
                    array_push($errors, $key);
                }
                break;

            case "subject";
                if (!isValidSubject($value)) {
                    array_push($errors, $key);
                }
                break;

            case "message";
                if (!isValidMessage($value)) {
                    array_push($errors, $key);
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
    $mail_to = "mail@viktorchin.nl";
    $mail_subject = "Inzending contactformulier viktorchin.nl van " . $values["email"];
    $mail_message = "Het onderstaande bericht is op " . date("jFY") . " om " . date("His") . " verstuurd via het contactformulier op viktorchin.nl.\n\nDoor: " . $values["name"] . "\nE-mail adres: " . $values["email"] . "\n\n" . $values["subject"] . "\n\n " . $values["message"];
    $mail_headers = array(
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => "webmaster@viktorchin.nl",
        "Reply-To" => $values["email"]
    );

    mail($mail_to, $mail_subject, $mail_message, $mail_headers);
}
