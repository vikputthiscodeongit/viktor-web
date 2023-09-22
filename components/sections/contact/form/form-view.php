<?php
// TODO:
// * Abstract view into render function.
?>

<?php include "form-content.php"; ?>

<form
    action="<?php if (isset($FORM['action'])) echo $FORM['action']; ?>"
    method="<?php if (isset($FORM['method'])) echo $FORM['method']; ?>"
    class="<?php if (isset($FORM['class'])) echo $FORM['class']; ?>"
    name="<?php if (isset($FORM['name'])) echo $FORM['name']; ?>"
>
    <?php
        foreach($FORM["fieldsets"] as $FIELDSET) {
            $fs_disabled =
               (!isset($FIELDSET["disabled"]) && str_contains($FORM["class"], "js-enable") && str_contains($FIELDSET["class"], "js-enable")) ||
                (isset($FIELDSET["disabled"]) && $FIELDSET["disabled"] !== false && $FIELDSET["disabled"] !== "false")
                    ? "disabled"
                    : "";

            echo "<fieldset " . $fs_disabled . ">";

            foreach($FIELDSET["fields"] as $FIELD) {
                $LABEL = isset($FIELD["label"]) ? $FIELD["label"] : false;
                $INPUT = $FIELD["input"];
                ?>
                    <div class="<?php if (isset($FIELD['class'])) echo $FIELD['class']; ?>">
                        <?php
                            if ($LABEL) {
                                ?>
                                <label for="<?php echo $INPUT['id']; ?>">
                                    <?php echo $LABEL["label"]; ?>
                                </label>
                                <?php
                            }
                        ?>

                        <?php
                            echo "<";

                            foreach($INPUT as $PROP => $VALUE) {
                                if ($PROP === "el") {
                                    echo $VALUE . " ";
                                } else if ($PROP === "id") {
                                    echo 'name="' . $VALUE . '" ';
                                } else {
                                    if (is_bool($VALUE)) {
                                        echo $PROP . " ";
                                    } else {
                                        echo $PROP . '="' . $VALUE . '" ';
                                    }
                                }
                            }
                            if ($INPUT["el"] !== "input") {
                                echo "></" . $INPUT["el"];
                            }

                            echo ">";
                        ?>
                    </div>
                    <?php
            }

            echo "</fieldset>";
        }
    ?>
</form>
