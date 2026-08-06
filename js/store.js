/**
 * ==========================================================================
 * BLOGIFY DATA STORE (js/store.js)
 * Interacts with Backend REST API (http://localhost:5000/api/blogs)
 * ==========================================================================
 */

const API_BLOGS_URL = 'http://localhost:5000/api/blogs';

window.store = {
  // In-memory cache for fast UI rendering
  cachedPosts: [],

  // Get Auth Bearer Headers
  getHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Fetch all posts from Backend API: GET /api/blogs
  async fetchAllPosts() {
    try {
      const response = await fetch(API_BLOGS_URL, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch posts from backend');

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Map backend document to frontend post schema
        this.cachedPosts = result.data.map(p => ({
          id: p._id,
          title: p.title,
          content: p.content,
          category: p.category || 'General',
          imageData: p.imageUrl || '',
          status: p.status || 'published',
          views: p.views || 0,
          date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: p.author ? p.author.name : 'Author'
        }));
        return this.cachedPosts;
      }
    } catch (err) {
      console.warn('[Store API Error] Could not fetch posts from backend, using cache or fallback:', err.message);
    }
    return this.cachedPosts;
  },

  // Synchronous Getter returning cached or fallback posts
  getAllPosts() {
    return this.cachedPosts;
  },

  // Create post via Backend API: POST /api/blogs
  async createPost(postData) {
    try {
      const response = await fetch(API_BLOGS_URL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          category: postData.category,
          imageUrl: postData.imageData || postData.imageUrl,
          status: postData.status || 'published'
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create blog post');
      }

      await this.fetchAllPosts();
      return { success: true, data: result.data };
    } catch (err) {
      console.error('[Store API Error] Failed to create post:', err.message);
      return { success: false, message: err.message };
    }
  },

  // Delete post via Backend API: DELETE /api/blogs/:id
  async deletePost(id) {
    try {
      const response = await fetch(`${API_BLOGS_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete blog post');
      }

      // Filter out deleted post from local cache
      this.cachedPosts = this.cachedPosts.filter(p => p.id !== id);
      return { success: true };
    } catch (err) {
      console.error('[Store API Error] Failed to delete post:', err.message);
      return { success: false, message: err.message };
    }
  }
};
