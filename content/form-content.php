<?php
$FORM_ID = "contact-form";
$FORM_ITEMS = [
    [
        [
            "label" => [
                "text" => "My name is",
                "type" => "in_field"
            ],
            "control" => [
                "type" => "text",
                "id" => $FORM_ID . "-name",
                "minlength" => "2",
                "maxlength" => "128",
            ]
        ],
        [
            "label" => [
                "text" => "My email address is",
                "type" => "in_field",
            ],
            "control" => [
                "type" => "email",
                "id" => $FORM_ID . "-email",
                "required" => "true"
            ]
        ],
    ],
    [
        [
            "label" => [
                "text" => "I want to talk about",
                "type" => "in_field",
            ],
            "control" => [
                "type" => "text",
                "id" => $FORM_ID . "-subject",
                "minlength" => "4",
                "maxlength" => "128",
                "required" => "true"
            ]
        ],
        [
            "label" => [
                "text" => "Message",
                "type" => "in_field",
            ],
            "control" => [
                "el" => "textarea",
                "id" => $FORM_ID . "-message",
                "rows" => "8",
                "minlength" => "12",
                "required" => "true"
            ]
        ],
    ],
    [
        [
            "label" => [
                "type" => "inline",
            ],
            "control" => [
                "el" => "button",
                "type" => "button",
                "id" => $FORM_ID . "-simple-maths-captcha-activator",
                "class" => "btn btn--sm",
                "text" => "Load CAPTCHA",
            ]
        ],
        [
            "control" => [
                "el" => "button",
                "type" => "submit",
                "id" => $FORM_ID . "-submit",
                "text" => "Send",
            ]
        ]
    ]
];
