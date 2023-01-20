<?php
    var_dump($_SERVER['HTTP_USER_AGENT']);

    if (!session_id()) {
        session_start();
    }

    include "admin/global-vars.php";

    include "global-strings.php";

    include "header.php";

    include "sections/home/home.php";

    include "sections/contact/contact.php";

    include "footer.php";
