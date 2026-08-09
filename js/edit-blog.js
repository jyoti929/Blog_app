/**
 * ==========================================================================
 * BLOGIFY STUDIO - EDIT BLOG CONTROLLER (js/edit-blog.js)
 * Reuses Create Blog UI system, toolbar engine, theme grid, & live preview modal
 * ==========================================================================
 */

// 8 Visual Theme Datasets (Identical to Create Blog)
const VISUAL_THEMES = [
  { id: 'theme-01', previewClass: 't-preview-01', colors: ['#10B981', '#14B8A6', '#3B82F6'] },
  { id: 'theme-02', previewClass: 't-preview-02', colors: ['#0F172A', '#1E293B', '#10B981'] },
  { id: 'theme-03', previewClass: 't-preview-03', colors: ['#FFFFFF', '#111827', '#64748B'] },
  { id: 'theme-04', previewClass: 't-preview-04', colors: ['#6366F1', '#EC4899', '#38BDF8'] },
  { id: 'theme-05', previewClass: 't-preview-05', colors: ['#991B1B', '#FFFBEB', '#0F172A'] },
  { id: 'theme-06', previewClass: 't-preview-06', colors: ['#FEF3C7', '#78350F', '#65A30D'] },
  { id: 'theme-07', previewClass: 't-preview-07', colors: ['#8B5CF6', '#F59E0B', '#EC4899'] },
  { id: 'theme-08', previewClass: 't-preview-08', colors: ['#000000', '#FFFFFF', '#737373'] }
];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Edit Blog] Initializing Edit Blog Studio...');

  // 1. Get Blog ID from URL Parameters
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get('id');
  console.log(`[Edit Blog] Blog ID: ${blogId || 'None'}`);

  const loadingView   = document.getElementById('edit-loading-view');
  const errorView     = document.getElementById('edit-error-view');
  const formWrapper   = document.getElementById('edit-form-wrapper');

  if (!blogId) {
    showErrorView('No Blog ID Specified', 'Please provide a valid blog ID in the URL parameter (e.g. edit-blog.html?id=...).');
    return;
  }

  // State Variables
  let currentBlogData = null;
  let currentUserData = null;
  let tagsList = [];
  let uploadedImageData = '';
  let selectedThemeId = 'theme-01';
  let isDirty = false;

  // DOM Form Controls
  const blogForm      = document.getElementById('edit-blog-form');
  const titleInput    = document.getElementById('blog-title');
  const categorySelect= document.getElementById('blog-category');
  const contentInputHidden = document.getElementById('blog-content');
  const contentEditor = document.getElementById('blog-content-editor');

  const imageFileInput= document.getElementById('blog-image-file');
  const dropzoneArea  = document.getElementById('image-upload-area');
  const previewBox    = document.getElementById('cover-preview-box');
  const previewImg    = document.getElementById('cover-preview-img');
  const replaceCoverBtn= document.getElementById('replace-cover-btn');
  const removeCoverBtn= document.getElementById('remove-cover-btn');

  const tagsContainer = document.getElementById('tags-container');
  const tagInputField = document.getElementById('tag-input-field');

  // Preview Modal Elements
  const previewModalOverlay = document.getElementById('previewModalOverlay');
  const previewBodyContent  = document.getElementById('preview-body-content');
  const btnPreview          = document.getElementById('btn-preview');
  const closePreviewBtn     = document.getElementById('close-preview-btn');

  // Action Buttons
  const btnCancel    = document.getElementById('btn-cancel');
  const btnSaveDraft = document.getElementById('btn-save-draft');
  const btnUpdateBlog= document.getElementById('btn-update-blog');

  // Load Auth Token
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('[Edit Blog] No auth token found in localStorage.');
    window.location.href = 'login.html';
    return;
  }

  try {
    console.log('[Edit Blog] Loading blog...');

    const apiBase = window.API_BASE_URL || 'http://localhost:5000/api';

    // Fetch Authenticated User Profile
    const meRes = await fetch(`${apiBase}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (meRes.ok) {
      const meData = await meRes.json();
      currentUserData = meData.user || meData.data;

      // Update User Avatar & Name in Top Navbar
      const userAvatar = document.getElementById('userAvatar');
      const userDisplayName = document.getElementById('userDisplayName');
      if (userAvatar && currentUserData.name) {
        userAvatar.textContent = currentUserData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
      if (userDisplayName && currentUserData.name) {
        userDisplayName.textContent = `${currentUserData.name} ▾`;
      }
    }

    // Fetch Real MongoDB Blog Document: GET /api/blogs/:id
    const blogRes = await fetch(`${apiBase}/blogs/${blogId}`);
    if (!blogRes.ok) {
      if (blogRes.status === 404) {
        showErrorView('Blog not found.', 'The requested blog post could not be found or has been deleted.');
        return;
      }
      showErrorView('Unable to connect to the server.', 'Please try again later.');
      return;
    }

    const blogJson = await blogRes.json();
    currentBlogData = blogJson.data || blogJson.blog;

    if (!currentBlogData) {
      showErrorView('Blog not found.', 'The requested blog post data is missing.');
      return;
    }

    console.log('[Edit Blog] Blog loaded successfully');

    // User Ownership Verification Check
    const currentUserId = currentUserData ? (currentUserData._id || currentUserData.id) : null;
    const blogAuthorId = currentBlogData.author
      ? (typeof currentBlogData.author === 'object' ? (currentBlogData.author._id || currentBlogData.author.id) : currentBlogData.author)
      : null;

    if (currentUserId && blogAuthorId && currentUserId.toString() !== blogAuthorId.toString()) {
      console.warn('[Edit Blog] User ownership mismatch! Access denied.');
      showErrorView("You don't have permission to edit this blog.", 'Security check failed. You can edit only your own blogs.');
      return;
    }

    console.log('[Edit Blog] User ownership verified');

    // Populate Form Controls with Saved MongoDB Data
    populateFormWithBlogData(currentBlogData);

    // Render Visual Themes Grid
    renderThemeGridVisual();

    // Show Form View
    loadingView.style.display = 'none';
    errorView.style.display = 'none';
    formWrapper.style.display = 'block';

  } catch (err) {
    console.error('[Edit Blog Error]:', err.message);
    showErrorView('Unable to connect to the server. Please try again.', err.message);
  }

  /**
   * Populate Form Controls with existing blog properties
   */
  function populateFormWithBlogData(blog) {
    titleInput.value = blog.title || '';
    categorySelect.value = blog.category || 'General';
    contentEditor.innerHTML = blog.content || '<p></p>';
    contentInputHidden.value = blog.content || '';

    tagsList = Array.isArray(blog.tags) ? [...blog.tags] : [];
    renderTags();

    uploadedImageData = blog.imageUrl || blog.coverImage || blog.imageData || '';
    if (uploadedImageData) {
      previewImg.src = uploadedImageData;
      previewBox.style.display = 'block';
      dropzoneArea.style.display = 'none';
    } else {
      previewBox.style.display = 'none';
      dropzoneArea.style.display = 'block';
    }

    selectedThemeId = blog.theme || 'theme-01';
  }

  // 1. Contenteditable Editor Rich Formatting Commands Execution
  function execFmt(command, value = null) {
    if (!contentEditor) return;
    contentEditor.focus();
    document.execCommand(command, false, value);
    syncContent();
    markDirty();
  }

  function syncContent() {
    if (contentEditor && contentInputHidden) {
      contentInputHidden.value = contentEditor.innerHTML.trim();
    }
  }

  if (contentEditor) {
    contentEditor.addEventListener('input', () => { syncContent(); markDirty(); });
    contentEditor.addEventListener('keyup', () => { syncContent(); markDirty(); });
  }

  // Attach Formatting Toolbar Buttons Events
  document.querySelectorAll('.tb-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.getAttribute('data-cmd');
      const val = btn.getAttribute('data-val') || null;

      switch (cmd) {
        case 'createLink': {
          const url = prompt('Enter link URL:', 'https://');
          if (url) execFmt('createLink', url);
          break;
        }
        case 'insertImage': {
          const imgUrl = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800');
          if (imgUrl) execFmt('insertImage', imgUrl);
          break;
        }
        default:
          execFmt(cmd, val);
          break;
      }
    });
  });

  const fmtHeading = document.getElementById('fmt-heading');
  if (fmtHeading) {
    fmtHeading.addEventListener('change', () => execFmt('formatBlock', fmtHeading.value));
  }

  const fmtFontFamily = document.getElementById('fmt-font-family');
  if (fmtFontFamily) {
    fmtFontFamily.addEventListener('change', () => execFmt('fontName', fmtFontFamily.value));
  }

  const fmtFontSize = document.getElementById('fmt-font-size');
  if (fmtFontSize) {
    fmtFontSize.addEventListener('change', () => execFmt('fontSize', fmtFontSize.value));
  }

  const fmtTextColor = document.getElementById('fmt-text-color');
  if (fmtTextColor) {
    fmtTextColor.addEventListener('input', () => execFmt('foreColor', fmtTextColor.value));
  }

  const fmtBgColor = document.getElementById('fmt-bg-color');
  if (fmtBgColor) {
    fmtBgColor.addEventListener('input', () => execFmt('hiliteColor', fmtBgColor.value));
  }

  // 2. Render Visual Theme Cards Grid
  function renderThemeGridVisual() {
    const themeGridVisual = document.getElementById('theme-grid-visual');
    if (!themeGridVisual) return;

    themeGridVisual.innerHTML = VISUAL_THEMES.map(theme => `
      <div class="theme-card-visual ${theme.id === selectedThemeId ? 'selected' : ''}" data-theme="${theme.id}">
        <div class="theme-check-badge">✓</div>
        <div class="theme-img-preview ${theme.previewClass}">
          <div style="height:6px; width:45%; background:rgba(255,255,255,0.7); border-radius:4px;"></div>
          <div style="height:12px; width:75%; background:rgba(255,255,255,0.9); border-radius:4px;"></div>
          <div style="height:5px; width:90%; background:rgba(255,255,255,0.5); border-radius:4px;"></div>
        </div>
        <div class="theme-dots-row">
          ${theme.colors.map(c => `<span class="dot-swatch" style="background:${c};"></span>`).join('')}
        </div>
        <div class="theme-card-btns">
          <button type="button" class="btn-card-prev" data-theme="${theme.id}">Preview</button>
          <button type="button" class="btn-card-sel" data-theme="${theme.id}">${theme.id === selectedThemeId ? 'Selected' : 'Select'}</button>
        </div>
      </div>
    `).join('');

    themeGridVisual.querySelectorAll('.theme-card-visual').forEach(card => {
      card.addEventListener('click', () => selectTheme(card.getAttribute('data-theme')));
    });

    themeGridVisual.querySelectorAll('.btn-card-sel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTheme(btn.getAttribute('data-theme'));
      });
    });

    themeGridVisual.querySelectorAll('.btn-card-prev').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTheme(btn.getAttribute('data-theme'));
        openPreviewModal();
      });
    });
  }

  function selectTheme(themeId) {
    selectedThemeId = themeId;
    markDirty();
    const themeGridVisual = document.getElementById('theme-grid-visual');
    if (themeGridVisual) {
      themeGridVisual.querySelectorAll('.theme-card-visual').forEach(card => {
        const isCur = card.getAttribute('data-theme') === themeId;
        card.classList.toggle('selected', isCur);
        const selBtn = card.querySelector('.btn-card-sel');
        if (selBtn) selBtn.textContent = isCur ? 'Selected' : 'Select';
      });
    }
  }

  // 3. Tag Badges Management
  function renderTags() {
    if (!tagsContainer) return;
    tagsContainer.querySelectorAll('.tag-badge').forEach(b => b.remove());

    tagsList.forEach((tag, idx) => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.innerHTML = `#${tag} <span data-idx="${idx}">&times;</span>`;
      badge.querySelector('span').addEventListener('click', () => {
        tagsList.splice(idx, 1);
        markDirty();
        renderTags();
      });
      tagsContainer.insertBefore(badge, tagInputField);
    });
  }

  if (tagInputField) {
    tagInputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = tagInputField.value.trim().replace(/^#/, '');
        if (val && !tagsList.includes(val)) {
          tagsList.push(val);
          tagInputField.value = '';
          markDirty();
          renderTags();
        }
      }
    });
  }

  // 4. Featured Cover Image Handling
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedImageData = event.target.result;
          previewImg.src = uploadedImageData;
          previewBox.style.display = 'block';
          dropzoneArea.style.display = 'none';
          markDirty();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeCoverBtn) {
    removeCoverBtn.addEventListener('click', () => {
      uploadedImageData = '';
      if (imageFileInput) imageFileInput.value = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      dropzoneArea.style.display = 'block';
      markDirty();
    });
  }

  // Live Story Preview Modal Handlers
  if (btnPreview) btnPreview.addEventListener('click', openPreviewModal);
  if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreviewModal);
  if (previewModalOverlay) {
    previewModalOverlay.addEventListener('click', (e) => {
      if (e.target === previewModalOverlay) closePreviewModal();
    });
  }

  function openPreviewModal() {
    renderPreviewContent();
    if (previewModalOverlay) previewModalOverlay.classList.add('active');
  }

  function closePreviewModal() {
    if (previewModalOverlay) previewModalOverlay.classList.remove('active');
  }

  function renderPreviewContent() {
    if (!previewBodyContent) return;

    const title     = titleInput ? titleInput.value.trim() || 'Untitled Story' : 'Untitled Story';
    const category  = categorySelect ? categorySelect.value || 'General' : 'General';
    const content   = contentEditor ? contentEditor.innerHTML.trim() || '<p>Your story content will render here...</p>' : '';
    const authorName= currentUserData ? currentUserData.name : 'Author';
    const dateStr   = currentBlogData && currentBlogData.createdAt
      ? new Date(currentBlogData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Just Now';

    previewBodyContent.className = `preview-body-content ${selectedThemeId}`;
    previewBodyContent.innerHTML = `
      <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
        <span class="badge-tag" style="background:#10B981; color:#FFFFFF; padding:4px 12px; border-radius:12px; font-weight:700; font-size:0.78rem;">
          ${category}
        </span>
        <small style="color:var(--muted); font-size:0.78rem;">Published on ${dateStr}</small>
      </div>

      <h1 style="font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; line-height: 1.25; margin-bottom: 16px; color: var(--text-main, #0F172A);">
        ${title}
      </h1>

      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid var(--border, #E2E8F0);">
        <div class="author-avatar-circle" style="width:36px; height:36px; font-size:0.85rem; background:#10B981; color:#FFFFFF; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">
          ${authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <strong style="font-size:0.9rem; display:block;">${authorName}</strong>
        </div>
      </div>

      <div class="post-story-body" style="font-size:1.05rem; line-height:1.85; margin-bottom:28px;">
        ${content}
      </div>

      ${tagsList.length > 0 ? `
        <div style="display:flex; flex-wrap:wrap; gap:8px; padding-top:14px; border-top:1px solid var(--border, #E2E8F0);">
          <span style="font-size:0.82rem; font-weight:700; color:var(--text-sub, #64748B); margin-right:4px;">Tags:</span>
          ${tagsList.map(t => `<span class="tag-badge" style="background:var(--bg-subtle, #F1F5F9); border:1px solid var(--border, #E2E8F0); padding:4px 10px; border-radius:20px; font-size:0.78rem; font-weight:600;">#${t}</span>`).join('')}
        </div>
      ` : ''}
    `;
  }

  function markDirty() {
    isDirty = true;
  }

  // Unsaved Changes Guard
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Cancel Handler
  if (btnCancel) {
    btnCancel.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDirty) {
        if (!confirm('You have unsaved changes. Leave without saving?')) {
          return;
        }
      }
      isDirty = false;
      window.location.href = 'dashboard.html';
    });
  }

  // Save Draft Handler
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', (e) => {
      e.preventDefault();
      saveBlogUpdate('draft');
    });
  }

  // Form Submission (Update Blog)
  if (blogForm) {
    blogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveBlogUpdate(currentBlogData ? currentBlogData.status : 'published');
    });
  }

  /**
   * Save Edited Blog to MongoDB via PUT /api/blogs/:id
   */
  async function saveBlogUpdate(targetStatus) {
    syncContent();
    const titleVal = titleInput ? titleInput.value.trim() : '';
    const contentVal = contentInputHidden ? contentInputHidden.value.trim() : '';

    if (!titleVal) {
      showNoticeAlert('Please enter a blog title.', 'danger');
      if (titleInput) titleInput.focus();
      return;
    }

    if (!contentVal || contentVal === '<p></p>') {
      showNoticeAlert('Please write story content before updating.', 'danger');
      if (contentEditor) contentEditor.focus();
      return;
    }

    console.log('[Edit Blog] Saving changes...');
    setButtonsState(true, targetStatus);

    const payload = {
      title: titleVal,
      category: categorySelect ? categorySelect.value : 'General',
      content: contentVal,
      imageUrl: uploadedImageData,
      coverImage: uploadedImageData,
      tags: tagsList,
      theme: selectedThemeId,
      status: targetStatus
    };

    try {
      const apiBase = window.API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.log('[Edit Blog] Update API response:', resData);

      if (response.ok && resData.success) {
        console.log('[Edit Blog] Blog updated successfully');
        isDirty = false;

        const successMsg = targetStatus === 'draft' ? 'Draft saved successfully.' : 'Blog updated successfully.';
        showNoticeAlert(`✅ ${successMsg}`, 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);

      } else {
        const errorMsg = resData.message || 'Failed to update blog.';
        showNoticeAlert(`⚠️ ${errorMsg}`, 'danger');
        setButtonsState(false, targetStatus);
      }

    } catch (err) {
      console.error('[Edit Blog Update Error]:', err.message);
      showNoticeAlert('Unable to connect to the server. Please try again.', 'danger');
      setButtonsState(false, targetStatus);
    }
  }

  function setButtonsState(isSaving, targetStatus) {
    if (btnSaveDraft) {
      btnSaveDraft.disabled = isSaving;
      btnSaveDraft.textContent = (isSaving && targetStatus === 'draft') ? 'Saving...' : 'Save Draft';
    }

    if (btnUpdateBlog) {
      btnUpdateBlog.disabled = isSaving;
      btnUpdateBlog.textContent = (isSaving && targetStatus !== 'draft') ? 'Updating...' : 'Update Blog →';
    }
  }

  function showNoticeAlert(msg, type = 'success') {
    const alertEl = document.getElementById('edit-notice-alert');
    if (!alertEl) return;

    alertEl.style.display = 'block';
    alertEl.style.background = type === 'success' ? '#DCFCE7' : '#FEE2E2';
    alertEl.style.color = type === 'success' ? '#166534' : '#991B1B';
    alertEl.style.border = type === 'success' ? '1px solid #86EFAC' : '1px solid #FCA5A5';
    alertEl.textContent = msg;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showErrorView(titleMsg, subMsg) {
    loadingView.style.display = 'none';
    formWrapper.style.display = 'none';
    errorView.style.display = 'block';

    const errTitle = document.getElementById('edit-error-title');
    const errSub   = document.getElementById('edit-error-message');

    if (errTitle) errTitle.textContent = titleMsg;
    if (errSub) errSub.textContent = subMsg;
  }
});
