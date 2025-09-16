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

  // === Config ===
  const MAX_ATTEMPTS = 5;
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 menit
  const REDIRECT_URL = 'dashboard.html';

  // === Demo credentials (hashed password: SHA-256 hex) ===
  // password map:
  // admin@gmail.com -> 123456
  // user@wise.com   -> password123
  // demo@wise.com   -> demo123
  const HASHED_CREDENTIALS = {
    'admin@gmail.com': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    'user@wise.com':   'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    'demo@wise.com':   'f6c5f5b5bd1068cf6d22116e176b6aa6b3bfec21f26a823b692e2ea21d0260b7'
  };

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
    messageBox.classList.add('hidden');
  }
  function setLoading(isLoading) {
    if (isLoading) {
      loginButton.disabled = true;
      loginText.textContent = 'Logging in...';
      loadingSpinner.classList.remove('hidden');
    } else {
      loginButton.disabled = false;
      loginText.textContent = 'Log In';
      loadingSpinner.classList.add('hidden');
    }
  }
  function emailLike(str) {
    // sederhana: izinkan username biasa atau email
    // kalau email, cek format dasar
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
  const RL_KEYS = {
    ATTEMPTS: 'login_attempts',
    COOLDOWN_UNTIL: 'login_cooldown_until'
  };
  function getAttempts() {
    return parseInt(localStorage.getItem(RL_KEYS.ATTEMPTS) || '0', 10);
  }
  function setAttempts(n) {
    localStorage.setItem(RL_KEYS.ATTEMPTS, String(n));
  }
  function getCooldownUntil() {
    return parseInt(localStorage.getItem(RL_KEYS.COOLDOWN_UNTIL) || '0', 10);
  }
  function setCooldownUntil(ts) {
    localStorage.setItem(RL_KEYS.COOLDOWN_UNTIL, String(ts));
  }
  function resetRateLimit() {
    setAttempts(0);
    setCooldownUntil(0);
  }

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
    // fallback (tidak ideal, tapi tetap jalan)
    // simple hash (bukan SHA-256) hanya untuk demo: jangan gunakan di produksi
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(8).slice(0, 64);
  }

  function constantTimeEqual(a, b) {
    // samakan panjang
    if (a.length !== b.length) return false;
    let res = 0;
    for (let i = 0; i < a.length; i++) {
      res |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return res === 0;
  }

  // === Handlers ===
  async function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    if (loginButton.disabled) return;

    // Honeypot filled? block
    if (honeypot && honeypot.value) {
      showMessage('error', 'Request blocked.');
      return;
    }

    hideMessage();

    // Rate-limit checks
    const left = remainingCooldownMs();
    if (left > 0) {
      showMessage('error', `Too many attempts. Try again in ${formatMs(left)}.`);
      return;
    }
    if (getAttempts() >= MAX_ATTEMPTS) {
      setCooldownUntil(getNow() + COOLDOWN_MS);
      setAttempts(0);
      showMessage('error', `Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`);
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const validationErrors = validateForm(username, password);
    if (validationErrors.length > 0) {
      showMessage('error', validationErrors[0]);
      return;
    }

    setLoading(true);
    try {
      // simulasi delay
      await new Promise(r => setTimeout(r, 500));

      const storedHash = HASHED_CREDENTIALS[username];
      const passHash = await sha256Hex(password);

      const ok = typeof storedHash === 'string' && constantTimeEqual(passHash, storedHash);

      if (ok) {
        showMessage('success', `Welcome back, ${username}!`);

        // Remember me
        if (rememberMeInput?.checked) {
          localStorage.setItem('rememberedUser', username);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedUser');
          localStorage.removeItem('rememberMe');
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', username);

        resetRateLimit();

        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 900);
      } else {
        const tries = getAttempts() + 1;
        setAttempts(tries);

        if (tries >= MAX_ATTEMPTS) {
          setCooldownUntil(getNow() + COOLDOWN_MS);
          setAttempts(0);
          showMessage('error', `Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`);
        } else {
          const left = MAX_ATTEMPTS - tries;
          showMessage('error', `Invalid username/email or password. Attempts left: ${left}.`);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      showMessage('error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function initializeForm() {
    // Prefill remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    if (rememberedUser && shouldRemember) {
      usernameInput.value = rememberedUser;
      if (rememberMeInput) rememberMeInput.checked = true;
      passwordInput.focus();
    } else {
      usernameInput.focus();
    }

    // Responsif scroll lock seperti versi sebelumnya
    const isMobile = window.innerWidth < 768;
    document.body.style.overflow = isMobile ? 'auto' : 'hidden';
  }

  function onResize() {
    const isMobile = window.innerWidth < 768;
    document.body.style.overflow = isMobile ? 'auto' : 'hidden';
  }

  function onInputChange() {
    hideMessage();
  }

  function togglePasswordVisibility() {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.setAttribute('aria-pressed', String(isHidden));
    togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    eyeOpen.classList.toggle('hidden', isHidden);
    eyeClosed.classList.toggle('hidden', !isHidden);
  }

  // === Wire up ===
  loginForm.addEventListener('submit', handleLogin);
  usernameInput.addEventListener('input', onInputChange);
  passwordInput.addEventListener('input', onInputChange);

  // Enter → pindah fokus / submit
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInput.focus();
    }
  });
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!loginButton.disabled) loginForm.dispatchEvent(new Event('submit'));
    }
  });

  // Toggle password via button (bukan inline onclick)
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }

  document.addEventListener('DOMContentLoaded', initializeForm);
  window.addEventListener('resize', onResize);
})();
