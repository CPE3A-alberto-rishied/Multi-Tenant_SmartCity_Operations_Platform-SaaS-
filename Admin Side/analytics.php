<?php
require_once 'db.php';

// Fetch Audit Logs
$stmt = $pdo->query("
    SELECT a.action, a.details, a.created_at, u.username 
    FROM audit_logs a 
    JOIN users u ON a.user_id = u.user_id 
    ORDER BY a.created_at DESC LIMIT 15
");
$logs = $stmt->fetchAll();

// Group incidents by location for the chart (Simple Analytics)
$chartStmt = $pdo->query("
    SELECT report_location as name, COUNT(*) as count 
    FROM incidents 
    GROUP BY report_location 
    ORDER BY count DESC LIMIT 8
");
$chartData = $chartStmt->fetchAll();

// Calculate Max for the bar chart scaling
$maxCount = 0;
foreach($chartData as $data) {
    if($data['count'] > $maxCount) $maxCount = $data['count'];
}
if($maxCount == 0) $maxCount = 1; // Prevent division by zero
?>

<div class="animate-in">
  <div class="card mb-5">
    <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="scroll-text" style="width:16px;height:16px;color:var(--accent)"></i> Audit Trail</h3>
    <div style="overflow-x:auto">
      <table>
        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>
          <?php if(empty($logs)): ?>
            <tr><td colspan="4" style="text-align:center;color:var(--text-dim)">No audit logs found.</td></tr>
          <?php endif; ?>
          
          <?php foreach($logs as $log): ?>
          <tr>
            <td class="font-mono" style="color:var(--text-dim)"><?= date('M d, h:i A', strtotime($log['created_at'])) ?></td>
            <td><span class="badge badge-blue"><?= htmlspecialchars($log['username']) ?></span></td>
            <td><?= htmlspecialchars($log['action']) ?></td>
            <td class="font-semibold"><?= htmlspecialchars($log['details']) ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--accent)"></i> Reports by Location</h3>
    
    <?php if(empty($chartData)): ?>
        <p style="color:var(--text-dim); text-align:center; padding: 20px;">Not enough report data to generate chart.</p>
    <?php else: ?>
        <div class="flex items-end gap-3 justify-between" style="height:200px;padding-top:20px">
        <?php foreach($chartData as $b): ?>
            <?php $heightPct = ($b['count'] / $maxCount) * 160; ?>
            <div class="flex flex-col items-center flex-1">
                <div class="text-xs font-mono font-bold mb-1"><?= $b['count'] ?></div>
                <div class="chart-bar w-full" style="height:<?= $heightPct ?>px;background:linear-gradient(to top,var(--accent),var(--accent-light))"></div>
                <div class="text-center mt-2" style="font-size:10px;color:var(--text-dim);line-height:1.2;word-break:break-word">
                    <?= htmlspecialchars(substr($b['name'], 0, 15)) ?>
                </div>
            </div>
        <?php endforeach; ?>
        </div>
    <?php endif; ?>
  </div>
</div>