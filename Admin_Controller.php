<?php
function updateAndLogStatus($pdo, $currentUserId, $targetItem, $newStatus) {
    try {
        $pdo->beginTransaction();

        // 1. Update the Target (e.g., a Road or Incident Report)
        // Example: Changing a road status to 'CLOSED'
        $updateQuery = "UPDATE traffic_roads SET status = :status WHERE road_name = :target";
        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute(['status' => $newStatus, 'target' => $targetItem]);

        // 2. The Trigger: Create the Audit Log entry
        // Format: [Timestamp] | [User] | [Action] | [Target]
        $actionDescription = "Changed Status to " . $newStatus;
        $logQuery = "INSERT INTO audit_logs (user_id, action, target, timestamp) 
                     VALUES (:user_id, :action, :target, NOW())";
        $logStmt = $pdo->prepare($logQuery);
        $logStmt->execute([
            'user_id' => $currentUserId,
            'action'  => $actionDescription,
            'target'  => $targetItem
        ]);

        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log($e->getMessage());
        return false;
    }
}
?>