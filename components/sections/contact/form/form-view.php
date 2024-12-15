<?php
// TODO: Abstract view into render function.
?>

<?php include ROOT_DIR . "/content/sections/contact/form-content.php"; ?>

<?php
$form_class = "";

if (!empty($FORM["class"])) {
    $form_class = $FORM["class"];

    if (str_contains($FORM["class"], "js-required") && !str_contains($FORM["class"], "has-overlay")) {
        $form_class = $form_class . " has-overlay";
    }
}
?>

<form <?php if (!empty($FORM['action'])) echo "action='" . $FORM['action'] . "'"; ?> <?php if (!empty($FORM['method'])) echo "method='" . $FORM['method'] . "'"; ?> <?php if (!empty($FORM['class'])) echo "class='" . $form_class . "'"; ?> <?php if (!empty($FORM['name'])) echo "name='" . $FORM['name'] . "'"; ?>>
    <?php
    foreach ($FORM["fieldsets"] as $FIELDSET) {
        $fieldset_tag_open = "<fieldset";

        if (!empty($FIELDSET["class"])) {
            $fieldset_tag_open .= " class='" . $FIELDSET["class"] . "'";
        }

        if ((!empty($FIELDSET["disabled"]) && $FIELDSET["disabled"] !== false && $FIELDSET["disabled"] !== "false") || str_contains($FORM["class"], "js-required")) {
            $fieldset_tag_open .= " disabled";
        }

        $fieldset_tag_open .= ">";

        echo $fieldset_tag_open;

        foreach ($FIELDSET["fields"] as $FIELD) {
            if (!is_array($FIELD)) continue;

            $LABEL = isset($FIELD["label"]) ? $FIELD["label"] : false;
            $INPUT = isset($FIELD["input"]) ? $FIELD["input"] : false;

            if (!$INPUT) continue;
    ?>
            <div <?php if (!empty($FIELD['class'])) echo "class='" . $FIELD['class'] . "'"; ?>>
                <?php
                if ($LABEL) {
                ?>
                    <label <?php if (!empty($INPUT["id"])) echo "for='" . $INPUT['id'] . "'"; ?>>
                        <?php
                        echo "<span>" . $LABEL["label"] . "</span>";

                        if (empty($INPUT["required"]) || (!empty($INPUT["required"]) && ($INPUT["required"] === false || $INPUT["required"] === "false"))) {
                            echo "<span> optional</span>";
                        }
                        ?>
                    </label>
                <?php
                }
                ?>

                <?php
                $field_message = null;
                $input_validation_props = [];

                echo "<";

                // TODO: Ignore name if set, use ID instead.
                foreach ($INPUT as $PROP => $VALUE) {
                    if ($PROP === "text_content") continue;

                    if ($PROP === "el") {
                        echo $VALUE;
                    } else if ($PROP === "id") {
                        echo " id='" . $VALUE . "' name='" . $VALUE . "'";
                    } else {
                        if (is_bool($VALUE)) {
                            echo " " . $PROP;
                        } else {
                            array_push($input_validation_props, $PROP);

                            echo " " . $PROP . "='" . $VALUE . "'";
                        }
                    }
                }

                echo ">";

                if ($INPUT["el"] !== "input") {
                    if (!empty($INPUT["text_content"])) {
                        echo $INPUT["text_content"];
                    }

                    echo "</" . $INPUT["el"] . ">";
                }
                ?>
            </div>
    <?php
        }
        echo "</fieldset>";
    }
    ?>
</form>
