<?php
    if (!session_id()) {
        session_start();
    }

    include "admin/global-vars.php";

    include "global-strings.php";

    include "header.php";

    include "sections/home/home.php";

    include "sections/contact/contact.php";

    include "footer.php";
