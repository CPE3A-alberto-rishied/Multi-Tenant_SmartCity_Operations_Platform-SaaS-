<?php
session_start();
require 'db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'MAIN ADMIN') {
    die("Access Denied");
}

// 1. ADD ACCOUNT
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action']) && $_POST['action'] == 'add') {
    if ($_POST['p1'] === $_POST['p2']) {
        $hash = password_hash($_POST['p1'], PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO staff_accounts (full_name, email, username, password) VALUES (?, ?, ?, ?)");
        $stmt->execute([$_POST['fname'], $_POST['email'], $_POST['user'], $hash]);
    }
    header("Location: dashboard.php");
    exit;
}

// 2. LOCK / UNLOCK TOGGLE
if (isset($_GET['action']) && $_GET['action'] == 'toggle') {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("UPDATE staff_accounts SET status = IF(status='active', 'locked', 'active') WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: dashboard.php");
    exit;
}

// 3. DELETE ACCOUNT
if (isset($_GET['action']) && $_GET['action'] == 'delete') {
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM staff_accounts WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: dashboard.php");
    exit;
}
?>