<?PHP
// TODO:
// * Check if email is parsed correcly when using $cf_email_clean everywhere.

$REQUIRED_FIEDLS = ["cf-email", "cf-subject", "cf-message"];
$errors = [];

foreach($REQUIRED_FIEDLS as $FIELD) {
    if (empty($_POST[$FIELD])) {
        // Respond with 400
    }
}

$cf_name_clean = isset($_POST["cf-name"]) ? htmlspecialchars(trim($_POST["cf-name"])) : false;
$cf_email_trimmed = trim($_POST["cf-email"]);
$cf_subject_clean = htmlspecialchars(trim($_POST["cf-subject"]));
$cf_message_clean = htmlspecialchars(trim($_POST["cf-message"]));

if (!isValidEmailAddress($cf_email_trimmed)){
    // Push to errors
}

if (strlen($cf_subject_clean) < 8) {
    // Push to errors
}

if (strlen($cf_message_clean) < 12) {
    // Push to errors
}

if (!empty($errors)) {
    // Respond with some error
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

function isValidEmailAddress($email) {
    $VALID_EMAIL_REGEX = "/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/";

    return !!preg_match($VALID_EMAIL_REGEX, $email);
}
