<?php
$CONTACT_FORM_NAME = "contact-form";
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
                "id" => $CONTACT_FORM_NAME . "-name",
                "minlength" => 2,
                "maxlength" => 128,
            ],
        ],
        [
            "label" => [
                "type" => "in_field",
                "text" => "Email address",
            ],
            "control" => [
                "type" => "email",
                "id" => $CONTACT_FORM_NAME . "-email",
                "required" => true,
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
                "id" => $CONTACT_FORM_NAME . "-subject",
                "minlength" => 4,
                "maxlength" => 128,
                "required" => true,
            ],
        ],
        [
            "label" => [
                "type" => "in_field",
                "text" => "Message",
            ],
            "control" => [
                "el" => "textarea",
                "id" => $CONTACT_FORM_NAME . "-message",
                "rows" => 8,
                "minlength" => 12,
                "required" => true,
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
                "id" => $CONTACT_FORM_NAME . "-simple-maths-captcha-activator",
                "class" => "btn btn--sm",
                "required" => true,
                "text" => "Load CAPTCHA",
            ],
        ],
        [
            "control" => [
                "el" => "button",
                "type" => "submit",
                "id" => $CONTACT_FORM_NAME . "-submit",
                "text" => "Send",
            ],
        ],
    ],
];
