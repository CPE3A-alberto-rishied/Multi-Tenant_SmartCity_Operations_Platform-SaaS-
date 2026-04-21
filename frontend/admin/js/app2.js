// ==========================================
// UI & NAVIGATION UTILS
// ==========================================
function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden'); 
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden'); 
}

function clearReqError(el) {
    if (el) {
        el.classList.remove('input-error');
        if (el.nextElementSibling && el.nextElementSibling.tagName === 'P') {
            el.nextElementSibling.classList.add('hidden');
        }
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function doLogout() { 
    window.location.href = 'admin.html'; 
}
// Close custom dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.cat-dropdown-menu').forEach(el => el.classList.add('hidden'));
    }
});


// ==========================================
// AUTHENTICATION LOGIC (admin.html)
// ==========================================
function handleLogin(e) {
    e.preventDefault(); 
    
    const userEl = document.getElementById('login-user');
    const passEl = document.getElementById('login-pass');
    
    const userErr = document.getElementById('user-error');
    const passErr = document.getElementById('pass-error');

    let valid = true;

    // 1. Check for empty fields
    if (!userEl.value.trim()) {
        userEl.classList.add('input-error');
        userErr.innerText = "This field is required";
        userErr.classList.remove('hidden');
        valid = false;
    }
    if (!passEl.value.trim()) {
        passEl.classList.add('input-error');
        passErr.innerText = "This field is required";
        passErr.classList.remove('hidden');
        valid = false;
    }

    if (!valid) return;

    const inputId = userEl.value.trim();
    const inputPass = passEl.value;

    // 2. Hardcoded Master Admin fallback
    const isMasterAdmin = (inputId === '2023104513' && inputPass === 'admin123');

    // 3. Retrieve created accounts from Memory
    let savedAdmins = JSON.parse(localStorage.getItem('beat_admins')) || [];
    const foundAdmin = savedAdmins.find(a => a.id === inputId);

    // 4. Validate Account Existence
    if (!isMasterAdmin && !foundAdmin) {
        userEl.classList.add('input-error');
        userErr.innerText = "No account made for that ID.";
        userErr.classList.remove('hidden');
        return;
    }

    // 5. Validate Password
    if (!isMasterAdmin && foundAdmin && foundAdmin.password !== inputPass) {
        passEl.classList.add('input-error');
        passErr.innerText = "Wrong credentials input.";
        passErr.classList.remove('hidden');
        return;
    }

    // 6. Validate Account Status
    if (!isMasterAdmin && foundAdmin && foundAdmin.status === "Disabled") {
        userEl.classList.add('input-error');
        userErr.innerText = "This account is disabled.";
        userErr.classList.remove('hidden');
        return;
    }
    
    // 7. Login Successful! Store Active Department for Routing
    let activeDept = isMasterAdmin ? "Main Admin" : foundAdmin.dept;
    localStorage.setItem('activeDepartment', activeDept);

    // Proceed to Verify Screen
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('verify-card').classList.remove('hidden');
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
        const err = document.getElementById('verify-error');
        if(err) err.classList.remove('hidden');
    } else {
        // SMART ROUTING BASED ON ACCOUNT
        const activeDept = localStorage.getItem('activeDepartment');
        
        if (activeDept === 'Main Admin') {
            window.location.href = "dashboard.html"; 
        } else {
            window.location.href = "dashboard2.html"; 
        }
    }
}

function handleReset(e) {
    e.preventDefault(); 
    const email = document.getElementById('reset-email');
    let valid = true;

    if (email && (!email.value.trim() || !email.value.includes('@'))) {
        email.classList.add('input-error');
        const err = document.getElementById('reset-error');
        if(err) err.classList.remove('hidden');
        valid = false;
    }

    if (valid && email) {
        const popup = document.getElementById('success-popup');
        if(popup) popup.classList.remove('hidden');
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


// ==========================================
// MANAGE ADMINS LOGIC (With Memory Sync)
// ==========================================

// Pulls data from memory so it persists across reloads!
let departments = JSON.parse(localStorage.getItem('beat_departments')) || []; 
let mockData = { 
    admins: JSON.parse(localStorage.getItem('beat_admins')) || [] 
}; 

let currentFilter = "All Departments";
let currentSearchQuery = "";
let userToDelete = null;

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

function handleSearch(val) {
    currentSearchQuery = val.toLowerCase();
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
    
    // Apply Department Filter
    if (currentFilter !== "All Departments") {
        adminsToDisplay = adminsToDisplay.filter(a => a.dept === currentFilter);
    }

    // Apply Search Filter (Name or ID)
    if (currentSearchQuery) {
        adminsToDisplay = adminsToDisplay.filter(a => 
            a.username.toLowerCase().includes(currentSearchQuery) || 
            a.id.toLowerCase().includes(currentSearchQuery)
        );
    }

    const activeAdmins = adminsToDisplay.filter(a => a.status === "Active");
    const disabledAdmins = adminsToDisplay.filter(a => a.status !== "Active");

    activeTbody.innerHTML = activeAdmins.map(a => `
        <tr class="border-b border-[#1e293b] hover:bg-white/5 transition-colors">
            <td class="px-5 py-4 w-10"></td> 
            <td class="font-bold py-4 px-5 text-white">${escapeHTML(a.username)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.id)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.email)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.dept)}</td>
            <td><span class="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Active</span></td>
            <td><label class="switch"><input type="checkbox" checked onchange="handleStatusToggle(this, '${escapeHTML(a.username)}')"><span class="slider"></span></label></td>
        </tr>`).join('');
        
    disabledTbody.innerHTML = disabledAdmins.map(a => `
        <tr class="hover:bg-white/5 opacity-60">
            <td class="px-5 py-4 w-10"><i data-lucide="trash-2" class="w-4 h-4 text-red-500/60 hover:text-red-500 cursor-pointer transition-colors" onclick="promptDeleteUser('${escapeHTML(a.username)}')"></i></td>
            <td class="font-bold py-4 px-5 text-white">${escapeHTML(a.username)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.id)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.email)}</td>
            <td class="text-[#94a3b8]">${escapeHTML(a.dept)}</td>
            <td><span class="bg-yellow-500/10 text-yellow-500/70 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Disabled</span></td>
            <td><label class="switch"><input type="checkbox" onchange="handleStatusToggle(this, '${escapeHTML(a.username)}')"><span class="slider"></span></label></td>
        </tr>`).join('');
    
    if (window.lucide) lucide.createIcons(); 
}

function promptDeleteUser(username) {
    userToDelete = username;
    const nameSpan = document.getElementById('delete-user-name');
    if(nameSpan) nameSpan.innerText = username;
    openModal('confirm-delete-user-modal');
}

function executeDeleteUser() {
    if(userToDelete) {
        mockData.admins = mockData.admins.filter(a => a.username !== userToDelete);
        
        // SAVE USERS TO MEMORY
        localStorage.setItem('beat_admins', JSON.stringify(mockData.admins));

        userToDelete = null;
        populateAdmins();
    }
    closeModal('confirm-delete-user-modal');
}

function executeDeleteDept() {
    mockData.admins = mockData.admins.filter(a => a.dept !== currentFilter);
    departments = departments.filter(d => d !== currentFilter);
    
    // SAVE BOTH DEPARTMENTS AND USERS TO MEMORY
    localStorage.setItem('beat_departments', JSON.stringify(departments));
    localStorage.setItem('beat_admins', JSON.stringify(mockData.admins));

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
        password: document.getElementById('staff-pass').value, // Saved for Login Validation
        dept: document.getElementById('staff-dept').value,
        status: "Active"
    };
    mockData.admins.push(newUser);
    
    // SAVE USERS TO MEMORY
    localStorage.setItem('beat_admins', JSON.stringify(mockData.admins));

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
    if (name && !departments.includes(name)) { 
        departments.push(name); 
        
        // SAVE DEPARTMENTS TO MEMORY
        localStorage.setItem('beat_departments', JSON.stringify(departments));

        updateDepartmentDropdowns(); 
    }
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
            
            // SAVE STATUS CHANGE TO MEMORY
            localStorage.setItem('beat_admins', JSON.stringify(mockData.admins));
            
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
// UPDATED REPORTS PAGE SPECIFIC LOGIC
// ==========================================

function openReportDetails(card) {
    if(!card) return;
    // Don't open if user is typing in the action box
    if (event.target.closest('button') || event.target.closest('textarea')) return;
    
    document.getElementById('modal-detail-title').innerText = card.querySelector('h3').innerText;
    document.getElementById('modal-detail-datetime').innerText = card.querySelector('.report-date-dark').innerText;
    document.getElementById('modal-detail-desc').innerText = card.querySelector('.line-clamp-3').innerText;
    openModal('view-report-modal');
}

function toggleActionField(btn, type) {
    if (window.event) window.event.stopPropagation();
    const card = btn.closest('.report-card');
    const fieldBox = card.querySelector('#dynamic-action-field');
    const label = card.querySelector('#action-label');
    const confirmBtn = card.querySelector('#action-confirm-btn');
    const textarea = card.querySelector('#action-description');

    // CLEAR TEXT FIELD WHEN SWITCHING ACTIONS
    textarea.value = "";
    textarea.classList.remove('input-error');
    card.querySelector('#action-error').classList.add('hidden');

    if (!fieldBox.classList.contains('hidden') && btn.getAttribute('data-active') === 'true') {
        fieldBox.classList.add('hidden');
        btn.setAttribute('data-active', 'false');
        return;
    }

    card.querySelectorAll('button').forEach(b => b.setAttribute('data-active', 'false'));
    btn.setAttribute('data-active', 'true');
    confirmBtn.setAttribute('data-type', type);

    if (type === 'return') {
        label.innerText = "Reason for Return";
        label.className = "text-[10px] font-bold text-red-400 uppercase";
        confirmBtn.innerText = "Confirm Return to Admin";
        confirmBtn.className = "px-6 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all";
    } else {
        label.innerText = "Resolution Explanation";
        label.className = "text-[10px] font-bold text-emerald-400 uppercase";
        confirmBtn.innerText = "Submit for Resolution";
        confirmBtn.className = "px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all";
    }
    fieldBox.classList.remove('hidden');
}

function promptActionConfirm(type, btn) {
    if (window.event) window.event.stopPropagation();
    const card = btn.closest('.report-card');
    const textarea = card.querySelector('#action-description');
    const errorMsg = card.querySelector('#action-error');

    // RED GLOW VALIDATION
    if (!textarea.value.trim()) {
        textarea.classList.add('input-error'); // Triggers red border glow
        if(errorMsg) errorMsg.classList.remove('hidden');
        return;
    }

    const title = type === 'return' ? "Confirm Return?" : "Confirm Resolution?";
    const body = type === 'return' ? "Do you confirm to return this report to Admin?" : "Do you confirm to submit this resolution?";
    
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-body').innerText = body;
    
    document.getElementById('btn-final-confirm').onclick = () => {
        closeModal('modal-confirm-action');
        card.querySelector('#dynamic-action-field').classList.add('hidden');
        
        document.getElementById('success-title').innerText = "Action Successful";
        document.getElementById('success-body').innerText = type === 'return' ? "Your report is returned." : "Your resolution is submitted.";
        
        textarea.value = ""; // Clear on success
        openModal('action-success-modal');
    };
    
    openModal('modal-confirm-action');
}

function executeFinalAction(type, card) {
    closeModal('modal-confirm-action');
    card.querySelector('#dynamic-action-field').classList.add('hidden');
    
    // Success Message
    document.getElementById('success-title').innerText = "Action Successful";
    document.getElementById('success-body').innerText = type === 'return' ? "Your report is returned." : "Your resolution is submitted.";
    
    // CLEAR TEXTAREA AFTER SUCCESS
    card.querySelector('#action-description').value = "";
    openModal('action-success-modal');
}

function validateNewReport(e) {
    e.preventDefault();
    const fields = ['report-name', 'report-email', 'report-contact', 'report-location', 'report-subject', 'report-desc'];
    let isValid = true;
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        const err = document.getElementById(id + '-error');
        if (el && !el.value.trim()) {
            el.classList.add('input-error');
            if(err) err.classList.remove('hidden');
            isValid = false;
        } else if (id === 'report-email' && el && !el.value.includes('@')) {
            el.classList.add('input-error');
            if(err) err.classList.remove('hidden');
            isValid = false;
        }
    });

    if (isValid) {
        document.getElementById('confirm-title').innerText = "Confirm Submission?";
        document.getElementById('confirm-body').innerText = "Do you confirm to submit this report?";
        
        document.getElementById('btn-final-confirm').onclick = () => {
            closeModal('modal-confirm-action');
            closeModal('new-report-modal');
            document.getElementById('success-title').innerText = "Action Successful";
            document.getElementById('success-body').innerText = "Your report is submitted.";
            openModal('action-success-modal');
            clearAndCloseReport();
        };
        
        openModal('modal-confirm-action');
    }
}

function clearAndCloseReport() {
    ['report-name', 'report-email', 'report-contact', 'report-location', 'report-subject', 'report-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        const err = document.getElementById(id + '-error');
        if(err) err.classList.add('hidden');
    });
}
// ==========================================
// ANNOUNCEMENTS PAGE SPECIFIC LOGIC
// ==========================================
let currentAnnMode = 'create';
let annBlockCount = 1;
let currentEditingCard = null;

let currentActionCard = null;
let currentActionType = '';
let currentUploadedImage = null; 

let annCategories = []; 
let selectedFilterCategory = 'all';
let selectedFormCategory = '';
let categoryToDelete = '';

function renderCategoryDropdowns() {
    const filterMenu = document.getElementById('filter-category-menu');
    if (filterMenu) {
        let html = `<div class="p-2 text-sm text-[#94a3b8] hover:bg-gray-700 cursor-pointer transition-colors" onclick="selectCategory('filter', 'all', 'All Categories')">All Categories</div>`;
        annCategories.forEach(cat => {
            html += `
            <div class="p-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors" onclick="selectCategory('filter', '${escapeHTML(cat)}', '${escapeHTML(cat)}')">
                <span class="truncate pr-2">${escapeHTML(cat)}</span>
                <button onclick="promptDeleteCategory(event, '${escapeHTML(cat)}')" class="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Delete Category"><i data-lucide="minus-circle" class="w-4 h-4"></i></button>
            </div>`;
        });
        filterMenu.innerHTML = html;
    }

    const formMenu = document.getElementById('ann-category-menu');
    if (formMenu) {
        let html = ``;
        annCategories.forEach(cat => {
            html += `
            <div class="p-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex justify-between items-center group transition-colors" onclick="selectCategory('form', '${escapeHTML(cat)}', '${escapeHTML(cat)}')">
                <span class="truncate pr-2">${escapeHTML(cat)}</span>
                <button onclick="promptDeleteCategory(event, '${escapeHTML(cat)}')" class="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Delete Category"><i data-lucide="minus-circle" class="w-4 h-4"></i></button>
            </div>`;
        });
        formMenu.innerHTML = html;
    }
    if(window.lucide) lucide.createIcons();
}

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    if (menu.classList.contains('hidden')) {
        document.querySelectorAll('.cat-dropdown-menu').forEach(el => el.classList.add('hidden'));
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

function selectCategory(type, val, text) {
    if (type === 'filter') {
        selectedFilterCategory = val;
        document.getElementById('filter-category-text').innerText = text;
        document.getElementById('filter-category-text').classList.remove('text-[#94a3b8]');
        if(val === 'all') document.getElementById('filter-category-text').classList.add('text-[#94a3b8]');
        document.getElementById('filter-category-menu').classList.add('hidden');
        checkCategoryRemovable('filter');
        filterAnnouncements();
    } else {
        selectedFormCategory = val;
        document.getElementById('ann-category-text').innerText = text;
        document.getElementById('ann-category-text').classList.remove('text-[#94a3b8]');
        document.getElementById('ann-category-text').classList.add('text-white');
        document.getElementById('ann-category-menu').classList.add('hidden');
        
        const container = document.getElementById('ann-category-container');
        const error = document.getElementById('ann-category-error');
        if(container) container.classList.remove('input-error');
        if(error) error.classList.add('hidden');
        checkCategoryRemovable('form');
    }
}

function checkCategoryRemovable(source) {
    if (source === 'filter') {
        const val = selectedFilterCategory;
        const btn = document.getElementById('btn-remove-filter-cat');
        if (val !== 'all' && val !== '') {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    } else if (source === 'form') {
        const val = selectedFormCategory;
        const btn = document.getElementById('btn-remove-form-cat');
        if (val !== '') {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }
}

function promptDeleteCategory(e, catName) {
    e.stopPropagation();
    document.querySelectorAll('.cat-dropdown-menu').forEach(el => el.classList.add('hidden'));
    categoryToDelete = catName;
    openModal('confirm-delete-cat-modal');
}

function removeCategory(source) {
    if (source === 'filter') {
        categoryToDelete = selectedFilterCategory;
    } else {
        categoryToDelete = selectedFormCategory;
    }
    if (!categoryToDelete || categoryToDelete === 'all') return;
    openModal('confirm-delete-cat-modal');
}

function executeDeleteCategory() {
    annCategories = annCategories.filter(c => c !== categoryToDelete);
    
    if (selectedFilterCategory === categoryToDelete) {
        selectCategory('filter', 'all', 'All Categories');
    }
    if (selectedFormCategory === categoryToDelete) {
        selectedFormCategory = '';
        document.getElementById('ann-category-text').innerText = 'Select a category...';
        document.getElementById('ann-category-text').classList.add('text-[#94a3b8]');
        document.getElementById('ann-category-text').classList.remove('text-white');
        document.getElementById('btn-remove-form-cat').classList.add('hidden');
    }
    
    renderCategoryDropdowns();
    closeModal('confirm-delete-cat-modal');
    filterAnnouncements();
}

function saveCategory() {
    const input = document.getElementById('new-category-name');
    const error = document.getElementById('new-category-error');
    
    if (!input || !input.value.trim()) {
        if (input) input.classList.add('input-error'); // Red Glow
        if (error) error.classList.remove('hidden');
        return;
    }
    
    const newCat = input.value.trim();
    if (!annCategories.includes(newCat)) {
        annCategories.push(newCat);
    }
    
    renderCategoryDropdowns();
    selectCategory('form', newCat, newCat);
    
    // Clear and Close
    input.value = '';
    input.classList.remove('input-error');
    if (error) error.classList.add('hidden');
    closeModal('create-category-modal');
}

function checkCategoryBeforeAnn() {
    if (annCategories.length === 0) {
        openModal('no-category-modal');
    } else {
        openAnnForm('create');
    }
}

function switchAnnTab(tabId) {
    const tabs = ['live', 'queue', 'denied'];
    tabs.forEach(id => {
        const btn = document.getElementById('tab-btn-' + id);
        const grid = document.getElementById('grid-' + id);
        if(!btn || !grid) return;
        
        if (id === tabId) {
            btn.classList.add('text-blue-500', 'border-blue-500');
            btn.classList.remove('text-[#94a3b8]', 'border-transparent', 'hover:text-white');
            grid.classList.remove('hidden');
        } else {
            btn.classList.remove('text-blue-500', 'border-blue-500');
            btn.classList.add('text-[#94a3b8]', 'border-transparent', 'hover:text-white');
            grid.classList.add('hidden');
        }
    });
}

function filterAnnouncements() {
    const calendarEl = document.getElementById('filter-calendar');
    const targetDate = calendarEl ? calendarEl.value : ""; 
    const targetCategory = selectedFilterCategory;

    const tabs = ['grid-live', 'grid-queue', 'grid-denied'];

    tabs.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        let cards = Array.from(grid.querySelectorAll('.ann-card'));

        cards.forEach(card => {
            let show = true;
            const cardRawDate = card.getAttribute('data-raw-date');
            if (targetDate && cardRawDate !== targetDate) show = false;
            
            if (targetCategory !== "all") {
                const badge = card.querySelector('.ann-badge');
                const catText = badge ? badge.innerText.trim() : "";
                if (catText.toUpperCase() !== targetCategory.toUpperCase()) show = false;
            }
            
            if(show) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function setupActionModal(icon, bg, shadow, title, desc, btnText, btnClass) {
    const bgEl = document.getElementById('action-icon-bg');
    const iconEl = document.getElementById('action-icon');
    
    bgEl.style.background = bg;
    bgEl.className = `flex items-center justify-center text-white shadow-lg ${shadow}`;
    iconEl.setAttribute('data-lucide', icon);
    
    document.getElementById('action-title').innerText = title;
    document.getElementById('action-desc').innerText = desc;
    
    const btn = document.getElementById('btn-action-confirm');
    btn.innerText = btnText;
    btn.className = `flex-1 font-bold py-3 rounded-xl text-sm transition-all shadow-sm ${btnClass}`;
    
    if(window.lucide) lucide.createIcons();
    openModal('confirm-action-modal');
}

function triggerApprove(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'approve';
    setupActionModal('check', '#22c55e', 'shadow-green-500/20', 'Approve Announcement?', 'This will move the announcement to the Live tab.', 'Approve', 'bg-transparent border border-green-500 text-green-500 hover:bg-green-500/10');
}

function triggerReject(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'reject';
    setupActionModal('x', '#ef4444', 'shadow-red-500/20', 'Reject Announcement?', 'This will move the announcement to the Denied/Taken Down tab.', 'Reject', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
}

function triggerTakeDown(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takedown';
    setupActionModal('trash-2', '#ef4444', 'shadow-red-500/20', 'Take Down Announcement?', 'This will remove it from live view and move it to the Denied tab.', 'Take Down', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
}

function triggerTakeBack(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takeback';
    setupActionModal('refresh-cw', '#3b82f6', 'shadow-blue-500/20', 'Take Back Announcement?', 'This will restore the announcement to the Approval Queue for review.', 'Restore', 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500/10');
}

function triggerDelete(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'delete';
    setupActionModal('alert-triangle', '#ef4444', 'shadow-red-500/20', 'Delete Permanently?', 'This action cannot be undone. The announcement will be completely erased.', 'Delete', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
}

function executeCardAction() {
    closeModal('confirm-action-modal');
    if(!currentActionCard) return;

    const container = currentActionCard.querySelector('.action-container');

    if (currentActionType === 'approve') {
        currentActionCard.classList.remove('opacity-60');
        // Approved state: Only show Edit button
        container.innerHTML = `
            <button onclick="openAnnForm('edit', this.closest('.ann-card'))" class="bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold py-2 px-8 rounded-lg text-sm transition-colors">Edit</button>
        `;
        document.getElementById('grid-live').appendChild(currentActionCard);
        switchAnnTab('live');

    } else if (currentActionType === 'reject' || currentActionType === 'takedown') {
        currentActionCard.classList.add('opacity-60');
        container.innerHTML = `
            <button onclick="triggerTakeBack(this)" class="flex-1 bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i> Take Back
            </button>
            <button onclick="triggerDelete(this)" class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
              <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Permanently
            </button>
        `;
        document.getElementById('grid-denied').appendChild(currentActionCard);
        switchAnnTab('denied');

    } else if (currentActionType === 'takeback') {
        currentActionCard.classList.remove('opacity-60');
        // Clear buttons when returning to "Waiting for Approval"
        container.innerHTML = ``; 
        document.getElementById('grid-queue').appendChild(currentActionCard);
        switchAnnTab('queue');

    } else if (currentActionType === 'delete') {
        currentActionCard.remove();
    }

    if(window.lucide) lucide.createIcons();
    filterAnnouncements();
}

function openAnnDetails(card) {
    if(!card) return;
    
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-details').classList.remove('hidden');

    const title = card.querySelector('.ann-title').innerText;
    const badge = card.querySelector('.ann-badge');
    const dateText = card.querySelector('.ann-date').innerText;
    
    const coverImgSrc = card.getAttribute('data-cover-image');
    const blocksDataStr = card.getAttribute('data-blocks');
    let blocksData = [];
    try { blocksData = JSON.parse(blocksDataStr.replace(/&quot;/g, '"').replace(/&#039;/g, "'")); } catch(e) {}

    document.getElementById('detail-title').innerText = title;
    const detailBadge = document.getElementById('detail-badge');
    detailBadge.className = badge.className;
    detailBadge.innerText = badge.innerText;
    document.getElementById('detail-date').innerText = dateText;
    
    const coverContainer = document.getElementById('detail-cover-container');
    if (coverImgSrc && coverImgSrc.trim() !== '') {
        coverContainer.innerHTML = `<img src="${coverImgSrc}" class="w-full aspect-video max-h-[500px] object-cover object-center rounded-xl border border-gray-700 shadow-md">`;
        coverContainer.classList.remove('hidden');
    } else {
        coverContainer.innerHTML = '';
        coverContainer.classList.add('hidden');
    }

    const contentContainer = document.getElementById('detail-content');
    contentContainer.innerHTML = '';

    if (blocksData.length === 0) {
        const fallbackContent = card.querySelector('.ann-content-hidden');
        if (fallbackContent) {
            contentContainer.innerHTML = `<div class="mt-12 w-full flex"><div class="w-full"><p class="whitespace-pre-wrap text-slate-300 leading-relaxed">${fallbackContent.innerText}</p></div></div>`;
        }
    } else {
        blocksData.forEach((blk, idx) => {
            let mtClass = idx === 0 ? "mt-12" : "mt-8";
            
            let blkHTML = `<div class="${mtClass} flex flex-col md:flex-row gap-6 items-start">`;
            
            if (blk.image) {
                blkHTML += `<div class="w-full md:w-1/3 flex-shrink-0">
                              <img src="${blk.image}" class="w-full aspect-video object-cover object-center rounded-lg border border-gray-700 shadow-sm">
                            </div>`;
            }
            
            let textWidthClass = blk.image ? "md:w-2/3" : "w-full";
            blkHTML += `<div class="w-full ${textWidthClass} flex flex-col justify-center">`;
            
            if (blk.subtitle) blkHTML += `<h4 class="text-lg font-bold text-white mb-2">${escapeHTML(blk.subtitle)}</h4>`;
            blkHTML += `<p class="whitespace-pre-wrap text-slate-300 leading-relaxed">${escapeHTML(blk.content)}</p>`;
            
            blkHTML += `</div></div>`;
            contentContainer.insertAdjacentHTML('beforeend', blkHTML);
        });
    }
}

function closeAnnDetails() {
    document.getElementById('view-details').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
}

function handleImageUpload(input, previewId) {
    if(input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(previewId);
            if (img) {
                img.src = e.target.result;
                img.classList.remove('hidden');
            }
            const removeBtn = document.getElementById(previewId.replace('preview', 'remove'));
            if(removeBtn) removeBtn.classList.remove('hidden');
            
            if (previewId === 'ann-cover-preview') {
                currentUploadedImage = e.target.result;
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage(previewId) {
    const img = document.getElementById(previewId);
    if (img) {
        img.src = '';
        img.classList.add('hidden');
    }
    const removeBtn = document.getElementById(previewId.replace('preview', 'remove'));
    if(removeBtn) removeBtn.classList.add('hidden');
    
    if (previewId === 'ann-cover-preview') {
        currentUploadedImage = null;
    }
}

function getBlockHTML(id, subtitle = '', content = '', imageSrc = '') {
    const imgClass = imageSrc ? "w-full aspect-video max-h-[250px] object-cover object-center mt-3 rounded-lg border border-gray-700 shadow-sm" : "hidden w-full aspect-video max-h-[250px] object-cover object-center mt-3 rounded-lg border border-gray-700 shadow-sm";
    const removeClass = imageSrc ? "ml-4 text-red-400 hover:text-red-500 text-xs font-bold transition-colors" : "hidden ml-4 text-red-400 hover:text-red-500 text-xs font-bold transition-colors";
    
    return `
      <div class="ann-block border border-gray-700 bg-[#1e2536] rounded-lg p-5 mt-4" id="ann-block-${id}">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">BLOCK ${id}</h4>
          <button type="button" onclick="document.getElementById('ann-block-${id}').remove()" class="text-red-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
        <div class="space-y-4">
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">MEDIA ATTACHMENT</label>
             <div class="modal-input flex flex-col p-3" style="background:var(--surface); border-color:var(--border)">
               <div class="flex items-center">
                   <label class="bg-white text-black font-bold text-xs py-1.5 px-3 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                      Choose File
                      <input type="file" class="hidden" accept="image/*" onchange="handleImageUpload(this, 'block-img-preview-${id}')">
                   </label>
                   <button type="button" class="${removeClass}" id="block-img-remove-${id}" onclick="removeImage('block-img-preview-${id}')"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
               </div>
               <img id="block-img-preview-${id}" src="${imageSrc}" class="${imgClass}">
             </div>
           </div>
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">SUBTITLE (OPTIONAL)</label>
             <input type="text" placeholder="Enter section subtitle" class="block-subtitle modal-input text-sm" value="${escapeHTML(subtitle)}" style="background:var(--surface); border-color:var(--border)">
           </div>
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">TEXT CONTENT <span class="text-red-500">*</span></label>
             <textarea rows="4" placeholder="Enter section content..." class="block-content modal-input text-sm resize-none req-content" style="background:var(--surface); border-color:var(--border)" oninput="clearReqError(this)">${escapeHTML(content)}</textarea>
             <p class="text-[10px] text-red-500 hidden mt-1">Required field</p>
           </div>
        </div>
      </div>
    `;
}

function openAnnForm(mode, card = null) {
    currentAnnMode = mode;
    currentEditingCard = card;
    
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-details').classList.add('hidden');
    document.getElementById('view-form').classList.remove('hidden');
    
    const titleEl = document.getElementById('form-title');
    const iconEl = document.getElementById('form-icon');
    const submitBtn = document.getElementById('btn-submit');
    const backBtnText = document.getElementById('btn-back-text');
    
    const inputTitle = document.getElementById('ann-title');
    
    clearReqError(inputTitle);
    inputTitle.value = '';
    selectCategory('form', '', 'Select a category...');
    removeImage('ann-cover-preview');

    const container = document.getElementById('content-blocks-container');
    container.innerHTML = '';
    annBlockCount = 0;

    if (mode === 'create') {
        if(titleEl) titleEl.innerText = 'Create Announcement';
        if(iconEl) iconEl.setAttribute('data-lucide', 'file-plus');
        if(submitBtn) submitBtn.innerText = 'Submit for Review';
        if(backBtnText) backBtnText.innerText = 'Back to Announcements';
        
        container.insertAdjacentHTML('beforeend', getBlockHTML(1));
        annBlockCount = 1;
    } else if (mode === 'edit' && card) {
        if(titleEl) titleEl.innerText = 'Edit Announcement';
        if(iconEl) iconEl.setAttribute('data-lucide', 'edit-3');
        if(submitBtn) submitBtn.innerText = 'Publish Updated Content';
        if(backBtnText) backBtnText.innerText = 'Cancel Changes';
        
        inputTitle.value = card.querySelector('.ann-title').innerText;
        const category = card.querySelector('.ann-badge').innerText;
        selectCategory('form', category, category);
        checkCategoryRemovable('form');

        const coverImg = card.getAttribute('data-cover-image');
        if(coverImg) {
            const preview = document.getElementById('ann-cover-preview');
            preview.src = coverImg;
            preview.classList.remove('hidden');
            document.getElementById('ann-cover-remove').classList.remove('hidden');
            currentUploadedImage = coverImg;
        }

        const blocksDataStr = card.getAttribute('data-blocks');
        let blocksData = [];
        try { blocksData = JSON.parse(blocksDataStr.replace(/&quot;/g, '"').replace(/&#039;/g, "'")); } catch(e) {}
        
        if (blocksData.length === 0) {
            annBlockCount = 1;
            container.insertAdjacentHTML('beforeend', getBlockHTML(1, '', card.querySelector('.ann-content-hidden').innerText));
        } else {
            blocksData.forEach((blk, idx) => {
                annBlockCount = idx + 1;
                container.insertAdjacentHTML('beforeend', getBlockHTML(annBlockCount, blk.subtitle, blk.content, blk.image));
            });
        }
    }
    if(window.lucide) lucide.createIcons();
}

function addContentBlock() {
    annBlockCount++;
    const container = document.getElementById('content-blocks-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', getBlockHTML(annBlockCount));
        if(window.lucide) lucide.createIcons();
    }
}

function closeAnnForm() {
    document.getElementById('view-form').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
}

function handleAnnBackClick() {
    const titleEl = document.getElementById('confirm-back-title');
    const descEl = document.getElementById('confirm-back-desc');
    
    if (currentAnnMode === 'create') {
        if(titleEl) titleEl.innerText = 'Discard Draft?';
        if(descEl) descEl.innerText = 'Are you sure you want to go back? Your new announcement draft will be lost.';
    } else {
        if(titleEl) titleEl.innerText = 'Discard Changes?';
        if(descEl) descEl.innerText = 'Are you sure you want to cancel? Any unsaved edits will be lost.';
    }
    openModal('confirm-back-modal');
}

function executeAnnBack() {
    closeModal('confirm-back-modal');
    closeAnnForm();
}

function handleAnnFormSubmit() {
    let isValid = true;
    
    const title = document.getElementById('ann-title');
    if(title && !title.value.trim()) {
        title.classList.add('input-error');
        if(title.nextElementSibling) title.nextElementSibling.classList.remove('hidden');
        isValid = false;
    }
    
    if(!selectedFormCategory) {
        const catContainer = document.getElementById('ann-category-container');
        const catError = document.getElementById('ann-category-error');
        if(catContainer) catContainer.classList.add('input-error');
        if(catError) catError.classList.remove('hidden');
        isValid = false;
    }
    
    const contents = document.querySelectorAll('.req-content');
    contents.forEach(ta => {
        if(!ta.value.trim()) {
            ta.classList.add('input-error');
            if(ta.nextElementSibling) ta.nextElementSibling.classList.remove('hidden');
            isValid = false;
        }
    });
    
    if (!isValid) return;

    const confirmTitleEl = document.getElementById('confirm-submit-title');
    const confirmDescEl = document.getElementById('confirm-submit-desc');
    const confirmBtnEl = document.getElementById('btn-confirm-submit');

    if (currentAnnMode === 'create') {
        if(confirmTitleEl) confirmTitleEl.innerText = 'Submit for Review?';
        if(confirmDescEl) confirmDescEl.innerText = 'Are you sure you want to submit this announcement for review?';
        if(confirmBtnEl) confirmBtnEl.innerText = 'Submit';
    } else {
        if(confirmTitleEl) confirmTitleEl.innerText = 'Publish Updates?';
        if(confirmDescEl) confirmDescEl.innerText = 'Are you sure you want to publish these changes to the live announcement?';
        if(confirmBtnEl) confirmBtnEl.innerText = 'Publish';
    }
    openModal('confirm-submit-modal');
}

function executeAnnFormSubmit() {
    closeModal('confirm-submit-modal');
    
    const titleInput = document.getElementById('ann-title');
    const title = titleInput.value;
    const category = selectedFormCategory;
    const coverPreview = document.getElementById('ann-cover-preview');
    const coverImage = (coverPreview && !coverPreview.classList.contains('hidden')) ? coverPreview.src : '';

    const blocksData = [];
    const blockEls = document.querySelectorAll('.ann-block');
    let firstContent = "";
    
    blockEls.forEach((blk, idx) => {
        const sub = blk.querySelector('.block-subtitle').value;
        const txt = blk.querySelector('.block-content').value;
        const imgEl = blk.querySelector('img[id^="block-img-preview-"]');
        const img = (imgEl && !imgEl.classList.contains('hidden')) ? imgEl.src : '';
        blocksData.push({ subtitle: sub, content: txt, image: img });
        if (idx === 0) firstContent = txt; 
    });

    const blocksJSON = escapeHTML(JSON.stringify(blocksData));
    const now = new Date();
    const timeStr = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const dateStr = `Today ${timeStr}`;
    const isoDate = now.toISOString();
    const rawDateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    if (currentAnnMode === 'create') {
        const cardHTML = `
        <div class="ann-card border rounded-xl p-6 shadow-sm flex flex-col h-full relative cursor-pointer hover:border-blue-500/50 transition-colors theme-surface" onclick="openAnnDetails(this)" data-date="${isoDate}" data-raw-date="${rawDateStr}" data-cover-image="${coverImage}" data-blocks="${blocksJSON}">
            <div class="flex justify-between items-start mb-2">
              <h3 class="ann-title text-lg font-bold text-white">${escapeHTML(title)}</h3>
              <span class="ann-badge bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">${escapeHTML(category)}</span>
            </div>
            <p class="text-xs text-[#94a3b8] mb-4">Published <span class="ann-date">${dateStr}</span></p>
            <div class="ann-content-hidden hidden">${escapeHTML(firstContent)}</div>
            <p class="ann-desc text-sm text-slate-300 leading-relaxed mb-6 line-clamp-2">${escapeHTML(firstContent)}</p>
            <div class="mt-auto pt-4 flex gap-3 action-container" onclick="event.stopPropagation()">
              </div>
        </div>`;
        document.getElementById('grid-queue').insertAdjacentHTML('afterbegin', cardHTML);
    } else if (currentAnnMode === 'edit' && currentEditingCard) {
        currentEditingCard.querySelector('.ann-title').innerText = title;
        currentEditingCard.querySelector('.ann-badge').innerText = category;
        currentEditingCard.querySelector('.ann-desc').innerText = firstContent;
        currentEditingCard.setAttribute('data-cover-image', coverImage);
        currentEditingCard.setAttribute('data-blocks', blocksJSON);
    }

    // RESET FORM: Clear title, images, and category selection
    titleInput.value = '';
    removeImage('ann-cover-preview');
    document.getElementById('content-blocks-container').innerHTML = '';
    selectedFormCategory = '';
    const catText = document.getElementById('ann-category-text');
    if (catText) {
        catText.innerText = 'Select a category...';
        catText.classList.add('text-[#94a3b8]');
    }
    
    closeAnnForm(); 
    openModal('success-submit-modal');
    switchAnnTab('queue'); // Move user to "Waiting for Approval" tab
    filterAnnouncements();
}

// ====== PAGE LOAD INITIALIZER ======
document.addEventListener('DOMContentLoaded', () => { 
    if(window.lucide) lucide.createIcons(); 
    
    // Load Manage Admins Logic
    if(document.getElementById('dept-filter') && typeof updateDepartmentDropdowns === 'function') {
        updateDepartmentDropdowns(); 
        populateAdmins(); 
    }
    
    // Load Announcements Logic
    if(document.getElementById('filter-calendar') && typeof renderCategoryDropdowns === 'function') {
        renderCategoryDropdowns();
        filterAnnouncements(); 
    }
});