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
        <tr class="border-b border-[#1e293b] hover:bg-white/5 transition-colors">
            <td class="px-5 py-4 w-10"></td> 
            <td class="font-bold py-4 px-5 text-white">${a.username}</td>
            <td class="text-[#94a3b8]">${a.id}</td>
            <td class="text-[#94a3b8]">${a.email}</td>
            <td class="text-[#94a3b8]">${a.dept}</td>
            <td><span class="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Active</span></td>
            <td><label class="switch"><input type="checkbox" checked onchange="handleStatusToggle(this, '${a.username}')"><span class="slider"></span></label></td>
        </tr>`).join('');
        
    disabledTbody.innerHTML = disabledAdmins.map(a => `
        <tr class="hover:bg-white/5 opacity-60">
            <td class="px-5 py-4 w-10"><i data-lucide="trash-2" class="w-4 h-4 text-red-500/60 hover:text-red-500 cursor-pointer transition-colors"></i></td>
            <td class="font-bold py-4 px-5 text-white">${a.username}</td>
            <td class="text-[#94a3b8]">${a.id}</td>
            <td class="text-[#94a3b8]">${a.email}</td>
            <td class="text-[#94a3b8]">${a.dept}</td>
            <td><span class="bg-yellow-500/10 text-yellow-500/70 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Disabled</span></td>
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

// ====== STATUS TOGGLE FLOW (MANAGE ADMINS) ======
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
// REPORTS PAGE SPECIFIC LOGIC
// ==========================================

// ✅ Open Dynamic View Details Modal
function openReportDetails(card) {
    if(!card) return;
    
    const title = card.querySelector('h3').innerText;
    const badge = card.querySelector('.badge-status');
    
    const dateText = card.querySelector('.report-date').innerText;
    const timeText = card.querySelector('.report-date').nextElementSibling.innerText;
    
    const pTags = card.querySelectorAll('.space-y-1 p');
    let name = "Unknown";
    let loc = "Unknown";
    if(pTags.length >= 2) {
        name = pTags[0].querySelector('span:nth-child(2)').innerText;
        loc = pTags[1].querySelector('span:nth-child(2)').innerText;
    }

    let desc = "No description provided.";
    const descLabel = Array.from(card.querySelectorAll('p')).find(p => p.innerText.includes('Description:'));
    if (descLabel && descLabel.nextElementSibling) {
        desc = descLabel.nextElementSibling.innerText;
    }

    const email = card.getAttribute('data-email') || "Not provided";
    const contact = card.getAttribute('data-contact') || "Not provided";

    const select = card.querySelector('select');
    let forwarded = "No assigned department";
    if (select && select.value && !select.value.includes('Select') && select.value !== "") {
        forwarded = select.options[select.selectedIndex].text;
    }

    document.getElementById('modal-detail-title').innerText = title;
    const modalBadge = document.getElementById('modal-detail-status');
    modalBadge.className = badge.className;
    modalBadge.innerText = badge.innerText;

    document.getElementById('modal-detail-datetime').innerHTML = `${dateText} <span class="mx-1">at</span> ${timeText}`;
    document.getElementById('modal-detail-name').innerText = name;
    document.getElementById('modal-detail-email').innerText = email;
    document.getElementById('modal-detail-contact').innerText = contact;
    document.getElementById('modal-detail-location').innerText = loc;
    document.getElementById('modal-detail-forwarded').innerText = forwarded;
    document.getElementById('modal-detail-desc').innerText = desc;

    // Handle Return Reason box dynamically
    const returnBox = card.querySelector('.border-red-500');
    const modalReturnBox = document.getElementById('modal-detail-return-box');
    if (returnBox && modalReturnBox) {
        const reasonText = returnBox.querySelector('p:nth-child(2)').innerText.replace(' See More', '');
        document.getElementById('modal-detail-return-reason').innerText = reasonText;
        modalReturnBox.classList.remove('hidden');
    } else if (modalReturnBox) {
        modalReturnBox.classList.add('hidden');
    }

    openModal('view-report-modal');
}


// ✅ Report Validation & Submission Flow
function validateNewReport(e) {
    e.preventDefault();
    const fields = ['report-name', 'report-email', 'report-contact', 'report-location', 'report-subject', 'report-desc'];
    let isValid = true;
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (!el.value.trim() || (id === 'report-email' && !el.value.includes('@'))) {
                el.classList.add('input-error');
                const err = document.getElementById(id + '-error');
                if(err) err.classList.remove('hidden');
                isValid = false;
            }
        }
    });
    
    if (isValid) {
        closeModal('new-report-modal');
        openModal('confirm-report-modal');
    }
}

function executeSubmitReport() {
    closeModal('confirm-report-modal');
    openModal('success-report-modal');
    
    const name = document.getElementById('report-name').value;
    const email = document.getElementById('report-email').value;
    const contact = document.getElementById('report-contact').value;
    const location = document.getElementById('report-location').value;
    const subject = document.getElementById('report-subject').value;
    const desc = document.getElementById('report-desc').value;
    
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minStr = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minStr} ${ampm}`;

    const newCardHTML = `
        <div class="report-card bg-[#131824] border border-[#1e293b] rounded-xl p-6 shadow-sm flex flex-col h-full relative cursor-pointer hover:border-blue-500/50 transition-colors" onclick="openReportDetails(this)" data-email="${email}" data-contact="${contact}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold text-white report-date">${dateStr}</p>
              <p class="text-xs text-[#94a3b8]">${timeStr}</p>
            </div>
            <span class="badge-status bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">New</span>
          </div>
          
          <h3 class="text-lg font-bold text-white mb-4 hover:text-blue-400 transition-colors">${subject}</h3>
          
          <div class="space-y-1 text-sm mb-4">
            <p><span class="text-[#94a3b8]">Name of reportee:</span> <span class="text-white font-semibold">${name}</span></p>
            <p><span class="text-[#94a3b8]">Location:</span> <span class="text-white font-semibold">${location}</span></p>
          </div>

          <div class="text-sm mb-6">
            <p class="text-[#94a3b8] mb-1">Description:</p>
            <p class="text-slate-300 leading-relaxed line-clamp-3">${desc}</p>
          </div>

          <div class="mt-auto pt-4 border-t border-[#1e293b] space-y-4 text-sm" onclick="event.stopPropagation()">
            <div>
              <p class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">FORWARD TO</p>
              <select class="w-full bg-[#1e2536] text-white border border-[#374151] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 cursor-pointer transition-all" onfocus="storePrevValue(this)" onchange="handleForward(this)">
                <option value="" disabled selected hidden>Select department...</option>
                <option value="DRRMO">DRRMO</option>
                <option value="Engineering">Engineering</option>
                <option value="Traffic">Traffic</option>
              </select>
            </div>
            <div class="flex items-center justify-between mt-4">
              <p class="text-[11px] font-bold text-white uppercase tracking-wider">Mark as Resolved</p>
              <label class="switch" onclick="event.stopPropagation()">
                <input type="checkbox" onchange="handleReportToggle(event, this)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
    `;

    const grid = document.getElementById('reports-grid');
    if (grid) grid.insertAdjacentHTML('afterbegin', newCardHTML);

    clearAndCloseReport();
    if(window.lucide) lucide.createIcons();
    filterReports();
}

function clearAndCloseReport() {
    ['report-name', 'report-email', 'report-contact', 'report-location', 'report-subject', 'report-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        clearError(id, id + '-error');
    });
    closeModal('new-report-modal');
}


// ✅ Advanced Grid Filtering Logic
function filterReports() {
    const statusFilterEl = document.getElementById('filter-status');
    const deptFilterEl = document.getElementById('filter-dept');
    const dateFilterEl = document.getElementById('filter-date');
    
    if (!statusFilterEl || !deptFilterEl || !dateFilterEl) return;

    const statusFilter = statusFilterEl.value;
    const deptFilter = deptFilterEl.value;
    const dateFilter = dateFilterEl.value;

    let formattedFilterDate = "";
    if (dateFilter) {
        const parts = dateFilter.split('-'); 
        formattedFilterDate = `${parseInt(parts[1])}/${parseInt(parts[2])}/${parts[0]}`; 
    }

    const cards = document.querySelectorAll('.report-card');
    
    cards.forEach(card => {
        let show = true;
        
        if (statusFilter !== "All Status") {
            const badge = card.querySelector('.badge-status');
            const status = badge ? badge.innerText.trim().toLowerCase() : "";
            if (status !== statusFilter.toLowerCase()) show = false;
        }
        
        if (show && deptFilter !== "All Departments") {
            const selectEl = card.querySelector('select');
            let dept = "";
            if (selectEl && selectEl.options[selectEl.selectedIndex]) {
                dept = selectEl.options[selectEl.selectedIndex].text;
            }
            if (dept.includes("Select")) dept = "Unassigned"; 
            if (dept !== deptFilter) show = false;
        }
        
        if (show && formattedFilterDate) {
            const dateEl = card.querySelector('.report-date');
            const cardDate = dateEl ? dateEl.innerText.trim() : "";
            if (cardDate !== formattedFilterDate) show = false;
        }
        
        if (show) {
            card.style.display = 'flex'; 
        } else {
            card.style.display = 'none';
        }
    });
}

// ✅ Forward Logic & Modal
let pendingForwardSelect = null;

function storePrevValue(select) {
    if(!select.hasAttribute('data-prev')) {
        select.setAttribute('data-prev', select.value);
    }
}

function handleForward(select) {
    const card = select.closest('.report-card');
    if (!card) return;
    
    const checkbox = card.querySelector('input[type="checkbox"]');

    if (checkbox && checkbox.checked) {
        select.value = select.getAttribute('data-prev') || "";
        return;
    }

    pendingForwardSelect = select;
    openModal('confirm-forward-modal');
}

function confirmForward() {
    if (pendingForwardSelect) {
        const card = pendingForwardSelect.closest('.report-card');
        const badge = card.querySelector('.badge-status');
        
        if (badge) {
            badge.className = 'badge-status bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all';
            badge.innerText = 'Forwarded';
            badge.setAttribute('data-orig-class', badge.className);
            badge.setAttribute('data-orig-text', badge.innerText);
        }

        pendingForwardSelect.setAttribute('data-prev', pendingForwardSelect.value);
        filterReports();
        pendingForwardSelect = null;
    }
    closeModal('confirm-forward-modal');
}

function cancelForward() {
    if (pendingForwardSelect) {
        pendingForwardSelect.value = pendingForwardSelect.getAttribute('data-prev') || "";
        pendingForwardSelect = null;
    }
    closeModal('confirm-forward-modal');
}

// ✅ Modals logic for Resolved Switch
let pendingReportToggle = null;

function handleReportToggle(e, checkbox) {
    pendingReportToggle = checkbox;
    
    if (checkbox.checked) {
        openModal('resolve-modal');
    } else {
        openModal('cancel-resolve-modal');
    }
}

function confirmResolution() {
    if (pendingReportToggle) {
        const card = pendingReportToggle.closest('.report-card');
        if (card) {
            const badge = card.querySelector('.badge-status');
            const select = card.querySelector('select');
            
            if (badge && !badge.hasAttribute('data-orig-class')) {
                badge.setAttribute('data-orig-class', badge.className);
                badge.setAttribute('data-orig-text', badge.innerText);
            }
            
            if (badge) {
                badge.className = 'badge-status bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all';
                badge.innerText = 'Resolved';
            }
            
            if (select) {
                select.disabled = true;
                select.classList.add('opacity-50', 'cursor-not-allowed');
            }

            card.classList.add('opacity-70');
            filterReports();
        }
        pendingReportToggle = null; 
    }
    closeModal('resolve-modal');
}

function confirmCancelResolution() {
    if (pendingReportToggle) {
        const card = pendingReportToggle.closest('.report-card');
        if (card) {
            const badge = card.querySelector('.badge-status');
            const select = card.querySelector('select');
            
            card.classList.remove('opacity-70');
            
            if (select) {
                select.disabled = false;
                select.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            if (badge && badge.hasAttribute('data-orig-class')) {
                badge.className = badge.getAttribute('data-orig-class');
                badge.innerText = badge.getAttribute('data-orig-text');
            } else if (badge) {
                badge.className = 'badge-status bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all';
                badge.innerText = 'Pending';
            }
            
            filterReports();
        }
        pendingReportToggle = null;
    }
    closeModal('cancel-resolve-modal');
}

function cancelReportToggle(modalId) {
    if (pendingReportToggle) {
        pendingReportToggle.checked = !pendingReportToggle.checked;
        pendingReportToggle = null;
    }
    closeModal(modalId);
}


// ==========================================
// AUTHENTICATION LOGIC (admin.html)
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