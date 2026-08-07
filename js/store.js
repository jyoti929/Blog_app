/**
 * ==========================================================================
 * CENTRALIZED STORE & BACKEND REST API BRIDGE (js/store.js)
 * Connects Frontend to REST API Endpoints with Bearer JWT Authentication
 * ==========================================================================
 */

const STORE_API_BASE  = 'http://localhost:5000/api';
const STORE_BLOGS_URL = `${STORE_API_BASE}/blogs`;

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

  // ── GET /api/blogs ─────────────────────────────────────────
  async fetchAllPosts() {
    try {
      console.log('[Store] fetchAllPosts() → calling GET', STORE_BLOGS_URL);
      const response = await fetch(STORE_BLOGS_URL);
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
      console.error('        → Is the backend running at http://localhost:5000 ?');
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

      const response = await fetch(STORE_BLOGS_URL, {
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
      const response = await fetch(`${STORE_API_BASE}/dashboard/analytics`, {
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
      const response = await fetch(`${STORE_BLOGS_URL}/${id}`, {
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
