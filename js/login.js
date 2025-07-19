document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const loginText = document.getElementById('loginText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const messageBox = document.getElementById('message-box');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    const LOGIN_CREDENTIALS = {
        'admin@gmail.com': '123456',
        'user@wise.com': 'password123',
        'demo@wise.com': 'demo123'
    };

    /**
     * Menampilkan pesan notifikasi (sukses atau error).
     * @param {'success' | 'error'} type
     * @param {string} message 
     */
    function showMessage(type, message) {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'success', 'error');
        messageBox.classList.add(type, 'show');
        setTimeout(hideMessage, 5000);
    }

    /**
     * Menyembunyikan pesan notifikasi.
     */
    function hideMessage() {
        messageBox.classList.remove('show');
    }

    /**
     * Mengatur status loading pada tombol login.
     * @param {boolean} isLoading
     */
    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loadingSpinner.classList.toggle('hidden', !isLoading);
        loginText.textContent = isLoading ? 'Logging in...' : 'Log In';
    }

    /**
     * Memvalidasi input form login.
     * @param {string} username 
     * @param {string} password 
     * @returns {string[]}
     */
    function validateForm(username, password) {
        const errors = [];
        if (!username.trim()) {
            errors.push('Username or email is required');
        }
        if (!password.trim()) {
            errors.push('Password is required');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        return errors;
    }
    
    function togglePasswordVisibility() {
        const eyeOpen = document.getElementById('eye-open');
        const eyeClosed = document.getElementById('eye-closed');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    }

    /**
     * Menangani proses submit form login.
     * @param {Event} event 
     */
    async function handleLogin(event) {
        event.preventDefault();
        event.stopPropagation();

        if (loginButton.disabled) return;

        hideMessage();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember-me').checked;

        const validationErrors = validateForm(username, password);
        if (validationErrors.length > 0) {
            showMessage('error', validationErrors[0]);
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            if (LOGIN_CREDENTIALS[username] === password) {
                showMessage('success', `Welcome back, ${username}!`);
                
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', username);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedUser');
                    localStorage.removeItem('rememberMe');
                }

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', username);

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);

            } else {
                showMessage('error', 'Invalid username/email or password. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('error', 'An error occurred during login. Please try again.');
            setLoading(false);
        }
    }

    function initializeForm() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        const shouldRemember = localStorage.getItem('rememberMe') === 'true';

        if (rememberedUser && shouldRemember) {
            usernameInput.value = rememberedUser;
            document.getElementById('remember-me').checked = true;
            passwordInput.focus();
        } else {
            usernameInput.focus();
        }
    }

    loginForm.addEventListener('submit', handleLogin);
    usernameInput.addEventListener('input', hideMessage);
    passwordInput.addEventListener('input', hideMessage);
    passwordToggleIcon.addEventListener('click', togglePasswordVisibility);

    initializeForm();
});