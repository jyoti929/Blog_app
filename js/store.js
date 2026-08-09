/**
 * ==========================================================================
 * CENTRALIZED STORE & BACKEND REST API BRIDGE (js/store.js)
 * Connects Frontend to REST API Endpoints with Bearer JWT Authentication
 * ==========================================================================
 */

const getStoreApiBase  = () => window.API_BASE_URL || 'http://localhost:5000/api';
const getStoreBlogsUrl = () => `${getStoreApiBase()}/blogs`;

window.store = {
  cachedPosts: [],

  // ── Auth Headers ───────────────────────────────────────────
  getHeaders() {
    const token   = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    console.log('[Store] getHeaders() → token present:', Boolean(token));
    return headers;
  },

  // ── GET /api/blogs/my or /api/blogs/myblogs ─────────────────
  async fetchMyPosts() {
    try {
      console.log('[Store] Fetching logged-in user blogs...');
      const headers = this.getHeaders();
      if (headers['Authorization']) {
        console.log('[Store] Authorization header attached.');
      } else {
        console.warn('[Store] Authorization header missing!');
      }

      const endpoints = [
        `${getStoreBlogsUrl()}/myblogs`,
        `${getStoreBlogsUrl()}/my`
      ];

      let response = null;
      let result = null;

      for (const url of endpoints) {
        try {
          response = await fetch(url, { method: 'GET', headers });
          if (response.status === 404) {
            console.warn(`[Store] ${url} returned 404. Trying fallback endpoint...`);
            continue;
          }
          result = await response.json();
          break;
        } catch (e) {
          console.warn(`[Store] Fetch error for ${url}:`, e.message);
        }
      }

      if (!response) {
        throw new Error('Could not connect to user blogs endpoint.');
      }

      console.log('[Store] fetchMyPosts() → HTTP status:', response.status);

      if (response.status === 401) {
        console.warn('[Store] 401 Unauthorized received. Clearing token...');
        if (typeof Auth !== 'undefined') {
          Auth.clearSessionData();
          window.location.replace('login.html');
        }
        return { success: false, status: 401, message: 'Session expired. Please log in again.' };
      }

      if (response.status === 403) {
        console.error('[Store] 403 Forbidden received.');
        return { success: false, status: 403, message: 'You are not authorized to view these blogs.' };
      }

      if (!response.ok || !result || !result.success) {
        console.error('[Store] GET /api/blogs/my failed');
        console.error('HTTP status:', response ? response.status : 'N/A');
        console.error('Response:', result);
        return { success: false, status: response ? response.status : 500, message: result ? result.message : 'Failed to fetch blogs' };
      }

      const postsData = Array.isArray(result.data) ? result.data : [];
      console.log(`[Store] Received ${postsData.length} blogs.`);

      this.cachedPosts = postsData.map(p => ({
        id:        p._id  || p.id,
        _id:       p._id  || p.id,
        title:     p.title,
        content:   p.content,
        category:  p.category  || 'General',
        imageUrl:  p.imageUrl  || p.coverImage || '',
        imageData: p.imageUrl  || p.coverImage || '',
        status:    p.status    || 'published',
        theme:     p.theme     || 'theme-01',
        template:  p.template  || 'blank',
        tags:      p.tags      || [],
        views:     p.views     || 0,
        author:    p.author    ? (typeof p.author === 'object' ? p.author.name : p.author) : 'Anonymous',
        date:      p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        createdAt: p.createdAt || new Date().toISOString()
      }));

      return { success: true, count: this.cachedPosts.length, data: this.cachedPosts };

    } catch (err) {
      console.error('[Store] fetchMyPosts() → ❌ Network/fetch error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── GET /api/blogs ─────────────────────────────────────────
  async fetchAllPosts() {
    try {
      console.log('[Store] fetchAllPosts() → calling GET', getStoreBlogsUrl());
      const response = await fetch(getStoreBlogsUrl());
      console.log('[Store] fetchAllPosts() → HTTP status:', response.status);

      const result = await response.json();
      console.log('[Store] fetchAllPosts() → raw response:', result);

      if (!response.ok) {
        console.error('[Store] fetchAllPosts() → ❌ HTTP error', response.status, result.message);
        return this.cachedPosts;
      }

      if (!result.success) {
        console.error('[Store] fetchAllPosts() → ❌ success=false:', result.message);
        return this.cachedPosts;
      }

      if (!Array.isArray(result.data)) {
        console.error('[Store] fetchAllPosts() → ❌ result.data is not an array:', result.data);
        return this.cachedPosts;
      }

      this.cachedPosts = result.data.map(p => ({
        id:        p._id  || p.id,
        _id:       p._id  || p.id,
        title:     p.title,
        content:   p.content,
        category:  p.category  || 'General',
        imageUrl:  p.imageUrl  || p.coverImage || '',
        imageData: p.imageUrl  || p.coverImage || '',
        status:    p.status    || 'published',
        theme:     p.theme     || 'theme-01',
        template:  p.template  || 'blank',
        tags:      p.tags      || [],
        views:     p.views     || 0,
        author:    p.author    ? (typeof p.author === 'object' ? p.author.name : p.author) : 'Anonymous',
        date:      p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        createdAt: p.createdAt || new Date().toISOString()
      }));

      console.log(`[Store] fetchAllPosts() → ✅ Cached ${this.cachedPosts.length} posts.`);
      return this.cachedPosts;

    } catch (err) {
      console.error('[Store] fetchAllPosts() → ❌ Network/fetch error:', err.message);
      console.error(`        → Is the backend running at ${getStoreApiBase()} ?`);
      return this.cachedPosts;
    }
  },

  // ── Cache Setter ───────────────────────────────────────────
  setPosts(posts) {
    if (!Array.isArray(posts)) return this.cachedPosts;
    this.cachedPosts = posts.map(p => ({
      id:        p._id  || p.id,
      _id:       p._id  || p.id,
      title:     p.title,
      content:   p.content,
      category:  p.category  || 'General',
      imageUrl:  p.imageUrl  || p.coverImage || '',
      imageData: p.imageUrl  || p.coverImage || '',
      status:    p.status    || 'published',
      theme:     p.theme     || 'theme-01',
      template:  p.template  || 'blank',
      tags:      p.tags      || [],
      views:     p.views     || 0,
      author:    p.author    ? (typeof p.author === 'object' ? p.author.name : p.author) : 'Anonymous',
      date:      p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      createdAt: p.createdAt || new Date().toISOString()
    }));
    return this.cachedPosts;
  },

  // ── Synchronous cache getter ────────────────────────────────
  getAllPosts() {
    return this.cachedPosts;
  },

  // ── POST /api/blogs ────────────────────────────────────────
  async createPost(postData) {
    try {
      console.log('[DEBUG STORE] createPost() called for POST /api/blogs (User explicitly clicked submit)');
      const headers = this.getHeaders();
      console.log('[Store] createPost() → Authorization header present:', Boolean(headers['Authorization']));

      const payload = {
        title:      postData.title,
        content:    postData.content,
        category:   postData.category,
        coverImage: postData.coverImage || postData.imageData || postData.imageUrl || '',
        imageUrl:   postData.coverImage || postData.imageData || postData.imageUrl || '',
        status:     postData.status     || 'published',
        tags:       Array.isArray(postData.tags) ? postData.tags : [],
        template:   postData.template   || 'blank',
        theme:      postData.theme      || 'theme-01'
      };
      console.log('[Store] createPost() → payload to send:', { ...payload, coverImage: payload.coverImage ? '[image data present]' : 'none' });

      const response = await fetch(getStoreBlogsUrl(), {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload)
      });

      console.log('[Store] createPost() → HTTP status:', response.status);
      const result = await response.json();
      console.log('[Store] createPost() → backend response:', result);

      if (!response.ok || !result.success) {
        const msg = result.message || `HTTP ${response.status}`;
        console.error('[Store] createPost() → ❌ Failed:', msg);
        return { success: false, message: msg };
      }

      // Re-fetch to update cache with the newly saved blog
      await this.fetchAllPosts();
      console.log('[Store] createPost() → ✅ Blog saved. Cache refreshed.');
      return { success: true, message: result.message || 'Blog published successfully.', blog: result.blog || result.data };

    } catch (err) {
      console.error('[Store] createPost() → ❌ Network/fetch error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ── GET /api/dashboard/analytics ───────────────────────────
  async fetchAnalytics() {
    try {
      console.log('[Store] fetchAnalytics() → calling GET /api/dashboard/analytics');
      const response = await fetch(`${getStoreApiBase()}/dashboard/analytics`, {
        headers: this.getHeaders()
      });
      const result = await response.json();
      if (response.ok && result.success) {
        console.log('[Store] fetchAnalytics() → ✅ Analytics data received:', result);
        return result;
      }
    } catch (err) {
      console.error('[Store] fetchAnalytics() → ❌ Error:', err.message);
    }
    return null;
  },

  // ── DELETE /api/blogs/:id ──────────────────────────────────
  async deletePost(id) {
    try {
      const response = await fetch(`${getStoreBlogsUrl()}/${id}`, {
        method:  'DELETE',
        headers: this.getHeaders()
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete blog post');
      }
      this.cachedPosts = this.cachedPosts.filter(p => p.id !== id && p._id !== id);
      console.log('[Store] deletePost() → ✅ Deleted post', id);
      return { success: true };
    } catch (err) {
      console.error('[Store] deletePost() → ❌ Error:', err.message);
      return { success: false, message: err.message };
    }
  }
};
