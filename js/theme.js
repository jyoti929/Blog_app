/**
 * ==========================================================================
 * BLOGIFY GLOBAL THEME MANAGER (js/theme.js)
 * Manages Light, Dark, & System Color Schemes Across the Entire Application
 * Persists selected preference in localStorage ('theme')
 * ==========================================================================
 */

(function () {
  'use strict';

  const THEME_KEY = 'theme';

  /**
   * Retrieves current theme preference from localStorage ('light', 'dark', 'system')
   */
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  /**
   * Evaluates effective mode ('light' or 'dark') based on preference & OS setting
   */
  function getEffectiveMode(themeName) {
    if (themeName === 'dark') return 'dark';
    if (themeName === 'light') return 'light';
    if (themeName === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Applies target theme mode to documentElement attribute & updates toggle UI icons
   */
  function applyTheme(themeName) {
    const activeTheme = themeName || getTheme();
    const effectiveMode = getEffectiveMode(activeTheme);

    // Set global data-theme attribute on <html> element
    document.documentElement.setAttribute('data-theme', effectiveMode);

    // Update toggle icons on all pages
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.textContent = effectiveMode === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', `Switch Theme (Current: ${activeTheme})`);
    });

    // Notify listeners if any (e.g. Chart.js redraws)
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: activeTheme, mode: effectiveMode } }));
  }

  /**
   * Saves selected theme preference to localStorage and applies it immediately
   */
  function setTheme(themeName) {
    if (!['light', 'dark', 'system'].includes(themeName)) {
      themeName = 'light';
    }
    localStorage.setItem(THEME_KEY, themeName);
    applyTheme(themeName);
  }

  /**
   * Initializes theme immediately on script execution to prevent Flash of Unstyled Content (FOUC)
   */
  function initializeTheme() {
    const savedTheme = getTheme();
    applyTheme(savedTheme);

    // Listen for OS system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getTheme() === 'system') {
          applyTheme('system');
        }
      });
    }
  }

  // Execute immediate theme initialization (Synchronous before DOM renders)
  initializeTheme();

  // Attach event listener once DOM is ready for toggle button clicks
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());

    // Bind all theme toggle buttons globally
    document.body.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.theme-toggle-btn');
      if (toggleBtn) {
        e.preventDefault();
        const currentMode = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentMode === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
      }
    });
  });

  // Export global Theme API
  window.Theme = {
    getTheme,
    setTheme,
    applyTheme,
    initializeTheme
  };

})();
