/**
 * ==========================================================================
 * BLOGIFY DASHBOARD CONTROLLER (js/dashboard.js)
 * Fetches & Renders Real-Time MongoDB Analytics, Charts & Recent Blogs
 * ==========================================================================
 */

// 1. Synchronous Route Protection Guard
if (typeof Auth !== 'undefined') {
  Auth.checkAuth();
}

document.addEventListener('DOMContentLoaded', async () => {

  // ── STEP A: Authentication Guard ─────────────────────────────
  if (typeof Auth !== 'undefined' && !Auth.isAuthenticated()) {
    console.warn('[Dashboard] Unauthenticated user. Redirecting to login...');
    Auth.logout();
    return;
  }
  console.log('[Dashboard] ✅ User is authenticated.');

  // ── STEP B: User Profile Header UI ───────────────────────────
  const user      = typeof Auth !== 'undefined' ? Auth.getUserData()    : null;
  const userEmail = typeof Auth !== 'undefined' ? Auth.getLoggedInUser() : null;

  const displayName       = user ? user.name : (userEmail ? userEmail.split('@')[0] : 'Author');
  const userDisplayNameEl = document.getElementById('userDisplayName');
  const userAvatarEl      = document.getElementById('userAvatar');
  const welcomeGreetingEl = document.getElementById('welcomeGreeting');

  if (userDisplayNameEl) userDisplayNameEl.textContent = `${displayName} ▾`;
  if (userAvatarEl)      userAvatarEl.textContent      = displayName.slice(0, 2).toUpperCase();
  if (welcomeGreetingEl) welcomeGreetingEl.textContent = `Welcome back, ${displayName} 👋`;

  // ── STEP C: Time Greeting & Current Date ─────────────────────
  const greetingEl = document.getElementById('timeGreeting');
  const dateEl     = document.getElementById('currentDateDisplay');

  if (greetingEl) {
    const hour = new Date().getHours();
    if (hour < 12)      greetingEl.textContent = 'Good Morning,';
    else if (hour < 18) greetingEl.textContent = 'Good Afternoon,';
    else                greetingEl.textContent = 'Good Evening,';
  }

  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  // ── STEP D: Mobile Sidebar Overlay ───────────────────────────
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

  // ── STEP E: Fetch Analytics & Posts via Promise.all ───────────
  console.log('[Dashboard] Fetching real-time MongoDB analytics & blog records...');

  let analyticsData = null;
  let posts = [];

  try {
    const [analyticsRes, postsRes] = await Promise.all([
      window.store && typeof window.store.fetchAnalytics === 'function'
        ? window.store.fetchAnalytics()
        : fetch('http://localhost:5000/api/dashboard/analytics', {
            headers: localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}
          }).then(res => res.json()).catch(() => null),

      window.store && typeof window.store.fetchAllPosts === 'function'
        ? window.store.fetchAllPosts()
        : fetch('http://localhost:5000/api/blogs').then(res => res.json()).then(json => json.data || []).catch(() => [])
    ]);

    analyticsData = analyticsRes;
    posts = Array.isArray(postsRes) ? postsRes : (window.store ? window.store.getAllPosts() : []);

    console.log('[Dashboard] ✅ Analytics response:', analyticsData);
    console.log(`[Dashboard] ✅ Received ${posts.length} posts from MongoDB.`);

  } catch (err) {
    console.error('[Dashboard] ❌ Error fetching dashboard data:', err.message);
  }

  // ── STEP F: Update Statistic Cards with Real Database Values ─
  updateStatCards(analyticsData, posts);

  // ── STEP G: Initialize Chart.js with Real Database Data ──────
  initRealAnalyticsChart(analyticsData, posts);

  // ── STEP H: Render Recent Blogs Table ─────────────────────────
  renderRecentBlogsTable(posts);

  // ── STEP I: Search Filter Listener ───────────────────────────
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query    = e.target.value.toLowerCase().trim();
      const filtered = posts.filter(b =>
        (b.title    || '').toLowerCase().includes(query) ||
        (b.category || '').toLowerCase().includes(query)
      );
      renderRecentBlogsTable(filtered);
    });
  }

  // ── STEP J: Logout Button Listener ────────────────────────────
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Auth !== 'undefined') Auth.logout();
      else { localStorage.clear(); window.location.replace('login.html'); }
    });
  }

  console.log('[Dashboard] ✅ Real-time dashboard analytics initialized.');
});

/**
 * ==========================================================================
 * STATISTIC CARDS UPDATER
 * Populates 4 Stat Cards dynamically from MongoDB analytics payload
 * ==========================================================================
 */
function updateStatCards(analytics, posts) {
  const totalBlogs     = analytics ? analytics.totalBlogs     : posts.length;
  const publishedBlogs = analytics ? analytics.publishedBlogs : posts.filter(p => p.status === 'published').length;
  const draftBlogs     = analytics ? analytics.draftBlogs     : posts.filter(p => p.status === 'draft').length;
  const totalViews     = analytics ? analytics.totalViews     : posts.reduce((sum, p) => sum + (p.views || 0), 0);

  const blogsThisMonth = analytics ? analytics.blogsThisMonth : 0;
  const totalCategories = analytics ? analytics.totalCategories : 0;
  const totalTags       = analytics ? analytics.totalTags       : 0;

  const totalEl = document.querySelector('.stat-card:nth-child(1) .stat-count');
  const pubEl   = document.querySelector('.stat-card:nth-child(2) .stat-count');
  const draftEl = document.querySelector('.stat-card:nth-child(3) .stat-count');
  const viewsEl = document.querySelector('.stat-card:nth-child(4) .stat-count');

  const totalSub = document.querySelector('.stat-card:nth-child(1) .stat-sub');
  const pubSub   = document.querySelector('.stat-card:nth-child(2) .stat-sub');
  const draftSub = document.querySelector('.stat-card:nth-child(3) .stat-sub');
  const viewsSub = document.querySelector('.stat-card:nth-child(4) .stat-sub');

  if (totalEl) totalEl.setAttribute('data-target', totalBlogs);
  if (pubEl)   pubEl.setAttribute('data-target', publishedBlogs);
  if (draftEl) draftEl.setAttribute('data-target', draftBlogs);
  if (viewsEl) viewsEl.setAttribute('data-target', totalViews);

  if (totalBlogs === 0) {
    if (totalSub) totalSub.textContent = 'No analytics available yet.';
    if (pubSub)   pubSub.textContent   = 'No analytics available yet.';
    if (draftSub) draftSub.textContent = 'No analytics available yet.';
    if (viewsSub) viewsSub.textContent = 'No analytics available yet.';
  } else {
    if (totalSub) totalSub.textContent = `↑ ${blogsThisMonth} created this month`;
    if (pubSub)   pubSub.textContent   = `↑ ${publishedBlogs} live published stories`;
    if (draftSub) draftSub.textContent = `${draftBlogs} draft in review`;
    if (viewsSub) viewsSub.textContent = `Across ${totalCategories} categories & ${totalTags} tags`;
  }

  // Trigger Number Counter Animation
  animateCounters();
}

/**
 * ==========================================================================
 * NUMBER COUNTER ANIMATION
 * ==========================================================================
 */
function animateCounters() {
  document.querySelectorAll('.counter-anim').forEach(counter => {
    const target    = +(counter.getAttribute('data-target') || 0);
    const stepTime  = 20;
    const steps     = 800 / stepTime;
    const increment = target / steps;
    let   current   = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        counter.textContent = Math.ceil(current).toLocaleString();
      }
    }, stepTime);
  });
}

/**
 * ==========================================================================
 * REAL DATABASE CHART CONTROLLER (Chart.js)
 * Supports 5 MongoDB Charts:
 * 1. Blogs Published / Views Trend
 * 2. Categories Distribution
 * 3. Most Viewed Blogs
 * 4. Draft vs Published Breakdown
 * 5. Weekly Blog Activity
 * ==========================================================================
 */
let dashboardChartInstance = null;

function initRealAnalyticsChart(analytics, posts) {
  const chartCanvas = document.getElementById('viewsChart');
  if (!chartCanvas || typeof Chart === 'undefined') return;

  const ctx = chartCanvas.getContext('2d');

  // Prepare Real MongoDB Chart Datasets
  const chartsData = (analytics && analytics.charts) ? analytics.charts : null;

  // 1. Views Trend (Dynamic from posts or analytics)
  const viewsTrendLabels = posts.length > 0
    ? posts.slice(0, 7).map(p => (p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title)).reverse()
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const viewsTrendValues = posts.length > 0
    ? posts.slice(0, 7).map(p => p.views || 0).reverse()
    : [0, 0, 0, 0, 0, 0, 0];

  // 2. Categories Distribution from MongoDB
  const catDist = (chartsData && chartsData.categoryDistribution && chartsData.categoryDistribution.length > 0)
    ? chartsData.categoryDistribution
    : buildCategoryDistributionFromPosts(posts);

  // 3. Most Viewed Blogs from MongoDB
  const mostViewed = (chartsData && chartsData.mostViewed && chartsData.mostViewed.length > 0)
    ? chartsData.mostViewed
    : posts.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // 4. Draft vs Published Breakdown from MongoDB
  const publishedCount = analytics ? analytics.publishedBlogs : posts.filter(p => p.status === 'published').length;
  const draftCount     = analytics ? analytics.draftBlogs     : posts.filter(p => p.status === 'draft').length;

  // 5. Weekly Activity (Last 7 Days)
  const weeklyDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
  posts.forEach(p => {
    if (p.createdAt) {
      const dayIdx = new Date(p.createdAt).getDay();
      weeklyCounts[dayIdx] += 1;
    }
  });

  // Chart Rendering Function
  function renderChart(type, labels, datasets, options = {}) {
    if (dashboardChartInstance) {
      dashboardChartInstance.destroy();
    }

    dashboardChartInstance = new Chart(ctx, {
      type,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut' || type === 'pie',
            position: 'bottom',
            labels: { font: { family: 'Poppins', size: 11 }, color: '#64748B' }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Poppins', size: 13, weight: 'bold' },
            bodyFont:  { family: 'Poppins', size: 12 },
            padding: 10, cornerRadius: 8
          }
        },
        scales: (type === 'doughnut' || type === 'pie') ? {} : {
          x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 }, color: '#64748B' } },
          y: { grid: { color: '#F1F5F9' },   ticks: { font: { family: 'Poppins', size: 11 }, color: '#64748B' }, beginAtZero: true }
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
        ...options
      }
    });
  }

  // Render Initial View (Views Trend Line Chart)
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  renderChart('line', viewsTrendLabels, [{
    label: 'Total Views',
    data: viewsTrendValues,
    borderColor: '#10B981',
    borderWidth: 3,
    backgroundColor: gradient,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: '#10B981',
    pointBorderColor: '#FFFFFF',
    pointBorderWidth: 2,
    pointRadius: 5
  }]);

  // Hook Up Time Pills to Switch Between the 5 MongoDB Charts
  const pillBtns = document.querySelectorAll('.pill-btn');
  pillBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const chartIndex = idx % 5;

      switch (chartIndex) {
        case 0: // 1. Views Trend / Monthly Published
          renderChart('line', viewsTrendLabels, [{
            label: 'Views per Story',
            data: viewsTrendValues,
            borderColor: '#10B981',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4
          }]);
          break;

        case 1: // 2. Categories Distribution
          renderChart('doughnut', catDist.map(c => c.category || c._id || 'General'), [{
            label: 'Blogs per Category',
            data: catDist.map(c => c.count || 1),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B']
          }]);
          break;

        case 2: // 3. Most Viewed Blogs
          renderChart('bar', mostViewed.map(m => (m.title.length > 15 ? m.title.substring(0, 15) + '...' : m.title)), [{
            label: 'Views',
            data: mostViewed.map(m => m.views || 0),
            backgroundColor: '#3B82F6',
            borderRadius: 6
          }]);
          break;

        case 3: // 4. Draft vs Published Breakdown
          renderChart('doughnut', ['Published', 'Drafts'], [{
            label: 'Status Breakdown',
            data: [publishedCount, draftCount],
            backgroundColor: ['#10B981', '#F59E0B']
          }]);
          break;

        case 4: // 5. Weekly Blog Activity
          renderChart('bar', weeklyDays, [{
            label: 'Blogs Published',
            data: weeklyCounts,
            backgroundColor: '#8B5CF6',
            borderRadius: 6
          }]);
          break;
      }
    });
  });
}

function buildCategoryDistributionFromPosts(posts) {
  const map = {};
  posts.forEach(p => {
    const cat = p.category || 'General';
    map[cat] = (map[cat] || 0) + 1;
  });
  return Object.keys(map).map(cat => ({ category: cat, count: map[cat] }));
}

/**
 * ==========================================================================
 * RECENT BLOGS TABLE RENDERER
 * Displays MongoDB blog documents sorted newest first
 * ==========================================================================
 */
function renderRecentBlogsTable(data) {
  const tableBody   = document.getElementById('blogsTableBody');
  const emptyState  = document.getElementById('emptyState');
  const deleteModal = document.getElementById('deleteModalOverlay');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');

  if (!tableBody) return;

  if (!data || data.length === 0) {
    if (tableBody.closest('table')) tableBody.closest('table').style.display = 'none';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  if (tableBody.closest('table')) tableBody.closest('table').style.display = '';

  tableBody.innerHTML = data.map(blog => {
    const thumbUrl = blog.imageData || blog.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=80';
    const blogId   = blog.id || blog._id || '';
    const dateFormatted = blog.createdAt
      ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : (blog.date || 'Recent');

    return `
      <tr id="row-${blogId}">
        <td>
          <div class="thumb-preview" style="background-image: url('${thumbUrl}');"></div>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-main);">
            <a href="blog-details.html?id=${blogId}">${blog.title || 'Untitled Story'}</a>
          </div>
        </td>
        <td><span style="font-size:0.78rem; color:var(--text-sub); font-weight:500;">${blog.category || 'General'}</span></td>
        <td>
          <span class="status-badge ${blog.status === 'published' ? 'badge-published' : 'badge-draft'}">
            ${(blog.status || 'published').toUpperCase()}
          </span>
        </td>
        <td><strong>${(blog.views || 0).toLocaleString()}</strong></td>
        <td style="color:var(--text-sub); font-size:0.82rem;">${dateFormatted}</td>
        <td>
          <div class="action-buttons">
            <a href="blog-details.html?id=${blogId}" class="btn-icon-action" title="View Story">👁️</a>
            <a href="create-blog.html?id=${blogId}" class="btn-icon-action" title="Edit Story">✏️</a>
            <button class="btn-icon-action delete-blog-btn" data-id="${blogId}" title="Delete Story">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Delete Action Attachments
  let targetDeleteId = null;
  document.querySelectorAll('.delete-blog-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      targetDeleteId = this.getAttribute('data-id');
      if (deleteModal) deleteModal.classList.add('active');
    });
  });

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.onclick = () => {
      deleteModal.classList.remove('active');
      targetDeleteId = null;
    };
  }

  if (confirmDeleteBtn && deleteModal) {
    confirmDeleteBtn.onclick = async () => {
      if (targetDeleteId) {
        let deleteResult = null;
        if (window.store && typeof window.store.deletePost === 'function') {
          deleteResult = await window.store.deletePost(targetDeleteId);
        }
        deleteModal.classList.remove('active');

        if (deleteResult && !deleteResult.success) {
          showDashboardToast(`❌ ${deleteResult.message || 'Failed to delete blog'}`, 'error');
        } else {
          showDashboardToast('✅ Blog deleted successfully.', 'success');
        }

        targetDeleteId = null;

        // Re-fetch and re-render blog list automatically
        if (window.store && typeof window.store.fetchAllPosts === 'function') {
          await window.store.fetchAllPosts();
          const refreshed = window.store.getAllPosts() || [];
          renderRecentBlogsTable(refreshed);
          updateStats(refreshed);
        }
      }
    };
  }
}

function showDashboardToast(msg, type = 'success') {
  const existing = document.getElementById('_dash-toast-banner');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_dash-toast-banner';
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
