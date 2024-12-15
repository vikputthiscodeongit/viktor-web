<?php
// TODO: Use RFC-compliant RegEx for email input pattern.
$FORM = [
    "method" => "POST",
    "class" => "form form--contact js-required js-auto-enable",
    "name" => "contact-form",
    "fieldsets" => [
        "fs_personal" => [
            "fields" => [
                "field_name" => [
                    "class" => "field field--ifl",
                    "label" => [
                        "label" => "My name is"
                    ],
                    "input" => [
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-name",
                        "minlength" => "2",
                        "maxlength" => "128",
                        // "placeholder" => "Jason Green"
                    ]
                ],
                "field_email" => [
                    "class" => "field field--ifl",
                    "label" => [
                        "label" => "My email address is"
                    ],
                    "input" => [
                        "el" => "input",
                        "type" => "email",
                        "id" => "cf-email",
                        // "placeholder" => "j.green@example.com",
                        "required" => true
                    ]
                ]
            ]
        ],
        "fs_message" => [
            "fields" => [
                "field_subject" => [
                    "class" => "field field--ifl",
                    "label" => [
                        "label" => "I want to talk about"
                    ],
                    "input" => [
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-subject",
                        "minlength" => "4",
                        "maxlength" => "128",
                        // "placeholder" => "Some work of yours that I came across",
                        "required" => true
                    ]
                ],
                "field_message" => [
                    "class" => "field field--ifl",
                    "label" => [
                        "label" => "Message"
                    ],
                    "input" => [
                        "el" => "textarea",
                        "id" => "cf-message",
                        "rows" => "8",
                        "minlength" => "12",
                        // "placeholder" => "Hey man, how are you doing? Last week I was browsing the web when ...",
                        "required" => true
                    ]
                ]
            ]
        ],
        "fs_submit" => [
            "fields" => [
                "field_mc" => [
                    "class" => "field field--inline js-required",
                    "input" => [
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-form-mc",
                        // TODO: Remove this property - all other inputs have their ID assigned as name.
                        "name" => "cf-form-mc",
                        "inputmode" => "numeric",
                        "required" => true,
                    ]
                ],
                "field_submit" => [
                    "input" => [
                        "el" => "button",
                        "type" => "submit",
                        "id" => "cf-submit",
                        "class" => "btn btn--submit",
                        "text_content" => "Send"
                    ]
                ]
            ]
        ]
    ]
];
