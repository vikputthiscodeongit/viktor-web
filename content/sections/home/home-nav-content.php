<?php
$NAVIGATION = [
    "el" => "nav",
    "attrs" => [
        "class" => "home-nav",
    ],
    "children" => [
        "items" => [
            "el" => "ul",
            "attrs" => [
                "class" => "home-nav__items"
            ],
            "children" => [
                "contact" => [
                    "el" => "li",
                    "attrs" => [
                        "class" => "home-nav__item"
                    ],
                    "children" => [
                        "link" => [
                            "el" => "a",
                            "attrs" => [
                                "class" => "home-nav__link",
                                "href" => "#contact",
                                "target" => "_self",
                            ],
                            "text_content" => "Contact"
                        ]
                    ]
                ]
            ]
        ],
    ]
];
