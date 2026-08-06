/**
 * ==========================================================================
 * BLOGIFY DASHBOARD CONTROLLER (js/dashboard.js)
 * Protected Route Verification & Backend API Integration
 * ==========================================================================
 */

// 1. Strict Synchronous Route Protection Guard
if (typeof Auth !== 'undefined') {
  Auth.checkAuth();
}

document.addEventListener('DOMContentLoaded', async () => {

  // Verify auth state
  if (typeof Auth !== 'undefined' && !Auth.isAuthenticated()) {
    Auth.logout();
    return;
  }

  // Optionally verify JWT token with backend GET /api/auth/me
  if (typeof Auth !== 'undefined') {
    Auth.verifyTokenWithBackend();
  }

  // Update User Profile Display
  const user = typeof Auth !== 'undefined' ? Auth.getUserData() : null;
  const userEmail = typeof Auth !== 'undefined' ? Auth.getLoggedInUser() : null;

  const displayName = user ? user.name : (userEmail ? userEmail.split('@')[0] : 'Author');
  const userDisplayNameEl = document.getElementById('userDisplayName');
  const userAvatarEl = document.getElementById('userAvatar');
  const welcomeGreetingEl = document.getElementById('welcomeGreeting');

  if (userDisplayNameEl) userDisplayNameEl.textContent = `${displayName} ▾`;
  if (userAvatarEl) userAvatarEl.textContent = displayName.slice(0, 2).toUpperCase();
  if (welcomeGreetingEl) welcomeGreetingEl.textContent = `Welcome back, ${displayName} 👋`;

  // Fetch blogs from Backend API
  if (window.store && typeof window.store.fetchAllPosts === 'function') {
    await window.store.fetchAllPosts();
  }

  // Fetch posts helper
  function getPosts() {
    if (window.store && typeof window.store.getAllPosts === 'function') {
      const posts = window.store.getAllPosts();
      if (posts && posts.length > 0) return posts;
    }
    return [
      {
        id: 'post-1',
        title: 'Exploring the Mountains',
        category: 'Travel',
        date: 'May 20, 2024',
        status: 'published',
        views: 320,
        imageData: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 'post-2',
        title: 'Morning Habits for Success',
        category: 'Lifestyle',
        date: 'May 18, 2024',
        status: 'published',
        views: 210,
        imageData: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 'post-3',
        title: 'Why JavaScript is Amazing',
        category: 'Technology',
        date: 'May 15, 2024',
        status: 'published',
        views: 450,
        imageData: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 'post-4',
        title: 'Healthy Eating Tips',
        category: 'Food',
        date: 'May 10, 2024',
        status: 'draft',
        views: 180,
        imageData: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 'post-5',
        title: 'My Trip to Bali',
        category: 'Travel',
        date: 'May 05, 2024',
        status: 'published',
        views: 270,
        imageData: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=120&q=80'
      }
    ];
  }

  // 2. Mobile Sidebar Slide-out Handler
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

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

  // 3. Time Greeting & Date Display
  const greetingEl = document.getElementById('timeGreeting');
  const dateEl = document.getElementById('currentDateDisplay');

  if (greetingEl) {
    const hour = new Date().getHours();
    if (hour < 12) greetingEl.textContent = 'Good Morning,';
    else if (hour < 18) greetingEl.textContent = 'Good Afternoon,';
    else greetingEl.textContent = 'Good Evening,';
  }

  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // 4. Counter Number Animation
  function animateCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1000;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

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

  // 5. Chart.js Animated Line Chart
  const chartCanvas = document.getElementById('viewsChart');
  let myChart = null;

  const chartDatasets = {
    '7': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [120, 190, 300, 250, 420, 380, 510]
    },
    '30': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [1200, 1850, 2400, 3100]
    },
    '90': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      data: [4200, 6800, 9400]
    },
    '365': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [12400, 18900, 24500, 32100]
    }
  };

  function initChart() {
    if (!chartCanvas || typeof Chart === 'undefined') return;

    const ctx = chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const initial = chartDatasets['7'];

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initial.labels,
        datasets: [{
          label: 'Total Views',
          data: initial.data,
          borderColor: '#10B981',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Poppins', size: 13, weight: 'bold' },
            bodyFont: { family: 'Poppins', size: 12 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', size: 11 }, color: '#64748B' }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: { font: { family: 'Poppins', size: 11 }, color: '#64748B' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // Filter Pills Event Listener
  const pillBtns = document.querySelectorAll('.pill-btn');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.dataset.range;
      const targetData = chartDatasets[range];

      if (myChart && targetData) {
        myChart.data.labels = targetData.labels;
        myChart.data.datasets[0].data = targetData.data;
        myChart.update();
      }
    });
  });

  // 6. Recent Blogs Content Table
  const tableBody = document.getElementById('blogsTableBody');
  const emptyState = document.getElementById('emptyState');
  const deleteModal = document.getElementById('deleteModalOverlay');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  let postToDeleteId = null;

  function renderTable() {
    const posts = getPosts();
    if (!tableBody) return;

    if (!posts || posts.length === 0) {
      tableBody.parentElement.style.display = 'none';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    tableBody.parentElement.style.display = 'table';

    tableBody.innerHTML = posts.map(blog => {
      const thumbUrl = blog.imageData || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=80';
      return `
        <tr id="row-${blog.id}">
          <td>
            <div class="thumb-preview" style="background-image: url('${thumbUrl}');"></div>
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-main);">
              <a href="post.html?id=${blog.id}">${blog.title}</a>
            </div>
          </td>
          <td><span style="font-size:0.78rem; color:var(--text-sub); font-weight:500;">${blog.category}</span></td>
          <td>
            <span class="status-badge ${blog.status === 'published' ? 'badge-published' : 'badge-draft'}">
              ${blog.status.toUpperCase()}
            </span>
          </td>
          <td><strong>${(blog.views || 0).toLocaleString()}</strong></td>
          <td style="color:var(--text-sub); font-size:0.82rem;">${blog.date}</td>
          <td>
            <div class="action-buttons">
              <a href="post.html?id=${blog.id}" class="btn-icon-action" title="View Story">👁️</a>
              <a href="create-blog.html?id=${blog.id}" class="btn-icon-action" title="Edit Story">✏️</a>
              <button class="btn-icon-action delete-blog-btn" data-id="${blog.id}" title="Delete Story">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Delete Action
    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        postToDeleteId = this.getAttribute('data-id');
        if (deleteModal) deleteModal.classList.add('active');
      });
    });
  }

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
      postToDeleteId = null;
    });
  }

  if (confirmDeleteBtn && deleteModal) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (postToDeleteId) {
        if (window.store && typeof window.store.deletePost === 'function') {
          await window.store.deletePost(postToDeleteId);
        }
        deleteModal.classList.remove('active');
        postToDeleteId = null;
        renderTable();
        updateStats();
      }
    });
  }

  // 7. Search Filter
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const allPosts = getPosts();
      const filtered = allPosts.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.category.toLowerCase().includes(query)
      );

      if (!tableBody) return;
      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-sub);">No matching blogs found.</td></tr>`;
        return;
      }

      tableBody.innerHTML = filtered.map(blog => {
        const thumbUrl = blog.imageData || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=120&q=80';
        return `
          <tr id="row-${blog.id}">
            <td><div class="thumb-preview" style="background-image: url('${thumbUrl}');"></div></td>
            <td><div style="font-weight:600;"><a href="post.html?id=${blog.id}">${blog.title}</a></div></td>
            <td><span style="font-size:0.78rem; color:var(--text-sub);">${blog.category}</span></td>
            <td><span class="status-badge ${blog.status === 'published' ? 'badge-published' : 'badge-draft'}">${blog.status.toUpperCase()}</span></td>
            <td><strong>${(blog.views || 0).toLocaleString()}</strong></td>
            <td style="color:var(--text-sub); font-size:0.82rem;">${blog.date}</td>
            <td>
              <div class="action-buttons">
                <a href="post.html?id=${blog.id}" class="btn-icon-action" title="View">👁️</a>
                <a href="create-blog.html?id=${blog.id}" class="btn-icon-action" title="Edit">✏️</a>
                <button class="btn-icon-action delete-blog-btn" data-id="${blog.id}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    });
  }

  // 8. Update Stat Counts
  function updateStats() {
    const posts = getPosts();
    const published = posts.filter(b => b.status === 'published');
    const drafts = posts.filter(b => b.status === 'draft');
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

    const totalEl = document.querySelector('.stat-card:nth-child(1) .stat-count');
    const pubEl = document.querySelector('.stat-card:nth-child(2) .stat-count');
    const draftEl = document.querySelector('.stat-card:nth-child(3) .stat-count');
    const viewsEl = document.querySelector('.stat-card:nth-child(4) .stat-count');

    if (totalEl) totalEl.textContent = posts.length;
    if (pubEl) pubEl.textContent = published.length;
    if (draftEl) draftEl.textContent = drafts.length;
    if (viewsEl) viewsEl.textContent = totalViews.toLocaleString();
  }

  // 9. Logout Button Handler - Direct Call to Auth.logout()
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Auth !== 'undefined') {
        Auth.logout();
      } else {
        localStorage.clear();
        window.location.replace('login.html');
      }
    });
  }

  // Initial Execution
  renderTable();
  updateStats();
  animateCounters();
  initChart();
});
