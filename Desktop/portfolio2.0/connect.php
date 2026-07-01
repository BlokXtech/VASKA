<?php
session_start();

$username = filter_input(INPUT_POST, 'username');
$password = filter_input(INPUT_POST, 'password');

if (empty($username)) { die("Username should not be empty"); }
if (empty($password)) { die("Password should not be empty"); }

/* MySQL connection */
$host = "127.0.0.1";
$dbusername = "root";                // or appuser
$dbpassword = "YOUR_MYSQL_PASSWORD"; // set this
$dbname = "users_db";                // set this to your MySQL database name

$conn = new mysqli($host, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

/* Fetch user by username */
$stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

/* Verify password */
if ($user && password_verify($password, $user["password_hash"])) {
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["username"] = $username;

    header("Location: dashboard.php");
    exit();
}

echo "Invalid username or password!";

$stmt->close();
$conn->close();
