/**
 * ==========================================================================
 * BLOGIFY SETTINGS CONTROLLER (js/settings.js)
 * Real MongoDB User Settings Controller
 * Handles Profile Edits, Password Change, Preferences, Appearance, & Account Deletion
 * ==========================================================================
 */

if (typeof Auth !== 'undefined') {
  Auth.checkAuth();
}

document.addEventListener('DOMContentLoaded', async () => {

  const token = localStorage.getItem('authToken');
  if (!token) {
    if (typeof Auth !== 'undefined') Auth.logout();
    else window.location.replace('login.html');
    return;
  }

  let stagedPhotoData = '';
  let currentUserData = null;

  // ── STEP 1: Fetch Real User Profile from MongoDB ──────────────
  await fetchUserSettings(token);

  // ── STEP 2: Edit Profile Form Submission (PUT /api/users/profile) ──
  const editProfileForm = document.getElementById('editProfileForm');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const photoFileInput   = document.getElementById('settingPhotoInput');
  const changePhotoBtn   = document.getElementById('changeSettingPhotoBtn');
  const removePhotoBtn   = document.getElementById('removeSettingPhotoBtn');

  if (changePhotoBtn && photoFileInput) {
    changePhotoBtn.addEventListener('click', () => photoFileInput.click());
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showSettingsToast('❌ Image size must be less than 5MB', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          stagedPhotoData = event.target.result;
          renderSettingAvatar(stagedPhotoData);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      stagedPhotoData = '';
      const name = document.getElementById('setting-name')?.value || 'User';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      renderSettingInitials(initials);
    });
  }

  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
      if (currentUserData) populateProfileForm(currentUserData);
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name     = document.getElementById('setting-name')?.value.trim();
      const username = document.getElementById('setting-username')?.value.trim();
      const email    = document.getElementById('setting-email')?.value.trim();
      const phone    = document.getElementById('setting-phone')?.value.trim();
      const location = document.getElementById('setting-location')?.value.trim();
      const bio      = document.getElementById('setting-bio')?.value.trim();

      const submitBtn = editProfileForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

      try {
        console.log('[Settings] Submitting PUT /api/users/profile...');
        const res = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            username,
            email,
            phone,
            location,
            bio,
            profileImage: stagedPhotoData
          })
        });

        const result = await res.json();
        console.log('[Settings] Profile Response:', result);

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update profile');
        }

        if (result.user) {
          localStorage.setItem('user_data', JSON.stringify(result.user));
          if (result.user.email) localStorage.setItem('loggedInUser', result.user.email);
        }

        showSettingsToast('✅ Profile updated successfully!', 'success');
        await fetchUserSettings(token);

      } catch (err) {
        console.error('[Settings Error] Profile edit failed:', err.message);
        showSettingsToast(`❌ ${err.message}`, 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Changes'; }
      }
    });
  }

  // ── STEP 3: Change Password Form (PUT /api/users/change-password) ──
  const passwordForm = document.getElementById('changePasswordForm');
  const pwdCurrent   = document.getElementById('pwd-current');
  const pwdNew       = document.getElementById('pwd-new');
  const pwdConfirm   = document.getElementById('pwd-confirm');

  if (typeof PasswordValidator !== 'undefined' && pwdNew) {
    PasswordValidator.attachUI({
      passwordInput: pwdNew,
      confirmInput: pwdConfirm,
      popoverCardEl: document.getElementById('settingPwdPopoverCard'),
      checklistEl: document.getElementById('settingPwdChecklist'),
      strengthMeterEl: document.getElementById('settingStrengthBar'),
      strengthTextEl: document.getElementById('settingStrengthText'),
      matchFeedbackEl: document.getElementById('settingMatchFeedback'),
      togglePasswordBtn: document.getElementById('toggleSettingNewPassword'),
      toggleConfirmBtn: document.getElementById('toggleSettingConfirmPassword')
    });
  }

  if (pwdCurrent && typeof PasswordValidator !== 'undefined') {
    PasswordValidator.setupToggle(document.getElementById('toggleSettingCurrentPassword'), pwdCurrent);
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = pwdCurrent ? pwdCurrent.value : '';
      const newPassword     = pwdNew ? pwdNew.value : '';
      const confirmPassword = pwdConfirm ? pwdConfirm.value : '';

      if (!currentPassword) {
        showSettingsToast('❌ Please enter your current password.', 'error');
        return;
      }

      if (typeof PasswordValidator !== 'undefined') {
        const evalRes = PasswordValidator.evaluate(newPassword);
        if (!evalRes.isValid) {
          showSettingsToast('❌ New password does not satisfy all policy requirements.', 'error');
          return;
        }
      }

      if (newPassword !== confirmPassword) {
        showSettingsToast('❌ Confirm password does not match new password.', 'error');
        return;
      }

      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Updating...'; }

      try {
        console.log('[Settings] Submitting PUT /api/users/change-password...');
        const res = await fetch('http://localhost:5000/api/users/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });

        const result = await res.json();
        console.log('[Settings] Password Response:', result);

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update password');
        }

        showSettingsToast('✅ Password updated successfully!', 'success');
        passwordForm.reset();

      } catch (err) {
        console.error('[Settings Error] Password update failed:', err.message);
        showSettingsToast(`❌ ${err.message}`, 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Update Password'; }
      }
    });
  }

  // ── STEP 4: Preferences Toggles (PUT /api/users/preferences) ────
  const prefSwitches = document.querySelectorAll('.pref-toggle-input');
  prefSwitches.forEach(sw => {
    sw.addEventListener('change', async () => {
      const emailNotifications   = document.getElementById('sw-email')?.checked;
      const commentNotifications = document.getElementById('sw-comments')?.checked;
      const onlineStatus         = document.getElementById('sw-online')?.checked;
      const autoSaveDrafts       = document.getElementById('sw-autosave')?.checked;

      try {
        const res = await fetch('http://localhost:5000/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            preferences: {
              emailNotifications,
              commentNotifications,
              onlineStatus,
              autoSaveDrafts
            }
          })
        });

        const result = await res.json();
        if (res.ok && result.success) {
          showSettingsToast('✅ Preferences saved!', 'success');
        }
      } catch (err) {
        console.warn('[Preferences Error]:', err.message);
      }
    });
  });

  // ── STEP 5: Appearance Selection (Light, Dark, System) ─────────
  const appearanceCards = document.querySelectorAll('.appearance-card');
  appearanceCards.forEach(card => {
    card.addEventListener('click', async () => {
      const mode = card.getAttribute('data-mode') || 'light';

      appearanceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Apply theme globally instantly across entire app
      if (window.Theme && typeof window.Theme.setTheme === 'function') {
        window.Theme.setTheme(mode);
      } else {
        localStorage.setItem('theme', mode);
      }

      // Save preference to MongoDB backend
      try {
        await fetch('http://localhost:5000/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ appearance: mode })
        });
      } catch (err) {
        console.warn('[Appearance API Error]:', err.message);
      }
    });
  });

  // ── STEP 6: Account Actions (Logout & Delete Account) ─────────
  const logoutBtn = document.getElementById('settingLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Auth !== 'undefined') Auth.logout();
      else { localStorage.clear(); window.location.replace('login.html'); }
    });
  }

  const deleteAccBtn = document.getElementById('deleteAccountBtn');
  const deleteModal  = document.getElementById('deleteAccountModalOverlay');
  const cancelDelete = document.getElementById('cancelDeleteAccBtn');
  const confirmDelete = document.getElementById('confirmDeleteAccBtn');

  if (deleteAccBtn && deleteModal) {
    deleteAccBtn.addEventListener('click', () => deleteModal.classList.add('active'));
  }

  if (cancelDelete && deleteModal) {
    cancelDelete.addEventListener('click', () => deleteModal.classList.remove('active'));
  }

  if (confirmDelete && deleteModal) {
    confirmDelete.addEventListener('click', async () => {
      try {
        console.log('[Settings] Sending DELETE /api/users/account...');
        const res = await fetch('http://localhost:5000/api/users/account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await res.json();
        deleteModal.classList.remove('active');

        if (!res.ok || !result.success) {
          showSettingsToast(`❌ ${result.message || 'Failed to delete account'}`, 'error');
          return;
        }

        showSettingsToast('✅ Account deleted permanently. Goodbye!', 'success');
        localStorage.clear();
        setTimeout(() => window.location.replace('login.html'), 1500);

      } catch (err) {
        console.error('[Settings Error] Delete account failed:', err.message);
        showSettingsToast(`❌ ${err.message}`, 'error');
      }
    });
  }

  // Sidebar & Top Nav Handlers
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn   = document.getElementById('hamburgerBtn');

  if (hamburgerBtn && sidebar && sidebarOverlay) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      sidebarOverlay.classList.toggle('active');
    });
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('active');
    });
  }

  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  });

  // Helper functions
  function renderSettingAvatar(url) {
    const el = document.getElementById('settingPhotoCircle');
    if (el) el.innerHTML = `<img src="${url}" alt="Profile Photo">`;
  }

  function renderSettingInitials(initials) {
    const el = document.getElementById('settingPhotoCircle');
    if (el) el.textContent = initials || 'U';
  }

  async function fetchUserSettings(token) {
    try {
      console.log('[Settings API] Fetching user profile...');
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        currentUserData = data.user;
        populateReadonlyInfo(data.user);
        populateProfileForm(data.user);
        populatePreferences(data.user);
        populateAppearance(data.user);
      }
    } catch (err) {
      console.error('[Settings API Error]:', err.message);
    }
  }

  function populateReadonlyInfo(user) {
    setTextVal('infoName',     user.name,     'Not Available');
    setTextVal('infoEmail',    user.email,    'Not Available');
    setTextVal('infoUsername', user.username ? `@${user.username.replace(/^@/, '')}` : '', 'Not Available');
  }

  function populateProfileForm(user) {
    setInpVal('setting-name',     user.name);
    setInpVal('setting-username', user.username);
    setInpVal('setting-email',    user.email);
    setInpVal('setting-phone',    user.phone);
    setInpVal('setting-location', user.location);
    setInpVal('setting-bio',      user.bio);

    stagedPhotoData = user.profileImage || '';
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    if (stagedPhotoData) renderSettingAvatar(stagedPhotoData);
    else renderSettingInitials(initials);

    // Navbar Profile Badge
    const navAvatar = document.getElementById('userAvatar');
    const navName   = document.getElementById('userDisplayName');
    if (navAvatar) navAvatar.textContent = initials;
    if (navName)   navName.textContent   = `${user.name || 'User'} ▾`;
  }

  function populatePreferences(user) {
    const p = user.preferences || {};
    setChkVal('sw-email',    p.emailNotifications !== false);
    setChkVal('sw-comments', p.commentNotifications !== false);
    setChkVal('sw-online',   p.onlineStatus !== false);
    setChkVal('sw-autosave', p.autoSaveDrafts !== false);
  }

  function populateAppearance(user) {
    const mode = user.appearance || (window.Theme ? window.Theme.getTheme() : 'light');
    if (window.Theme && typeof window.Theme.applyTheme === 'function') {
      window.Theme.applyTheme(mode);
    }
    appearanceCards.forEach(card => {
      if (card.getAttribute('data-mode') === mode) card.classList.add('active');
      else card.classList.remove('active');
    });
  }

  function setTextVal(id, val, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    if (val && val.trim() !== '') {
      el.textContent = val;
      el.classList.remove('not-available');
    } else {
      el.textContent = fallback;
      el.classList.add('not-available');
    }
  }

  function setInpVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function setChkVal(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = !!checked;
  }

});

function showSettingsToast(msg, type = 'success') {
  const existing = document.getElementById('_settings-toast-banner');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_settings-toast-banner';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: #FFFFFF; padding: 12px 24px; border-radius: 12px;
    font-family: Poppins, sans-serif; font-size: 0.88rem; font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 99999;
    animation: slideUpFade 0.3s ease-out;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
