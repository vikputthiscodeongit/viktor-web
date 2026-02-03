<?php
class FormController
{
    protected $name = "";
    private $controls_attrs = [];
    private $extra_validators = [];

    public function __construct(string $name, array $items, ?array $extra_validators)
    {
        $this->name = $name;
        $this->controls_attrs = $this->getControlsAttrs($items);
        $this->extra_validators = $extra_validators;
    }

    private function getControlsAttrs(array $items)
    {
        $items_flat = array_merge([], ...$items);
        $controls_attrs = [];

        foreach ($items_flat as $key => $item) {
            if ($key === "legend") continue;

            if (isset($item["control"]["type"]) && $item["control"]["type"] === "submit") continue;

            $control_attrs = array_filter(
                $item["control"],
                function ($attr) {
                    if (in_array($attr, ["type", "minlength", "maxlength", "pattern", "required"])) {
                        return $attr;
                    }
                },
                ARRAY_FILTER_USE_KEY
            );

            $controls_attrs[$item["control"]["id"]] = $control_attrs;
        }

        return $controls_attrs;
    }

    public function sanitizeData(array $form_data)
    {
        $clean_form_data = [];

        foreach ($form_data as $control_name => $control_value) {
            $control_value_trimmed = trim($control_value);
            $clean_form_data[strval($control_name)] = $control_value_trimmed !== ""
                ? htmlspecialchars($control_value_trimmed)
                : "";
        }

        return $clean_form_data;
    }

    public function validateData(array $form_data)
    {
        $validated_form_data = [];

        foreach ($this->controls_attrs as $control_id => $control_attrs) {
            if (count($this->extra_validators) > 0) {
                foreach ($this->extra_validators as $validator) {
                    if (!$validator->shouldValidate($control_id)) continue;

                    array_push($validated_form_data, $validator->getValidationResult($form_data));

                    // Continue with next form control.
                    continue 2;
                }
            }

            $form_control_validation_result = [
                "id" => $control_id,
                "errors" => []
            ];

            // Form control must have an entry in the form data.
            if (!array_key_exists($control_id, $form_data)) {
                $form_control_validation_result["errors"] = ["entry_missing"];
                array_push($validated_form_data, $form_control_validation_result);

                continue;
            }

            // Required form control mustn't have an empty value.
            if (isset($control_attrs["required"]) && $control_attrs["required"] === true && $form_data[$control_id] === "") {
                $form_control_validation_result["errors"] = ["value_missing"];
                array_push($validated_form_data, $form_control_validation_result);

                continue;
            }

            $form_control_value = $form_data[$control_id];

            foreach ($control_attrs as $attr => $attr_value) {
                if ($attr === "required") continue;

                $condition_name = $attr;
                $error = false;

                switch ($attr) {
                    case "type";
                        if ($attr_value !== "email") break;

                        // RegEx used by browsers for the `email` input type.
                        // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
                        $REGEX = "/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";
                        if (preg_match($REGEX, $form_control_value) !== 1) $error = "type_mismatch";

                        break;

                    case "minlength";
                        if (strlen($form_control_value) > 0 && strlen($form_control_value) < $attr_value) $error = "too_short";
                        break;

                    case "maxlength";
                        if (strlen($form_control_value) > $attr_value) $error = "too_long";
                        break;
                }

                if (!$error) continue;

                array_push($form_control_validation_result["errors"], $condition_name);
            }

            array_push($validated_form_data, $form_control_validation_result);
        }

        return $validated_form_data;
    }

    /**
     * @param array<int|string, array{id: string, errors: array<string>}> $validated_form_data
     */
    public function getInvalidControls(array $validated_form_data)
    {
        $invalid_form_controls = array_filter($validated_form_data, function ($control_data) {
            return count($control_data["errors"]) > 0;
        });

        return $invalid_form_controls;
    }
}
