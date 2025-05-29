<?php
$CONTACT_FORM_ID = "contact-form";
$CONTACT_FORM_ITEMS = [
    [
        "legend" => "Sender information",
        [
            "label" => [
                "type" => "in_field",
                "text" => "Name",
            ],
            "control" => [
                "type" => "text",
                "id" => $CONTACT_FORM_ID . "-name",
                "minlength" => "2",
                "maxlength" => "128",
            ],
        ],
        [
            "label" => [
                "type" => "in_field",
                "text" => "Email address",
            ],
            "control" => [
                "type" => "email",
                "id" => $CONTACT_FORM_ID . "-email",
                "required" => "required",
            ],
        ],
    ],
    [
        "legend" => "Subject matter",
        [
            "label" => [
                "type" => "in_field",
                "text" => "Subject",
            ],
            "control" => [
                "type" => "text",
                "id" => $CONTACT_FORM_ID . "-subject",
                "minlength" => "4",
                "maxlength" => "128",
                "required" => "required",
            ],
        ],
        [
            "label" => [
                "type" => "in_field",
                "text" => "Message",
            ],
            "control" => [
                "el" => "textarea",
                "id" => $CONTACT_FORM_ID . "-message",
                "rows" => "8",
                "minlength" => "12",
                "required" => "required",
            ],
        ],
    ],
    [
        "legend" => "Form submission",
        [
            "label" => [
                "type" => "inline",
            ],
            "control" => [
                "el" => "button",
                "type" => "button",
                "id" => $CONTACT_FORM_ID . "-simple-maths-captcha-activator",
                "class" => "btn btn--sm",
                "data-required" => "true",
                "text" => "Load CAPTCHA",
            ],
        ],
        [
            "control" => [
                "el" => "button",
                "type" => "submit",
                "id" => $CONTACT_FORM_ID . "-submit",
                "text" => "Send",
            ],
        ],
    ],
];
