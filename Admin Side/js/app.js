// ====== AUTHENTICATION & UI TOGGLES ======
function showResetScreen() {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('verify-card').classList.add('hidden');
    document.getElementById('reset-card').classList.remove('hidden');
}

function showLoginScreen() {
    document.getElementById('reset-card').classList.add('hidden');
    document.getElementById('verify-card').classList.add('hidden');
    document.getElementById('login-card').classList.remove('hidden');
}

function showVerifyScreen() {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('verify-card').classList.remove('hidden');
}

// Pop-up Management
function showSuccessPopup() { document.getElementById('success-popup').classList.remove('hidden'); }
function closePopup() { document.getElementById('success-popup').classList.add('hidden'); showLoginScreen(); }
function showResentPopup() { document.getElementById('resent-popup').classList.remove('hidden'); }
function closeResentPopup() { document.getElementById('resent-popup').classList.add('hidden'); }

// LOGOUT FUNCTION: Redirects back to administrative login screen
function doLogout() { 
    window.location.href = 'admin.html'; 
}

// REAL-TIME VALIDATION: Removes red glow when user starts typing
function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input.value.trim() !== "") {
        input.classList.remove('input-error');
        error.classList.add('hidden');
    }
}

// OTP Input Logic: Automatically moves focus to next box
function handleOtp(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(i => i.classList.remove('input-error'));
    document.getElementById('verify-error').classList.add('hidden');
    if (input.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
}

function handleOtpBack(e, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (e.key === "Backspace" && index > 0 && inputs[index].value === "") inputs[index - 1].focus();
}

// Form Handlers
function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('login-user');
    const p = document.getElementById('login-pass');
    let isValid = true;
    if (!u.value.trim()) { u.classList.add('input-error'); document.getElementById('user-error').classList.remove('hidden'); isValid = false; }
    if (!p.value.trim()) { p.classList.add('input-error'); document.getElementById('pass-error').classList.remove('hidden'); isValid = false; }
    if (isValid) showVerifyScreen();
}

function handleVerify(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('.otp-input');
    let code = ""; inputs.forEach(i => code += i.value);
    if (code.length < 6) { inputs.forEach(i => i.classList.add('input-error')); document.getElementById('verify-error').classList.remove('hidden'); }
    else { window.location.href = 'dashboard.html'; }
}

function handleReset(e) {
    e.preventDefault();
    const emailInput = document.getElementById('reset-email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.classList.add('input-error'); document.getElementById('reset-error').classList.remove('hidden');
    } else { showSuccessPopup(); }
}

// ====== DATA INJECTION FUNCTIONS ======
const mockData = {
    incidents: [{ id: 1, subject: "Flooding", reporter: "Juan Dela Cruz", location: "C5 Road", status: "Forwarded" }],
    admins: [{ username: "Main_Admin", role: "Main Admin", dept: "All", status: "Active", email: "admin@beat.gov.ph" }],
    roads: [
        { name: "C5 Northbound", segment: "Bagong Ilog – Rosario", status: "green" },
        { name: "C5 Southbound", segment: "Rosario – Bagong Ilog", status: "red" }
    ],
    logs: [{ time: "10:05 AM", user: "Main_Admin", action: "System Login", target: "Admin Dashboard" }]
};

function populateDashboard() {
    const activeEl = document.getElementById('dash-active-incidents');
    if(activeEl) activeEl.innerText = mockData.incidents.length;
}

function populateAdmins() {
    const tbody = document.getElementById('admin-table-body');
    if(!tbody) return;
    tbody.innerHTML = mockData.admins.map(a => `<tr><td class="font-semibold">${a.username}</td><td>${a.email}</td><td><span class="badge badge-purple">${a.role}</span></td><td>${a.dept}</td><td><span class="badge badge-green">${a.status}</span></td></tr>`).join('');
}

function populateTraffic() {
    const tbody = document.getElementById('roads-table-body');
    if(!tbody) return;
    const statusColors = {green:'#10B981', yellow:'#F59E0B', red:'#EF4444'};
    const statusLabels = {green:'Open', yellow:'Slow', red:'Heavy'};
    tbody.innerHTML = mockData.roads.map(r => `<tr><td class="font-semibold">${r.name}</td><td>${r.segment}</td><td><span class="badge" style="background:${statusColors[r.status]}20;color:${statusColors[r.status]}">${statusLabels[r.status]}</span></td></tr>`).join('');
}