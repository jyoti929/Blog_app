/**
 * ==========================================================================
 * REUSABLE BACKEND PASSWORD VALIDATOR (utils/passwordValidator.js)
 * Enforces Password Policy Rules on the Server:
 * ✓ Minimum 8 characters
 * ✓ Maximum 32 characters
 * ✓ At least one uppercase letter (A-Z)
 * ✓ At least one lowercase letter (a-z)
 * ✓ At least one number (0-9)
 * ✓ At least one special character (!@#$%^&*()_+-={}[]:";'<>?,./\|~)
 * ==========================================================================
 */

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 32) {
    return { valid: false, message: 'Password must not exceed 32 characters.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character.' };
  }

  return { valid: true, message: 'Password satisfies all security policy requirements.' };
}

module.exports = {
  validatePassword
};
