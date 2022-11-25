<form action="form-controller.php" class="form form--contact">
    <?php
        include "./form-data.php";

        foreach($FIELDSETS as $FIELDSET) {
            echo "<fieldset>";

            foreach($FIELDSET as $FIELD) {
                $LABEL = isset($FIELD["label"]) ? $FIELD["label"]  : false;
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
                                        echo "name='" . $VALUE . "' ";
                                    }
                                    echo $PROP . "='" . $VALUE . "' ";
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
