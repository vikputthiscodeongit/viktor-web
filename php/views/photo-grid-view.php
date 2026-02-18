<?php
function getImageEl($post_data, $media_dir_uri)
{
    $media_data = array_find($post_data->media_thumbnails, function ($item) {
        return $item->width === 240;
    });
    return [
        "src" => $media_dir_uri . "/thumbnails/" . $media_data->file_name,
        "alt" => "Photo gallery posted on " . new IntlDateFormatter(
            "en_US",
            IntlDateFormatter::FULL,
            IntlDateFormatter::FULL,
            null,
            IntlDateFormatter::GREGORIAN,
            "EEEE, d MMMM yyyy"
        )->format($post_data->date),
        "width" => $media_data->width,
        "height" => $media_data->height,
    ];
}

$data_dir_uri = "/public/instagram";
$posts_data_cache_uri = ROOT_DIR . $data_dir_uri . "/posts.json";
$posts_data = file_exists($posts_data_cache_uri)
    ? json_decode(file_get_contents($posts_data_cache_uri))->posts
    : [];

$grid_el = [
    "el" => "ul",
    "attrs" => [
        "class" => "photo-grid",
    ],
    "children" => [],
];

foreach ($posts_data as $id => $post_data) {
    $grid_item_el = [
        "el" => "li",
        "attrs" => [
            "class" => "photo",
        ],
        "children" => [
            [
                "el" => "a",
                "attrs" => [
                    "href" => "https://www.instagram.com/p/" . $id . "/",
                    "target" => "_blank",
                    "rel" => "noopener",
                    "data-photo-dialog-trigger" => "true",
                ],
                "children" => [
                    [
                        "el" => "img",
                        "attrs" => getImageEl($post_data, $data_dir_uri . "/media/" . $id),
                    ]
                ],
            ]
        ],
    ];
    array_push($grid_el["children"], $grid_item_el);
}

echo renderHtmlFromArray($grid_el);
