<?php
require ROOT_DIR . "/content/social-icons-content.php";

$icon_grid_el = [
    "el" => "ul",
    "attrs" => [
        "class" => "icon-grid",
    ],
    "children" => [],
];

$group_index = 0;

foreach ($SOCIAL_ICONS_ITEMS as $ITEM_SET) {
    $i = 0;

    foreach ($ITEM_SET as $ITEM) {
        $el_class = "icon";

        if ($group_index > 0 && $i === 0) {
            $el_class .= " icon--shift-right";
        }

        $el = [
            "el" => "li",
            "attrs" => [
                "class" => $el_class,
            ],
            "children" => [
                [
                    "el" => "a",
                    "attrs" => [
                        "href" => $ITEM["url"],
                        "target" => "_blank",
                        "rel" => $ITEM["link_rel"],
                    ],
                    "children" => [
                        [
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
        array_push($icon_grid_el["children"], $el);

        $i++;
    }

    $group_index++;
}

echo renderHtmlFromArray($icon_grid_el);
