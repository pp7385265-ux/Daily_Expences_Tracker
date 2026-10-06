/* ══════════════════════════════════════
   budget.js — Budget Planner
══════════════════════════════════════ */

function saveBudget() {
  const cat   = document.getElementById('b-cat').value;
  const limit = parseFloat(document.getElementById('b-limit').value);
  if (!limit || limit <= 0) { showToast('Enter a valid amount!', 'error'); return; }

  const existing = DB.budgets.find(b => b.category === cat && b.userId === currentUser.id);
  if (existing) existing.limit = limit;
  else DB.budgets.push({ id: Date.now(), userId: currentUser.id, category: cat, limit });

  document.getElementById('b-limit').value = '';
  showToast('Budget saved! 🎯');
  renderBudget();
}

function renderBudget() {
  const buds  = userBud();
  const month = today().slice(0, 7);
  const mExp  = userExp().filter(e => e.date.startsWith(month));
  const cats  = catTotals(mExp);

  if (!buds.length) {
    document.getElementById('budget-grid').innerHTML =
      '<div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--text3);background:var(--bg2);border-radius:20px;border:1px solid var(--border)">🎯 No budgets yet. Set one above!</div>';
    return;
  }

  document.getElementById('budget-grid').innerHTML = buds.map(b => {
    const spent  = cats[b.category] || 0;
    const pct    = Math.min(Math.round(spent / b.limit * 100), 100);
    const over   = spent > b.limit;
    const barCol = over ? '#f87171' : pct > 75 ? '#fbbf24' : '#34d399';

    return `<div class="bud-card ${over ? 'over' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <span style="font-weight:800;font-size:15px">${CAT_ICONS[b.category]} ${b.category}</span>
        ${over ? '<span class="over-badge">⚠️ Over Budget!</span>' : ''}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px">
        <span style="color:var(--text2)">Spent: <strong style="color:${over?'#f87171':'var(--text)'}">${fmt(spent)}</strong></span>
        <span style="color:var(--text2)">Limit: <strong>${fmt(b.limit)}</strong></span>
      </div>
      <div class="bar-bg" style="height:10px">
        <div class="bar-fill" style="width:${pct}%;background:${barCol};box-shadow:0 0 8px ${barCol}66"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:7px;font-weight:700">
        <span style="color:var(--text3)">${pct}% used</span>
        <span style="color:${over?'#f87171':'#34d399'}">${over ? fmt(spent-b.limit)+' over' : fmt(b.limit-spent)+' left'}</span>
      </div>
    </div>`;
  }).join('');
}