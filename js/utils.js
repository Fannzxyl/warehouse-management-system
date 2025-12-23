/**
 * WISE Warehouse Management System - Shared Utilities
 * =======================================================================
 * File ini berisi fungsi-fungsi utility yang digunakan bersama oleh semua
 * modul konfigurasi. Didefinisikan di sini untuk menghindari duplikasi.
 * =======================================================================
 */

(function () {
    'use strict';

    // =======================================================================
    // DEBOUNCE FUNCTION
    // Membatasi frekuensi pemanggilan fungsi saat input event
    // =======================================================================
    window.debounce = function (func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // =======================================================================
    // TRAP FOCUS INSIDE MODAL
    // Memastikan fokus keyboard tetap di dalam modal (accessibility)
    // =======================================================================
    window.trapFocus = function (modal) {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableContent = modal.querySelectorAll(focusableElements);
        if (focusableContent.length === 0) return () => { };

        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        const keydownHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        modal.addEventListener('keydown', keydownHandler);
        firstFocusableElement.focus();

        return () => {
            modal.removeEventListener('keydown', keydownHandler);
        };
    };

    // =======================================================================
    // CUSTOM ALERT MODAL
    // Menggantikan browser alert() dengan pop-up kustom yang lebih baik
    // =======================================================================
    window.showCustomAlert = async function (title, message) {
        return new Promise((resolve) => {
            const modalHtml = `
                <div id="custom-alert-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
                        <h3 class="text-lg font-bold mb-2">${title}</h3>
                        <p class="text-sm text-gray-700 mb-4">${message}</p>
                        <div class="flex justify-end">
                            <button id="custom-alert-ok-button" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('custom-alert-ok-button').addEventListener('click', () => {
                document.getElementById('custom-alert-modal').remove();
                resolve();
            });
        });
    };

    // =======================================================================
    // CUSTOM CONFIRM MODAL
    // Menggantikan browser confirm() dengan pop-up kustom yang lebih baik
    // =======================================================================
    window.showCustomConfirm = async function (title, message) {
        return new Promise((resolve) => {
            const modalHtml = `
                <div id="custom-confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
                        <h3 class="text-lg font-bold mb-2">${title}</h3>
                        <p class="text-sm text-gray-700 mb-4">${message}</p>
                        <div class="flex justify-end gap-2">
                            <button id="custom-confirm-cancel-button" class="btn">Cancel</button>
                            <button id="custom-confirm-ok-button" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('custom-confirm-ok-button').addEventListener('click', () => {
                document.getElementById('custom-confirm-modal').remove();
                resolve(true);
            });
            document.getElementById('custom-confirm-cancel-button').addEventListener('click', () => {
                document.getElementById('custom-confirm-modal').remove();
                resolve(false);
            });
        });
    };

    // =======================================================================
    // TOAST NOTIFICATION
    // Menampilkan pesan singkat di pojok kanan bawah layar
    // =======================================================================
    // =======================================================================
    // TOAST NOTIFICATION SYSTEM
    // Professional, stackable, and accessible toast notifications
    // =======================================================================
    window.showToast = function (message, type = 'success') {
        // Container setup
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(container);
        }

        // Configuration based on type
        const config = {
            success: {
                icon: '<i class="fas fa-check-circle text-2xl"></i>',
                color: 'bg-green-500',
                borderColor: 'border-green-500',
                textColor: 'text-green-600',
                title: 'Success'
            },
            error: {
                icon: '<i class="fas fa-times-circle text-2xl"></i>',
                color: 'bg-red-500',
                borderColor: 'border-red-500',
                textColor: 'text-red-600',
                title: 'Error'
            },
            info: {
                icon: '<i class="fas fa-info-circle text-2xl"></i>',
                color: 'bg-blue-500',
                borderColor: 'border-blue-500',
                textColor: 'text-blue-600',
                title: 'Information'
            },
            warning: {
                icon: '<i class="fas fa-exclamation-triangle text-2xl"></i>',
                color: 'bg-yellow-500',
                borderColor: 'border-yellow-500',
                textColor: 'text-yellow-600',
                title: 'Warning'
            }
        };

        const theme = config[type] || config.info;

        // Toast element creation
        const toast = document.createElement('div');
        toast.className = `
            pointer-events-auto 
            w-full max-w-sm 
            bg-white 
            border-l-4 ${theme.borderColor} 
            shadow-lg rounded-r-lg 
            flex items-center gap-4 p-4 
            transform transition-all duration-300 ease-out 
            translate-x-full opacity-0
        `;
        toast.setAttribute('role', 'alert');

        toast.innerHTML = `
            <div class="${theme.textColor}">
                ${theme.icon}
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-sm mb-0.5">${theme.title}</p>
                <p class="text-gray-600 text-sm leading-tight break-words">${message}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
                if (container.children.length === 0) container.remove();
            }, 300);
        }, 5000);
    };

    // =======================================================================
    // STANDARD LIST HEADER RENDERER
    // Render header list standar dengan tombol Create dan Search
    // =======================================================================
    window.renderStandardListHeader = function ({ createLabel, onCreate, searchId, searchPlaceholder, onSearch }) {
        return `
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="${onCreate}">${createLabel}</button>
              <div class="grow"></div>
              <div class="relative">
                <input id="${searchId}" type="text" placeholder="${searchPlaceholder}" oninput="${onSearch}(this.value)" class="input w-full sm:w-72 pl-10" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
        `;
    };

    // =======================================================================
    // STANDARD MODAL FOOTER RENDERER
    // Render footer modal standar dengan tombol Cancel dan OK
    // =======================================================================
    window.renderStandardModalFooter = function ({ cancelOnclick, submitFormId, submitLabel = 'OK', submitButtonId = '', inactiveCheckboxHtml = '' }) {
        return `
            <div class="px-6 py-4 border-t flex justify-end gap-3">
                ${inactiveCheckboxHtml}
                <button type="button" class="btn" onclick="${cancelOnclick}">Cancel</button>
                <button type="submit" form="${submitFormId}" ${submitButtonId ? `id="${submitButtonId}"` : ''} class="btn btn-primary">${submitLabel}</button>
            </div>
        `;
    };

    // =======================================================================
    // ACTIVATE TAB FUNCTION
    // Menangani aktivasi tab panel UI
    // =======================================================================
    window.activateTab = function (tabName, container) {
        container.querySelectorAll('[role="tab"]').forEach(tab => tab.classList.remove('tab-active'));
        container.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden'));
        const activeTab = container.querySelector(`[role="tab"][data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('tab-active');
        }
        const activePane = container.querySelector(`[role="tabpanel"][data-pane="${tabName}"]`);
        if (activePane) {
            activePane.classList.remove('hidden');
        }
    };

    // =======================================================================
    // GENERATE UNIQUE ID
    // Helper untuk menghasilkan ID unik
    // =======================================================================
    window.generateUniqueId = function (prefix = 'ID') {
        return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    };

    // =======================================================================
    // FORMAT DATE
    // Helper untuk memformat tanggal dan waktu
    // =======================================================================
    window.formatDate = function (date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        const pad = (n) => n < 10 ? `0${n}` : n;
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    // =======================================================================
    // SIDEBAR SEARCH FUNCTION
    // Filter sidebar menu items based on search query
    // =======================================================================

    // Store original sidebar state
    let originalSidebarHTML = null;

    window.handleSearch = function (query) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Store original state on first search
        if (!originalSidebarHTML) {
            originalSidebarHTML = sidebar.innerHTML;
        }

        const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
        const subMenuItems = sidebar.querySelectorAll('[id$="-children"] a');
        const searchTerm = query.toLowerCase().trim();

        // If empty search, restore original state
        if (!searchTerm) {
            sidebarItems.forEach(item => {
                item.style.display = '';
                item.classList.remove('search-highlight');
            });
            subMenuItems.forEach(item => {
                item.style.display = '';
                item.classList.remove('search-highlight');
            });
            // Collapse all submenus
            sidebar.querySelectorAll('[id$="-children"]').forEach(submenu => {
                submenu.classList.add('hidden');
            });
            return;
        }

        let matchCount = 0;

        // Search through main sidebar items
        sidebarItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const parentId = item.id;
            const childContainer = document.getElementById(`${parentId}-children`);

            if (text.includes(searchTerm)) {
                item.style.display = '';
                item.classList.add('search-highlight');
                matchCount++;
                // Expand submenu if parent matches
                if (childContainer) {
                    childContainer.classList.remove('hidden');
                }
            } else {
                item.classList.remove('search-highlight');
                // Check if any child matches
                let hasMatchingChild = false;
                if (childContainer) {
                    const children = childContainer.querySelectorAll('a');
                    children.forEach(child => {
                        if (child.textContent.toLowerCase().includes(searchTerm)) {
                            hasMatchingChild = true;
                            child.style.display = '';
                            child.classList.add('search-highlight');
                            matchCount++;
                        } else {
                            child.style.display = 'none';
                            child.classList.remove('search-highlight');
                        }
                    });
                }

                if (hasMatchingChild) {
                    item.style.display = '';
                    childContainer.classList.remove('hidden');
                } else {
                    item.style.display = 'none';
                    if (childContainer) {
                        childContainer.classList.add('hidden');
                    }
                }
            }
        });

        // Show "no results" toast if nothing found
        if (matchCount === 0 && searchTerm.length > 2) {
            // Only show once per search session
            if (!window._lastNoResultQuery || window._lastNoResultQuery !== searchTerm) {
                window._lastNoResultQuery = searchTerm;
                // Uncomment to show toast: window.showToast(`No results for "${searchTerm}"`, 'info');
            }
        } else {
            window._lastNoResultQuery = null;
        }
    };

    // Clear search and restore sidebar
    window.clearSearch = function () {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            window.handleSearch('');
        }
    };

    console.log('[WISE Utils] Shared utilities loaded successfully.');
})();
