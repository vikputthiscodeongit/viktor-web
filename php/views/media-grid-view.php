<?php
function createImageEl(object $post_data, string $media_dir_uri)
{
    $target_width = 240;
    $media_data = array_find($post_data->media_thumbnails, function ($item) use ($target_width) {
        return $item->width === $target_width;
    });

    return [
        "src" => $media_dir_uri . "/" . $media_data->file_name,
        "alt" => "Gallery posted on " . new IntlDateFormatter(
            "en_US",
            IntlDateFormatter::FULL,
            IntlDateFormatter::FULL,
            // Using UTC instead of the client's timezone may produce an inaccurate date.
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
