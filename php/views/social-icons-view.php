<?php
require_once ROOT_DIR . "/php/helpers/render-html-el.php";
require ROOT_DIR . "/content/social-icons-content.php";

$icon_grid_el = [
    "el" => "ul",
    "attrs" => [
        "class" => "item-grid",
    ],
    "children" => [],
];

$group_index = 0;
$list_icon_el_groups = [];

foreach ($SOCIAL_ICONS_ITEMS as $ITEM_SET) {
    $i = 0;
    $list_icon_el_group = [];

    foreach ($ITEM_SET as $ITEM) {
        $el_class = "icon item";

        if ($group_index > 0 && $i === 0) {
            $el_class .= " item--shift-right";
        }

        $el = [
            "el" => "li",
            "attrs" => [
                "class" => $el_class,
            ],
            "children" => [
                "link" => [
                    "el" => "a",
                    "attrs" => [
                        "href" => $ITEM["url"],
                        "target" => "_blank",
                        "rel" => $ITEM["link_rel"],
                    ],
                    "children" => [
                        "image" => [
                            "el" => "img",
                            "attrs" => [
                                "src" => $ITEM["icon_uri"],
                                "alt" => $ITEM["name"],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        array_push($list_icon_el_group, $el);

        $i++;
    }

    array_push($list_icon_el_groups, $list_icon_el_group);

    $group_index++;
}

$icon_grid_el["children"] = array_merge([], ...$list_icon_el_groups);

echo renderHtmlFromArray($icon_grid_el);
