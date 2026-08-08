/**
 * ==========================================================================
 * BLOGIFY CLEAN USER PROFILE CONTROLLER (js/profile.js)
 * Manages Real MongoDB Profile Display, Photo Upload/Removal & Profile Edits
 * Includes Automatic Multi-Endpoint Fallbacks to Prevent Any 404 Errors
 * ==========================================================================
 */

// 1. Synchronous Route Protection Guard
if (typeof Auth !== 'undefined') {
  Auth.checkAuth();
}

document.addEventListener('DOMContentLoaded', async () => {

  // ── STEP 1: Verify Auth Token ────────────────────────────────
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('[Profile] No authToken found. Redirecting to login...');
    if (typeof Auth !== 'undefined') Auth.logout();
    else window.location.replace('login.html');
    return;
  }

  // Active Photo Data state (base64 string or empty)
  let stagedPhotoData = '';

  // ── STEP 2: Fetch Real Profile from MongoDB ──────────────────
  await fetchUserProfile(token);

  // ── STEP 3: Setup Profile Edit Modal Listeners ────────────────
  const modalOverlay   = document.getElementById('profileEditModal');
  const openModalBtn   = document.getElementById('openEditModalBtn');
  const closeModalBtns = document.querySelectorAll('.close-modal-btn');
  const profileForm    = document.getElementById('modalProfileForm');

  function openModal() {
    if (modalOverlay) modalOverlay.classList.add('active');
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // ── STEP 4: Setup Profile Photo Picker & Upload / Removal ────
  const photoFileInput  = document.getElementById('photoFileInput');
  const cameraOverlay   = document.getElementById('cameraOverlayBtn');
  const removePhotoBtn  = document.getElementById('removePhotoBtn');
  const changePhotoBtn  = document.getElementById('changePhotoBtn');

  if (cameraOverlay && photoFileInput) {
    cameraOverlay.addEventListener('click', () => photoFileInput.click());
  }

  if (changePhotoBtn && photoFileInput) {
    changePhotoBtn.addEventListener('click', () => photoFileInput.click());
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          stagedPhotoData = event.target.result;
          previewAvatarPhoto(stagedPhotoData);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      stagedPhotoData = '';
      const currentName = document.getElementById('edit-name')?.value || 'User';
      const initials = currentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      previewAvatarInitials(initials);
    });
  }

  // ── STEP 5: Form Submit Handler with Auto Fallbacks (PUT /api/users/profile, /api/auth/profile, /api/auth/me) ─────
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name     = document.getElementById('edit-name')?.value.trim();
      const username = document.getElementById('edit-username')?.value.trim();
      const email    = document.getElementById('edit-email')?.value.trim();
      const phone    = document.getElementById('edit-phone')?.value.trim();
      const location = document.getElementById('edit-location')?.value.trim();
      const bio      = document.getElementById('edit-bio')?.value.trim();

      const submitBtn = profileForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const endpoints = [
        'http://localhost:5000/api/users/profile',
        'http://localhost:5000/api/auth/profile',
        'http://localhost:5000/api/auth/me'
      ];

      const payload = JSON.stringify({
        name,
        username,
        email,
        phone,
        location,
        bio,
        profileImage: stagedPhotoData
      });

      try {
        console.log('[Profile] Sending PUT update request...');
        const res = await apiFetchWithFallback(endpoints, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: payload
        });

        const result = res.data;
        console.log('[Profile] PUT Response:', result);

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update profile');
        }

        if (result.user) {
          localStorage.setItem('user_data', JSON.stringify(result.user));
          if (result.user.email) localStorage.setItem('loggedInUser', result.user.email);
        }

        showProfileToast('✅ Profile updated successfully!', 'success');
        closeModal();

        // Refresh real data from MongoDB
        await fetchUserProfile(token);

      } catch (err) {
        console.error('[Profile Error] Update failed:', err.message);
        showProfileToast(`❌ ${err.message}`, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '💾 Save Changes';
        }
      }
    });
  }

  // ── STEP 6: Sidebar & Logout Handlers ────────────────────────
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

  const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-action-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Auth !== 'undefined') Auth.logout();
      else { localStorage.clear(); window.location.replace('login.html'); }
    });
  });

  // Helper functions for image preview
  function previewAvatarPhoto(url) {
    const avatarEl = document.getElementById('photoCircle');
    if (avatarEl) avatarEl.innerHTML = `<img src="${url}" alt="Profile Photo">`;
  }

  function previewAvatarInitials(initials) {
    const avatarEl = document.getElementById('photoCircle');
    if (avatarEl) avatarEl.textContent = initials || 'U';
  }

});

/**
 * Helper: Tries a list of API endpoints sequentially to guarantee no 404 errors
 */
async function apiFetchWithFallback(endpoints, options) {
  let lastErr = null;
  for (const url of endpoints) {
    try {
      console.log(`[Profile API] Requesting ${options.method || 'GET'} ${url}...`);
      const response = await fetch(url, options);
      if (response.status === 404) {
        console.warn(`[Profile API] ${url} returned 404 Not Found. Trying fallback endpoint...`);
        continue;
      }
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn(`[Profile API] Fetch error for ${url}:`, err.message);
      lastErr = err;
    }
  }
  throw lastErr || new Error('All profile API endpoints failed or returned 404.');
}

/**
 * ==========================================================================
 * FETCH LOGGED-IN USER PROFILE (GET /api/users/profile, /api/auth/profile, /api/auth/me)
 * ==========================================================================
 */
async function fetchUserProfile(token) {
  try {
    console.log('[Profile API] Fetching authenticated user profile from GET /api/auth/me...');
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      console.warn('[Profile] Token invalid/expired (401). Redirecting to login.html...');
      if (typeof Auth !== 'undefined') Auth.clearSessionData();
      else localStorage.clear();
      window.location.replace('login.html');
      return;
    }

    const result = await response.json();
    console.log('[Profile API] Response:', result);

    if (!response.ok || !result.success || !result.user) {
      console.warn('[Profile API] Rendering fallback cached user data');
      renderProfileData(typeof Auth !== 'undefined' ? Auth.getUserData() : null);
      return;
    }

    renderProfileData(result.user);

  } catch (err) {
    console.error('[Profile API Error]:', err.message);
    const fallbackUser = typeof Auth !== 'undefined' ? Auth.getUserData() : null;
    renderProfileData(fallbackUser);
  }
}

/**
 * Renders User Profile Data cleanly without fake placeholders
 */
function renderProfileData(user) {
  const name         = user?.name         ? user.name.trim()         : '';
  const username     = user?.username     ? user.username.trim()     : '';
  const email        = user?.email        ? user.email.trim()        : (localStorage.getItem('loggedInUser') || '');
  const phone        = user?.phone        ? user.phone.trim()        : '';
  const location     = user?.location     ? user.location.trim()     : '';
  const bio          = user?.bio          ? user.bio.trim()          : '';
  const profileImage = user?.profileImage ? user.profileImage.trim() : '';

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  // Photo Preview
  const photoCircle = document.getElementById('photoCircle');
  const navAvatar   = document.getElementById('userAvatar');
  const navName     = document.getElementById('userDisplayName');
  const initials    = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  if (photoCircle) {
    if (profileImage) {
      photoCircle.innerHTML = `<img src="${profileImage}" alt="Profile Photo">`;
    } else {
      photoCircle.textContent = initials;
    }
  }

  if (navAvatar) navAvatar.textContent = initials;
  if (navName)   navName.textContent   = `${name || 'User'} ▾`;

  // Profile Information Fields
  setFieldText('cardName',        name,     'Not Available');
  setFieldText('cardUsername',    username ? `@${username.replace(/^@/, '')}` : '', 'Not Available');
  setFieldText('cardEmail',       email,    'Not Available');
  setFieldText('cardPhone',       phone,    'Not Available');
  setFieldText('cardLocation',    location, 'Not Available');
  setFieldText('cardBio',         bio,      'Not Available');
  setFieldText('cardMemberSince', `Member since ${createdAt}`, 'Member since Recently');

  // Pre-fill Modal Form Inputs
  setInputValue('edit-name',     name);
  setInputValue('edit-username', username);
  setInputValue('edit-email',    email);
  setInputValue('edit-phone',    phone);
  setInputValue('edit-location', location);
  setInputValue('edit-bio',      bio);
}

function setFieldText(elementId, val, fallbackText) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (val && val.trim() !== '') {
    el.textContent = val;
    el.classList.remove('not-available');
  } else {
    el.textContent = fallbackText;
    el.classList.add('not-available');
  }
}

function setInputValue(elementId, val) {
  const input = document.getElementById(elementId);
  if (input) input.value = val || '';
}

function showProfileToast(msg, type = 'success') {
  const existing = document.getElementById('_profile-toast-banner');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_profile-toast-banner';
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
