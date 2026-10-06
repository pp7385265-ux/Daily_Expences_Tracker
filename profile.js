/* ══════════════════════════════════════
   profile.js — Profile Page
   Image upload | Edit | Save | Banner
══════════════════════════════════════ */

let profEditing    = false;
let selBannerGrad  = 0;

/* ── RENDER PROFILE ── */
function renderProfile() {
  const u = currentUser;
  selBannerGrad = u.bannerGrad || 0;
  profEditing   = false;

  refreshBanner();
  refreshAvatar();

  document.getElementById('prof-name-display').textContent = u.name;
  document.getElementById('prof-sub-display').textContent  = '@' + u.username + ' • Member since ' + u.joinDate;

  // View fields
  document.getElementById('pv-email').textContent = u.email;
  document.getElementById('pv-phone').textContent = u.phone || 'Not set';
  document.getElementById('pv-user').textContent  = '@' + u.username;
  document.getElementById('pv-join').textContent  = u.joinDate;
  document.getElementById('pv-bio').textContent   = u.bio || 'No bio yet';
  document.getElementById('bio-chip').style.display = u.bio ? '' : 'none';

  // Show view, hide edit
  document.getElementById('prof-view').classList.remove('hidden');
  document.getElementById('prof-edit').classList.add('hidden');

  // Avatar edit button — hide in view mode
  document.getElementById('avatar-edit-btn').classList.add('hidden');

  // Banner — not clickable in view mode
  document.getElementById('profile-banner').style.cursor = 'default';
  document.getElementById('banner-overlay').style.opacity = '0';
  document.getElementById('banner-overlay').style.pointerEvents = 'none';

  // Action button
  document.getElementById('prof-actions').innerHTML =
    `<button class="btn-edit-profile" onclick="startEditProfile()">✏️ Edit Profile</button>`;

  // Stats
  const exps = userExp();
  const leds = userLed();
  const tSpent = sum(exps, 'amount');
  const tLent  = sum(leds.filter(l => l.type === 'lent' && !l.settled), 'amount');
  document.getElementById('prof-stats').innerHTML = [
    { icon:'💳', lbl:'Total Spent',   val:fmt(tSpent), g:GRADS[0] },
    { icon:'🤝', lbl:'Pending Lent',  val:fmt(tLent),  g:GRADS[1] },
    { icon:'✅', lbl:'Account',        val:'Active',    sub:'Verified ✨', g:GRADS[2] },
  ].map(s => `<div class="stat-card" style="background:${s.g}">
    <div class="s-icon">${s.icon}</div>
    <div class="s-lbl">${s.lbl}</div>
    <div class="s-val">${s.val}</div>
    ${s.sub ? `<div class="s-sub">${s.sub}</div>` : ''}
  </div>`).join('');
}

/* ── START EDITING ── */
function startEditProfile() {
  const u = currentUser;
  profEditing = true;

  document.getElementById('pe-name').value  = u.name;
  document.getElementById('pe-email').value = u.email;
  document.getElementById('pe-phone').value = u.phone || '';
  document.getElementById('pe-bio').value   = u.bio   || '';

  // Show edit mode
  document.getElementById('prof-view').classList.add('hidden');
  document.getElementById('prof-edit').classList.remove('hidden');

  // Show avatar edit button
  document.getElementById('avatar-edit-btn').classList.remove('hidden');

  // Enable banner click
  document.getElementById('profile-banner').style.cursor = 'pointer';
  document.getElementById('banner-overlay').style.pointerEvents = '';

  // Build gradient picker
  const picker = document.getElementById('grad-picker');
  picker.innerHTML = GRADS.map((g, i) =>
    `<div class="grad-swatch ${i === selBannerGrad ? 'sel' : ''}" style="background:${g}" onclick="pickGrad(${i})"></div>`
  ).join('');

  // Action buttons
  document.getElementById('prof-actions').innerHTML =
    `<div style="display:flex;gap:8px">
      <button class="btn-prof-save" onclick="saveProfile()">💾 Save</button>
      <button class="btn-cancel" onclick="renderProfile()">Cancel</button>
    </div>`;
}

/* ── SAVE PROFILE ── */
function saveProfile() {
  const name  = document.getElementById('pe-name').value.trim();
  const email = document.getElementById('pe-email').value.trim();
  const phone = document.getElementById('pe-phone').value.trim();
  const bio   = document.getElementById('pe-bio').value.trim();

  if (!name || !email) { showToast('Name and email are required!', 'error'); return; }

  // Update currentUser
  currentUser.name       = name;
  currentUser.email      = email;
  currentUser.phone      = phone;
  currentUser.bio        = bio;
  currentUser.bannerGrad = selBannerGrad;

  // Sync to DB
  const idx = DB.users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) Object.assign(DB.users[idx], currentUser);

  showToast('Profile updated! ✅');
  updateSidebarUser();
  renderProfile();
}

/* ── GRADIENT BANNER PICKER ── */
function pickGrad(i) {
  selBannerGrad = i;
  currentUser.bannerImg = null; // Remove custom banner image
  document.querySelectorAll('.grad-swatch').forEach((s, idx) => s.classList.toggle('sel', idx === i));
  refreshBanner();
}

/* ── BANNER CLICK (in edit mode) ── */
function bannerClick() {
  if (profEditing) document.getElementById('bannerInput').click();
}

/* ── LOAD BANNER IMAGE ── */
function loadBanner(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    currentUser.bannerImg = ev.target.result;
    refreshBanner();
    showToast('Banner updated! 🖼️');
  };
  reader.readAsDataURL(file);
}

/* ── LOAD AVATAR IMAGE ── */
function loadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    currentUser.avatar = ev.target.result;
    refreshAvatar();
    updateSidebarUser();
    showToast('Profile picture updated! 📷');
  };
  reader.readAsDataURL(file);
}

/* ── REFRESH BANNER ── */
function refreshBanner() {
  const banner = document.getElementById('profile-banner');
  if (currentUser.bannerImg) {
    banner.style.backgroundImage    = `url(${currentUser.bannerImg})`;
    banner.style.backgroundSize     = 'cover';
    banner.style.backgroundPosition = 'center';
  } else {
    banner.style.backgroundImage = '';
    banner.style.background      = GRADS[selBannerGrad];
  }
}

/* ── REFRESH AVATAR ── */
function refreshAvatar() {
  const u    = currentUser;
  const wrap = document.getElementById('prof-av');
  wrap.innerHTML = '';

  if (u.avatar) {
    const img = document.createElement('img');
    img.src       = u.avatar;
    img.className = 'prof-av-img';
    wrap.appendChild(img);
  } else {
    const div = document.createElement('div');
    div.className   = 'prof-av-init';
    div.style.background = GRADS[u.id % GRADS.length];
    div.textContent = initials(u.name);
    wrap.appendChild(div);
  }
}