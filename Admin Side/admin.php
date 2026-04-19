<!doctype html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BEAT - Admin</title>
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles2.css">
</head>
<body class="h-full">

  <div id="app" class="flex h-full" style="display:none">
   <aside id="sidebar" class="sidebar">
    <div class="p-5 border-b" style="border-color:var(--border)">
     <div class="flex items-center gap-3">
      <div style="background:var(--accent);width:36px;height:36px;border-radius:10px" class="flex items-center justify-center font-mono font-bold text-white text-sm">B</div>
      <div>
       <div class="font-mono font-bold text-lg tracking-wider">BEAT</div>
       <div style="color:var(--text-dim);font-size:11px">Admin Control Center</div>
      </div>
     </div>
    </div>
    <nav class="flex-1 py-3 overflow-y-auto" id="nav-list"></nav>
    <div class="p-4 border-t" style="border-color:var(--border)">
     <button class="btn btn-ghost w-full justify-center" onclick="doLogout()"><i data-lucide="log-out" style="width:14px;height:14px"></i> Logout</button>
    </div>
   </aside>
   <main class="flex-1 overflow-y-auto h-full">
    <header class="flex items-center justify-between px-6 py-4 border-b" style="border-color:var(--border);background:var(--surface)">
     <div class="flex items-center gap-3">
      <button class="btn-ghost btn btn-sm lg:hidden" onclick="toggleSidebar()"><i data-lucide="menu" style="width:18px;height:18px"></i></button>
      <h1 id="page-title" class="font-semibold text-lg">Dashboard</h1>
     </div>
    </header>
    
    <div id="page-content" class="p-6"></div>
   </main>
  </div>

  <div id="login-screen" class="h-full flex flex-col items-center justify-center" style="background:linear-gradient(135deg,#0a0e1a 0%,#1a1f3a 25%,#0f1428 50%,#1a254a 75%,#0a0e1a 100%);">
   <div style="text-align:center;margin-bottom:40px">
    <div style="background:var(--accent);width:56px;height:56px;border-radius:14px;margin:0 auto 8px" class="flex items-center justify-center font-mono font-bold text-white text-xl">B</div>
    <h1 class="font-mono font-bold tracking-widest" style="font-size:36px;margin:0 0 2px 0">BEAT</h1>
   </div>
   <div class="card glow" style="width:400px;max-width:90%;">
    <form id="login-form" onsubmit="handleLogin(event)">
     <div class="mb-5">
      <label class="block text-sm font-semibold mb-2" style="color:var(--text-dim)">ID NUMBER</label>
      <input type="text" placeholder="Enter ID number" required>
     </div>
     <div class="mb-6">
      <label class="block text-sm font-semibold mb-2" style="color:var(--text-dim)">PASSWORD</label>
      <input type="password" placeholder="Enter password" required>
     </div>
     <button type="submit" class="btn btn-primary w-full justify-center py-3">Sign In</button>
    </form>
   </div>
  </div>
  
  <div id="toast" class="toast" style="display:none"></div>

  <script src="js/app.js"></script>
</body>
</html>
