<?PHP
enum FormSubmissionStatusses {
    case INPUT_MISSING;
    case INPUT_INVALID;
}

$REQUIRED_INPUTS = ["cf-email", "cf-subject", "cf-message"];
$errors = [];

foreach($REQUIRED_INPUTS as $INPUT) {
    if (empty($_POST[$INPUT])) {
        array_push($errors, $INPUT);
    }
}

if (!empty($errors)) {
    $query_string = makeStatusQueryString(FormSubmissionStatusses::INPUT_MISSING, $errors);

    http_response_code(400);
    header("Location: https://www." . $_SERVER["HTTP_HOST"] . "/#contact?" . $query_string);
}

$cf_name_clean = isset($_POST["cf-name"]) ? htmlspecialchars(trim($_POST["cf-name"])) : false;
$cf_email_trimmed = trim($_POST["cf-email"]);
$cf_subject_clean = htmlspecialchars(trim($_POST["cf-subject"]));
$cf_message_clean = htmlspecialchars(trim($_POST["cf-message"]));

// isValidForm(array of contact form inputs)

if ($cf_name_clean && !isValidName($cf_name_clean)) {
    array_push($errors, "cf-name");
}

if (!isValidEmailAddress($cf_email_trimmed)) {
    array_push($errors, "cf-email");
}

if (!isValidSubject($cf_subject_clean)) {
    array_push($errors, "cf-subject");
}

if (!isValidMessage($cf_message_clean)) {
    array_push($errors, "cf-message");
}

if (!empty($errors)) {
    $query_string = makeStatusQueryString(FormSubmissionStatusses::INPUT_INVALID, $errors);

    http_response_code(422);
    header("Location: https://www." . $_SERVER["HTTP_HOST"] . "/#contact?" . $query_string);
}

$cf_email_clean = htmlspecialchars($cf_email_trimmed);

$mail_to = "mail@viktorchin.nl";
$mail_subject = "Inzending contactformulier viktorchin.nl van " . $cf_email_clean;
$mail_message = "Het onderstaande bericht is op " . date("jFY") . " om " . date("His") . " verstuurd via het contactformulier op viktorchin.nl.\n\n$cf_message_clean";
$mail_headers = array(
    "Content-Type" => "text/plain; charset=utf-8",
    "From" => "webmaster@viktorchin.nl",
    "Reply-To" => $cf_email_trimmed
);

mail($mail_to, $mail_subject, $mail_message, $mail_headers);

// Respond with 303
http_response_code(303);
header("Location: https://www." . $_SERVER["HTTP_HOST"] . "/#contact?status=success");

function isValidForm($input_values) {
    // Code
}

function isValidEmailAddress($email) {
    $VALID_EMAIL_REGEX = "/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/";

    return preg_match($VALID_EMAIL_REGEX, $email);
}

function isValidName($name) {
    $MIN_LENGTH = 2;

    return $name >= $MIN_LENGTH;
}

function isValidSubject($subject) {
    $MIN_LENGTH = 8;

    return $subject >= 8;
}

function isValidMessage($message) {
    $MIN_LENGTH = 12;

    return $message >= $MIN_LENGTH;
}

function makeStatusQueryString($status, $errors) {
    $status_string = "status=";

    switch($status) {
        case FormSubmissionStatusses::SUCCESS:
            $status_string .= "success";
            break;

        case FormSubmissionStatusses::INPUT_MISSING:
            $status_string .= "input_missing";
            break;

        case FormSubmissionStatusses::INPUT_INVALID:
            $status_string .= "input_invalid";
            break;

        default:
            $status_string .= "unknown_error";
    }

    if ($errors) {
        foreach($errors as $error) {
            $status_string .= $error . ",";

            if ($error === array_key_last($errors)) {
                $status_string = substr($string, 0, -1);
            }
        }
    }

    return $status_string;
}
