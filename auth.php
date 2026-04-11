<?php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $u = trim($_POST['user']);
    $p = trim($_POST['pass']);

    // Main Admin Check
    if ($u === 'admin' && $p === 'admin123') {
        $_SESSION['role'] = 'MAIN ADMIN';
        $_SESSION['username'] = 'MAIN ADMIN';
        header("Location: dashboard.php");
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM staff_accounts WHERE username = ?");
    $stmt->execute([$u]);
    $staff = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($staff && password_verify($p, $staff['password'])) {
        if ($staff['status'] === 'locked') {
            header("Location: login.php?error=locked");
            exit;
        }
        $_SESSION['role'] = 'StaffAdmin';
        $_SESSION['username'] = $staff['full_name'];
        header("Location: dashboard.php");
        exit;
    } else {
        header("Location: login.php?error=invalid");
        exit;
    }
}
?>