/**
 * ==========================================================================
 * BLOG DETAILS CONTROLLER (js/blog-details.js)
 * Fetches single blog by ID from GET /api/blogs/:id and renders blog details
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  const detailsContainer = document.getElementById('blog-details-container');
  if (!detailsContainer) return;

  const params = new URLSearchParams(window.location.search);
  const blogId = params.get('id');

  if (!blogId) {
    renderNotFound(detailsContainer, 'No blog ID was specified in the URL.');
    return;
  }

  try {
    let blog = null;

    // 1. Fetch single blog from Backend REST API: GET /api/blogs/:id
    try {
      console.log(`[BlogDetails] Fetching blog ID ${blogId} from GET /api/blogs/${blogId}...`);
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          blog = result.data;
          console.log('[BlogDetails] ✅ Blog loaded from backend API:', blog);
        }
      }
    } catch (fetchErr) {
      console.warn('[BlogDetails] Could not connect to backend API directly, trying store cache:', fetchErr.message);
    }

    // 2. Fallback to store cache if backend request was offline or uncached
    if (!blog && window.store) {
      if (typeof window.store.fetchAllPosts === 'function') {
        await window.store.fetchAllPosts();
      }
      const posts = window.store.getAllPosts() || [];
      blog = posts.find(p => p.id === blogId || p._id === blogId);
    }

    // 3. Handle Blog Not Found state
    if (!blog) {
      renderNotFound(detailsContainer);
      return;
    }

    // Extract Blog Properties
    const title        = blog.title       || 'Untitled Story';
    const category     = blog.category    || 'General';
    const content      = blog.content     || '<p>No content available for this story.</p>';
    const coverUrl     = blog.imageUrl    || blog.coverImage || blog.imageData || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';
    const authorName   = blog.author      ? (typeof blog.author === 'object' ? blog.author.name : blog.author) : 'Anonymous Writer';
    const createdAtDate= blog.createdAt   ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
    const viewsCount   = blog.views       || 1;
    const tags         = Array.isArray(blog.tags) ? blog.tags : [];
    const themeId      = blog.theme       || 'theme-01';

    // Apply Selected Theme to Wrapper
    detailsContainer.className = `blog-details-wrapper preview-body-content ${themeId}`;

    // Render Full Blog Details Page
    detailsContainer.innerHTML = `
      <!-- Navigation Header -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span class="badge-tag" style="background:#10B981; color:#FFFFFF; padding:4px 12px; border-radius:12px; font-weight:700; font-size:0.78rem;">
            ${category}
          </span>
          <a href="index.html" style="font-size:0.84rem; font-weight:700; color:var(--primary); text-decoration:none;">
            ← Back to Articles
          </a>
        </div>

        <h1 style="font-size: clamp(1.8rem, 3.2vw, 2.6rem); font-weight: 800; line-height: 1.25; margin-bottom: 16px; color: var(--text-main);">
          ${title}
        </h1>

        <!-- Author, Date & Views Meta Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="author-avatar-circle" style="width: 42px; height: 42px; font-size: 1.05rem; background:#10B981; color:#FFFFFF; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">
              ${authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <strong style="font-size: 0.95rem; display: block; color: var(--text-main);">${authorName}</strong>
              <small style="opacity: 0.75; font-size: 0.8rem; color: var(--text-sub);">Published on ${createdAtDate}</small>
            </div>
          </div>

          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; gap: 6px;">
            <span>👁️ ${viewsCount.toLocaleString()} Views</span>
          </div>
        </div>

        <!-- Story Content Body -->
        <div class="post-story-body" style="font-size: 1.08rem; line-height: 1.85; margin-bottom: 36px; color: var(--text-main);">
          ${content}
        </div>

      <!-- Tags List -->
      ${tags.length > 0 ? `
        <div style="padding-top: 20px; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-sub); margin-right: 4px;">Tags:</span>
          ${tags.map(tag => `<span class="tag-badge" style="background:var(--bg-subtle); border:1px solid var(--border); padding:4px 10px; border-radius:20px; font-size:0.78rem; font-weight:600;">#${tag}</span>`).join('')}
        </div>
      ` : ''}
    `;

  } catch (err) {
    console.error('[BlogDetails Error]:', err);
    renderNotFound(detailsContainer, err.message);
  }
});

function renderNotFound(container, subtitleMsg = '') {
  container.className = 'blog-details-wrapper';
  container.innerHTML = `
    <div style="text-align: center; padding: 70px 20px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
      <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Blog not found.</h2>
      <p style="color: var(--text-sub); font-size: 0.88rem; max-width: 420px; margin: 0 auto 24px;">
        ${subtitleMsg || 'The requested blog post could not be found or has been deleted.'}
      </p>
      <a href="index.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; font-size: 0.88rem; background: #10B981; color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 700;">
        ← Return to Home
      </a>
    </div>
  `;
}
