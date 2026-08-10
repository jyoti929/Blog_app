/**
 * ==========================================================================
 * BLOGIFY FRONTEND AUTHENTICATION MANAGER (js/auth.js)
 * Integrates Frontend with Node.js/Express REST API (http://localhost:5000/api)
 * ==========================================================================
 */

const getAuthApiBase = () => window.API_BASE_URL || (
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : "https://blog-app-ybg6.onrender.com/api"
);

const Auth = {
  get API_BASE_URL() {
    return getAuthApiBase();
  },

  // Retrieve stored JWT Token
  getToken() {
    return localStorage.getItem('authToken') || null;
  },

  // Check if current user is logged in
  isAuthenticated() {
    const token = this.getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return Boolean(token && isLoggedIn);
  },

  // Get current logged-in user email
  getLoggedInUser() {
    return localStorage.getItem('loggedInUser') || null;
  },

  // Get stored user object
  getUserData() {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  // Route Guard: Require Authentication on Protected Pages
  checkAuth() {
    console.log('[Auth] Checking authentication...');
    const token = this.getToken();
    if (!token) {
      console.warn('[Auth] Token not found. Redirecting to login...');
      this.clearSessionData();
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
        window.location.replace('login.html');
      }
      return false;
    }
    console.log('[Auth] Token found.');
    return true;
  },

  // Helper to safely parse JSON responses without throwing SyntaxError on HTML/empty responses
  async parseResponse(response) {
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      const text = await response.text();
      console.warn(`[Auth API] Server returned non-JSON response (HTTP ${response.status}):`, text.slice(0, 200));
      return {
        success: false,
        message: response.status === 404
          ? 'API endpoint not found. Please verify backend URL.'
          : `Server returned HTTP ${response.status}`
      };
    } catch (err) {
      console.error('[Auth API] Failed to parse response body:', err.message);
      return {
        success: false,
        message: 'Invalid response format received from server.'
      };
    }
  },

  // Verify JWT Token against Backend Endpoint GET /api/auth/me
  async verifyTokenWithBackend() {
    const token = this.getToken();
    if (!token) {
      console.warn('[Auth] Token not found.');
      return false;
    }

    try {
      const baseUrl = this.API_BASE_URL;
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('[Auth] Token invalid/expired.');
        this.clearSessionData();
        window.location.replace('login.html');
        return false;
      }

      const data = await this.parseResponse(response);
      if (data.success && data.user) {
        console.log('[Auth] Authentication successful.');
        localStorage.setItem('loggedInUser', data.user.email);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('[Auth API Error] Failed to verify token with backend:', err.message);
    }

    console.warn('[Auth] Token invalid/expired.');
    this.clearSessionData();
    window.location.replace('login.html');
    return false;
  },

  // Redirect Logged-In Users away from Login / Register pages to Dashboard
  redirectIfLoggedIn() {
    if (this.isAuthenticated()) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
        console.log('[Auth] Logged-in user opened login/register page. Redirecting to dashboard.html...');
        window.location.replace('dashboard.html');
        return true;
      }
    }
    return false;
  },

  // Login Function: POST /api/auth/login
  async login(email, password) {
    let response;
    try {
      const baseUrl = this.API_BASE_URL;
      console.log(`[Auth API] Sending POST ${baseUrl}/auth/login request...`, { email });

      response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
    } catch (netErr) {
      console.error('[Auth API Error] Network connection error during login:', netErr.message);
      return {
        success: false,
        message: 'Could not connect to backend server. Please verify your connection or try again later.'
      };
    }

    const data = await this.parseResponse(response);
    console.log('[Auth API] Server login response:', data);

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || (response.status === 401 ? 'Invalid email or password' : `Login failed (HTTP ${response.status})`)
      };
    }

    // Store JWT token & session credentials in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', data.user ? data.user.email : email);
    if (data.user) localStorage.setItem('user_data', JSON.stringify(data.user));

    console.log('[Auth API] Login successful! JWT token saved in localStorage:', data.token);
    return { success: true, user: data.user, token: data.token };
  },

  // Register Function: POST /api/auth/register
  async register(name, email, password) {
    let response;
    try {
      const baseUrl = this.API_BASE_URL;
      console.log(`[Auth API] Sending POST ${baseUrl}/auth/register request...`, { name, email });

      response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
    } catch (netErr) {
      console.error('[Auth API Error] Network connection error during registration:', netErr.message);
      return {
        success: false,
        message: 'Could not connect to backend server. Please verify your connection or try again later.'
      };
    }

    const data = await this.parseResponse(response);
    console.log('[Auth API] Server registration response:', data);

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Registration failed (HTTP ${response.status})`
      };
    }

    // If backend returns token upon registration, save it
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', data.user ? data.user.email : email);
      if (data.user) localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    console.log('[Auth API] Registration successful!');
    return { success: true, message: data.message || 'Registration successful.' };
  },

  // Clear Session Credentials & Frontend Store Cache
  clearSessionData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('user_data');
    if (window.store) {
      window.store.cachedPosts = [];
    }
  },

  // Complete Logout Handler
  logout() {
    console.log('[Auth] Logging out...');
    this.clearSessionData();
    console.log('[Auth] Token removed.');
    console.log('[Auth] User redirected to login.');
    window.location.replace('login.html');
  }
};

window.Auth = Auth;
