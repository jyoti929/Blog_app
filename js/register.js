/**
 * ==========================================================================
 * REGISTER PAGE CONTROLLER (js/register.js)
 * Live Password Checklist, Strength Meter, Eye Toggles & Backend REST Registration
 * ==========================================================================
 */

if (typeof Auth !== 'undefined') {
  Auth.redirectIfLoggedIn();
}

document.addEventListener('DOMContentLoaded', () => {

  const registerForm  = document.getElementById('signup-form') || document.getElementById('registerForm');
  const nameInput     = document.getElementById('signup-name') || document.getElementById('name');
  const emailInput    = document.getElementById('signup-email') || document.getElementById('email');
  const passwordInput = document.getElementById('signup-password') || document.getElementById('password');
  const confirmInput  = document.getElementById('signup-confirm') || document.getElementById('confirm');
  const errorMsg      = document.getElementById('errorMessage');

  // Attach Password Validator UI
  if (typeof PasswordValidator !== 'undefined' && passwordInput) {
    PasswordValidator.attachUI({
      passwordInput: passwordInput,
      confirmInput: confirmInput,
      popoverCardEl: document.getElementById('pwdPopoverCard'),
      checklistEl: document.getElementById('pwdChecklist'),
      strengthMeterEl: document.getElementById('strengthBar'),
      strengthTextEl: document.getElementById('strengthText'),
      matchFeedbackEl: document.getElementById('confirmMatchFeedback'),
      togglePasswordBtn: document.getElementById('toggleSignupPassword'),
      toggleConfirmBtn: document.getElementById('toggleSignupConfirm')
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name            = nameInput ? nameInput.value.trim() : '';
      const email           = emailInput ? emailInput.value.trim() : '';
      const password        = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmInput ? confirmInput.value : '';

      if (!name || !email || !password) {
        if (errorMsg) {
          errorMsg.textContent = 'Please fill out all required fields.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Password Policy Validation Check
      if (typeof PasswordValidator !== 'undefined') {
        const evalRes = PasswordValidator.evaluate(password);
        if (!evalRes.isValid) {
          if (errorMsg) {
            errorMsg.textContent = 'Please satisfy all password requirements listed below.';
            errorMsg.style.display = 'block';
          }
          return;
        }
      }

      // Confirm Password Match Check
      if (password !== confirmPassword) {
        if (errorMsg) {
          errorMsg.textContent = 'Passwords do not match.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // UI Loading State
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const origBtnText = submitBtn ? submitBtn.textContent : 'Create Free Account →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
      }

      if (errorMsg) errorMsg.style.display = 'none';

      // Submit via Auth API
      if (typeof Auth !== 'undefined') {
        const result = await Auth.register(name, email, password);
        if (result.success) {
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
      }
    });
  }
});
