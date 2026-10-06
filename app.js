/* ══════════════════════════════════════
   app.js — Main App Controller
   Tab switching | Sidebar | Toast | Init
══════════════════════════════════════ */

const TAB_LABELS = {
  dashboard: 'Dashboard 🏠',
  expenses:  'Expenses 💳',
  ledger:    'Ledger 🤝',
  budget:    'Budget 🎯',
  reports:   'Reports 📊',
  profile:   'Profile 👤',
};

let currentTab = 'dashboard';

/* ── TOAST ── */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  toast.className = type;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2800);
}

/* ── TAB SWITCH ── */
function switchTab(tab) {
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + tab);
  if (navBtn) navBtn.classList.add('active');

  document.querySelectorAll('.tab-page').forEach(t => t.classList.add('hidden'));
  const page = document.getElementById('tab-' + tab);
  if (page) page.classList.remove('hidden');

  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = TAB_LABELS[tab] || tab;

  currentTab = tab;

  // Render content
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'expenses')  renderExpenses();
  if (tab === 'ledger')    renderLedger();
  if (tab === 'budget')    renderBudget();
  if (tab === 'reports')   renderReports();
  if (tab === 'profile')   renderProfile();
}

/* ── SIDEBAR USER INFO ── */
function updateSidebarUser() {
  const u = currentUser;
  if (!u) return;

  document.getElementById('sb-uname').textContent  = u.name;
  document.getElementById('sb-uemail').textContent = u.email;

  const wrap = document.getElementById('sb-av-wrap');
  wrap.innerHTML = '';

  if (u.avatar) {
    const img = document.createElement('img');
    img.src = u.avatar;
    img.className = 'sb-av-img';
    wrap.appendChild(img);
  } else {
    const div = document.createElement('div');
    div.className = 'sb-av-init';
    div.style.background = GRADS[u.id % GRADS.length];
    div.textContent = initials(u.name);
    wrap.appendChild(div);
  }
}

/* ── POPULATE SELECTS ── */
function populateSelects() {
  // Expense category & filter
  ['e-cat', 'f-cat', 'b-cat'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const hasAll = id === 'f-cat';
    el.innerHTML = hasAll ? '<option value="">All Categories</option>' : '';
    CATS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      el.appendChild(opt);
    });
  });

  // Payment modes
  const modeEl = document.getElementById('e-mode');
  if (modeEl) {
    modeEl.innerHTML = '';
    MODES.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      modeEl.appendChild(opt);
    });
  }

  // Default dates
  const eDate = document.getElementById('e-date');
  if (eDate) eDate.value = today();
  const lDate = document.getElementById('l-date');
  if (lDate) lDate.value = today();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // For demo: use first user (john) — in real app, check session
  if (!currentUser) {
    currentUser = DB.users[0]; // Demo auto-login
  }

  // Set topbar date
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  populateSelects();
  updateSidebarUser();
  switchTab('dashboard');
});