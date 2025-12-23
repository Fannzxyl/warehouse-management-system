// --- Unified SHA-256 helper (same semantics as login.js) ---
async function sha256Hex(text) {
    if (window.crypto?.subtle) {
        const enc = new TextEncoder().encode(text);
        const buf = await window.crypto.subtle.digest('SHA-256', enc);
        const arr = Array.from(new Uint8Array(buf));
        return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 0;
    for (let i = 0; i < text.length; i++) {
        h = (h << 5) - h + text.charCodeAt(i);
        h |= 0;
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(8).slice(0, 64);
}

// --- Profile Photo Upload Handler ---
const PROFILE_PHOTO_KEY = 'profilePhoto';

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        window.showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        window.showToast('Image size must be less than 2MB', 'error');
        return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = function (e) {
        const imageData = e.target.result;

        // Update UI
        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('photoPlaceholder');

        if (preview && placeholder) {
            preview.src = imageData;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }

        // Save to localStorage
        try {
            localStorage.setItem(PROFILE_PHOTO_KEY, imageData);
            window.showToast('Profile photo updated!', 'success');
        } catch (e) {
            console.warn('[Profile] Could not save photo to localStorage:', e);
            window.showToast('Photo displayed but could not be saved', 'warning');
        }
    };
    reader.readAsDataURL(file);
}

// Load saved profile photo on page load
function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (savedPhoto) {
        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('photoPlaceholder');

        if (preview && placeholder) {
            preview.src = savedPhoto;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
    }
}

// --- Local storage keys ---
const HASHED_CREDENTIALS_KEY = 'user_credentials';

function initializeCredentials() {
    let credentials = JSON.parse(localStorage.getItem(HASHED_CREDENTIALS_KEY));
    if (!credentials || Object.keys(credentials).length === 0) {
        credentials = {
            'admin@gmail.com': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
            'user@wise.com': 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
            'demo@wise.com': 'f6c5f5b5bd1068cf6d22116e176b6aa6b3bfec21f26a823b692e2ea21d0260b7'
        };
        localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(credentials));
    }
}

function getCredentials() {
    try {
        initializeCredentials();
        return JSON.parse(localStorage.getItem(HASHED_CREDENTIALS_KEY)) || {};
    } catch { return {}; }
}

function saveCredentials(credentials) {
    try { localStorage.setItem(HASHED_CREDENTIALS_KEY, JSON.stringify(credentials)); }
    catch { }
}

// --- NEW: Helper function for password visibility toggle (must be global for onclick) ---
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// --- Main application logic, event listeners, and functions ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const editProfileButton = document.getElementById('editProfileButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const cancelButton = document.getElementById('cancelButton');
    const saveChangesButton = document.getElementById('saveChangesButton');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const changePasswordButton = document.getElementById('changePasswordButton');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordButton = document.getElementById('cancelPasswordButton');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const editModal = document.getElementById('editModal');

    // --- Event Listeners ---
    if (editProfileButton) editProfileButton.addEventListener('click', openEditModal);
    if (closeModalButton) closeModalButton.addEventListener('click', closeEditModal);
    if (cancelButton) cancelButton.addEventListener('click', closeEditModal);
    if (saveChangesButton) saveChangesButton.addEventListener('click', saveChanges);
    if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', goToDashboard);
    if (changePasswordButton) changePasswordButton.addEventListener('click', openChangePasswordModal);
    if (closePasswordModal) closePasswordModal.addEventListener('click', closeChangePasswordModal);
    if (cancelPasswordButton) cancelPasswordButton.addEventListener('click', closeChangePasswordModal);
    if (changePasswordForm) changePasswordForm.addEventListener('submit', handleChangePassword);

    // Load saved profile photo
    loadProfilePhoto();

    // Close modal if clicking outside of it
    if (editModal) editModal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    // --- Edit Profile Functions ---
    function openEditModal() {
        document.getElementById('editUsername').value = document.getElementById('usernameDisplay').textContent;
        document.getElementById('editEmail').value = document.getElementById('emailDisplay').textContent;
        document.getElementById('editPhone').value = document.getElementById('phoneDisplay').textContent;
        document.getElementById('editShift').value = document.getElementById('shiftDisplay').textContent;
        document.getElementById('editLocation').value = document.getElementById('locationDisplay').textContent;

        editModal.classList.remove('hidden');
        editModal.classList.add('flex');

        setTimeout(() => {
            editModal.querySelector('div').classList.remove('scale-95', 'opacity-0');
            editModal.querySelector('div').classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    function closeEditModal() {
        const editModal = document.getElementById('editModal');
        editModal.querySelector('div').classList.remove('scale-100', 'opacity-100');
        editModal.querySelector('div').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            editModal.classList.add('hidden');
            editModal.classList.remove('flex');
        }, 300);
    }

    function saveChanges() {
        document.getElementById('usernameDisplay').textContent = document.getElementById('editUsername').value;
        document.getElementById('emailDisplay').textContent = document.getElementById('editEmail').value;
        document.getElementById('phoneDisplay').textContent = document.getElementById('editPhone').value;
        document.getElementById('shiftDisplay').textContent = document.getElementById('editShift').value;
        document.getElementById('locationDisplay').textContent = document.getElementById('editLocation').value;

        closeEditModal();
        showNotification('Profile updated successfully!', 'success');
    }

    // --- Navigation ---
    function goToDashboard() {
        window.location.href = 'dashboard.html'; // More robust than history.back()
    }

    // --- Change Password Logic & UI ---
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const mismatchError = document.getElementById('passwordMismatchError');
    const savePasswordButton = document.getElementById('savePasswordButton');

    function checkPasswords() {
        const pass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;

        // Check for match
        if (confirmPass && pass !== confirmPass) {
            mismatchError.classList.remove('hidden');
        } else {
            mismatchError.classList.add('hidden');
        }

        // Update strength bar
        let strength = 0;
        if (pass.length >= 6) strength += 1;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength += 1;
        if (pass.match(/[0-9]/)) strength += 1;
        if (pass.match(/[^a-zA-Z0-9]/)) strength += 1;

        const strengthPercentage = (strength / 4) * 100;
        strengthBar.style.width = strengthPercentage + '%';

        if (strength < 2) {
            strengthBar.className = 'h-full bg-red-500 transition-all duration-300';
        } else if (strength < 4) {
            strengthBar.className = 'h-full bg-yellow-500 transition-all duration-300';
        } else {
            strengthBar.className = 'h-full bg-green-500 transition-all duration-300';
        }

        // Enable/disable save button
        savePasswordButton.disabled = !(pass.length >= 6 && pass === confirmPass);
    }

    if (newPasswordInput) newPasswordInput.addEventListener('input', checkPasswords);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', checkPasswords);

    function openChangePasswordModal() {
        const passwordModal = document.getElementById('changePasswordModal');
        passwordModal.classList.remove('hidden');
        passwordModal.classList.add('flex');
        setTimeout(() => {
            passwordModal.querySelector('div').classList.remove('scale-95', 'opacity-0');
            passwordModal.querySelector('div').classList.add('scale-100', 'opacity-100');
        }, 10);
        document.getElementById('currentPassword').value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        checkPasswords(); // Reset strength bar and button state
    }

    function closeChangePasswordModal() {
        const passwordModal = document.getElementById('changePasswordModal');
        passwordModal.querySelector('div').classList.remove('scale-100', 'opacity-100');
        passwordModal.querySelector('div').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            passwordModal.classList.add('hidden');
            passwordModal.classList.remove('flex');
        }, 300);
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        // Check both localStorage and sessionStorage for currentUser
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

        if (!currentUser) {
            showNotification('Error: No user logged in.', 'error');
            closeChangePasswordModal();
            return;
        }
        if (newPassword.length < 6) {
            showNotification('New password must be at least 6 characters long.', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showNotification('New password and confirmation do not match.', 'error');
            return;
        }

        const HASHED_CREDENTIALS = getCredentials();
        const hashedCurrentPassword = await sha256Hex(currentPassword);

        if (hashedCurrentPassword !== HASHED_CREDENTIALS[currentUser]) {
            showNotification('Current password is incorrect.', 'error');
            return;
        }

        const hashedNewPassword = await sha256Hex(newPassword);
        HASHED_CREDENTIALS[currentUser] = hashedNewPassword;
        saveCredentials(HASHED_CREDENTIALS);

        showNotification('Password changed successfully!', 'success');
        closeChangePasswordModal();
    }

    // --- Utility Functions ---
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
});