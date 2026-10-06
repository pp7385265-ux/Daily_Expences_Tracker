/* ══════════════════════════════════════
   auth.js — Authentication Logic
   Login | Register | Forgot Password
══════════════════════════════════════ */

/* ── PAGE NAVIGATION ── */
function gotoPage(id) {
  ['loginPage','registerPage','forgotPage'].forEach(p => {
    document.getElementById(p).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

/* ── LOGIN ── */
function doLogin() {
  const username = document.getElementById('li-user').value.trim();
  const password = document.getElementById('li-pass').value;
  const user = DB.users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    // Redirect to app page
    window.location.href = 'pages/app.html';
  } else {
    const err = document.getElementById('li-err');
    err.textContent = '❌ Invalid username or password!';
    err.classList.remove('hidden');
    setTimeout(() => err.classList.add('hidden'), 3000);
  }
}

/* ── REGISTER ── */
function doRegister() {
  const name    = document.getElementById('rg-name').value.trim();
  const email   = document.getElementById('rg-email').value.trim();
  const username= document.getElementById('rg-user').value.trim();
  const phone   = document.getElementById('rg-phone').value.trim();
  const pass    = document.getElementById('rg-pass').value;
  const confirm = document.getElementById('rg-confirm').value;
  const terms   = document.getElementById('rg-terms').checked;
  const err     = document.getElementById('rg-err');

  const setErr = msg => {
    err.textContent = '❌ ' + msg;
    err.classList.remove('hidden');
    setTimeout(() => err.classList.add('hidden'), 3500);
  };

  if (!name || !email || !username || !pass) return setErr('All fields are required!');
  if (pass !== confirm)  return setErr('Passwords do not match!');
  if (pass.length < 4)   return setErr('Password must be at least 4 characters!');
  if (!terms)            return setErr('Please accept Terms & Privacy Policy!');
  if (DB.users.find(u => u.username === username)) return setErr('Username already taken!');
  if (DB.users.find(u => u.email === email))       return setErr('Email already registered!');

  DB.users.push({
    id: nextId.usr++,
    name, email, username, password: pass, phone,
    joinDate: today(), bio: '',
    avatar: null, bannerImg: null, bannerGrad: 0
  });

  alert('✅ Account created successfully! Please login.');
  gotoPage('loginPage');
}

/* ── FORGOT PASSWORD ── */
let fpStep = 1;

function setFpStep(s) {
  fpStep = s;
  ['fp-step1','fp-step2','fp-step3'].forEach((id, i) => {
    document.getElementById(id).classList.toggle('hidden', i !== s - 1);
    const dot = document.getElementById('sd' + (i + 1));
    dot.className = 'step-dot ' + (i + 1 < s ? 'done' : i + 1 === s ? 'active' : 'idle');
  });
}

function fpMsg(msg, type = 'success') {
  const el = document.getElementById('fp-msg');
  el.textContent = msg;
  el.className = 'fp-msg ' + type;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function fpStep1() {
  const email = document.getElementById('fp-email').value.trim();
  const found = DB.users.find(u => u.email === email);
  if (!found) { fpMsg('❌ Email not found in our records!', 'error'); return; }
  fpMsg('✅ OTP sent! Use: 123456', 'success');
  setTimeout(() => setFpStep(2), 1500);
}

function fpStep2() {
  const otp = document.getElementById('fp-otp').value.trim();
  if (otp !== '123456') { fpMsg('❌ Wrong OTP! Try 123456', 'error'); return; }
  setFpStep(3);
}

function fpStep3() {
  const newpw = document.getElementById('fp-newpw').value;
  if (newpw.length < 4) { fpMsg('❌ Password too short! Min 4 chars', 'error'); return; }
  fpMsg('✅ Password reset successfully!', 'success');
  setTimeout(() => { setFpStep(1); gotoPage('loginPage'); }, 1500);
}

function doLogout() {
  currentUser = null;
  window.location.href = '../index.html';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  setFpStep(1);
  // Check if already logged in (for demo — in real app use session/token)
  if (typeof currentUser !== 'undefined' && currentUser) {
    window.location.href = 'pages/app.html';
  }
});