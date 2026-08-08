/**
 * ==========================================================================
 * BLOGIFY STUDIO - CREATE BLOG CONTROLLER (js/create-blog.js)
 * Contenteditable Rich Text Editor Engine, Toolbar Controller & Template Pre-fill
 * ==========================================================================
 */

// 1. Synchronous Route Protection Guard
if (typeof Auth !== 'undefined') {
  Auth.checkAuth();
}

// 8 Visual Theme Datasets
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

// 8 Template Pre-fill Datasets
const TEMPLATE_DATA = {
  'tmpl-tech': {
    title: 'The Future of Web Engineering: What to Expect in 2026',
    category: 'Technology',
    content: `<h2>Introduction</h2><p>Web development is advancing rapidly with serverless edge networks, AI-assisted tools, and modern UI architectures.</p><h2>1. Edge Serverless Processing</h2><p>Deploying logic closer to users drastically reduces roundtrip latencies...</p><h2>2. AI-Accelerated Development</h2><p>Developers are leveraging AI tools to automate boilerplate code and focus on core business logic.</p><h2>Conclusion</h2><p>Embracing modern tooling empowers teams to build faster and deliver resilient web applications.</p>`
  },
  'tmpl-travel': {
    title: '7 Hidden Alpine Destinations You Must Explore',
    category: 'Travel',
    content: `<h2>Uncovering Hidden Gems</h2><p>Step off the beaten path and discover serene mountain valleys unaffected by commercial tourism.</p><h2>Destination 1: Swiss Alpine Valleys</h2><p>Nestled deep between snow-covered peaks lie peaceful villages offering breathtaking scenery...</p><h2>Destination 2: Norwegian Coastal Fjords</h2><p>Navigating scenic coastal inlets surrounded by dramatic cliffs and pristine waterfalls.</p><ul><li>Pack lightweight weather-resistant gear</li><li>Respect local cultural customs</li></ul>`
  },
  'tmpl-food': {
    title: 'Mastering Authentic Wood-Fired Neapolitan Pizza at Home',
    category: 'Food',
    content: `<h2>The Secrets to a Crispy, Airy Crust</h2><p>Creating Neapolitan pizza requires high hydration dough and intense baking heat.</p><h2>Ingredients Required</h2><ul><li>500g Tipo 00 Flour</li><li>350ml Cold Water (70% Hydration)</li><li>2g Active Dry Yeast</li><li>10g Fine Sea Salt</li></ul><h2>Step-by-Step Method</h2><ol><li>Mix yeast and flour before gradually adding cold water.</li><li>Knead for 15 minutes until smooth and elastic.</li><li>Ferment at room temperature for 24 hours.</li></ol>`
  },
  'tmpl-business': {
    title: 'Scaling SaaS Revenue: Key Metrics for Startup Founders',
    category: 'Business',
    content: `<h2>Executive Summary</h2><p>Early-stage companies must transition from founder-led sales to repeatable customer acquisition models.</p><h2>Critical Growth Metrics</h2><ul><li>Net Revenue Retention (NRR &gt; 120%)</li><li>Customer Acquisition Cost (CAC) Payback Period</li><li>Monthly Recurring Revenue (MRR) Velocity</li></ul><p>Prioritizing customer success drives expansion revenue and long-term enterprise value.</p>`
  },
  'tmpl-lifestyle': {
    title: 'Designing a Distraction-Free Daily Routine for Peak Focus',
    category: 'Lifestyle',
    content: `<h2>Why Morning Habits Matter</h2><p>The first hour of your morning dictates your focus and mental energy for the entire day.</p><h2>1. Digital Detox After Waking</h2><p>Avoid checking notifications or email for the first 45 minutes of the morning.</p><h2>2. Deep Work Sprints</h2><p>Block 60 to 90 minutes of uninterrupted time for your highest-priority creative project.</p><h2>3. Evening Reflection</h2><p>Review your wins and outline tomorrow's top 3 objectives before finishing the day.</p>`
  },
  'tmpl-ai': {
    title: 'Understanding Neural Transformer Models & Large Language AI',
    category: 'Technology',
    content: `<h2>Attention Mechanisms Explained</h2><p>Transformer architectures revolutionized natural language processing by calculating relationships between words in parallel.</p><h2>Key Architectural Breakthroughs</h2><ul><li>Self-Attention Mechanism</li><li>Multi-Head Attention Alignment</li><li>Contextual Token Embeddings</li></ul><p>AI infrastructure will transform creative workflows, data analysis, and software design.</p>`
  },
  'tmpl-tutorial': {
    title: 'Step-by-Step Tutorial: Building REST APIs with Express & MongoDB',
    category: 'Technology',
    content: `<h2>Prerequisites</h2><p>Ensure Node.js and MongoDB are installed on your system before proceeding.</p><h2>Step 1: Initialize Project</h2><pre><code>mkdir blog-api &amp;&amp; cd blog-api\nnpm init -y\nnpm install express mongoose dotenv cors</code></pre><h2>Step 2: Configure Server Setup</h2><p>Create a server.js file and initialize Express middleware with JSON parsing handles.</p>`
  },
  'tmpl-news': {
    title: 'Global Innovation Summit 2026: Key Breakthroughs Announced',
    category: 'General',
    content: `<h2>Breaking News</h2><p>Industry leaders gathered today to announce major breakthroughs in renewable energy and computing technology.</p><h2>Major Highlights</h2><ul><li>Solid-State Battery Efficiency Increases by 40%</li><li>Global Open-Source Standards Adopted for Cloud Infrastructure</li><li>Next-Generation AI Safety Protocols Standardized</li></ul><p>Analysts expect rapid enterprise adoption throughout the upcoming fiscal year.</p>`
  }
};

document.addEventListener('DOMContentLoaded', async () => {

  const blogForm = document.getElementById('create-blog-form');
  const titleInput = document.getElementById('blog-title');
  const categorySelect = document.getElementById('blog-category');
  const contentInputHidden = document.getElementById('blog-content');
  const contentEditor = document.getElementById('blog-content-editor');

  const imageFileInput = document.getElementById('blog-image-file');
  const dropzoneArea = document.getElementById('image-upload-area');
  const previewBox = document.getElementById('cover-preview-box');
  const previewImg = document.getElementById('cover-preview-img');
  const replaceCoverBtn = document.getElementById('replace-cover-btn');
  const removeCoverBtn = document.getElementById('remove-cover-btn');

  const tagsContainer = document.getElementById('tags-container');
  const tagInputField = document.getElementById('tag-input-field');
  let tagsList = ['JavaScript', 'Design', 'WebDev'];

  let uploadedImageData = '';
  let editId = null;
  let selectedThemeId = 'theme-01';

  // 1. Contenteditable Editor Rich Formatting Commands Execution
  function execFmt(command, value = null) {
    if (!contentEditor) return;
    contentEditor.focus();
    document.execCommand(command, false, value);
    syncContent();
  }

  function syncContent() {
    if (contentEditor && contentInputHidden) {
      contentInputHidden.value = contentEditor.innerHTML.trim();
    }
  }

  if (contentEditor) {
    contentEditor.addEventListener('input', syncContent);
    contentEditor.addEventListener('keyup', syncContent);
    contentEditor.addEventListener('paste', () => setTimeout(syncContent, 10));
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
        case 'insertChecklist': {
          execFmt('insertHTML', '<div style="display:flex; align-items:center; gap:8px; margin:6px 0;"><input type="checkbox"> <span>Checklist item</span></div>');
          break;
        }
        default:
          execFmt(cmd, val);
          break;
      }

      btn.classList.toggle('active', document.queryCommandState(cmd));
    });
  });

  // Toolbar Dropdown Selectors
  const fmtHeading = document.getElementById('fmt-heading');
  if (fmtHeading) {
    fmtHeading.addEventListener('change', () => {
      execFmt('formatBlock', fmtHeading.value);
    });
  }

  const fmtFontFamily = document.getElementById('fmt-font-family');
  if (fmtFontFamily) {
    fmtFontFamily.addEventListener('change', () => {
      execFmt('fontName', fmtFontFamily.value);
    });
  }

  const fmtFontSize = document.getElementById('fmt-font-size');
  if (fmtFontSize) {
    fmtFontSize.addEventListener('change', () => {
      execFmt('fontSize', fmtFontSize.value);
    });
  }

  const fmtTextColor = document.getElementById('fmt-text-color');
  if (fmtTextColor) {
    fmtTextColor.addEventListener('input', () => {
      execFmt('foreColor', fmtTextColor.value);
    });
  }

  const fmtBgColor = document.getElementById('fmt-bg-color');
  if (fmtBgColor) {
    fmtBgColor.addEventListener('input', () => {
      execFmt('hiliteColor', fmtBgColor.value);
    });
  }

  // 2. Render Visual Theme Cards Grid
  const themeGridVisual = document.getElementById('theme-grid-visual');
  if (themeGridVisual) {
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
      card.addEventListener('click', () => {
        selectTheme(card.getAttribute('data-theme'));
      });
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
    if (!themeGridVisual) return;
    themeGridVisual.querySelectorAll('.theme-card-visual').forEach(card => {
      const isCur = card.getAttribute('data-theme') === themeId;
      card.classList.toggle('selected', isCur);
      const selBtn = card.querySelector('.btn-card-sel');
      if (selBtn) selBtn.textContent = isCur ? 'Selected' : 'Select';
    });

    if (window.showToast) window.showToast('Theme selected! ✨');
    renderPreviewContent();
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
          renderTags();
        }
      }
    });
  }
  renderTags();

  // 4. Template Pre-fill Handlers
  document.querySelectorAll('.btn-tmpl-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmplKey = btn.getAttribute('data-tmpl');
      const tmpl = TEMPLATE_DATA[tmplKey];

      if (tmpl) {
        if (titleInput) titleInput.value = tmpl.title;
        if (categorySelect) categorySelect.value = tmpl.category;
        if (contentEditor) {
          contentEditor.innerHTML = tmpl.content;
          syncContent();
        }

        if (window.showToast) window.showToast(`Applied "${tmpl.category}" Template! ✨`);
        if (titleInput) titleInput.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 5. Edit Mode Detection (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  editId = urlParams.get('id');

  if (editId) {
    console.log(`[BlogStudio] Edit mode active for Blog ID: ${editId}`);
    const token = localStorage.getItem('authToken');

    // UI Edit Protection Guard: Verify blog belongs to current user's My Blogs data
    let isOwner = false;
    let existingPost = null;

    try {
      if (token) {
        const myRes = await fetch('http://localhost:5000/api/blogs/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (myRes.ok) {
          const myData = await myRes.json();
          if (myData.success && Array.isArray(myData.data)) {
            existingPost = myData.data.find(p => (p.id || p._id) === editId);
            if (existingPost) isOwner = true;
          }
        }
      }
    } catch (err) {
      console.warn('[BlogStudio] My blogs verification check failed:', err.message);
    }

    if (!isOwner) {
      console.error('[BlogStudio] ❌ Unauthorized edit attempt for blog:', editId);
      _showBanner('You are not authorized to edit this blog.', 'error');
      alert('You are not authorized to edit this blog.');
      window.location.href = 'dashboard.html';
      return;
    }

    const pageHeaderTitle = document.querySelector('.page-title');
    const heroTitle = document.querySelector('.create-hero-banner h2');
    const publishBtn = document.getElementById('btn-publish');

    if (pageHeaderTitle) pageHeaderTitle.textContent = 'Edit Blog Studio';
    if (heroTitle) heroTitle.textContent = 'Edit Your Blog Story ✍️';
    if (publishBtn) publishBtn.textContent = 'Update Blog →';

    if (existingPost) {
      if (titleInput) titleInput.value = existingPost.title || '';
      if (categorySelect) categorySelect.value = existingPost.category || 'General';
      if (contentEditor) {
        contentEditor.innerHTML = existingPost.content || '';
        syncContent();
      }
      if (Array.isArray(existingPost.tags) && existingPost.tags.length > 0) {
        tagsList = [...existingPost.tags];
        renderTags();
      }
      if (existingPost.theme) selectTheme(existingPost.theme);

      uploadedImageData = existingPost.imageUrl || existingPost.coverImage || existingPost.imageData || '';
      if (uploadedImageData && previewImg && previewBox) {
        previewImg.src = uploadedImageData;
        previewBox.style.display = 'flex';
        if (dropzoneArea) dropzoneArea.style.display = 'none';
      }
    }
  }

  // 6. Cover Image Handler (With Client-Side Canvas Compression)
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        uploadedImageData = canvas.toDataURL('image/jpeg', 0.85);
        if (previewImg) previewImg.src = uploadedImageData;
        if (previewBox) previewBox.style.display = 'flex';
        if (dropzoneArea) dropzoneArea.style.display = 'none';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
    });
  }

  if (dropzoneArea) {
    ['dragenter', 'dragover'].forEach(name => {
      dropzoneArea.addEventListener(name, (e) => {
        e.preventDefault();
        dropzoneArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzoneArea.addEventListener(name, (e) => {
        e.preventDefault();
        dropzoneArea.classList.remove('dragover');
      });
    });

    dropzoneArea.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (replaceCoverBtn) {
    replaceCoverBtn.addEventListener('click', () => {
      if (imageFileInput) imageFileInput.click();
    });
  }

  if (removeCoverBtn) {
    removeCoverBtn.addEventListener('click', () => {
      uploadedImageData = '';
      if (imageFileInput) imageFileInput.value = '';
      if (previewBox) previewBox.style.display = 'none';
      if (dropzoneArea) dropzoneArea.style.display = 'block';
    });
  }

  // 7. Live Preview Modal Overlay
  const previewModalOverlay = document.getElementById('previewModalOverlay');
  const previewBtn = document.getElementById('btn-preview');
  const closePreviewBtn = document.getElementById('close-preview-btn');
  const previewContent = document.getElementById('preview-body-content');

  function openPreviewModal() {
    renderPreviewContent();
    if (previewModalOverlay) previewModalOverlay.classList.add('active');
  }

  if (previewBtn && previewModalOverlay) previewBtn.addEventListener('click', openPreviewModal);
  if (closePreviewBtn && previewModalOverlay) {
    closePreviewBtn.addEventListener('click', () => previewModalOverlay.classList.remove('active'));
  }
  if (previewModalOverlay) {
    previewModalOverlay.addEventListener('click', (e) => {
      if (e.target === previewModalOverlay) previewModalOverlay.classList.remove('active');
    });
  }

  function renderPreviewContent() {
    if (!previewContent) return;
    const title = titleInput ? titleInput.value.trim() || 'Untitled Story' : 'Untitled Story';
    const category = categorySelect ? categorySelect.value || 'General' : 'General';
    const content = contentEditor ? contentEditor.innerHTML || 'No content written yet.' : 'No content written yet.';
    const coverUrl = uploadedImageData || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';

    previewContent.className = `preview-body-content ${selectedThemeId}`;
    previewContent.innerHTML = `
      <div style="margin-bottom:20px;">
        <span class="badge-tag tag-${category.toLowerCase()}">${category}</span>
        <h1 style="font-size:2.2rem; font-weight:800; margin:10px 0; line-height:1.2;">${title}</h1>
        <div style="opacity:0.75; font-size:0.84rem; padding-bottom:16px; border-bottom:1px solid rgba(150,150,150,0.2);">
          Written by <strong>John Doe</strong> · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div style="font-size:1.05rem; line-height:1.8;">
        ${content}
      </div>
    `;
  }

  // ============================================================
  // 8. Form Submission & Publish Handler
  // ============================================================
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('[Create Blog] Publish clicked');
      syncContent();

      const title    = titleInput     ? titleInput.value.trim()      : '';
      const category = categorySelect ? categorySelect.value         : '';
      const content  = contentEditor  ? contentEditor.innerHTML.trim(): '';
      const isDraftSubmit = e.submitter && e.submitter.getAttribute('name') === 'save-draft';
      const status   = isDraftSubmit ? 'draft' : 'published';

      if (!title) {
        return alert('❌ Blog title is required.');
      }
      if (!category) {
        return alert('❌ Please select a category.');
      }
      if (!content || content === '<br>' || content === '<br/>' || content.trim() === '') {
        return alert('❌ Blog content cannot be empty.');
      }

      const submitBtn   = e.submitter || document.getElementById('btn-publish');
      const origBtnText = submitBtn ? submitBtn.textContent : 'Publish Blog →';
      if (submitBtn) {
        submitBtn.disabled   = true;
        submitBtn.textContent = isDraftSubmit ? 'Saving Draft...' : 'Publishing...';
      }

      const oldBanner = document.getElementById('_publish-status-banner');
      if (oldBanner) oldBanner.remove();

      console.log('[DEBUG CREATE] Publish clicked');

      // Check JWT Token
      const token = localStorage.getItem('authToken');
      console.log('[DEBUG CREATE] Current authToken exists:', Boolean(token));
      console.log('[DEBUG CREATE] JWT:', token ? 'present' : 'not present');

      if (!token) {
        console.error('[Create Blog] ❌ Blog was not saved');
        _showBanner('❌ Not logged in — no authToken in localStorage. Please log in again.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origBtnText; }
        return;
      }

      // Build payload
      const postPayload = {
        title,
        category,
        content,
        coverImage: uploadedImageData || '',
        imageUrl:   uploadedImageData || '',
        imageData:  uploadedImageData || '',
        status,
        tags:     Array.isArray(tagsList) ? tagsList : [],
        template: 'blank',
        theme:    selectedThemeId || 'theme-01'
      };

      console.log('[DEBUG CREATE] Request payload:', postPayload);

      const API_URL = editId ? `http://localhost:5000/api/blogs/${editId}` : 'http://localhost:5000/api/blogs';
      const HTTP_METHOD = editId ? 'PUT' : 'POST';

      console.log('[DEBUG CREATE] POST /api/blogs');

      try {
        const response = await fetch(API_URL, {
          method:  HTTP_METHOD,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(postPayload)
        });

        console.log('[DEBUG CREATE] HTTP status:', response.status);

        let result;
        try {
          result = await response.json();
        } catch (jsonErr) {
          result = { success: false, message: 'Server returned invalid response.' };
        }

        console.log('[DEBUG CREATE] Backend response:', result);

        if (!response.ok || !result.success) {
          console.error('[Create Blog] ❌ Blog was not saved');
          const errMsg = result.message || `HTTP ${response.status} — Server error.`;
          _showBanner(`❌ ${errMsg}`, 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origBtnText; }
          return;
        }

        console.log('[Create Blog] Blog successfully saved to MongoDB');
        const successMsg = editId ? 'Blog updated successfully.' : 'Blog published successfully.';
        _showBanner(successMsg, 'success');

        // Refresh cached posts in store
        if (window.store && typeof window.store.fetchAllPosts === 'function') {
          await window.store.fetchAllPosts();
        }

        // Reset form
        blogForm.reset();
        if (contentEditor)      contentEditor.innerHTML   = '';
        if (contentInputHidden) contentInputHidden.value  = '';
        uploadedImageData = '';

        // Redirect ONLY after successful response
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);

      } catch (networkErr) {
        console.error('[Create Blog] ❌ Blog was not saved');
        console.error('[Create Blog] Network error:', networkErr.message);
        _showBanner(`❌ Cannot reach backend server. Error: ${networkErr.message}`, 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origBtnText; }
      }
    });
  }

  // Helper: show visible status banner on the page (not just console)
  function _showBanner(msg, type) {
    const existing = document.getElementById('_publish-status-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = '_publish-status-banner';
    banner.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${type === 'success' ? '#10B981' : '#EF4444'};
      color: #fff; padding: 14px 28px; border-radius: 12px;
      font-family: Poppins, sans-serif; font-size: 0.95rem; font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 99999;
      max-width: 90vw; text-align: center; white-space: pre-line; line-height: 1.5;
    `;
    banner.textContent = msg;
    document.body.appendChild(banner);

    if (type === 'success') {
      setTimeout(() => banner.remove(), 4000);
    }
    // Error banners stay until next submit or manual close
  }

});
