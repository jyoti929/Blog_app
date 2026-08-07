/**
 * ==========================================================================
 * BLOGIFY REUSABLE PASSWORD VALIDATOR & FLOATING CARD (js/password-validator.js)
 * Clean, Compact, Floating Validation Card with Real-time Checklist & Collapsible Badge
 * ==========================================================================
 */

(function () {
  'use strict';

  const POLICY_RULES = [
    { key: 'min8',      label: 'Minimum 8 characters',               test: p => p.length >= 8 && p.length <= 32 },
    { key: 'uppercase', label: 'One uppercase letter (A–Z)',         test: p => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'One lowercase letter (a–z)',         test: p => /[a-z]/.test(p) },
    { key: 'number',    label: 'One number (0–9)',                   test: p => /[0-9]/.test(p) },
    { key: 'special',  label: 'One special character',              test: p => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(p) }
  ];

  /**
   * Evaluates password against all policy rules & calculates strength score
   */
  function evaluatePassword(password) {
    const p = password || '';
    let score = 0;
    const ruleStatus = {};

    POLICY_RULES.forEach(rule => {
      const satisfied = rule.test(p);
      ruleStatus[rule.key] = satisfied;
      if (satisfied) score += 1;
    });

    let strength = { level: 'Too Short', color: '#CBD5E1', percent: 0 };
    if (score === 1) {
      strength = { level: 'Weak', color: '#EF4444', percent: 20 };
    } else if (score === 2) {
      strength = { level: 'Fair', color: '#F59E0B', percent: 40 };
    } else if (score === 3) {
      strength = { level: 'Good', color: '#FACC15', percent: 60 };
    } else if (score === 4) {
      strength = { level: 'Strong', color: '#10B981', percent: 80 };
    } else if (score === 5) {
      strength = { level: 'Very Strong', color: '#059669', percent: 100 };
    }

    const isValid = score === 5;

    return {
      isValid,
      score,
      ruleStatus,
      strength
    };
  }

  /**
   * Main UI Attachment Method:
   * Sets up focus/blur triggers, floating card popover, live checklist, strength meter,
   * smart collapse into a green badge when satisfied, and confirm password matching.
   */
  function attachUI(config) {
    const {
      passwordInput,
      confirmInput,
      popoverCardEl,
      checklistEl,
      strengthMeterEl,
      strengthTextEl,
      matchFeedbackEl,
      togglePasswordBtn,
      toggleConfirmBtn
    } = config;

    if (!passwordInput) return;

    // Build or style Popover Floating Card Container if exists
    const cardContainer = popoverCardEl || document.getElementById('pwdPopoverCard');

    // Create badge container if not exists
    let successBadge = document.getElementById('_pwdSuccessBadge');
    if (!successBadge && cardContainer && cardContainer.parentNode) {
      successBadge = document.createElement('div');
      successBadge.id = '_pwdSuccessBadge';
      successBadge.className = 'pwd-success-badge';
      successBadge.style.display = 'none';
      successBadge.innerHTML = `✓ Strong password`;
      cardContainer.parentNode.insertBefore(successBadge, cardContainer.nextSibling);
    }

    // Render initial checklist if element exists
    if (checklistEl) {
      checklistEl.innerHTML = POLICY_RULES.map(rule => `
        <li data-rule="${rule.key}" style="display:flex; align-items:center; gap:6px; font-size:0.76rem; color:#94A3B8; margin-bottom:4px; transition:all 0.2s ease;">
          <span class="icon-mark" style="font-weight:700; width:12px; text-align:center;">○</span> ${rule.label}
        </li>
      `).join('');
    }

    // Show Floating Popover Card with Animation
    function showCard() {
      if (!cardContainer) return;
      cardContainer.style.display = 'block';
      setTimeout(() => {
        cardContainer.classList.add('pwd-popover-visible');
        cardContainer.style.opacity = '1';
        cardContainer.style.transform = 'translateY(0)';
      }, 10);
    }

    // Hide Floating Popover Card with Animation
    function hideCard() {
      if (!cardContainer) return;
      cardContainer.style.opacity = '0';
      cardContainer.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        cardContainer.classList.remove('pwd-popover-visible');
        cardContainer.style.display = 'none';
      }, 200);
    }

    // Update Password Validation Logic & UI State
    function updatePasswordUI() {
      const val = passwordInput.value;
      const res = evaluatePassword(val);

      // Show Card if user typed or focused
      if (val.length > 0 && !res.isValid) {
        showCard();
        if (successBadge) successBadge.style.display = 'none';
      } else if (res.isValid) {
        // Collapse into green badge!
        hideCard();
        if (successBadge) successBadge.style.display = 'inline-flex';
      } else if (val.length === 0) {
        hideCard();
        if (successBadge) successBadge.style.display = 'none';
      }

      // Update Checklist Items
      if (checklistEl) {
        POLICY_RULES.forEach(rule => {
          const item = checklistEl.querySelector(`[data-rule="${rule.key}"]`);
          if (item) {
            const satisfied = res.ruleStatus[rule.key];
            if (satisfied) {
              item.style.color = '#10B981';
              item.querySelector('.icon-mark').textContent = '✓';
            } else {
              item.style.color = val.length > 0 ? '#EF4444' : '#94A3B8';
              item.querySelector('.icon-mark').textContent = '○';
            }
          }
        });
      }

      // Update Strength Meter Bar
      if (strengthMeterEl) {
        strengthMeterEl.style.width = `${res.strength.percent}%`;
        strengthMeterEl.style.backgroundColor = res.strength.color;
      }

      // Update Strength Text
      if (strengthTextEl) {
        strengthTextEl.textContent = res.strength.percent > 0 ? res.strength.level : '';
        strengthTextEl.style.color = res.strength.color;
      }

      // Re-verify Confirm Password match if user already typed in confirm input
      if (confirmInput && confirmInput.value.length > 0) {
        updateConfirmMatchUI();
      }

      return res.isValid;
    }

    // Update Confirm Password Matching UI State
    function updateConfirmMatchUI() {
      if (!confirmInput || !matchFeedbackEl) return;
      const pwdVal = passwordInput.value;
      const confirmVal = confirmInput.value;

      // Only show message after the user starts typing
      if (confirmVal.length === 0) {
        matchFeedbackEl.textContent = '';
        matchFeedbackEl.style.display = 'none';
        return;
      }

      matchFeedbackEl.style.display = 'block';
      if (pwdVal === confirmVal && pwdVal.length > 0) {
        matchFeedbackEl.textContent = '✓ Passwords match';
        matchFeedbackEl.style.color = '#10B981';
      } else {
        matchFeedbackEl.textContent = '✗ Passwords do not match';
        matchFeedbackEl.style.color = '#EF4444';
      }
    }

    // Event Listeners for Password Input (Focus, Blur, Input)
    passwordInput.addEventListener('focus', () => {
      const res = evaluatePassword(passwordInput.value);
      if (!res.isValid) showCard();
    });

    passwordInput.addEventListener('input', updatePasswordUI);

    passwordInput.addEventListener('blur', () => {
      if (passwordInput.value.length === 0) {
        hideCard();
        if (successBadge) successBadge.style.display = 'none';
      }
    });

    // Event Listener for Confirm Password Input
    if (confirmInput) {
      confirmInput.addEventListener('input', updateConfirmMatchUI);
      confirmInput.addEventListener('focus', () => {
        if (confirmInput.value.length > 0) updateConfirmMatchUI();
      });
    }

    // Setup Eye Toggles
    setupToggle(togglePasswordBtn, passwordInput);
    if (confirmInput && toggleConfirmBtn) {
      setupToggle(toggleConfirmBtn, confirmInput);
    }
  }

  // Setup Eye Toggle helper
  function setupToggle(btn, input) {
    if (!btn || !input) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentType = input.getAttribute('type');
      if (currentType === 'password') {
        input.setAttribute('type', 'text');
        btn.textContent = '🙈';
        btn.setAttribute('title', 'Hide Password');
      } else {
        input.setAttribute('type', 'password');
        btn.textContent = '👁️';
        btn.setAttribute('title', 'Show Password');
      }
    });
  }

  // Export global PasswordValidator API
  window.PasswordValidator = {
    evaluate: evaluatePassword,
    attachUI: attachUI,
    setupToggle: setupToggle
  };

})();
