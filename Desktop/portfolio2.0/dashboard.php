<?php
session_start();

/* 1) Block access if not logged in */
if (!isset($_SESSION["user_id"])) {
    header("Location: index.html"); // or index.php / login.php
    exit();
}

$username = $_SESSION["username"] ?? "User";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; }
    .card { max-width: 520px; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
    .row { margin: 12px 0; }
    a, button { cursor: pointer; }
    button { padding: 10px 14px; border: 1px solid #333; background: #fff; border-radius: 8px; }
  </style>
</head>
<body>

  <div class="card">
    <h2>Dashboard</h2>

    <div class="row">
      Logged in as: <strong><?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?></strong>
    </div>

    <div class="row">
      <form action="logout.php" method="post">
        <button type="submit">Logout</button>
      </form>
    </div>
  </div>

</body>
</html>
