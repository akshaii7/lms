// ================================================================
//  BookVault – Professional Library Management System
//  script.js – Full Logic
// ================================================================

// ── STATE ──────────────────────────────────────────────────────
let currentUser = null;
let books = [];
let sidebarOpen = false;   // mobile toggle

// ── INIT ───────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    startClock();
    await loadBooks();
    refreshCounts();
    showSection('signup');
    watchAddForm();        // live preview on Add Book page
});

// ================================================================
//  CLOCK
// ================================================================
function startClock() {
    function tick() {
        const d = new Date();
        const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const fh = (h % 12 || 12).toString().padStart(2, '0');
        const fm = m.toString().padStart(2, '0');
        const fs = s.toString().padStart(2, '0');
        const txt = `${fh}:${fm}:${fs} ${ampm}`;
        document.getElementById('tbTime').textContent = txt;
    }
    tick();
    setInterval(tick, 1000);
}

// ================================================================
//  TOAST
// ================================================================
const ICONS = { success: 'ri-checkbox-circle-line', error: 'ri-close-circle-line', info: 'ri-information-line' };

function toast(msg, type = 'info') {
    const box = document.getElementById('toastBox');
    const el = document.createElement('div');
    el.className = `toast-item t-${type}`;
    el.innerHTML = `
        <i class="${ICONS[type] || ICONS.info} ti-icon"></i>
        <span class="ti-msg">${esc(msg)}</span>
    `;
    box.appendChild(el);
    setTimeout(() => {
        el.classList.add('fade-out');
        setTimeout(() => el.remove(), 320);
    }, 3200);
}

// ================================================================
//  SIDEBAR (mobile)
// ================================================================
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sidebarOpen = !sidebarOpen;
    sb.classList.toggle('mob-open', sidebarOpen);
}

// ================================================================
//  SECTION NAVIGATION
// ================================================================
const SECTIONS = {
    signup: { label: 'Sign Up', icon: 'ri-user-add-line', nav: 'nb-signup' },
    login: { label: 'Login', icon: 'ri-login-circle-line', nav: 'nb-login' },
    dashboard: { label: 'Dashboard', icon: 'ri-dashboard-3-line', nav: 'nb-dashboard' },
    addBook: { label: 'Add Book', icon: 'ri-add-circle-line', nav: 'nb-addBook' },
    viewBook: { label: 'All Books', icon: 'ri-book-2-line', nav: 'nb-viewBook' },
    search: { label: 'Search Books', icon: 'ri-search-line', nav: 'nb-search' },
};

const AUTH_REQUIRED = ['dashboard', 'addBook', 'viewBook', 'search'];

function showSection(id) {
    if (AUTH_REQUIRED.includes(id) && !currentUser) {
        toast('Please login first to access this feature', 'error');
        id = 'login';
    }

    // hide all
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    // show target
    const page = document.getElementById(id);
    if (page) page.classList.add('active');

    // activate nav button
    const meta = SECTIONS[id];
    if (meta) {
        const nb = document.getElementById(meta.nav);
        if (nb) nb.classList.add('active');
        document.getElementById('bcPage').textContent = meta.label;
    }

    // side effects
    if (id === 'viewBook') { renderBooks(); }
    if (id === 'dashboard') { renderDashboard(); }
    if (id === 'search') { setTimeout(() => document.getElementById('bigSearchQ')?.focus(), 100); }

    // close mobile sidebar
    document.getElementById('sidebar').classList.remove('mob-open');
    sidebarOpen = false;
}

// ================================================================
//  PASSWORD TOGGLE
// ================================================================
function togglePass(inputId, btn) {
    const inp = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (inp.type === 'password') {
        inp.type = 'text';
        icon.className = 'ri-eye-off-line';
    } else {
        inp.type = 'password';
        icon.className = 'ri-eye-line';
    }
}

// ================================================================
//  STORAGE
// ================================================================
async function loadBooks() {
    const stored = localStorage.getItem('bookvault_books');
    if (stored) { books = JSON.parse(stored) || []; return; }

    try {
        const r = await fetch('books.json');
        const d = await r.json();
        books = d.books || [];
        persist();
    } catch { books = []; }
}

function persist() {
    localStorage.setItem('bookvault_books', JSON.stringify(books));
    refreshCounts();
}

function refreshCounts() {
    const n = books.length;
    document.getElementById('pillCount').textContent = n;
    document.getElementById('sbTotal').textContent = n;
    document.getElementById('topTotal').textContent = n;
}

// ================================================================
//  AUTH – SIGN UP
// ================================================================
function signup() {
    const username = val('su_user');
    const email = val('su_email');
    const phone = val('su_phone');
    const password = val('su_pass');

    if (!username) { toast('Username is required', 'error'); return; }
    if (!password) { toast('Password is required', 'error'); return; }
    if (password.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }

    let users = getUsers();

    if (users.find(u => u.username === username)) {
        toast('Username already taken. Try another.', 'error');
        return;
    }

    users.push({ username, email, phone, password });
    localStorage.setItem('bookvault_users', JSON.stringify(users));

    toast(`Account created! Welcome, ${username} 🎉`, 'success');
    clear('su_user', 'su_email', 'su_phone', 'su_pass');
    showSection('login');
}

// ================================================================
//  AUTH – LOGIN
// ================================================================
function login() {
    const username = val('li_user');
    const password = val('li_pass');

    if (!username || !password) { toast('Fill in all fields', 'error'); return; }

    const user = getUsers().find(u => u.username === username && u.password === password);
    if (!user) { toast('Invalid username or password', 'error'); return; }

    currentUser = username;

    // Update UI
    const initial = username.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = username;
    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileAvatar').style.cssText = 'font-size:15px;font-weight:800;';
    document.getElementById('statusDot').classList.add('online');
    document.getElementById('statusText').textContent = 'Online';
    document.getElementById('tbUserName').textContent = username;

    toast(`Welcome back, ${username}! 👋`, 'success');
    clear('li_user', 'li_pass');
    showSection('dashboard');
}

// ================================================================
//  AUTH – LOGOUT
// ================================================================
function logout() {
    if (!currentUser) { toast('You are not logged in', 'info'); return; }
    toast(`Goodbye, ${currentUser}!`, 'info');
    currentUser = null;
    document.getElementById('profileName').textContent = 'Guest User';
    document.getElementById('profileAvatar').innerHTML = '<i class="ri-user-3-line"></i>';
    document.getElementById('profileAvatar').removeAttribute('style');
    document.getElementById('statusDot').classList.remove('online');
    document.getElementById('statusText').textContent = 'Offline';
    document.getElementById('tbUserName').textContent = 'Guest';
    showSection('login');
}

// ================================================================
//  ADD BOOK
// ================================================================
function addBook() {
    if (!currentUser) { toast('Login required', 'error'); return; }

    const name = val('book_name');
    const author = val('book_author');
    const isbn = val('book_isbn');
    const genre = document.getElementById('book_genre').value;
    const price = val('book_price');
    const desc = val('book_desc');

    if (!name) { toast('Book title is required', 'error'); return; }
    if (!price) { toast('Price is required', 'error'); return; }
    if (isNaN(price) || +price < 0) { toast('Enter a valid price', 'error'); return; }

    const book = {
        id: Date.now(),
        name,
        author: author || '—',
        isbn: isbn || '—',
        genre: genre || 'Other',
        price: +price,
        desc: desc || '',
        status: 'available',
        addedBy: currentUser,
        addedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    books.unshift(book);
    persist();

    toast(`"${name}" added to your library!`, 'success');
    clear('book_name', 'book_author', 'book_isbn', 'book_price', 'book_desc');
    document.getElementById('book_genre').value = '';
    showSection('viewBook');
}

// ================================================================
//  WATCH ADD FORM → live preview
// ================================================================
function watchAddForm() {
    const ids = ['book_name', 'book_author', 'book_genre', 'book_price'];
    ids.forEach(id => {
        document.getElementById(id)?.addEventListener('input', updatePreview);
    });
    document.getElementById('book_genre')?.addEventListener('change', updatePreview);
}

function updatePreview() {
    const name = val('book_name') || 'Book Title';
    const author = val('book_author') || 'Author';
    const genre = document.getElementById('book_genre')?.value || 'Genre';
    const price = val('book_price') || '0';

    const colors = { Fiction: '#4f8ef7', 'Non-Fiction': '#22c55e', Science: '#2dd4bf', Technology: '#7c5cfc', History: '#f59e0b', Biography: '#f43f5e', 'Self-Help': '#e879f9', Philosophy: '#8b5cf6', Other: '#64748b', '': '#4f8ef7' };
    const bg = colors[genre] || '#4f8ef7';

    document.getElementById('addPreview').innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;text-align:left;">
            <div style="width:46px;height:58px;border-radius:8px;background:linear-gradient(135deg,${bg},${bg}88);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📖</div>
            <div>
                <div style="font-weight:700;color:var(--c-t1);font-size:14px;margin-bottom:3px;">${esc(name)}</div>
                <div style="font-size:12px;color:var(--c-t2);margin-bottom:5px;">by ${esc(author)}</div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <span style="font-size:10px;padding:2px 8px;border-radius:5px;background:rgba(255,255,255,0.06);color:var(--c-t2);">${esc(genre)}</span>
                    <span style="font-size:12px;font-weight:700;color:var(--c-green);">₹${esc(price)}</span>
                </div>
            </div>
        </div>
    `;
}

// ================================================================
//  DASHBOARD
// ================================================================
function renderDashboard() {
    const total = books.length;
    const avail = books.filter(b => b.status === 'available').length;
    const borrow = total - avail;
    const value = books.reduce((s, b) => s + (b.price || 0), 0);

    set('d-total', total);
    set('d-avail', avail);
    set('d-borrow', borrow);
    set('d-value', `₹${value.toFixed(0)}`);

    // Recent 5
    const container = document.getElementById('recentBooks');
    const recent = books.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `<div style="padding:30px;text-align:center;color:var(--c-t3);font-size:13px;">No books yet — <a onclick="showSection('addBook')" style="color:var(--c-blue);font-weight:600;">add your first book</a></div>`;
        return;
    }

    const colors = ['#4f8ef7', '#7c5cfc', '#22c55e', '#f59e0b', '#f43f5e'];
    container.innerHTML = recent.map((b, i) => `
        <div class="recent-item">
            <div class="ri-book-icon" style="background:linear-gradient(135deg,${colors[i % 5]},${colors[(i + 1) % 5]});">
                <i class="ri-book-2-line"></i>
            </div>
            <div>
                <div class="recent-title">${esc(b.name)}</div>
                <div class="recent-meta">${esc(b.author)} · ${esc(b.genre)} · ${esc(b.addedAt || '')}</div>
            </div>
            <span class="recent-price">₹${(b.price || 0).toFixed(2)}</span>
        </div>
    `).join('');
}

// ================================================================
//  RENDER ALL BOOKS TABLE
// ================================================================
function renderBooks(list) {
    if (!list) list = getFiltered();

    const tbody = document.getElementById('bookTableBody');
    const emptyW = document.getElementById('emptyWrap');
    const tableEl = document.getElementById('bookTable');

    // update mini-stats (always from full list)
    const avail = books.filter(b => b.status === 'available').length;
    set('ms-total', books.length);
    set('ms-avail', avail);
    set('ms-borrow', books.length - avail);

    if (list.length === 0) {
        tableEl.style.display = 'none';
        emptyW.style.display = 'block';
        return;
    }

    tableEl.style.display = 'table';
    emptyW.style.display = 'none';

    tbody.innerHTML = list.map((b, i) => `
        <tr>
            <td><span class="cell-num">${i + 1}</span></td>
            <td>
                <div class="cell-title">${esc(b.name)}</div>
                <div style="font-size:11px;color:var(--c-t3);margin-top:2px;">${esc(b.isbn !== '—' ? b.isbn : '')}</div>
            </td>
            <td>${esc(b.author)}</td>
            <td><span class="tag tag-genre">${esc(b.genre)}</span></td>
            <td><span class="cell-price">₹${(b.price || 0).toFixed(2)}</span></td>
            <td>
                <span class="status-pill ${b.status === 'available' ? 'status-avail' : 'status-borrowed'}">
                    <i class="${b.status === 'available' ? 'ri-checkbox-circle-line' : 'ri-time-line'}"></i>
                    ${b.status === 'available' ? 'Available' : 'Borrowed'}
                </span>
            </td>
            <td>
                <div class="action-row">
                    <button class="icon-btn" title="Toggle Status" onclick="toggleStatus('${b.id}')">
                        <i class="ri-arrow-left-right-line"></i>
                    </button>
                    <button class="icon-btn danger" title="Delete" onclick="deleteBook('${b.id}')">
                        <i class="ri-delete-bin-6-line"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ================================================================
//  TOGGLE BORROW STATUS
// ================================================================
function toggleStatus(id) {
    const b = books.find(x => String(x.id) === String(id));
    if (!b) return;
    b.status = b.status === 'available' ? 'borrowed' : 'available';
    persist();
    renderBooks();
    toast(`"${b.name}" is now ${b.status}`, 'info');
}

// ================================================================
//  DELETE BOOK
// ================================================================
function deleteBook(id) {
    const idx = books.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return;
    const name = books[idx].name;
    books.splice(idx, 1);
    persist();
    renderBooks();
    renderDashboard();
    toast(`"${name}" removed`, 'info');
}

// ================================================================
//  FILTER (View All Books)
// ================================================================
function filterBooks() { renderBooks(getFiltered()); }

function getFiltered() {
    const q = (document.getElementById('filterQ')?.value || '').toLowerCase();
    const g = (document.getElementById('filterGenre')?.value || '');
    const st = (document.getElementById('filterStatus')?.value || '');
    return books.filter(b => {
        const matchQ = b.name.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
        const matchG = !g || b.genre === g;
        const matchSt = !st || b.status === st;
        return matchQ && matchG && matchSt;
    });
}

function clearFilters() {
    const ids = ['filterQ', 'filterGenre', 'filterStatus'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    renderBooks();
}

// ================================================================
//  LIVE SEARCH
// ================================================================
function liveSearch() {
    const q = (document.getElementById('bigSearchQ').value || '').toLowerCase().trim();
    const out = document.getElementById('searchOut');

    if (!q) { out.innerHTML = ''; return; }

    const found = books.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.genre || '').toLowerCase().includes(q)
    );

    if (found.length === 0) {
        out.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:var(--c-t3);">
                <div style="font-size:48px;margin-bottom:12px;">🔍</div>
                <h4 style="color:var(--c-t2);font-size:16px;margin-bottom:6px;">No results found</h4>
                <p style="font-size:13px;">No books match "<b style="color:var(--c-t1);">${esc(q)}</b>"</p>
            </div>
        `;
        return;
    }

    const colors = ['#4f8ef7', '#7c5cfc', '#22c55e', '#f59e0b', '#f43f5e', '#2dd4bf', '#e879f9'];
    out.innerHTML = found.map((b, i) => `
        <div class="search-card">
            <div class="sc-thumb" style="background:linear-gradient(135deg,${colors[i % colors.length]},${colors[(i + 2) % colors.length]});">
                <i class="ri-book-2-line"></i>
            </div>
            <div class="sc-info">
                <div class="sc-name">${esc(b.name)}</div>
                <div class="sc-meta">
                    by ${esc(b.author)} &nbsp;·&nbsp; ${esc(b.genre)} &nbsp;·&nbsp; ₹${(b.price || 0).toFixed(2)}
                </div>
            </div>
            <span class="status-pill ${b.status === 'available' ? 'status-avail' : 'status-borrowed'}">
                ${b.status}
            </span>
        </div>
    `).join('');
}

// ================================================================
//  UTILS
// ================================================================
function val(id) { return (document.getElementById(id)?.value || '').trim(); }
function set(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function clear(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; }); }
function getUsers() { return JSON.parse(localStorage.getItem('bookvault_users') || '[]'); }
function esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
