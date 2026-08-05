/* Shared interactions and client-side validation for My Blog. */
document.addEventListener('DOMContentLoaded', () => {
  const getGroup = (field) => field.closest('.form-group');
  const setError = (field, message) => {
    const group = getGroup(field);
    if (!group) return;
    group.querySelector('.error-message').textContent = message;
    field.classList.toggle('error', Boolean(message));
  };
  const clearErrors = (form) => form.querySelectorAll('.error-message').forEach((item) => (item.textContent = ''));
  const emailIsValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Mobile navigation on the home page.
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Filters home-page cards by title, category, or hidden keywords.
  const searchInput = document.querySelector('#blog-search');
  if (searchInput) {
    const cards = [...document.querySelectorAll('.blog-card')];
    const emptyState = document.querySelector('#empty-search');
    const status = document.querySelector('#search-status');
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.trim().toLowerCase();
      const matches = cards.filter((card) => {
        const matchesSearch = card.dataset.search.includes(term);
        card.hidden = !matchesSearch;
        return matchesSearch;
      });
      emptyState.hidden = matches.length !== 0;
      status.textContent = term ? `${matches.length} article${matches.length === 1 ? '' : 's'} found` : '';
    });
  }

  // Reusable show/hide password control.
  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const revealing = input.type === 'password';
      input.type = revealing ? 'text' : 'password';
      button.textContent = revealing ? 'Hide' : 'Show';
      button.setAttribute('aria-label', `${revealing ? 'Hide' : 'Show'} password`);
      button.setAttribute('aria-pressed', revealing);
    });
  });

  // Login form validation.
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(loginForm);
      const email = loginForm.elements.email;
      const password = loginForm.elements.password;
      let valid = true;
      if (!email.value.trim()) { setError(email, 'Email address is required.'); valid = false; }
      else if (!emailIsValid(email.value.trim())) { setError(email, 'Enter a valid email address.'); valid = false; }
      if (!password.value) { setError(password, 'Password is required.'); valid = false; }
      if (valid) {
        const submitButton = loginForm.querySelector('[type="submit"]');
        loginForm.querySelector('.form-success').textContent = 'Login successful! Redirecting to your dashboard…';
        submitButton.disabled = true;
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
      }
    });
  }

  // Registration validation, including matching passwords.
  const registerForm = document.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(registerForm);
      const name = registerForm.elements.fullName;
      const email = registerForm.elements.email;
      const password = registerForm.elements.password;
      const confirmPassword = registerForm.elements.confirmPassword;
      const terms = registerForm.elements.terms;
      let valid = true;
      if (!name.value.trim()) { setError(name, 'Full name is required.'); valid = false; }
      if (!email.value.trim()) { setError(email, 'Email address is required.'); valid = false; }
      else if (!emailIsValid(email.value.trim())) { setError(email, 'Enter a valid email address.'); valid = false; }
      if (!password.value) { setError(password, 'Password is required.'); valid = false; }
      else if (password.value.length < 6) { setError(password, 'Use at least 6 characters.'); valid = false; }
      if (!confirmPassword.value) { setError(confirmPassword, 'Please confirm your password.'); valid = false; }
      else if (confirmPassword.value !== password.value) { setError(confirmPassword, 'Passwords do not match.'); valid = false; }
      if (!terms.checked) { registerForm.querySelector('.terms-error').textContent = 'Please accept the terms to continue.'; valid = false; }
      if (valid) {
        const submitButton = registerForm.querySelector('[type="submit"]');
        registerForm.querySelector('.form-success').textContent = 'Account created successfully! Redirecting to login…';
        submitButton.disabled = true;
        setTimeout(() => { window.location.href = 'login.html'; }, 700);
      }
    });
  }

  // Create post validation and live character counter.
  const createForm = document.querySelector('#create-blog-form');
  if (createForm) {
    const title = createForm.elements.title;
    const category = createForm.elements.category;
    const content = createForm.elements.content;
    const counter = document.querySelector('#char-count');
    const updateCount = () => { counter.textContent = `${content.value.length.toLocaleString()} / 2,000`; };
    content.addEventListener('input', updateCount);
    createForm.addEventListener('reset', () => setTimeout(() => { clearErrors(createForm); updateCount(); createForm.querySelector('.publish-success').textContent = ''; }, 0));
    createForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(createForm);
      let valid = true;
      if (!title.value.trim()) { setError(title, 'A blog title is required.'); valid = false; }
      if (!category.value) { setError(category, 'Please select a category.'); valid = false; }
      if (!content.value.trim()) { setError(content, 'Blog content cannot be empty.'); valid = false; }
      else if (content.value.trim().length < 30) { setError(content, 'Write at least 30 characters before publishing.'); valid = false; }
      if (valid) {
        createForm.querySelector('.publish-success').textContent = 'Your blog post has been published successfully!';
        document.querySelector('#save-status').textContent = 'Published';
        alert('Success! Your blog post has been published.');
      }
    });
  }

  // Mobile sidebar on dashboard and editor pages.
  const dashboardMenu = document.querySelector('.dashboard-menu');
  const sidebar = document.querySelector('.sidebar');
  if (dashboardMenu && sidebar) {
    dashboardMenu.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      dashboardMenu.setAttribute('aria-expanded', isOpen);
    });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = new Date().getFullYear();
});
