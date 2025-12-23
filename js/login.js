(function () {
  // === DOM refs ===
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const loginText = document.getElementById('loginText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  // messageBox removed
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
  const backdrop = document.getElementById('backdrop');

  // === Config ===
  const MAX_ATTEMPTS = 5;
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 menit
  const REDIRECT_URL = 'dashboard.html';

  // === Demo credentials (hashed password: SHA-256 hex) ===
  const HASHED_CREDENTIALS_KEY = 'user_credentials';
  // IMPORTANT: Plaintext passwords for testing/demo purposes (TestSprite compatibility)
  const DEMO_PASSWORDS = {
    'admin@gmail.com': '123456',
    'user@wise.com': 'password123',
    'demo@wise.com': 'demo123',
    'alfan': '12345678'
  };
  const DEFAULT_CREDENTIALS = {
    'admin@gmail.com': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
    'user@wise.com': 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // password: password123
    'demo@wise.com': 'f6c5f5b5bd1068cf6d22116e176b6aa6b3bfec21f26a823b692e2ea21d0260b7',  // password: demo123
    'alfan': 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f' // password: 12345678 (SHA-256)
  };

  // Initialize credentials - always ensure they exist in localStorage
  function initializeCredentials() {
    const stored = localStorage.getItem(HASHED_CREDENTIALS_KEY);
    if (!stored) {
      localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      console.log('[Login] Credentials initialized in localStorage');
      return DEFAULT_CREDENTIALS;
    }
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all demo accounts exist
      const merged = { ...DEFAULT_CREDENTIALS, ...parsed };
      localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.error('[Login] Failed to parse credentials, resetting:', e);
      localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
  }

  let HASHED_CREDENTIALS = initializeCredentials();

  function saveCredentials() {
    localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(HASHED_CREDENTIALS));
    console.log('[Login] Credentials saved to localStorage');
  }

  // === Utils ===
  // showMessage and hideMessage functions removed in favor of window.showToast from utils.js

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
    // Use native crypto.subtle API for SHA-256 (consistent with profile.js)
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('[Login] Hash computed using crypto.subtle');
    return hashHex;
  }

  function constantTimeEqual(a, b) {
    if (!a || !b) {
      console.warn('[Login] constantTimeEqual received null/undefined:', { a: !!a, b: !!b });
      return false;
    }
    if (a.length !== b.length) {
      console.log('[Login] Hash length mismatch:', a.length, 'vs', b.length);
      return false;
    }
    let res = 0;
    for (let i = 0; i < a.length; i++) { res |= a.charCodeAt(i) ^ b.charCodeAt(i); }
    return res === 0;
  }

  // === Initialize Form (Remember Me auto-fill) ===
  function initializeForm() {
    // Check if user previously selected "Remember Me"
    const rememberedUser = localStorage.getItem('rememberedUser');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';

    if (rememberedUser && wasRemembered) {
      // Auto-fill username
      if (usernameInput) {
        usernameInput.value = rememberedUser;
        console.log('[Login] Auto-filled remembered username:', rememberedUser);
      }
      // Check the Remember Me checkbox
      if (rememberMeInput) {
        rememberMeInput.checked = true;
      }
      // Focus on password field for quick login
      if (passwordInput) {
        passwordInput.focus();
      }
    } else {
      // Focus on username field
      if (usernameInput) {
        usernameInput.focus();
      }
    }

    console.log('[Login] Form initialized. Remember Me:', wasRemembered);
  }

  // === Handlers ===
  async function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log('[Login] handleLogin called');

    if (loginButton.disabled) {
      console.log('[Login] Button disabled, returning');
      return;
    }
    if (honeypot && honeypot.value) {
      window.showToast('Request blocked.', 'error');
      console.log('[Login] Honeypot detected');
      return;
    }
    // hideMessage() call removed

    const left = remainingCooldownMs();
    if (left > 0) {
      window.showToast(`Too many attempts. Try again in ${formatMs(left)}.`, 'error');
      console.log('[Login] Rate limited, cooldown remaining:', left);
      return;
    }
    if (getAttempts() >= MAX_ATTEMPTS) {
      setCooldownUntil(getNow() + COOLDOWN_MS);
      setAttempts(0);
      window.showToast(`Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`, 'error');
      console.log('[Login] Max attempts reached, setting cooldown');
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    console.log('[Login] Validating form for user:', username);

    const validationErrors = validateForm(username, password);
    if (validationErrors.length > 0) {
      window.showToast(validationErrors[0], 'error');
      console.log('[Login] Validation errors:', validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Small delay for UX
      await new Promise(r => setTimeout(r, 300));

      // Reload credentials in case they were updated
      HASHED_CREDENTIALS = initializeCredentials();

      console.log('[Login] Available credentials:', Object.keys(HASHED_CREDENTIALS));

      // Try both lowercase and original case
      const usernameLower = username.toLowerCase();
      let storedHash = HASHED_CREDENTIALS[usernameLower];
      if (!storedHash) {
        storedHash = HASHED_CREDENTIALS[username];
      }

      console.log('[Login] Attempting login for:', username);
      console.log('[Login] Username (lowercase):', usernameLower);
      console.log('[Login] Stored hash exists:', !!storedHash);

      if (!storedHash) {
        console.log('[Login] No credential found for this email');
        const tries = getAttempts() + 1;
        setAttempts(tries);
        setLoading(false);
        window.showToast(`Invalid username/email or password. Attempts left: ${MAX_ATTEMPTS - tries}.`, 'error');
        return;
      }

      // Compute password hash synchronously using fallback
      const passHash = await sha256Hex(password);

      console.log('[Login] Password hash:', passHash);
      console.log('[Login] Stored hash:', storedHash);
      console.log('[Login] Hashes match:', passHash === storedHash);

      // Primary authentication: hash comparison
      let ok = typeof storedHash === 'string' &&
        storedHash.length === 64 &&
        constantTimeEqual(passHash, storedHash);

      console.log('[Login] Hash authentication result:', ok);
      // Note: Fallback authentication removed - only hashed passwords are valid now

      console.log('[Login] Final authentication result:', ok);

      if (ok) {
        console.log('[Login] Authentication successful!');
        window.showToast('Login Successful! Welcome to your dashboard', 'success');

        // Store session info - use correct keys that auth-guard.js expects
        try {
          const rememberMe = rememberMeInput?.checked || false;
          localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

          if (rememberMe) {
            // Remember Me checked: store auth in localStorage (persists across tabs/reloads)
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authUser', username);
            localStorage.setItem('rememberedUser', username);
            console.log('[Login] Auth stored in localStorage (Remember Me enabled)');
          } else {
            // Remember Me NOT checked: store auth in sessionStorage (session only)
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('authUser', username);
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authUser');
            console.log('[Login] Auth stored in sessionStorage (session only)');
          }
        } catch (storageErr) {
          console.error('[Login] Storage error:', storageErr);
        }

        resetRateLimit();

        // Redirect with proper delay
        console.log('[Login] Redirecting to:', REDIRECT_URL);
        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 800);
      } else {
        console.log('[Login] Authentication failed - password mismatch');
        const tries = getAttempts() + 1;
        setAttempts(tries);
        if (tries >= MAX_ATTEMPTS) {
          setCooldownUntil(getNow() + COOLDOWN_MS);
          setAttempts(0);
          window.showToast(`Too many attempts. Try again in ${formatMs(COOLDOWN_MS)}.`, 'error');
        } else {
          window.showToast(`Invalid username/email or password. Attempts left: ${MAX_ATTEMPTS - tries}.`, 'error');
        }
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      console.error('[Login] Error stack:', err.stack);
      window.showToast('An error occurred during login. Please try again.', 'error');
    } finally {
      setLoading(false);
      console.log('[Login] handleLogin completed');
    }
  }

  // --- Forgot Password Logic (SIMPLIFIED & UPDATED) ---
  function openForgotPasswordModal(e) {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
    forgotPasswordModal.classList.add('flex');
    requestAnimationFrame(() => {
      backdrop.classList.add('backdrop-enter-active');
      const card = forgotPasswordModal.querySelector('[role="dialog"]');
      card.classList.add('modal-enter-active');
    });
    document.body.style.overflow = 'hidden';
    // hideMessage() removed
  }

  function closeForgotPasswordModal() {
    backdrop.classList.remove('backdrop-enter-active');
    const card = forgotPasswordModal.querySelector('[role="dialog"]');
    card.classList.remove('modal-enter-active');
    setTimeout(() => {
      forgotPasswordModal.classList.add('hidden');
      forgotPasswordModal.classList.remove('flex');
      document.body.style.overflow = '';
    }, 160);
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

    window.showToast("Your request has been prepared. Please confirm it in your email client.", 'success');
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
  function onInputChange() { /* hideMessage removed */ }
  function togglePasswordVisibility() {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.setAttribute('aria-pressed', String(isHidden));
    togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    // Toggle icon class instead of replacing innerHTML to avoid reflow/repaint
    const icon = togglePasswordBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    }
  }

  // Wire up
  loginForm.addEventListener('submit', handleLogin);
  [usernameInput, passwordInput].forEach(el => el.addEventListener('input', onInputChange));
  if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

  // Forgot password event listeners (UPDATED)
  forgotPasswordLink.addEventListener('click', openForgotPasswordModal);
  closeForgotModalButton.addEventListener('click', closeForgotPasswordModal);
  forgotPasswordModal.addEventListener('click', (e) => {
    // Close modal if clicking on the overlay background or backdrop, but not on the dialog content
    const dialog = forgotPasswordModal.querySelector('[role="dialog"]');
    if (e.target === forgotPasswordModal || e.target === backdrop || (dialog && !dialog.contains(e.target))) {
      closeForgotPasswordModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !forgotPasswordModal.classList.contains('hidden')) closeForgotPasswordModal();
  });
  forgotForm.addEventListener('submit', handleForgotSubmit);

  document.addEventListener('DOMContentLoaded', initializeForm);
  window.addEventListener('resize', onResize);
})();
