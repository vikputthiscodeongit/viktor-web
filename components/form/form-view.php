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
        $js_required = str_contains($FORM["class"], "js-required");

        foreach($FORM["fieldsets"] as $FIELDSET) {
            echo $js_required && !$_SESSION["js_enabled"] ? "<fieldset disabled>" : "<fieldset>";
            // echo "<fieldset>";

            foreach($FIELDSET as $FIELD) {
                $LABEL = isset($FIELD["label"]) ? $FIELD["label"] : false;
                $INPUT = $FIELD["input"];
                ?>
                    <div class="field <?php if (isset($FIELD['class'])) echo $FIELD['class']; ?>">
                        <?php
                            if ($LABEL) {
                                ?>
                                <label for="<?php echo $INPUT['id']; ?>">
                                    <?php echo $LABEL["label"]; ?>
                                </label>
                                <?php
                            }
                        ?>

                        <<?php
                            foreach($INPUT as $PROP => $VALUE) {
                                if ($PROP === "el") {
                                    echo $VALUE . " ";
                                } else {
                                    if ($PROP === "id") {
                                        echo 'name="' . $VALUE . '" ';
                                    }
                                    echo $PROP . '="' . $VALUE . '" ';
                                }
                            }
                            if ($INPUT["el"] !== "input") {
                                echo "></" . $INPUT["el"];
                            }
                        ?>>
                    </div>
                    <?php
            }

            echo "</fieldset>";
        }
    ?>
</form>
