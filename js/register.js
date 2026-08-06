/**
 * ==========================================================================
 * REGISTER PAGE CONTROLLER (js/register.js)
 * Validates Signup Form & Registers User via Backend REST API
 * ==========================================================================
 */

// If user is already logged in, redirect immediately to dashboard.html
if (typeof Auth !== 'undefined') {
  Auth.redirectIfLoggedIn();
}

document.addEventListener('DOMContentLoaded', () => {

  // Robust Selector Fallbacks matching register.html element IDs
  const registerForm = document.getElementById('signup-form') || document.getElementById('registerForm');
  const nameInput = document.getElementById('signup-name') || document.getElementById('name');
  const emailInput = document.getElementById('signup-email') || document.getElementById('email');
  const passwordInput = document.getElementById('signup-password') || document.getElementById('password');
  const confirmInput = document.getElementById('signup-confirm') || document.getElementById('confirm');
  const errorMsg = document.getElementById('errorMessage');

  console.log('[js/register.js] Initializing Signup Form Controller...', {
    formFound: Boolean(registerForm),
    nameInputFound: Boolean(nameInput),
    emailInputFound: Boolean(emailInput),
    passwordInputFound: Boolean(passwordInput)
  });

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      // 1. Prevent default native HTML form submission
      e.preventDefault();
      console.log('[js/register.js] Signup Form submit event intercepted via e.preventDefault()');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      const confirmPassword = confirmInput ? confirmInput.value.trim() : '';

      console.log('[js/register.js] Validating input values:', { name, email, passwordLength: password.length });

      // 2. Client-side field validations
      if (!name || !email || !password) {
        if (errorMsg) {
          errorMsg.textContent = 'Please fill out all required fields.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      if (password.length < 8) {
        if (errorMsg) {
          errorMsg.textContent = 'Password must be at least 8 characters long.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        if (errorMsg) {
          errorMsg.textContent = 'Passwords do not match. Please verify.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // 3. UI Loading Feedback
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const origBtnText = submitBtn ? submitBtn.textContent : 'Sign Up →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
      }

      if (errorMsg) errorMsg.style.display = 'none';

      // 4. Submit Registration request to Backend REST API
      if (typeof Auth !== 'undefined') {
        const result = await Auth.register(name, email, password);
        console.log('[js/register.js] Auth.register API result:', result);

        if (result.success) {
          console.log('[js/register.js] Account registered successfully. Redirecting to login.html...');
          window.location.replace('login.html');
        } else {
          if (errorMsg) {
            errorMsg.textContent = result.message || 'Registration failed. Please try again.';
            errorMsg.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origBtnText;
          }
        }
      } else {
        console.error('[js/register.js] Auth module is not defined!');
        if (errorMsg) {
          errorMsg.textContent = 'Authentication system failed to load. Please refresh.';
          errorMsg.style.display = 'block';
        }
      }
    });
  } else {
    console.error('[js/register.js] Signup Form element (#signup-form) was not found in DOM!');
  }
});
