/* ==========================================================================
   BLOGIFY INTERACTIVE UI CONTROLLER - COMPLETE SPECIFICATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.store) return;

  // Theme Initializer
  const currentTheme = typeof window.store.getTheme === 'function' ? window.store.getTheme() : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  const updateThemeUI = (theme) => {
    themeToggles.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    });
  };
  updateThemeUI(currentTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = typeof window.store.toggleTheme === 'function' ? window.store.toggleTheme() : 'light';
      updateThemeUI(nextTheme);
      showToast(`Switched to ${nextTheme} mode`);
    });
  });

  // Mobile Menu Toggle
  const mobileToggles = document.querySelectorAll('.mobile-menu-toggle');
  const sidebar = document.querySelector('#sidebar');
  mobileToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      if (sidebar) sidebar.classList.toggle('open');
    });
  });

  // Toast Function
  window.showToast = (message) => {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('toast-show');
    setTimeout(() => {
      toast.classList.remove('toast-show');
    }, 2800);
  };

  // Sync Current Logged-in User Header UI
  const currentUser = typeof window.store.getCurrentUser === 'function' ? window.store.getCurrentUser() : null;
  if (currentUser) {
    document.querySelectorAll('.author-avatar-circle').forEach(el => {
      el.textContent = currentUser.avatar || 'JD';
    });
    document.querySelectorAll('.user-profile-widget strong').forEach(el => {
      el.textContent = `${currentUser.name} ▾`;
    });
  }

  // Logout Handlers
  document.querySelectorAll('a[href="login.html"]').forEach(btn => {
    if (btn.textContent.includes('Logout')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.store.logoutUser === 'function') window.store.logoutUser();
        showToast('Logged out');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 500);
      });
    }
  });

  // Bookmarks Badge Sync
  const updateBookmarkBadges = () => {
    const bookmarks = typeof window.store.getBookmarks === 'function' ? window.store.getBookmarks() : [];
    const badges = document.querySelectorAll('.badge-count');
    badges.forEach(b => {
      b.textContent = bookmarks.length;
      b.style.display = bookmarks.length > 0 ? 'grid' : 'none';
    });
  };
  updateBookmarkBadges();

  // Bookmarks Drawer
  const bookmarkTrigger = document.querySelector('#open-bookmarks-btn');
  if (bookmarkTrigger) {
    let overlay = document.querySelector('.drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'drawer-overlay';
      overlay.innerHTML = `
        <div class="drawer-content">
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:16px; border-bottom:1px solid var(--line); margin-bottom:20px;">
            <h3 style="font-size:1.1rem; font-weight:700;">Saved Reading List</h3>
            <button class="icon-btn close-drawer-btn">&times;</button>
          </div>
          <div id="drawer-bookmarks-list"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('.close-drawer-btn').addEventListener('click', () => {
        overlay.classList.remove('open');
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    }

    bookmarkTrigger.addEventListener('click', () => {
      renderBookmarkDrawer();
      overlay.classList.add('open');
    });

    const renderBookmarkDrawer = () => {
      const listContainer = document.querySelector('#drawer-bookmarks-list');
      const bIds = typeof window.store.getBookmarks === 'function' ? window.store.getBookmarks() : [];
      const allPosts = window.store.getAllPosts();
      const bookmarkedPosts = allPosts.filter(p => bIds.includes(p.id));

      if (bookmarkedPosts.length === 0) {
        listContainer.innerHTML = `<p style="color:var(--muted); font-size:0.88rem; text-align:center; padding:30px 0;">No saved blogs yet.</p>`;
        return;
      }

      listContainer.innerHTML = bookmarkedPosts.map(post => `
        <div style="display:flex; gap:12px; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--line);">
          <div>
            <span class="badge-tag" style="font-size:0.65rem;">${post.category}</span>
            <h4 style="font-size:0.88rem; font-weight:700; margin-top:4px;"><a href="post.html?id=${post.id}">${post.title}</a></h4>
            <small style="color:var(--muted); font-size:0.75rem;">${post.date} · ${post.readTime}</small>
          </div>
          <button class="icon-btn remove-bookmark-btn" data-id="${post.id}" title="Remove" style="width:30px; height:30px; font-size:0.8rem;">✕</button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = btn.dataset.id;
          if (typeof window.store.toggleBookmark === 'function') window.store.toggleBookmark(pId);
          updateBookmarkBadges();
          renderBookmarkDrawer();
          if (typeof renderHomePosts === 'function') renderHomePosts();
          showToast('Removed from reading list');
        });
      });
    };
  }

  // ==========================================================================
  // SIGNUP FORM LOGIC (register.html)
  // ==========================================================================
  const signupForm = document.querySelector('#signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = signupForm.elements.name.value.trim();
      const email = signupForm.elements.email.value.trim();
      const password = signupForm.elements.password.value;
      const confirm = signupForm.elements.confirm.value;

      if (!name || !email || !password) {
        alert('Please fill out all required fields.');
        return;
      }

      if (password !== confirm) {
        alert('Passwords do not match.');
        return;
      }

      const res = window.store.registerUser(name, email, password);
      if (!res.success) {
        alert(res.message);
        return;
      }

      showToast('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    });
  }

  // ==========================================================================
  // LOGIN FORM LOGIC (login.html)
  // ==========================================================================
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.elements.email.value.trim();
      const password = loginForm.elements.password.value;

      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }

      const res = window.store.loginUser(email, password);
      if (!res.success) {
        alert(res.message);
        return;
      }

      showToast('Logged in successfully! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }

  // ==========================================================================
  // ==========================================================================
  // PAGE 1: HOME PAGE LOGIC (index.html)
  // ==========================================================================
  const blogGrid = document.querySelector('#blog-grid');
  if (blogGrid) {
    let activeCategory = 'All';
    let searchQuery = '';
    let fetchError = null;
    let masterBlogsList = []; // Master list of all published blogs from MongoDB

    function highlightSearchText(text, query) {
      if (!text || !query.trim()) return text || '';
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeQuery})`, 'gi');
      return text.replace(regex, '<mark style="background:#FDE047; color:#1E293B; border-radius:3px; padding:0 3px;">$1</mark>');
    }

    const renderHomePosts = () => {
      const noticeBanner = document.querySelector('#category-fallback-notice');
      const emptyState = document.querySelector('#empty-search');
      const searchStatus = document.querySelector('#search-status');

      // Use master list if available, fallback to store
      const allBlogs = masterBlogsList.length > 0 ? masterBlogsList : ((window.store && typeof window.store.getAllPosts === 'function') ? window.store.getAllPosts() : []);

      // Calculate live counts for all categories from MongoDB payload
      const liveCounts = { All: allBlogs.length };
      allBlogs.forEach(b => {
        const cat = b.category || 'General';
        liveCounts[cat] = (liveCounts[cat] || 0) + 1;
      });
      updateCategoryChipCounts(liveCounts);

      // Determine posts to render based on Category & Fallback Logic
      let postsToRender = [];
      let isFallback = false;

      if (activeCategory === 'All') {
        postsToRender = [...allBlogs];
        if (noticeBanner) noticeBanner.style.display = 'none';
      } else {
        const categoryMatches = allBlogs.filter(p => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
        if (categoryMatches.length > 0) {
          postsToRender = categoryMatches;
          if (noticeBanner) noticeBanner.style.display = 'none';
        } else {
          // Intelligent Fallback: 0 blogs in this category -> Show ALL blogs & display notice banner!
          postsToRender = [...allBlogs];
          isFallback = true;
          if (noticeBanner) {
            noticeBanner.style.display = 'flex';
            noticeBanner.innerHTML = `<span>ℹ️</span> No blogs found in <strong>"${activeCategory}"</strong> category. Showing all blogs instead.`;
          }
        }
      }

      // Apply Search Filter if typed
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        postsToRender = postsToRender.filter(p => {
          const titleMatch    = p.title && p.title.toLowerCase().includes(query);
          const categoryMatch = p.category && p.category.toLowerCase().includes(query);
          const descMatch     = p.shortDescription && p.shortDescription.toLowerCase().includes(query);
          const contentMatch  = p.content && p.content.toLowerCase().includes(query);
          const tagsMatch     = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(query));
          const authorName    = p.author ? (typeof p.author === 'object' ? p.author.name : p.author) : '';
          const authorMatch   = authorName && authorName.toLowerCase().includes(query);

          return titleMatch || categoryMatch || descMatch || contentMatch || tagsMatch || authorMatch;
        });
      }

      // Update Search / Category Status Text
      if (searchStatus) {
        if (searchQuery) {
          searchStatus.textContent = `Search results for "${searchQuery}" (${postsToRender.length} found)`;
        } else if (isFallback) {
          searchStatus.textContent = `Showing all ${postsToRender.length} published blogs (Category "${activeCategory}" is empty)`;
        } else if (activeCategory !== 'All') {
          searchStatus.textContent = `Showing ${postsToRender.length} blog${postsToRender.length === 1 ? '' : 's'} in "${activeCategory}"`;
        } else {
          searchStatus.textContent = `Showing all ${postsToRender.length} published blogs`;
        }
      }

      if (fetchError) {
        blogGrid.style.display = 'block';
        if (emptyState) emptyState.hidden = true;
        blogGrid.innerHTML = `
          <div style="text-align:center; padding:50px 20px; background:var(--paper); border:1px solid var(--line); border-radius:12px;">
            <div style="font-size:2rem; margin-bottom:10px;">⚠️</div>
            <h3 style="font-size:1.1rem; font-weight:700; color:var(--ink);">Failed to Load Blogs</h3>
            <p style="color:var(--muted); font-size:0.88rem; margin-top:4px;">${fetchError}</p>
          </div>
        `;
        return;
      }

      // Global Empty State (If MongoDB has 0 blogs overall or search returns 0)
      if (postsToRender.length === 0) {
        blogGrid.style.display = 'none';
        if (emptyState) {
          emptyState.hidden = false;
          if (searchQuery.trim()) {
            emptyState.innerHTML = `
              <div style="font-size:2.5rem; color:var(--primary); margin-bottom:10px;">🔍</div>
              <h3 style="font-size:1.2rem; font-weight:700; color:var(--ink);">No blogs match your search.</h3>
              <p style="color:var(--muted); font-size:0.88rem; margin-top:4px;">Try searching for a different title, category, tag, or author name.</p>
            `;
          } else {
            emptyState.innerHTML = `
              <div style="font-size:2.5rem; color:var(--primary); margin-bottom:10px;">📝</div>
              <h3 style="font-size:1.1rem; font-weight:700;">No blogs have been published yet.</h3>
              <p style="color:var(--muted); font-size:0.88rem; margin-top:4px;">Check back later or log in to create and publish your first story!</p>
            `;
          }
        }
        return;
      }

      blogGrid.style.display = 'grid';
      if (emptyState) emptyState.hidden = true;

      // Render Blog Cards Grid
      blogGrid.innerHTML = postsToRender.map(post => {
        const bgUrl = post.imageUrl || post.coverImage || post.imageData || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800';
        const bgStyle = `background-image: url('${bgUrl}')`;
        const rawAuthor = post.author ? (typeof post.author === 'object' ? post.author.name : post.author) : 'Anonymous';
        const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (post.date || 'Recent');
        const rawShortDesc = post.shortDescription || (post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 130) + '...' : 'No description available.');
        const blogId = post.id || post._id || '';

        const displayTitle     = searchQuery ? highlightSearchText(post.title || 'Untitled Story', searchQuery) : (post.title || 'Untitled Story');
        const displayCategory  = searchQuery ? highlightSearchText(post.category || 'General', searchQuery) : (post.category || 'General');
        const displayAuthor    = searchQuery ? highlightSearchText(rawAuthor, searchQuery) : rawAuthor;
        const displayShortDesc = searchQuery ? highlightSearchText(rawShortDesc, searchQuery) : rawShortDesc;

        return `
          <article class="post-card">
            <div class="post-thumb image-focus" style="${bgStyle}">
              <span class="badge-tag">${displayCategory}</span>
            </div>
            <div class="post-content">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="pill-status status-${post.status || 'published'}" style="font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:12px; background:#DCFCE7; color:#059669;">
                  ${(post.status || 'published').toUpperCase()}
                </span>
                <small style="color:var(--muted); font-size:0.75rem;">👁️ ${(post.views || 0).toLocaleString()} views</small>
              </div>
              <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:6px; line-height:1.3;">
                <a href="blog-details.html?id=${blogId}">${displayTitle}</a>
              </h3>
              <p style="font-size:0.88rem; color:var(--muted); margin-bottom:14px; line-height:1.5;">${displayShortDesc}</p>
              <div class="post-footer" style="padding-top:10px; border-top:1px solid var(--line);">
                <div class="post-author" style="display:flex; align-items:center; gap:8px;">
                  <div class="author-avatar-circle" style="width:30px; height:30px; font-size:0.75rem;">${rawAuthor.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}</div>
                  <div>
                    <span style="font-weight:600; font-size:0.82rem;">${displayAuthor}</span><br>
                    <small style="color:var(--muted); font-weight:normal; font-size:0.74rem;">${dateStr}</small>
                  </div>
                </div>
                <a href="blog-details.html?id=${blogId}" class="btn-green" style="padding:4px 12px; font-size:0.78rem;">Read Story →</a>
              </div>
            </div>
          </article>
        `;
      }).join('');
    };

    // Helper function to update category chip counts
    function updateCategoryChipCounts(counts = {}) {
      const chipBtns = document.querySelectorAll('.cat-chip');
      chipBtns.forEach(btn => {
        const cat = btn.dataset.category || 'All';
        const countSpan = btn.querySelector('.chip-count');
        if (countSpan) {
          const num = counts[cat] !== undefined ? counts[cat] : (cat === 'All' ? (counts['All'] || 0) : 0);
          countSpan.textContent = `(${num})`;
        }
      });
    }

    // Backend Category Chips Click Handler
    const catChips = document.querySelectorAll('.cat-chip, .category-card');
    catChips.forEach(chip => {
      chip.addEventListener('click', async () => {
        activeCategory = chip.dataset.category || 'All';

        // Visually highlight selected category chip
        document.querySelectorAll('.cat-chip').forEach(c => {
          if (c.dataset.category === activeCategory) c.classList.add('active');
          else c.classList.remove('active');
        });

        // Scroll to latest posts section if category card clicked
        const section = document.querySelector('#latest-posts');
        if (section) section.scrollIntoView({ behavior: 'smooth' });

        renderHomePosts();
      });
    });

    // Instant Backend Search Listener
    const searchInputs = document.querySelectorAll('#blog-search, #globalSearch');
    searchInputs.forEach(input => {
      let debounceTimer = null;
      input.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          if (searchQuery.trim()) {
            try {
              console.log(`[BlogSearch API] Querying GET /api/blogs?search=${encodeURIComponent(searchQuery)}...`);
              const res = await fetch(`http://localhost:5000/api/blogs?search=${encodeURIComponent(searchQuery)}`);
              if (res.ok) {
                const data = await res.json();
                if (data.success && window.store && typeof window.store.setPosts === 'function') {
                  window.store.setPosts(data.data);
                  if (data.categoryCounts) updateCategoryChipCounts(data.categoryCounts);
                }
              }
            } catch (err) {
              console.warn('[BlogSearch API Error]:', err.message);
            }
          }
          renderHomePosts();
        }, 150);
      });
    });

    // Automatically fetch published blogs from GET /api/blogs on page load
    (async () => {
      if (blogGrid) {
        blogGrid.style.display = 'block';
        blogGrid.innerHTML = `
          <div style="text-align:center; padding:60px 20px; color:var(--muted);">
            <div style="font-size:1.8rem; margin-bottom:8px;">🔄</div>
            <p style="font-size:0.9rem; font-weight:600;">Loading published blogs from server...</p>
          </div>
        `;
      }

      try {
        const res = await fetch('http://localhost:5000/api/blogs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            masterBlogsList = data.data; // Cache master list from MongoDB
            if (window.store && typeof window.store.setPosts === 'function') {
              window.store.setPosts(data.data);
            }
            if (data.categoryCounts) updateCategoryChipCounts(data.categoryCounts);
          }
        }
      } catch (err) {
        console.error('[Homepage API Error]:', err.message);
        fetchError = 'Could not connect to backend server at http://localhost:5000.';
      }

      renderHomePosts();
    })();
  }

  // ==========================================================================
  // PAGE 2: ARTICLE READER (post.html)
  // ==========================================================================
  const articleContainer = document.querySelector('#article-main-container');
  if (articleContainer) {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id') || 'post-1';

    if (typeof window.store.incrementViews === 'function') window.store.incrementViews(postId);
    const post = typeof window.store.getPostById === 'function' ? window.store.getPostById(postId) : null;

    if (!post) {
      articleContainer.innerHTML = `
        <div style="text-align:center; padding:80px 0;">
          <h2>Article Not Found</h2>
          <a href="index.html" class="btn-green" style="margin-top:20px; display:inline-flex;">Back to Home</a>
        </div>
      `;
    } else {
      document.title = `${post.title} | Blogify`;
      const isBookmarked = typeof window.store.isBookmarked === 'function' ? window.store.isBookmarked(post.id) : false;
      const isLiked = typeof window.store.isLiked === 'function' ? window.store.isLiked(post.id) : false;
      const bgStyle = post.imageData ? `background-image: url(${post.imageData})` : '';

      articleContainer.innerHTML = `
        <div style="max-width:780px; margin:0 auto;">
          <a href="index.html" style="color:var(--muted); font-weight:500; font-size:0.85rem;">← Back to blogs</a>
          <div style="margin:16px 0 24px;">
            <span class="badge-tag">${post.category}</span>
            <h1 style="font-size:2.4rem; font-weight:800; margin:10px 0; line-height:1.2;">${post.title}</h1>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:16px; border-bottom:1px solid var(--line); color:var(--muted); font-size:0.85rem;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="author-avatar-circle" style="width:32px; height:32px; font-size:0.75rem;">${(post.author || 'JD').split(' ').map(n=>n[0]).join('')}</div>
                <strong>${post.author}</strong>
              </div>
              <span>${post.date} · ⏱ ${post.readTime} (${(post.views || 1).toLocaleString()} views)</span>
            </div>
          </div>

          <div class="post-thumb ${post.imageClass || 'image-focus'}" style="height:340px; border-radius:14px; margin-bottom:30px; ${bgStyle}"></div>

          <div style="font-size:1.05rem; line-height:1.8; color:var(--ink);">
            ${post.content}
          </div>

          <div style="display:flex; gap:12px; margin:36px 0; padding:20px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
            <button class="btn-green" id="article-like-btn" style="background:var(--paper); border:1px solid var(--line); color:var(--ink) !important; box-shadow:none;">
              <span>${isLiked ? '❤️' : '🤍'}</span> <span id="like-count">${post.likes || 0}</span> Likes
            </button>
            <button class="btn-green" id="article-bookmark-btn" style="background:var(--paper); border:1px solid var(--line); color:var(--ink) !important; box-shadow:none;">
              <span>${isBookmarked ? '🔖' : '📑'}</span> Save Article
            </button>
          </div>

          <div style="margin-top:40px;">
            <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:16px;">Comments (<span id="comments-count">0</span>)</h3>
            <form style="background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:20px; margin-bottom:24px;" id="comment-form">
              <textarea id="comment-input" placeholder="Write a comment..." style="width:100%; min-height:90px; border:1px solid var(--line); border-radius:8px; padding:12px; background:var(--canvas); outline:none; margin-bottom:12px;" required></textarea>
              <button class="btn-green" type="submit">Post Comment</button>
            </form>
            <div id="comments-list" style="display:grid; gap:14px;"></div>
          </div>
        </div>
      `;

      const likeBtn = document.querySelector('#article-like-btn');
      likeBtn.addEventListener('click', () => {
        const res = typeof window.store.toggleLike === 'function' ? window.store.toggleLike(postId) : { liked: false, count: 0 };
        likeBtn.querySelector('span').textContent = res.liked ? '❤️' : '🤍';
        document.querySelector('#like-count').textContent = res.count;
        showToast(res.liked ? 'Liked article' : 'Unliked');
      });

      const bookmarkBtn = document.querySelector('#article-bookmark-btn');
      bookmarkBtn.addEventListener('click', () => {
        const bookmarked = typeof window.store.toggleBookmark === 'function' ? window.store.toggleBookmark(postId) : false;
        bookmarkBtn.querySelector('span').textContent = bookmarked ? '🔖' : '📑';
        updateBookmarkBadges();
        showToast(bookmarked ? 'Saved article' : 'Removed');
      });

      const renderComments = () => {
        const comments = typeof window.store.getComments === 'function' ? window.store.getComments(postId) : [];
        document.querySelector('#comments-count').textContent = comments.length;
        const list = document.querySelector('#comments-list');
        if (comments.length === 0) {
          list.innerHTML = `<p style="color:var(--muted); font-size:0.85rem;">No comments yet. Be the first to share your thoughts!</p>`;
          return;
        }
        list.innerHTML = comments.map(c => `
          <div style="background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.8rem;">
              <strong>${c.author}</strong>
              <span style="color:var(--muted);">${c.date}</span>
            </div>
            <p style="font-size:0.88rem; color:var(--ink);">${c.content}</p>
          </div>
        `).join('');
      };
      renderComments();

      document.querySelector('#comment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.querySelector('#comment-input');
        if (input.value.trim()) {
          if (typeof window.store.addComment === 'function') window.store.addComment(postId, input.value.trim());
          input.value = '';
          renderComments();
          showToast('Comment posted!');
        }
      });
    }
  }

  // ==========================================================================
  // PAGE 3: DASHBOARD OVERVIEW (dashboard.html)
  // ==========================================================================
  const dashboardTableBody = document.querySelector('#dashboard-table-body');
  if (dashboardTableBody) {
    const renderDashboard = () => {
      const allPosts = window.store.getAllPosts();
      const published = allPosts.filter(p => p.status === 'published');
      const drafts = allPosts.filter(p => p.status === 'draft');
      const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);

      document.querySelector('#stat-total').textContent = allPosts.length;
      document.querySelector('#stat-views').textContent = (totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews);

      if (allPosts.length === 0) {
        dashboardTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No blogs found.</td></tr>`;
        return;
      }

      dashboardTableBody.innerHTML = allPosts.map(post => {
        const catClass = getCatPillClass(post.category);
        return `
          <tr>
            <td><strong><a href="post.html?id=${post.id}">${post.title}</a></strong></td>
            <td><span class="pill-cat ${catClass}">${post.category}</span></td>
            <td>${(post.views || 0).toLocaleString()}</td>
            <td><span class="pill-status status-${post.status}">${post.status === 'published' ? 'Published' : 'Draft'}</span></td>
            <td>${post.date}</td>
            <td>
              <a href="create-blog.html?id=${post.id}" class="icon-action-btn edit-action" title="Edit">✏️</a>
              <button class="icon-action-btn delete-action delete-btn" data-id="${post.id}" title="Delete">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');

      dashboardTableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this blog post?')) {
            window.store.deletePost(btn.dataset.id);
            renderDashboard();
            showToast('Blog deleted');
          }
        });
      });
    };

    // dashboard section in script.js — only runs on old dashboard.html with #dashboard-table-body
    // New dashboard.html uses dashboard.js directly — this block is harmless if element not found
    renderDashboard();
  }

  // ==========================================================================
  // PAGE 4: PROFILE FORM (profile.html)
  // ==========================================================================
  const profileForm = document.querySelector('#profile-form');
  if (profileForm) {
    const user = window.store.getCurrentUser();
    if (user) {
      profileForm.elements.name.value = user.name || 'John Doe';
      profileForm.elements.email.value = user.email || 'john.doe@example.com';
      if (user.role) profileForm.elements.role.value = user.role;
      if (user.bio) profileForm.elements.bio.value = user.bio;
    }

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedUser = {
        name: profileForm.elements.name.value.trim(),
        email: profileForm.elements.email.value.trim(),
        role: profileForm.elements.role.value.trim(),
        bio: profileForm.elements.bio.value.trim(),
        avatar: profileForm.elements.name.value.trim().split(' ').map(n=>n[0]).join('').toUpperCase(),
        isLoggedIn: true
      };
      localStorage.setItem('blog_user', JSON.stringify(updatedUser));
      document.querySelector('#profile-display-name').textContent = updatedUser.name;
      document.querySelector('#profile-display-role').textContent = updatedUser.role;
      document.querySelector('#profile-display-bio').textContent = updatedUser.bio;
      showToast('Profile updated successfully!');
    });
  }

  // ==========================================================================
  // PAGE 5: SETTINGS FORM (settings.html)
  // ==========================================================================
  const prefForm = document.querySelector('#preferences-form');
  if (prefForm) {
    prefForm.elements.theme.value = window.store.getTheme();
    prefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedTheme = prefForm.elements.theme.value;
      window.store.setTheme(selectedTheme);
      updateThemeUI(selectedTheme);
      showToast('Preferences saved!');
    });
  }

  const secForm = document.querySelector('#security-form');
  if (secForm) {
    secForm.addEventListener('submit', (e) => {
      e.preventDefault();
      secForm.reset();
      showToast('Password updated successfully!');
    });
  }

  const notifForm = document.querySelector('#notifications-form');
  if (notifForm) {
    notifForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Notification settings saved!');
    });
  }

  // ==========================================================================
  // PAGE 6: CREATE / EDIT BLOG (create-blog.html)
  // ==========================================================================
  const createForm = document.querySelector('#create-blog-form');
  if (createForm) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    let uploadedImageData = null;

    const titleInput = createForm.elements.title;
    const categorySelect = createForm.elements.category;
    const contentInput = createForm.elements.content;
    const imageInput = createForm.elements.image;
    const charCounter = document.querySelector('#char-count');
    const pageHeader = document.querySelector('#editor-page-header');
    const previewBox = document.querySelector('#image-preview-box');

    if (contentInput) {
      contentInput.addEventListener('input', () => {
        charCounter.textContent = `${contentInput.value.length.toLocaleString()} chars`;
      });
    }

    if (imageInput && previewBox) {
      imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            uploadedImageData = event.target.result;
            previewBox.style.backgroundImage = `url(${uploadedImageData})`;
            previewBox.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (editId) {
      const existing = window.store.getPostById(editId);
      if (existing) {
        if (pageHeader) pageHeader.textContent = 'Edit Blog';
        titleInput.value = existing.title;
        categorySelect.value = existing.category;
        contentInput.value = existing.content.replace(/<[^>]*>?/gm, '');
        uploadedImageData = existing.imageData;
        if (uploadedImageData && previewBox) {
          previewBox.style.backgroundImage = `url(${uploadedImageData})`;
          previewBox.style.display = 'block';
        }
      }
    }

    // Legacy create-blog form handler — this page now uses create-blog.js instead
    // This block is intentionally left as a no-op guard so it doesn't submit via old savePost()
    createForm.addEventListener('submit', (e) => {
      // create-blog.js handles this — do nothing here
      // This prevents double-submission via script.js
    });
  }
});

function getCatPillClass(category) {
  switch ((category || '').toLowerCase()) {
    case 'travel': return 'cat-travel';
    case 'lifestyle': return 'cat-lifestyle';
    case 'technology': return 'cat-tech';
    case 'food': return 'cat-food';
    default: return 'cat-travel';
  }
}
