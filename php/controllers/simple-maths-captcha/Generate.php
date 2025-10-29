<?php

namespace SimpleMathsCaptcha;

require_once __DIR__ . "/../../../global.php";
require_once ROOT_DIR . "/session.php";

class Generate
{
    protected $id = "simple-maths-captcha";

    public function __construct(?string $id)
    {
        if (!$id) return;

        $this->id = $id;
    }

    public function generateProblem(int $valid_for_time)
    {
        $digit_1 = rand(1, 9);
        $digit_2 = rand(1, 9);
        $invalid_after_time = (int) floor(microtime(true) * 1000) + $valid_for_time;

        $_SESSION[$this->id] = [$digit_1, $digit_2, $invalid_after_time];

        return [
            "digit_1" => $digit_1,
            "digit_2" => $digit_2,
            "invalid_after" => $invalid_after_time
        ];
    }
}
