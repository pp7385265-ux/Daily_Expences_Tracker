/* ══════════════════════════════════════
   reports.js — Reports & Analytics
══════════════════════════════════════ */

function renderReports() {
  const exps   = userExp();
  const months = [...new Set(exps.map(e => e.date.slice(0, 7)))].sort().reverse();
  const sel    = document.getElementById('rp-month');
  const prev   = sel.value;

  sel.innerHTML = months.map(m => `<option${m === prev ? ' selected' : ''}>${m}</option>`).join('');
  if (!sel.value && months.length) sel.value = months[0];

  const selM  = sel.value || today().slice(0, 7);
  const me    = exps.filter(e => e.date.startsWith(selM));
  const total = sum(me, 'amount');
  const cats  = catTotals(me);
  const modes = {};
  me.forEach(e => modes[e.mode] = (modes[e.mode] || 0) + e.amount);
  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];

  /* Stat cards */
  document.getElementById('rp-stats').innerHTML = [
    { icon:'💳', lbl:'Total Spent',    val:fmt(total),       g:GRADS[0] },
    { icon:'🧾', lbl:'Transactions',   val:me.length,         g:GRADS[1] },
    { icon:'🏆', lbl:'Top Category',   val:topCat?CAT_ICONS[topCat[0]]:'—', sub:topCat?topCat[0]+' ('+fmt(topCat[1])+')':'No data', g:GRADS[3] },
    { icon:'📊', lbl:'Daily Average',  val:fmt(total / 30),  g:GRADS[2] },
  ].map(s => `<div class="stat-card" style="background:${s.g}">
    <div class="s-icon">${s.icon}</div>
    <div class="s-lbl">${s.lbl}</div>
    <div class="s-val">${s.val}</div>
    ${s.sub ? `<div class="s-sub">${s.sub}</div>` : ''}
  </div>`).join('');

  /* Category bars */
  document.getElementById('rp-cats').innerHTML = Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => {
      const pct = Math.round(amt / total * 100);
      const col = CAT_COLORS[cat] || '#7c3aed';
      return `<div class="bar-wrap">
        <div class="bar-top">
          <span style="font-weight:700">${CAT_ICONS[cat]} ${cat}</span>
          <span style="color:var(--text2)">${fmt(amt)} (${pct}%)</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${col};box-shadow:0 0 8px ${col}55"></div></div>
      </div>`;
    }).join('') || '<p style="color:var(--text3)">No data for this month</p>';

  /* Payment modes */
  document.getElementById('rp-modes').innerHTML = Object.entries(modes)
    .sort((a, b) => b[1] - a[1])
    .map(([mode, amt]) => {
      const col = MODE_COLORS[mode] || '#7c3aed';
      return `<div class="mode-row">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="mode-dot" style="background:${col}"></div>
          <span style="font-size:14px;font-weight:700">${mode}</span>
        </div>
        <span style="font-size:15px;font-weight:900;font-family:'Syne',sans-serif;color:${col}">${fmt(amt)}</span>
      </div>`;
    }).join('') || '<p style="color:var(--text3)">No data</p>';
}