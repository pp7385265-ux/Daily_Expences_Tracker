/* ══════════════════════════════════════
   expenses.js — Expenses Page Logic
══════════════════════════════════════ */

let addingExp = false;

function toggleExpForm() {
  addingExp = !addingExp;
  document.getElementById('exp-form-panel').classList.toggle('hidden', !addingExp);
  const btn = document.getElementById('btn-toggle-exp');
  btn.textContent = addingExp ? '✕ Cancel' : '✨ Add New Expense';
  btn.style.background = addingExp ? 'var(--bg4)' : 'var(--grad1)';
  btn.style.color      = addingExp ? 'var(--text2)' : '#fff';
  btn.style.boxShadow  = addingExp ? 'none' : '0 4px 14px rgba(124,58,237,0.3)';
}

function addExpense() {
  const amt  = parseFloat(document.getElementById('e-amt').value);
  const desc = document.getElementById('e-desc').value.trim();
  const cat  = document.getElementById('e-cat').value;
  const date = document.getElementById('e-date').value;
  const mode = document.getElementById('e-mode').value;

  if (!amt || amt <= 0 || !desc || !date) {
    showToast('Please fill all fields!', 'error'); return;
  }

  DB.expenses.unshift({ id: nextId.exp++, userId: currentUser.id, amount: amt, category: cat, description: desc, date, mode });
  document.getElementById('e-amt').value  = '';
  document.getElementById('e-desc').value = '';
  toggleExpForm();
  showToast('Expense added! ✅');
  renderExpenses();
}

function clearFilters() {
  ['f-search','f-from','f-to'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-cat').value = '';
  renderExpenses();
}

function delExp(id) {
  DB.expenses = DB.expenses.filter(e => e.id !== id);
  renderExpenses();
  showToast('Expense deleted');
}

function renderExpenses() {
  const search = document.getElementById('f-search').value.toLowerCase();
  const fcat   = document.getElementById('f-cat').value;
  const from   = document.getElementById('f-from').value;
  const to     = document.getElementById('f-to').value;

  let exps = userExp().filter(e => {
    if (fcat && e.category !== fcat) return false;
    if (from && e.date < from)        return false;
    if (to   && e.date > to)          return false;
    if (search && !e.description.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const total = sum(exps, 'amount');
  document.getElementById('exp-count').textContent = exps.length + ' records';
  document.getElementById('exp-total').textContent  = 'Total: ' + fmt(total);

  if (!exps.length) {
    document.getElementById('exp-list').innerHTML = '<div class="empty-state">😕 No expenses found</div>';
    return;
  }

  document.getElementById('exp-list').innerHTML = exps.map(e => {
    const col = CAT_COLORS[e.category] || '#7c3aed';
    return `<div class="exp-row">
      <div class="exp-icon" style="background:${col}18">${CAT_ICONS[e.category]}</div>
      <div style="flex:1;min-width:0">
        <div class="exp-desc">${e.description}</div>
        <div class="exp-meta">
          <span class="cat-badge" style="background:${col}18;color:${col}">${e.category}</span>
          ${e.mode} • ${e.date}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="exp-amt">${fmt(e.amount)}</div>
        <button class="btn-del" onclick="delExp(${e.id})">Delete</button>
      </div>
    </div>`;
  }).join('');
}