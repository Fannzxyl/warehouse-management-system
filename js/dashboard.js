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
            const childrenContainer = document.getElementById(parentId + '-children'); // Kontainer sub-menu
            const parentElement = document.getElementById(parentId);                   // Item menu utama yang diklik
            const arrowIcon = document.getElementById(parentId + '-arrow');            // Icon panah

            if (childrenContainer && parentElement && arrowIcon) { // Pastikan semua elemen ditemukan
                childrenContainer.classList.toggle('hidden'); // Toggle visibilitas sub-menu

                // Mengupdate atribut aria-expanded untuk aksesibilitas
                const isExpanded = childrenContainer.classList.contains('hidden') ? 'false' : 'true';
                parentElement.setAttribute('aria-expanded', isExpanded);

                // Rotasi panah: Tambah/hapus kelas 'rotate-180'
                arrowIcon.classList.toggle('rotate-180');

                console.log(`Sub-menu untuk ID "${parentId}" berhasil di-toggle. Status expanded: ${isExpanded}`);
            } else {
                console.warn(`Elemen anak dengan ID "${parentId}-children", parent dengan ID "${parentId}", atau panah dengan ID "${parentId}-arrow" tidak ditemukan.`);
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
            // START: Konten Receipt Explorer yang Diperbarui
            'receiving-receipt-explorer': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Explorer</h2>
                    <p class="text-wise-gray mb-4">Jelajahi detail penerimaan dengan filter dan tabel.</p>

                    <div class="bg-wise-light-gray p-5 rounded-lg shadow-md mb-6">
                        <h3 class="text-lg font-medium text-wise-dark-gray mb-4">Filter Penerimaan</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label for="filter-delivery-date" class="block text-sm font-medium text-wise-dark-gray">Delivery Date:</label>
                                <input type="date" id="filter-delivery-date" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-tr-req-no" class="block text-sm font-medium text-wise-dark-gray">Tr Req No:</label>
                                <input type="text" id="filter-tr-req-no" placeholder="e.g., TR0000155737" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-to-site" class="block text-sm font-medium text-wise-dark-gray">To Site:</label>
                                <input type="text" id="filter-to-site" placeholder="e.g., 70307 - DFB" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-order-group" class="block text-sm font-medium text-wise-dark-gray">Order Group:</label>
                                <input type="text" id="filter-order-group" placeholder="e.g., Finish Product" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-from-site" class="block text-sm font-medium text-wise-dark-gray">From Site:</label>
                                <select id="filter-from-site" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    <option value="">-SELECT-</option>
                                    <option value="70307 - DFB">70307 - DFB</option>
                                    <option value="70306 - CFB">70306 - CFB</option>
                                </select>
                            </div>
                            <div>
                                <label for="filter-collect-date" class="block text-sm font-medium text-wise-dark-gray">Collect Date:</label>
                                <input type="date" id="filter-collect-date" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-status" class="block text-sm font-medium text-wise-dark-gray">Status:</label>
                                <input type="text" id="filter-status" placeholder="e.g., Confirm Ship" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            </div>
                            <div>
                                <label for="filter-collected" class="block text-sm font-medium text-wise-dark-gray">Collected:</label>
                                <select id="filter-collected" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    <option value="">All</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end mt-4">
                            <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="applyReceiptFilters()">
                                GO
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center space-x-2">
                                <label for="show-entries" class="text-sm text-wise-dark-gray">Show</label>
                                <select id="show-entries" class="px-2 py-1 border rounded-md text-sm bg-white text-wise-dark-gray" onchange="renderReceiptTable()">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span class="text-sm text-wise-dark-gray">entries</span>
                            </div>
                            <input type="text" id="receipt-search-table" placeholder="Search..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="renderReceiptTable()">
                        </div>
                        <div id="receipt-table-container" class="overflow-x-auto">
                            <!-- Tabel data akan dirender di sini oleh JavaScript -->
                        </div>
                        <div id="receipt-pagination" class="flex justify-between items-center mt-4">
                            <!-- Pagination akan dirender di sini -->
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

        // Pemetaan kategori anak ke kategori induk untuk navigasi sidebar
        const parentMapping = {
            'yard-vehicles': 'yard-management',
            'yard-equipment': 'yard-management',
            'yard-personnel': 'yard-management',
            'receiving-open-box-balance-viewer': 'receiving',
            'receiving-po-quick-find': 'receiving',
            'receiving-receipt-closet-supplier': 'receiving',
            'receiving-receipt-container-viewer': 'receiving',
            'receiving-receipt-explorer': 'receiving',
            'receiving-receipt-monitoring-close': 'receiving',
            'receiving-receipt-no-close': 'receiving',
            'receiving-receipt-open-closed': 'receiving',
            'receiving-receipt-shipment-closed': 'receiving',
            'receiving-performance-viewer': 'receiving',
            'receiving-workbench': 'receiving',
            'receiving-shipment-closed-viewer': 'receiving',
            'receiving-virtual-viewer': 'receiving',
            'order-planning-consolidated-shipment-history': 'order',
            'order-planning-order-entry': 'order',
            'order-planning-wave-explorer': 'order',
            'order-planning-wave-quick-find': 'order',
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
            'work-label-reprint-utility': 'work',
            'work-picking-management-explorer': 'work',
            'work-picking-sigtion': 'work',
            'work-execution': 'work',
            'work-explorer': 'work',
            'work-insight': 'work',
            'work-monitoring-customer': 'work',
            'work-monitoring-group': 'work',
            'work-quick-find': 'work',
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
            'performance-kpis': 'performance',
            'performance-analytics': 'performance',
            'performance-goals': 'performance',
            'system-management-users': 'system-management',
            'system-management-logs': 'system-management',
            'system-management-backup': 'system-management',
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            'archive-documents': 'archive',
            'archive-media': 'archive',
            'archive-financial': 'archive',
            // Menambahkan pemetaan untuk opsi dropdown DCS
            'DCC': 'DCS',
            'DCE': 'DCS',
            'DCF': 'DCS',
            'DCJ': 'DCS',
            'DCK': 'DCS',
            'DCL': 'DCS',
            'DCM': 'DCS',
            'DCP': 'DCS',
            'DCS': 'DCS', // Ini adalah item utama, bisa juga tidak ada parent jika tidak perlu toggle
            'DCT': 'DCS',
            'DCY': 'DCS',
            'GBG': 'DCS',
        };

        /**
         * Mengganti visibilitas sub-menu sidebar.
         * @param {string} category - ID kategori induk.
         */
        window.toggleChildren = function(category) {
            const childrenContainer = document.getElementById(`${category}-children`);
            const parentElement = document.getElementById(category);
            const arrowIcon = document.getElementById(`${category}-arrow`);

            if (childrenContainer && parentElement && arrowIcon) {
                childrenContainer.classList.toggle('hidden');
                arrowIcon.classList.toggle('rotate-180'); // Menggunakan rotate-180 untuk rotasi penuh
                
                // Update aria-expanded attribute
                const isExpanded = childrenContainer.classList.contains('hidden') ? 'false' : 'true';
                parentElement.setAttribute('aria-expanded', isExpanded);

                console.log(`Sub-menu untuk ID "${category}" berhasil di-toggle. Status expanded: ${isExpanded}`);
            } else {
                console.warn(`Elemen anak dengan ID "${category}-children", parent dengan ID "${category}", atau panah dengan ID "${category}-arrow" tidak ditemukan.`);
            }
        };

        /**
         * Memilih kategori sidebar dan menampilkan konten yang sesuai.
         * @param {string} category - ID kategori yang dipilih.
         */
        window.selectCategory = function(category) {
            // Hapus kelas aktif dari semua item sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active-sidebar-item', 'bg-wise-light-gray');
            });
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                item.classList.add('text-wise-gray');
            });

            // Tambahkan kelas aktif ke item yang dipilih
            const selectedMainDashboardItem = document.getElementById('sidebar-dashboard-main');
            const selectedCollapsibleGroup = document.getElementById(category); // Menggunakan ID langsung karena sudah diperbaiki

            if (category === 'dashboard' && selectedMainDashboardItem) {
                selectedMainDashboardItem.classList.add('active-sidebar-item', 'bg-wise-light-gray');
            } else if (selectedCollapsibleGroup) {
                selectedCollapsibleGroup.classList.add('active-sidebar-item', 'bg-wise-light-gray');
            } else {
                const childElement = document.querySelector(`[onclick="selectCategory('${category}')"]`);
                if (childElement) {
                    childElement.classList.add('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                    childElement.classList.remove('text-wise-gray');

                    const parentCategory = parentMapping[category];
                    if (parentCategory) {
                        const parentSidebarItem = document.getElementById(parentCategory); // Menggunakan ID langsung
                        if (parentSidebarItem) {
                            parentSidebarItem.classList.add('active-sidebar-item', 'bg-wise-light-gray');
                        }
                        const parentChildrenDiv = document.getElementById(`${parentCategory}-children`);
                        const parentArrowIcon = document.getElementById(`${parentCategory}-arrow`);
                        if (parentChildrenDiv && parentChildrenDiv.classList.contains('hidden')) {
                            parentChildrenDiv.classList.remove('hidden');
                            if (parentArrowIcon) {
                                parentArrowIcon.classList.remove('rotate-0');
                                parentArrowIcon.classList.add('rotate-180'); // Rotasi 180 untuk membuka
                            }
                        }
                    }
                }
            }

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
            document.getElementById('overlay-filter-articles').classList.add('hidden');
            document.getElementById('overlay-filter-photography').classList.add('hidden');
            const filterArticles = document.getElementById('filter-articles');
            if (filterArticles) filterArticles.classList.add('hidden');
            const filterPhotography = document.getElementById('filter-photography');
            if (filterPhotography) filterPhotography.classList.add('hidden');


            if (query.length > 0) {
                filtersContainer.classList.remove('hidden');

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

                resultsPanel.innerHTML = '';

                if (filteredResults.length > 0) {
                    if (filteredResults.some(item => item.category.toLowerCase().includes('article') || item.title.toLowerCase().includes('article'))) {
                        document.getElementById(`${source}-filter-articles`).classList.remove('hidden');
                    }
                    if (filteredResults.some(item => item.category.toLowerCase().includes('photography') || item.title.toLowerCase().includes('photo'))) {
                        document.getElementById(`${source}-filter-photography`).classList.remove('hidden');
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
                        resultsPanel.appendChild(resultItem);
                    });
                } else {
                    resultsPanel.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada hasil ditemukan.</p>`;
                    filtersContainer.classList.add('hidden');
                }
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
            } else {
                resultsPanel.innerHTML = '';
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
                filtersContainer.classList.add('hidden');
            }
        };

        /**
         * Menampilkan pratinjau konten di panel detail overlay pencarian.
         * @param {string} id - ID konten yang akan dipratinjau.
         */
        window.showPreview = function(id) {
            const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
            const content = contentData[id];

            if (content && (content.detail || content.full)) {
                overlayDetailContentPanel.innerHTML = `
                    ${content.detail || content.full}
                    <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="displayContentInMainDashboard('${id}')">
                        Tampilkan Halaman
                    </button>
                `;
            } else {
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

            if (content && content.full) {
                defaultContentArea.innerHTML = content.full;
            } else if (content && content.detail) {
                defaultContentArea.innerHTML = content.detail;
            } else {
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konten Lengkap untuk ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">Tidak ada konten lengkap yang tersedia.</p>`;
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
                document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.remove('hidden');
                performSearch(document.getElementById('overlay-search-input').value, 'overlay');
            }
        };

        /**
         * Menghapus filter dari overlay pencarian.
         * @param {string} filterName - Nama filter yang akan dihapus.
         */
        window.removeOverlayFilter = function(filterName) {
            activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
            document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.add('hidden');
            performSearch(document.getElementById('overlay-search-input').value, 'overlay');
        };

        /**
         * Menghapus semua filter dari overlay pencarian.
         */
        window.removeAllOverlayFilters = function() {
            activeFilters = [];
            document.getElementById('overlay-filter-articles').classList.add('hidden');
            document.getElementById('overlay-filter-photography').classList.add('hidden');
            document.getElementById('overlay-search-input').value = '';
            performSearch('', 'overlay');
        };

        /**
         * Menutup overlay pencarian.
         */
        window.closeSearchOverlay = function() {
            document.getElementById('search-overlay').classList.add('hidden');
            document.getElementById('search-input').value = ''; // Kosongkan input pencarian header
            document.getElementById('overlay-search-input').value = ''; // Kosongkan input pencarian overlay
            activeFilters = []; // Hapus semua filter aktif
            document.getElementById('overlay-search-filters').classList.add('hidden');
            const filterArticles = document.getElementById('filter-articles');
            if (filterArticles) filterArticles.classList.add('hidden');
            const filterPhotography = document.getElementById('filter-photography');
            if (filterPhotography) filterPhotography.classList.add('hidden');
            document.getElementById('search-history-dropdown').classList.add('hidden'); // Sembunyikan riwayat pencarian
            selectCategory(currentCategory); // Kembali ke kategori saat ini
        };

        /**
         * Mengganti visibilitas dropdown pengguna.
         */
        window.toggleUserDropdown = function() {
            const userDropdown = document.getElementById('user-dropdown');
            userDropdown.classList.toggle('hidden');
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
            if (!searchInput.contains(event.target) && !searchHistoryDropdown.contains(event.target)) {
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
            // Hapus atau jadikan komentar baris di bawah ini
            // showCustomAlert('Profil Pengguna', 'Halaman profil akan segera hadir!');

            // Aktifkan baris di bawah ini (hapus tanda // di depannya)
            window.location.href = 'profile.html'; 
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
                clearAllButton.innerHTML = `<button class="text-wise-gray hover:underline text-xs" onclick="clearAllSearchHistory()">clear All Search History</button>`;
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
            document.getElementById('search-input').value = query;
            handleSearch(query); // Panggil handleSearch untuk memicu pencarian dan menampilkan overlay
            document.getElementById('search-history-dropdown').classList.add('hidden');
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
                document.getElementById('sidebar-overlay').classList.add('hidden');
            } else {
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                if (window.innerWidth < 768) {
                    document.getElementById('sidebar-overlay').classList.remove('hidden');
                }
            }
        });

        // Event listener untuk menutup sidebar saat mengklik di luar (mobile)
        document.addEventListener('click', (event) => {
            if (window.innerWidth < 768 && !sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target) && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        });

        /**
         * Fungsi untuk menutup paksa sidebar.
         */
        window.closeSidebar = function() {
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-0');
            document.getElementById('sidebar-overlay').classList.add('hidden');
        };

        // Event listener untuk perubahan ukuran jendela
        window.addEventListener('resize', () => {
            const mainContentArea = document.querySelector('main');
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('-translate-x-full');
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            } else {
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
            }
        });

        // Fungsi yang dieksekusi saat halaman dimuat
        window.onload = function() {
            selectCategory('dashboard'); // Pilih kategori 'dashboard' secara default

            const username = "SuperAdmin"; // Atur nama pengguna
            document.getElementById('username-display').textContent = username; // Tampilkan nama pengguna
        };


        // --- RECEIPT EXPLORER FUNCTIONS ---

        // Dummy data for Receipt Explorer table
        let receiptData = [
            { trReqNo: 'TR0000155737', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-28 09:04:50', shipDate: '2025-07-30 08:36:21', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000155746', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-29 11:13:19', shipDate: '2025-07-30 11:11:19', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156066', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-29 11:52:44', shipDate: '2025-07-30 11:20:20', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156089', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-29 12:40:11', shipDate: '2025-07-30 11:20:20', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156146', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-29 15:52:44', shipDate: '2025-07-30 11:32:59', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156192', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 09:34:21', shipDate: '2025-07-30 09:38:13', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156239', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 10:42:01', shipDate: '2025-07-30 10:42:01', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156260', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 11:15:50', shipDate: '2025-07-30 11:10:44', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156269', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:40:09', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156293', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 12:54:48', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156300', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156312', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156320', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156331', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156345', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
            { trReqNo: 'TR0000156350', fromSite: '70307 - DFB', toSite: '70306 - CFB', orderGroup: 'Finish Product', deliveryDate: '2025-07-31', collectDate: '2025-07-30 13:00:02', shipDate: '2025-07-30 12:54:48', status: 'Confirm Ship / Trf G.L.D' },
        ];

        let currentPage = 1;
        let rowsPerPage = 10;
        let filteredReceiptData = [];

        /**
         * Menerapkan filter dan merender tabel penerimaan.
         */
        window.applyReceiptFilters = function() {
            const deliveryDate = document.getElementById('filter-delivery-date').value;
            const trReqNo = document.getElementById('filter-tr-req-no').value.toLowerCase();
            const toSite = document.getElementById('filter-to-site').value.toLowerCase();
            const orderGroup = document.getElementById('filter-order-group').value.toLowerCase();
            const fromSite = document.getElementById('filter-from-site').value.toLowerCase();
            const collectDate = document.getElementById('filter-collect-date').value;
            const status = document.getElementById('filter-status').value.toLowerCase();
            const collected = document.getElementById('filter-collected').value;

            filteredReceiptData = receiptData.filter(receipt => {
                const matchesDeliveryDate = !deliveryDate || receipt.deliveryDate === deliveryDate;
                const matchesTrReqNo = !trReqNo || receipt.trReqNo.toLowerCase().includes(trReqNo);
                const matchesToSite = !toSite || receipt.toSite.toLowerCase().includes(toSite);
                const matchesOrderGroup = !orderGroup || receipt.orderGroup.toLowerCase().includes(orderGroup);
                const matchesFromSite = !fromSite || receipt.fromSite.toLowerCase().includes(fromSite);
                const matchesCollectDate = !collectDate || receipt.collectDate.startsWith(collectDate); // Match date part only
                const matchesStatus = !status || receipt.status.toLowerCase().includes(status);
                const matchesCollected = !collected || (collected === 'Yes' && receipt.collected) || (collected === 'No' && !receipt.collected);

                return matchesDeliveryDate && matchesTrReqNo && matchesToSite && matchesOrderGroup &&
                       matchesFromSite && matchesCollectDate && matchesStatus && matchesCollected;
            });

            currentPage = 1; // Reset to first page after applying filters
            renderReceiptTable();
        };

        /**
         * Merender tabel penerimaan berdasarkan data yang difilter dan paginasi.
         */
        window.renderReceiptTable = function() {
            const tableContainer = document.getElementById('receipt-table-container');
            const searchTableInput = document.getElementById('receipt-search-table').value.toLowerCase();
            rowsPerPage = parseInt(document.getElementById('show-entries').value);

            let dataToRender = filteredReceiptData.length > 0 ? filteredReceiptData : receiptData;

            // Apply table search filter
            if (searchTableInput) {
                dataToRender = dataToRender.filter(item => 
                    Object.values(item).some(value => 
                        String(value).toLowerCase().includes(searchTableInput)
                    )
                );
            }

            const totalPages = Math.ceil(dataToRender.length / rowsPerPage);
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedData = dataToRender.slice(start, end);

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Tr Req No</th>
                            <th class="py-3 px-6 text-left">From Site</th>
                            <th class="py-3 px-6 text-left">To Site</th>
                            <th class="py-3 px-6 text-left">Order Group</th>
                            <th class="py-3 px-6 text-left">Delivery Date</th>
                            <th class="py-3 px-6 text-left">Collect Date</th>
                            <th class="py-3 px-6 text-left">Ship Date</th>
                            <th class="py-3 px-6 text-left">Status</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (paginatedData.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="9" class="py-3 px-6 text-center">Tidak ada data penerimaan ditemukan.</td>
                    </tr>
                `;
            } else {
                paginatedData.forEach(item => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${item.trReqNo}</td>
                            <td class="py-3 px-6 text-left">${item.fromSite}</td>
                            <td class="py-3 px-6 text-left">${item.toSite}</td>
                            <td class="py-3 px-6 text-left">${item.orderGroup}</td>
                            <td class="py-3 px-6 text-left">${item.deliveryDate}</td>
                            <td class="py-3 px-6 text-left">${item.collectDate}</td>
                            <td class="py-3 px-6 text-left">${item.shipDate}</td>
                            <td class="py-3 px-6 text-left">${item.status}</td>
                            <td class="py-3 px-6 text-center">
                                <button class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-xs active-press transform" onclick="showReceiptDetails('${item.trReqNo}')">Details</button>
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

            renderReceiptPagination(totalPages);
        };

        /**
         * Merender kontrol paginasi untuk tabel penerimaan.
         * @param {number} totalPages - Jumlah total halaman.
         */
        function renderReceiptPagination(totalPages) {
            const paginationContainer = document.getElementById('receipt-pagination');
            paginationContainer.innerHTML = '';

            let paginationHtml = `
                <span class="text-sm text-wise-gray">Showing ${((currentPage - 1) * rowsPerPage) + 1} to ${Math.min(currentPage * rowsPerPage, filteredReceiptData.length > 0 ? filteredReceiptData.length : receiptData.length)} of ${filteredReceiptData.length > 0 ? filteredReceiptData.length : receiptData.length} entries</span>
                <nav class="flex space-x-1" aria-label="Pagination">
                    <button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray transition-colors duration-200 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}" onclick="goToReceiptPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                paginationHtml += `
                    <button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray transition-colors duration-200 ${i === currentPage ? 'bg-wise-primary text-white border-wise-primary' : ''}" onclick="goToReceiptPage(${i})">${i}</button>
                `;
            }

            paginationHtml += `
                    <button class="px-3 py-1 rounded-md border border-wise-border text-wise-gray hover:bg-wise-light-gray transition-colors duration-200 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}" onclick="goToReceiptPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
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
         * @param {string} trReqNo - Nomor permintaan transaksi dari penerimaan.
         */
        window.showReceiptDetails = async function(trReqNo) {
            const receipt = receiptData.find(item => item.trReqNo === trReqNo);
            if (receipt) {
                let detailsHtml = `
                    <p><strong>Tr Req No:</strong> ${receipt.trReqNo}</p>
                    <p><strong>From Site:</strong> ${receipt.fromSite}</p>
                    <p><strong>To Site:</strong> ${receipt.toSite}</p>
                    <p><strong>Order Group:</strong> ${receipt.orderGroup}</p>
                    <p><strong>Delivery Date:</strong> ${receipt.deliveryDate}</p>
                    <p><strong>Collect Date:</strong> ${receipt.collectDate}</p>
                    <p><strong>Ship Date:</strong> ${receipt.shipDate}</p>
                    <p><strong>Status:</strong> ${receipt.status}</p>
                    <p class="mt-4 text-wise-gray text-sm">Ini adalah detail dummy untuk penerimaan.</p>
                `;
                await showCustomAlert(`Detail Penerimaan: ${trReqNo}`, detailsHtml);
            } else {
                await showCustomAlert('Error', 'Detail penerimaan tidak ditemukan.');
            }
        };

        // Fungsi yang dieksekusi saat halaman dimuat
        window.onload = function() {
            selectCategory('dashboard'); // Pilih kategori 'dashboard' secara default

            const username = "SuperAdmin"; // Atur nama pengguna
            document.getElementById('username-display').textContent = username; // Tampilkan nama pengguna
        };
    });
})();
