// ====== UI & NAVIGATION ======
function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden'); 
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden'); 
}

function doLogout() { 
    window.location.href = 'admin.html'; 
}

// ====== DATA & REFRESH ======
let departments = []; 
let currentFilter = "All Departments";
let mockData = { admins: [] }; 

function checkDeptBeforeStaff() {
    if (departments.length === 0) { openModal('no-dept-modal'); } 
    else { openModal('add-staff-modal'); }
}

function handleSort(val) {
    currentFilter = val;
    const deleteBtn = document.getElementById('delete-dept-btn');
    if (val !== "All Departments") {
        deleteBtn.classList.remove('hidden');
        document.getElementById('delete-dept-title').innerText = `Delete ${val}?`;
        const count = mockData.admins.filter(a => a.dept === val).length;
        document.getElementById('delete-dept-desc').innerText = `This will remove the department AND delete all ${count} associated staff member(s).`;
    } else { 
        deleteBtn.classList.add('hidden'); 
    }
    populateAdmins();
}

function updateDepartmentDropdowns() {
    const filterSelect = document.getElementById('dept-filter');
    const modalSelect = document.getElementById('staff-dept');
    if (filterSelect) filterSelect.innerHTML = `<option>All Departments</option>` + departments.map(d => `<option value="${d}">${d}</option>`).join('');
    
    if (modalSelect) modalSelect.innerHTML = `<option value="" disabled selected>Select Department</option>` + departments.map(d => `<option value="${d}">${d}</option>`).join('');
}

function populateAdmins() {
    const activeTbody = document.getElementById('active-admin-table-body');
    const disabledTbody = document.getElementById('disabled-admin-table-body');
    if(!activeTbody || !disabledTbody) return;

    let adminsToDisplay = mockData.admins;
    if (currentFilter !== "All Departments") {
        adminsToDisplay = mockData.admins.filter(a => a.dept === currentFilter);
    }

    const activeAdmins = adminsToDisplay.filter(a => a.status === "Active");
    const disabledAdmins = adminsToDisplay.filter(a => a.status !== "Active");

    activeTbody.innerHTML = activeAdmins.map(a => `
        <tr class="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
            <td class="px-4 py-4 w-10"></td> 
            <td class="font-bold py-4 px-4 text-white">${a.username}</td>
            <td class="text-[#94a3b8]">${a.id}</td>
            <td class="text-[#94a3b8]">${a.email}</td>
            <td class="text-[#94a3b8]">${a.dept}</td>
            <td><span class="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold">Active</span></td>
            <td><label class="switch"><input type="checkbox" checked onchange="handleStatusToggle(this, '${a.username}')"><span class="slider"></span></label></td>
        </tr>`).join('');
        
    disabledTbody.innerHTML = disabledAdmins.map(a => `
        <tr class="hover:bg-white/5 opacity-60">
            <td class="px-4 py-4 w-10"><i data-lucide="trash-2" class="w-4 h-4 text-red-500/60 hover:text-red-500 cursor-pointer transition-colors"></i></td>
            <td class="font-bold py-4 px-4 text-white">${a.username}</td>
            <td class="text-[#94a3b8]">${a.id}</td>
            <td class="text-[#94a3b8]">${a.email}</td>
            <td class="text-[#94a3b8]">${a.dept}</td>
            <td><span class="bg-yellow-500/10 text-yellow-500/70 px-3 py-1 rounded-full text-[10px] font-bold">Disabled</span></td>
            <td><label class="switch"><input type="checkbox" onchange="handleStatusToggle(this, '${a.username}')"><span class="slider"></span></label></td>
        </tr>`).join('');
    
    if (window.lucide) lucide.createIcons(); 
}

// ====== CREATION & DELETION LOGIC ======
function executeDeleteDept() {
    mockData.admins = mockData.admins.filter(a => a.dept !== currentFilter);
    departments = departments.filter(d => d !== currentFilter);
    currentFilter = "All Departments";
    const filterEl = document.getElementById('dept-filter');
    if (filterEl) filterEl.value = "All Departments";
    document.getElementById('delete-dept-btn').classList.add('hidden');
    updateDepartmentDropdowns();
    populateAdmins();
    closeModal('delete-dept-modal');
}

function validateAddStaff() {
    const name = document.getElementById('staff-name'), 
          id = document.getElementById('staff-id'), 
          email = document.getElementById('staff-email'), 
          pass = document.getElementById('staff-pass'),
          dept = document.getElementById('staff-dept'); 
          
    let isValid = true;
    
    if (!name.value.trim()) { name.classList.add('input-error'); document.getElementById('name-error').classList.remove('hidden'); isValid = false; }
    if (!id.value.trim()) { id.classList.add('input-error'); document.getElementById('id-error').classList.remove('hidden'); isValid = false; }
    if (!email.value.trim()) { email.classList.add('input-error'); document.getElementById('email-error').classList.remove('hidden'); isValid = false; }
    if (pass.value.length < 8) { pass.classList.add('input-error'); document.getElementById('pass-error').classList.remove('hidden'); isValid = false; }
    if (!dept.value) { dept.classList.add('input-error'); document.getElementById('dept-select-error').classList.remove('hidden'); isValid = false; }
    
    if (isValid) openModal('confirm-staff-modal');
}

function executeAddStaff() {
    const newUser = {
        username: document.getElementById('staff-name').value,
        id: document.getElementById('staff-id').value,
        email: document.getElementById('staff-email').value,
        dept: document.getElementById('staff-dept').value,
        status: "Active"
    };
    mockData.admins.push(newUser);
    clearAndCloseStaff(); 
    closeModal('confirm-staff-modal'); 
    populateAdmins();
}

function validateCreateDept() {
    const input = document.getElementById('new-dept-name');
    if (!input.value.trim()) { input.classList.add('input-error'); document.getElementById('dept-error').classList.remove('hidden'); return; }
    openModal('confirm-dept-modal');
}

function executeCreateDept() {
    const name = document.getElementById('new-dept-name').value.trim();
    if (name && !departments.includes(name)) { departments.push(name); updateDepartmentDropdowns(); }
    clearAndCloseDept(); 
    closeModal('confirm-dept-modal');
}

function clearAndCloseStaff() {
    ['staff-name', 'staff-id', 'staff-email', 'staff-pass', 'staff-dept'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') el.value = "";
            else el.value = "";
        }
        let errId = id === 'staff-pass' ? 'pass-error' : id === 'staff-dept' ? 'dept-select-error' : id.split('-')[1] + '-error';
        clearError(id, errId);
    });
    closeModal('add-staff-modal');
}

function clearAndCloseDept() {
    const input = document.getElementById('new-dept-name');
    if (input) input.value = "";
    clearError('new-dept-name', 'dept-error');
    closeModal('new-dept-modal');
}

function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('input-error');
    if (error) error.classList.add('hidden');
}

// ====== STATUS TOGGLE FLOW ======
let pendingToggle = null;
let currentTargetUser = "";

function handleStatusToggle(checkbox, userName) {
    pendingToggle = checkbox;
    currentTargetUser = userName;
    if (!checkbox.checked) {
        document.getElementById('disable-title').innerText = `Disable ${userName}?`;
        openModal('disable-modal');
        checkbox.checked = true;
    } else {
        document.getElementById('enable-title').innerText = `Enable ${userName}?`;
        openModal('enable-modal');
        checkbox.checked = false;
    }
}

function confirmStatusChange(isEnabling) {
    if (pendingToggle) {
        const user = mockData.admins.find(u => u.username === currentTargetUser);
        if (user) {
            user.status = isEnabling ? "Active" : "Disabled";
            populateAdmins(); 
        }
        closeModal(isEnabling ? 'enable-modal' : 'disable-modal');
    }
}

function cancelStatusChange() { 
    closeModal('enable-modal'); 
    closeModal('disable-modal'); 
    pendingToggle = null; 
}

// ==========================================
// AUTHENTICATION SCREEN LOGIC (admin.html)
// ==========================================

function handleLogin(e) {
    e.preventDefault(); 
    const user = document.getElementById('login-user');
    const pass = document.getElementById('login-pass');
    let valid = true;

    if (user && !user.value.trim()) {
        user.classList.add('input-error');
        document.getElementById('user-error').classList.remove('hidden');
        valid = false;
    }
    if (pass && !pass.value.trim()) {
        pass.classList.add('input-error');
        document.getElementById('pass-error').classList.remove('hidden');
        valid = false;
    }

    if (valid && user && pass) {
        document.getElementById('login-card').classList.add('hidden');
        document.getElementById('verify-card').classList.remove('hidden');
    }
}

function handleReset(e) {
    e.preventDefault(); 
    const email = document.getElementById('reset-email');
    let valid = true;

    if (email && (!email.value.trim() || !email.value.includes('@'))) {
        email.classList.add('input-error');
        document.getElementById('reset-error').classList.remove('hidden');
        valid = false;
    }

    if (valid && email) {
        document.getElementById('success-popup').classList.remove('hidden');
    }
}

function handleVerify(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('.otp-input');
    let valid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('input-error');
            valid = false;
        }
    });

    if (!valid) {
        document.getElementById('verify-error').classList.remove('hidden');
    } else {
        window.location.href = "dashboard.html";
    }
}

function handleOtp(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    input.classList.remove('input-error');
    const err = document.getElementById('verify-error');
    if(err) err.classList.add('hidden');
    
    if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
}

function handleOtpBack(e, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (e.key === 'Backspace' && index > 0 && !inputs[index].value) {
        inputs[index - 1].focus();
    }
}

function showResetScreen() {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('reset-card').classList.remove('hidden');
}

function showLoginScreen() {
    const resetCard = document.getElementById('reset-card');
    const verifyCard = document.getElementById('verify-card');
    const loginCard = document.getElementById('login-card');
    
    if(resetCard) resetCard.classList.add('hidden');
    if(verifyCard) verifyCard.classList.add('hidden');
    if(loginCard) loginCard.classList.remove('hidden');
}

function showResentPopup(e) {
    if(e) e.preventDefault(); 
    const popup = document.getElementById('resent-popup');
    if(popup) popup.classList.remove('hidden');
}

function closePopup(popupId) { 
    const popup = document.getElementById(popupId);
    if(popup) popup.classList.add('hidden'); 
}

// ====== PAGE LOAD ======
document.addEventListener('DOMContentLoaded', () => { 
    updateDepartmentDropdowns(); 
    populateAdmins(); 
    if(window.lucide) lucide.createIcons();
});