<?php
$FORM = [
    "el" => "form",
    "attrs" => [
        "method" => "POST",
        "class" => "form form--contact js-required js-auto-enable",
        "name" => "contact-form",
    ],
    "children" => [
        "personal" => [
            "el" => "fieldset",
            "children" => [
                "name" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field field--ifl",
                    ],
                    "children" => [
                        "label" => [
                            "el" => "label",
                            "text_content" => "My name is"
                        ],
                        "input" => [
                            "el" => "input",
                            "attrs" => [
                                "type" => "text",
                                "id" => "name",
                                "minlength" => "2",
                                "maxlength" => "128",
                            ]
                        ]
                    ]
                ],
                "email" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field field--ifl",
                    ],
                    "children" => [
                        "label" => [
                            "el" => "label",
                            "text_content" => "My email address is"
                        ],
                        "input" => [
                            "el" => "input",
                            "attrs" => [
                                "type" => "email",
                                "id" => "email",
                                "required" => true
                            ]
                        ]
                    ]
                ]
            ]
        ],
        "message" => [
            "el" => "fieldset",
            "children" => [
                "subject" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field field--ifl",
                    ],
                    "children" => [
                        "label" => [
                            "el" => "label",
                            "text_content" => "I want to talk about"
                        ],
                        "input" => [
                            "el" => "input",
                            "attrs" => [
                                "type" => "text",
                                "id" => "subject",
                                "minlength" => "4",
                                "maxlength" => "128",
                                "required" => true
                            ]
                        ]
                    ]
                ],
                "message" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field field--ifl",
                    ],
                    "children" => [
                        "label" => [
                            "el" => "label",
                            "text_content" => "Message"
                        ],
                        "input" => [
                            "el" => "textarea",
                            "attrs" => [
                                "id" => "message",
                                "rows" => "8",
                                "minlength" => "12",
                                "required" => true
                            ]
                        ]
                    ]
                ]

            ],
        ],
        "submit" => [
            "el" => "fieldset",
            "children" => [
                "simple-maths-captcha" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field field--inline js-required",
                    ],
                    "children" => [
                        "input" => [
                            "el" => "input",
                            "attrs" => [
                                "type" => "text",
                                "id" => "simple-maths-captcha",
                                "inputmode" => "numeric",
                                "required" => true,
                            ]
                        ]
                    ]
                ],
                "submit" => [
                    "el" => "div",
                    "attrs" => [
                        "class" => "field",
                    ],
                    "children" => [
                        "button" => [
                            "el" => "button",
                            "attrs" => [
                                "type" => "submit",
                                "id" => "submit",
                                "class" => "btn btn--submit",
                            ],
                            "text_content" => "Send"
                        ]
                    ]
                ]
            ]
        ]
    ]
];
