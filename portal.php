<!DOCTYPE html>
<html>
<head>
    <title>Secure Portal Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #2c3e50; display: flex; justify-content: center; padding-top: 100px; }
        .login-box { background: white; padding: 30px; border-radius: 8px; width: 300px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        input, button { width: 100%; margin: 10px 0; padding: 10px; box-sizing: border-box; }
        button { background: #e74c3c; color: white; border: none; font-weight: bold; cursor: pointer; }
        button:hover { background: #c0392b; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2 style="text-align: center;">Authorized Access</h2>
        <form action="auth.php" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Secure Login</button>
        </form>
    </div>
</body>
</html>