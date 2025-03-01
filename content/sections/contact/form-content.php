<?php
$FORM_ITEMS = [
    [
        [
            "label" => [
                "text" => "My name is",
                "type" => "in_field"
            ],
            "control" => [
                "type" => "text",
                "id" => "name",
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
                "id" => "email",
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
                "id" => "subject",
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
                "id" => "message",
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
                "type" => "text",
                "id" => "simple-maths-captcha",
                "inputmode" => "numeric",
                "required" => "true",
            ]
        ],
        [
            "control" => [
                "text" => "Send",
                "el" => "button",
                "type" => "submit",
                "id" => "submit",
                "class" => "btn btn--submit",
            ]
        ]
    ]
];
