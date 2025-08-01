(function() {
    document.addEventListener('DOMContentLoaded', () => {

        const mainContent = document.getElementById('default-content-area');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const searchOverlay = document.getElementById('search-overlay');
        const overlaySearchInput = document.getElementById('overlay-search-input');
        const overlaySearchResultsListPanel = document.getElementById('overlay-search-results-list-panel');
        const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
        const overlaySearchFilters = document.getElementById('overlay-search-filters');
        const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const searchInput = document.getElementById('search-input'); // Tambahkan ini untuk mendapatkan elemen search-input

        // Elements for custom modal (alert/confirm)
        const customModalOverlay = document.getElementById('custom-modal-overlay');
        const customModalTitle = document.getElementById('custom-modal-title');
        const customModalMessage = document.getElementById('custom-modal-message');
        const customModalOkBtn = document.getElementById('custom-modal-ok-btn');
        const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');

        /**
         * Menampilkan modal alert kustom.
         * @param {string} title - Judul modal.
         * @param {string} message - Pesan modal.
         * @returns {Promise<boolean>} - Mengembalikan Promise yang resolve dengan true ketika tombol OK diklik.
         */
        window.showCustomAlert = function(title, message) {
            customModalTitle.textContent = title;
            customModalMessage.textContent = message;
            customModalCancelBtn.classList.add('hidden'); // Sembunyikan tombol batal untuk alert
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

        /**
         * Menampilkan modal konfirmasi kustom.
         * @param {string} title - Judul modal.
         * @param {string} message - Pesan modal.
         * @returns {Promise<boolean>} - Mengembalikan Promise yang resolve dengan true jika OK diklik, false jika Cancel.
         */
        window.showCustomConfirm = function(title, message) {
            customModalTitle.textContent = title;
            customModalMessage.textContent = message;
            customModalCancelBtn.classList.remove('hidden'); // Tampilkan tombol batal untuk konfirmasi
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

        // Fungsi untuk menoggle tampilan elemen anak (sub-menu)
        window.toggleChildren = function(parentId) {
            const childrenContainer = document.getElementById(`${parentId}-children`); // Kontainer sub-menu
            const parentElement = document.getElementById(parentId);                   // Item menu utama yang diklik
            const arrowIcon = document.getElementById(`${parentId}-arrow`);            // Icon panah

            if (childrenContainer && parentElement && arrowIcon) { // Pastikan semua elemen ditemukan
                const isHidden = childrenContainer.classList.toggle('hidden'); // Toggle visibilitas sub-menu
                
                // Update aria-expanded attribute
                parentElement.setAttribute('aria-expanded', isHidden ? 'false' : 'true');

                // Rotasi panah
                if (isHidden) {
                    arrowIcon.classList.remove('rotate-180');
                    arrowIcon.classList.add('rotate-0');
                } else {
                    arrowIcon.classList.remove('rotate-0');
                    arrowIcon.classList.add('rotate-180');
                }
                
                console.log(`Sub-menu untuk ID "${parentId}" berhasil di-toggle. Status expanded: ${!isHidden}`);
            } else {
                console.warn(`Elemen anak dengan ID "${parentId}-children", parent dengan ID "${parentId}", atau panah dengan ID "${parentId}-arrow" tidak ditemukan.`);
            }
        };

        /**
         * Membuka atau menutup bagian filter di halaman Receipt Explorer.
         */
        window.toggleFilterSection = function() {
            const filterContent = document.getElementById('collapsible-filter-area');
            const filterArrow = document.getElementById('filter-arrow');

            if (filterContent && filterArrow) {
                console.log('toggleFilterSection called!');
                console.log('Current maxHeight:', filterContent.style.maxHeight);
                console.log('ScrollHeight:', filterContent.scrollHeight);

                // Toggle max-height classes
                if (filterContent.classList.contains('max-h-0')) {
                    // Jika tersembunyi, buka
                    filterContent.classList.remove('max-h-0');
                    filterContent.classList.add('max-h-screen'); // Menggunakan max-h-screen untuk tinggi tak terbatas
                    filterArrow.classList.add('rotate-180');
                } else {
                    // Jika terbuka, tutup
                    filterContent.classList.remove('max-h-screen');
                    filterContent.classList.add('max-h-0');
                    filterArrow.classList.remove('rotate-180');
                }
            } else {
                console.warn("Filter content or arrow not found for toggleFilterSection.");
            }
        };

        // Data dummy untuk konten dashboard dan sub-kategori
        const contentData = {
            dashboard: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Dashboard Overview</h2>
                    <p class="text-wise-gray mb-4">Selamat datang di dashboard WISE. Di sini Anda dapat melihat ringkasan aktivitas dan data penting.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Total Pesanan Hari Ini</h3>
                            <p class="text-wise-primary text-3xl font-bold">1,234</p>
                            <p class="text-wise-gray text-sm mt-1">Pesanan yang diproses hari ini.</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Stok Tersedia</h3>
                            <p class="text-wise-success text-3xl font-bold">98,765</p>
                            <p class="text-wise-gray text-sm mt-1">Unit stok di semua gudang.</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengiriman Tertunda</h3>
                            <p class="text-wise-warning text-3xl font-bold">45</p>
                            <p class="text-wise-gray text-sm mt-1">Pengiriman yang menunggu proses.</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penerimaan Baru</h3>
                            <p class="text-wise-info text-3xl font-bold">12</p>
                            <p class="text-wise-gray text-sm mt-1">Penerimaan barang yang masuk.</p>
                        </div>
                    </div>
                `,
            },
            // Konten untuk opsi dropdown DCS (sesuai dengan gambar dashboard)
            'DCC': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCC Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCC.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Active Crews (DCC)</h3>
                            <p class="text-wise-primary text-3xl font-bold">85</p>
                            <p class="text-wise-gray text-sm mt-1">currently working</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Total Assets (DCC)</h3>
                            <p class="text-wise-success text-3xl font-bold">$2.5M</p>
                            <p class="text-wise-gray text-sm mt-1">Total assets under management.</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Crew #123 completed task (DCC)</h3>
                            <p class="text-wise-info text-sm mt-1">5 minutes ago</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Inventory update: 10 units added to Warehouse (DCC)</h3>
                            <p class="text-wise-info text-sm mt-1">3 hours ago</p>
                        </div>
                    </div>
                `,
            },
            'DCE': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCE Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCE.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCE</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCE akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCF': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCF Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCF.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCF</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCF akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCJ': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCJ Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCJ.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCJ</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCJ akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCK': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCK Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCK.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCK</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCK akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCL': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCL Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCL.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCL</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCL akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCM': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCM Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCM.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCM</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCM akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCP': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCP Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCP.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCP</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCP akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCS': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCS Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCS.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCS</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCS akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCT': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCT Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCT.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCT</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCT akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'DCY': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - DCY Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS DCY.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail DCY</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai DCY akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'GBG': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">DCS - GBG Overview</h2>
                    <p class="text-wise-gray mb-4">Ini adalah tampilan ringkasan untuk DCS GBG.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Detail GBG</h3>
                        <p class="text-wise-gray text-sm mt-1">Informasi spesifik mengenai GBG akan ditampilkan di sini.</p>
                    </div>
                `,
            },
            'yard-vehicles': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard Management - Vehicles</h2>
                    <p class="text-wise-gray mb-4">Kelola informasi kendaraan di area yard.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Daftar Kendaraan</h3>
                        <p class="text-wise-gray text-sm mt-1">Tabel daftar kendaraan akan ditampilkan di sini.</p>
                        <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform">
                            Lihat Detail Kendaraan
                        </button>
                    </div>
                `,
            },
            'yard-equipment': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard Management - Equipment</h2>
                    <p class="text-wise-gray mb-4">Kelola informasi peralatan di area yard.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Daftar Peralatan</h3>
                        <p class="text-wise-gray text-sm mt-1">Tabel daftar peralatan akan ditampilkan di sini.</p>
                        <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform">
                            Lihat Detail Peralatan
                        </button>
                    </div>
                `,
            },
            'yard-personnel': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard Management - Personnel</h2>
                    <p class="text-wise-gray mb-4">Kelola informasi personel di area yard.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Daftar Personel</h3>
                        <p class="text-wise-gray text-sm mt-1">Tabel daftar personel akan ditampilkan di sini.</p>
                        <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform">
                            Lihat Detail Personel
                        </button>
                    </div>
                `,
            },
            'receiving-open-box-balance-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Open/Box Balance Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat saldo kotak terbuka dan detail penerimaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Data Saldo</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Open/Box Balance Viewer.</p>
                    </div>
                `,
            },
            'receiving-po-quick-find': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Purchase Order Quick Find</h2>
                    <p class="text-wise-gray mb-4">Cari pesanan pembelian dengan cepat.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cari PO</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Purchase Order Quick Find.</p>
                    </div>
                `,
            },
            'receiving-receipt-closet-supplier': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Closet By Supplier</h2>
                    <p class="text-wise-gray mb-4">Lihat penerimaan berdasarkan pemasok.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penerimaan Pemasok</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt Closet By Supplier.</p>
                    </div>
                `,
            },
            'receiving-receipt-container-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Container Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat detail kontainer penerimaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Kontainer</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt Container Viewer.</p>
                    </div>
                `,
            },
            // START: Konten Receipt Explorer yang Diperbarui (Tampilan Lebih Rapi)
            'receiving-receipt-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Explorer</h2>
                    <p class="text-wise-gray mb-6">Jelajahi detail penerimaan dengan filter dan tabel yang intuitif.</p>

                    <div class="bg-wise-light-gray p-5 rounded-xl shadow-md mb-6 border border-wise-border">
                        <div class="flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" onclick="toggleFilterSection()">
                            <h3 class="text-lg font-semibold text-wise-dark-gray flex items-center">
                                <i class="fas fa-filter text-wise-primary mr-2"></i>Filter Penerimaan
                            </h3>
                            <i id="filter-arrow" class="fas fa-chevron-down transform transition-transform duration-300"></i>
                        </div>

                        <!-- Initial state: max-h-0 (collapsed) and overflow-hidden -->
                        <div id="collapsible-filter-area" class="transition-all duration-500 ease-in-out overflow-hidden max-h-0">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-wise-border mt-4">
                                <div>
                                    <label for="filter-receipt-id" class="block text-sm font-medium text-wise-dark-gray mb-1">Receipt ID:</label>
                                    <input type="text" id="filter-receipt-id" placeholder="e.g., RCV00155737" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-receipt-id-type" class="block text-sm font-medium text-wise-dark-gray mb-1">Receipt ID Type:</label>
                                    <select id="filter-receipt-id-type" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                        <option value="">All</option>
                                        <option value="ASN">ASN</option>
                                        <option value="PO">PO</option>
                                        <option value="Return">Return</option>
                                        <option value="Crossdock Open">Crossdock Open</option>
                                        <option value="Normal Order">Normal Order</option>
                                        <option value="Return Transit O">Return Transit O</option>
                                        <option value="Transfer">Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="filter-trailer-id" class="block text-sm font-medium text-wise-dark-gray mb-1">Trailer ID:</label>
                                    <input type="text" id="filter-trailer-id" placeholder="e.g., TRLR-A01" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-receipt-date" class="block text-sm font-medium text-wise-dark-gray mb-1">Receipt Date:</label>
                                    <input type="date" id="filter-receipt-date" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-closed-date" class="block text-sm font-medium text-wise-dark-gray mb-1">Closed Date:</label>
                                    <input type="date" id="filter-closed-date" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-loading-status" class="block text-sm font-medium text-wise-dark-gray mb-1">Loading Status:</label>
                                    <select id="filter-loading-status" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                        <option value="">All</option>
                                        <option value="Loaded">Loaded</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="filter-trailer-status" class="block text-sm font-medium text-wise-dark-gray mb-1">Trailer Status:</label>
                                    <select id="filter-trailer-status" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                        <option value="">All</option>
                                        <option value="Docked">Docked</option>
                                        <option value="In Yard">In Yard</option>
                                        <option value="Arrived">Arrived</option>
                                        <option value="Departed">Departed</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="filter-receipt-type" class="block text-sm font-medium text-wise-dark-gray mb-1">Receipt Type:</label>
                                    <select id="filter-receipt-type" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                        <option value="">All</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Cross-Dock">Cross-Dock</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="filter-po-id" class="block text-sm font-medium text-wise-dark-gray mb-1">Purchase Order ID:</label>
                                    <input type="text" id="filter-po-id" placeholder="e.g., PO12345" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-source-id" class="block text-sm font-medium text-wise-dark-gray mb-1">Source ID:</label>
                                    <input type="text" id="filter-source-id" placeholder="e.g., S001" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-source" class="block text-sm font-medium text-wise-dark-gray mb-1">Source:</label>
                                    <input type="text" id="filter-source" placeholder="e.g., Supplier A" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                                <div>
                                    <label for="filter-ship" class="block text-sm font-medium text-wise-dark-gray mb-1">Ship:</label>
                                    <input type="text" id="filter-ship" placeholder="e.g., SHP-991" class="block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                                </div>
                            </div>
                            <div class="flex justify-end mt-6">
                                <button class="px-6 py-2 bg-wise-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform font-semibold" onclick="applyReceiptFilters()">
                                    GO
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-xl shadow-md border border-wise-border">
                        <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
                            <div class="flex items-center space-x-2">
                                <label for="show-entries" class="text-sm text-wise-dark-gray">Show</label>
                                <select id="show-entries" class="px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary" onchange="renderReceiptTable()">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span class="text-sm text-wise-dark-gray">entries</span>
                            </div>
                            <input type="text" id="receipt-search-table" placeholder="Search table data..." class="px-3 py-2 border border-wise-border rounded-md bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary" oninput="renderReceiptTable()">
                        </div>
                        <div id="receipt-table-container" class="overflow-x-auto relative shadow-inner rounded-lg">
                            </div>
                        <div id="receipt-pagination" class="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-3 sm:space-y-0">
                            </div>
                    </div>
                `,
            },
            // END: Konten Receipt Explorer yang Diperbarui
            'receiving-receipt-monitoring-close': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Monitoring/Close Viewer</h2>
                    <p class="text-wise-gray mb-4">Pantau dan tutup penerimaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Monitoring Penerimaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt Monitoring/Close Viewer.</p>
                    </div>
                `,
            },
            'receiving-receipt-no-close': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt No/Close Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat penerimaan yang tidak ditutup.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penerimaan Tidak Ditutup</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt No/Close Viewer.</p>
                    </div>
                `,
            },
            'receiving-receipt-open-closed': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Open And Closed Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat penerimaan yang terbuka dan tertutup.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penerimaan Terbuka/Tertutup</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt Open And Closed Viewer.</p>
                    </div>
                `,
            },
            'receiving-receipt-shipment-closed': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Shipment Closed Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat pengiriman penerimaan yang sudah ditutup.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengiriman Ditutup</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receipt Shipment Closed Viewer.</p>
                    </div>
                `,
            },
            'receiving-performance-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receiving Performance Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat kinerja proses penerimaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Kinerja Penerimaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receiving Performance Viewer.</p>
                    </div>
                `,
            },
            'receiving-workbench': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receiving Workbench</h2>
                    <p class="text-wise-gray mb-4">Area kerja untuk proses penerimaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Workbench Penerimaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Receiving Workbench.</p>
                    </div>
                `,
            },
            'receiving-shipment-closed-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Shipment Closed Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat pengiriman yang sudah ditutup.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengiriman Ditutup</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Closed Viewer.</p>
                    </div>
                `,
            },
            'receiving-virtual-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Virtual Receiving Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat penerimaan virtual.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penerimaan Virtual</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Virtual Receiving Viewer.</p>
                    </div>
                `,
            },
            'order-planning-consolidated-shipment-history': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Consolidated Shipment History</h2>
                    <p class="text-wise-gray mb-4">Lihat riwayat pengiriman terkonsolidasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Riwayat Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Consolidated Shipment History.</p>
                    </div>
                `,
            },
            'order-planning-order-entry': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Order Entry</h2>
                    <p class="text-wise-gray mb-4">Masukkan pesanan baru ke dalam sistem.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Entri Pesanan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Order Entry.</p>
                    </div>
                `,
            },
            'order-planning-wave-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Wave Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi detail gelombang pesanan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Gelombang</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Wave Explorer.</p>
                    </div>
                `,
            },
            'order-planning-wave-quick-find': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Wave Quick Find</h2>
                    <p class="text-wise-gray mb-4">Cari gelombang pesanan dengan cepat.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cari Cepat Gelombang</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Wave Quick Find.</p>
                    </div>
                `,
            },
            'shipping-close-container': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Close Container</h2>
                    <p class="text-wise-gray mb-4">Tutup kontainer pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Tutup Kontainer</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Close Container.</p>
                    </div>
                `,
            },
            'shipping-consolidated-container-location-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Consolidated Container Location Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat lokasi kontainer terkonsolidasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Lokasi Kontainer Terkonsolidasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Consolidated Container Location Viewer.</p>
                    </div>
                `,
            },
            'shipping-containers-delivered': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Containers Delivered</h2>
                    <p class="text-wise-gray mb-4">Lihat kontainer yang sudah dikirim.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Kontainer Terkirim</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Containers Delivered.</p>
                    </div>
                `,
            },
            'shipping-outbound-surplus-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Outbound Surplus Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat surplus pengiriman keluar.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Surplus Keluar</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Outbound Surplus Viewer.</p>
                    </div>
                `,
            },
            'shipping-dock-scheduler': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Dock Scheduler</h2>
                    <p class="text-wise-gray mb-4">Jadwalkan aktivitas di dock.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penjadwal Dock</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Dock Scheduler.</p>
                    </div>
                `,
            },
            'shipping-load-close-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Close Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat detail penutupan muatan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Penutupan Muatan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Load Close Viewer.</p>
                    </div>
                `,
            },
            'shipping-load-count-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Count Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat jumlah muatan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Jumlah Muatan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Load Count Viewer.</p>
                    </div>
                `,
            },
            'shipping-load-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi detail muatan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Muatan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Load Explorer.</p>
                    </div>
                `,
            },
            'shipping-maxi-high-container-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Maxi High Container Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat kontainer dengan tinggi maksimal.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Kontainer Tinggi Maksimal</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Maxi High Container Viewer.</p>
                    </div>
                `,
            },
            'shipping-multiple-order-pallet-close': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Multiple Order Pallet Close</h2>
                    <p class="text-wise-gray mb-4">Tutup palet untuk beberapa pesanan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penutupan Palet Multi Pesanan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Multiple Order Pallet Close.</p>
                    </div>
                `,
            },
            'shipping-oos-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - OOS Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat status Out-of-Stock (OOS).</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer OOS</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk OOS Viewer.</p>
                    </div>
                `,
            },
            'shipping-operator-surplus-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Operator Surplus Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat surplus operator pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Surplus Operator</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Operator Surplus Viewer.</p>
                    </div>
                `,
            },
            'shipping-pallet-close': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Pallet Close</h2>
                    <p class="text-wise-gray mb-4">Tutup palet pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penutupan Palet</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Pallet Close.</p>
                    </div>
                `,
            },
            'shipping-pallet-in-staging-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Pallet In Staging Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat palet di area staging.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Palet di Staging</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Pallet In Staging Viewer.</p>
                    </div>
                `,
            },
            'shipping-put-to-store-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Put to Store Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat proses put-to-store.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Put to Store</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Put to Store Viewer.</p>
                    </div>
                `,
            },
            'shipping-qc-workbench': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - QC Workbench</h2>
                    <p class="text-wise-gray mb-4">Area kerja untuk kontrol kualitas pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Workbench QC</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk QC Workbench.</p>
                    </div>
                `,
            },
            'shipping-shipment-detail-allocation-rejection': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Detail Allocation Rejection Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat detail penolakan alokasi pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Penolakan Alokasi Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Detail Allocation Rejection Viewer.</p>
                    </div>
                `,
            },
            'shipping-shipment-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi detail pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Explorer.</p>
                    </div>
                `,
            },
            'shipping-shipment-quick-find': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Quick Find</h2>
                    <p class="text-wise-gray mb-4">Cari pengiriman dengan cepat.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cari Cepat Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Quick Find.</p>
                    </div>
                `,
            },
            'shipping-shipment-start-pick-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Start/Pick Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat detail mulai/pilih pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Mulai/Pilih Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Start/Pick Viewer.</p>
                    </div>
                `,
            },
            'shipping-shipment-stop-tuk-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Stop/Tuk Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat detail berhenti/Tuk pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Berhenti/Tuk Pengiriman</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipment Stop/Tuk Viewer.</p>
                    </div>
                `,
            },
            'shipping-container-identification': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipping Container Identification</h2>
                    <p class="text-wise-gray mb-4">Identifikasi kontainer pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Identifikasi Kontainer</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipping Container Identification.</p>
                    </div>
                `,
            },
            'shipping-container-workbench': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipping Container Workbench</h2>
                    <p class="text-wise-gray mb-4">Area kerja untuk kontainer pengiriman.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Workbench Kontainer</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Shipping Container Workbench.</p>
                    </div>
                `,
            },
            'shipping-sit-workbench': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - SIT Workbench</h2>
                    <p class="text-wise-gray mb-4">Area kerja untuk SIT (Shipment In Transit).</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Workbench SIT</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk SIT Workbench.</p>
                    </div>
                `,
            },
            'work-label-reprint-utility': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Label Reprint Utility</h2>
                    <p class="text-wise-gray mb-4">Utilitas untuk mencetak ulang label.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cetak Ulang Label</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Label Reprint Utility.</p>
                    </div>
                `,
            },
            'work-picking-management-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Picking Management Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi manajemen picking.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Manajemen Picking</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Picking Management Explorer.</p>
                    </div>
                `,
            },
            'work-picking-sigtion': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Picking Sigtion</h2>
                    <p class="text-wise-gray mb-4">Kelola sigtion picking.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Picking Sigtion</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Picking Sigtion.</p>
                    </div>
                `,
            },
            'work-execution': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Execution</h2>
                    <p class="text-wise-gray mb-4">Lakukan eksekusi pekerjaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Eksekusi Pekerjaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Execution.</p>
                    </div>
                `,
            },
            'work-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi detail pekerjaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Pekerjaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Explorer.</p>
                    </div>
                `,
            },
            'work-insight': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Insight</h2>
                    <p class="text-wise-gray mb-4">Lihat insight pekerjaan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Insight Pekerjaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Insight.</p>
                    </div>
                `,
            },
            'work-monitoring-customer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Monitoring: Customer</h2>
                    <p class="text-wise-gray mb-4">Pantau pekerjaan berdasarkan pelanggan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Monitoring Pekerjaan: Pelanggan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Monitoring: Customer.</p>
                    </div>
                `,
            },
            'work-monitoring-group': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Monitoring: Group</h2>
                    <p class="text-wise-gray mb-4">Pantau pekerjaan berdasarkan grup.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Monitoring Pekerjaan: Grup</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Monitoring: Group.</p>
                    </div>
                `,
            },
            'work-quick-find': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Quick Find</h2>
                    <p class="text-wise-gray mb-4">Cari pekerjaan dengan cepat.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cari Cepat Pekerjaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Work Quick Find.</p>
                    </div>
                `,
            },
            'cross-app-ar-upload-interface-data-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - AR Upload Interface Data Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat data antarmuka upload AR.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Data Antarmuka Upload AR</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk AR Upload Interface Data Viewer.</p>
                    </div>
                `,
            },
            'cross-app-background-job-request-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Background Job Request Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat permintaan pekerjaan latar belakang.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Permintaan Pekerjaan Latar Belakang</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Background Job Request Viewer.</p>
                    </div>
                `,
            },
            'cross-app-configurations': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Configurations</h2>
                    <p class="text-wise-gray mb-4">Kelola konfigurasi lintas aplikasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Konfigurasi Lintas Aplikasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Configurations.</p>
                    </div>
                `,
            },
            'cross-app-interface-data': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Interface Data</h2>
                    <p class="text-wise-gray mb-4">Lihat data antarmuka.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Data Antarmuka</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Interface Data.</p>
                    </div>
                `,
            },
            'cross-app-interface-error-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Interface Error Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat error antarmuka.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Error Antarmuka</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Interface Error Viewer.</p>
                    </div>
                `,
            },
            'cross-app-progistics': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Progistics</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan Progistics.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengaturan Progistics</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Progistics.</p>
                    </div>
                `,
            },
            'cross-app-reupload-interface-data-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - ReUpload Interface Data Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat data antarmuka re-upload.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Data Antarmuka Re-Upload</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk ReUpload Interface Data Viewer.</p>
                    </div>
                `,
            },
            'cross-app-rf': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - RF</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan RF.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengaturan RF</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk RF.</p>
                    </div>
                `,
            },
            'cross-app-trading-partner-management': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Trading Partner Management</h2>
                    <p class="text-wise-gray mb-4">Kelola mitra dagang.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Mitra Dagang</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Trading Partner Management.</p>
                    </div>
                `,
            },
            'cross-app-transaction-and-process-history': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Transaction and Process History</h2>
                    <p class="text-wise-gray mb-4">Lihat riwayat transaksi dan proses.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Riwayat Transaksi dan Proses</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Transaction and Process History.</p>
                    </div>
                `,
            },
            'cross-app-upload-interface-data-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Upload Interface Data Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat data antarmuka upload.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Data Antarmuka Upload</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Upload Interface Data Viewer.</p>
                    </div>
                `,
            },
            'cross-app-wave-repost-ptl-rabbitmq': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Wave Repost Only For PTL Messages To RabbitMQ</h2>
                    <p class="text-wise-gray mb-4">Repost gelombang hanya untuk pesan PTL ke RabbitMQ.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Repost Gelombang PTL</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Wave Repost Only For PTL Messages To RabbitMQ.</p>
                    </div>
                `,
            },
            'cross-app-web-statistics-generation': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Web Statistics Generation</h2>
                    <p class="text-wise-gray mb-4">Hasilkan statistik web.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Generasi Statistik Web</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Web Statistics Generation.</p>
                    </div>
                `,
            },
            'inventory-cycle-count-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Cycle Count Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi hitungan siklus inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Hitungan Siklus</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Cycle Count Explorer.</p>
                    </div>
                `,
            },
            'inventory-cycle-count-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Cycle Count Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat hitungan siklus inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Hitungan Siklus</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Cycle Count Viewer.</p>
                    </div>
                `,
            },
            'inventory-edit-customer-shelflife': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Edit Customer Shelflife</h2>
                    <p class="text-wise-gray mb-4">Edit umur simpan pelanggan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Edit Umur Simpan Pelanggan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Edit Customer Shelflife.</p>
                    </div>
                `,
            },
            'inventory-finished-item-breakdown': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Finished Item Breakdown</h2>
                    <p class="text-wise-gray mb-4">Lihat rincian item jadi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Rincian Item Jadi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Finished Item Breakdown.</p>
                    </div>
                `,
            },
            'inventory-immediate-needs-insight': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Immediate Needs Insight</h2>
                    <p class="text-wise-gray mb-4">Dapatkan insight kebutuhan mendesak.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Insight Kebutuhan Mendesak</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Immediate Needs Insight.</p>
                    </div>
                `,
            },
            'inventory-immediate-needs-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Immediate Needs Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat kebutuhan mendesak.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Kebutuhan Mendesak</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Immediate Needs Viewer.</p>
                    </div>
                `,
            },
            'inventory-interdept': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Interdept</h2>
                    <p class="text-wise-gray mb-4">Kelola transfer antar departemen.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Transfer Antar Departemen</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Interdept.</p>
                    </div>
                `,
            },
            'inventory-adjustment-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Adjustment Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat penyesuaian inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Penyesuaian Inventaris</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Inventory Adjustment Viewer.</p>
                    </div>
                `,
            },
            'inventory-insight': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Insight</h2>
                    <p class="text-wise-gray mb-4">Dapatkan insight inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Insight Inventaris</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Inventory Insight.</p>
                    </div>
                `,
            },
            'inventory-management': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Management</h2>
                    <p class="text-wise-gray mb-4">Kelola inventaris secara keseluruhan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Inventaris</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Inventory Management.</p>
                    </div>
                `,
            },
            'inventory-item-master-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Item Master Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat master item inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Master Item</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Item Master Viewer.</p>
                    </div>
                `,
            },
            'inventory-location-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi lokasi inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Explorer Lokasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Location Explorer.</p>
                    </div>
                `,
            },
            'inventory-location-inventory-attribute-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Inventory Attribute Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat atribut inventaris lokasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Atribut Inventaris Lokasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Location Inventory Attribute Viewer.</p>
                    </div>
                `,
            },
            'inventory-location-inventory-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Inventory Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat inventaris lokasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Inventaris Lokasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Location Inventory Viewer.</p>
                    </div>
                `,
            },
            'inventory-location-master-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Master Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat master lokasi inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Master Lokasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Location Master Viewer.</p>
                    </div>
                `,
            },
            'inventory-location-quick-find': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Quick Find</h2>
                    <p class="text-wise-gray mb-4">Cari lokasi dengan cepat.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Cari Cepat Lokasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Location Quick Find.</p>
                    </div>
                `,
            },
            'inventory-lot-freight': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Lot Freight</h2>
                    <p class="text-wise-gray mb-4">Kelola pengiriman lot.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengiriman Lot</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Lot Freight.</p>
                    </div>
                `,
            },
            'inventory-lot-workbench': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Lot Workbench</h2>
                    <p class="text-wise-gray mb-4">Area kerja untuk lot inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Workbench Lot</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Lot Workbench.</p>
                    </div>
                `,
            },
            'inventory-mismatch-company-viewer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Mismatch Company Viewer</h2>
                    <p class="text-wise-gray mb-4">Lihat ketidakcocokan perusahaan inventaris.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Viewer Ketidakcocokan Perusahaan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Mismatch Company Viewer.</p>
                    </div>
                `,
            },
            'performance-kpis': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - KPIs</h2>
                    <p class="text-wise-gray mb-4">Lihat Key Performance Indicators (KPIs).</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">KPI Dashboard</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk KPIs.</p>
                    </div>
                `,
            },
            'performance-analytics': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Analytics</h2>
                    <p class="text-wise-gray mb-4">Lihat analitik kinerja.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Analitik Kinerja</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Analytics.</p>
                    </div>
                `,
            },
            'performance-goals': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Goals</h2>
                    <p class="text-wise-gray mb-4">Kelola tujuan kinerja.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Tujuan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Goals.</p>
                    </div>
                `,
            },
            'system-management-users': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Users</h2>
                    <p class="text-wise-gray mb-4">Kelola pengguna sistem.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Daftar Pengguna</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Users.</p>
                    </div>
                `,
            },
            'system-management-logs': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Logs</h2>
                    <p class="text-wise-gray mb-4">Lihat log sistem.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Log Sistem</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Logs.</p>
                    </div>
                `,
            },
            'system-management-backup': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Backup</h2>
                    <p class="text-wise-gray mb-4">Kelola backup sistem.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Backup Sistem</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Backup.</p>
                    </div>
                `,
            },
            'setting-optimization-general': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Setting Optimization - General</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan umum optimasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengaturan Umum</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk General Settings.</p>
                    </div>
                `,
            },
            'setting-optimization-performance': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Setting Optimization - Performance</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan kinerja optimasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengaturan Kinerja</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Performance Settings.</p>
                    </div>
                `,
            },
            'setting-optimization-notifications': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Setting Optimization - Notifications</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan notifikasi optimasi.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pengaturan Notifikasi</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Notifications Settings.</p>
                    </div>
                `,
            },
            'archive-documents': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Data Archiving - Documents</h2>
                    <p class="text-wise-gray mb-4">Kelola arsip dokumen.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Arsip Dokumen</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Documents Archive.</p>
                    </div>
                `,
            },
            'archive-media': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Data Archiving - Media</h2>
                    <p class="text-wise-gray mb-4">Kelola arsip media.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Arsip Media</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Media Archive.</p>
                    </div>
                `,
            },
            'archive-financial': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Data Archiving - Financial</h2>
                    <p class="text-wise-gray mb-4">Kelola arsip data keuangan.</p>
                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Arsip Keuangan</h3>
                        <p class="text-wise-gray text-sm mt-1">Konten untuk Financial Archive.</p>
                    </div>
                `,
            },
        };

        // Data dummy untuk hasil pencarian
        const searchItems = [
            { id: 'configuration-warehouse', title: 'Warehouse Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-zone', title: 'Zone Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-location-type', title: 'Location Type Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'locating-strategies', title: 'Locating Strategies', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'locating-rule', title: 'Locating Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-user-profile', title: 'User Profile Management', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'security-group', title: 'Security Group Management', category: 'System Management', lastUpdated: 'Just now' },
            { id: 'security-permission', title: 'Security Permission Management', category: 'System Management', lastUpdated: 'Just now' },
            { id: 'dashboard', title: 'Dashboard Overview', category: 'Dashboard', lastUpdated: 'Just now' },
            { id: 'DCC', title: 'DCS - DCC', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCE', title: 'DCS - DCE', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCF', title: 'DCS - DCF', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCJ', title: 'DCS - DCJ', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCK', title: 'DCS - DCK', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCL', title: 'DCS - DCL', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCM', title: 'DCS - DCM', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCP', title: 'DCS - DCP', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCS', title: 'DCS - DCS', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCT', title: 'DCS - DCT', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'DCY', title: 'DCS - DCY', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'GBG', title: 'DCS - GBG', category: 'DCS', lastUpdated: 'Just now' },
            { id: 'yard-vehicles', title: 'Yard Management - Vehicles', category: 'Yard Management', lastUpdated: '1 hour ago' },
            { id: 'yard-equipment', title: 'Yard Management - Equipment', category: 'Yard Management', lastUpdated: '1 hour ago' },
            { id: 'yard-personnel', title: 'Yard Management - Personnel', category: 'Yard Management', lastUpdated: '1 hour ago' },
            { id: 'receiving-open-box-balance-viewer', title: 'Receiving - Open/Box Balance Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-po-quick-find', title: 'Receiving - Purchase Order Quick Find', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-closet-supplier', title: 'Receiving - Receipt Closet By Supplier', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-container-viewer', title: 'Receiving - Receipt Container Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-explorer', title: 'Receiving - Receipt Explorer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-monitoring-close', title: 'Receiving - Receipt Monitoring/Close Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-no-close', title: 'Receiving - Receipt No/Close Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-open-closed', title: 'Receiving - Receipt Open And Closed Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-receipt-shipment-closed', title: 'Receiving - Receipt Shipment Closed Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-performance-viewer', title: 'Receiving - Receiving Performance Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-workbench', title: 'Receiving - Receiving Workbench', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-shipment-closed-viewer', title: 'Receiving - Shipment Closed Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'receiving-virtual-viewer', title: 'Receiving - Virtual Receiving Viewer', category: 'Receiving', lastUpdated: '2 hours ago' },
            { id: 'order-planning-consolidated-shipment-history', title: 'Order Planning - Consolidated Shipment History', category: 'Order Planning', lastUpdated: '3 hours ago' },
            { id: 'order-planning-order-entry', title: 'Order Planning - Order Entry', category: 'Order Planning', lastUpdated: '3 hours ago' },
            { id: 'order-planning-wave-explorer', title: 'Order Planning - Wave Explorer', category: 'Order Planning', lastUpdated: '3 hours ago' },
            { id: 'order-planning-wave-quick-find', title: 'Order Planning - Wave Quick Find', category: 'Order Planning', lastUpdated: '3 hours ago' },
            { id: 'shipping-close-container', title: 'Shipping - Close Container', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-consolidated-container-location-viewer', title: 'Shipping - Consolidated Container Location Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-containers-delivered', title: 'Shipping - Containers Delivered', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-outbound-surplus-viewer', title: 'Shipping - Outbound Surplus Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-dock-scheduler', title: 'Shipping - Dock Scheduler', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-load-close-viewer', title: 'Shipping - Load Close Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-load-count-viewer', title: 'Shipping - Load Count Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-load-explorer', title: 'Shipping - Load Explorer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-maxi-high-container-viewer', title: 'Shipping - Maxi High Container Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-multiple-order-pallet-close', title: 'Shipping - Multiple Order Pallet Close', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-oos-viewer', title: 'Shipping - OOS Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-operator-surplus-viewer', title: 'Shipping - Operator Surplus Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-pallet-close', title: 'Shipping - Pallet Close', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-pallet-in-staging-viewer', title: 'Shipping - Pallet In Staging Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-put-to-store-viewer', title: 'Shipping - Put to Store Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-qc-workbench', title: 'Shipping - QC Workbench', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-shipment-detail-allocation-rejection', title: 'Shipping - Shipment Detail Allocation Rejection Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-shipment-explorer', title: 'Shipping - Shipment Explorer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-shipment-quick-find', title: 'Shipping - Shipment Quick Find', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-shipment-start-pick-viewer', title: 'Shipping - Shipment Start/Pick Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-shipment-stop-tuk-viewer', title: 'Shipping - Shipment Stop/Tuk Viewer', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-container-identification', title: 'Shipping - Shipping Container Identification', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-container-workbench', title: 'Shipping - Shipping Container Workbench', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'shipping-sit-workbench', title: 'Shipping - SIT Workbench', category: 'Shipping', lastUpdated: '4 hours ago' },
            { id: 'work-label-reprint-utility', title: 'Work - Label Reprint Utility', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-picking-management-explorer', title: 'Work - Picking Management Explorer', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-picking-sigtion', title: 'Work - Picking Sigtion', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-execution', title: 'Work - Work Execution', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-explorer', title: 'Work - Work Explorer', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-insight', title: 'Work - Work Insight', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-monitoring-customer', title: 'Work - Work Monitoring: Customer', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-monitoring-group', title: 'Work - Work Monitoring: Group', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'work-quick-find', title: 'Work - Work Quick Find', category: 'Work', lastUpdated: '5 hours ago' },
            { id: 'cross-app-ar-upload-interface-data-viewer', title: 'Cross Application - AR Upload Interface Data Viewer', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-background-job-request-viewer', title: 'Cross Application - Background Job Request Viewer', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-configurations', title: 'Cross Application - Configurations', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-interface-data', title: 'Cross Application - Interface Data', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-interface-error-viewer', title: 'Cross Application - Interface Error Viewer', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-progistics', title: 'Cross Application - Progistics', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-reupload-interface-data-viewer', title: 'Cross Application - ReUpload Interface Data Viewer', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-rf', title: 'Cross Application - RF', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-trading-partner-management', title: 'Cross Application - Trading Partner Management', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-transaction-and-process-history', title: 'Cross Application - Transaction and Process History', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-upload-interface-data-viewer', title: 'Cross Application - Upload Interface Data Viewer', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-wave-repost-ptl-rabbitmq', title: 'Cross Application - Wave Repost Only For PTL Messages To RabbitMQ', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'cross-app-web-statistics-generation', title: 'Cross Application - Web Statistics Generation', category: 'Cross Application', lastUpdated: '6 hours ago' },
            { id: 'inventory-cycle-count-explorer', title: 'Inventory - Cycle Count Explorer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-cycle-count-viewer', title: 'Inventory - Cycle Count Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-edit-customer-shelflife', title: 'Inventory - Edit Customer Shelflife', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-finished-item-breakdown', title: 'Inventory - Finished Item Breakdown', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-immediate-needs-insight', title: 'Inventory - Immediate Needs Insight', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-immediate-needs-viewer', title: 'Inventory - Immediate Needs Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-interdept', title: 'Inventory - Interdept', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-adjustment-viewer', title: 'Inventory - Inventory Adjustment Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-insight', title: 'Inventory - Inventory Insight', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-management', title: 'Inventory - Inventory Management', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-item-master-viewer', title: 'Inventory - Item Master Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-location-explorer', title: 'Inventory - Location Explorer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-location-inventory-attribute-viewer', title: 'Inventory - Location Inventory Attribute Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-location-inventory-viewer', title: 'Inventory - Location Inventory Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-location-master-viewer', title: 'Inventory - Location Master Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-location-quick-find', title: 'Inventory - Location Quick Find', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-lot-freight', title: 'Inventory - Lot Freight', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-lot-workbench', title: 'Inventory - Lot Workbench', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'inventory-mismatch-company-viewer', title: 'Inventory - Mismatch Company Viewer', category: 'Inventory', lastUpdated: '7 hours ago' },
            { id: 'performance-kpis', title: 'Performance Management - KPIs', category: 'Performance Management', lastUpdated: '8 hours ago' },
            { id: 'performance-analytics', title: 'Performance Management - Analytics', category: 'Performance Management', lastUpdated: '8 hours ago' },
            { id: 'performance-goals', title: 'Performance Management - Goals', category: 'Performance Management', lastUpdated: '8 hours ago' },
            { id: 'system-management-users', title: 'System Management - Users', category: 'System Management', lastUpdated: '9 hours ago' },
            { id: 'system-management-logs', title: 'System Management - Logs', category: 'System Management', lastUpdated: '9 hours ago' },
            { id: 'system-management-backup', title: 'System Management - Backup', category: 'System Management', lastUpdated: '9 hours ago' },
            { id: 'setting-optimization-general', title: 'Setting Optimization - General', category: 'Setting Optimization', lastUpdated: '10 hours ago' },
            { id: 'setting-optimization-performance', title: 'Setting Optimization - Performance', category: 'Setting Optimization', lastUpdated: '10 hours ago' },
            { id: 'setting-optimization-notifications', title: 'Setting Optimization - Notifications', category: 'Setting Optimization', lastUpdated: '10 hours ago' },
            { id: 'archive-documents', title: 'Data Archiving - Documents', category: 'Data Archiving', lastUpdated: '11 hours ago' },
            { id: 'archive-media', title: 'Data Archiving - Media', category: 'Data Archiving', lastUpdated: '11 hours ago' },
            { id: 'archive-financial', title: 'Data Archiving - Financial', category: 'Data Archiving', lastUpdated: '11 hours ago' },
        ];

        let currentCategory = 'dashboard';
        let activeFilters = [];
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        const parentMapping = {
            'configuration-warehouse': 'configuration',
            'configuration-zone': 'configuration',
            'configuration-location-type': 'configuration',
            'locating-strategies': 'configuration',
            'locating-rule': 'configuration',
            'configuration-user-profile': 'configuration',
            'security-group': 'system',
            'security-permission': 'system',
            // Tambahkan pemetaan untuk menu Viewer
            'receiving-open-box-balance-viewer': 'viewer',
            'receiving-po-quick-find': 'viewer',
            'receiving-receipt-closet-supplier': 'viewer',
            'receiving-receipt-container-viewer': 'viewer',
            'receiving-receipt-explorer': 'viewer',
            'receiving-receipt-monitoring-close': 'viewer',
            'receiving-receipt-no-close': 'viewer',
            'receiving-receipt-open-closed': 'viewer',
            'receiving-receipt-shipment-closed': 'viewer',
            // Tambahkan pemetaan untuk menu DCS
            'DCC': 'DCS',
            'DCE': 'DCS',
            'DCF': 'DCS',
            'DCJ': 'DCS',
            'DCK': 'DCS',
            'DCL': 'DCS',
            'DCM': 'DCS',
            'DCP': 'DCS',
            // 'DCS': 'DCS', // Ini adalah item utama, bisa juga tidak ada parent jika tidak perlu toggle
            'DCT': 'DCS',
            'DCY': 'DCS',
            'GBG': 'DCS',
            // Tambahkan pemetaan untuk menu Yard Management
            'yard-vehicles': 'yard-management',
            'yard-equipment': 'yard-management',
            'yard-personnel': 'yard-management',
            // Tambahkan pemetaan untuk menu Receiving lainnya
            'receiving-performance-viewer': 'receiving',
            'receiving-workbench': 'receiving',
            'receiving-shipment-closed-viewer': 'receiving',
            'receiving-virtual-viewer': 'receiving',
            // Tambahkan pemetaan untuk menu Order Planning
            'order-planning-consolidated-shipment-history': 'order-planning',
            'order-planning-order-entry': 'order-planning',
            'order-planning-wave-explorer': 'order-planning',
            'order-planning-wave-quick-find': 'order-planning',
            // Tambahkan pemetaan untuk menu Shipping
            'shipping-close-container': 'shipping',
            'shipping-consolidated-container-location-viewer': 'shipping',
            'shipping-containers-delivered': 'shipping',
            'shipping-outbound-surplus-viewer': 'shipping',
            'shipping-dock-scheduler': 'shipping',
            'shipping-load-close-viewer': 'shipping',
            'shipping-load-count-viewer': 'shipping',
            'shipping-load-explorer': 'shipping',
            'shipping-maxi-high-container-viewer': 'shipping',
            'shipping-multiple-order-pallet-close': 'shipping',
            'shipping-oos-viewer': 'shipping',
            'shipping-operator-surplus-viewer': 'shipping',
            'shipping-pallet-close': 'shipping',
            'shipping-pallet-in-staging-viewer': 'shipping',
            'shipping-put-to-store-viewer': 'shipping',
            'shipping-qc-workbench': 'shipping',
            'shipping-shipment-detail-allocation-rejection': 'shipping',
            'shipping-shipment-explorer': 'shipping',
            'shipping-shipment-quick-find': 'shipping',
            'shipping-shipment-start-pick-viewer': 'shipping',
            'shipping-shipment-stop-tuk-viewer': 'shipping',
            'shipping-container-identification': 'shipping',
            'shipping-container-workbench': 'shipping',
            'shipping-sit-workbench': 'shipping',
            // Tambahkan pemetaan untuk menu Work
            'work-label-reprint-utility': 'work',
            'work-picking-management-explorer': 'work',
            'work-picking-sigtion': 'work',
            'work-execution': 'work',
            'work-explorer': 'work',
            'work-insight': 'work',
            'work-monitoring-customer': 'work',
            'work-monitoring-group': 'work',
            'work-quick-find': 'work',
            // Tambahkan pemetaan untuk menu Cross Application
            'cross-app-ar-upload-interface-data-viewer': 'cross-application',
            'cross-app-background-job-request-viewer': 'cross-application',
            'cross-app-configurations': 'cross-application',
            'cross-app-interface-data': 'cross-application',
            'cross-app-interface-error-viewer': 'cross-application',
            'cross-app-progistics': 'cross-application',
            'cross-app-reupload-interface-data-viewer': 'cross-application',
            'cross-app-rf': 'cross-application',
            'cross-app-trading-partner-management': 'cross-application',
            'cross-app-transaction-and-process-history': 'cross-application',
            'cross-app-upload-interface-data-viewer': 'cross-application',
            'cross-app-wave-repost-ptl-rabbitmq': 'cross-application',
            'cross-app-web-statistics-generation': 'cross-application',
            // Tambahkan pemetaan untuk menu Inventory
            'inventory-cycle-count-explorer': 'inventory',
            'inventory-cycle-count-viewer': 'inventory',
            'inventory-edit-customer-shelflife': 'inventory',
            'inventory-finished-item-breakdown': 'inventory',
            'inventory-immediate-needs-insight': 'inventory',
            'inventory-immediate-needs-viewer': 'inventory',
            'inventory-interdept': 'inventory',
            'inventory-adjustment-viewer': 'inventory',
            'inventory-insight': 'inventory',
            'inventory-management': 'inventory',
            'inventory-item-master-viewer': 'inventory',
            'inventory-location-explorer': 'inventory',
            'inventory-location-inventory-attribute-viewer': 'inventory',
            'inventory-location-inventory-viewer': 'inventory',
            'inventory-location-master-viewer': 'inventory',
            'inventory-location-quick-find': 'inventory',
            'inventory-lot-freight': 'inventory',
            'inventory-lot-workbench': 'inventory',
            'inventory-mismatch-company-viewer': 'inventory',
            // Tambahkan pemetaan untuk menu Performance Management
            'performance-kpis': 'performance-management',
            'performance-analytics': 'performance-management',
            'performance-goals': 'performance-management',
            // Tambahkan pemetaan untuk menu System Management
            'system-management-users': 'system-management',
            'system-management-logs': 'system-management',
            'system-management-backup': 'system-management',
            // Tambahkan pemetaan untuk menu Setting Optimization
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            // Tambahkan pemetaan untuk menu Data Archiving
            'archive-documents': 'data-archiving',
            'archive-media': 'data-archiving',
            'archive-financial': 'data-archiving',
        };


        /**
         * Memilih kategori sidebar dan menampilkan konten yang sesuai.
         * @param {string} category - ID kategori yang dipilih.
         */
        window.selectCategory = function(category) {
            // Hapus kelas aktif dari semua item sidebar dan reset teks warna
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active-sidebar-item', 'bg-wise-light-gray');
                // Optional: reset panah jika item utama diklik untuk navigasi (bukan toggle)
                const arrow = item.querySelector('.fas.fa-chevron-down');
                if (arrow) {
                    arrow.classList.remove('rotate-180');
                    arrow.classList.add('rotate-0');
                }
            });
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                item.classList.add('text-wise-gray');
            });

            // Tambahkan kelas aktif ke item yang dipilih
            let selectedElement = document.getElementById(category);
            let parentIdOfSelectedChild = parentMapping[category];

            if (selectedElement) { // Jika elemen yang dipilih adalah item utama (misal: 'dashboard', 'configuration')
                selectedElement.classList.add('active-sidebar-item', 'bg-wise-light-gray');
                // Jika itu adalah item utama yang memiliki anak (misal: 'configuration', 'viewer'), pastikan anak-anaknya TERBUKA
                const childrenContainer = document.getElementById(`${category}-children`);
                const arrowIcon = document.getElementById(`${category}-arrow`);
                if (childrenContainer && childrenContainer.classList.contains('hidden')) {
                    childrenContainer.classList.remove('hidden');
                    if (arrowIcon) {
                        arrowIcon.classList.remove('rotate-0');
                        arrowIcon.classList.add('rotate-180');
                    }
                }
            } else if (parentIdOfSelectedChild) { // Jika elemen yang dipilih adalah sub-item (misal: 'receiving-receipt-explorer')
                const childElement = document.querySelector(`[onclick="selectCategory('${category}')"]`);
                if (childElement) {
                    childElement.classList.add('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                    childElement.classList.remove('text-wise-gray');

                    const parentSidebarItem = document.getElementById(parentIdOfSelectedChild);
                    if (parentSidebarItem) {
                        parentSidebarItem.classList.add('active-sidebar-item', 'bg-wise-light-gray');
                        // Pastikan parent terbuka saat sub-item dipilih
                        const parentChildrenDiv = document.getElementById(`${parentIdOfSelectedChild}-children`);
                        const parentArrowIcon = document.getElementById(`${parentIdOfSelectedChild}-arrow`);
                        if (parentChildrenDiv && parentChildrenDiv.classList.contains('hidden')) {
                            parentChildrenDiv.classList.remove('hidden');
                            if (parentArrowIcon) {
                                parentArrowIcon.classList.remove('rotate-0');
                                parentArrowIcon.classList.add('rotate-180');
                            }
                        }
                    }
                }
            }
            // else: Jika category tidak ditemukan (misal: id typo atau belum ada di HTML), tidak ada yang di-highlight.

            currentCategory = category;
            const content = contentData[category];
            const defaultContentArea = document.getElementById('default-content-area');
            const searchOverlay = document.getElementById('search-overlay');

            // Sembunyikan overlay pencarian saat memilih kategori
            searchOverlay.classList.add('hidden');

            if (content && content.full) {
                defaultContentArea.innerHTML = content.full;
                defaultContentArea.classList.remove('hidden');
            } else if (content && content.detail) {
                defaultContentArea.innerHTML = content.detail;
                defaultContentArea.classList.remove('hidden');
            } else {
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konten untuk ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">Tidak ada konten spesifik yang tersedia untuk kategori ini.</p>`;
                defaultContentArea.classList.remove('hidden');
            }

            // Inisialisasi formulir atau tabel jika kategori terkait
            // Khusus untuk Receipt Explorer, panggil renderReceiptTable()
            if (category === 'receiving-receipt-explorer') {
                // Initialize filtered data and render table on load
                filteredReceiptData = [...receiptData]; // Start with unfiltered data for initial render
                currentPage = 1;
                renderReceiptTable();
            }
            
            // Tutup sidebar di tampilan mobile setelah memilih kategori
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        };

        /**
         * Mengganti visibilitas dropdown konfigurasi (DCS).
         */
        window.toggleConfigDropdown = function() {
            const configDropdown = document.getElementById('config-dropdown');
            configDropdown.classList.toggle('hidden');
            if (!configDropdown.classList.contains('hidden')) {
                configDropdown.classList.remove('animate-slide-up'); // Reset animation for re-trigger
                void configDropdown.offsetWidth; // Trigger reflow
                configDropdown.classList.add('animate-slide-up');
            }
        };

        /**
         * Memilih opsi dari dropdown konfigurasi (DCS) dan menampilkan kontennya.
         * @param {string} option - Opsi yang dipilih (misalnya, 'DCC', 'DCE').
         */
        window.selectConfigOption = function(option) {
            const configDropdownToggle = document.getElementById('config-dropdown-toggle');
            configDropdownToggle.querySelector('span').textContent = option; // Update teks tombol
            document.getElementById('config-dropdown').classList.add('hidden'); // Sembunyikan dropdown

            // Tampilkan konten yang sesuai di area utama
            selectCategory(option);
        };


        /**
         * Menangani input pencarian dari header atau overlay.
         * @param {string} query - Kata kunci pencarian.
         */
        window.handleSearch = function(query) {
            const searchOverlay = document.getElementById('search-overlay');
            const overlaySearchInput = document.getElementById('overlay-search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');

            if (query.length > 0) {
                // Tampilkan overlay pencarian jika ada query
                searchOverlay.classList.remove('hidden');
                overlaySearchInput.value = query; // Isi input overlay dengan query
                performSearch(query, 'overlay'); // Lakukan pencarian di overlay
                searchHistoryDropdown.classList.add('hidden'); // Sembunyikan riwayat pencarian
            } else {
                // Sembunyikan overlay pencarian jika query kosong
                searchOverlay.classList.add('hidden');
                selectCategory(currentCategory); // Kembali ke kategori saat ini
                showSearchHistory(); // Tampilkan riwayat pencarian
            }
        };

        /**
         * Melakukan pencarian dan menampilkan hasilnya.
         * @param {string} query - Kata kunci pencarian.
         * @param {string} source - Sumber pencarian ('overlay' atau lainnya).
         */
        window.performSearch = function(query, source) {
            const resultsPanel = source === 'overlay' ? document.getElementById('overlay-search-results-list-panel') : document.getElementById('search-results-content');
            const detailPanel = source === 'overlay' ? document.getElementById('overlay-detail-content-panel') : null;
            const filtersContainer = source === 'overlay' ? document.getElementById('overlay-search-filters') : document.getElementById('search-filters');

            // Sembunyikan filter default
            const overlayFilterArticles = document.getElementById('overlay-filter-articles');
            if (overlayFilterArticles) overlayFilterArticles.classList.add('hidden');
            const overlayFilterPhotography = document.getElementById('overlay-filter-photography');
            if (overlayFilterPhotography) overlayFilterPhotography.classList.add('hidden');
            const filterArticles = document.getElementById('filter-articles');
            if (filterArticles) filterArticles.classList.add('hidden');
            const filterPhotography = document.getElementById('filter-photography');
            if (filterPhotography) filterPhotography.classList.add('hidden');


            if (query.length > 0) {
                if (filtersContainer) filtersContainer.classList.remove('hidden');

                let filteredResults = searchItems.filter(item =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.category.toLowerCase().includes(query.toLowerCase()) ||
                    (item.id && item.id.toLowerCase().includes(query.toLowerCase()))
                );

                if (activeFilters.length > 0) {
                    filteredResults = filteredResults.filter(item =>
                        activeFilters.some(filter => item.category.toLowerCase().includes(filter.toLowerCase()))
                    );
                }

                if (resultsPanel) resultsPanel.innerHTML = '';

                if (filteredResults.length > 0) {
                    if (overlayFilterArticles && filteredResults.some(item => item.category.toLowerCase().includes('article') || item.title.toLowerCase().includes('article'))) {
                        overlayFilterArticles.classList.remove('hidden');
                    }
                    if (overlayFilterPhotography && filteredResults.some(item => item.category.toLowerCase().includes('photography') || item.title.toLowerCase().includes('photo'))) {
                        overlayFilterPhotography.classList.remove('hidden');
                    }

                    filteredResults.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.classList.add('py-2', 'px-3', 'bg-wise-light-gray', 'rounded-lg', 'shadow-sm', 'cursor-pointer', 'hover:bg-gray-100', 'mb-2', 'transition-all-smooth');
                        resultItem.innerHTML = `
                            <h4 class="text-wise-dark-gray font-medium text-sm">${item.title}</h4>
                            <p class="text-wise-gray text-xs">Kategori: ${item.category} | Terakhir Diperbarui: ${item.lastUpdated}</p>
                        `;
                        resultItem.onmouseenter = (event) => showPreview(item.id, event);
                        resultItem.onclick = () => selectSearchResult(item.id, item.title, query);
                        if (resultsPanel) resultsPanel.appendChild(resultItem);
                    });
                } else {
                    if (resultsPanel) resultsPanel.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada hasil ditemukan.</p>`;
                    if (filtersContainer) filtersContainer.classList.add('hidden');
                }
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
            } else {
                if (resultsPanel) resultsPanel.innerHTML = '';
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
                if (filtersContainer) filtersContainer.classList.add('hidden');
            }
        };

        /**
         * Menampilkan pratinjau konten di panel detail overlay pencarian.
         * @param {string} id - ID konten yang akan dipratinjau.
         */
        window.showPreview = function(id) {
            const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
            const content = contentData[id];

            if (overlayDetailContentPanel && content && (content.detail || content.full)) {
                overlayDetailContentPanel.innerHTML = `
                    ${content.detail || content.full}
                    <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="displayContentInMainDashboard('${id}')">
                        Tampilkan Halaman
                    </button>
                `;
            } else if (overlayDetailContentPanel) {
                overlayDetailContentPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Tidak ada pratinjau tersedia untuk item ini.</p>`;
            }
        };

        /**
         * Memilih hasil pencarian dan menampilkan kontennya di dashboard utama.
         * @param {string} id - ID konten yang dipilih.
         * @param {string} title - Judul hasil pencarian.
         * @param {string} query - Kata kunci pencarian yang mengarah ke hasil ini.
         */
        window.selectSearchResult = function(id, title, query) {
            addSearchHistory(query); // Tambahkan query ke riwayat pencarian
            displayContentInMainDashboard(id); // Tampilkan konten di dashboard utama
        };

        /**
         * Menampilkan konten di area dashboard utama.
         * @param {string} id - ID konten yang akan ditampilkan.
         */
        window.displayContentInMainDashboard = function(id) {
            const content = contentData[id];
            const defaultContentArea = document.getElementById('default-content-area');

            if (defaultContentArea) {
                if (content && content.full) {
                    defaultContentArea.innerHTML = content.full;
                } else if (content && content.detail) {
                    defaultContentArea.innerHTML = content.detail;
                } else {
                    defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konten Lengkap untuk ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">Tidak ada konten lengkap yang tersedia.</p>`;
                }
                defaultContentArea.classList.remove('hidden'); // Pastikan area konten terlihat
            }

            closeSearchOverlay(); // Tutup overlay pencarian
            selectCategory(id); // Pilih kategori yang sesuai di sidebar
        };

        /**
         * Menambahkan filter ke overlay pencarian.
         * @param {string} filterName - Nama filter yang akan ditambahkan.
         */
        window.addOverlayFilter = function(filterName) {
            if (!activeFilters.includes(filterName.toLowerCase())) {
                activeFilters.push(filterName.toLowerCase());
                const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
                if (filterElement) filterElement.classList.remove('hidden');
                performSearch(document.getElementById('overlay-search-input').value, 'overlay');
            }
        };

        /**
         * Menghapus filter dari overlay pencarian.
         * @param {string} filterName - Nama filter yang akan dihapus.
         */
        window.removeOverlayFilter = function(filterName) {
            activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
            const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
            if (filterElement) filterElement.classList.add('hidden');
            performSearch(document.getElementById('overlay-search-input').value, 'overlay');
        };

        /**
         * Menghapus semua filter dari overlay pencarian.
         */
        window.removeAllOverlayFilters = function() {
            activeFilters = [];
            const overlayFilterArticles = document.getElementById('overlay-filter-articles');
            if (overlayFilterArticles) overlayFilterArticles.classList.add('hidden');
            const overlayFilterPhotography = document.getElementById('overlay-filter-photography');
            if (overlayFilterPhotography) overlayFilterPhotography.classList.add('hidden');
            const overlaySearchInput = document.getElementById('overlay-search-input');
            if (overlaySearchInput) overlaySearchInput.value = '';
            performSearch('', 'overlay');
        };

        /**
         * Menutup overlay pencarian.
         */
        window.closeSearchOverlay = function() {
            if (searchOverlay) searchOverlay.classList.add('hidden');
            const searchInputHeader = document.getElementById('search-input'); // Header search input
            if (searchInputHeader) searchInputHeader.value = ''; 
            if (overlaySearchInput) overlaySearchInput.value = ''; 
            activeFilters = []; 
            if (overlaySearchFilters) overlaySearchFilters.classList.add('hidden');
            const filterArticles = document.getElementById('filter-articles');
            if (filterArticles) filterArticles.classList.add('hidden');
            const filterPhotography = document.getElementById('filter-photography');
            if (filterPhotography) filterPhotography.classList.add('hidden');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');
            if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden'); 
            selectCategory(currentCategory); 
        };

        /**
         * Mengganti visibilitas dropdown pengguna.
         */
        window.toggleUserDropdown = function() {
            const userDropdown = document.getElementById('user-dropdown');
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        // Menutup dropdown pengguna dan riwayat pencarian saat mengklik di luar area.
        document.addEventListener('click', function(event) {
            const userIconContainer = document.querySelector('header .w-9.h-9.bg-wise-dark-gray.rounded-full');
            const userDropdown = document.getElementById('user-dropdown');
            const searchInput = document.getElementById('search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');
            const configDropdownToggle = document.getElementById('config-dropdown-toggle');
            const configDropdown = document.getElementById('config-dropdown');


            if (userIconContainer && userDropdown && !userIconContainer.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
            if (searchInput && searchHistoryDropdown && !searchInput.contains(event.target) && !searchHistoryDropdown.contains(event.target)) {
                searchHistoryDropdown.classList.add('hidden');
            }
            // Menutup dropdown konfigurasi jika klik di luar
            if (configDropdownToggle && configDropdown && !configDropdownToggle.contains(event.target) && !configDropdown.contains(event.target)) {
                configDropdown.classList.add('hidden');
            }
        });

        /**
         * Menangani proses logout.
         */
        window.handleLogout = async function() {
            const confirmed = await showCustomConfirm('Logout', 'Apakah Anda yakin ingin logout?');
            if (confirmed) {
                await showCustomAlert('Logout', 'Anda berhasil logout.');
                window.location.href = 'login.html';
            }
        };

        /**
         * Navigasi ke halaman profil.
         */
        window.navigateToProfile = function() {
            // Ini akan menjadi tautan ke halaman profil yang sebenarnya.
            // Untuk saat ini, kita bisa menampilkan alert atau mengarahkan ke halaman dummy.
            showCustomAlert('Profil Pengguna', 'Halaman profil akan segera hadir!');
            // window.location.href = 'profile.html'; // Jika ada halaman profil terpisah
        };

        /**
         * Menambahkan query pencarian ke riwayat.
         * @param {string} query - Kata kunci pencarian.
         */
        function addSearchHistory(query) {
            if (query && !searchHistory.includes(query)) {
                searchHistory.unshift(query); // Tambahkan ke awal array
                searchHistory = searchHistory.slice(0, 5); // Batasi hingga 5 item terakhir
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            }
        }

        /**
         * Menampilkan riwayat pencarian di dropdown.
         */
        window.showSearchHistory = function() {
            const historyDropdown = document.getElementById('search-history-dropdown');
            const historyContent = document.getElementById('search-history-content');

            if (!historyDropdown || !historyContent) {
                console.warn("Search history elements not found.");
                return;
            }

            historyContent.innerHTML = ''; // Bersihkan konten sebelumnya

            if (searchHistory.length > 0) {
                searchHistory.forEach((item, index) => {
                    const historyItem = document.createElement('div');
                    historyItem.classList.add('flex', 'items-center', 'justify-between', 'px-3', 'py-2', 'cursor-pointer', 'hover:bg-wise-light-gray', 'rounded-md', 'transition-all-smooth');
                    historyItem.innerHTML = `
                        <span class="text-wise-dark-gray text-sm" onclick="applySearchHistory('${item}')">${item}</span>
                        <button class="text-wise-gray hover:text-wise-dark-gray text-xs ml-2" onclick="removeSearchHistory(${index})">&times;</button>
                    `;
                    historyContent.appendChild(historyItem);
                });
                const clearAllButton = document.createElement('div');
                clearAllButton.classList.add('text-right', 'pt-2', 'pb-1', 'px-3');
                clearAllButton.innerHTML = `<button class="text-wise-gray hover:underline text-xs" onclick="clearAllSearchHistory()">Bersihkan Semua Riwayat</button>`;
                historyContent.appendChild(clearAllButton);

                historyDropdown.classList.remove('hidden');
            } else {
                historyContent.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada riwayat pencarian.</p>`;
                historyDropdown.classList.remove('hidden');
            }
        };

        /**
         * Menerapkan query dari riwayat pencarian.
         * @param {string} query - Kata kunci dari riwayat.
         */
        window.applySearchHistory = function(query) {
            const searchInputElem = document.getElementById('search-input');
            if (searchInputElem) searchInputElem.value = query;
            handleSearch(query); // Panggil handleSearch untuk memicu pencarian dan menampilkan overlay
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');
            if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden');
        };

        /**
         * Menghapus item dari riwayat pencarian.
         * @param {number} index - Indeks item yang akan dihapus.
         */
        window.removeSearchHistory = function(index) {
            searchHistory.splice(index, 1);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            showSearchHistory(); // Perbarui tampilan riwayat
        };

        /**
         * Menghapus semua riwayat pencarian.
         */
        window.clearAllSearchHistory = function() {
            searchHistory = [];
            localStorage.removeItem('searchHistory');
            showSearchHistory(); // Perbarui tampilan riwayat
        };

        // Event listener untuk tombol toggle sidebar
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            const mainContentArea = document.querySelector('main');
            if (sidebar.classList.contains('-translate-x-full')) {
                mainContentArea.classList.remove('md:ml-64');
                mainContentArea.classList.add('ml-0');
                const sidebarOverlay = document.getElementById('sidebar-overlay');
                if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
            } else {
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                if (window.innerWidth < 768) {
                    const sidebarOverlay = document.getElementById('sidebar-overlay');
                    if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
                }
            }
        });

        // Event listener untuk menutup sidebar saat mengklik di luar (mobile)
        document.addEventListener('click', (event) => {
            const sidebarOverlay = document.getElementById('sidebar-overlay'); // Tambahkan ini
            if (window.innerWidth < 768 && !sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target) && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                if (sidebarOverlay) sidebarOverlay.classList.add('hidden'); // Gunakan sidebarOverlay
            }
        });

        /**
         * Fungsi untuk menutup paksa sidebar.
         */
        window.closeSidebar = function() {
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-0');
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
        };

        // Event listener untuk perubahan ukuran jendela
        window.addEventListener('resize', () => {
            const mainContentArea = document.querySelector('main');
            const sidebarOverlay = document.getElementById('sidebar-overlay'); // Tambahkan ini
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('-translate-x-full');
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                if (sidebarOverlay) sidebarOverlay.classList.add('hidden'); // Gunakan sidebarOverlay
            } else {
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
            }
        });

        // Fungsi yang dieksekusi saat halaman dimuat
        window.onload = function() {
            selectCategory('dashboard'); // Pilih kategori 'dashboard' secara default

            const username = "SuperAdmin"; // Atur nama pengguna
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) usernameDisplay.textContent = username; // Tampilkan nama pengguna
        };


        // --- RECEIPT EXPLORER FUNCTIONS ---

        // Dummy data for Receipt Explorer table
        let receiptData = [
            { receiptId: '00000483834', receiptIdType: 'Return', trailerId: '25-06-2025', receiptDate: '2025-06-25', closedDate: '2025-08-01', loadingStatus: 'Loaded', trailingStatus: 'Check in Pending', receiptType: 'Unassigned', purchaseOrderId: 'AA', sourceId: 'Unassigned', source: 'Unassigned', ship: 'Unassigned' },
            { receiptId: 'CD04048958', receiptIdType: 'Crossdock Open', trailerId: '202504454858', receiptDate: '2025-04-21', closedDate: '2025-08-01', loadingStatus: 'In Progress', trailingStatus: 'Check in Pending', receiptType: 'Open', purchaseOrderId: 'PO12346', sourceId: 'S002', source: 'Warehouse B', ship: 'SHP-992' },
            { receiptId: 'TEST', receiptIdType: 'Normal Order', trailerId: '21-07-2025', receiptDate: '2025-07-21', closedDate: '', loadingStatus: 'Pending', trailingStatus: 'Check in Pending', receiptType: 'Open', purchaseOrderId: 'PO12347', sourceId: 'S001', source: 'Supplier A', ship: 'SHP-993' },
            { receiptId: 'Z25099196067', receiptIdType: 'Return Transit O', trailerId: '225099196067', receiptDate: '2025-04-22', closedDate: '2025-07-31', loadingStatus: 'Loaded', trailingStatus: 'Check in Pending', receiptType: 'Standard', purchaseOrderId: '70102', sourceId: 'S60', source: 'Supplier C', ship: 'SHP-994' },
            { receiptId: 'Z2509919738', receiptIdType: 'Transfer', trailerId: '225099197387', receiptDate: '2025-05-22', closedDate: '', loadingStatus: 'Pending', trailingStatus: 'Check in Pending', receiptType: 'Others', purchaseOrderId: '70199', sourceId: 'DCB', source: 'Warehouse B', ship: 'SHP-995' }
        ];

        let currentPage = 1;
        let rowsPerPage = 10;
        let filteredReceiptData = [];

        /**
         * Menerapkan filter dan merender tabel penerimaan.
         */
        window.applyReceiptFilters = function() {
            console.log('applyReceiptFilters called'); // Debugging
            const receiptId = document.getElementById('filter-receipt-id').value.toLowerCase();
            const receiptIdType = document.getElementById('filter-receipt-id-type').value.toLowerCase();
            const trailerId = document.getElementById('filter-trailer-id').value.toLowerCase();
            const receiptDate = document.getElementById('filter-receipt-date').value;
            const closedDate = document.getElementById('filter-closed-date').value;
            const loadingStatus = document.getElementById('filter-loading-status').value.toLowerCase();
            const trailerStatus = document.getElementById('filter-trailer-status').value.toLowerCase();
            const receiptType = document.getElementById('filter-receipt-type').value.toLowerCase();
            const purchaseOrderId = document.getElementById('filter-po-id').value.toLowerCase();
            const sourceId = document.getElementById('filter-source-id').value.toLowerCase();
            const source = document.getElementById('filter-source').value.toLowerCase();
            const ship = document.getElementById('filter-ship').value.toLowerCase();

            console.log('Filter values:', { receiptId, receiptIdType, trailerId, receiptDate, closedDate, loadingStatus, trailerStatus, receiptType, purchaseOrderId, sourceId, source, ship }); // Debugging

            filteredReceiptData = receiptData.filter(receipt => {
                const matchesReceiptId = !receiptId || (receipt.receiptId && receipt.receiptId.toLowerCase().includes(receiptId));
                const matchesReceiptIdType = !receiptIdType || (receipt.receiptIdType && receipt.receiptIdType.toLowerCase() === receiptIdType);
                const matchesTrailerId = !trailerId || (receipt.trailerId && receipt.trailerId.toLowerCase().includes(trailerId));
                const matchesReceiptDate = !receiptDate || (receipt.receiptDate && receipt.receiptDate === receiptDate);
                const matchesClosedDate = !closedDate || (receipt.closedDate && receipt.closedDate === closedDate);
                const matchesLoadingStatus = !loadingStatus || (receipt.loadingStatus && receipt.loadingStatus.toLowerCase() === loadingStatus);
                const matchesTrailerStatus = !trailerStatus || (receipt.trailerStatus && receipt.trailerStatus.toLowerCase() === trailerStatus);
                const matchesReceiptType = !receiptType || (receipt.receiptType && receipt.receiptType.toLowerCase() === receiptType);
                const matchesPurchaseOrderId = !purchaseOrderId || (receipt.purchaseOrderId && receipt.purchaseOrderId.toLowerCase().includes(purchaseOrderId));
                const matchesSourceId = !sourceId || (receipt.sourceId && receipt.sourceId.toLowerCase().includes(sourceId));
                const matchesSource = !source || (receipt.source && receipt.source.toLowerCase().includes(source));
                const matchesShip = !ship || (receipt.ship && receipt.ship.toLowerCase().includes(ship));

                return matchesReceiptId && matchesReceiptIdType && matchesTrailerId && matchesReceiptDate &&
                       matchesClosedDate && matchesLoadingStatus && matchesTrailerStatus && matchesReceiptType &&
                       matchesPurchaseOrderId && matchesSourceId && matchesSource && matchesShip;
            });

            console.log('Filtered data length:', filteredReceiptData.length); // Debugging
            currentPage = 1; // Reset to first page after applying filters
            renderReceiptTable();
        };

        /**
         * Merender tabel penerimaan berdasarkan data yang difilter dan paginasi.
         */
        window.renderReceiptTable = function() {
            console.log('renderReceiptTable called'); // Debugging
            const tableContainer = document.getElementById('receipt-table-container');
            const searchTableInput = document.getElementById('receipt-search-table').value.toLowerCase();
            rowsPerPage = parseInt(document.getElementById('show-entries').value);

            // Data yang akan dirender (sudah difilter oleh applyReceiptFilters atau semua data)
            let dataToRender = [...filteredReceiptData]; // Buat salinan agar tidak memodifikasi array asli
            console.log('Data to render (before table search):', dataToRender.length); // Debugging

            // Apply table search filter (search within current filtered data)
            if (searchTableInput) {
                dataToRender = dataToRender.filter(item => 
                    Object.values(item).some(value => 
                        (value !== null && value !== undefined) && String(value).toLowerCase().includes(searchTableInput)
                    )
                );
                console.log('Data to render (after table search):', dataToRender.length); // Debugging
            }

            const totalEntries = dataToRender.length;
            const totalPages = Math.ceil(totalEntries / rowsPerPage);
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedData = dataToRender.slice(start, end);

            let tableHtml = `
                <table class="min-w-full bg-white border-collapse">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-xs font-semibold tracking-wider">
                            <th class="py-3 px-4 text-left border-b border-wise-border rounded-tl-lg">#</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Receipt ID</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Receipt ID Type</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Trailer ID</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Receipt Date</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Closed Date/Time</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Loading Status</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Trailing Status</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Receipt Type</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Purchase Order ID</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Source ID</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Source</th>
                            <th class="py-3 px-4 text-left border-b border-wise-border">Ship</th>
                            <th class="py-3 px-4 text-center border-b border-wise-border rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light divide-y divide-wise-border">
            `;

            if (paginatedData.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="14" class="py-4 px-6 text-center text-wise-gray">Tidak ada data penerimaan ditemukan.</td>
                    </tr>
                `;
            } else {
                paginatedData.forEach((item, index) => {
                    tableHtml += `
                        <tr class="hover:bg-wise-blue-hover">
                            <td class="py-3 px-4 text-left whitespace-nowrap">${start + index + 1}</td>
                            <td class="py-3 px-4 text-left whitespace-nowrap">${item.receiptId}</td>
                            <td class="py-3 px-4 text-left">${item.receiptIdType}</td>
                            <td class="py-3 px-4 text-left">${item.trailerId}</td>
                            <td class="py-3 px-4 text-left">${item.receiptDate}</td>
                            <td class="py-3 px-4 text-left">${item.closedDate}</td>
                            <td class="py-3 px-4 text-left">${item.loadingStatus}</td>
                            <td class="py-3 px-4 text-left">${item.trailingStatus || ''}</td> <!-- Tambahkan Trailing Status -->
                            <td class="py-3 px-4 text-left">${item.receiptType}</td>
                            <td class="py-3 px-4 text-left">${item.purchaseOrderId}</td>
                            <td class="py-3 px-4 text-left">${item.sourceId}</td>
                            <td class="py-3 px-4 text-left">${item.source}</td>
                            <td class="py-3 px-4 text-left">${item.ship}</td>
                            <td class="py-3 px-4 text-center">
                                <button class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-xs active-press transform" onclick="showReceiptDetails('${item.receiptId}')">Details</button>
                            </td>
                        </tr>
                    `;
                });
            }

            tableHtml += `
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHtml;

            renderReceiptPagination(totalEntries, totalPages);
        };

        /**
         * Merender kontrol paginasi yang lebih dinamis (sliding window).
         * @param {number} totalEntries - Jumlah total data.
         * @param {number} totalPages - Jumlah total halaman.
         */
        function renderReceiptPagination(totalEntries, totalPages) {
            const paginationContainer = document.getElementById('receipt-pagination');
            paginationContainer.innerHTML = '';
            const maxVisibleButtons = 5; // Jumlah tombol halaman yang terlihat

            const startEntry = ((currentPage - 1) * rowsPerPage) + 1;
            const endEntry = Math.min(currentPage * rowsPerPage, totalEntries);

            let pageButtons = '';

            if (totalPages <= maxVisibleButtons) {
                for (let i = 1; i <= totalPages; i++) {
                    pageButtons += `<button class="px-3 py-1 rounded-md border ${i === currentPage ? 'bg-wise-primary text-white border-wise-primary font-semibold' : 'border-wise-border text-wise-gray hover:bg-wise-light-gray'}" onclick="goToReceiptPage(${i})">${i}</button>`;
                }
            } else {
                let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
                let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

                if (endPage - startPage + 1 < maxVisibleButtons) {
                    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
                }

                if (startPage > 1) {
                    pageButtons += `<button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray" onclick="goToReceiptPage(1)">1</button>`;
                    if (startPage > 2) {
                        pageButtons += `<span class="px-3 py-1 text-wise-gray">...</span>`;
                    }
                }

                for (let i = startPage; i <= endPage; i++) {
                    pageButtons += `<button class="px-3 py-1 rounded-md border ${i === currentPage ? 'bg-wise-primary text-white border-wise-primary font-semibold' : 'border-wise-border text-wise-gray hover:bg-wise-light-gray'}" onclick="goToReceiptPage(${i})">${i}</button>`;
                }

                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        pageButtons += `<span class="px-3 py-1 text-wise-gray">...</span>`;
                    }
                    pageButtons += `<button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray" onclick="goToReceiptPage(${totalPages})">${totalPages}</button>`;
                }
            }

            const paginationHtml = `
                <span class="text-sm text-wise-gray">Showing ${startEntry} to ${endEntry} of ${totalEntries} entries</span>
                <nav class="flex items-center space-x-1" aria-label="Pagination">
                    <button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}" onclick="goToReceiptPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    ${pageButtons}
                    <button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}" onclick="goToReceiptPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </nav>
            `;
            paginationContainer.innerHTML = paginationHtml;
        }

        /**
         * Navigasi ke halaman tertentu di tabel penerimaan.
         * @param {number} page - Nomor halaman yang akan dituju.
         */
        window.goToReceiptPage = function(page) {
            const totalEntries = filteredReceiptData.length > 0 ? filteredReceiptData.length : receiptData.length;
            const totalPages = Math.ceil(totalEntries / rowsPerPage);

            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderReceiptTable();
            }
        };

        /**
         * Menampilkan detail penerimaan dalam modal kustom.
         * @param {string} receiptId - ID penerimaan.
         */
        window.showReceiptDetails = async function(receiptId) {
            const receipt = receiptData.find(item => item.receiptId === receiptId);
            if (receipt) {
                let detailsHtml = `
                    <p class="mb-1"><strong>Receipt ID:</strong> ${receipt.receiptId}</p>
                    <p class="mb-1"><strong>Receipt ID Type:</strong> ${receipt.receiptIdType}</p>
                    <p class="mb-1"><strong>Trailer ID:</strong> ${receipt.trailerId}</p>
                    <p class="mb-1"><strong>Receipt Date:</strong> ${receipt.receiptDate}</p>
                    <p class="mb-1"><strong>Closed Date/Time:</strong> ${receipt.closedDate}</p>
                    <p class="mb-1"><strong>Loading Status:</strong> ${receipt.loadingStatus}</p>
                    <p class="mb-1"><strong>Trailing Status:</strong> ${receipt.trailingStatus || 'N/A'}</p>
                    <p class="mb-1"><strong>Receipt Type:</strong> ${receipt.receiptType}</p>
                    <p class="mb-1"><strong>Purchase Order ID:</strong> ${receipt.purchaseOrderId}</p>
                    <p class="mb-1"><strong>Source ID:</strong> ${receipt.sourceId}</p>
                    <p class="mb-1"><strong>Source:</strong> ${receipt.source}</p>
                    <p class="mb-1"><strong>Ship:</strong> ${receipt.ship}</p>
                    <p class="mt-4 text-wise-gray text-sm italic">Ini adalah detail dummy untuk penerimaan.</p>
                `;
                await showCustomAlert(`Detail Penerimaan: ${receiptId}`, detailsHtml);
            } else {
                await showCustomAlert('Error', 'Detail penerimaan tidak ditemukan.');
            }
        };

        // Fungsi yang dieksekusi saat halaman dimuat
        window.onload = function() {
            selectCategory('dashboard'); // Pilih kategori 'dashboard' secara default

            const username = "SuperAdmin"; // Atur nama pengguna
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) usernameDisplay.textContent = username; // Tampilkan nama pengguna
        };

        // Event Listener baru untuk input pencarian utama di header
        // Ini menggantikan onfocus="showSearchHistory()" di HTML
        if (searchInput) { // Pastikan elemen searchInput ditemukan
            searchInput.addEventListener('focus', window.showSearchHistory);
        }

    });
})();
