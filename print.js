/* ══════════════════════════════════════
   print.js — PDF / Print Report
══════════════════════════════════════ */

function printReport() {
  const exps = userExp();
  const leds = userLed();
  const month = today().slice(0, 7);

  const totalM = sum(exps.filter(e => e.date.startsWith(month)), 'amount');
  const totalT = sum(exps.filter(e => e.date === today()), 'amount');
  const tLent  = sum(leds.filter(l => l.type === 'lent'     && !l.settled), 'amount');
  const tBor   = sum(leds.filter(l => l.type === 'borrowed' && !l.settled), 'amount');

  const expRows = exps.map(e =>
    `<tr>
      <td>${e.date}</td>
      <td>${CAT_ICONS[e.category]} ${e.category}</td>
      <td>${e.description}</td>
      <td>${e.mode}</td>
      <td style="font-weight:700;color:#7c3aed">${fmt(e.amount)}</td>
    </tr>`
  ).join('');

  const ledRows = leds.map(l =>
    `<tr>
      <td>${l.date}</td>
      <td>${l.name}</td>
      <td style="color:${l.type==='lent'?'#0891b2':'#059669'};font-weight:700">${l.type==='lent'?'Lent':'Borrowed'}</td>
      <td>${l.note || '-'}</td>
      <td style="font-weight:700">${fmt(l.amount)}</td>
      <td style="color:${l.settled?'#059669':'#d97706'};font-weight:700">${l.settled?'Settled':'Pending'}</td>
    </tr>`
  ).join('');

  const w = window.open('', '_blank');
  w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Expense Report — ${currentUser.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #1e293b; background: #fff; }
    h1   { font-family: 'Syne', sans-serif; font-size: 28px; background: linear-gradient(135deg,#7c3aed,#db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }
    h2   { font-family: 'Syne', sans-serif; font-size: 18px; color: #1e293b; margin: 28px 0 8px; }
    .sub { color: #64748b; font-size: 13px; margin-bottom: 22px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .card { border-radius: 12px; padding: 16px; color: #fff; }
    .card h3 { margin: 0 0 4px; font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
    .card p  { margin: 0; font-size: 20px; font-weight: 900; font-family: 'Syne', sans-serif; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th  { background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; }
    td  { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) { background: #fafbff; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>💸 Daily Expense Tracker</h1>
  <p class="sub">
    Report for <strong>${currentUser.name}</strong> (@${currentUser.username})
    &nbsp;•&nbsp; Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
  </p>

  <div class="grid">
    <div class="card" style="background:linear-gradient(135deg,#7c3aed,#db2777)">
      <h3>This Month</h3><p>${fmt(totalM)}</p>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#d97706,#db2777)">
      <h3>Today</h3><p>${fmt(totalT)}</p>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#0891b2,#7c3aed)">
      <h3>Total Lent</h3><p>${fmt(tLent)}</p>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#059669,#0891b2)">
      <h3>Total Borrowed</h3><p>${fmt(tBor)}</p>
    </div>
  </div>

  <h2>📋 Expense History (${exps.length} records)</h2>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Mode</th><th>Amount</th></tr></thead>
    <tbody>${expRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No expenses</td></tr>'}</tbody>
  </table>

  <h2>🤝 Lending & Borrowing Ledger</h2>
  <table>
    <thead><tr><th>Date</th><th>Person</th><th>Type</th><th>Note</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${ledRows || '<tr><td colspan="6" style="text-align:center;color:#94a3b8">No entries</td></tr>'}</tbody>
  </table>

  <div class="footer">
    Daily Expense Tracker &nbsp;•&nbsp; Printed on ${new Date().toLocaleString('en-IN')}
  </div>
</body>
</html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 700);
}