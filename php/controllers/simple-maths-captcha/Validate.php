<?php

namespace SimpleMathsCaptcha;

require ROOT_DIR . "/session.php";

class Validate
{
    protected $control_id = "simple-maths-captcha";

    public function __construct(?string $control_id)
    {
        if (!$control_id) return;

        $this->control_id = $control_id;
    }

    public function shouldValidate(string $control_id)
    {
        return strpos($control_id, $this->control_id) !== false;
    }

    private function isAnswerValid(int $digit_1, int $digit_2, int $answer)
    {
        // Contains the problem digits and a unix timestamp.
        $stored_problem_data = $_SESSION[$this->control_id];

        if (
            !is_int($digit_1) || !is_int($digit_2) || !is_int($answer) ||
            is_null($stored_problem_data) || count($stored_problem_data) !== 3
        ) {
            return false;
        }

        $answer_valid =
            // Digit 1 returned by user matches digit 1 created by generator.
            $digit_1 === $stored_problem_data[0] &&
            // Digit 2 returned by user matches digit 2 created by generator.
            $digit_2 === $stored_problem_data[1] &&
            // Answer to the problem is correct.
            $answer === $stored_problem_data[0] + $stored_problem_data[1] &&
            // Answer was submitted within the allowed time.
            floor(microtime(true) * 1000) < (($stored_problem_data[2]) + 1500);

        return $answer_valid;
    }

    public function getValidationResult(array $form_data)
    {
        $has_all_captcha_data =
            array_key_exists($this->control_id . "-digit-1", $form_data) &&
            array_key_exists($this->control_id . "-digit-2", $form_data) &&
            array_key_exists($this->control_id . "-answer", $form_data);

        if (!$has_all_captcha_data) {
            return [
                "id" => $this->control_id . "-activator",
                "errors" => ["captcha_inactive"]
            ];
        }

        $answer_valid = $this->isAnswerValid(
            (int) $form_data[$this->control_id . "-digit-1"],
            (int) $form_data[$this->control_id . "-digit-2"],
            (int) $form_data[$this->control_id . "-answer"],
        );

        return [
            "id" => $this->control_id . "-answer",
            "errors" => !$answer_valid ? ["value_invalid"] : []
        ];
    }
}
