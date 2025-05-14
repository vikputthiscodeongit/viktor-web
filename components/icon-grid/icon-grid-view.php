<?php
include_once ROOT_DIR . "/helpers/php/render-html-el.php";
include ROOT_DIR . "/content/icon-grid-content.php";

$icon_grid_el = [
    "el" => "ul",
    "attrs" => [
        "class" => "item-grid",
    ],
    "children" => []
];

$group_index = 0;
$list_icon_el_groups = [];

foreach ($ICON_GRID_ITEMS as $ICON_SET) {
    $i = 0;
    $list_icon_el_group = [];

    foreach ($ICON_SET as $ICON) {
        $el_class = "icon item";

        if ($group_index > 0 && $i === 0) {
            $el_class .= " item--shift-right";
        }

        $el = [
            "el" => "li",
            "attrs" => [
                "class" => $el_class
            ],
            "children" => [
                "link" => [
                    "el" => "a",
                    "attrs" => [
                        "href" => $ICON["url"],
                        "target" => "_blank",
                        "rel" => "noopener",
                    ],
                    "children" => [
                        "image" => [
                            "el" => "img",
                            "attrs" => [
                                "src" => $ICON["icon_uri"],
                                "alt" => $ICON["name"]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        array_push($list_icon_el_group, $el);

        $i++;
    }

    array_push($list_icon_el_groups, $list_icon_el_group);

    $group_index++;
}

$icon_grid_el["children"] = array_merge([], ...$list_icon_el_groups);

echo renderHtmlFromArray($icon_grid_el);
