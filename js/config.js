/**
 * ==========================================================================
 * BLOGIFY API CONFIGURATION (js/config.js)
 * Centralized API Base URL configuration for local development and production.
 * ==========================================================================
 */

const getHostname = () => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  return '';
};

const hostname = getHostname();
const isLocalhost = (hostname === "localhost" || hostname === "127.0.0.1");

const targetApiUrl = isLocalhost
  ? "http://localhost:5000/api"
  : "https://blog-app-ybg6.onrender.com/api";

if (typeof window !== 'undefined') {
  if (!window.API_BASE_URL || window.API_BASE_URL.includes('RENDER_BACKEND_URL_PLACEHOLDER')) {
    window.API_BASE_URL = targetApiUrl;
  }
}

// Helper accessor for modules/scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL: targetApiUrl };
}
