/**
 * WISE Warehouse Management System
 * Authentication Guard (TestSprite Compliant)
 * =====================================================
 * - Melindungi halaman yang membutuhkan autentikasi
 * - Support session & remember-me
 * - Aman terhadap reload (TestSprite friendly)
 *
 * Protected pages:
 * - dashboard.html
 * - configuration.html
 * - profile.html
 */

(function () {
  'use strict';

  console.log('[AuthGuard] Initializing authentication guard');

  // =====================================================
  // 1. AUTH STATE CHECK (SINGLE SOURCE OF TRUTH)
  // =====================================================
  const sessionAuth =
    sessionStorage.getItem('isAuthenticated') === 'true';

  const localAuth =
    localStorage.getItem('isAuthenticated') === 'true';

  const isAuthenticated = sessionAuth || localAuth;

  const currentUser =
    sessionStorage.getItem('authUser') ||
    localStorage.getItem('authUser');

  console.log('[AuthGuard] sessionAuth:', sessionAuth);
  console.log('[AuthGuard] localAuth:', localAuth);
  console.log('[AuthGuard] currentUser:', currentUser);

  // =====================================================
  // 2. BLOCK UNAUTHENTICATED ACCESS (CRITICAL)
  // =====================================================
  if (!isAuthenticated || !currentUser) {
    console.warn('[AuthGuard] ACCESS DENIED – redirecting to login');

    // Simpan alasan redirect (untuk UX / test)
    sessionStorage.setItem('authRedirectReason', 'unauthenticated');

    // Simpan halaman tujuan (optional)
    const page = window.location.pathname.split('/').pop();
    if (page && page !== 'login.html') {
      sessionStorage.setItem('redirectAfterLogin', page);
    }

    // HARD REDIRECT (blocking)
    window.location.replace('login.html');
    return;
  }

  console.log('[AuthGuard] Access granted for user:', currentUser);

  // =====================================================
  // 3. EXPOSE LOGOUT HANDLER (GLOBAL)
  // =====================================================
  window.handleLogout = function () {
    console.log('[AuthGuard] Logging out:', currentUser);

    // Clear ALL auth states
    sessionStorage.clear();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authUser');
    localStorage.removeItem('rememberMe');

    window.location.replace('login.html');
  };

  // =====================================================
  // 4. UPDATE USERNAME IN UI
  // =====================================================
  document.addEventListener('DOMContentLoaded', function () {
    const userLabel = document.getElementById('username-display');
    if (userLabel) {
      // Check for stored display name first, then fallback to extracting from email
      let displayName = sessionStorage.getItem('authDisplayName') ||
        localStorage.getItem('authDisplayName');

      if (!displayName && currentUser) {
        // Extract name from email (e.g., "demo@wise.com" -> "demo")
        if (currentUser.includes('@')) {
          displayName = currentUser.split('@')[0];
        } else {
          displayName = currentUser;
        }
        // Capitalize first letter
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      userLabel.textContent = displayName || currentUser || 'User';
      console.log('[AuthGuard] Username display set to:', displayName);
    }
  });

})();
