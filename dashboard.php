<?php
session_start();
require 'db.php';
if (!isset($_SESSION['role'])) { header("Location: login.php"); exit; }
$role = $_SESSION['role'];
?>
<!DOCTYPE html>
<html>
<head>
    <title>B.E.A.T. Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; }
        .nav { background: #1a237e; color: white; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; }
        
        /* Form Styling */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .form-pass { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        input { padding: 12px; border: 1px solid #ddd; border-radius: 6px; width: 100%; box-sizing: border-box; }
        .btn-create { background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; }

        /* Table Styling */
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1a237e; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        
        /* Action Buttons */
        .btn-action { padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; border: none; cursor: pointer; }
        .btn-lock { background: #f39c12; color: white; }
        .btn-unlock { background: #28a745; color: white; }
        .btn-delete { background: #dc3545; color: white; margin-left: 5px; }

        /* Custom Modal */
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; }
        .modal-box { background: white; padding: 30px; border-radius: 12px; width: 380px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .modal-btns { margin-top: 20px; display: flex; justify-content: center; gap: 10px; }
    </style>
</head>
<body>

<div class="nav">
    <span><b>PASIG B.E.A.T.</b> | Logged in: <?php echo $_SESSION['username']; ?></span>
    <a href="logout.php" style="color: #ff8a80; text-decoration: none;">Logout</a>
</div>

<div class="container">
    <?php if ($role === 'MAIN ADMIN'): ?>
    <div class="card">
        <h2 style="margin-top:0;">Register New Staff Account</h2>
        <form action="manage.php" method="POST">
            <input type="hidden" name="action" value="add">
            <div class="form-grid">
                <input type="text" name="fname" placeholder="Full Name" required>
                <input type="email" name="email" placeholder="Email Address" required>
                <input type="text" name="user" placeholder="Username" required>
            </div>
            <div class="form-pass">
                <input type="password" name="p1" placeholder="Password" required>
                <input type="password" name="p2" placeholder="Re-type Password" required>
            </div>
            <button type="submit" class="btn-create">Create Account</button>
        </form>
    </div>
    <?php endif; ?>

    <div class="card">
        <h3 style="margin-top:0;">Staff Directory</h3>
        <table>
            <tr><th>Full Name</th><th>Username</th><th>Status</th><th>Actions</th></tr>
            <?php
            $stmt = $pdo->query("SELECT * FROM staff_accounts");
            while($row = $stmt->fetch()) {
                $statusText = strtoupper($row['status']);
                $statusColor = ($row['status'] == 'active') ? "#28a745" : "#dc3545";
                $lockBtnClass = ($row['status'] == 'active') ? "btn-lock" : "btn-unlock";
                $lockBtnText = ($row['status'] == 'active') ? "Lock" : "Unlock";

                echo "<tr>
                    <td>{$row['full_name']}</td>
                    <td>{$row['username']}</td>
                    <td style='color: $statusColor; font-weight: bold;'>$statusText</td>
                    <td>";
                    if ($role === 'MAIN ADMIN') {
                        echo "<a href='manage.php?action=toggle&id={$row['id']}' class='btn-action $lockBtnClass'>$lockBtnText</a>";
                        echo "<button onclick='openDeleteModal({$row['id']})' class='btn-action btn-delete'>Delete</button>";
                    } else { echo "--"; }
                echo "</td></tr>";
            }
            ?>
        </table>
    </div>
</div>

<div id="deleteModal" class="modal-overlay">
    <div class="modal-box">
        <h3>Confirm Deletion</h3>
        <p>This will permanently remove the account. Continue?</p>
        <div class="modal-btns">
            <button onclick="closeModal()" class="btn-action" style="background:#6c757d; color:white;">Cancel</button>
            <a id="confirmBtn" href="#" class="btn-action btn-delete">Yes, Delete</a>
        </div>
    </div>
</div>

<script>
    function openDeleteModal(id) {
        document.getElementById('confirmBtn').href = 'manage.php?action=delete&id=' + id;
        document.getElementById('deleteModal').style.display = 'flex';
    }
    function closeModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }
</script>

</body>
</html>