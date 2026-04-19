<?php
require_once 'db.php';

// Fetch articles and join with users to get the author's name
$stmt = $pdo->query("
    SELECT n.*, u.username as author 
    FROM news_articles n 
    LEFT JOIN users u ON n.admin_id = u.user_id 
    ORDER BY n.created_at DESC
");
$articles = $stmt->fetchAll();
?>

<div class="animate-in">
  <div class="mb-6 flex gap-2 border-b" style="border-color:var(--border)">
    <button class="btn btn-ghost btn-sm active" style="border-bottom:3px solid var(--accent);border-radius:0;padding:12px 16px;color:var(--accent);font-weight:600">
      <i data-lucide="radio" style="width:14px;height:14px"></i> Published Articles
    </button>
  </div>

  <div class="mb-6 flex items-center justify-end">
    <button class="btn btn-primary" onclick="navigateTo('create-announcement')" style="padding:12px 24px;font-size:15px">
      <i data-lucide="file-plus" style="width:16px;height:16px"></i> Create Article
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <?php if(empty($articles)): ?>
      <p style="color:var(--text-dim);font-size:13px;grid-column:1/-1">No live announcements published.</p>
    <?php endif; ?>

    <?php foreach($articles as $a): ?>
        <div class="card cursor-pointer hover:opacity-80 transition-opacity">
          <div class="flex items-start justify-between mb-3 gap-2">
            <div class="flex-1">
              <h4 class="font-semibold" style="font-size:15px"><?= htmlspecialchars($a['title']) ?></h4>
              <div style="color:var(--text-dim);font-size:12px;margin-top:4px">
                <?= date('M d, Y h:i A', strtotime($a['created_at'])) ?> · By <?= htmlspecialchars($a['author'] ?? 'System') ?>
              </div>
            </div>
            <?php 
              $catClass = 'badge-blue';
              if(in_array($a['category'], ['Urgent Alert', 'Traffic'])) $catClass = 'badge-red';
              if(in_array($a['category'], ['Weather', 'Power Interruption'])) $catClass = 'badge-yellow';
            ?>
            <span class="badge <?= $catClass ?>" style="white-space:nowrap"><?= htmlspecialchars($a['category']) ?></span>
          </div>
          <p style="color:var(--text-dim);font-size:13px;line-height:1.5;margin-bottom:12px">
            <?= nl2br(htmlspecialchars(substr($a['content'], 0, 150))) ?>...
          </p>
          <div class="flex gap-2 justify-between">
            <button class="btn btn-sm btn-danger px-4"><i data-lucide="trash-2" style="width:14px;height:14px"></i> Delete</button>
          </div>
        </div>
    <?php endforeach; ?>
  </div>
</div>