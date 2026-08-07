/**
 * ==========================================================================
 * MY BLOGS PAGE CONTROLLER (js/my-blogs.js)
 * Fetches user blogs from GET /api/blogs/myblogs & manages Edit, View, Delete
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

  // Load My Blogs
  await loadMyBlogs(token);

  // Mobile Hamburger Toggle
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

  // Theme Toggle
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  });

  // Logout Handler
  const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-action-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Auth !== 'undefined') Auth.logout();
      else { localStorage.clear(); window.location.replace('login.html'); }
    });
  });

});

/**
 * Fetches user blogs from GET /api/blogs/myblogs and renders cards sorted newest first
 */
async function loadMyBlogs(token) {
  const gridContainer = document.getElementById('my-blogs-grid');
  const emptyStateContainer = document.getElementById('empty-my-blogs');
  if (!gridContainer) return;

  gridContainer.style.display = 'block';
  gridContainer.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--text-sub); grid-column: 1 / -1;">
      <div style="font-size:1.8rem; margin-bottom:8px;">🔄</div>
      <p style="font-size:0.9rem; font-weight:600;">Loading your published blogs...</p>
    </div>
  `;

  try {
    console.log('[MyBlogs API] Calling GET /api/blogs/myblogs...');
    const response = await fetch('http://localhost:5000/api/blogs/myblogs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    console.log('[MyBlogs API] Response:', result);

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch your blogs');
    }

    const blogs = Array.isArray(result.data) ? result.data : [];

    // Sort newest first
    blogs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (blogs.length === 0) {
      gridContainer.style.display = 'none';
      if (emptyStateContainer) {
        emptyStateContainer.hidden = false;
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    if (emptyStateContainer) {
      emptyStateContainer.hidden = true;
      emptyStateContainer.style.display = 'none';
    }

    gridContainer.style.display = 'grid';
    renderMyBlogCards(gridContainer, blogs, token);

  } catch (err) {
    console.error('[MyBlogs API Error]:', err.message);
    gridContainer.style.display = 'block';
    gridContainer.innerHTML = `
      <div style="text-align:center; padding:50px 20px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; grid-column: 1 / -1;">
        <div style="font-size:2rem; margin-bottom:10px;">⚠️</div>
        <h3 style="font-size:1.1rem; font-weight:700;">Failed to Load Your Blogs</h3>
        <p style="color:var(--text-sub); font-size:0.88rem; margin-top:4px;">${err.message}</p>
      </div>
    `;
  }
}

/**
 * Renders list of blog cards into grid
 */
function renderMyBlogCards(container, blogs, token) {
  let activeDeleteId = null;

  container.innerHTML = blogs.map(blog => {
    const blogId = blog.id || blog._id || '';
    const title = blog.title || 'Untitled Story';
    const category = blog.category || 'General';
    const status = (blog.status || 'published').toLowerCase();
    const coverUrl = blog.imageUrl || blog.coverImage || blog.imageData || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800';
    const views = (blog.views || 0).toLocaleString();
    const dateFormatted = blog.createdAt
      ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent';

    return `
      <article class="my-blog-card" id="card-${blogId}">
        <div class="my-blog-cover" style="background-image: url('${coverUrl}');">
          <span class="my-blog-status-pill ${status === 'published' ? 'pill-published' : 'pill-draft'}">
            ${status.toUpperCase()}
          </span>
        </div>
        <div class="my-blog-body">
          <div>
            <div class="my-blog-category-tag">${category}</div>
            <h3 class="my-blog-title-text">
              <a href="blog-details.html?id=${blogId}" style="color:inherit; text-decoration:none;">${title}</a>
            </h3>
          </div>

          <div>
            <div class="my-blog-meta-bar">
              <span>📅 ${dateFormatted}</span>
              <span>👁️ ${views} Views</span>
            </div>

            <div class="my-blog-actions-bar">
              <a href="blog-details.html?id=${blogId}" class="btn-my-action" title="View Story">
                👁️ View
              </a>
              <a href="edit-blog.html?id=${blogId}" class="btn-my-action" title="Edit Story">
                ✏️ Edit
              </a>
              <button type="button" class="btn-my-action btn-my-delete delete-my-blog-btn" data-id="${blogId}" title="Delete Story">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Delete Action Attachments
  const deleteModal = document.getElementById('deleteModalOverlay');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  document.querySelectorAll('.delete-my-blog-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      activeDeleteId = this.getAttribute('data-id');
      if (deleteModal) deleteModal.classList.add('active');
    });
  });

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.onclick = () => {
      deleteModal.classList.remove('active');
      activeDeleteId = null;
    };
  }

  if (confirmDeleteBtn && deleteModal) {
    confirmDeleteBtn.onclick = async () => {
      if (activeDeleteId) {
        try {
          console.log(`[MyBlogs] Sending DELETE /api/blogs/${activeDeleteId}...`);
          const res = await fetch(`http://localhost:5000/api/blogs/${activeDeleteId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const resData = await res.json();
          deleteModal.classList.remove('active');

          if (!res.ok || !resData.success) {
            showMyBlogsToast(`❌ ${resData.message || 'Failed to delete blog'}`, 'error');
          } else {
            showMyBlogsToast('✅ Blog deleted successfully.', 'success');
            // Remove card element from DOM & reload list
            const cardEl = document.getElementById(`card-${activeDeleteId}`);
            if (cardEl) cardEl.remove();
            await loadMyBlogs(token);
          }
        } catch (err) {
          console.error('[MyBlogs Delete Error]:', err.message);
          showMyBlogsToast(`❌ ${err.message}`, 'error');
        } finally {
          activeDeleteId = null;
        }
      }
    };
  }
}

function showMyBlogsToast(msg, type = 'success') {
  const existing = document.getElementById('_myblogs-toast-banner');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_myblogs-toast-banner';
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
