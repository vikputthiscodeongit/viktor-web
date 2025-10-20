<?php
// TODO:
// * Set $_SESSION variable with form data hash on successful submit. Reject
// next submission if hash hasn't changed.

require_once __DIR__ . "/../../global.php";
require_once ROOT_DIR . "/session.php";
require_once ROOT_DIR . "/_folder/values.php";
require_once ROOT_DIR . "/php/helpers/return-http-response.php";
require_once ROOT_DIR . "/php/controllers/form-controller.php";
require_once ROOT_DIR . "/content/contact-form-content.php";

function sendMail($form_values)
{
    $submitter_email_address = null;
    $submitter_name = "een bezoeker";
    $message_subject = null;
    $message_content = null;

    foreach ($form_values as $form_control_name => $form_control_value) {
        if ($form_control_value === "") continue;

        switch ($form_control_name) {
            case str_ends_with($form_control_name, "email"):
                $submitter_email_address = $form_control_value;
                break;
            case str_ends_with($form_control_name, "name"):
                $submitter_name = $form_control_value;
                break;
            case str_ends_with($form_control_name, "subject"):
                $message_subject = $form_control_value;
                break;
            case str_ends_with($form_control_name, "message"):
                $message_content = $form_control_value;
                break;
        }
    }

    if (is_null($submitter_email_address)) {
        return false;
    }

    $date_formatter_nl = datefmt_create(
        "nl_NL",
        IntlDateFormatter::FULL,
        IntlDateFormatter::FULL,
        "Europe/Amsterdam",
        IntlDateFormatter::GREGORIAN,
        "EEEE d MMMM YYYY"
    );

    $mail_subject = "Formulierinzending van " . $submitter_email_address;
    $mail_message = sprintf(
        'Het onderstaande bericht is door %1$s op %2$s om %3$s verstuurd.' . "\r\n\r\n" . '%4$s' . "\r\n\r\n" . '%5$s',
        $submitter_name,
        datefmt_format($date_formatter_nl, time()),
        date("H:i:s"),
        $message_subject,
        $message_content
    );
    $mail_headers = [
        "Content-Type" => "text/plain; charset=utf-8",
        "From" => EMAIL_ADDRESS_WEBMASTER,
        "Reply-To" => $submitter_email_address
    ];

    $mail_sent = mail(EMAIL_ADDRESS_PERSONAL, $mail_subject, $mail_message, $mail_headers);

    return $mail_sent;
}

function requestHandler($form_items)
{
    try {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            returnHttpResponse(HttpStatus::METHOD_NOT_ALLOWED, null, [["Allow" => "POST"]]);
        }

        $clean_form_data = sanitizeFormData($_POST);
        // var_dump($clean_form_data);

        $form_controls_attrs = getFormControlsAttributesFromFormItems($form_items);
        // var_dump($form_controls_attrs);

        $validated_form_data = validateFormData($form_controls_attrs, $clean_form_data);
        // var_dump($validated_form_data);

        $invalid_form_controls = getFormControlsErrors($validated_form_data);
        // var_dump($invalid_form_controls);

        if (count($invalid_form_controls) > 0) {
            returnHttpResponse(HttpStatus::UNPROCESSABLE_CONTENT, [
                "message" => "One or more fields failed validation.",
                // Use array_values() because of https://www.php.net/manual/en/function.json-encode.php#129803
                "invalid_form_controls" => array_values($invalid_form_controls)
            ]);
        }

        $mail_sent = sendMail($clean_form_data);

        $mail_sent
            ? returnHttpResponse(HttpStatus::NO_CONTENT)
            : returnHttpResponse(HttpStatus::BAD_GATEWAY);
    } catch (\Throwable $th) {
        // var_dump($th);
        returnHttpResponse(HttpStatus::INTERNAL_SERVER_ERROR);
    }
}

requestHandler($CONTACT_FORM_ITEMS);
