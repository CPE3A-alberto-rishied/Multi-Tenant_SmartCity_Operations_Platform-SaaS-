<!DOCTYPE html>
<html>
<head>
    <title>B.E.A.T. Login</title>
    <style>
        body { font-family: Arial; background: #004a99; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 10px; width: 350px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        h2 { text-align: center; color: #333; margin-top: 0; }
        .error-msg { background: #f8d7da; color: #842029; padding: 10px; border-radius: 5px; margin-bottom: 20px; font-size: 14px; text-align: center; border: 1px solid #f5c2c7; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #004a99; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .links { margin-top: 20px; text-align: center; font-size: 13px; }
        .links a { color: #004a99; text-decoration: none; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Admin Access</h2>

        <?php if (isset($_GET['error'])): ?>
            <div class="error-msg">
                <?php 
                    if($_GET['error'] == 'invalid') echo "Invalid username or password.";
                    if($_GET['error'] == 'locked') echo "Account suspended by MAIN ADMIN.";
                ?>
            </div>
        <?php endif; ?>

        <form action="auth.php" method="POST">
            <input type="text" name="user" placeholder="Username" required>
            <input type="password" name="pass" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>

        <div class="links">
            <a href="forgot.php">Forgot Password?</a><br><br>
            <a href="index.php">&larr; Back to Public Portal</a>
        </div>
    </div>
</body>
</html>