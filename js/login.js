/**
 * ==========================================================================
 * LOGIN PAGE CONTROLLER (js/login.js)
 * Validates Login Form & Authenticates via Backend REST API
 * ==========================================================================
 */

// If user is already logged in, redirect immediately to dashboard.html
if (typeof Auth !== 'undefined') {
  Auth.redirectIfLoggedIn();
}

document.addEventListener('DOMContentLoaded', () => {

  // Robust Selector Fallbacks matching login.html element IDs
  const loginForm = document.getElementById('login-form') || document.getElementById('loginForm');
  const emailInput = document.getElementById('login-email') || document.getElementById('email');
  const passwordInput = document.getElementById('login-password') || document.getElementById('password');
  const errorMsg = document.getElementById('errorMessage');

  console.log('[js/login.js] Initializing Login Form Controller...', {
    formFound: Boolean(loginForm),
    emailInputFound: Boolean(emailInput),
    passwordInputFound: Boolean(passwordInput)
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      // 1. Prevent default native HTML form submission
      e.preventDefault();
      console.log('[js/login.js] Login Form submit event intercepted via e.preventDefault()');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      console.log('[js/login.js] Login credentials submitted:', { email, passwordProvided: Boolean(password) });

      // 2. Client-side validation
      if (!email || !password) {
        if (errorMsg) {
          errorMsg.textContent = 'Please enter both email and password.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // 3. UI Loading Feedback
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const origBtnText = submitBtn ? submitBtn.textContent : 'Log In →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
      }

      if (errorMsg) errorMsg.style.display = 'none';

      // 4. Authenticate via Backend REST API
      if (typeof Auth !== 'undefined') {
        const result = await Auth.login(email, password);
        console.log('[js/login.js] Auth.login API result:', result);

        if (result.success) {
          console.log('[js/login.js] Authentication successful. Redirecting to dashboard.html...');
          window.location.replace('dashboard.html');
        } else {
          if (errorMsg) {
            errorMsg.textContent = result.message || 'Invalid email or password.';
            errorMsg.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origBtnText;
          }
        }
      } else {
        console.error('[js/login.js] Auth module is not defined!');
        if (errorMsg) {
          errorMsg.textContent = 'Authentication system failed to load. Please refresh.';
          errorMsg.style.display = 'block';
        }
      }
    });
  } else {
    console.error('[js/login.js] Login Form element (#login-form) was not found in DOM!');
  }
});
