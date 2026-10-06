/* ══════════════════════════════════════
   dashboard.js — Dashboard Page
══════════════════════════════════════ */

function renderDashboard() {
  const exps  = userExp();
  const leds  = userLed();
  const month = today().slice(0, 7);
  const mExp  = exps.filter(e => e.date.startsWith(month));

  const totalM = sum(mExp, 'amount');
  const totalT = sum(exps.filter(e => e.date === today()), 'amount');
  const tLent  = sum(leds.filter(l => l.type === 'lent'     && !l.settled), 'amount');
  const tBor   = sum(leds.filter(l => l.type === 'borrowed' && !l.settled), 'amount');

  /* ── STAT CARDS ── */
  const stats = [
    { icon:'📅', lbl:'This Month',    val:fmt(totalM), sub:'Total expenses',   g:GRADS[0] },
    { icon:'☀️', lbl:'Today',         val:fmt(totalT), sub:'Spent today',      g:GRADS[3] },
    { icon:'⬆️', lbl:'Lent Out',      val:fmt(tLent),  sub:'Pending recovery', g:GRADS[1] },
    { icon:'⬇️', lbl:'Borrowed',      val:fmt(tBor),   sub:'To be returned',   g:GRADS[2] },
  ];
  document.getElementById('dash-stats').innerHTML = stats.map(s =>
    `<div class="stat-card" style="background:${s.g}" onclick="switchTab('expenses')">
      <div class="s-icon">${s.icon}</div>
      <div class="s-lbl">${s.lbl}</div>
      <div class="s-val">${s.val}</div>
      <div class="s-sub">${s.sub}</div>
    </div>`
  ).join('');

  /* ── CATEGORY BARS ── */
  const cats   = catTotals(mExp);
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  document.getElementById('dash-cats').innerHTML = sorted.length
    ? sorted.map(([cat, amt]) => {
        const pct = Math.round(amt / totalM * 100);
        const col = CAT_COLORS[cat] || '#7c3aed';
        return `<div class="bar-wrap">
          <div class="bar-top">
            <span style="font-weight:700;color:var(--text)">${CAT_ICONS[cat]} ${cat}</span>
            <span style="color:var(--text2)">${fmt(amt)} <span style="color:var(--text3);font-size:11px">(${pct}%)</span></span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width:${pct}%;background:${col};box-shadow:0 0 8px ${col}66"></div>
          </div>
        </div>`;
      }).join('')
    : '<p style="color:var(--text3);font-size:13px">No expenses this month</p>';

  /* ── RECENT EXPENSES ── */
  const recent = [...exps].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  document.getElementById('dash-recent').innerHTML = recent.map(e => {
    const col = CAT_COLORS[e.category] || '#7c3aed';
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bg3)">
      <div style="width:36px;height:36px;border-radius:10px;background:${col}22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${CAT_ICONS[e.category]}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.description}</div>
        <div style="font-size:11px;color:var(--text3)">${e.date}</div>
      </div>
      <div style="font-size:14px;font-weight:900;font-family:'Syne',sans-serif;color:#f87171;flex-shrink:0">${fmt(e.amount)}</div>
    </div>`;
  }).join('');

  /* ── PENDING SETTLEMENTS ── */
  const pending = leds.filter(l => !l.settled);
  const wrap    = document.getElementById('dash-pending-wrap');
  if (!pending.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  document.getElementById('dash-pending').innerHTML =
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
    ${pending.map(l => {
      const isLent = l.type === 'lent';
      return `<div style="padding:14px 16px;border-radius:14px;background:${isLent?'rgba(8,145,178,0.12)':'rgba(5,150,105,0.12)'};border:1.5px solid ${isLent?'rgba(8,145,178,0.3)':'rgba(5,150,105,0.3)'}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:800">${l.name}</span>
          <span style="font-weight:900;color:${isLent?'#38bdf8':'#34d399'};font-family:'Syne',sans-serif">${fmt(l.amount)}</span>
        </div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${isLent?'⬆️ You lent':'⬇️ You borrowed'} • ${l.date}</div>
      </div>`;
    }).join('')}
    </div>`;
}