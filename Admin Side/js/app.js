// ====== MOCK DATA ======
const mockData = {
    incidents: [
        { id: 1, subject: "Flooding", reporter: "Juan Dela Cruz", location: "C5 Road", status: "Forwarded" },
        { id: 2, subject: "Broken Light", reporter: "Maria Clara", location: "Ortigas Ave", status: "New" }
    ],
    admins: [
        { username: "Main_Admin", role: "Main Admin", dept: "All", status: "Active", email: "admin@beat.gov.ph" },
        { username: "Traffic_Staff_1", role: "Staff", dept: "Traffic", status: "Active", email: "staff@beat.gov.ph" }
    ],
    roads: [
        { id: 1, name: "C5 Northbound", segment: "Bagong Ilog – Rosario", status: "green" },
        { id: 2, name: "C5 Southbound", segment: "Rosario – Bagong Ilog", status: "red" }
    ],
    logs: [
        { time: "10:05 AM", user: "Main_Admin", action: "System Login", target: "Admin Dashboard" }
    ]
};

// ====== AUTHENTICATION ======
function handleLogin(e) {
    e.preventDefault();
    // Redirect to dashboard on successful login
    window.location.href = 'dashboard.html';
}

function doLogout() {
    // Redirect back to login page
    window.location.href = 'admin.html';
}

function toggleSidebar() {
    const s = document.getElementById('sidebar');
    if (s.style.transform === 'translateX(-100%)') {
        s.style.transform = '';
        s.style.position = '';
    } else {
        s.style.transform = 'translateX(-100%)';
        s.style.position = 'absolute';
        s.style.zIndex = '50';
    }
}

// ====== DATA INJECTION FUNCTIONS ======
function populateDashboard() {
    const activeEl = document.getElementById('dash-active-incidents');
    if(activeEl) activeEl.innerText = mockData.incidents.length;
    
    const staffEl = document.getElementById('dash-active-staff');
    if(staffEl) staffEl.innerText = mockData.admins.length;

    const feedEl = document.getElementById('dash-activity-feed');
    if(feedEl) {
        feedEl.innerHTML = mockData.logs.map(l => `
            <div class="flex items-center gap-4 py-3 border-b" style="border-color:var(--border)">
              <span class="font-mono text-sm" style="color:var(--text-dim);min-width:75px">${l.time}</span>
              <span class="badge badge-blue" style="min-width:110px;text-align:center">${l.user}</span>
              <span style="color:var(--text-dim);font-size:14px">${l.action}</span>
              <span class="font-semibold text-sm ml-auto text-right">${l.target}</span>
            </div>
        `).join('');
    }
}

function populateAdmins() {
    const tbody = document.getElementById('admin-table-body');
    if(!tbody) return;
    tbody.innerHTML = mockData.admins.map(a => `
        <tr>
            <td class="font-semibold">${a.username}</td>
            <td style="color:var(--text-dim);font-size:13px">${a.email}</td>
            <td><span class="badge badge-purple">${a.role}</span></td>
            <td>${a.dept}</td>
            <td><span class="badge badge-green">${a.status}</span></td>
        </tr>
    `).join('');
}

// Add this to your mockData object if it isn't there already
mockData.announcements = [
    { id: 1, title: "C5 Road Maintenance", author: "Main_Admin", category: "Road Work", date: "Today 10:00 AM", content: "Expect heavy traffic due to drainage repairs." },
    { id: 2, title: "Power Interruption", author: "Staff", category: "Power Interruption", date: "Yesterday 2:00 PM", content: "Meralco advisory for Kapitolyo area." }
];

// Add these functions anywhere in app.js
function populateAnnouncements() {
    const grid = document.getElementById('announcements-grid');
    if(!grid) return;
    grid.innerHTML = mockData.announcements.map(a => `
        <div class="card hover:opacity-90 transition-opacity cursor-pointer">
            <div class="flex items-start justify-between mb-4 gap-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-base mb-1">${a.title}</h4>
                    <div style="color:var(--text-dim);font-size:12px;">
                        ${a.date} · By ${a.author}
                    </div>
                </div>
                <span class="badge badge-blue" style="white-space:nowrap">${a.category}</span>
            </div>
            <p style="color:var(--text-dim);font-size:14px;line-height:1.6;">${a.content}</p>
        </div>
    `).join('');
}

function populateTraffic() {
    const tbody = document.getElementById('roads-table-body');
    if(!tbody) return;
    const statusColors = {green:'#10B981', yellow:'#F59E0B', red:'#EF4444'};
    const statusLabels = {green:'Open', yellow:'Slow', red:'Heavy'};

    tbody.innerHTML = mockData.roads.map(r => `
        <tr>
            <td class="font-semibold" style="padding:16px 14px">${r.name}</td>
            <td style="color:var(--text-dim);padding:16px 14px">${r.segment}</td>
            <td style="padding:16px 14px">
              <span class="badge" style="background:${statusColors[r.status]}20;color:${statusColors[r.status]};padding:6px 12px">
                ${statusLabels[r.status]}
              </span>
            </td>
        </tr>
    `).join('');
}

function populateAnalytics() {
    const container = document.getElementById('barangay-chart-container');
    if(!container) return;
    const maxCount = Math.max(...mockData.locations.map(l => l.count));
    container.innerHTML = mockData.locations.map(loc => `
        <div class="flex flex-col items-center flex-1">
            <div class="text-xs font-mono font-bold mb-2">${loc.count}</div>
            <div class="chart-bar w-full" style="height:${(loc.count/maxCount)*180}px;background:var(--accent);border-radius:6px 6px 0 0"></div>
            <div class="text-center mt-3" style="font-size:11px;color:var(--text-dim);font-weight:500">${loc.name}</div>
        </div>
    `).join('');
}