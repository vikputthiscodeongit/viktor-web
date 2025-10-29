<?php

namespace SimpleMathsCaptcha;

require_once __DIR__ . "/../../../global.php";
require_once ROOT_DIR . "/session.php";

class Validate
{
    protected $id = "simple-maths-captcha";

    public function __construct(?string $id)
    {
        if (!$id) return;

        $this->id = $id;
    }

    public function isCaptchaFormControlId(string $form_control_id)
    {
        return strpos($form_control_id, $this->id) !== false;
    }

    public function getInvalidFormControlId(string $validation_state)
    {
        return $validation_state === "invalid" ? $this->id . "-answer" : $this->id . "-activator";
    }

    public function isAnswerValid(int $digit_1, int $digit_2, int $answer)
    {
        // Contains the problem digits and a unix timestamp.
        $stored_problem_data = $_SESSION[$this->id];

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

    public function getValidationState(array $form_data)
    {

        $has_all_captcha_data =
            array_key_exists($this->id . "-digit-1", $form_data) &&
            array_key_exists($this->id . "-digit-2", $form_data) &&
            array_key_exists($this->id . "-answer", $form_data);

        if (!$has_all_captcha_data) {
            return "inactive";
        }

        return $this->isAnswerValid(
            (int) $form_data[$this->id . "-digit-1"],
            (int) $form_data[$this->id . "-digit-2"],
            (int) $form_data[$this->id . "-answer"],
        ) ? "valid" : "invalid";
    }
}
