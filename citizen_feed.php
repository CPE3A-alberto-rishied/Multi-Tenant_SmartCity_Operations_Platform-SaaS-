<?php
// --- 1. DATABASE CONNECTION ---
$host = 'localhost';
$dbname = 'beat_pasig';
$username = 'root'; // Default XAMPP/WAMP username
$password = '';     // Default XAMPP/WAMP password is usually empty

try {
    // Create a new PDO instance for secure database interaction
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set PDO error mode to exception to catch errors easily
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}

// --- 2. FETCH DATA ---
// Select all announcements and order them by newest first
$sql = "SELECT title, content, created_at FROM announcements ORDER BY created_at DESC";
$stmt = $pdo->query($sql);
$announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B.E.A.T. Pasig - Citizen Announcements</title>
    <style>
        /* Basic CSS to make it look like a social feed */
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
        }
        .feed-container {
            max-width: 600px;
            margin: 0 auto;
        }
        .post-card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .post-title {
            margin: 0 0 5px 0;
            color: #1a1a1a;
            font-size: 1.2rem;
        }
        .post-meta {
            font-size: 0.85rem;
            color: #65676b;
            margin-bottom: 15px;
        }
        .post-content {
            color: #333;
            line-height: 1.5;
            margin: 0;
        }
    </style>
</head>
<body>

    <div class="feed-container">
        <h2 style="text-align: center; color: #333;">City Announcements</h2>

        <?php if (count($announcements) > 0): ?>
            
            <?php foreach ($announcements as $post): ?>
                <div class="post-card">
                    <h3 class="post-title"><?php echo htmlspecialchars($post['title']); ?></h3>
                    
                    <p class="post-meta">
                        Posted on: <?php echo date('F j, Y, g:i a', strtotime($post['created_at'])); ?>
                    </p>
                    
                    <p class="post-content">
                        <?php echo nl2br(htmlspecialchars($post['content'])); ?>
                    </p>
                </div>
            <?php endforeach; ?>

        <?php else: ?>
            <div class="post-card">
                <p style="text-align: center;">No announcements at this time.</p>
            </div>
        <?php endif; ?>

    </div>

</body>
</html>