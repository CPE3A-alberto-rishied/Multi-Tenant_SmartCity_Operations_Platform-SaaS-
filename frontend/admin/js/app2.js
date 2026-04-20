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

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.cat-dropdown-menu').forEach(el => el.classList.add('hidden'));
    }
});

// ==========================================
// REPORTS PAGE SPECIFIC LOGIC
// ==========================================

function openReportDetails(card) {
    if(!card) return;
    
    const title = card.querySelector('h3').innerText;
    const badge = card.querySelector('.badge-status');
    const dateText = card.querySelector('.report-date').innerText;
    const timeText = card.querySelector('.report-date').nextElementSibling.innerText;
    const pTags = card.querySelectorAll('.space-y-1 p');
    let name = "Unknown", loc = "Unknown";
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
    if(modalBadge && badge) {
        modalBadge.className = badge.className;
        modalBadge.innerText = badge.innerText;
    }

    const datetimeBox = document.getElementById('modal-detail-datetime');
    if(datetimeBox) {
        datetimeBox.innerHTML = `${dateText} <span class="mx-1">at</span> ${timeText}`;
    }

    document.getElementById('modal-detail-name').innerText = name;
    document.getElementById('modal-detail-email').innerText = email;
    document.getElementById('modal-detail-contact').innerText = contact;
    document.getElementById('modal-detail-location').innerText = loc;
    document.getElementById('modal-detail-forwarded').innerText = forwarded;
    document.getElementById('modal-detail-desc').innerText = desc;

    openModal('view-report-modal');
}

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

    let departments = JSON.parse(localStorage.getItem('beat_departments')) || []; 

    const newCardHTML = `
        <div class="report-card border rounded-xl p-6 shadow-sm flex flex-col h-full relative cursor-pointer hover:border-blue-500/50 transition-colors theme-surface" onclick="openReportDetails(this)" data-email="${email}" data-contact="${contact}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold text-white report-date">${dateStr}</p>
              <p class="text-xs text-[#94a3b8]">${timeStr}</p>
            </div>
            <span class="badge-status bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">New</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-4 hover:text-blue-400 transition-colors">${escapeHTML(subject)}</h3>
          <div class="space-y-1 text-sm mb-4">
            <p><span class="text-[#94a3b8]">Name of reportee:</span> <span class="text-white font-semibold">${escapeHTML(name)}</span></p>
            <p><span class="text-[#94a3b8]">Location:</span> <span class="text-white font-semibold">${escapeHTML(location)}</span></p>
          </div>
          <div class="text-sm mb-6">
            <p class="text-[#94a3b8] mb-1">Description:</p>
            <p class="text-slate-300 leading-relaxed line-clamp-3">${escapeHTML(desc)}</p>
          </div>
          <div class="mt-auto pt-4 border-t theme-border space-y-4 text-sm" onclick="event.stopPropagation()">
            <div>
              <p class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">FORWARD TO</p>
              <select class="w-full bg-[#1e2536] text-white border border-[#374151] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 cursor-pointer transition-all" onfocus="storePrevValue(this)" onchange="handleForward(this)">
                <option value="" disabled selected hidden>Select department...</option>
                ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
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
    if(typeof filterReports === 'function') filterReports();
}

function clearAndCloseReport() {
    ['report-name', 'report-email', 'report-contact', 'report-location', 'report-subject', 'report-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        clearReqError(el);
    });
    closeModal('new-report-modal');
}

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
        
        card.style.display = show ? 'flex' : 'none'; 
    });
}

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
        if(typeof filterReports === 'function') filterReports();
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
            if(typeof filterReports === 'function') filterReports();
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
            if(typeof filterReports === 'function') filterReports();
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
                <button onclick="promptDeleteCategory(event, '${escapeHTML(cat)}')" class="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Delete Category"><i data-lucide="minus-circle" class="icon-sm"></i></button>
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
                <button onclick="promptDeleteCategory(event, '${escapeHTML(cat)}')" class="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Delete Category"><i data-lucide="minus-circle" class="icon-sm"></i></button>
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
        if(typeof filterAnnouncements === 'function') filterAnnouncements();
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
    if(typeof filterAnnouncements === 'function') filterAnnouncements();
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
    clearReqError(input);
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

function setupActionModal(icon, bgClass, title, desc, btnText, btnClass) {
    const bgEl = document.getElementById('action-icon-bg');
    const iconEl = document.getElementById('action-icon');
    
    bgEl.className = `modal-icon-circle ${bgClass}`;
    iconEl.setAttribute('data-lucide', icon);
    
    document.getElementById('action-title').innerText = title;
    document.getElementById('action-desc').innerText = desc;
    
    const btn = document.getElementById('btn-action-confirm');
    btn.innerText = btnText;
    btn.className = `flex-1 btn-action ${btnClass}`;
    
    if(window.lucide) lucide.createIcons();
    openModal('confirm-action-modal');
}

function triggerApprove(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'approve';
    setupActionModal('check', 'modal-icon-bg-green', 'Approve Announcement?', 'This will move the announcement to the Live tab.', 'Approve', 'border-green-500 text-green-500 hover:bg-green-500/10');
}

function triggerReject(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'reject';
    setupActionModal('x', 'modal-icon-bg-red', 'Reject Announcement?', 'This will move the announcement to the Denied/Taken Down tab.', 'Reject', 'border-red-500 text-red-500 hover:bg-red-500/10');
}

function triggerTakeDown(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takedown';
    setupActionModal('trash-2', 'modal-icon-bg-red', 'Take Down Announcement?', 'This will remove it from live view and move it to the Denied tab.', 'Take Down', 'border-red-500 text-red-500 hover:bg-red-500/10');
}

function triggerTakeBack(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'takeback';
    setupActionModal('refresh-cw', 'modal-icon-bg-blue', 'Take Back Announcement?', 'This will restore the announcement to the Approval Queue for review.', 'Restore', 'bg-blue-600 hover:bg-blue-700 text-white border-transparent');
}

function triggerDelete(btn) {
    currentActionCard = btn.closest('.ann-card');
    currentActionType = 'delete';
    setupActionModal('alert-triangle', 'modal-icon-bg-red', 'Delete Permanently?', 'This action cannot be undone. The announcement will be completely erased.', 'Delete', 'bg-red-500 hover:bg-red-600 text-white border-transparent');
}

function executeCardAction() {
    closeModal('confirm-action-modal');
    if(!currentActionCard) return;

    const container = currentActionCard.querySelector('.action-container');

    if (currentActionType === 'approve') {
        currentActionCard.classList.remove('opacity-60');
        container.innerHTML = `
            <button onclick="openAnnForm('edit', this.closest('.ann-card'))" class="bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold py-2 px-8 rounded-lg text-sm transition-colors">Edit</button>
            <button onclick="triggerTakeDown(this)" class="bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 ml-auto">
              <i data-lucide="trash-2" class="icon-sm"></i> Take Down
            </button>
        `;
        document.getElementById('grid-live').appendChild(currentActionCard);
        switchAnnTab('live');

    } else if (currentActionType === 'reject' || currentActionType === 'takedown') {
        currentActionCard.classList.add('opacity-60');
        container.innerHTML = `
            <button onclick="triggerTakeBack(this)" class="flex-1 btn-primary font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
              <i data-lucide="refresh-cw" class="icon-sm"></i> Take Back
            </button>
            <button onclick="triggerDelete(this)" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm border-transparent">
              <i data-lucide="trash-2" class="icon-sm"></i> Delete Permanently
            </button>
        `;
        document.getElementById('grid-denied').appendChild(currentActionCard);
        switchAnnTab('denied');

    } else if (currentActionType === 'takeback') {
        currentActionCard.classList.remove('opacity-60');
        container.innerHTML = `
            <button onclick="triggerApprove(this)" class="flex-1 bg-transparent border border-green-500 hover:bg-green-500/10 text-green-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              <i data-lucide="check" class="icon-sm"></i> Approve
            </button>
            <button onclick="openAnnForm('edit', this.closest('.ann-card'))" class="flex-1 bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              Edit
            </button>
            <button onclick="triggerReject(this)" class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              <i data-lucide="x" class="icon-sm"></i> Reject
            </button>
        `;
        document.getElementById('grid-queue').appendChild(currentActionCard);
        switchAnnTab('queue');

    } else if (currentActionType === 'delete') {
        currentActionCard.remove();
    }

    if(window.lucide) lucide.createIcons();
    if(typeof filterAnnouncements === 'function') filterAnnouncements();
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
        coverContainer.innerHTML = `<img src="${coverImgSrc}" class="w-full aspect-video max-h-[500px] object-cover object-center rounded-xl border theme-border shadow-md">`;
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
                              <img src="${blk.image}" class="w-full aspect-video object-cover object-center rounded-lg border theme-border shadow-sm">
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
    const imgClass = imageSrc ? "w-full aspect-video max-h-[250px] object-cover object-center mt-3 rounded-lg border theme-border shadow-sm" : "hidden w-full aspect-video max-h-[250px] object-cover object-center mt-3 rounded-lg border theme-border shadow-sm";
    const removeClass = imageSrc ? "ml-4 text-red-400 hover:text-red-500 text-xs font-bold transition-colors" : "hidden ml-4 text-red-400 hover:text-red-500 text-xs font-bold transition-colors";
    
    return `
      <div class="ann-block border theme-border theme-surface-2 rounded-lg p-5 mt-4" id="ann-block-${id}">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">BLOCK ${id}</h4>
          <button type="button" onclick="document.getElementById('ann-block-${id}').remove()" class="text-red-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="icon-sm"></i></button>
        </div>
        <div class="space-y-4">
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">MEDIA ATTACHMENT</label>
             <div class="modal-input flex flex-col p-3 theme-surface">
               <div class="flex items-center">
                   <label class="bg-white text-black font-bold text-xs py-1.5 px-3 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                      Choose File
                      <input type="file" class="hidden" accept="image/*" onchange="handleImageUpload(this, 'block-img-preview-${id}')">
                   </label>
                   <button type="button" class="${removeClass}" id="block-img-remove-${id}" onclick="removeImage('block-img-preview-${id}')"><i data-lucide="trash-2" class="icon-sm"></i></button>
               </div>
               <img id="block-img-preview-${id}" src="${imageSrc}" class="${imgClass}">
             </div>
           </div>
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">SUBTITLE (OPTIONAL)</label>
             <input type="text" placeholder="Enter section subtitle" class="block-subtitle modal-input text-sm theme-surface" value="${escapeHTML(subtitle)}">
           </div>
           <div>
             <label class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">TEXT CONTENT <span class="text-red-500">*</span></label>
             <textarea rows="4" placeholder="Enter section content..." class="block-content modal-input text-sm resize-none req-content theme-surface" oninput="clearReqError(this)">${escapeHTML(content)}</textarea>
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

    const btnFormRemove = document.getElementById('btn-remove-form-cat');
    if (btnFormRemove) btnFormRemove.classList.add('hidden');

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
    closeAnnForm(); 
    openModal('success-submit-modal');

    const title = document.getElementById('ann-title').value;
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
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minStr = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minStr}${ampm}`;
    const dateStr = `Today ${timeStr}`;
    const isoDate = now.toISOString();
    const rawDateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    const badgeClass = "bg-green-500/10 text-green-400 border border-green-500/20";

    if (currentAnnMode === 'create') {
        const cardHTML = `
        <div class="ann-card border rounded-xl p-6 shadow-sm flex flex-col h-full relative cursor-pointer hover:border-blue-500/50 transition-colors theme-surface" onclick="openAnnDetails(this)" data-date="${isoDate}" data-raw-date="${rawDateStr}" data-cover-image="${coverImage}" data-blocks="${blocksJSON}">
            <div class="flex justify-between items-start mb-2">
              <h3 class="ann-title text-lg font-bold text-white">${escapeHTML(title)}</h3>
              <span class="ann-badge ${badgeClass} px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">${escapeHTML(category)}</span>
            </div>
            <p class="text-xs text-[#94a3b8] mb-4">Published <span class="ann-date">${dateStr}</span></p>
            <div class="ann-content-hidden hidden">${escapeHTML(firstContent)}</div>
            <p class="ann-desc text-sm text-slate-300 leading-relaxed mb-6 line-clamp-2">${escapeHTML(firstContent)}</p>
            <div class="mt-auto pt-4 flex gap-3 action-container" onclick="event.stopPropagation()">
              <button onclick="triggerApprove(this)" class="flex-1 bg-transparent border border-green-500 hover:bg-green-500/10 text-green-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <i data-lucide="check" class="icon-sm"></i> Approve
              </button>
              <button onclick="openAnnForm('edit', this.closest('.ann-card'))" class="flex-1 bg-transparent border border-blue-500 hover:bg-blue-500/10 text-blue-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                Edit
              </button>
              <button onclick="triggerReject(this)" class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <i data-lucide="x" class="icon-sm"></i> Reject
              </button>
            </div>
        </div>
        `;
        const gridQueue = document.getElementById('grid-queue');
        if(gridQueue) gridQueue.insertAdjacentHTML('afterbegin', cardHTML);
        
        if(window.lucide) lucide.createIcons();
        switchAnnTab('queue');
        if(typeof filterAnnouncements === 'function') filterAnnouncements();
    } else if (currentAnnMode === 'edit' && currentEditingCard) {
        currentEditingCard.querySelector('.ann-title').innerText = title;
        currentEditingCard.querySelector('.ann-badge').className = `ann-badge ${badgeClass} px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase`;
        currentEditingCard.querySelector('.ann-badge').innerText = category;
        currentEditingCard.querySelector('.ann-desc').innerText = firstContent;
        
        currentEditingCard.setAttribute('data-cover-image', coverImage);
        currentEditingCard.setAttribute('data-blocks', blocksJSON);
    }
}

// ====== DYNAMIC INITIALIZER (Sidebar globally synced) ======
document.addEventListener('DOMContentLoaded', () => { 
    if(window.lucide) lucide.createIcons(); 

    // 1. Pull current user data from memory
    const activeDept = localStorage.getItem('activeDepartment') || 'Traffic Department';
    const activeName = localStorage.getItem('activeUserName') || 'Dept Admin';

    // 2. Update Sidebar text globally across all *2.html pages
    const subTitles = document.querySelectorAll('.user-footer-sub');
    subTitles.forEach(el => el.innerText = activeDept);

    const nameTitles = document.querySelectorAll('.user-footer-name');
    nameTitles.forEach(el => el.innerText = activeName);

    const initBadge = document.querySelectorAll('#nav-avatar');
    initBadge.forEach(el => {
        if(activeName) el.innerText = activeName.charAt(0).toUpperCase(); 
    });

    // 3. Lock the Reports Data to ONLY show this department
    const deptFilter = document.getElementById('filter-dept');
    if (deptFilter) {
        const shortDeptName = activeDept.replace(' Department', '').trim();
        
        let optionExists = Array.from(deptFilter.options).some(opt => opt.value === shortDeptName);
        if (!optionExists) {
            const newOpt = document.createElement('option');
            newOpt.value = shortDeptName;
            newOpt.text = shortDeptName;
            deptFilter.appendChild(newOpt);
        }

        deptFilter.value = shortDeptName;
        deptFilter.disabled = true; 
        deptFilter.classList.add('opacity-50', 'cursor-not-allowed');

        if(typeof filterReports === 'function') filterReports(); 
    }
    
    // 4. Initialize existing Announcements logic
    if(document.getElementById('filter-calendar') && typeof renderCategoryDropdowns === 'function') {
        renderCategoryDropdowns();
        if(typeof filterAnnouncements === 'function') filterAnnouncements(); 
    }
});
// Add/Replace this at the very bottom of your app2.js
document.addEventListener('DOMContentLoaded', () => { 
    if(window.lucide) lucide.createIcons(); 

    // 1. SYNC SIDEBAR: Pull current user data from memory
    const activeDept = localStorage.getItem('activeDepartment') || 'Traffic Department';
    const activeName = localStorage.getItem('activeUserName') || 'Dept Admin';

    // 2. Inject Names/Titles to remove placeholders
    document.querySelectorAll('.user-footer-sub').forEach(el => el.innerText = activeDept);
    document.querySelectorAll('.user-footer-name').forEach(el => el.innerText = activeName);

    const initBadge = document.querySelectorAll('#nav-avatar');
    initBadge.forEach(el => {
        el.innerText = activeName.charAt(0).toUpperCase(); 
    });

    // 3. Page Specific Logic (Filters/Dropdowns)
    const deptFilter = document.getElementById('filter-dept');
    if (deptFilter) {
        const shortDeptName = activeDept.replace(' Department', '').trim();
        deptFilter.value = shortDeptName;
        deptFilter.disabled = true; 
        deptFilter.classList.add('opacity-50', 'cursor-not-allowed');
        if(typeof filterReports === 'function') filterReports(); 
    }
    
    if(document.getElementById('filter-calendar') && typeof renderCategoryDropdowns === 'function') {
        renderCategoryDropdowns();
        if(typeof filterAnnouncements === 'function') filterAnnouncements(); 
    }
});