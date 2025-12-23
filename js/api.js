/**
 * WISE Warehouse Management System - API Service Layer
 * =====================================================
 * File ini adalah "jembatan" antara Frontend dan Backend.
 * 
 * UNTUK TIM PYTHON:
 * - Ganti BASE_URL dengan URL server Python kalian
 * - Setiap function di sini siap diganti dengan fetch() ke API
 * - Semua response harus mengikuti format yang sudah didefinisikan
 * 
 * CURRENT MODE: Mock/LocalStorage (untuk development tanpa backend)
 * PRODUCTION MODE: Ubah USE_MOCK_API = false dan implementasi fetch()
 * =====================================================
 */

(function () {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    const CONFIG = {
        // Set false untuk production dengan backend Python
        USE_MOCK_API: true,

        // URL Backend Python (ganti sesuai deployment)
        BASE_URL: 'http://localhost:5000/api',

        // Timeout untuk fetch requests (ms)
        REQUEST_TIMEOUT: 10000,

        // LocalStorage keys
        STORAGE_KEYS: {
            CREDENTIALS: 'user_credentials',
            CURRENT_USER: 'currentUser',
            REMEMBER_ME: 'rememberMe',
            USER_PROFILE: 'userProfile'
        }
    };

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * SHA-256 Hash untuk password
     * @param {string} text - Plain text password
     * @returns {Promise<string>} - Hashed password (hex)
     */
    async function sha256(text) {
        if (window.crypto?.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback untuk browser lama (tidak recommended untuk production)
        console.warn('[API] crypto.subtle not available, using fallback hash');
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        return ('00000000' + (hash >>> 0).toString(16)).slice(-8).repeat(8).slice(0, 64);
    }

    /**
     * Simulate network delay (untuk mock API)
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Standard API response wrapper
     */
    function createResponse(success, data = null, error = null) {
        return { success, data, error, timestamp: new Date().toISOString() };
    }

    // =========================================================================
    // AUTHENTICATION API
    // =========================================================================

    const AuthAPI = {
        /**
         * Login user
         * @param {string} username - Username atau email
         * @param {string} password - Plain text password
         * @param {boolean} rememberMe - Persist session
         * @returns {Promise<{success: boolean, data: object|null, error: string|null}>}
         * 
         * PYTHON ENDPOINT: POST /api/auth/login
         * REQUEST BODY: { "username": "...", "password": "..." }
         * RESPONSE: { "success": true, "data": { "user": {...}, "token": "..." } }
         */
        async login(username, password, rememberMe = false) {
            if (CONFIG.USE_MOCK_API) {
                return this._mockLogin(username, password, rememberMe);
            }

            // Production: fetch ke Python backend
            try {
                const response = await fetch(`${CONFIG.BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();

                if (result.success && rememberMe) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, username);
                }

                return result;
            } catch (err) {
                return createResponse(false, null, 'Network error: ' + err.message);
            }
        },

        /**
         * Mock login (development only)
         */
        async _mockLogin(username, password, rememberMe) {
            await delay(300); // Simulate network

            const credentials = this._getStoredCredentials();
            const hashedPassword = await sha256(password);

            if (credentials[username] && credentials[username] === hashedPassword) {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, username);

                return createResponse(true, {
                    user: { username, role: 'user' },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }

            return createResponse(false, null, 'Invalid username or password');
        },

        /**
         * Logout user
         * PYTHON ENDPOINT: POST /api/auth/logout
         */
        async logout() {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
            sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);

            if (!CONFIG.USE_MOCK_API) {
                try {
                    await fetch(`${CONFIG.BASE_URL}/auth/logout`, { method: 'POST' });
                } catch (err) {
                    console.warn('[API] Logout request failed:', err);
                }
            }

            return createResponse(true);
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated() {
            return !!(localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER) ||
                sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER));
        },

        /**
         * Get current user
         */
        getCurrentUser() {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER) ||
                sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        },

        /**
         * Change password
         * PYTHON ENDPOINT: POST /api/auth/change-password
         * REQUEST: { "currentPassword": "...", "newPassword": "..." }
         */
        async changePassword(currentPassword, newPassword) {
            const username = this.getCurrentUser();
            if (!username) {
                return createResponse(false, null, 'No user logged in');
            }

            if (CONFIG.USE_MOCK_API) {
                return this._mockChangePassword(username, currentPassword, newPassword);
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/auth/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                return await response.json();
            } catch (err) {
                return createResponse(false, null, 'Network error: ' + err.message);
            }
        },

        async _mockChangePassword(username, currentPassword, newPassword) {
            await delay(200);

            const credentials = this._getStoredCredentials();
            const hashedCurrent = await sha256(currentPassword);

            if (credentials[username] !== hashedCurrent) {
                return createResponse(false, null, 'Current password is incorrect');
            }

            const hashedNew = await sha256(newPassword);
            credentials[username] = hashedNew;
            localStorage.setItem(CONFIG.STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));

            return createResponse(true, { message: 'Password changed successfully' });
        },

        /**
         * Get/initialize stored credentials (mock only)
         */
        _getStoredCredentials() {
            let credentials = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CREDENTIALS) || '{}');

            if (Object.keys(credentials).length === 0) {
                // Default accounts
                credentials = {
                    'admin@gmail.com': '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // 123456
                    'user@wise.com': 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',   // password123
                    'demo@wise.com': 'f6c5f5b5bd1068cf6d22116e176b6aa6b3bfec21f26a823b692e2ea21d0260b7',   // demo1234
                    'superadmin': '240be518fabd2724ddb6f04eeb9d8d37e4b7e6a3a3c8e038e7a1b6f7c2e7d9f0a1' // admin123
                };
                localStorage.setItem(CONFIG.STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
            }

            return credentials;
        },

        /**
         * Register new user (for mock only, Python should handle this)
         */
        async register(username, password) {
            if (!CONFIG.USE_MOCK_API) {
                try {
                    const response = await fetch(`${CONFIG.BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    return await response.json();
                } catch (err) {
                    return createResponse(false, null, 'Network error: ' + err.message);
                }
            }

            const credentials = this._getStoredCredentials();
            if (credentials[username]) {
                return createResponse(false, null, 'Username already exists');
            }

            const hashedPassword = await sha256(password);
            credentials[username] = hashedPassword;
            localStorage.setItem(CONFIG.STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));

            return createResponse(true, { message: 'Registration successful' });
        }
    };

    // =========================================================================
    // DASHBOARD API
    // =========================================================================

    const DashboardAPI = {
        /**
         * Get dashboard statistics
         * PYTHON ENDPOINT: GET /api/dashboard/stats
         * RESPONSE: { "totalOrders": 1234, "stock": 98765, "pendingShipments": 45, "newReceipts": 12 }
         */
        async getStats() {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                return createResponse(true, {
                    totalOrders: 1234,
                    stock: 98765,
                    pendingShipments: 45,
                    newReceipts: 12
                });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/dashboard/stats`);
                return await response.json();
            } catch (err) {
                return createResponse(false, null, 'Failed to load dashboard stats');
            }
        },

        /**
         * Get recent activity
         * PYTHON ENDPOINT: GET /api/dashboard/activity
         */
        async getRecentActivity() {
            if (CONFIG.USE_MOCK_API) {
                await delay(150);
                return createResponse(true, [
                    { type: 'order', message: 'Order #12345 completed', time: '5 minutes ago' },
                    { type: 'stock', message: '10 units added to Warehouse A', time: '1 hour ago' },
                    { type: 'shipment', message: 'Shipment #789 dispatched', time: '2 hours ago' }
                ]);
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/dashboard/activity`);
                return await response.json();
            } catch (err) {
                return createResponse(false, null, 'Failed to load activity');
            }
        }
    };

    // =========================================================================
    // PROFILE API
    // =========================================================================

    const ProfileAPI = {
        /**
         * Get user profile
         * PYTHON ENDPOINT: GET /api/profile
         */
        async getProfile() {
            if (CONFIG.USE_MOCK_API) {
                await delay(100);
                const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
                if (stored) {
                    return createResponse(true, JSON.parse(stored));
                }
                return createResponse(true, {
                    username: 'Warehouse User',
                    email: 'user@warehouse.com',
                    phone: '+62 812 3456 7890',
                    employeeId: 'WH-EMP-12345',
                    joinDate: 'January 15, 2024',
                    shift: 'Morning Shift (08:00 - 16:00)',
                    location: 'Warehouse A, Block 3',
                    role: 'Warehouse Staff'
                });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/profile`);
                return await response.json();
            } catch (err) {
                return createResponse(false, null, 'Failed to load profile');
            }
        },

        /**
         * Update user profile
         * PYTHON ENDPOINT: PUT /api/profile
         */
        async updateProfile(profileData) {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData));
                return createResponse(true, { message: 'Profile updated successfully' });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profileData)
                });
                return await response.json();
            } catch (err) {
                return createResponse(false, null, 'Failed to update profile');
            }
        }
    };

    // =========================================================================
    // CONFIGURATION API (untuk halaman configuration.html)
    // =========================================================================

    const ConfigAPI = {
        /**
         * Get configuration list by type
         * PYTHON ENDPOINT: GET /api/config/:type
         * Types: items, categories, warehouses, suppliers, etc.
         */
        async getList(type, filters = {}) {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                // Return empty array - actual data should come from backend
                return createResponse(true, { items: [], total: 0, page: 1 });
            }

            try {
                const params = new URLSearchParams(filters).toString();
                const response = await fetch(`${CONFIG.BASE_URL}/config/${type}?${params}`);
                return await response.json();
            } catch (err) {
                return createResponse(false, null, `Failed to load ${type}`);
            }
        },

        /**
         * Create new configuration item
         * PYTHON ENDPOINT: POST /api/config/:type
         */
        async create(type, data) {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                return createResponse(true, { id: 'MOCK-' + Date.now(), ...data });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/config/${type}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (err) {
                return createResponse(false, null, `Failed to create ${type}`);
            }
        },

        /**
         * Update configuration item
         * PYTHON ENDPOINT: PUT /api/config/:type/:id
         */
        async update(type, id, data) {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                return createResponse(true, { id, ...data });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/config/${type}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (err) {
                return createResponse(false, null, `Failed to update ${type}`);
            }
        },

        /**
         * Delete configuration item
         * PYTHON ENDPOINT: DELETE /api/config/:type/:id
         */
        async delete(type, id) {
            if (CONFIG.USE_MOCK_API) {
                await delay(200);
                return createResponse(true, { message: 'Deleted successfully' });
            }

            try {
                const response = await fetch(`${CONFIG.BASE_URL}/config/${type}/${id}`, {
                    method: 'DELETE'
                });
                return await response.json();
            } catch (err) {
                return createResponse(false, null, `Failed to delete ${type}`);
            }
        }
    };

    // =========================================================================
    // EXPOSE TO GLOBAL SCOPE
    // =========================================================================

    window.WiseAPI = {
        Config: CONFIG,
        Auth: AuthAPI,
        Dashboard: DashboardAPI,
        Profile: ProfileAPI,
        ConfigData: ConfigAPI,

        // Utility untuk tim Python
        setProductionMode(baseUrl) {
            CONFIG.USE_MOCK_API = false;
            CONFIG.BASE_URL = baseUrl;
            console.log('[WiseAPI] Switched to production mode:', baseUrl);
        }
    };

    console.log('[WiseAPI] API Service Layer loaded. Mode:', CONFIG.USE_MOCK_API ? 'MOCK' : 'PRODUCTION');
})();
