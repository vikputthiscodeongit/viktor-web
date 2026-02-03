<?php
require_once ROOT_DIR . "/php/helpers/render-html-el.php";
require ROOT_DIR . "/content/nav-content.php";

$navigation_el = [
    "el" => "nav",
    "attrs" => [
        "class" => "nav",
    ],
    "children" => [
        [
            "el" => "ul",
            "attrs" => [
                "class" => "nav__items",
            ],
            "children" => [],
        ],
    ],
];
$navigation_item_list = [
    "el" => "ul",
    "attrs" => [
        "class" => "nav__items",
    ],
    "children" => [],
];

foreach ($NAVIGATION_ITEMS as $ITEM) {
    $el = [
        "el" => "li",
        "attrs" => [
            "class" => "nav__item",
        ],
        "children" => [
            [
                "el" => "a",
                "attrs" => [
                    "class" => "nav__link",
                    "href" => $ITEM["id"],
                    "target" => "_self",
                ],
                "text" => $ITEM["name"],
            ],
        ],
    ];
    array_push($navigation_item_list["children"], $el);
}

array_push($navigation_el["children"], $navigation_item_list);

echo renderHtmlFromArray($navigation_el);
