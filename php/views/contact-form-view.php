<?php
require_once ROOT_DIR . "/php/helpers/render-html-el.php";
require ROOT_DIR . "/content/contact-form-content.php";

$form_el = [
    "el" => "form",
    "attrs" => [
        "method" => "POST",
        "class" => "has-overlay js-required",
        "id" => $CONTACT_FORM_NAME,
        "name" => $CONTACT_FORM_NAME,
    ],
    "children" => [],
];

foreach ($CONTACT_FORM_ITEMS as $FIELDSET) {
    $fieldset_el = [
        "el" => "fieldset",
        "attrs" => [
            "disabled" => "disabled",
        ],
        "children" => [],
    ];

    foreach ($FIELDSET as $KEY => $ITEM) {
        if ($KEY === "legend") {
            $legend_el = [
                "el" => "legend",
                "attrs" => [
                    "class" => "visually-hidden",
                ],
                "text" => $ITEM,
            ];

            array_push($fieldset_el["children"], $legend_el);

            continue;
        }

        $field_el_class = "field";

        if (isset($ITEM["label"]["type"])) {
            switch ($ITEM["label"]["type"]) {
                case "in_field":
                    $field_el_class .= " field--ifl";
                    break;

                case "inline":
                    $field_el_class .= " field--inline";
                    break;
            }
        }

        $field_el = [
            "el" => "div",
            "attrs" => [
                "class" => $field_el_class,
            ],
            "children" => [],
        ];

        $field_el_children = [];

        $label_el = null;

        if (isset($ITEM["label"]["text"])) {
            $label_el = [
                "el" => "label",
                "attrs" => [
                    "for" => $ITEM["control"]["id"],
                ],
                "text" => $ITEM["label"]["text"],
            ];

            array_push($field_el_children, $label_el);
        }

        $input_el = [
            "el" => $ITEM["control"]["el"] ?? "input",
            "attrs" => array_filter($ITEM["control"], function ($attr) {
                return $attr !== "el";
            }, ARRAY_FILTER_USE_KEY),
        ];
        $input_el["attrs"]["id"] = $input_el["attrs"]["id"];
        $input_el["attrs"]["name"] = $ITEM["control"]["id"];

        if (isset($ITEM["control"]["text"])) {
            $input_el["text"] = $ITEM["control"]["text"];
        }

        array_push($field_el_children, $input_el);

        if (!isset($ITEM["control"]["type"]) || $ITEM["control"]["type"] !== "submit") {
            $message_el = [
                "el" => "span",
                "attrs" => [
                    "class" => "field__message",
                ],
            ];

            array_push($field_el_children, $message_el);
        }

        $field_el["children"] = $field_el_children;

        array_push($fieldset_el["children"], $field_el);
    }

    array_push($form_el["children"], $fieldset_el);
}

echo renderHtmlFromArray($form_el);
