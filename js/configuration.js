(function() {
    document.addEventListener('DOMContentLoaded', () => {

        // === utils
        const $ = (id) => document.getElementById(id);

        // === Search overlay flags (rollback-friendly)
        window.SEARCH_PREVIEW_ENABLED = false;   // nonaktifkan hover preview panel
        window.SEARCH_HISTORY_ENABLED = false;    // AKTIPKAN dropdown riwayat

        // ===== Search History Utilities =====
        const HISTORY_KEY = 'wise.searchHistory';
        const MAX_HISTORY = 8;

        function getHistory() {
          try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
          catch { return []; }
        }
        function setHistory(list) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
        }
        function addHistory(q) {
          q = (q || '').trim();
          if (!q) return;
          const cur = getHistory().filter(x => x !== q);
          cur.unshift(q);
          setHistory(cur);
        }

        window.showSearchHistory = function () {
          if (!window.SEARCH_HISTORY_ENABLED) return;
          const dd  = document.getElementById('search-history-dropdown');
          const box = document.getElementById('search-history-content');
          if (!dd || !box) return;

          const items = getHistory();
          if (!items.length) {
            box.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada riwayat pencarian.</p>`;
            dd.classList.remove('hidden');
            return;
          }
          box.innerHTML = items.map((q,i)=>`
            <div class="flex items-center justify-between px-3 py-2 hover:bg-wise-light-gray rounded-md">
              <button class="text-left text-sm text-wise-dark-gray flex-1" onclick="applySearchHistory('${q.replace(/"/g,'&quot;')}')">${q}</button>
              <button class="text-wise-gray hover:text-red-500 text-xs ml-2" onclick="removeSearchHistory(${i})">&times;</button>
            </div>`).join('') + `
            <div class="text-right pt-2 pb-1 px-3">
              <button class="text-wise-gray hover:underline text-xs" onclick="clearAllSearchHistory()">Clear all</button>
            </div>`;
          dd.classList.remove('hidden');
        };
        window.hideSearchHistory   = () => document.getElementById('search-history-dropdown')?.classList.add('hidden');
        window.applySearchHistory  = (q) => { const h = document.getElementById('search-input'); if (h) h.value = q; handleSearch(q); window.hideSearchHistory(); };
        window.removeSearchHistory = (i) => { const cur = getHistory(); cur.splice(i,1); setHistory(cur); window.showSearchHistory(); };
        window.clearAllSearchHistory = () => { setHistory([]); window.showSearchHistory(); };
        // ===== END Search History Utilities =====

        // === global state guards (hindari warning)
        window.searchItems = Array.isArray(window.searchItems) ? window.searchItems : [];
        window.currentCategory = window.currentCategory || null;
        window.zones = Array.isArray(window.zones) ? window.zones : [];
        window.zoneTypes = Array.isArray(window.zoneTypes) ? window.zoneTypes : [];
        window.locationTypes = Array.isArray(window.locationTypes) ? window.locationTypes : [];

        // --- Perubahan Utama: Hapus implementasi lama di sini ---
        // Mencari dan menghapus: handleSearch, performSearch, showPreview, selectSearchResult, closeSearchOverlay
        // Serta: showSearchHistory, applySearchHistory, removeSearchHistory, clearAllSearchHistory
        // (Semua fungsi di bawah ini adalah implementasi final)

        // ================= Search Overlay (final, no preview/history) =================
        // INPUT HANDLER
        window.handleSearch = function(query) {
            const overlay = $('search-overlay');
            const oInput  = $('overlay-search-input');
            const hInput  = $('search-input');
            const histDD  = $('search-history-dropdown');

            const q = query || ''; // <-- .trim() DIHAPUS DARI SINI

            if (q.length > 0) { // Cukup cek panjangnya aja
                overlay?.classList?.remove('hidden');

                if (oInput) {
                    oInput.value = q;
                    if (hInput) hInput.blur();
                    try {
                        oInput.focus({ preventScroll: true });
                        oInput.setSelectionRange(oInput.value.length, oInput.value.length);
                    } catch (e) {}
                }

                histDD?.classList?.add('hidden');
                performSearch(q, 'overlay'); // Kirim query apa adanya, termasuk spasi
            } else {
                overlay?.classList?.add('hidden');
                if (typeof selectCategory === 'function' && window.currentCategory) {
                    selectCategory(window.currentCategory);
                }
            }
        };

        // RENDER HASIL LIST-ONLY
        window.performSearch = function(query, source) {
            const resultsPanel = $('overlay-search-results-list-panel');
            const detailPanel = $('overlay-detail-content-panel');

            if (!resultsPanel) return;
            if (detailPanel) {
                detailPanel.innerHTML = '';
                detailPanel.style.display = 'none';
            }

            const q = (query || '').trim().toLowerCase(); // <-- .trim() DIPINDAH KE SINI
            const items = Array.isArray(window.searchItems) ? window.searchItems : [];
            const filtered = q.length > 0 ? items.filter(it =>
                (it.title || '').toLowerCase().includes(q) ||
                (it.category || '').toLowerCase().includes(q)
            ) : [];

            resultsPanel.innerHTML = '';
            if (!filtered.length) {
                resultsPanel.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada hasil ditemukan.</p>`;
                resultsPanel.style.width = '100%';
                return;
            }

            filtered.forEach(item => {
                const el = document.createElement('div');
                el.className = 'py-2 px-3 bg-wise-light-gray rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 mb-2 transition-all-smooth';
                el.innerHTML = `
                <h4 class="text-wise-dark-gray font-medium text-sm">${item.title}</h4>
                <p class="text-wise-gray text-xs">Kategori: ${item.category || '-'}${item.lastUpdated ? ' | Terakhir Diperbarui: ' + item.lastUpdated : ''}</p>
                `;

                el.onclick = () => selectSearchResult(item.id, item.title, query);
                resultsPanel.appendChild(el);
            });
            
            resultsPanel.style.width = '100%';
        };

        // KLIK HASIL = GOTO + (opsional) history
        window.selectSearchResult = function(id) {
            if (id === 'configuration') {
                window.location.href = 'configuration.html';
            } else {
                displayContentInMainDashboard(id);
            }
        };

        // TUTUP OVERLAY (pastikan history dropdown ikut disembunyikan)
        window.closeSearchOverlay = function() {
            const overlay = document.getElementById('search-overlay');
            if (overlay) overlay.classList.add('hidden');
            
            const headerInput = document.getElementById('search-input');
            const overlayInput = document.getElementById('overlay-search-input');
            if (headerInput) headerInput.value = '';
            if (overlayInput) overlayInput.value = '';
        };

        const mainContent = document.getElementById('default-content-area');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const searchOverlay = document.getElementById('search-overlay');
        const closeOverlayButton = document.querySelector('#search-overlay button[onclick="closeSearchOverlay()"]');
        const overlaySearchInput = document.getElementById('overlay-search-input');
        const overlaySearchResultsListPanel = document.getElementById('overlay-search-results-list-panel');
        const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
        const overlaySearchFilters = document.getElementById('overlay-search-filters');
        const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.getElementById('sidebar');

        const customModalOverlay = document.getElementById('custom-modal-overlay');
        const customModalTitle = document.getElementById('custom-modal-title');
        const customModalMessage = document.getElementById('custom-modal-message');
        const customModalOkBtn = document.getElementById('custom-modal-ok-btn');
        const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');

        window.showCustomAlert = function(title, message) {
            customModalTitle.textContent = title;
            customModalMessage.textContent = message;
            customModalCancelBtn.classList.add('hidden');
            customModalOkBtn.textContent = 'OK';
            customModalOverlay.classList.remove('hidden');
            customModalOverlay.classList.add('flex');

            return new Promise(resolve => {
                const handleOk = () => {
                    customModalOkBtn.removeEventListener('click', handleOk);
                    customModalOverlay.classList.add('hidden');
                    customModalOverlay.classList.remove('flex');
                    resolve(true);
                };
                customModalOkBtn.addEventListener('click', handleOk);
            });
        };

        window.showCustomConfirm = function(title, message) {
            customModalTitle.textContent = title;
            customModalMessage.textContent = message;
            customModalCancelBtn.classList.remove('hidden');
            customModalOkBtn.textContent = 'OK';
            customModalOverlay.classList.remove('hidden');
            customModalOverlay.classList.add('flex');

            return new Promise(resolve => {
                const handleOk = () => {
                    customModalOkBtn.removeEventListener('click', handleOk);
                    customModalCancelBtn.removeEventListener('click', handleCancel);
                    customModalOverlay.classList.add('hidden');
                    customModalOverlay.classList.remove('flex');
                    resolve(true);
                };
                const handleCancel = () => {
                    customModalOkBtn.removeEventListener('click', handleOk);
                    customModalCancelBtn.removeEventListener('click', handleCancel);
                    customModalOverlay.classList.add('hidden');
                    customModalOverlay.classList.remove('flex');
                    resolve(false);
                };
                customModalOkBtn.addEventListener('click', handleOk);
                customModalCancelBtn.addEventListener('click', handleCancel);
            });
        };

        window.contentData = {
            configuration: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Configuration</h2>
                    <p class="text-wise-gray mb-4">Here you can manage various configurations for the WISE system. Select a sub-category from the sidebar to manage Warehouse, Zone Type, or Location Type.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Warehouse Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Manage warehouse details, including addresses and authorized users.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-warehouse')">
                                Manage Warehouses
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Locating Strategy Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Manage strategies used to place items in warehouse locations.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('locating-strategies')">
                                Manage Locating Strategies
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Locating Rule Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Define rules that determine how items are placed in warehouse locations.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('locating-rule')">
                                Manage Locating Rules
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Security Group Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Manage Security Permission that determine how security are placed in warehouse locations.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('security-group')">
                                Manage Security Group
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Security Permission Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Define Security Group that determine how security are placed in warehouse locations.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('security-permission')">
                                Manage Security Permission
                            </button>
                        </div>
                            <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">User Profile Management</h3>
                               <p class="text-wise-gray text-sm mt-1">Manage user profiles, permissions, and other user-specific settings.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-user-profile')">
                                   Manage User Profiles
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Allocation Rule</h3>
                               <p class="text-wise-gray text-sm mt-1">Manage rules that determine how items are allocated from warehouse locations.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('allocation-rule')">
                                   Manage Allocation Rule
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Allocation Strategies</h3>
                               <p class="text-wise-gray text-sm mt-1">Manage strategies used to allocate items from warehouse locations.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('allocation-strategies')">
                                   Manage Allocation Strategies
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Allocation Rule Assignment</h3>
                               <p class="text-wise-gray text-sm mt-1">Set criteria, rule, and priority.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('allocation-rule-assignment')">
                                   Manage Allocation Rule Assignment
                               </button>
                           </div>
                            <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Allocation Location Selection</h3>
                               <p class="text-wise-gray text-sm mt-1">Manage strategies used to allocate items from warehouse locations.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('allocation-location-selection')">
                                   Manage Allocation Location Selection
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Allocation Rule Assignment Criteria</h3>
                               <p class="text-wise-gray text-sm mt-1">Set criteria, and record type, etc.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('allocation-rule-assignment-criteria')">
                                   Manage Allocation Rule Assignment Criteria
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                               <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Inventory Controller</h3>
                               <p class="text-wise-gray text-sm mt-1">Select a sub-category to manage inventory control.</p>
                               <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('inventory-control')">
                                   Manage Inventory Controller
                               </button>
                           </div>
                           <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                                <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Customer Management</h3>
                                <p class="text-wise-gray text-sm mt-1">Manage customer master data, addresses, and classification.</p>
                                <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('customer')">
                                    Manage Customers
                                </button>
                            </div>
                            <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                                <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Company Management</h3>
                                <p class="text-wise-gray text-sm mt-1">Manage company master data, including addresses and nested warehouse configurations.</p>
                                <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('company')">
                                    Manage Company
                                </button>
                            </div>
                    </div>
                `,
            },
            'configuration-warehouse': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Warehouse </h2>
                    <p class="text-wise-gray mb-4">Manage existing warehouses or add new ones.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showWarehouseForm('create')">
                            Create New Warehouse
                        </button>
                        <input type="text" id="warehouse-search" placeholder="Search warehouse..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterWarehouseList(this.value)">
                    </div>
                    <div id="warehouse-list-container" class="overflow-x-auto">
                        </div>
                    <div id="warehouse-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="warehouse-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="warehouse-form" onsubmit="handleWarehouseSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="warehouse-name" class="block text-sm font-medium text-wise-dark-gray">Warehouse:</label>
                                            <input type="text" id="warehouse-name" name="warehouse" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="warehouse-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="warehouse-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                    </div>

                                    <div class="mb-4">
                                        <div class="flex space-x-2 mb-2">
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="warehouse-address">Warehouse Address</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="returns-address">Returns Address</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="freight-bill-to-address">Freight Bill to Address</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="authorized-users">Authorized Users</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="miscellaneous">Miscellaneous</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="user-defined-data">User Defined Data</button>
                                        </div>

                                        <div id="warehouse-address" class="tab-content border border-wise-border p-4 rounded-b-md">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Warehouse Address</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="address1" class="block text-sm font-medium text-wise-dark-gray">Address 1:</label>
                                                    <input type="text" id="address1" name="address1" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="address2" class="block text-sm font-medium text-wise-dark-gray">Address 2 (optional):</label>
                                                    <input type="text" id="address2" name="address2" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="address3" class="block text-sm font-medium text-wise-dark-gray">Address 3 (optional):</label>
                                                    <input type="text" id="address3" name="address3" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 col-span-full">
                                                    <div class="flex-1">
                                                        <label for="city" class="block text-sm font-medium text-wise-dark-gray">City:</label>
                                                        <input type="text" id="city" name="city" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    </div>
                                                    <div class="w-full sm:w-24">
                                                        <label for="state" class="block text-sm font-medium text-wise-dark-gray">State:</label>
                                                        <select id="state" name="state" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                            <option value="">--Select--</option>
                                                            <option value="West Java">West Java</option>
                                                            <option value="Central Java">Central Java</option>
                                                            <option value="East Java">East Java</option>
                                                        </select>
                                                    </div>
                                                    <div class="flex-1">
                                                        <label for="postal-code" class="block text-sm font-medium text-wise-dark-gray">Postal Code:</label>
                                                        <input type="text" id="postal-code" name="postalCode" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    </div>
                                                </div>
                                                <div>
                                                    <label for="country" class="block text-sm font-medium text-wise-dark-gray">Country:</label>
                                                    <select id="country" name="country" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                        <option value="">--Select--</option>
                                                        <option value="Indonesia">Indonesia</option>
                                                        <option value="USA">USA</option>
                                                        <option value="Singapore">Singapore</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="fax-number" class="block text-sm font-medium text-wise-dark-gray">Fax number:</label>
                                                    <input type="text" id="fax-number" name="faxNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="attention-to" class="block text-sm font-medium text-wise-dark-gray">Attention to:</label>
                                                    <input type="text" id="attention-to" name="attentionTo" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="phone-number" class="block text-sm font-medium text-wise-dark-gray">Phone number:</label>
                                                    <input type="text" id="phone-number" name="phoneNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="email-address" class="block text-sm font-medium text-wise-dark-gray">Email address:</label>
                                                    <input type="email" id="email-address" name="emailAddress" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="ucc-ean-number" class="block text-sm font-medium text-wise-dark-gray">UCC/EAN number:</label>
                                                    <input type="text" id="ucc-ean-number" name="uccEanNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                        <div id="returns-address" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Returns Address</h4>
                                            <div class="mb-4">
                                                <label class="inline-flex items-center">
                                                    <input type="checkbox" id="same-as-warehouse-address-return" name="sameAsWarehouseAddressReturn" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="toggleReturnAddressFields()">
                                                    <span class="ml-2 text-sm text-wise-dark-gray">Same as warehouse address</span>
                                                </label>
                                            </div>
                                            <div id="return-address-fields" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="return-name" class="block text-sm font-medium text-wise-dark-gray">Name:</label>
                                                    <input type="text" id="return-name" name="returnName" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-address1" class="block text-sm font-medium text-wise-dark-gray">Address 1:</label>
                                                    <input type="text" id="return-address1" name="returnAddress1" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-address2" class="block text-sm font-medium text-wise-dark-gray">Address 2 (optional):</label>
                                                    <input type="text" id="return-address2" name="returnAddress2" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-address3" class="block text-sm font-medium text-wise-dark-gray">Address 3 (optional):</label>
                                                    <input type="text" id="return-address3" name="returnAddress3" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 col-span-full">
                                                    <div class="flex-1">
                                                        <label for="return-city" class="block text-sm font-medium text-wise-dark-gray">City:</label>
                                                        <input type="text" id="return-city" name="returnCity" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    </div>
                                                    <div class="w-full sm:w-24">
                                                        <label for="return-state" class="block text-sm font-medium text-wise-dark-gray">State:</label>
                                                        <select id="return-state" name="returnState" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                            <option value="">--Select--</option>
                                                            <option value="West Java">West Java</option>
                                                            <option value="Central Java">Central Java</option>
                                                            <option value="East Java">East Java</option>
                                                        </select>
                                                    </div>
                                                    <div class="flex-1">
                                                        <label for="return-postal-code" class="block text-sm font-medium text-wise-dark-gray">Postal Code:</label>
                                                        <input type="text" id="return-postal-code" name="returnPostalCode" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    </div>
                                                </div>
                                                <div>
                                                    <label for="return-country" class="block text-sm font-medium text-wise-dark-gray">Country:</label>
                                                    <select id="return-country" name="returnCountry" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                        <option value="">--Select--</option>
                                                        <option value="Indonesia">Indonesia</option>
                                                        <option value="USA">USA</option>
                                                        <option value="Singapore">Singapore</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="return-fax-number" class="block text-sm font-medium text-wise-dark-gray">Fax number:</label>
                                                    <input type="text" id="return-fax-number" name="returnFaxNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-attention-to" class="block text-sm font-medium text-wise-dark-gray">Attention to:</label>
                                                    <input type="text" id="return-attention-to" name="returnAttentionTo" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-phone-number" class="block text-sm font-medium text-wise-dark-gray">Phone number:</label>
                                                    <input type="text" id="return-phone-number" name="returnPhoneNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-email-address" class="block text-sm font-medium text-wise-dark-gray">Email address:</label>
                                                    <input type="email" id="return-email-address" name="returnEmailAddress" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="return-ucc-ean-number" class="block text-sm font-medium text-wise-dark-gray">UCC/EAN number:</label>
                                                    <input type="text" id="return-ucc-ean-number" name="returnUccEanNumber" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                        <div id="freight-bill-to-address" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Freight Bill to Address</h4>
                                            <p class="text-wise-gray text-sm">Form for Freight Bill to Address.</p>
                                        </div>
                                        <div id="authorized-users" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Authorized Users</h4>
                                            <div class="mb-4">
                                                <label class="inline-flex items-center">
                                                    <input type="checkbox" id="check-all-users" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="toggleAllUsers()">
                                                    <span class="ml-2 text-sm text-wise-dark-gray">Check all</span>
                                                </label>
                                            </div>
                                            <div id="user-checkbox-list" class="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                                </div>
                                        </div>
                                        <div id="miscellaneous" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Miscellaneous</h4>
                                            <div class="mb-4">
                                                <label for="slotting-move-file-directory" class="block text-sm font-medium text-wise-dark-gray">Slotting move file download directory:</label>
                                                <input type="text" id="slotting-move-file-directory" name="slottingMoveFileDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div class="mb-4">
                                                <label for="default-location-for-unslotted-items" class="block text-sm font-medium text-wise-dark-gray">Default location for unslotted items:</label>
                                                <input type="text" id="default-location-for-unslotted-items" name="defaultLocationForUnslottedItems" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <h5 class="font-semibold text-wise-dark-gray mt-4 mb-2">SQL Server Reporting Services</h5>
                                            <div>
                                                <label for="rendered-document-pdf-file-directory" class="block text-sm font-medium text-wise-dark-gray">Rendered document pdf file directory:</label>
                                                <input type="text" id="rendered-document-pdf-file-directory" name="renderedDocumentPdfFileDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <div id="user-defined-data" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label for="user-defined-field1" class="block text-sm font-medium text-wise-dark-gray">User defined field 1:</label>
                                                    <input type="text" id="user-defined-field1" name="userDefinedField1" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field2" class="block text-sm font-medium text-wise-dark-gray">User defined field 2:</label>
                                                    <input type="text" id="user-defined-field2" name="userDefinedField2" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field3" class="block text-sm font-medium text-wise-dark-gray">User defined field 3:</label>
                                                    <input type="text" id="user-defined-field3" name="userDefinedField3" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field4" class="block text-sm font-medium text-wise-dark-gray">User defined field 4:</label>
                                                    <input type="text" id="user-defined-field4" name="userDefinedField4" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field5" class="block text-sm font-medium text-wise-dark-gray">User defined field 5:</label>
                                                    <input type="text" id="user-defined-field5" name="userDefinedField5" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field6" class="block text-sm font-medium text-wise-dark-gray">User defined field 6:</label>
                                                    <input type="text" id="user-defined-field6" name="userDefinedField6" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field7" class="block text-sm font-medium text-wise-dark-gray">User defined field 7:</label>
                                                    <input type="text" id="user-defined-field7" name="userDefinedField7" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="user-defined-field8" class="block text-sm font-medium text-wise-dark-gray">User defined field 8:</label>
                                                    <input type="text" id="user-defined-field8" name="userDefinedField8" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="warehouse-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeWarehouseForm()">Cancel</button>
                                <button type="submit" form="warehouse-form" id="warehouse-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'article a': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Article A Details</h2>
                    <p class="text-wise-gray">This is the detailed content for Article A. It has just been updated and contains important information regarding system updates.</p>
                    <p class="text-wise-gray text-sm mt-2">Last updated: 2 hours ago</p>
                `,
            },
            'paragraph b': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Paragraph B Details</h2>
                    <p class="text-wise-gray">Here you will find more information about Paragraph B. This section covers various aspects of data handling and processing.</p>
                    <p class="text-wise-gray text-sm mt-2">Last updated: 1 hour ago</p>
                `,
            },
            'method c': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Method C Details</h2>
                    <p class="text-wise-gray">Details about Method C, including its implementation steps and best practices. This method is crucial for optimizing performance.</p>
                    <p class="text-wise-gray text-sm mt-2">Last updated: 30 minutes ago</p>
                `,
            },
            'locating-strategies': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Locating Strategy</h2>
                    <p class="text-wise-gray mb-4">Manage strategies used to place items in warehouse locations.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showLocatingStrategyForm('create')">
                            Create New Locating Strategy
                        </button>
                        <input type="text" id="locating-strategy-search" placeholder="Search locating strategy..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocatingStrategyList(this.value)">
                    </div>
                    <div id="locating-strategy-list-container" class="overflow-x-auto">
                    </div>

                    <div id="locating-strategy-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="locating-strategy-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="locating-strategy-form" onsubmit="handleLocatingStrategySubmit(event)">
                                    <div class="mb-4">
                                        <label for="locating-strategy-identifier" class="block text-sm font-medium text-wise-dark-gray">Identifier:</label>
                                        <input type="text" id="locating-strategy-identifier" name="identifier" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label for="locating-strategy-record-type" class="block text-sm font-medium text-wise-dark-gray">Record type:</label>
                                        <input type="text" id="locating-strategy-record-type" name="recordType" value="LOCSTRAT" readonly class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-gray-100 text-wise-gray cursor-not-allowed">
                                    </div>
                                    <div class="mb-4">
                                        <label for="locating-strategy-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="locating-strategy-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="locating-strategy-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="locating-strategy-system-created" name="systemCreated" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeLocatingStrategyForm()">Cancel</button>
                                <button type="submit" form="locating-strategy-form" id="locating-strategy-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'locating-rule': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Locating Rule</h2>
                    <p class="text-wise-gray mb-4">Manage rules that determine how items are placed in warehouse locations.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showLocatingRuleForm('create')">
                            Create New Locating Rule
                        </button>
                        <input type="text" id="locating-rule-search" placeholder="Search locating rule..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocatingRuleList(this.value)">
                    </div>
                    <div id="locating-rule-list-container" class="overflow-x-auto">
                    </div>

                    <div id="locating-rule-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="locating-rule-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="locating-rule-form" onsubmit="handleLocatingRuleSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="locating-rule-name" class="block text-sm font-medium text-wise-dark-gray">Locating Rule Name:</label>
                                            <input type="text" id="locating-rule-name" name="ruleName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray" oninput="checkLocatingRuleFormValidity()">
                                        </div>
                                        <div>
                                            <label for="locating-rule-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="locating-rule-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray" oninput="checkLocatingRuleFormValidity()">
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="locating-rule-delayed-locating" name="delayedLocating" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Delayed locating</span>
                                        </label>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="locating-rule-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>

                                    <div class="mb-4">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Detail Records</h4>
                                        <div id="locating-rule-detail-records-container" class="space-y-3 p-4 border border-wise-border rounded-md bg-wise-light-gray" disabled>
                                            <p id="detail-records-placeholder" class="text-wise-gray text-sm">Input Locating Rule Name and Description first to enable detail records.</p>
                                            <div id="detail-records-list" class="space-y-2">
                                                </div>
                                            <button type="button" id="add-detail-record-btn" class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform" onclick="addDetailRecord()" disabled>Add Detail Record</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeLocatingRuleForm()">Cancel</button>
                                <button type="submit" form="locating-rule-form" id="locating-rule-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'security-group': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Security Group</h2>
                    <p class="text-wise-gray mb-4">Manage security groups and their access levels within the system.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showSecurityGroupForm('create')">
                            Create New Security Group
                        </button>
                        <input type="text" id="security-group-search" placeholder="Search security group..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterSecurityGroupList(this.value)">
                    </div>
                    <div id="security-group-list-container" class="overflow-x-auto">
                    </div>

                    <div id="security-group-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="security-group-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-group-form" onsubmit="handleSecurityGroupSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="security-group-name" class="block text-sm font-medium text-wise-dark-gray">Security group:</label>
                                            <input type="text" id="security-group-name" name="groupName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="security-group-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="security-group-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                    </div>

                                    <div class="mb-4">
                                        <div class="flex space-x-2 mb-2 border-b border-wise-border">
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="group-users-tab">Group users</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="user-defined-data-tab">User Defined Data</button>
                                        </div>

                                        <div id="group-users-tab" class="tab-content border border-wise-border p-4 rounded-b-md">
                                            <div class="flex justify-between items-center mb-2">
                                                     <input type="text" id="security-group-user-filter" placeholder="Filter users..." class="px-3 py-1 border rounded-md bg-white text-wise-dark-gray text-sm w-1/3" oninput="renderSecurityGroupUserCheckboxes(null, this.value)">
                                                     <label class="inline-flex items-center">
                                                         <input type="checkbox" id="check-all-security-group-users" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="toggleAllSecurityGroupUsers()">
                                                         <span class="ml-2 text-sm text-wise-dark-gray">Check all</span>
                                                     </label>
                                            </div>
                                            <div id="security-group-user-checkbox-list" class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-wise-light-gray">
                                                </div>
                                        </div>

                                        <div id="user-defined-data-tab" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="sg-user-defined-field1" class="block text-sm font-medium text-wise-dark-gray">User defined field 1:</label>
                                                    <input type="text" id="sg-user-defined-field1" name="userDefinedField1" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field2" class="block text-sm font-medium text-wise-dark-gray">User defined field 2:</label>
                                                    <input type="text" id="sg-user-defined-field2" name="userDefinedField2" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field3" class="block text-sm font-medium text-wise-dark-gray">User defined field 3:</label>
                                                    <input type="text" id="sg-user-defined-field3" name="userDefinedField3" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field4" class="block text-sm font-medium text-wise-dark-gray">User defined field 4:</label>
                                                    <input type="text" id="sg-user-defined-field4" name="userDefinedField4" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field5" class="block text-sm font-medium text-wise-dark-gray">User defined field 5:</label>
                                                    <input type="text" id="sg-user-defined-field5" name="userDefinedField5" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field6" class="block text-sm font-medium text-wise-dark-gray">User defined field 6:</label>
                                                    <input type="text" id="sg-user-defined-field6" name="userDefinedField6" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field7" class="block text-sm font-medium text-wise-dark-gray">User defined field 7:</label>
                                                    <input type="text" id="sg-user-defined-field7" name="userDefinedField7" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="security-group-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeSecurityGroupForm()">Cancel</button>
                                <button type="submit" form="security-group-form" id="security-group-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'security-permission': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Security Permission</h2>
                    <p class="text-wise-gray mb-4">Manage security permissions and their access to different menus.</p>
                    
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showSecurityPermissionForm('create')">
                            Create New Permission
                        </button>
                        <input type="text" id="security-permission-search" placeholder="Search permission..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray w-full max-w-xs" oninput="renderSecurityPermissionList(this.value)">
                    </div>

                    <div id="security-permission-list-container" class="overflow-x-auto">
                    </div>

                    <div id="security-permission-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl flex flex-col max-h-[90vh]">
                            <h3 id="security-permission-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-permission-form" onsubmit="handleSecurityPermissionSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="sp-name" class="block text-sm font-medium text-wise-dark-gray">Security permission:</label>
                                            <input type="text" id="sp-name" name="spName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="sp-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="sp-description" name="spDescription" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                    </div>

                                    <h4 class="font-semibold text-wise-dark-gray mb-2">Menus</h4>
                                    <div class="border border-wise-border rounded-md p-4">
                                        <div id="sp-menu-filter" class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 pb-3 border-b border-wise-border">
                                            <span class="text-sm font-medium text-wise-dark-gray">Filter by:</span>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="All" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)" checked><span class="ml-2">All</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Configurations" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Configurations</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Gadgets" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Gadgets</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Processing" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Processing</span></label>
                                        </div>
                                        <div id="sp-menu-checkbox-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 max-h-60 overflow-y-auto">
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="sp-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeSecurityPermissionForm()">Cancel</button>
                                <button type="submit" form="security-permission-form" id="security-permission-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'configuration-user-profile': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">User Profile</h2>
                    <p class="text-wise-gray mb-4">Manage user profiles, permissions, and other user-specific settings.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showUserProfileForm('create')">
                            Create New User Profile
                        </button>
                        <input type="text" id="user-profile-search" placeholder="Search user profile..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterUserProfileList(this.value)">
                    </div>
                    <div id="user-profile-list-container" class="overflow-x-auto">
                    </div>
                    
                    <div id="user-profile-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
                            <h3 id="user-profile-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="user-profile-form" onsubmit="handleUserProfileSubmit(event)">
                                    <div class="flex space-x-2 mb-2 border-b">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-general">General</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-printers">Printers</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-locating">Locating</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-user-defined">User Defined Data</button>
                                    </div>

                                    <div id="up-general" class="tab-content">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-user" class="block text-sm font-medium text-wise-dark-gray">User:</label>
                                                <input type="text" id="up-user" name="user" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                                <input type="text" id="up-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-warehouse" class="block text-sm font-medium text-wise-dark-gray">Default warehouse:</label>
                                                <input type="text" id="up-default-warehouse" name="defaultWarehouse" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-shift" class="block text-sm font-medium text-wise-dark-gray">Shift:</label>
                                                <input type="text" id="up-shift" name="shift" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-menu" class="block text-sm font-medium text-wise-dark-gray">Menu:</label>
                                                <input type="text" id="up-menu" name="menu" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-language" class="block text-sm font-medium text-wise-dark-gray">Language:</label>
                                                <input type="text" id="up-language" name="language" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <label class="inline-flex items-center">
                                                <input type="checkbox" id="up-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div id="up-printers" class="tab-content hidden">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-default-label-printer" class="block text-sm font-medium text-wise-dark-gray">Default label printer:</label>
                                                <input type="text" id="up-default-label-printer" name="defaultLabelPrinter" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-report-printer" class="block text-sm font-medium text-wise-dark-gray">Default report printer:</label>
                                                <input type="text" id="up-default-report-printer" name="defaultReportPrinter" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                    </div>

                                    <div id="up-locating" class="tab-content hidden">
                                        <div class="space-y-3">
                                            <label class="flex items-center">
                                                <input type="checkbox" id="up-locate-empty-lpn" name="locateEmptyLpn" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Locate empty container for LPN</span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="checkbox" id="up-locate-empty-item" name="locateEmptyItem" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Locate empty container for item</span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="checkbox" id="up-locate-lpn-staging" name="locateLpnStaging" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Locate LPN to staging</span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="checkbox" id="up-locate-item-staging" name="locateItemStaging" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Locate item to staging</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div id="up-user-defined" class="tab-content hidden">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${Array.from({ length: 8 }, (_, i) => `
                                            <div>
                                                <label for="up-udf${i + 1}" class="block text-sm font-medium text-wise-dark-gray">User defined field ${i + 1}:</label>
                                                <input type="text" id="up-udf${i + 1}" name="udf${i + 1}" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray" onclick="closeUserProfileForm()">Cancel</button>
                                <button type="submit" form="user-profile-form" id="user-profile-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-lg hover:bg-blue-700 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
        };

        window.displayContentInMainDashboard = function(id) {
            selectCategory(id);
            closeSearchOverlay();
        };

        window.removeOverlayFilter = function(filterName) {
            activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());

            const filterButton = document.getElementById(`overlay-filter-${filterName}`);
            if (filterButton) {
                filterButton.classList.add('hidden');
            }
            const query = document.getElementById('overlay-search-input').value;
            performSearch(query, 'overlay');
        };

        window.removeAllOverlayFilters = function() {
            activeFilters = [];

            const filterContainer = document.getElementById('overlay-search-filters');
            if (filterContainer) {
                const filterButtons = filterContainer.querySelectorAll('span[id^="overlay-filter-"]');
                filterButtons.forEach(button => button.classList.add('hidden'));
            }

            const query = document.getElementById('overlay-search-input').value;
            performSearch(query, 'overlay');
        };

        // Old addSearchHistory function removed, replaced by global addHistory
        // function addSearchHistory(query) {
        //     if (query && !searchHistory.includes(query)) {
        //         searchHistory.unshift(query);
        //         searchHistory = searchHistory.slice(0, 5);
        //         localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        //     }
        // }

        let currentCategory = 'configuration';
        let activeFilters = [];
        // Old searchHistory variable removed, replaced by getHistory() from localStorage
        // let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        window.searchItems = [
            { id: 'configuration-warehouse', title: 'Warehouse Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'locating-strategies', title: 'Locating Strategies', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'locating-rule', title: 'Locating Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-user-profile', title: 'User Profile Management', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'security-group', title: 'Security Group Management', category: 'System Management', lastUpdated: 'Just now' },
            { id: 'security-permission', title: 'Security Permission Management', category: 'System Management', lastUpdated: 'Just now' },
        ];

        window.parentMapping = {
            'configuration-warehouse': 'configuration',
            'locating-strategies': 'configuration',
            'locating-rule': 'configuration',
            'configuration-user-profile': 'configuration',
            'security-group': 'configuration',
            'security-permission': 'configuration',
        };

        window.getCurrentSelectedMenus = function() {
            const container = document.getElementById('sp-menu-checkbox-list');
            if (!container) return [];
            const checkedInputs = container.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checkedInputs).map(input => input.value);
        }

        function saveWarehouses() { localStorage.setItem('warehouses', JSON.stringify(warehouses)); }
        function saveZoneTypes() { localStorage.setItem('zoneTypes', JSON.stringify(zoneTypes)); }
        function saveLocationTypes() { localStorage.setItem('locationTypes', JSON.stringify(locationTypes)); }
        function saveLocatingStrategies() { localStorage.setItem('locatingStrategies', JSON.stringify(locatingStrategies)); }
        function saveLocatingRules() { localStorage.setItem('locatingRules', JSON.stringify(locatingRules)); }
        window.saveUserProfiles = function() { localStorage.setItem('userProfiles', JSON.stringify(window.userProfiles)); }
        function saveSecurityGroups() { localStorage.setItem('securityGroups', JSON.stringify(securityGroups)); }
        function saveSecurityPermissions() { localStorage.setItem('securityPermissions', JSON.stringify(securityPermissions)); }

        let warehouses = [
            { id: 'WH001', warehouse: 'Main Warehouse', description: 'Central storage facility', inactive: false, address1: '123 Warehouse St', address2: '', address3: '', city: 'Bandung', state: 'West Java', postalCode: '40001', country: 'Indonesia', faxNumber: '123-456-7890', attentionTo: 'Warehouse Manager', phoneNumber: '08123456789', emailAddress: 'main@warehouse.com', uccEanNumber: '1234567890123', sameAsWarehouseAddressReturn: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '/mnt/slotting', defaultLocationForUnslottedItems: 'UNSLOTTED', renderedDocumentPdfFileDirectory: '/reports/pdf', userDefinedField1: 'UDF1_WH001', userDefinedField2: 'UDF2_WH001', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '' },
            { id: 'WH002', warehouse: 'East Distribution Center', description: 'Handles eastern region distribution', inactive: true, address1: '456 Distribution Ave', address2: '', address3: '', city: 'Surabaya', state: 'East Java', postalCode: '60001', country: 'Indonesia', faxNumber: '098-765-4321', attentionTo: 'Distribution Manager', phoneNumber: '08198765432', emailAddress: 'east@distribution.com', uccEanNumber: '9876543210987', sameAsWarehouseAddressReturn: true, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: 'UDF1_WH002', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '' },
        ];

        window.zoneTypes = [
            { id: 'ZT001', identifier: 'ZONE_A', recordType: 'ZONETYPE', description: 'Picking Zone A', inactive: false, systemCreated: true },
            { id: 'ZT002', identifier: 'ZONE_B', recordType: 'ZONETYPE', description: 'Storage Zone B', inactive: false, systemCreated: false },
            { id: 'ZT003', identifier: 'ZONE_C', recordType: 'ZONETYPE', description: 'Receiving Zone C', inactive: true, systemCreated: false },
        ];

        window.locationTypes = [
            { id: 'LT001', locationType: 'PALLET', length: 120, lengthUM: 'Centimeters', width: 100, height: 150, maximumWeight: 1000, weightUM: 'Kilograms', inactive: false, userDefinedField1: 'PALLET_UDF1', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '' },
            { id: 'LT002', locationType: 'SHELF', length: 60, lengthUM: 'Centimeters', width: 40, height: 30, maximumWeight: 50, weightUM: 'Kilograms', inactive: false, userDefinedField1: 'SHELF_UDF1', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '' },
        ];

        window.locatingStrategies = [
            { id: 'LS001', identifier: 'FIFO', recordType: 'LOCSTRAT', description: 'First-In, First-Out', inactive: false, systemCreated: true },
            { id: 'LS002', identifier: 'LIFO', recordType: 'LOCSTRAT', description: 'Last-In, First-Out', inactive: false, systemCreated: false },
            { id: 'LS003', identifier: 'CLOSEST', recordType: 'LOCSTRAT', description: 'Closest Location', inactive: true, systemCreated: false },
        ];

        let locatingRules = [
            { id: 'LR001', ruleName: 'Standard Putaway', description: 'Default rule for new items', delayedLocating: false, inactive: false, detailRecords: [] },
            { id: 'LR002', ruleName: 'Bulk Storage', description: 'Rule for large volume items', delayedLocating: true, inactive: false, detailRecords: [] },
        ];

        window.userProfiles = [
            {
                id: 'UP001',
                user: 'admin',
                description: 'System Administrator',
                defaultWarehouse: 'WH001',
                shift: 'Day',
                menu: 'Full Access',
                language: 'English',
                inactive: false,
                defaultLabelPrinter: 'PRINTER_A',
                defaultReportPrinter: 'PRINTER_B',
                locateEmptyLpn: true,
                locateEmptyItem: true,
                locateLpnStaging: false,
                locateItemStaging: false,
                udf1: 'Admin_UDF1',
                udf2: '',
                udf3: '',
                udf4: '',
                udf5: '',
                udf6: '',
                udf7: '',
                udf8: '',
                cycleCounting: 'Default',
                shipping: 'Default',
                packing: 'Default',
                workOrder: 'Default',
                receiving: 'Standard',
                reportDirectory: '/reports/admin',
                myLinkDirectory: '/links/admin',
                defaultChart: '',
                desktopTemplate: 'Adminisitrasi',
                rfStyleSheet: '',
                excelExportDirectory: '/export/excel'
            },
        ];

        let securityGroups = [
            { id: 'SG001', groupName: 'Administrators', description: 'Full system access', inactive: false, users: ['admin'], userDefinedField1: 'SG_UDF1_Admin', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '' },
            { id: 'SG002', groupName: 'Warehouse Staff', description: 'Access to warehouse operations', inactive: false, users: ['picker1'], userDefinedField1: 'SG_UDF1_Warehouse', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '' },
        ];

        let securityPermissions = [
            { id: 'SP001', spName: 'Admin_Permissions', spDescription: 'All administrative menus', inactive: false, menus: ['Configuration', 'System Management', 'Gadgets', 'Processing'] },
            { id: 'SP002', spName: 'Picker_Permissions', spDescription: 'Picking and locating menus', inactive: false, menus: ['Picking Menu', 'Locating'] },
        ];

        window.allMenus = [
            { name: 'Warehouse', category: 'Configurations' },
            { name: 'Zone Type', category: 'Configurations' },
            { name: 'User Profile', category: 'Configurations' },
            { name: 'Dashboard', category: 'Gadgets' },
            { name: 'Work Insight', category: 'Gadgets' },
            { name: 'Receiving', category: 'Processing' },
            { name: 'Shipping', category: 'Processing' },
        ];

        window.allWarehouses = [
            { id: 'WH001', name: 'DCI' },
            { id: 'WH002', name: 'DCI' },
            { id: 'WH003', name: 'DCI' },
            { id: 'WH004', name: 'DCI' },
            { id: 'WH005', name: 'DCI' },
            { id: 'WH006', name: 'DCI' },
            { id: 'WH007', name: 'DCI' },
            { id: 'WH008', name: 'DCI' },
            { id: 'WH009', name: 'DCI' },
            { id: 'WH010', name: 'DCI' },
        ];

        window.defaultStandardOptions = ['Default', 'Standard'];

        window.toggleChildren = function(parentId) {
            const childrenContainer = document.getElementById(parentId + '-children');
            const parentElement = document.getElementById(parentId);
            const arrowIcon = document.getElementById(parentId + '-arrow');

            if (childrenContainer && parentElement && arrowIcon) {
                childrenContainer.classList.toggle('hidden');
                const isExpanded = !childrenContainer.classList.contains('hidden');
                parentElement.setAttribute('aria-expanded', isExpanded);
                arrowIcon.classList.toggle('rotate-180', isExpanded);
            }
        };

        window.selectCategory = function(category) {
            const bodyEl = document.body;
            const mainEl = document.querySelector('main');

            // Mengatur ulang style body dan main ke default setiap kali fungsi dipanggil.
            bodyEl.classList.add('overflow-x-hidden');
            if (mainEl) mainEl.classList.remove('min-w-0');

            // Menerapkan style khusus HANYA untuk halaman 'location' agar scrollbar bisa muncul.
            if (category === 'location') {
                bodyEl.classList.remove('overflow-x-hidden');
                if (mainEl) mainEl.classList.add('min-w-0');
            }

            // Menghapus status aktif dari semua item sidebar untuk reset.
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('bg-wise-light-gray', 'font-semibold');
            });
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                item.classList.add('text-wise-gray');
            });

            // Memberikan style aktif pada item sidebar yang sedang dipilih.
            const childElement = document.querySelector(`.sidebar-child[onclick="selectCategory('${category}')"]`);
            if (childElement) {
                childElement.classList.add('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                childElement.classList.remove('text-wise-gray');

                // Jika yang dipilih adalah sub-menu, buka menu parent-nya.
                const parentId = parentMapping[category];
                if (parentId) {
                    const parentElement = document.getElementById(parentId);
                    const parentChildrenContainer = document.getElementById(parentId + '-children');
                    
                    if (parentElement) {
                        parentElement.classList.add('bg-wise-light-gray', 'font-semibold');
                    }
                    if (parentChildrenContainer && parentChildrenContainer.classList.contains('hidden')) {
                        toggleChildren(parentId);
                    }
                }
            } else {
                // Jika yang dipilih adalah menu utama.
                const mainElement = document.getElementById(category);
                if(mainElement) {
                    mainElement.classList.add('bg-wise-light-gray', 'font-semibold');
                }
            }

            // Menyimpan kategori yang sedang aktif dan menampilkan kontennya.
            currentCategory = category;
            const content = contentData[category];
            const mainContent = document.getElementById('default-content-area');
            if (content && content.full) {
                mainContent.innerHTML = content.full;
            } else {
                mainContent.innerHTML = `<h2 class="text-2xl font-bold">Content for ${category}</h2><p>Content not found.</p>`;
            }

            // Memanggil fungsi render yang spesifik untuk setiap halaman.
            if (category === 'configuration-warehouse') renderWarehouseList();
            else if (category === 'location-type') renderLocationTypeList();
            else if (category === 'locating-strategies') renderLocatingStrategyList();
            else if (category === 'locating-rule') renderLocatingRuleList();
            else if (category === 'configuration-user-profile') renderUserProfileList();
            else if (category === 'security-group') renderSecurityGroupList();
            else if (category === 'security-permission') renderSecurityPermissionList();
            else if (category === 'allocation-rule') renderAllocationRuleList();
            else if (category === 'allocation-strategies') renderAllocationStrategyList();
            else if (category === 'allocation-rule-assignment') renderAllocationRuleAssignmentList();
            else if (category === 'allocation-location-selection') renderAllocationLocationSelectionList();
            else if (category === 'allocation-rule-assignment-criteria') renderARACList();
            else if (category === 'zone-type') renderZoneTypeList();
            else if (category === 'location') renderLocationList();
            else if (category === 'customer') renderCustomerList(); 

            // Memberi tahu script lain bahwa konten telah berubah.
            document.dispatchEvent(new CustomEvent('content:rendered', { detail: { key: category } }));

            // Menutup sidebar di tampilan mobile setelah memilih kategori.
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        };

        window.toggleSidebar = function() {
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('translate-x-0');
            mainContent.classList.toggle('md:ml-64');
        };

        window.setupTabSwitching = function(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const tabButtons = modal.querySelectorAll('.tab-button');
            const tabContents = modal.querySelectorAll('.tab-content');

            const activateTab = (tabName) => {
                tabButtons.forEach(button => {
                    if (button.dataset.tab === tabName) {
                        button.classList.add('text-wise-primary', 'border-wise-primary');
                        button.classList.remove('text-wise-gray', 'border-transparent');
                    } else {
                        button.classList.remove('text-wise-primary', 'border-wise-primary');
                        button.classList.add('text-wise-gray', 'border-transparent');
                    }
                });

                tabContents.forEach(content => {
                    if (content.id === tabName) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
            };

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    activateTab(button.dataset.tab);
                });
            });

            if (tabButtons.length > 0) {
                activateTab(tabButtons[0].dataset.tab);
            }
        };

        window.renderWarehouseList = function(filter = '') {
            const container = document.getElementById('warehouse-list-container');
            if (!container) return;

            const filteredWarehouses = warehouses.filter(wh =>
                wh.warehouse.toLowerCase().includes(filter.toLowerCase()) ||
                wh.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Warehouse</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredWarehouses.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="4" class="py-3 px-6 text-center">No warehouses found.</td>
                    </tr>
                `;
            } else {
                filteredWarehouses.forEach(wh => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${wh.warehouse}</td>
                            <td class="py-3 px-6 text-left">${wh.description}</td>
                            <td class="py-3 px-6 text-left">${wh.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showWarehouseForm('edit', '${wh.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteWarehouse('${wh.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterWarehouseList = function(value) {
            renderWarehouseList(value);
        };

        window.showWarehouseForm = function(mode, id = null) {
            const modal = document.getElementById('warehouse-form-modal');
            const form = document.getElementById('warehouse-form');
            const title = document.getElementById('warehouse-form-title');
            const submitButton = document.getElementById('warehouse-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            setupTabSwitching('warehouse-form-modal');

            form.querySelectorAll('input, select').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Warehouse';
                submitButton.textContent = 'Save';
                document.getElementById('same-as-warehouse-address-return').checked = false;
                toggleReturnAddressFields();
            } else {
                title.textContent = 'Edit Warehouse';
                submitButton.textContent = 'Update';
                const warehouse = warehouses.find(wh => wh.id === id);
                if (warehouse) {
                    document.getElementById('warehouse-name').value = warehouse.warehouse;
                    document.getElementById('warehouse-description').value = warehouse.description;
                    document.getElementById('address1').value = warehouse.address1;
                    document.getElementById('address2').value = warehouse.address2;
                    document.getElementById('address3').value = warehouse.address3;
                    document.getElementById('city').value = warehouse.city;
                    document.getElementById('state').value = warehouse.state;
                    document.getElementById('postal-code').value = warehouse.postalCode;
                    document.getElementById('country').value = warehouse.country;
                    document.getElementById('fax-number').value = warehouse.faxNumber;
                    document.getElementById('attention-to').value = warehouse.attentionTo;
                    document.getElementById('phone-number').value = warehouse.phoneNumber;
                    document.getElementById('email-address').value = warehouse.emailAddress;
                    document.getElementById('ucc-ean-number').value = warehouse.uccEanNumber;
                    document.getElementById('warehouse-inactive').checked = warehouse.inactive;
                    document.getElementById('slotting-move-file-directory').value = warehouse.slottingMoveFileDirectory;
                    document.getElementById('default-location-for-unslotted-items').value = warehouse.defaultLocationForUnslottedItems;
                    document.getElementById('rendered-document-pdf-file-directory').value = warehouse.renderedDocumentPdfFileDirectory;
                    document.getElementById('user-defined-field1').value = warehouse.userDefinedField1;
                    document.getElementById('user-defined-field2').value = warehouse.userDefinedField2;
                    document.getElementById('user-defined-field3').value = warehouse.userDefinedField3;
                    document.getElementById('user-defined-field4').value = warehouse.userDefinedField4;
                    document.getElementById('user-defined-field5').value = warehouse.userDefinedField5;
                    document.getElementById('user-defined-field6').value = warehouse.userDefinedField6;
                    document.getElementById('user-defined-field7').value = warehouse.userDefinedField7;
                    document.getElementById('user-defined-field8').value = warehouse.userDefinedField8;

                    document.getElementById('same-as-warehouse-address-return').checked = warehouse.sameAsWarehouseAddressReturn;
                    toggleReturnAddressFields();

                    document.getElementById('return-name').value = warehouse.returnName;
                    document.getElementById('return-address1').value = warehouse.returnAddress1;
                    document.getElementById('return-address2').value = warehouse.returnAddress2;
                    document.getElementById('return-address3').value = warehouse.returnAddress3;
                    document.getElementById('return-city').value = warehouse.returnCity;
                    document.getElementById('return-state').value = warehouse.returnState;
                    document.getElementById('return-postal-code').value = warehouse.returnPostalCode;
                    document.getElementById('return-country').value = warehouse.returnCountry;
                    document.getElementById('return-fax-number').value = warehouse.returnFaxNumber;
                    document.getElementById('return-attention-to').value = warehouse.returnAttentionTo;
                    document.getElementById('return-phone-number').value = warehouse.returnPhoneNumber;
                    document.getElementById('return-email-address').value = warehouse.returnEmailAddress;
                    document.getElementById('return-ucc-ean-number').value = warehouse.returnUccEanNumber;

                    renderUserCheckboxes(warehouse.users);
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeWarehouseForm = function() {
            document.getElementById('warehouse-form-modal').classList.add('hidden');
            document.getElementById('warehouse-form-modal').classList.remove('flex');
        };

        window.handleWarehouseSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newWarehouse = {
                warehouse: form['warehouse'].value,
                description: form['description'].value,
                address1: form['address1'].value,
                address2: form['address2'].value,
                address3: form['address3'].value,
                city: form['city'].value,
                state: form['state'].value,
                postalCode: form['postalCode'].value,
                country: form['country'].value,
                faxNumber: form['faxNumber'].value,
                attentionTo: form['attentionTo'].value,
                phoneNumber: form['phoneNumber'].value,
                emailAddress: form['emailAddress'].value,
                uccEanNumber: form['uccEanNumber'].value,
                inactive: form['warehouse-inactive'].checked,
                sameAsWarehouseAddressReturn: form['same-as-warehouse-address-return'].checked,
                returnName: form['returnName'].value,
                returnAddress1: form['returnAddress1'].value,
                returnAddress2: form['returnAddress2'].value,
                returnAddress3: form['returnAddress3'].value,
                returnCity: form['returnCity'].value,
                returnState: form['returnState'].value,
                returnPostalCode: form['returnPostalCode'].value,
                returnCountry: form['returnCountry'].value,
                returnFaxNumber: form['returnFaxNumber'].value,
                returnAttentionTo: form['returnAttentionTo'].value,
                returnPhoneNumber: form['returnPhoneNumber'].value,
                returnEmailAddress: form['returnEmailAddress'].value,
                returnUccEanNumber: form['returnUccEanNumber'].value,
                slottingMoveFileDirectory: form['slottingMoveFileDirectory'].value,
                defaultLocationForUnslottedItems: form['defaultLocationForUnslottedItems'].value,
                renderedDocumentPdfFileDirectory: form['renderedDocumentPdfFileDirectory'].value,
                userDefinedField1: form['userDefinedField1'].value,
                userDefinedField2: form['userDefinedField2'].value,
                userDefinedField3: form['userDefinedField3'].value,
                userDefinedField4: form['userDefinedField4'].value,
                userDefinedField5: form['userDefinedField5'].value,
                userDefinedField6: form['userDefinedField6'].value,
                userDefinedField7: form['userDefinedField7'].value,
                userDefinedField8: form['userDefinedField8'].value,

                users: Array.from(form.querySelectorAll('#user-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value)
            };

            if (mode === 'create') {
                newWarehouse.id = 'WH' + String(warehouses.length + 1).padStart(3, '0');
                warehouses.push(newWarehouse);
                await showCustomAlert('Success', 'Warehouse created successfully!');
            } else {
                const index = warehouses.findIndex(wh => wh.id === id);
                if (index !== -1) {
                    warehouses[index] = { ...warehouses[index], ...newWarehouse };
                    await showCustomAlert('Success', 'Warehouse updated successfully!');
                }
            }
            saveWarehouses();
            closeWarehouseForm();
            renderWarehouseList();
        };

        window.deleteWarehouse = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this warehouse?');
            if (confirmed) {
                warehouses = warehouses.filter(wh => wh.id !== id);
                saveWarehouses();
                renderWarehouseList();
                await showCustomAlert('Deleted', 'Warehouse deleted successfully!');
            }
        };

        const allUsers = [
            { id: 'user1', name: 'John Doe' },
            { id: 'user2', name: 'Jane Smith' },
            { id: 'user3', name: 'Peter Jones' },
            { id: 'user4', name: 'Alice Brown' },
            { id: 'user5', name: 'Bob White' },
            { id: 'user6', name: 'Charlie Green' },
        ];

        window.renderUserCheckboxes = function(selectedUsers = []) {
            const container = document.getElementById('user-checkbox-list');
            if (!container) return;

            container.innerHTML = '';
            allUsers.forEach(user => {
                const isChecked = selectedUsers.includes(user.id);
                const div = document.createElement('div');
                div.className = 'flex items-center';
                div.innerHTML = `
                    <input type="checkbox" id="user-${user.id}" name="authorizedUsers" value="${user.id}" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${isChecked ? 'checked' : ''}>
                    <label for="user-${user.id}" class="ml-2 text-sm text-wise-dark-gray">${user.name}</label>
                `;
                container.appendChild(div);
            });
        };

        window.toggleAllUsers = function() {
            const checkAllCheckbox = document.getElementById('check-all-users');
            const userCheckboxes = document.querySelectorAll('#user-checkbox-list input[type="checkbox"]');
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = checkAllCheckbox.checked;
            });
        };

        window.toggleReturnAddressFields = function() {
            const sameAsCheckbox = document.getElementById('same-as-warehouse-address-return');
            const returnAddressFields = document.getElementById('return-address-fields');
            const fields = returnAddressFields.querySelectorAll('input, select');

            if (sameAsCheckbox.checked) {
                document.getElementById('return-name').value = document.getElementById('attention-to').value;
                document.getElementById('return-address1').value = document.getElementById('address1').value;
                document.getElementById('return-address2').value = document.getElementById('address2').value;
                document.getElementById('return-address3').value = document.getElementById('address3').value;
                document.getElementById('return-city').value = document.getElementById('city').value;
                document.getElementById('return-state').value = document.getElementById('state').value;
                document.getElementById('return-postal-code').value = document.getElementById('postal-code').value;
                document.getElementById('return-country').value = document.getElementById('country').value;
                document.getElementById('return-fax-number').value = document.getElementById('fax-number').value;
                document.getElementById('return-attention-to').value = document.getElementById('attention-to').value;
                document.getElementById('return-phone-number').value = document.getElementById('phone-number').value;
                document.getElementById('return-email-address').value = document.getElementById('email-address').value;
                document.getElementById('return-ucc-ean-number').value = document.getElementById('ucc-ean-number').value;

                fields.forEach(field => {
                    field.setAttribute('readonly', true);
                    field.classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                });
            } else {
                fields.forEach(field => {
                    field.removeAttribute('readonly');
                    field.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                });
                document.getElementById('return-name').value = '';
                document.getElementById('return-address1').value = '';
                document.getElementById('return-address2').value = '';
                document.getElementById('return-address3').value = '';
                document.getElementById('return-city').value = '';
                document.getElementById('return-state').value = '';
                document.getElementById('return-postal-code').value = '';
                document.getElementById('return-country').value = '';
                document.getElementById('return-fax-number').value = '';
                document.getElementById('return-attention-to').value = '';
                document.getElementById('return-phone-number').value = '';
                document.getElementById('return-email-address').value = '';
                document.getElementById('return-ucc-ean-number').value = '';
            }
        };


        window.renderZoneTypeList = function(filter = '') {
            const container = document.getElementById('zone-type-list-container');
            if (!container) return;

            const filteredZoneTypes = zoneTypes.filter(zoneType =>
                zoneType.identifier.toLowerCase().includes(filter.toLowerCase()) ||
                zoneType.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Record Type</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-left">System Created</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredZoneTypes.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="6" class="py-3 px-6 text-center">No zone types found.</td>
                    </tr>
                `;
            } else {
                filteredZoneTypes.forEach(zoneType => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${zoneType.identifier}</td>
                            <td class="py-3 px-6 text-left">${zoneType.recordType}</td>
                            <td class="py-3 px-6 text-left">${zoneType.description}</td>
                            <td class="py-3 px-6 text-left">${zoneType.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${zoneType.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showZoneTypeForm('edit', '${zoneType.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteZoneType('${zoneType.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterZoneTypeList = function(value) {
            renderZoneTypeList(value);
        };

        window.showZoneTypeForm = function(mode, id = null) {
            const modal = document.getElementById('zone-type-form-modal');
            const form = document.getElementById('zone-type-form');
            const title = document.getElementById('zone-type-form-title');
            const submitButton = document.getElementById('zone-type-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Zone Type';
                submitButton.textContent = 'Save';
                document.getElementById('zone-type-record-type').value = 'ZONETYPE';
                document.getElementById('zone-type-record-type').setAttribute('readonly', true);
                document.getElementById('zone-type-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
            } else {
                title.textContent = 'Edit Zone Type';
                submitButton.textContent = 'Update';
                const zoneType = zoneTypes.find(z => z.id === id);
                if (zoneType) {
                    document.getElementById('zone-type-identifier').value = zoneType.identifier;
                    document.getElementById('zone-type-record-type').value = zoneType.recordType;
                    document.getElementById('zone-type-description').value = zoneType.description;
                    document.getElementById('zone-type-inactive').checked = zoneType.inactive;
                    document.getElementById('zone-type-system-created').checked = zoneType.systemCreated;

                    if (zoneType.systemCreated) {
                        document.getElementById('zone-type-identifier').setAttribute('readonly', true);
                        document.getElementById('zone-type-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                        document.getElementById('zone-type-record-type').setAttribute('readonly', true);
                        document.getElementById('zone-type-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeZoneTypeForm = function() {
            document.getElementById('zone-type-form-modal').classList.add('hidden');
            document.getElementById('zone-type-form-modal').classList.remove('flex');
        };

        window.handleZoneTypeSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newZoneType = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['zone-type-inactive'].checked,
                systemCreated: form['zone-type-system-created'].checked,
            };

            if (mode === 'create') {
                newZoneType.id = 'ZT' + String(zoneTypes.length + 1).padStart(3, '0');
                zoneTypes.push(newZoneType);
                await showCustomAlert('Success', 'Zone Type created successfully!');
            } else {
                const index = zoneTypes.findIndex(z => z.id === id);
                if (index !== -1) {
                    zoneTypes[index] = { ...zoneTypes[index], ...newZoneType };
                    await showCustomAlert('Success', 'Zone Type updated successfully!');
                }
            }
            saveZoneTypes();
            closeZoneTypeForm();
            renderZoneTypeList();
        };

        window.deleteZoneType = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this zone type?');
            if (confirmed) {
                zoneTypes = zoneTypes.filter(zoneType => zoneType.id !== id);
                saveZoneTypes();
                renderZoneTypeList();
                await showCustomAlert('Deleted', 'Zone Type deleted successfully!');
            }
        };

        window.renderLocationTypeList = function(filter = '') {
            const container = document.getElementById('location-type-list-container');
            if (!container) return;

            const filteredLocationTypes = locationTypes.filter(lt =>
                lt.locationType.toLowerCase().includes(filter.toLowerCase()) ||
                lt.inactive.toString().toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Location Type</th>
                            <th class="py-3 px-6 text-left">Length (${filteredLocationTypes[0]?.lengthUM || 'CM'})</th>
                            <th class="py-3 px-6 text-left">Width (${filteredLocationTypes[0]?.lengthUM || 'CM'})</th>
                            <th class="py-3 px-6 text-left">Height (${filteredLocationTypes[0]?.lengthUM || 'CM'})</th>
                            <th class="py-3 px-6 text-left">Max Weight (${filteredLocationTypes[0]?.weightUM || 'KG'})</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredLocationTypes.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="7" class="py-3 px-6 text-center">No location types found.</td>
                    </tr>
                `;
            } else {
                filteredLocationTypes.forEach(lt => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${lt.locationType}</td>
                            <td class="py-3 px-6 text-left">${lt.length}</td>
                            <td class="py-3 px-6 text-left">${lt.width}</td>
                            <td class="py-3 px-6 text-left">${lt.height}</td>
                            <td class="py-3 px-6 text-left">${lt.maximumWeight}</td>
                            <td class="py-3 px-6 text-left">${lt.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showLocationTypeForm('edit', '${lt.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteLocationType('${lt.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterLocationTypeList = function(value) {
            renderLocationTypeList(value);
        };

        window.showLocationTypeForm = function(mode, id = null) {
            const modal = document.getElementById('location-type-form-modal');
            const form = document.getElementById('location-type-form');
            const title = document.getElementById('location-type-form-title');
            const submitButton = document.getElementById('location-type-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            setupTabSwitching('location-type-form-modal');

            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Location Type';
                submitButton.textContent = 'Save';
            } else {
                title.textContent = 'Edit Location Type';
                submitButton.textContent = 'Update';
                const locationType = locationTypes.find(lt => lt.id === id);
                if (locationType) {
                    document.getElementById('location-type-name').value = locationType.locationType;
                    document.getElementById('location-type-length').value = locationType.length;
                    document.getElementById('location-type-length-um').value = locationType.lengthUM;
                    document.getElementById('location-type-width').value = locationType.width;
                    document.getElementById('location-type-height').value = locationType.height;
                    document.getElementById('location-type-maximum-weight').value = locationType.maximumWeight;
                    document.getElementById('location-type-weight-um').value = locationType.weightUM;
                    document.getElementById('location-type-inactive').checked = locationType.inactive;
                    document.getElementById('lt-user-defined-field1').value = locationType.userDefinedField1;
                    document.getElementById('lt-user-defined-field2').value = locationType.userDefinedField2;
                    document.getElementById('lt-user-defined-field3').value = locationType.userDefinedField3;
                    document.getElementById('lt-user-defined-field4').value = locationType.userDefinedField4;
                    document.getElementById('lt-user-defined-field5').value = locationType.userDefinedField5;
                    document.getElementById('lt-user-defined-field6').value = locationType.userDefinedField6;
                    document.getElementById('lt-user-defined-field7').value = locationType.userDefinedField7;
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeLocationTypeForm = function() {
            document.getElementById('location-type-form-modal').classList.add('hidden');
            document.getElementById('location-type-form-modal').classList.remove('flex');
        };

        window.handleLocationTypeSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newLocationType = {
                locationType: form['locationType'].value,
                length: parseFloat(form['length'].value),
                lengthUM: form['lengthUM'].value,
                width: parseFloat(form['width'].value),
                height: parseFloat(form['height'].value),
                maximumWeight: parseFloat(form['maximumWeight'].value),
                weightUM: form['weightUM'].value,
                inactive: form['location-type-inactive'].checked,
                userDefinedField1: form['userDefinedField1'].value,
                userDefinedField2: form['userDefinedField2'].value,
                userDefinedField3: form['userDefinedField3'].value,
                userDefinedField4: form['userDefinedField4'].value,
                userDefinedField5: form['userDefinedField5'].value,
                userDefinedField6: form['userDefinedField6'].value,
                userDefinedField7: form['userDefinedField7'].value,
            };

            if (mode === 'create') {
                newLocationType.id = 'LT' + String(locationTypes.length + 1).padStart(3, '0');
                locationTypes.push(newLocationType);
                await showCustomAlert('Success', 'Location Type created successfully!');
            } else {
                const index = locationTypes.findIndex(lt => lt.id === id);
                if (index !== -1) {
                    locationTypes[index] = { ...locationTypes[index], ...newLocationType };
                    await showCustomAlert('Success', 'Location Type updated successfully!');
                }
            }
            saveLocationTypes();
            closeLocationTypeForm();
            renderLocationTypeList();
        };

        window.deleteLocationType = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this location type?');
            if (confirmed) {
                locationTypes = locationTypes.filter(lt => lt.id !== id);
                saveLocationTypes();
                renderLocationTypeList();
                await showCustomAlert('Deleted', 'Location Type deleted successfully!');
            }
        };

        window.renderLocatingStrategyList = function(filter = '') {
            const container = document.getElementById('locating-strategy-list-container');
            if (!container) return;

            const filteredStrategies = locatingStrategies.filter(ls =>
                ls.identifier.toLowerCase().includes(filter.toLowerCase()) ||
                ls.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Record Type</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-left">System Created</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredStrategies.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="6" class="py-3 px-6 text-center">No locating strategies found.</td>
                    </tr>
                `;
            } else {
                filteredStrategies.forEach(ls => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${ls.identifier}</td>
                            <td class="py-3 px-6 text-left">${ls.recordType}</td>
                            <td class="py-3 px-6 text-left">${ls.description}</td>
                            <td class="py-3 px-6 text-left">${ls.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${ls.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showLocatingStrategyForm('edit', '${ls.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteLocatingStrategy('${ls.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterLocatingStrategyList = function(value) {
            renderLocatingStrategyList(value);
        };

        window.showLocatingStrategyForm = function(mode, id = null) {
            const modal = document.getElementById('locating-strategy-form-modal');
            const form = document.getElementById('locating-strategy-form');
            const title = document.getElementById('locating-strategy-form-title');
            const submitButton = document.getElementById('locating-strategy-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Locating Strategy';
                submitButton.textContent = 'Save';
                document.getElementById('locating-strategy-record-type').value = 'LOCSTRAT';
                document.getElementById('locating-strategy-record-type').setAttribute('readonly', true);
                document.getElementById('locating-strategy-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                document.getElementById('locating-strategy-system-created').checked = false;
            } else {
                title.textContent = 'Edit Locating Strategy';
                submitButton.textContent = 'Update';
                const strategy = locatingStrategies.find(ls => ls.id === id);
                if (strategy) {
                    document.getElementById('locating-strategy-identifier').value = strategy.identifier;
                    document.getElementById('locating-strategy-record-type').value = strategy.recordType;
                    document.getElementById('locating-strategy-description').value = strategy.description;
                    document.getElementById('locating-strategy-inactive').checked = strategy.inactive;
                    document.getElementById('locating-strategy-system-created').checked = strategy.systemCreated;

                    if (strategy.systemCreated) {
                        document.getElementById('locating-strategy-identifier').setAttribute('readonly', true);
                        document.getElementById('locating-strategy-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                        document.getElementById('locating-strategy-record-type').setAttribute('readonly', true);
                        document.getElementById('locating-strategy-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                    document.getElementById('locating-strategy-system-created').removeAttribute('disabled');
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeLocatingStrategyForm = function() {
            document.getElementById('locating-strategy-form-modal').classList.add('hidden');
            document.getElementById('locating-strategy-form-modal').classList.remove('flex');
        };

        window.handleLocatingStrategySubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newStrategy = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['locating-strategy-inactive'].checked,
                systemCreated: form['locating-strategy-system-created'].checked,
            };

            if (mode === 'create') {
                newStrategy.id = 'LS' + String(locatingStrategies.length + 1).padStart(3, '0');
                locatingStrategies.push(newStrategy);
                await showCustomAlert('Success', 'Locating Strategy created successfully!');
            } else {
                const index = locatingStrategies.findIndex(ls => ls.id === id);
                if (index !== -1) {
                    locatingStrategies[index] = { ...locatingStrategies[index], ...newStrategy };
                    await showCustomAlert('Success', 'Locating Strategy updated successfully!');
                }
            }
            saveLocatingStrategies();
            closeLocatingStrategyForm();
            renderLocatingStrategyList();
        };

        window.deleteLocatingStrategy = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this locating strategy?');
            if (confirmed) {
                locatingStrategies = locatingStrategies.filter(ls => ls.id !== id);
                saveLocatingStrategies();
                renderLocatingStrategyList();
                await showCustomAlert('Deleted', 'Locating Strategy deleted successfully!');
            }
        };

        window.renderLocatingRuleList = function(filter = '') {
            const container = document.getElementById('locating-rule-list-container');
            if (!container) return;

            const filteredRules = locatingRules.filter(lr =>
                lr.ruleName.toLowerCase().includes(filter.toLowerCase()) ||
                lr.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Rule Name</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Delayed Locating</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredRules.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="5" class="py-3 px-6 text-center">No locating rules found.</td>
                    </tr>
                `;
            } else {
                filteredRules.forEach(lr => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${lr.ruleName}</td>
                            <td class="py-3 px-6 text-left">${lr.description}</td>
                            <td class="py-3 px-6 text-left">${lr.delayedLocating ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${lr.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showLocatingRuleForm('edit', '${lr.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteLocatingRule('${lr.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterLocatingRuleList = function(value) {
            renderLocatingRuleList(value);
        };

        window.showLocatingRuleForm = function(mode, id = null) {
            const modal = document.getElementById('locating-rule-form-modal');
            const form = document.getElementById('locating-rule-form');
            const title = document.getElementById('locating-rule-form-title');
            const submitButton = document.getElementById('locating-rule-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            if (mode === 'create') {
                title.textContent = 'Create New Locating Rule';
                submitButton.textContent = 'Save';
                document.getElementById('locating-rule-detail-records-container').classList.add('bg-wise-light-gray', 'cursor-not-allowed');
                document.getElementById('detail-records-placeholder').classList.remove('hidden');
                document.getElementById('detail-records-list').innerHTML = '';
                document.getElementById('add-detail-record-btn').setAttribute('disabled', true);
            } else {
                title.textContent = 'Edit Locating Rule';
                submitButton.textContent = 'Update';
                const rule = locatingRules.find(lr => lr.id === id);
                if (rule) {
                    document.getElementById('locating-rule-name').value = rule.ruleName;
                    document.getElementById('locating-rule-description').value = rule.description;
                    document.getElementById('locating-rule-delayed-locating').checked = rule.delayedLocating;
                    document.getElementById('locating-rule-inactive').checked = rule.inactive;

                    document.getElementById('locating-rule-detail-records-container').classList.remove('bg-wise-light-gray', 'cursor-not-allowed');
                    document.getElementById('detail-records-placeholder').classList.add('hidden');
                    document.getElementById('add-detail-record-btn').removeAttribute('disabled');
                    renderDetailRecords(rule.detailRecords);
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeLocatingRuleForm = function() {
            document.getElementById('locating-rule-form-modal').classList.add('hidden');
            document.getElementById('locating-rule-form-modal').classList.remove('flex');
        };

        window.handleLocatingRuleSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const detailRecords = Array.from(document.querySelectorAll('#detail-records-list .detail-record-item')).map(item => {
                return {
                    sequence: parseInt(item.querySelector('[name="detail-sequence"]').value),
                    locatingStrategy: item.querySelector('[name="detail-locating-strategy"]').value,
                    locationType: item.querySelector('[name="detail-location-type"]').value,
                    zoneType: item.querySelector('[name="detail-zone-type"]').value,
                    inactive: item.querySelector('[name="detail-inactive"]').checked,
                };
            });

            const newRule = {
                ruleName: form['ruleName'].value,
                description: form['description'].value,
                delayedLocating: form['locating-rule-delayed-locating'].checked,
                inactive: form['locating-rule-inactive'].checked,
                detailRecords: detailRecords
            };

            if (mode === 'create') {
                newRule.id = 'LR' + String(locatingRules.length + 1).padStart(3, '0');
                locatingRules.push(newRule);
                await showCustomAlert('Success', 'Locating Rule created successfully!');
            } else {
                const index = locatingRules.findIndex(lr => lr.id === id);
                if (index !== -1) {
                    locatingRules[index] = { ...locatingRules[index], ...newRule };
                    await showCustomAlert('Success', 'Locating Rule updated successfully!');
                }
            }
            saveLocatingRules();
            closeLocatingRuleForm();
            renderLocatingRuleList();
        };

        window.deleteLocatingRule = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this locating rule?');
            if (confirmed) {
                locatingRules = locatingRules.filter(lr => lr.id !== id);
                saveLocatingRules();
                renderLocatingRuleList();
                await showCustomAlert('Deleted', 'Locating Rule deleted successfully!');
            }
        };

        window.checkLocatingRuleFormValidity = function() {
            const ruleNameInput = document.getElementById('locating-rule-name');
            const descriptionInput = document.getElementById('locating-rule-description');
            const detailRecordsContainer = document.getElementById('locating-rule-detail-records-container');
            const detailRecordsPlaceholder = document.getElementById('detail-records-placeholder');
            const addDetailRecordBtn = document.getElementById('add-detail-record-btn');

            if (ruleNameInput.value.trim() !== '' && descriptionInput.value.trim() !== '') {
                detailRecordsContainer.classList.remove('bg-wise-light-gray', 'cursor-not-allowed');
                detailRecordsPlaceholder.classList.add('hidden');
                addDetailRecordBtn.removeAttribute('disabled');
            } else {
                detailRecordsContainer.classList.add('bg-wise-light-gray', 'cursor-not-allowed');
                detailRecordsPlaceholder.classList.remove('hidden');
                addDetailRecordBtn.setAttribute('disabled', true);
                document.getElementById('detail-records-list').innerHTML = '';
            }
        };

        window.addDetailRecord = function(record = {}) {
            const detailRecordsList = document.getElementById('detail-records-list');
            const newIndex = detailRecordsList.children.length;

            const div = document.createElement('div');
            div.className = 'detail-record-item p-3 border border-wise-border rounded-md bg-white relative';
            div.innerHTML = `
                <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="removeDetailRecord(this)">
                    <svg xmlns="http://www.3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label for="detail-sequence-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Sequence:</label>
                        <input type="number" id="detail-sequence-${newIndex}" name="detail-sequence" value="${record.sequence || (newIndex + 1) * 10}" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                    </div>
                    <div>
                        <label for="detail-locating-strategy-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Locating Strategy:</label>
                        <select id="detail-locating-strategy-${newIndex}" name="detail-locating-strategy" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${locatingStrategies.map(ls => `<option value="${ls.identifier}" ${record.locatingStrategy === ls.identifier ? 'selected' : ''}>${ls.identifier} - ${ls.description}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="detail-location-type-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Location Type:</label>
                        <select id="detail-location-type-${newIndex}" name="detail-location-type" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${locationTypes.map(lt => `<option value="${lt.locationType}" ${record.locationType === lt.locationType ? 'selected' : ''}>${lt.locationType}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="detail-zone-type-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Zone Type:</label>
                        <select id="detail-zone-type-${newIndex}" name="detail-zone-type" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${zoneTypes.map(z => `<option value="${z.identifier}" ${record.zoneType === z.identifier ? 'selected' : ''}>${z.identifier}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-span-full">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="detail-inactive-${newIndex}" name="detail-inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${record.inactive ? 'checked' : ''}>
                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                        </label>
                    </div>
                </div>
            `;
            detailRecordsList.appendChild(div);
        };

        window.renderDetailRecords = function(records) {
            const detailRecordsList = document.getElementById('detail-records-list');
            detailRecordsList.innerHTML = '';
            records.sort((a, b) => a.sequence - b.sequence);
            records.forEach(record => addDetailRecord(record));
        };

        window.removeDetailRecord = function(button) {
            const recordItem = button.closest('.detail-record-item');
            if (recordItem) {
                recordItem.remove();
            }
        };

        function replaceWarehouseInputWithDropdown(selectedValue = '') {
            const originalInput = document.getElementById('up-default-warehouse');
            if (!originalInput) {
                return;
            }

            if (originalInput.tagName === 'SELECT') {
                originalInput.value = selectedValue;
                return;
            }

            const selectDropdown = document.createElement('select');
            selectDropdown.id = originalInput.id;
            selectDropdown.name = originalInput.name;
            selectDropdown.className = originalInput.className;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Pilih Warehouse';
            selectDropdown.appendChild(defaultOption);

            window.allWarehouses.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.id;
                option.textContent = warehouse.name;
                selectDropdown.appendChild(option);
            });

            selectDropdown.value = selectedValue;

            originalInput.parentNode.replaceChild(selectDropdown, originalInput);
        }

        window.renderUserProfileList = function(filter = '') {
            const container = document.getElementById('user-profile-list-container');
            if (!container) return;

            const filteredUserProfiles = userProfiles.filter(up =>
                up.user.toLowerCase().includes(filter.toLowerCase()) ||
                up.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">User</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Default Warehouse</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredUserProfiles.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="5" class="py-3 px-6 text-center">No user profiles found.</td>
                    </tr>
                `;
            } else {
                filteredUserProfiles.forEach(up => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${up.user}</td>
                            <td class="py-3 px-6 text-left">${up.description}</td>
                            <td class="py-3 px-6 text-left">${up.defaultWarehouse}</td>
                            <td class="py-3 px-6 text-left">${up.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showUserProfileForm('edit', '${up.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteUserProfile('${up.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterUserProfileList = function(value) {
            renderUserProfileList(value);
        };

        window.showUserProfileForm = function(mode, id = null) {
            const modal = document.getElementById('user-profile-form-modal');
            const form = document.getElementById('user-profile-form');
            const title = document.getElementById('user-profile-form-title');
            const submitButton = document.getElementById('user-profile-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;
            window.setupTabSwitching('user-profile-form-modal');
            form.querySelectorAll('input, select').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            });

            const userProfile = mode === 'edit' ? window.userProfiles.find(up => up.id === id) : null;

            if (mode === 'create') {
                title.textContent = 'Create New User Profile';
                submitButton.textContent = 'Save';
                form.querySelectorAll('input[name$="AccessType"][value="All"]').forEach(radio => radio.checked = true);
            } else {
                title.textContent = 'Edit User Profile';
                submitButton.textContent = 'Update';
                if (userProfile) {
                    form['user'].value = userProfile.user || '';
                    form['description'].value = userProfile.description || '';
                    form['defaultWarehouse'].value = userProfile.defaultWarehouse || '';
                    form['emailAddress'].value = userProfile.emailAddress || '';
                    form['department'].value = userProfile.department || '';
                    form['shift'].value = userProfile.shift || '';
                    form['rfPassword'].value = userProfile.rfPassword || '';
                    form['uncollectedPassword'].value = userProfile.uncollectedPassword || '';
                    form['securityGroup'].value = userProfile.securityGroup || '';
                    form['payrollId'].value = userProfile.payrollId || '';
                    form['wageRate'].value = userProfile.wageRate || '';
                    form['hireDate'].value = userProfile.hireDate || '';
                    form['cycleCounting'].value = userProfile.cycleCounting || 'Default';
                    form['shipping'].value = userProfile.shipping || 'Default';
                    form['packing'].value = userProfile.packing || 'Default';
                    form['workOrder'].value = userProfile.workOrder || 'Default';
                    form['receiving'].value = userProfile.receiving || 'Standard';
                    form['reportDirectory'].value = userProfile.reportDirectory || '';
                    form['myLinkDirectory'].value = userProfile.myLinkDirectory || '';
                    form['desktopTemplate'].value = userProfile.desktopTemplate || 'Adminisitrasi';
                    form['excelExportDirectory'].value = userProfile.excelExportDirectory || '';
                    const setAccessControls = (profile, accessName) => {
                        const type = profile[`${accessName}AccessType`] || 'All';
                        const radio = form.querySelector(`input[name="${accessName}AccessType"][value="${type}"]`);
                        if (radio) radio.checked = true;

                        const accessList = profile[`${accessName}Access`] || [];
                        if (Array.isArray(accessList)) {
                            accessList.forEach(id => {
                                const checkbox = form.querySelector(`input[name="${accessName}Access"][value="${id}"]`);
                                if (checkbox) checkbox.checked = true;
                            });
                        }
                    };
                    
                    setAccessControls(userProfile, 'company');
                    setAccessControls(userProfile, 'warehouse');
                    setAccessControls(userProfile, 'workProfile');
                    setAccessControls(userProfile, 'adjustmentType');
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeUserProfileForm = function() {
            document.getElementById('user-profile-form-modal').classList.add('hidden');
            document.getElementById('user-profile-form-modal').classList.remove('flex');
        };

        window.handleUserProfileSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newUserProfile = {
                user: form['user'].value,
                description: form['description'].value,
                defaultWarehouse: form['defaultWarehouse'].value,
                emailAddress: form['emailAddress'].value,
                department: form['department'].value,
                shift: form['shift'].value,
                rfPassword: form['rfPassword'].value,
                uncollectedPassword: form['uncollectedPassword'].value,
                securityGroup: form['securityGroup'].value,
                payrollId: form['payrollId'].value,
                wageRate: form['wageRate'].value,
                hireDate: form['hireDate'].value,

                cycleCounting: form['cycleCounting'].value,
                shipping: form['shipping'].value,
                packing: form['packing'].value,
                workOrder: form['workOrder'].value,
                receiving: form['receiving'].value,
                reportDirectory: form['reportDirectory'].value,
                myLinkDirectory: form['myLinkDirectory'].value,
                desktopTemplate: form['desktopTemplate'].value,
                excelExportDirectory: form['excelExportDirectory'].value,
                companyAccess: Array.from(form.querySelectorAll('input[name="companyAccess"]:checked')).map(cb => cb.value),
                warehouseAccessType: form.querySelector('input[name="warehouseAccessType"]:checked')?.value || 'All',
                warehouseAccess: Array.from(form.querySelectorAll('input[name="warehouseAccess"]:checked')).map(cb => cb.value),
                workProfileAccessType: form.querySelector('input[name="workProfileAccessType"]:checked')?.value || 'All',
                workProfileAccess: Array.from(form.querySelectorAll('input[name="workProfileAccess"]:checked')).map(cb => cb.value),
                adjustmentTypeAccessType: form.querySelector('input[name="adjustmentTypeAccessType"]:checked')?.value || 'All',
                adjustmentTypeAccess: Array.from(form.querySelectorAll('input[name="adjustmentTypeAccess"]:checked')).map(cb => cb.value),
            };
            
            for (let i = 1; i <= 8; i++) {
                newUserProfile[`udf${i}`] = form[`udf${i}`]?.value || '';
            }

            if (mode === 'create') {
                newUserProfile.id = 'UP' + String(userProfiles.length + 1).padStart(3, '0');
                userProfiles.push(newUserProfile);
                await showCustomAlert('Success', 'User Profile created successfully!');
            } else {
                const index = userProfiles.findIndex(up => up.id === id);
                if (index !== -1) {
                    userProfiles[index] = { ...userProfiles[index], ...newUserProfile };
                    await showCustomAlert('Success', 'User Profile updated successfully!');
                }
            }
            
            if(window.saveUserProfiles) {
               window.saveUserProfiles();
            }

            closeUserProfileForm();
            renderUserProfileList();
        };

        window.deleteUserProfile = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this user profile?');
            if (confirmed) {
                userProfiles = userProfiles.filter(up => up.id !== id);
                saveUserProfiles();
                renderUserProfileList();
                await showCustomAlert('Deleted', 'User Profile deleted successfully!');
            }
        };

        window.filterSecurityGroupList = function(value) {
            renderSecurityGroupList(value);
        };

        window.renderSecurityGroupList = function(filter = '') {
            const container = document.getElementById('security-group-list-container');
            if (!container) return;

            const filteredGroups = securityGroups.filter(sg =>
                sg.groupName.toLowerCase().includes(filter.toLowerCase()) ||
                sg.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Security Group</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredGroups.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="4" class="py-3 px-6 text-center">No security groups found.</td>
                    </tr>
                `;
            } else {
                filteredGroups.forEach(sg => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${sg.groupName}</td>
                            <td class="py-3 px-6 text-left">${sg.description}</td>
                            <td class="py-3 px-6 text-left">${sg.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showSecurityGroupForm('edit', '${sg.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteSecurityGroup('${sg.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.renderSecurityPermissionList = function(filter = '') {
            const container = document.getElementById('security-permission-list-container');
            if (!container) return;

            const filteredPermissions = securityPermissions.filter(sp =>
                sp.spName.toLowerCase().includes(filter.toLowerCase()) ||
                sp.spDescription.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Security Permission</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredPermissions.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="4" class="py-3 px-6 text-center">No security permissions found.</td>
                    </tr>
                `;
            } else {
                filteredPermissions.forEach(sp => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${sp.spName}</td>
                            <td class="py-3 px-6 text-left">${sp.spDescription}</td>
                            <td class="py-3 px-6 text-left">${sp.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showSecurityPermissionForm('edit', '${sp.id}')" title="Edit">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteSecurityPermission('${sp.id}')" title="Delete">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            container.innerHTML = tableHtml;
        };

        window.filterSecurityPermissionList = function(value) {
            renderSecurityPermissionList(value);
        };

        window.showSecurityGroupForm = function(mode, id = null) {
            const modal = document.getElementById('security-group-form-modal');
            const form = document.getElementById('security-group-form');
            const title = document.getElementById('security-group-form-title');
            const submitButton = document.getElementById('security-group-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            setupTabSwitching('security-group-form-modal');

            form.querySelectorAll('input, select').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Security Group';
                submitButton.textContent = 'Save';
                renderSecurityGroupUserCheckboxes([]);
            } else {
                title.textContent = 'Edit Security Group';
                submitButton.textContent = 'Update';
                const securityGroup = securityGroups.find(sg => sg.id === id);
                if (securityGroup) {
                    document.getElementById('security-group-name').value = securityGroup.groupName;
                    document.getElementById('security-group-description').value = securityGroup.description;
                    document.getElementById('security-group-inactive').checked = securityGroup.inactive;
                    renderSecurityGroupUserCheckboxes(securityGroup.users);
                    for (let i = 1; i <= 7; i++) {
                        document.getElementById(`sg-user-defined-field${i}`).value = securityGroup[`userDefinedField${i}`] || '';
                    }
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeSecurityGroupForm = function() {
            document.getElementById('security-group-form-modal').classList.add('hidden');
            document.getElementById('security-group-form-modal').classList.remove('flex');
        };

        window.handleSecurityGroupSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newSecurityGroup = {
                groupName: form['groupName'].value,
                description: form['description'].value,
                inactive: form['security-group-inactive'].checked,
                users: Array.from(form.querySelectorAll('#security-group-user-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value),
            };
            for (let i = 1; i <= 7; i++) {
                newSecurityGroup[`userDefinedField${i}`] = form[`sg-user-defined-field${i}`].value;
            }

            if (mode === 'create') {
                newSecurityGroup.id = 'SG' + String(securityGroups.length + 1).padStart(3, '0');
                securityGroups.push(newSecurityGroup);
                await showCustomAlert('Success', 'Security Group created successfully!');
            } else {
                const index = securityGroups.findIndex(sg => sg.id === id);
                if (index !== -1) {
                    securityGroups[index] = { ...securityGroups[index], ...newSecurityGroup };
                    await showCustomAlert('Success', 'Security Group updated successfully!');
                }
            }
            saveSecurityGroups();
            closeSecurityGroupForm();
            renderSecurityGroupList();
        };

        window.deleteSecurityGroup = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this security group?');
            if (confirmed) {
                securityGroups = securityGroups.filter(sg => sg.id !== id);
                saveSecurityGroups();
                renderSecurityGroupList();
                await showCustomAlert('Deleted', 'Security Group deleted successfully!');
            }
        };

        window.renderSecurityGroupUserCheckboxes = function(selectedUsers = [], filter = '') {
            const container = document.getElementById('security-group-user-checkbox-list');
            if (!container) return;
            let currentlyCheckedIds;
            if (Array.isArray(selectedUsers)) {
                currentlyCheckedIds = selectedUsers;
            } else {
                currentlyCheckedIds = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            }

            container.innerHTML = '';
            const lowerCaseFilter = filter.toLowerCase();

            const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(lowerCaseFilter));

            if (filteredUsers.length === 0) {
                container.innerHTML = '<p class="text-wise-gray text-sm p-2">No users found matching your filter.</p>';
                return;
            }

            filteredUsers.forEach(user => {
                const isChecked = currentlyCheckedIds.includes(user.id);
                const div = document.createElement('div');
                div.className = 'flex items-center';
                div.innerHTML = `
                    <input type="checkbox" id="sg-user-${user.id}" name="securityGroupUsers" value="${user.id}" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${isChecked ? 'checked' : ''}>
                    <label for="sg-user-${user.id}" class="ml-2 text-sm text-wise-dark-gray">${user.name}</label>
                `;
                container.appendChild(div);
            });
        };

        window.toggleAllSecurityGroupUsers = function() {
            const checkAllCheckbox = document.getElementById('check-all-security-group-users');
            const userCheckboxes = document.querySelectorAll('#security-group-user-checkbox-list input[type="checkbox"]');
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = checkAllCheckbox.checked;
            });
        };

        window.showSecurityPermissionForm = function(mode, id = null) {
            const modal = document.getElementById('security-permission-form-modal');
            const form = document.getElementById('security-permission-form');
            const title = document.getElementById('security-permission-form-title');
            const submitButton = document.getElementById('security-permission-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            setupTabSwitching('security-permission-form-modal');
            document.querySelector('#sp-menu-filter input[value="All"]').checked = true;


            if (mode === 'create') {
                title.textContent = 'Create New Security Permission';
                submitButton.textContent = 'Save';
                renderMenuCheckboxes([]);
            } else {
                title.textContent = 'Edit Security Permission';
                submitButton.textContent = 'Update';
                const securityPermission = securityPermissions.find(sp => sp.id === id);
                if (securityPermission) {
                    document.getElementById('sp-name').value = securityPermission.spName;
                    document.getElementById('sp-description').value = securityPermission.spDescription;
                    document.getElementById('sp-inactive').checked = securityPermission.inactive;
                    renderMenuCheckboxes(securityPermission.menus);
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeSecurityPermissionForm = function() {
            document.getElementById('security-permission-form-modal').classList.add('hidden');
            document.getElementById('security-permission-form-modal').classList.remove('flex');
        };

        window.handleSecurityPermissionSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newSecurityPermission = {
                spName: form['spName'].value,
                spDescription: form['spDescription'].value,
                inactive: form['sp-inactive'].checked,
                menus: Array.from(form.querySelectorAll('#sp-menu-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value),
            };

            if (mode === 'create') {
                newSecurityPermission.id = 'SP' + String(securityPermissions.length + 1).padStart(3, '0');
                securityPermissions.push(newSecurityPermission);
                await showCustomAlert('Success', 'Security Permission created successfully!');
            } else {
                const index = securityPermissions.findIndex(sp => sp.id === id);
                if (index !== -1) {
                    securityPermissions[index] = { ...securityPermissions[index], ...newSecurityPermission };
                    await showCustomAlert('Success', 'Security Permission updated successfully!');
                }
            }
            saveSecurityPermissions();
            closeSecurityPermissionForm();
            renderSecurityPermissionList();
        };

        window.deleteSecurityPermission = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this security permission?');
            if (confirmed) {
                securityPermissions = securityPermissions.filter(sp => sp.id !== id);
                saveSecurityPermissions();
                renderSecurityPermissionList();
                await showCustomAlert('Deleted', 'Security Permission deleted successfully!');
            }
        };

        window.renderMenuCheckboxes = function(selectedMenus = [], filterCategory = 'All') {
            const container = document.getElementById('sp-menu-checkbox-list');
            if (!container) return;

            container.innerHTML = '';
            
            const filteredMenus = allMenus.filter(menu => {
                if (filterCategory === 'All') {
                    return true;
                }
                return menu.category === filterCategory;
            });

            if (filteredMenus.length === 0) {
                container.innerHTML = '<p class="text-wise-gray text-sm p-2">No menus found for this category.</p>';
                return;
            }

            filteredMenus.forEach(menu => {
                const isChecked = selectedMenus.includes(menu.name);
                const div = document.createElement('div');
                div.className = 'flex items-center';
                div.innerHTML = `
                    <input type="checkbox" id="menu-${menu.name.replace(/\s/g, '-')}" name="securityPermissionMenus" value="${menu.name}" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${isChecked ? 'checked' : ''}>
                    <label for="menu-${menu.name.replace(/\s/g, '-')}" class="ml-2 text-sm text-wise-dark-gray">${menu.name}</label>
                `;
                container.appendChild(div);
            });
        };

    });

        window.togglePasswordVisibility = function(inputId, isChecked) {
            const passwordInput = document.getElementById(inputId);
            if (passwordInput) {
                passwordInput.type = isChecked ? 'password' : 'text';
            }
        };

        window.toggleUserDropdown = function() {
            const userDropdown = document.getElementById('user-dropdown');
            userDropdown.classList.toggle('hidden');
        };

        window.navigateToProfile = function() {
            window.location.href = 'profile.html';    
        };

        window.handleLogout = async function() {
            const confirmed = await showCustomConfirm('Logout', 'Apakah Anda yakin ingin logout?');
            if (confirmed) {
                await showCustomAlert('Logout', 'Anda berhasil logout.');
                window.location.href = 'login.html';
            }
        };

        // (Opsional) Fungsi untuk membuka overlay pencarian secara paksa
        window.openSearchOverlay = function() {
          const overlay = document.getElementById('search-overlay');
          const hInput  = document.getElementById('search-input');
          const oInput  = document.getElementById('overlay-search-input');
          overlay?.classList?.remove('hidden');
          if (oInput) {
            oInput.value = hInput?.value || '';
            hInput?.blur();
            try { oInput.focus({preventScroll:true}); } catch(e) {}
          }
        };

        document.addEventListener('click', function(event) {
            const userIconContainer = document.querySelector('header .w-9.h-9.bg-wise-dark-gray.rounded-full');
            const userDropdown = document.getElementById('user-dropdown');
            const searchInput = document.getElementById('search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');

            if (userIconContainer && userDropdown && !userIconContainer.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
            // Menggunakan hideSearchHistory() yang baru
            if (!searchInput.contains(event.target) && (!searchHistoryDropdown || !searchHistoryDropdown.contains(event.target))) {
                window.hideSearchHistory();
            }
        });
})();
