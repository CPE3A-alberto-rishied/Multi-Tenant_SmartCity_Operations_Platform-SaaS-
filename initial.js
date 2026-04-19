function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const clockTime = document.getElementById('clock-time');
    const clockAmPm = document.getElementById('clock-ampm');
    const clockFullDate = document.getElementById('clock-full-date');
    if (clockTime) clockTime.textContent = `${String(h).padStart(2, '0')}:${m}:${s}`;
    if (clockAmPm) clockAmPm.textContent = ampm;
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    if (clockFullDate) clockFullDate.textContent = now.toLocaleDateString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock();

function showPage(page) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    const nav = document.getElementById('nav-' + page);
    if (nav) nav.classList.add('active');
}

let curDate = new Date();
function renderCal() {
    const grid = document.getElementById('cal-grid');
    const label = document.getElementById('cal-month-label');
    if (!grid || !label) return;
    grid.innerHTML = '';
    const m = curDate.getMonth();
    const y = curDate.getFullYear();
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    label.textContent = `${months[m]} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const d = document.createElement('div');
        d.className = 'cal-day other-month';
        d.style.visibility = 'hidden'; 
        grid.appendChild(d);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const d = document.createElement('div');
        const isTodayHighlight = i === 5 && m === 3 && y === 2026; 
        d.className = 'cal-day' + (isTodayHighlight ? ' today' : '');
        d.textContent = i;
        grid.appendChild(d);
    }
    
    const totalCurrentCells = firstDay + daysInMonth;
    const remainingInRow = (7 - (totalCurrentCells % 7)) % 7;
    for (let i = 1; i <= remainingInRow; i++) {
        const d = document.createElement('div');
        d.className = 'cal-day other-month';
        d.style.visibility = 'hidden';
        grid.appendChild(d);
    }
}
function prevMonth() { curDate.setMonth(curDate.getMonth() - 1); renderCal(); }
function nextMonth() { curDate.setMonth(curDate.getMonth() + 1); renderCal(); }
renderCal();

async function submitReport(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return; 
    }
    
    const data = {
        name: form.querySelector('input[placeholder="Full name"]').value,
        email: form.querySelector('input[type="email"]').value,
        subject: form.querySelector('input[placeholder*="Broken street light"]').value,
        contact: form.querySelector('input[type="tel"]').value,
        address: form.querySelector('input[placeholder="Street address or landmark"]').value,
        description: form.querySelector('textarea').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById('success-modal').classList.add('active'); //
            form.reset();
            form.classList.remove('was-validated');
        }
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

if (window.lucide) lucide.createIcons();    