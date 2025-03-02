<?php
include_once ROOT_DIR . "/helpers/php/render-html-el.php";
include ROOT_DIR . "/content/sections/contact/form-content.php";

$form_el = [
    "el" => "form",
    "attrs" => [
        "method" => "POST",
        "class" => "form form--contact has-overlay js-required",
        "name" => "contact-form",
    ],
    "children" => []
];

foreach ($FORM_ITEMS as $FIELDSET) {
    $fieldset_el = [
        "el" => "fieldset",
        "attrs" => [
            "disabled" => "disabled"
        ],
        "children" => []
    ];

    foreach ($FIELDSET as $FIELD) {
        $field_el_class = "field";

        if (isset($FIELD["label"]["type"])) {
            switch ($FIELD["label"]["type"]) {
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
            "children" => []
        ];

        $field_el_children = [];

        $label_el = null;

        if (isset($FIELD["label"]["text"])) {
            $label_el = [
                "el" => "label",
                "text" => $FIELD["label"]["text"]
            ];

            array_push($field_el_children, $label_el);
        }

        $input_el = [
            "el" => isset($FIELD["control"]["el"]) ? $FIELD["control"]["el"] : "input",
            "attrs" => array_filter($FIELD["control"], function ($attr) {
                return $attr !== "el";
            }),
        ];
        $input_el["attrs"]["id"] = $form_el["attrs"]["name"] . "-" . $input_el["attrs"]["id"];
        $input_el["attrs"]["name"] = $form_el["attrs"]["name"] . "-" . $FIELD["control"]["id"];

        if (isset($FIELD["control"]["text"])) {
            $input_el["text"] = $FIELD["control"]["text"];
        }

        array_push($field_el_children, $input_el);

        if ($input_el["el"] !== "button") {
            $message_el = [
                "el" => "span",
                "attrs" => [
                    "class" => "field__message"
                ]
            ];

            array_push($field_el_children, $message_el);
        }

        $field_el["children"] = $field_el_children;

        array_push($fieldset_el["children"], $field_el);
    }

    array_push($form_el["children"], $fieldset_el);
}

echo renderHtmlFromArray($form_el);
