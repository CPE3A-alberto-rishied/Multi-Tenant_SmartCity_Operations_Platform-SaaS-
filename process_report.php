<?php
// process_report.php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $sql = "INSERT INTO incidents (
                    reporter_name, 
                    reporter_email, 
                    report_subject, 
                    contact_number, 
                    report_location, 
                    report_description
                ) VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $_POST['reporter_name'],
            $_POST['reporter_email'],
            $_POST['report_subject'],
            $_POST['contact_number'],
            $_POST['report_location'],
            $_POST['report_description']
        ]);
        
        echo json_encode(['status' => 'success']);
    } catch(PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>