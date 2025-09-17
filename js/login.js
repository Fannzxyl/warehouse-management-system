(function () {
  // === DOM refs ===
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const loginText = document.getElementById('loginText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const messageBox = document.getElementById('message-box');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeInput = document.getElementById('remember-me');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeOpen = document.getElementById('eye-open');
  const eyeClosed = document.getElementById('eye-closed');
  const honeypot = document.getElementById('company');

  // Forgot password refs (UPDATED)
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeForgotModalButton = document.getElementById('closeForgotModal');
  const forgotForm = document.getElementById('forgotForm'); // New form reference

  // === Config ===
  const MAX_ATTEMPTS = 5;
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 menit
  const REDIRECT_URL = 'dashboard.html';

  // === Demo credentials (hashed password: SHA-256 hex) ===
  const HASHED_CREDENTIALS_KEY = 'user_credentials';
  let HASHED_CREDENTIALS = JSON.parse(localStorage.getItem(HASHED_CREDENTIALS_KEY)) || {
    'admin@gmail.com': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
    'user@wise.com':   'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // password: password123
    'demo@wise.com':   'f6c5f5b5bd1068cf6d22116e176b6aa6b3bfec21f26a823b692e2ea21d0260b7' // password: demo123
  };

  function saveCredentials() {
    localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(HASHED_CREDENTIALS));
  }

  // === Utils ===
  function showMessage(type, message) {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'success', 'error');
    messageBox.classList.add(type, 'show');
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(hideMessage, 5000);
  }
  function hideMessage() {
    messageBox.classList.remove('show');
  }
  function setLoading(isLoading) {
    loginButton.disabled = isLoading;
    loginText.textContent = isLoading ? 'Logging in...' : 'Log In';
    loadingSpinner.classList.toggle('hidden', !isLoading);
  }
  function emailLike(str) {
    if (str.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str);
    }
    return str.length >= 3;
  }
  function validateForm(username, password) {
    const errors = [];
    if (!username.trim()) errors.push('Username/email is required');
    else if (!emailLike(username.trim())) errors.push('Invalid email/username format');
    if (!password.trim()) errors.push('Password is required');
    else if (password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  }
  function getNow() { return Date.now(); }

  // Rate limit (localStorage)
  const RL_KEYS = { ATTEMPTS: 'login_attempts', COOLDOWN_UNTIL: 'login_cooldown_until' };
  function getAttempts() { return parseInt(localStorage.getItem(RL_KEYS.ATTEMPTS) || '0', 10); }
  function setAttempts(n) { localStorage.setItem(RL_KEYS.ATTEMPTS, String(n)); }
  function getCooldownUntil() { return parseInt(localStorage.getItem(RL_KEYS.COOLDOWN_UNTIL) || '0', 10); }
  function setCooldownUntil(ts) { localStorage.setItem(RL_KEYS.COOLDOWN_UNTIL, String(ts)); }
  function resetRateLimit() { setAttempts(0); setCooldownUntil(0); }
  function remainingCooldownMs() {
    const until = getCooldownUntil();
    const left = until - getNow();
    return left > 0 ? left : 0;
  }
  function formatMs(ms) {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}m ${r}s` : `${r}s`;
  }

  async function sha256Hex(text) {
    if (window.crypto?.subtle) {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (h << 5) - h + text.charCodeAt(i); h |= 0;
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(8).slice(0, 64);
  }
  function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let res = 0;
    for (let i = 0; i < a.length; i++) { res |= a.charCodeAt(i) ^ b.charCodeAt(i); }
    return res === 0;
  }

  // === Handlers ===
  async function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loginButton.disabled) return;
    if (honeypot && honeypot.value) { showMessage('error', 'Request blocked.'); return; }
    hideMessage();

    const left = remainingCooldownMs();
    if (left > 0) { showMessage('error', `Too many attempts. Try again in ${formatMs(left)}.`); return; }
    if (getAttempts() >= MAX_ATTEMPTS) {
      setCooldownUntil(getNow() + COOLDOWN_MS);
      setAttempts(0);
      showMessage('error', `Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`);
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const validationErrors = validateForm(username, password);
    if (validationErrors.length > 0) { showMessage('error', validationErrors[0]); return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const storedHash = HASHED_CREDENTIALS[username];
      const passHash = await sha256Hex(password);
      const ok = typeof storedHash === 'string' && constantTimeEqual(passHash, storedHash);

      if (ok) {
        showMessage('success', `Welcome back, ${username}!`);
        localStorage.setItem('rememberMe', rememberMeInput?.checked ? 'true' : 'false');
        if (rememberMeInput?.checked) localStorage.setItem('rememberedUser', username);
        else localStorage.removeItem('rememberedUser');
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', username);
        resetRateLimit();
        setTimeout(() => { window.location.href = REDIRECT_URL; }, 900);
      } else {
        const tries = getAttempts() + 1;
        setAttempts(tries);
        if (tries >= MAX_ATTEMPTS) {
          setCooldownUntil(getNow() + COOLDOWN_MS);
          setAttempts(0);
          showMessage('error', `Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`);
        } else {
          showMessage('error', `Invalid username/email or password. Attempts left: ${MAX_ATTEMPTS - tries}.`);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      showMessage('error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // --- Forgot Password Logic (SIMPLIFIED & UPDATED) ---
  function openForgotPasswordModal(e) {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
    forgotPasswordModal.classList.add('flex');
    // Animate the modal appearance
    setTimeout(() => {
        forgotPasswordModal.querySelector('div').style.transform = 'scale(1)';
        forgotPasswordModal.querySelector('div').style.opacity = '1';
    }, 10);
    hideMessage();
  }

  function closeForgotPasswordModal() {
    forgotPasswordModal.querySelector('div').style.transform = 'scale(0.95)';
    forgotPasswordModal.querySelector('div').style.opacity = '0';
    setTimeout(() => {
        forgotPasswordModal.classList.add('hidden');
        forgotPasswordModal.classList.remove('flex');
    }, 300);
  }

  function handleForgotSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    const admin = document.getElementById('adminEmail').value.trim();
    const reason = document.getElementById('reason').value.trim() || 'No reason provided';

    // Create a mailto link
    const subject = encodeURIComponent(`WISE Password Reset Request from ${email}`);
    const body = encodeURIComponent(`User: ${email}\nReason: ${reason}\n\nPlease assist with password reset.`);
    window.location.href = `mailto:${admin}?subject=${subject}&body=${body}`;

    showMessage('success', "Your request has been prepared. Please confirm it in your email client.");
    closeForgotPasswordModal();
  }

  // --- Initializers & Events ---
  function initializeForm() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    if (rememberedUser && shouldRemember) {
      usernameInput.value = rememberedUser;
      if (rememberMeInput) rememberMeInput.checked = true;
      passwordInput.focus();
    } else {
      usernameInput.focus();
    }
    onResize();
  }
  function onResize() { document.body.style.overflow = window.innerWidth < 768 ? 'auto' : 'hidden'; }
  function onInputChange() { hideMessage(); }
  function togglePasswordVisibility() {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.setAttribute('aria-pressed', String(isHidden));
    togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    eyeOpen.classList.toggle('hidden', isHidden);
    eyeClosed.classList.toggle('hidden', !isHidden);
  }

  // Wire up
  loginForm.addEventListener('submit', handleLogin);
  [usernameInput, passwordInput].forEach(el => el.addEventListener('input', onInputChange));
  if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

  // Forgot password event listeners (UPDATED)
  forgotPasswordLink.addEventListener('click', openForgotPasswordModal);
  closeForgotModalButton.addEventListener('click', closeForgotPasswordModal);
  forgotPasswordModal.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) closeForgotPasswordModal();
  });
  forgotForm.addEventListener('submit', handleForgotSubmit);

  document.addEventListener('DOMContentLoaded', initializeForm);
  window.addEventListener('resize', onResize);
})();