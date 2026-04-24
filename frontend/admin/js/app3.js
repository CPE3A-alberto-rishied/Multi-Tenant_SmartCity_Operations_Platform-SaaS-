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
    localStorage.removeItem('activeDepartment');
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

    const isMasterAdmin = (inputId === '2023104513' && inputPass === 'admin123');

    let savedAdmins = JSON.parse(localStorage.getItem('beat_admins')) || [];
    const foundAdmin = savedAdmins.find(a => a.id === inputId);

    if (!isMasterAdmin && !foundAdmin) {
        userEl.classList.add('input-error');
        userErr.innerText = "No account made for that ID.";
        userErr.classList.remove('hidden');
        return;
    }

    if (!isMasterAdmin && foundAdmin && foundAdmin.password !== inputPass) {
        passEl.classList.add('input-error');
        passErr.innerText = "Wrong credentials input.";
        passErr.classList.remove('hidden');
        return;
    }

    if (!isMasterAdmin && foundAdmin && foundAdmin.status === "Disabled") {
        userEl.classList.add('input-error');
        userErr.innerText = "This account is disabled.";
        userErr.classList.remove('hidden');
        return;
    }
    
    let activeDept = isMasterAdmin ? "Main Admin" : foundAdmin.dept;
    localStorage.setItem('activeDepartment', activeDept);

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
        const activeDept = localStorage.getItem('activeDepartment');
        if (activeDept === 'Main Admin') {
            window.location.href = "dashboard.html"; 
        } else if (activeDept === 'Traffic') {
            window.location.href = "dashboard2.html"; 
        } else {
            window.location.href = "dashboard3.html";
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
// REPORTS PAGE LOGIC
// ==========================================
function openReportDetails(card) {
    if(!card) return;
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

    if (!textarea.value.trim()) {
        textarea.classList.add('input-error'); 
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
        
        textarea.value = ""; 
        openModal('action-success-modal');
    };
    
    openModal('modal-confirm-action');
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
// 🚨 DRRMO MONGODB LOGIC (announcements3) 🚨
// ==========================================
let currentAnnMode = 'create';
let annBlockCount = 1;
let currentEditingCard = null;

let currentActionCard = null;
let currentActionType = '';

let annCategories = []; 
let selectedFilterCategory = 'all';
let selectedFormCategory = '';
let categoryToDelete = '';

// FETCH DRRMO ANNOUNCEMENTS
async function fetchDrrmoAnnouncements() {
    try {
        const response = await fetch('https://beat-pasig-api.onrender.com/api/announcements3/all');
        const result = await response.json();

        if (result.success && result.data) {
            const gridLive = document.getElementById('grid-live');
            const gridQueue = document.getElementById('grid-queue');
            const gridDenied = document.getElementById('grid-denied');
            
            if (gridLive) gridLive.innerHTML = '';
            if (gridQueue) gridQueue.innerHTML = '';
            if (gridDenied) gridDenied.innerHTML = '';

            let liveCount = 0;

            result.data.forEach(ann => {
                const dateObj = new Date(ann.createdAt);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = `${dateObj.toLocaleDateString()} ${timeStr}`;
                const isoDate = dateObj.toISOString();
                const rawDateStr = isoDate.split('T')[0];

                let badgeClass = "bg-green-500/10 text-green-400 border border-green-500/20";
                let actionButtons = '';
                let targetGrid = '';

                if (ann.status === 'Queue') {
                    targetGrid = 'grid-queue';
                    actionButtons = `
                        <button onclick="triggerApprove(this)" class="flex-1 bg-transparent border border-green-500 hover:bg-green-500/10 text-green-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"><i data-lucide="check" class="w-4 h-4"></i> Approve</button>
                        <button onclick="triggerReject(this)" class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"><i data-lucide="x" class="w-4 h-4"></i> Reject</button>
                    `;
                } else if (ann.status === 'Live') {
                    targetGrid = 'grid-live';
                    liveCount++;
                    actionButtons = `
                        <button onclick="openAnnForm('edit', this.closest('.ann-card'))" class="bg-transparent border border-orange-500 hover:bg-orange-500/10 text-orange-500 font-bold py-2 px-8 rounded-lg text-sm transition-colors">Edit</button>
                        <button onclick="triggerTakeDown(this)" class="bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 ml-auto"><i data-lucide="trash-2" class="w-4 h-4"></i> Take Down</button>
                    `;
                } else if (ann.status === 'Denied') {
                    targetGrid = 'grid-denied';
                    badgeClass = "bg-red-500/10 text-red-400 border border-red-500/20";
                    actionButtons = `
                        <button onclick="triggerTakeBack(this)" class="flex-1 bg-transparent border border-orange-500 hover:bg-orange-500/10 text-orange-500 font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Take Back</button>
                        <button onclick="triggerDelete(this)" class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete Permanently</button>
                    `;
                }

                const cardHTML = `
                <div class="ann-card border rounded-xl p-6 shadow-sm flex flex-col h-full relative cursor-pointer hover:border-orange-500/50 transition-colors theme-surface ${ann.status === 'Denied' ? 'opacity-60' : ''}" 
                     onclick="openAnnDetails(this)" data-id="${ann._id}" data-date="${isoDate}" data-raw-date="${rawDateStr}" data-blocks="${escapeHTML(ann.blocks || '[]')}">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="ann-title text-lg font-bold text-white">${escapeHTML(ann.title)}</h3>
                      <span class="ann-badge ${badgeClass} px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">${escapeHTML(ann.category)}</span>
                    </div>
                    <p class="text-xs text-[#94a3b8] mb-4">Published <span class="ann-date">${dateStr}</span></p>
                    <div class="ann-content-hidden hidden">${escapeHTML(ann.content)}</div>
                    <p class="ann-desc text-sm text-slate-300 leading-relaxed mb-6 line-clamp-2">${escapeHTML(ann.content)}</p>
                    <div class="mt-auto pt-4 flex gap-3 action-container" onclick="event.stopPropagation()">
                      ${actionButtons}
                    </div>
                </div>`;
                
                const gridEl = document.getElementById(targetGrid);
                if (gridEl) gridEl.insertAdjacentHTML('beforeend', cardHTML);
            });

            const dashCount = document.getElementById('announcement-count');
            if (dashCount) dashCount.innerText = liveCount;

            if(window.lucide) lucide.createIcons();
            filterAnnouncements();
        }
    } catch(e) { console.error("Error fetching DRRMO announcements:", e); }
}

async function executeAnnFormSubmit() {
    closeModal('confirm-submit-modal');
    
    const titleInput = document.getElementById('ann-title');
    const title = titleInput.value;
    const category = selectedFormCategory;

    const blocksData = [];
    const blockEls = document.querySelectorAll('.ann-block');
    let firstContent = "";
    
    blockEls.forEach((blk, idx) => {
        const sub = blk.querySelector('.block-subtitle').value;
        const txt = blk.querySelector('.block-content').value;
        blocksData.push({ subtitle: sub, content: txt, image: "" }); 
        if (idx === 0) firstContent = txt; 
    });

    const blocksJSON = escapeHTML(JSON.stringify(blocksData));

    if (currentAnnMode === 'create') {
        try {
            await fetch('https://beat-pasig-api.onrender.com/api/announcements3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: title, category: category, coverImage: "", 
                    content: firstContent, blocks: blocksJSON, status: 'Queue' 
                })
            });
        } catch(err) { console.error("DB Save Error:", err); }
    } else if (currentAnnMode === 'edit' && currentEditingCard) {
        const dbId = currentEditingCard.getAttribute('data-id');
        try {
            await fetch(`https://beat-pasig-api.onrender.com/api/announcements3/${dbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category, content: firstContent, blocks: blocksJSON })
            });
        } catch(err) { console.error("DB Update Error:", err); }
    }

    titleInput.value = '';
    document.getElementById('content-blocks-container').innerHTML = '';
    selectedFormCategory = '';
    const catText = document.getElementById('ann-category-text');
    if (catText) {
        catText.innerText = 'Select a category...';
        catText.classList.add('text-[#94a3b8]');
    }
    
    closeAnnForm(); 
    openModal('success-submit-modal');
    switchAnnTab('queue');
    fetchDrrmoAnnouncements(); 
}

async function executeCardAction() {
    closeModal('confirm-action-modal');
    if(!currentActionCard) return;

    const dbId = currentActionCard.getAttribute('data-id'); 
    let newStatus = 'Queue';
    
    if (currentActionType === 'approve') newStatus = 'Live';
    if (currentActionType === 'reject' || currentActionType === 'takedown') newStatus = 'Denied';

    if (dbId) {
        try {
            if (currentActionType === 'delete') {
                await fetch(`https://beat-pasig-api.onrender.com/api/announcements3/${dbId}`, { method: 'DELETE' });
                currentActionCard.remove();
                openModal('success-submit-modal');
                return;
            } 
            
            await fetch(`https://beat-pasig-api.onrender.com/api/announcements3/${dbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDrrmoAnnouncements(); 
        } catch(err) { console.error("DB Action Error:", err); }
    }
    openModal('success-submit-modal');
}

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
    }
}

function promptDeleteCategory(e, catName) {
    e.stopPropagation();
    document.querySelectorAll('.cat-dropdown-menu').forEach(el => el.classList.add('hidden'));
    categoryToDelete = catName;
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
    }
    
    renderCategoryDropdowns();
    closeModal('confirm-delete-cat-modal');
    filterAnnouncements();
}

function saveCategory() {
    const input = document.getElementById('new-category-name');
    const error = document.getElementById('new-category-error');
    
    if (!input || !input.value.trim()) {
        if (input) input.classList.add('input-error'); 
        if (error) error.classList.remove('hidden');
        return;
    }
    
    const newCat = input.value.trim();
    if (!annCategories.includes(newCat)) {
        annCategories.push(newCat);
    }
    
    renderCategoryDropdowns();
    selectCategory('form', newCat, newCat);
    
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
            btn.classList.add('text-orange-500', 'border-orange-500');
            btn.classList.remove('text-[#94a3b8]', 'border-transparent', 'hover:text-white');
            grid.classList.remove('hidden');
        } else {
            btn.classList.remove('text-orange-500', 'border-orange-500');
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
    bgEl.className = `mx-auto flex items-center justify-center w-14 h-14 rounded-full mb-4 shadow-lg ${shadow}`;
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
    setupActionModal('check', 'rgba(34, 197, 94, 0.1)', 'shadow-green-500/20', 'Approve Announcement?', 'This will move the announcement to the Live tab.', 'Approve', 'bg-transparent border border-green-500 text-green-500 hover:bg-green-500/10');
    document.getElementById('action-icon').classList.add('text-green-500');
}

function triggerReject(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'reject';
    setupActionModal('x', 'rgba(239, 68, 68, 0.1)', 'shadow-red-500/20', 'Reject Announcement?', 'This will move the announcement to the Denied/Taken Down tab.', 'Reject', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
    document.getElementById('action-icon').classList.add('text-red-500');
}

function triggerTakeDown(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takedown';
    setupActionModal('trash-2', 'rgba(239, 68, 68, 0.1)', 'shadow-red-500/20', 'Take Down Announcement?', 'This will remove it from live view and move it to the Denied tab.', 'Take Down', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
    document.getElementById('action-icon').classList.add('text-red-500');
}

function triggerTakeBack(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takeback';
    setupActionModal('refresh-cw', 'rgba(249, 115, 22, 0.1)', 'shadow-orange-500/20', 'Take Back Announcement?', 'This will restore the announcement to the Approval Queue for review.', 'Restore', 'bg-transparent border border-orange-500 text-orange-500 hover:bg-orange-500/10');
    document.getElementById('action-icon').classList.add('text-orange-500');
}

function triggerDelete(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'delete';
    setupActionModal('alert-triangle', 'rgba(239, 68, 68, 0.1)', 'shadow-red-500/20', 'Delete Permanently?', 'This action cannot be undone. The announcement will be completely erased.', 'Delete', 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10');
    document.getElementById('action-icon').classList.add('text-red-500');
}


function openAnnDetails(card) {
    if(!card) return;
    
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-details').classList.remove('hidden');

    const title = card.querySelector('.ann-title').innerText;
    const badge = card.querySelector('.ann-badge');
    const dateText = card.querySelector('.ann-date').innerText;
    
    const blocksDataStr = card.getAttribute('data-blocks');
    let blocksData = [];
    try { blocksData = JSON.parse(blocksDataStr.replace(/&quot;/g, '"').replace(/&#039;/g, "'")); } catch(e) {}

    document.getElementById('detail-title').innerText = title;
    const detailBadge = document.getElementById('detail-badge');
    detailBadge.className = badge.className;
    detailBadge.innerText = badge.innerText;
    document.getElementById('detail-date').innerText = dateText;

    const contentContainer = document.getElementById('detail-content');
    contentContainer.innerHTML = '';

    if (blocksData.length === 0) {
        const fallbackContent = card.querySelector('.ann-content-hidden');
        if (fallbackContent) {
            contentContainer.innerHTML = `<div class="mt-8 w-full flex"><div class="w-full"><p class="whitespace-pre-wrap text-slate-300 leading-relaxed">${fallbackContent.innerText}</p></div></div>`;
        }
    } else {
        blocksData.forEach((blk, idx) => {
            let mtClass = idx === 0 ? "mt-4" : "mt-8";
            let blkHTML = `<div class="${mtClass} flex flex-col md:flex-row gap-6 items-start">`;
            blkHTML += `<div class="w-full flex flex-col justify-center">`;
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

function getBlockHTML(id, subtitle = '', content = '') {
    return `
      <div class="ann-block border border-gray-700 bg-[#1e2536] rounded-lg p-5 mt-4" id="ann-block-${id}">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-[10px] font-bold text-orange-400 uppercase tracking-widest">BLOCK ${id}</h4>
          <button type="button" onclick="document.getElementById('ann-block-${id}').remove()" class="text-red-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
        <div class="space-y-4">
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

        const blocksDataStr = card.getAttribute('data-blocks');
        let blocksData = [];
        try { blocksData = JSON.parse(blocksDataStr.replace(/&quot;/g, '"').replace(/&#039;/g, "'")); } catch(e) {}
        
        if (blocksData.length === 0) {
            annBlockCount = 1;
            container.insertAdjacentHTML('beforeend', getBlockHTML(1, '', card.querySelector('.ann-content-hidden').innerText));
        } else {
            blocksData.forEach((blk, idx) => {
                annBlockCount = idx + 1;
                container.insertAdjacentHTML('beforeend', getBlockHTML(annBlockCount, blk.subtitle, blk.content));
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

// ==========================================
// ON PAGE LOAD COMBINED INITIALIZER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if(document.getElementById('filter-calendar') && typeof renderCategoryDropdowns === 'function') {
        renderCategoryDropdowns();
        fetchDrrmoAnnouncements(); // Hits MongoDB Announcements3
    }

    async function fetchWeather() {
        const weatherContainer = document.getElementById('weather-forecast-container');
        const heatIndexVal = document.getElementById('heat-index-val');
        const aqiVal = document.getElementById('aqi-val');

        if (!weatherContainer) return;

        try {
            const weatherResponse = await fetch('https://api.open-meteo.com/v1/forecast?latitude=14.5764&longitude=121.0851&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Asia%2FSingapore');
            const weatherData = await weatherResponse.json();
            const current = weatherData.current;
            
            const aqiResponse = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=14.5764&longitude=121.0851&current=us_aqi&timezone=Asia%2FSingapore');
            const aqiData = await aqiResponse.json();
            const currentAqi = aqiData.current.us_aqi;
            
            if (heatIndexVal) heatIndexVal.innerText = `${current.apparent_temperature} °C`;
            if (aqiVal) aqiVal.innerText = currentAqi;

            const isRaining = current.weather_code >= 50;
            const weatherDesc = isRaining ? "Rainy" : "Clear / Cloudy";
            const icon = isRaining ? "cloud-rain" : "cloud-sun";
            const iconColor = isRaining ? "text-blue-400" : "text-yellow-400";

            weatherContainer.innerHTML = `
                <div class="flex flex-col border theme-border rounded-xl p-4 theme-surface-2">
                    <span class="text-xs text-[#94a3b8] uppercase mb-1">Status</span>
                    <span class="text-xl font-bold text-white flex items-center gap-2">
                        <i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i> ${weatherDesc}
                    </span>
                </div>
                <div class="flex flex-col border theme-border rounded-xl p-4 theme-surface-2">
                    <span class="text-xs text-[#94a3b8] uppercase mb-1">Temperature</span>
                    <span class="text-xl font-bold text-white">${current.temperature_2m}°C</span>
                </div>
                <div class="flex flex-col border theme-border rounded-xl p-4 theme-surface-2">
                    <span class="text-xs text-[#94a3b8] uppercase mb-1">Humidity</span>
                    <span class="text-xl font-bold text-white">${current.relative_humidity_2m}%</span>
                </div>
                <div class="flex flex-col border theme-border rounded-xl p-4 theme-surface-2">
                    <span class="text-xs text-[#94a3b8] uppercase mb-1">Wind Speed</span>
                    <span class="text-xl font-bold text-white">${current.wind_speed_10m} km/h</span>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons(); 
        } catch (error) {
            console.error("Failed to fetch data:", error);
            weatherContainer.innerHTML = '<p class="text-rose-500 text-sm">Failed to load weather data.</p>';
            if (heatIndexVal) heatIndexVal.innerText = "Error";
            if (aqiVal) aqiVal.innerText = "Error";
        }
    }

    function syncEvacuationData() {
        const evacEl = document.getElementById('evacuation-count');
        if (evacEl) {
            const activeEvacs = localStorage.getItem('activeEvacuations') || '0';
            evacEl.innerText = activeEvacs;
        }
    }

    function syncReportsData() {
        const reportsEl = document.getElementById('reports-count');
        if (reportsEl) {
            const totalReports = localStorage.getItem('totalReports') || '0';
            reportsEl.innerText = totalReports;
        }
    }

    fetchWeather();
    syncEvacuationData();
    syncReportsData();
});