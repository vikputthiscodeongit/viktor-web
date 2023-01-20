<form
    action="/components/form/form-controller.php"
    method="POST"
    class="form form--contact js-required"
    name="contact-form"
>
    <?php
        include "form-content.php";

        // TODO:
        // Abstract view into render function. Inject disabled attribute
        // if $FORM array's className contains "js-required".

        foreach($FIELDSETS as $FIELDSET) {
            echo "<fieldset>";

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
