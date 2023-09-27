<?php
$FORM = array(
    // "action" => "/components/form/form-controller.php",
    "method" => "POST",
    "class" => "form form--contact js-required",
    "name" => "contact-form",
    "fieldsets" => array(
        "fs_personal" => array(
            "class" => "js-auto-enable",
            "fields" => array(
                "field_name" => array(
                    "class" => "field field--ifl",
                    "label" => array(
                        "label" => "My name is"
                    ),
                    "input" => array(
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-name",
                        "minlength" => "2",
                        "maxlength" => "128",
                        "placeholder" => "Jason Green"
                    )
                ),
                "field_email" => array(
                    "class" => "field field--ifl",
                    "label" => array(
                        "label" => "My email address is"
                    ),
                    "input" => array(
                        "el" => "input",
                        "type" => "email",
                        "id" => "cf-email",
                        "placeholder" => "j.green@example.com",
                        "required" => true
                    )
                )
            )
        ),
        "fs_message" => array(
            "class" => "js-auto-enable",
            "fields" => array(
                "field_subject" => array(
                    "class" => "field field--ifl",
                    "label" => array(
                        "label" => "I want to talk about"
                    ),
                    "input" => array(
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-subject",
                        "minlength" => "4",
                        "maxlength" => "256",
                        "placeholder" => "Some work of yours that I came across",
                        "required" => true
                    )
                ),
                "field_message" => array(
                    "class" => "field field--ifl",
                    "label" => array(
                        "label" => "Message"
                    ),
                    "input" => array(
                        "el" => "textarea",
                        "id" => "cf-message",
                        "rows" => "8",
                        "minlength" => "12",
                        "placeholder" => "Hey man, how are you doing? Last week I was browsing the web when ...",
                        "required" => true
                    )
                )
            )
        ),
        "fs_submit" => array(
            "fields" => array(
                "field_mc" => array(
                    "class" => "field field--inline js-required",
                    "input" => array(
                        "el" => "input",
                        "type" => "text",
                        "id" => "cf-mc",
                        "name" => "cf-mc",
                        "inputmode" => "numeric",
                        "required" => true,
                        "disabled" => true
                    )
                ),
                "field_submit" => array(
                    "input" => array(
                        "el" => "input",
                        "type" => "submit",
                        "id" => "cf-submit",
                        "class" => "btn btn--submit",
                        "value" => "Send"
                    )
                )
            )
        )
    )
);
