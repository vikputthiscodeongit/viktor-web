<?php
include_once ROOT_DIR . "/helpers/php/render-html-el.php";
include ROOT_DIR . "/content/home-nav-content.php";

$navigation_el = [
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
            "children" => []
        ],
    ]
];

$list_item_els = [];

foreach ($NAVIGATION_ITEMS as $ITEM) {
    $el = [
        "el" => "li",
        "attrs" => [
            "class" => "home-nav__item"
        ],
        "children" => [
            "link" => [
                "el" => "a",
                "attrs" => [
                    "class" => "home-nav__link",
                    "href" => $ITEM["id"],
                    "target" => "_self",
                ],
                "text" => $ITEM["name"]
            ]
        ]
    ];

    array_push($list_item_els, $el);
}

$navigation_el["children"]["items"]["children"] = $list_item_els;

echo renderHtmlFromArray($navigation_el);
