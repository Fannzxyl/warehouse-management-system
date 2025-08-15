(function() {

    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const loginText = document.getElementById('loginText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const messageBox = document.getElementById('message-box');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const LOGIN_CREDENTIALS = {
        'admin@gmail.com': '123456',
        'user@wise.com': 'password123',
        'demo@wise.com': 'demo123'
    };

    function showMessage(type, message) {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'success', 'error');
        messageBox.classList.add(type, 'show');

        setTimeout(() => {
            hideMessage();
        }, 5000);
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

    function validateForm(username, password) {
        const errors = [];

        if (!username.trim()) {
            errors.push('Username/email is required');
        }

        if (!password.trim()) {
            errors.push('Password is required');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return errors;
    }

    async function handleLogin(event) {
        event.preventDefault();
        event.stopPropagation();

        if (loginButton.disabled) {
            return;
        }

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

            const isValidCredentials = LOGIN_CREDENTIALS[username] === password;

            if (isValidCredentials) {
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
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('error', 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
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

    function initializeForm() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        const shouldRemember = localStorage.getItem('rememberMe') === 'true';

        if (rememberedUser && shouldRemember) {
            usernameInput.value = rememberedUser;
            document.getElementById('remember-me').checked = true;
        }

        if (!usernameInput.value) {
            usernameInput.focus();
        } else {
            passwordInput.focus();
        }
    }

    loginForm.addEventListener('submit', handleLogin);

    usernameInput.addEventListener('input', hideMessage);
    passwordInput.addEventListener('input', hideMessage);

    usernameInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!loginButton.disabled) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    document.addEventListener('DOMContentLoaded', initializeForm);

    window.addEventListener('resize', function () {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    });

    window.togglePasswordVisibility = togglePasswordVisibility;

})();
zz