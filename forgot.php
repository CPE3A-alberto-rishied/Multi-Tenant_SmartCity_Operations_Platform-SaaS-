<?php
require 'db.php';
$msg = "";

if (isset($_POST['request'])) {
    $email = $_POST['email'];
    $stmt = $pdo->prepare("SELECT * FROM staff_accounts WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        $token = bin2hex(random_bytes(16));
        $pdo->prepare("UPDATE staff_accounts SET reset_token=?, token_expiry=DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email=?")->execute([$token, $email]);
        $link = "http://localhost/city_project/forgot.php?token=".$token;
        $msg = "<div style='color:green; background:#e8f5e9; padding:10px;'>Link Generated: <br><a href='$link'>$link</a></div>";
    } else { $msg = "<div style='color:red;'>Email not found.</div>"; }
}

if (isset($_POST['reset'])) {
    if ($_POST['p1'] === $_POST['p2']) {
        $hash = password_hash($_POST['p1'], PASSWORD_BCRYPT);
        $pdo->prepare("UPDATE staff_accounts SET password=?, reset_token=NULL WHERE reset_token=?")->execute([$hash, $_POST['token']]);
        $msg = "<div style='color:green;'>Password updated! <a href='login.php'>Login here</a></div>";
    } else { $msg = "<div style='color:red;'>Passwords must match.</div>"; }
}
?>
<!DOCTYPE html>
<html>
<head><title>Reset Password</title><style>body{font-family:sans-serif; background:#f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh;} .box{background:white; padding:30px; border-radius:8px; width:300px; box-shadow:0 2px 10px rgba(0,0,0,0.1);}</style></head>
<body>
<div class="box">
    <?php echo $msg; ?>
    <?php if (isset($_GET['token'])): ?>
        <form method="POST">
            <input type="hidden" name="token" value="<?php echo $_GET['token']; ?>">
            <input type="password" name="p1" placeholder="New Password" required style="width:100%; margin:5px 0; padding:8px;">
            <input type="password" name="p2" placeholder="Confirm Password" required style="width:100%; margin:5px 0; padding:8px;">
            <button name="reset" style="width:100%; padding:10px; background:#004a99; color:white; border:none; margin-top:10px;">Update</button>
        </form>
    <?php else: ?>
        <h4 style="margin-top:0;">Request Password Reset</h4>
        <form method="POST"><input type="email" name="email" placeholder="Your Email" required style="width:100%; padding:8px; box-sizing:border-box;">
        <button name="request" style="width:100%; padding:10px; background:#004a99; color:white; border:none; margin-top:10px;">Send Link</button></form>
    <?php endif; ?>
    <p style="text-align:center;"><a href="login.php" style="font-size:12px; color:#666;">Back to Login</a></p>
</div>
</body>
</html>