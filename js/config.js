/**
 * ==========================================================================
 * BLOGIFY API CONFIGURATION (js/config.js)
 * Centralized API Base URL configuration for local development and production.
 * ==========================================================================
 */

// Dynamically determine the backend REST API base URL
window.API_BASE_URL = (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
)
  ? "http://localhost:5000/api"
  : "https://blog-app-ybg6.onrender.com";

// Helper accessor for modules/scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL: window.API_BASE_URL };
}
