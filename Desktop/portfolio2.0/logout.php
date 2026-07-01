<?php
session_start();
session_unset();
session_destroy();

header("Location: index.html"); // back to login page
exit();
