/* ══════════════════════════════════════
   ledger.js — Lending & Borrowing
══════════════════════════════════════ */

let addingLed = false;
let ledType   = 'lent';
let ledView   = 'all';

function toggleLedForm() {
  addingLed = !addingLed;
  document.getElementById('led-form-panel').classList.toggle('hidden', !addingLed);
  const btn = document.getElementById('btn-toggle-led');
  btn.textContent  = addingLed ? '✕ Cancel' : '➕ Add Entry';
  btn.style.background = addingLed ? 'var(--bg4)' : 'var(--grad1)';
  btn.style.color      = addingLed ? 'var(--text2)' : '#fff';
}

function setLedType(t) {
  ledType = t;
  const lentBtn = document.getElementById('lt-lent');
  const borBtn  = document.getElementById('lt-bor');
  lentBtn.className = 'type-btn' + (t === 'lent' ? ' active-lent' : '');
  borBtn.className  = 'type-btn' + (t === 'borrowed' ? ' active-borrowed' : '');
}

function setLedView(v) {
  ledView = v;
  ['all','lent','borrowed','pending'].forEach(x => {
    document.getElementById('lv-' + x).className = 'pill' + (v === x ? ' active' : '');
  });
  renderLedger();
}

function addLedger() {
  const name = document.getElementById('l-name').value.trim();
  const amt  = parseFloat(document.getElementById('l-amt').value);
  const date = document.getElementById('l-date').value;
  const note = document.getElementById('l-note').value.trim();

  if (!name || !amt || amt <= 0) { showToast('Please fill all fields!', 'error'); return; }

  DB.ledger.unshift({ id: nextId.led++, userId: currentUser.id, type: ledType, name, amount: amt, date, note, settled: false });
  document.getElementById('l-name').value = '';
  document.getElementById('l-amt').value  = '';
  document.getElementById('l-note').value = '';
  toggleLedForm();
  showToast('Entry added!');
  renderLedger();
}

function settleLed(id) {
  DB.ledger = DB.ledger.map(l => l.id === id ? { ...l, settled: !l.settled } : l);
  showToast('Settlement status updated!');
  renderLedger();
}

function delLed(id) {
  DB.ledger = DB.ledger.filter(l => l.id !== id);
  showToast('Entry deleted');
  renderLedger();
}

function renderLedger() {
  const leds = userLed();
  const tl   = sum(leds.filter(l => l.type === 'lent'     && !l.settled), 'amount');
  const tb   = sum(leds.filter(l => l.type === 'borrowed' && !l.settled), 'amount');

  /* Stat cards */
  document.getElementById('led-stats').innerHTML = [
    { icon:'⬆️', lbl:'You Lent (Pending)',      val:fmt(tl), g:GRADS[1] },
    { icon:'⬇️', lbl:'You Borrowed (Pending)',   val:fmt(tb), g:GRADS[2] },
    { icon:'💰', lbl:'Net Balance', val:fmt(Math.abs(tl - tb)), sub: tl >= tb ? 'In your favor ✅' : 'You owe more ⚠️', g: tl >= tb ? GRADS[3] : GRADS[0] },
  ].map(s => `<div class="stat-card" style="background:${s.g}">
    <div class="s-icon">${s.icon}</div>
    <div class="s-lbl">${s.lbl}</div>
    <div class="s-val">${s.val}</div>
    ${s.sub ? `<div class="s-sub">${s.sub}</div>` : ''}
  </div>`).join('');

  /* Filtered list */
  const filtered = leds.filter(l => {
    if (ledView === 'lent')     return l.type === 'lent';
    if (ledView === 'borrowed') return l.type === 'borrowed';
    if (ledView === 'pending')  return !l.settled;
    return true;
  });

  if (!filtered.length) {
    document.getElementById('led-list').innerHTML = '<div class="empty-state">No entries found</div>';
    return;
  }

  document.getElementById('led-list').innerHTML = filtered.map(l => {
    const isLent = l.type === 'lent';
    return `<div class="led-row ${l.settled ? 'settled' : ''}">
      <div style="width:44px;height:44px;border-radius:13px;background:${isLent?'rgba(8,145,178,0.15)':'rgba(5,150,105,0.15)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
        ${isLent ? '⬆️' : '⬇️'}
      </div>
      <div style="flex:1">
        <div style="font-weight:800;font-size:14px">
          ${l.name} <span class="${isLent?'badge-lent':'badge-borrowed'}">${isLent?'Lent':'Borrowed'}</span>
        </div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">
          ${isLent ? 'You lent' : 'You borrowed'} • ${l.date}${l.note ? ' • ' + l.note : ''}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:900;font-size:16px;font-family:'Syne',sans-serif;color:${isLent?'#38bdf8':'#34d399'}">
          ${fmt(l.amount)}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px;justify-content:flex-end">
          <button class="btn-settle ${l.settled?'reopen':''}" onclick="settleLed(${l.id})">${l.settled?'Reopen':'✓ Settle'}</button>
          <button class="btn-del" onclick="delLed(${l.id})">Del</button>
        </div>
      </div>
    </div>`;
  }).join('');
}