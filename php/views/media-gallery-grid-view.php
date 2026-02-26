<?php
function createImageEl($post_data, $media_dir_uri)
{
    $media_data = array_find($post_data->media_thumbnails, function ($item) {
        return $item->width === 240;
    });
    return [
        "src" => $media_dir_uri . "/thumbnails/" . $media_data->file_name,
        "alt" => "Gallery posted on " . new IntlDateFormatter(
            "en_US",
            IntlDateFormatter::FULL,
            IntlDateFormatter::FULL,
            "UTC",
            IntlDateFormatter::GREGORIAN,
            "EEEE, MMMM d, yyyy"
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
        "class" => "media-grid",
    ],
    "children" => [],
];

foreach ($posts_data as $post_data) {
    $grid_item_el = [
        "el" => "li",
        "attrs" => [
            "class" => "media-grid__item",
        ],
        "children" => [
            [
                "el" => "a",
                "attrs" => [
                    "href" => "https://www.instagram.com/p/" . $post_data->shortcode . "/",
                    "target" => "_blank",
                    "rel" => "noopener",
                    "data-post-shortcode" => $post_data->shortcode,
                ],
                "children" => [
                    [
                        "el" => "img",
                        "attrs" => createImageEl($post_data, $data_dir_uri . "/media/" . $post_data->shortcode),
                    ]
                ],
            ]
        ],
    ];
    array_push($grid_el["children"], $grid_item_el);
}

echo renderHtmlFromArray($grid_el);
