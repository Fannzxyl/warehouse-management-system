document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen-elemen DOM yang dibutuhkan
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input'); // Search input di header utama
    const searchButton = document.querySelector('header .flex-1.flex.justify-center.relative .bg-wise-dark-gray'); // Tombol cari di header utama
    const searchOverlay = document.getElementById('search-overlay'); // Overlay pencarian
    const overlaySearchInput = document.getElementById('overlay-search-input'); // Search input di dalam overlay
    const overlaySearchButton = document.getElementById('overlay-search-button'); // Tombol cari di dalam overlay
    const closeOverlayButton = document.getElementById('close-overlay-button'); // Tombol tutup di overlay
    const searchHistoryDropdown = document.getElementById('search-history-dropdown'); // Dropdown riwayat pencarian
    const overlaySearchResultsListPanel = document.getElementById('overlay-search-results-list-panel'); // Panel hasil pencarian di overlay
    const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel'); // Panel detail/preview di overlay
    const overlaySearchFilters = document.getElementById('overlay-search-filters'); // Container filter di overlay
    const overlayFilterArticles = document.getElementById('overlay-filter-articles'); // Filter artikel di overlay
    const overlayFilterPhotography = document.getElementById('overlay-filter-photography'); // Filter fotografi di overlay
    const overlayRemoveAllFiltersButton = document.getElementById('overlay-remove-all-filters'); // Tombol hapus semua filter di overlay

    const userMenuButton = document.querySelector('header .w-7.h-7.md\\:w-8.md\\:h-8.bg-gray-300'); // Tombol menu user
    const userDropdown = document.getElementById('user-dropdown'); // Dropdown menu user
    const logoutButton = document.querySelector('#user-dropdown a[onclick="handleLogout()"]'); // Tombol logout

    // Data konten untuk halaman konfigurasi dan referensi ke halaman dashboard
    const contentData = {
        // Konten utama untuk kategori konfigurasi (overview)
        'configuration': {
            path: 'component/configuration/overview.html',
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konfigurasi Sistem</h2>
                <p class="text-gray-600 mb-4">Di sini kamu bisa mengelola berbagai konfigurasi untuk sistem WISE. Pilih sub-kategori dari sidebar untuk mengelola Warehouse, Zone, atau Location Type.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Manajemen Gudang</h3>
                        <p class="text-gray-600 text-sm mt-1">Mengelola detail gudang, termasuk alamat dan pengguna resmi.</p>
                        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="selectCategory('configuration-warehouse')">
                            Kelola Gudang
                        </button>
                    </div>
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Manajemen Zona</h3>
                        <p class="text-gray-600 text-sm mt-1">Menentukan dan mengelola berbagai zona dalam gudang.</p>
                        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="selectCategory('configuration-zone')">
                            Kelola Zona
                        </button>
                    </div>
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Manajemen Tipe Lokasi</h3>
                        <p class="text-gray-600 text-sm mt-1">Mengonfigurasi tipe lokasi penyimpanan berdasarkan dimensi dan berat.</p>
                        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="selectCategory('configuration-location-type')">
                            Kelola Tipe Lokasi
                        </button>
                    </div>
                </div>
            `,
        },
        // Konten untuk sub-kategori konfigurasi (dimuat dari file HTML terpisah)
        'configuration-warehouse': {
            path: 'component/configuration/warehouse.html',
            detail: `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konfigurasi - Gudang</h2><p class="text-gray-600">Kelola gudang yang ada atau tambahkan yang baru.</p>`,
        },
        'configuration-zone': {
            path: 'component/configuration/zone.html',
            detail: `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konfigurasi - Zona</h2><p class="text-gray-600">Kelola tipe zona untuk berbagai area dalam gudang.</p>`,
        },
        'configuration-location-type': {
            path: 'component/configuration/location-type.html',
            detail: `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konfigurasi - Tipe Lokasi</h2><p class="text-gray-600">Konfigurasi tipe lokasi penyimpanan berdasarkan dimensi dan berat.</p>`,
        },
        // Tambahkan entri untuk semua kategori dashboard agar searchbar bisa mengarahkannya
        'dashboard-overview': { path: 'component/dashboard-overview.html' },
        'yard management/overview': { path: 'component/yard management/overview.html' },
        'yard management/vehicles': { path: 'component/yard management/vehicles.html' },
        'yard management/equipment': { path: 'component/yard management/equipment.html' },
        'yard management/personel': { path: 'component/yard management/personel.html' },
        'receiving/overview': { path: 'component/receiving/overview.html' },
        'receiving/deliveries': { path: 'component/receiving/deliveries.html' },
        'receiving/returns': { path: 'component/receiving/returns.html' },
        'receiving/vendors': { path: 'component/receiving/vendors.html' },
        'order planning/overview': { path: 'component/order planning/overview.html' },
        'order planning/new-order': { path: 'component/order planning/new-order.html' },
        'order planning/pending-order': { path: 'component/order planning/pending-order.html' },
        'order planning/order-history': { path: 'component/order planning/order-history.html' },
        'work/overview': { path: 'component/work/overview.html' },
        'work/tasks': { path: 'component/work/tasks.html' },
        'work/schedule': { path: 'component/work/schedule.html' },
        'work/teams': { path: 'component/work/teams.html' },
        'cross application/overview': { path: 'component/cross application/overview.html' },
        'cross application/integrations': { path: 'component/cross application/integrations.html' },
        'cross application/data-sync': { path: 'component/cross application/data-sync.html' },
        'cross application/api-management': { path: 'component/cross application/api-management.html' },
        'inventory/overview': { path: 'component/inventory/overview.html' },
        'inventory/yard': { path: 'component/inventory/yard.html' },
        'inventory/warehouse': { path: 'component/inventory/warehouse.html' },
        'inventory/storage': { path: 'component/inventory/storage.html' },
        'performance management/overview': { path: 'component/performance management/overview.html' },
        'performance management/kpis': { path: 'component/performance management/KPIs.html' },
        'performance management/analytics': { path: 'component/performance management/analytics.html' },
        'performance management/goals': { path: 'component/performance management/goals.html' },
        'system management/overview': { path: 'component/system management/overview.html' },
        'system management/users': { path: 'component/system management/users.html' },
        'system management/logs': { path: 'component/system management/logs.html' },
        'system management/backup': { path: 'component/system management/backup.html' },
        'setting optimazation/overview': { path: 'component/setting optimazation/overview.html' },
        'setting optimazation/general': { path: 'component/setting optimazation/general.html' },
        'setting optimazation/notifications': { path: 'component/setting optimazation/notifications.html' },
        'setting optimazation/security': { path: 'component/setting optimazation/security.html' },
        'data archiving/overview': { path: 'component/data archiving/overview.html' },
        'data archiving/documents': { path: 'component/data archiving/documents.html' },
        'data archiving/media': { path: 'component/data archiving/media.html' },
        'data archiving/financial': { path: 'component/data archiving/financial.html' },
    };

    // Data untuk item pencarian (mencakup semua halaman)
    const searchItems = [
        { id: 'dashboard-overview', title: 'Ikhtisar Dashboard', category: 'Dashboard', lastUpdated: 'Sekarang' },
        { id: 'yard management/overview', title: 'Manajemen Halaman Overview', category: 'Yard Management', lastUpdated: 'Baru saja diperbarui' },
        { id: 'yard management/vehicles', title: 'Kendaraan Halaman', category: 'Yard Management', lastUpdated: 'Baru saja diperbarui' },
        { id: 'yard management/equipment', title: 'Peralatan Halaman', category: 'Yard Management', lastUpdated: 'Baru saja diperbarui' },
        { id: 'yard management/personel', title: 'Personel Halaman', category: 'Yard Management', lastUpdated: 'Baru saja diperbarui' },
        { id: 'receiving/overview', title: 'Manajemen Penerimaan Overview', category: 'Receiving', lastUpdated: 'Hari ini' },
        { id: 'receiving/deliveries', title: 'Penerimaan - Pengiriman', category: 'Receiving', lastUpdated: 'Hari ini' },
        { id: 'receiving/returns', title: 'Penerimaan - Pengembalian', category: 'Receiving', lastUpdated: 'Minggu lalu' },
        { id: 'receiving/vendors', title: 'Penerimaan - Vendor', category: 'Receiving', lastUpdated: 'Bulanan' },
        { id: 'order planning/overview', title: 'Perencanaan Pesanan Overview', category: 'Order Planning', lastUpdated: 'Hari ini' },
        { id: 'order planning/new-order', title: 'Perencanaan Pesanan - Pesanan Baru', category: 'Order Planning', lastUpdated: 'Hari ini' },
        { id: 'order planning/pending-order', title: 'Perencanaan Pesanan - Pesanan Tertunda', category: 'Order Planning', lastUpdated: 'Berlangsung' },
        { id: 'order planning/order-history', title: 'Perencanaan Pesanan - Riwayat Pesanan', category: 'Order Planning', lastUpdated: 'Sepanjang waktu' },
        { id: 'work/overview', title: 'Manajemen Pekerjaan Overview', category: 'Work', lastUpdated: 'Aktif' },
        { id: 'work/tasks', title: 'Pekerjaan - Tugas', category: 'Work', lastUpdated: 'Aktif' },
        { id: 'work/schedule', title: 'Pekerjaan - Jadwal', category: 'Work', lastUpdated: 'Harian' },
        { id: 'work/teams', title: 'Pekerjaan - Tim', category: 'Work', lastUpdated: 'Aktif' },
        { id: 'cross application/overview', title: 'Manajemen Lintas Aplikasi Overview', category: 'Cross Application', lastUpdated: 'Aktif' },
        { id: 'cross application/integrations', title: 'Lintas Aplikasi - Integrasi', category: 'Cross Application', lastUpdated: 'Aktif' },
        { id: 'cross application/data-sync', title: 'Lintas Aplikasi - Sinkronisasi Data', category: 'Cross Application', lastUpdated: 'Terbaru' },
        { id: 'cross application/api-management', title: 'Lintas Aplikasi - Manajemen API', category: 'Cross Application', lastUpdated: 'Aktif' },
        { id: 'inventory/overview', title: 'Ikhtisar Inventaris Overview', category: 'Inventaris', lastUpdated: 'Terbaru' },
        { id: 'inventory/yard', title: 'Inventaris - Halaman', category: 'Inventaris', lastUpdated: 'Terbaru' },
        { id: 'inventory/warehouse', title: 'Inventaris - Gudang', category: 'Inventaris', lastUpdated: 'Terbaru' },
        { id: 'inventory/storage', title: 'Inventaris - Penyimpanan', category: 'Inventaris', lastUpdated: 'Terbaru' },
        { id: 'performance management/overview', title: 'Manajemen Kinerja Overview', category: 'Performance Management', lastUpdated: 'Langsung' },
        { id: 'performance management/kpis', title: 'Kinerja - KPI', category: 'Performance Management', lastUpdated: 'Langsung' },
        { id: 'performance management/analytics', title: 'Kinerja - Analitik', category: 'Performance Management', lastUpdated: 'Harian' },
        { id: 'performance management/goals', title: 'Kinerja - Sasaran', category: 'Performance Management', lastUpdated: 'Triwulanan' },
        { id: 'system management/overview', title: 'Manajemen Sistem Overview', category: 'System Management', lastUpdated: 'Aktif' },
        { id: 'system management/users', title: 'Sistem - Pengguna', category: 'System Management', lastUpdated: 'Aktif' },
        { id: 'system management/logs', title: 'Sistem - Log', category: 'System Management', lastUpdated: 'Terbaru' },
        { id: 'system management/backup', title: 'Sistem - Cadangan', category: 'System Management', lastUpdated: 'Harian' },
        { id: 'setting optimazation/overview', title: 'Optimasi Pengaturan Overview', category: 'Setting Optimization', lastUpdated: 'Terbaru' },
        { id: 'setting optimazation/general', title: 'Pengaturan - Umum', category: 'Setting Optimization', lastUpdated: 'Kemarin' },
        { id: 'setting optimazation/notifications', title: 'Pengaturan - Notifikasi', category: 'Setting Optimization', lastUpdated: 'Kemarin' },
        { id: 'setting optimazation/security', title: 'Pengaturan - Keamanan', category: 'Setting Optimization', lastUpdated: 'Kemarin' },
        { id: 'data archiving/overview', title: 'Pengarsipan Data Overview', category: 'Data Archiving', lastUpdated: 'Lama' },
        { id: 'data archiving/documents', title: 'Pengarsipan Data - Dokumen', category: 'Data Archiving', lastUpdated: 'Lama' },
        { id: 'data archiving/media', category: 'Pengarsipan Data', lastUpdated: 'Lama' },
        { id: 'data archiving/financial', title: 'Pengarsipan Data - Keuangan', category: 'Data Archiving', lastUpdated: 'Lama' },
        // Item pencarian untuk konfigurasi
        { id: 'configuration', title: 'Konfigurasi Sistem Overview', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-warehouse', title: 'Konfigurasi - Gudang', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-zone', title: 'Konfigurasi - Zona', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-location-type', title: 'Konfigurasi - Tipe Lokasi', category: 'Configuration', lastUpdated: 'Terbaru' },
        // Contoh item generik untuk pencarian
        { id: 'article a', title: 'Artikel A', category: 'Umum', lastUpdated: '2 jam yang lalu' },
        { id: 'paragraph b', title: 'Paragraf B', category: 'Dokumentasi', lastUpdated: '1 jam yang lalu' },
        { id: 'method c', title: 'Metode C', category: 'Teknis', lastUpdated: '30 menit yang lalu' },
    ];

    let currentCategory = 'configuration'; // Kategori default untuk halaman konfigurasi
    let activeFilters = []; // Untuk menyimpan filter aktif
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []; // Muat riwayat dari localStorage

    // Mapping untuk membantu menemukan induk kategori anak
    const parentMapping = {
        'dashboard-overview': 'dashboard',
        'yard management/overview': 'yard-management', 'yard management/vehicles': 'yard-management', 'yard management/equipment': 'yard-management', 'yard management/personel': 'yard-management',
        'receiving/overview': 'receiving', 'receiving/deliveries': 'receiving', 'receiving/returns': 'receiving', 'receiving/vendors': 'receiving',
        'order planning/overview': 'order', 'order planning/new-order': 'order', 'order planning/pending-order': 'order', 'order planning/order-history': 'order',
        'work/overview': 'work', 'work/tasks': 'work', 'work/schedule': 'work', 'work/teams': 'work',
        'cross application/overview': 'cross-application', 'cross application/integrations': 'cross-application', 'cross application/data-sync': 'cross-application', 'cross application/api-management': 'cross-application',
        'inventory/overview': 'inventory', 'inventory/yard': 'inventory', 'inventory/warehouse': 'inventory', 'inventory/storage': 'inventory',
        'performance management/overview': 'performance', 'performance management/kpis': 'performance', 'performance management/analytics': 'performance', 'performance management/goals': 'performance',
        'configuration': 'configuration', // Ini untuk overview konfigurasi
        'configuration-warehouse': 'configuration',
        'configuration-zone': 'configuration',
        'configuration-location-type': 'configuration',
        'system management/overview': 'system', 'system management/users': 'system', 'system management/logs': 'system', 'system management/backup': 'system',
        'setting optimazation/overview': 'setting-optimazation', 'setting optimazation/general': 'setting-optimazation', 'setting optimazation/notifications': 'setting-optimazation', 'setting optimazation/security': 'setting-optimazation',
        'data archiving/overview': 'data-archiving', 'data archiving/documents': 'data-archiving', 'data archiving/media': 'data-archiving', 'data archiving/financial': 'data-archiving'
    };

    /**
     * Memuat konten HTML dari file terpisah ke dalam area konten utama.
     * @param {string} pagePath - Path ke file HTML komponen (misal: 'component/configuration/warehouse.html').
     * @param {string} categoryId - ID kategori yang terkait dengan komponen ini (misal: 'configuration-warehouse').
     */
    async function loadComponent(pagePath, categoryId) {
        const mainContentArea = document.getElementById('main-content');
        if (!mainContentArea) {
            console.error('Elemen #main-content tidak ditemukan di configuration.html.');
            return;
        }
        mainContentArea.innerHTML = `<p class="text-center p-12 text-gray-500">Memuat konten...</p>`; // Tampilan loading
        try {
            const response = await fetch(pagePath);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`File komponen tidak ditemukan: ${pagePath}. Pastikan file-nya ada dan namanya sudah benar.`);
                } else {
                    throw new Error(`Gagal memuat halaman: ${response.status} ${response.statusText}`);
                }
            }
            const html = await response.text();
            mainContentArea.innerHTML = html;

            // Setelah konten dimuat, panggil fungsi inisialisasi yang relevan
            if (categoryId === 'configuration-warehouse') {
                window.renderWarehouseList();
                window.initializeTabButtons('warehouse-form-modal');
                window.activateTab('warehouse-address', 'warehouse-form-modal');
                const sameAsCheckbox = document.getElementById('same-as-warehouse-address-return');
                if (sameAsCheckbox) {
                    sameAsCheckbox.onclick = window.toggleReturnAddressFields;
                }
            } else if (categoryId === 'configuration-zone') {
                window.renderZoneList();
                window.initializeTabButtons('zone-form-modal'); // Meskipun tidak ada tab, ini tetap menginisialisasi
            } else if (categoryId === 'configuration-location-type') {
                window.renderLocationTypeList();
                window.initializeTabButtons('location-type-form-modal');
                window.activateTab('general-location', 'location-type-form-modal');
            }
        } catch (error) {
            console.error('Gagal memuat komponen:', error);
            mainContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Error</h2><p class="text-gray-600">Gagal memuat konten untuk kategori ini. Silakan coba lagi.</p>`;
        }
    }

    /**
     * Mengaktifkan/menonaktifkan submenu untuk item sidebar.
     * @param {string} category - ID kategori utama sidebar.
     */
    function toggleChildren(category) {
        // Menggunakan querySelector dengan :has() untuk menemukan sidebar-group yang tepat
        // Perhatikan bahwa ini mungkin memerlukan polyfill atau browser yang lebih baru
        const sidebarGroup = document.querySelector(`.sidebar-group:has(button.sidebar-item span:contains("${category.replace(/-/g, ' ').split(' ')[0]}"))`);
        if (!sidebarGroup) return;

        const childrenDiv = sidebarGroup.querySelector('.submenu');
        const arrowIcon = sidebarGroup.querySelector('.submenu-arrow');
        
        if (childrenDiv && arrowIcon) {
            childrenDiv.classList.toggle('hidden');
            arrowIcon.classList.toggle('rotate-180');
        }
    }

    /**
     * Memilih kategori sidebar dan memperbarui tampilan konten.
     * @param {string} category - ID kategori yang dipilih (misal: 'configuration-warehouse').
     */
    window.selectCategory = function(category) {
        // Hapus style 'active' dari semua link sidebar sebelumnya
        document.querySelectorAll('.sidebar-item.active-sidebar-item, .sidebar-child.active').forEach(el => {
            el.classList.remove('active-sidebar-item', 'bg-gray-100', 'font-medium', 'text-gray-900', 'active');
            el.classList.add('text-gray-600'); // Kembalikan warna teks default
        });
        document.querySelectorAll('.sidebar-group button.sidebar-item').forEach(btn => {
            btn.classList.remove('active-sidebar-item', 'bg-gray-100');
        });

        // Tentukan apakah ini navigasi internal (di configuration.html) atau eksternal (ke dashboard.html)
        if (category.startsWith('dashboard') || category.includes('management') || category.includes('planning') || category.includes('work') || category.includes('application') || category.includes('inventory') || category.includes('performance') || category.includes('system') || category.includes('optimazation') || category.includes('archiving')) {
            // Ini adalah navigasi eksternal ke halaman dashboard.html
            window.location.href = `dashboard.html?page=${encodeURIComponent(category)}`;
            return; // Hentikan eksekusi lebih lanjut karena akan pindah halaman
        }

        // Untuk navigasi internal di configuration.html
        currentCategory = category;
        const content = contentData[category];
        
        if (content && content.path) {
            loadComponent(content.path, category); // Muat konten dari file
        } else if (content && content.full) {
            mainContent.innerHTML = content.full;
        } else if (content && content.detail) {
            mainContent.innerHTML = content.detail;
        } else {
            mainContent.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konten untuk ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}</h2><p class="text-gray-600">Belum ada konten spesifik untuk kategori ini.</p>`;
        }

        // Tambahin style 'active' ke link yang baru aja diklik
        const currentActiveLink = document.querySelector(`[data-page="${category}"]`);
        if (currentActiveLink) {
            currentActiveLink.classList.add('active'); // Tambah kelas 'active' ke link child
            currentActiveLink.classList.remove('text-gray-500'); // Pastikan teksnya tidak abu-abu
            currentActiveLink.classList.add('font-medium', 'text-gray-900', 'bg-gray-100'); // Tambah gaya aktif
            
            // Aktifkan juga parent group-nya jika ada
            const parentGroup = currentActiveLink.closest('.sidebar-group');
            if (parentGroup) {
                const parentButton = parentGroup.querySelector('button.sidebar-item');
                if (parentButton) {
                    parentButton.classList.add('active-sidebar-item', 'bg-gray-100'); // Tambah gaya aktif ke parent button
                }
                // Pastikan submenu terbuka
                const submenu = parentGroup.querySelector('.submenu');
                const arrow = parentGroup.querySelector('.submenu-arrow');
                if (submenu && submenu.classList.contains('hidden')) {
                    submenu.classList.remove('hidden');
                    if (arrow) arrow.classList.add('rotate-180');
                }
            } else { // Jika ini adalah item sidebar utama (seperti Dashboard)
                const mainSidebarItem = document.querySelector(`a[data-page="dashboard-overview"]`); // Cari link Dashboard itu sendiri
                if (mainSidebarItem) {
                    mainSidebarItem.classList.add('active-sidebar-item', 'bg-gray-100');
                }
            }
        }

        // Sembunyikan sidebar di seluler setelah pemilihan
        if (window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }
    };

    /**
     * Menangani input pencarian dari header utama.
     * Membuka overlay pencarian dan memicu pencarian di dalamnya.
     * @param {string} query - Query pencarian.
     */
    window.handleSearch = function(query) {
        if (query.length > 0) {
            if (searchOverlay) searchOverlay.classList.remove('hidden');
            if (overlaySearchInput) overlaySearchInput.value = query; // Sinkronkan kueri ke input pencarian overlay
            window.performSearch(query, 'overlay'); // Picu pencarian di overlay
            if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden'); // Sembunyikan riwayat saat mengetik
        } else {
            // Jika query kosong, sembunyikan overlay dan tampilkan riwayat pencarian
            if (searchOverlay) searchOverlay.classList.add('hidden');
            window.showSearchHistory(); // Tampilkan riwayat pencarian
        }
    };

    /**
     * Melakukan pencarian berdasarkan query dan menampilkan hasilnya.
     * Digunakan oleh search bar utama dan overlay.
     * @param {string} query - Query pencarian.
     * @param {string} source - 'main' untuk search bar header, 'overlay' untuk search bar overlay.
     */
    window.performSearch = function(query, source) {
        const resultsPanel = source === 'overlay' ? overlaySearchResultsListPanel : null; // Hanya overlay yang punya results panel terpisah
        const detailPanel = source === 'overlay' ? overlayDetailContentPanel : null; // Hanya overlay yang punya detail panel terpisah
        const currentFiltersContainer = overlaySearchFilters; // Filter hanya ada di overlay

        // Sembunyikan filter sebelumnya terlebih dahulu
        if (overlayFilterArticles) overlayFilterArticles.classList.add('hidden');
        if (overlayFilterPhotography) overlayFilterPhotography.classList.add('hidden');

        if (query.length > 0) {
            if (currentFiltersContainer) currentFiltersContainer.classList.remove('hidden');
            
            let filteredResults = searchItems.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            );

            // Terapkan filter aktif jika ada
            if (activeFilters.length > 0) {
                filteredResults = filteredResults.filter(item => 
                    activeFilters.some(filter => item.category.toLowerCase().includes(filter.toLowerCase()))
                );
            }

            if (resultsPanel) resultsPanel.innerHTML = ''; 

            if (filteredResults.length > 0) {
                // Tampilkan filter berdasarkan kategori yang relevan dalam hasil
                if (filteredResults.some(item => item.category.toLowerCase().includes('artikel') || item.title.toLowerCase().includes('artikel'))) {
                    if (overlayFilterArticles) overlayFilterArticles.classList.remove('hidden');
                }
                if (filteredResults.some(item => item.category.toLowerCase().includes('fotografi') || item.title.toLowerCase().includes('foto'))) {
                    if (overlayFilterPhotography) overlayFilterPhotography.classList.remove('hidden');
                }
                
                filteredResults.forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('py-2', 'px-3', 'bg-white', 'rounded-lg', 'shadow-sm', 'cursor-pointer', 'hover:bg-gray-100', 'mb-2', 'text-gray-900'); // Warna teks dan background cerah
                    resultItem.innerHTML = `
                        <h4 class="font-medium text-gray-900 text-sm">${item.title}</h4>
                        <p class="text-gray-600 text-xs">Kategori: ${item.category} | Terakhir Diperbarui: ${item.lastUpdated}</p>
                    `;
                    resultItem.onmouseenter = () => window.showPreview(item.id); 
                    resultItem.onclick = () => window.selectSearchResult(item.id, item.title, query);
                    if (resultsPanel) resultsPanel.appendChild(resultItem);
                });
            } else {
                if (resultsPanel) resultsPanel.innerHTML = `<p class="p-3 text-gray-500 text-sm">Tidak ada hasil ditemukan.</p>`;
                if (currentFiltersContainer) currentFiltersContainer.classList.add('hidden');
            }
            if (detailPanel) {
                detailPanel.innerHTML = `<p class="text-gray-500 text-center">Arahkan kursor ke item di sebelah kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
            }
        } else {
            if (resultsPanel) resultsPanel.innerHTML = '';
            if (detailPanel) {
                detailPanel.innerHTML = `<p class="text-gray-500 text-center">Arahkan kursor ke item di sebelah kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
            }
            if (currentFiltersContainer) currentFiltersContainer.classList.add('hidden');
        }
    };

    /**
     * Menampilkan pratinjau di panel detail overlay.
     * @param {string} id - ID item konten.
     */
    window.showPreview = function(id) {
        const content = contentData[id];

        if (!overlayDetailContentPanel) return;

        if (content && (content.detail || content.full)) {
            overlayDetailContentPanel.innerHTML = `
                ${content.detail || content.full}
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="window.displayContentInMainDashboard('${id}')">
                    Tampilkan Halaman
                </button>
            `;
        } else if (content && content.path) { // Jika ada path, tampilkan pesan pratinjau umum
            // Cari item di searchItems untuk mendapatkan judul yang lebih baik
            const itemInfo = searchItems.find(item => item.id === id);
            overlayDetailContentPanel.innerHTML = `
                <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Pratinjau untuk ${itemInfo ? itemInfo.title : id}</h2>
                <p class="text-gray-600">Konten ini akan dimuat dari file terpisah: ${content.path}.</p>
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="window.displayContentInMainDashboard('${id}')">
                    Tampilkan Halaman
                </button>
            `;
        } else {
            overlayDetailContentPanel.innerHTML = `<p class="text-gray-500 text-center">Tidak ada pratinjau tersedia untuk item ini.</p>`;
        }
    };

    /**
     * Memilih hasil pencarian dari overlay (saat diklik).
     * @param {string} id - ID item yang dipilih.
     * @param {string} title - Judul item yang dipilih.
     * @param {string} query - Query pencarian yang menghasilkan item ini.
     */
    window.selectSearchResult = function(id, title, query) {
        window.addSearchHistory(query); // Tambahkan query ke riwayat pencarian
        window.displayContentInMainDashboard(id); // Tampilkan konten lengkapnya di dashboard utama
    };

    /**
     * Menampilkan konten di area dashboard utama dan menutup overlay.
     * @param {string} id - ID konten yang akan ditampilkan.
     */
    window.displayContentInMainDashboard = function(id) {
        const content = contentData[id];
        if (!mainContent) return;
        
        // Jika konten adalah bagian dari konfigurasi, muat secara internal
        if (id.startsWith('configuration')) {
            if (content && content.path) {
                loadComponent(content.path, id);
            } else if (content && content.full) {
                mainContent.innerHTML = content.full;
            } else if (content && content.detail) {
                mainContent.innerHTML = content.detail;
            }
        }
        // Jika konten adalah bagian dari dashboard utama, pindah halaman
        else {
            window.location.href = `dashboard.html?page=${encodeURIComponent(id)}`;
            return; // Hentikan eksekusi karena akan pindah halaman
        }
        
        window.closeSearchOverlay(); // Tutup overlay pencarian
        window.selectCategory(id); // Panggil selectCategory untuk memperbarui status aktif sidebar
    };

    /**
     * Menambahkan filter ke daftar filter aktif dan memicu pencarian ulang.
     * @param {string} filterName - Nama filter yang akan ditambahkan.
     */
    window.addOverlayFilter = function(filterName) {
        if (!activeFilters.includes(filterName.toLowerCase())) {
            activeFilters.push(filterName.toLowerCase());
            const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
            if (filterElement) filterElement.classList.remove('hidden');
            if (overlaySearchInput) window.performSearch(overlaySearchInput.value, 'overlay');
        }
    };

    /**
     * Menghapus filter dari daftar filter aktif dan memicu pencarian ulang.
     * @param {string} filterName - Nama filter yang akan dihapus.
     */
    window.removeOverlayFilter = function(filterName) {
        activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
        const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
        if (filterElement) filterElement.classList.add('hidden');
        if (overlaySearchInput) window.performSearch(overlaySearchInput.value, 'overlay');
    };

    /**
     * Menghapus semua filter aktif dan memicu pencarian ulang.
     */
    window.removeAllOverlayFilters = function() {
        activeFilters = [];
        if (overlayFilterArticles) overlayFilterArticles.classList.add('hidden');
        if (overlayFilterPhotography) overlayFilterPhotography.classList.add('hidden');
        if (overlaySearchInput) overlaySearchInput.value = '';
        window.performSearch('', 'overlay'); // Hapus hasil pencarian
    };

    /**
     * Menutup overlay pencarian.
     */
    window.closeSearchOverlay = function() {
        if (searchOverlay) searchOverlay.classList.add('hidden');
        if (searchInput) searchInput.value = ''; // Hapus input pencarian utama
        if (overlaySearchInput) overlaySearchInput.value = ''; // Hapus input pencarian overlay
        activeFilters = []; // Hapus filter aktif
        if (overlaySearchFilters) overlaySearchFilters.classList.add('hidden'); // Sembunyikan filter di overlay
        if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden'); // Sembunyikan riwayat
        window.selectCategory(currentCategory); // Kembali ke konten kategori saat ini
    };

    /**
     * Mengaktifkan/menonaktifkan dropdown profil pengguna.
     */
    window.toggleUserDropdown = function() {
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    };

    // Tutup dropdown pengguna, riwayat pencarian, dan overlay jika diklik di luar
    document.addEventListener('click', (e) => {
        // Tutup dropdown user
        if (userDropdown && !userDropdown.classList.contains('hidden') && userMenuButton && !userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }

        // Periksa apakah klik terjadi di dalam container search input utama atau overlay/history dropdown
        const isClickInsideSearchArea = (searchInput && searchInput.closest('.flex.items-center.bg-white')) &&
                                        (searchInput.closest('.flex.items-center.bg-white').contains(e.target) ||
                                        (searchOverlay && searchOverlay.contains(e.target)) ||
                                        (searchHistoryDropdown && searchHistoryDropdown.contains(e.target)));

        if (!isClickInsideSearchArea) {
            // Jika klik di luar semua area search, tutup semuanya
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) {
                window.closeSearchOverlay();
            }
            if (searchHistoryDropdown && !searchHistoryDropdown.classList.contains('hidden')) {
                searchHistoryDropdown.classList.add('hidden');
            }
            // Reset search input jika ditutup dan input tidak kosong
            if (searchInput && searchInput.value !== '') {
                searchInput.value = '';
                // Tidak perlu selectCategory di sini, karena sudah di handleSearch atau displayContentInMainDashboard
            }
        }
    });

    /**
     * Menangani logout.
     */
    window.handleLogout = function() {
        console.log('Kamu sudah berhasil log out.');
        window.location.href = 'login.html';
    };

    /**
     * Menambahkan query ke riwayat pencarian.
     * @param {string} query - Query pencarian yang akan ditambahkan.
     */
    window.addSearchHistory = function(query) {
        if (query && !searchHistory.includes(query)) {
            searchHistory.unshift(query); // Tambahkan ke awal array
            searchHistory = searchHistory.slice(0, 5); // Batasi hingga 5 item terakhir
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    };

    /**
     * Menampilkan riwayat pencarian di dropdown.
     */
    window.showSearchHistory = function() {
        if (!searchHistoryDropdown || !document.getElementById('search-history-content')) return;

        const historyContent = document.getElementById('search-history-content');
        historyContent.innerHTML = ''; // Bersihkan konten sebelumnya

        if (searchHistory.length > 0) {
            searchHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('flex', 'items-center', 'justify-between', 'px-3', 'py-2', 'cursor-pointer', 'hover:bg-gray-100', 'rounded-md');
                historyItem.innerHTML = `
                    <span class="text-gray-700 text-sm" onclick="window.applySearchHistory('${item}')">${item}</span>
                    <button class="text-gray-500 hover:text-gray-700 text-xs ml-2" onclick="window.removeSearchHistory(${index})">&times;</button>
                `;
                historyContent.appendChild(historyItem);
            });
            const clearAllButton = document.createElement('div');
            clearAllButton.classList.add('text-right', 'pt-2', 'pb-1', 'px-3');
            clearAllButton.innerHTML = `<button class="text-gray-500 hover:underline text-xs" onclick="window.clearAllSearchHistory()">Hapus Semua Riwayat</button>`;
            historyContent.appendChild(clearAllButton);

            searchHistoryDropdown.classList.remove('hidden');
        } else {
            historyContent.innerHTML = `<p class="p-3 text-gray-500 text-sm">Tidak ada riwayat pencarian.</p>`;
            searchHistoryDropdown.classList.remove('hidden');
        }
    };

    /**
     * Menerapkan item riwayat pencarian ke input pencarian dan memicu pencarian.
     * @param {string} query - Query dari riwayat yang akan diterapkan.
     */
    window.applySearchHistory = function(query) {
        if (searchInput) {
            searchInput.value = query;
            window.handleSearch(query); // Memanggil handleSearch untuk memicu overlay
        }
        if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden');
    };

    /**
     * Menghapus item individual dari riwayat pencarian.
     * @param {number} index - Indeks item yang akan dihapus.
     */
    window.removeSearchHistory = function(index) {
        searchHistory.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        window.showSearchHistory(); // Perbarui tampilan riwayat
    };

    /**
     * Menghapus semua riwayat pencarian.
     */
    window.clearAllSearchHistory = function() {
        searchHistory = [];
        localStorage.removeItem('searchHistory');
        window.showSearchHistory(); // Perbarui tampilan riwayat
    };

    // --- CRUD Data (Simulasi Sisi Klien) ---
    // Data ini akan disimpan di localStorage, bukan di server.
    let warehouses = JSON.parse(localStorage.getItem('warehouses')) || [
        { id: 'DCB', description: 'DC BUAH BATU', active: true, address1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL', address2: '', address3: '', city: 'Bandung', state: 'Jawa Barat', postalCode: '40266', country: 'Indonesia', faxNumber: '(022)-88884377', attentionTo: '', phoneNumber: '(022)-7540576 / 77', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: 'DC BUAH BATU', returnAddress1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL, BANDUNG.', returnAddress2: '', returnAddress3: '', returnCity: 'Bandung', returnState: 'Jawa Barat', returnPostalCode: '40266', returnCountry: 'Indonesia', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '\\\\scale\\fs\\vls\\Report\\DCB', userDefinedField1: 'PT. AKUR PRATAMA', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '8.00000', userDefinedField8: '0.00000', users: ['Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284', 'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301', 'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115', 'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'] },
        { id: 'DCC', description: 'DC CIKONENG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCE', description: 'DC EXTENTION', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCF', description: 'DC BUAH BATU FRESH', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCJ', description: 'DC JAKARTA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCK', description: 'DC KAYU MANIS', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCL', description: 'DC LEUWIPANJANG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCM', description: 'DC MOCHAMAD TOHA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCP', description: 'DC PELABUHAN RATU', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCS', description: 'DC SUMBER', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCT', description: 'DC TEGAL', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCY', description: 'DC YOMIMART', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'GBG', description: 'DC GEDE BAGE', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
    ];
    
    let zones = JSON.parse(localStorage.getItem('zones')) || [
        { id: 'Allocation', identifier: 'Allocation', recordType: 'ZONETYPE', description: 'Allocation', systemValue1: 'Yes', systemCreated: true, active: true },
        { id: 'Locating', identifier: 'Locating', recordType: 'ZONETYPE', description: 'Locating', systemValue1: 'Yes', systemCreated: true, active: true },
        { id: 'Work', identifier: 'Work', recordType: 'ZONETYPE', description: 'Work', systemValue1: 'Yes', systemCreated: true, active: true },
    ];

    let locationTypes = JSON.parse(localStorage.getItem('locationTypes')) || [
        { id: 'CFLOW RESV TYPE 1', locationType: 'CFLOW RESV TYPE 1', length: 120.00, width: 30.00, height: 120.00, dimensionUM: 'CM', maximumWeight: 1000.00, weightUM: 'KG', active: true, lastUpdated: '01-07-2019 9:46:38 AM User: suhartono' },
        { id: 'CARTON FLOW', locationType: 'CARTON FLOW', length: 180.00, width: 60.00, height: 80.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 100/120/80', locationType: 'CARTON FLOW 100/120/80', length: 100.00, width: 120.00, height: 80.00, dimensionUM: 'CM', maximumWeight: 500.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 140/73/40', locationType: 'CARTON FLOW 140/73/40', length: 140.00, width: 73.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 500.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 37/130/60', locationType: 'CARTON FLOW 37/130/60', length: 37.00, width: 130.00, height: 60.00, dimensionUM: 'CM', maximumWeight: 500.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 40/18/40', locationType: 'CARTON FLOW 40/18/40', length: 40.00, width: 18.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 40/37/40', locationType: 'CARTON FLOW 40/37/40', length: 40.00, width: 37.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 5 SLOT', locationType: 'CARTON FLOW 5 SLOT', length: 46.00, width: 120.00, height: 88.00, dimensionUM: 'CM', maximumWeight: 300.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 55/70/45', locationType: 'CARTON FLOW 55/70/45', length: 55.00, width: 70.00, height: 45.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 7 SLOT', locationType: 'CARTON FLOW 7 SLOT', length: 32.00, width: 120.00, height: 94.00, dimensionUM: 'CM', maximumWeight: 300.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 70/28/40', locationType: 'CARTON FLOW 70/28/40', length: 70.00, width: 28.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 70/50/40', locationType: 'CARTON FLOW 70/50/40', length: 70.00, width: 50.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CARTON FLOW 80/40/55', locationType: 'CARTON FLOW 80/40/55', length: 80.00, width: 40.00, height: 55.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW.TYPE A', locationType: 'CFLOW.TYPE A', length: 82.00, width: 30.00, height: 93.00, dimensionUM: 'CM', maximumWeight: 70.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW.TYPE B', locationType: 'CFLOW.TYPE B', length: 42.00, width: 38.00, height: 50.00, dimensionUM: 'CM', maximumWeight: 70.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESERVE 115cm', locationType: 'CFLOW RESERVE 115cm', length: 239.00, width: 122.00, height: 115.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESERVE 55cm', locationType: 'CFLOW RESERVE 55cm', length: 239.00, width: 122.00, height: 55.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESERVE 70cm', locationType: 'CFLOW RESERVE 70cm', length: 239.00, width: 122.00, height: 70.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESERVE 90cm', locationType: 'CFLOW RESERVE 90cm', length: 239.00, width: 122.00, height: 90.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESV TYPE A', locationType: 'CFLOW RESV TYPE A', length: 40.00, width: 80.00, height: 80.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESV TYPE B', locationType: 'CFLOW RESV TYPE B', length: 40.00, width: 80.00, height: 80.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CFLOW RESV TYPE C', locationType: 'CFLOW RESV TYPE C', length: 37.00, width: 40.00, height: 40.00, dimensionUM: 'CM', maximumWeight: 200.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER FACE', locationType: 'CONTAINER FACE', length: 62.00, width: 42.00, height: 26.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER PINK 2002', locationType: 'CONTAINER PINK 2002', length: 63.00, width: 43.00, height: 25.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER PINK 2004', locationType: 'CONTAINER PINK 2004', length: 63.00, width: 43.00, height: 25.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER PINK 2006', locationType: 'CONTAINER PINK 2006', length: 63.00, width: 43.00, height: 25.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER PINK 2010', locationType: 'CONTAINER PINK 2010', length: 63.00, width: 43.00, height: 25.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'CONTAINER PINK 2055', locationType: 'CONTAINER PINK 2055', length: 62.00, width: 42.00, height: 26.00, dimensionUM: 'CM', maximumWeight: 150.00, weightUM: 'KG', active: true, lastUpdated: '' },
        { id: 'DCB LOADING LANE', locationType: 'DCB LOADING LANE', length: 0.00, width: 0.00, height: 0.00, dimensionUM: 'CM', maximumWeight: 0.00, weightUM: 'KG', active: true, lastUpdated: '' },
    ];

    // Dummy user data for Authorized Users in Warehouse
    const allUsers = [
        'Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284',
        'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301',
        'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115',
        'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'
    ];

    let currentWarehouseId = null; // Untuk melacak gudang yang sedang diedit
    let currentZoneId = null; // Untuk melacak zona yang sedang diedit
    let currentLocationTypeId = null; // Untuk melacak tipe lokasi yang sedang diedit

    /**
     * Fungsi utilitas untuk menghasilkan ID unik.
     * @param {string} prefix - Prefix untuk ID.
     * @returns {string} ID unik.
     */
    function generateUniqueId(prefix) {
        return prefix + Date.now();
    }

    /**
     * Menyimpan data gudang ke localStorage.
     */
    function saveWarehouses() {
        localStorage.setItem('warehouses', JSON.stringify(warehouses));
    }

    /**
     * Menyimpan data zona ke localStorage.
     */
    function saveZones() {
        localStorage.setItem('zones', JSON.stringify(zones));
    }

    /**
     * Menyimpan data tipe lokasi ke localStorage.
     */
    function saveLocationTypes() {
        localStorage.setItem('locationTypes', JSON.stringify(locationTypes));
    }

    // --- Warehouse CRUD Functions ---
    /**
     * Merender daftar gudang ke dalam tabel.
     * @param {string} filterQuery - Query untuk memfilter daftar gudang.
     */
    window.renderWarehouseList = function(filterQuery = '') {
        const container = document.getElementById('warehouse-list-container');
        if (!container) return;
        container.innerHTML = '';

        const filteredWarehouses = warehouses.filter(wh =>
            wh.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
            wh.description.toLowerCase().includes(filterQuery.toLowerCase())
        );

        if (filteredWarehouses.length === 0) {
            container.innerHTML = `<p class="text-gray-600 mt-4">Tidak ada gudang ditemukan.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.classList.add('min-w-full', 'divide-y', 'divide-gray-200', 'mt-4', 'shadow-md', 'rounded-lg', 'overflow-hidden');
        table.innerHTML = `
            <thead class="bg-gray-100">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" id="warehouse-table-body">
            </tbody>
        `;
        container.appendChild(table);

        const tbody = document.getElementById('warehouse-table-body');
        if (!tbody) return;
        filteredWarehouses.forEach(wh => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${wh.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${wh.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${wh.active ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="window.showWarehouseForm('edit', '${wh.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="window.deleteWarehouse('${wh.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    /**
     * Menampilkan modal form gudang (untuk membuat atau mengedit).
     * @param {string} mode - 'create' atau 'edit'.
     * @param {string} id - ID gudang jika mode adalah 'edit'.
     */
    window.showWarehouseForm = function(mode, id = null) {
        const modal = document.getElementById('warehouse-form-modal');
        const title = document.getElementById('warehouse-form-title');
        const form = document.getElementById('warehouse-form');
        if (!modal || !title || !form) return;
        form.reset();

        // Reset tab styles dan aktifkan tab pertama
        const tabButtons = form.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-blue-500', 'text-blue-500'));
        const firstTabButton = tabButtons[0];
        if (firstTabButton) {
            firstTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
        const tabContents = form.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.add('hidden'));
        const warehouseAddressTab = document.getElementById('warehouse-address');
        if (warehouseAddressTab) warehouseAddressTab.classList.remove('hidden');

        const sameAsCheckbox = document.getElementById('same-as-warehouse-address-return');
        if (sameAsCheckbox) sameAsCheckbox.checked = false;
        window.toggleReturnAddressFields();

        currentWarehouseId = id;

        if (mode === 'create') {
            title.textContent = 'Buat Gudang Baru';
            const submitButton = document.getElementById('warehouse-submit-button');
            if (submitButton) submitButton.textContent = 'Buat';
            const warehouseNameInput = document.getElementById('warehouse-name');
            if (warehouseNameInput) warehouseNameInput.disabled = false;
            const warehouseInactiveCheckbox = document.getElementById('warehouse-inactive');
            if (warehouseInactiveCheckbox) warehouseInactiveCheckbox.checked = false;
            window.renderUserCheckboxes([]);
        } else {
            title.textContent = 'Edit Gudang';
            const submitButton = document.getElementById('warehouse-submit-button');
            if (submitButton) submitButton.textContent = 'Simpan Perubahan';
            const warehouseNameInput = document.getElementById('warehouse-name');
            if (warehouseNameInput) warehouseNameInput.disabled = true;

            const warehouseToEdit = warehouses.find(wh => wh.id === id);
            if (warehouseToEdit) {
                document.getElementById('warehouse-name').value = warehouseToEdit.id || '';
                document.getElementById('warehouse-description').value = warehouseToEdit.description || '';
                document.getElementById('warehouse-inactive').checked = !warehouseToEdit.active;

                document.getElementById('address1').value = warehouseToEdit.address1 || '';
                document.getElementById('address2').value = warehouseToEdit.address2 || '';
                document.getElementById('address3').value = warehouseToEdit.address3 || '';
                document.getElementById('city').value = warehouseToEdit.city || '';
                document.getElementById('state').value = warehouseToEdit.state || '';
                document.getElementById('postal-code').value = warehouseToEdit.postalCode || '';
                document.getElementById('country').value = warehouseToEdit.country || '';
                document.getElementById('fax-number').value = warehouseToEdit.faxNumber || '';
                document.getElementById('attention-to').value = warehouseToEdit.attentionTo || '';
                document.getElementById('phone-number').value = warehouseToEdit.phoneNumber || '';
                document.getElementById('email-address').value = warehouseToEdit.emailAddress || '';
                document.getElementById('ucc-ean-number').value = warehouseToEdit.uccEanNumber || '';

                if (sameAsCheckbox) sameAsCheckbox.checked = warehouseToEdit.returnAddressSame;
                window.toggleReturnAddressFields();
                document.getElementById('return-name').value = warehouseToEdit.returnName || '';
                document.getElementById('return-address1').value = warehouseToEdit.returnAddress1 || '';
                document.getElementById('return-address2').value = warehouseToEdit.returnAddress2 || '';
                document.getElementById('return-address3').value = warehouseToEdit.returnAddress3 || '';
                document.getElementById('return-city').value = warehouseToEdit.returnCity || '';
                document.getElementById('return-state').value = warehouseToEdit.returnState || '';
                document.getElementById('return-postal-code').value = warehouseToEdit.returnPostalCode || '';
                document.getElementById('return-country').value = warehouseToEdit.returnCountry || '';
                document.getElementById('return-fax-number').value = warehouseToEdit.returnFaxNumber || '';
                document.getElementById('return-attention-to').value = warehouseToEdit.returnAttentionTo || '';
                document.getElementById('return-phone-number').value = warehouseToEdit.phoneNumber || '';
                document.getElementById('return-email-address').value = warehouseToEdit.emailAddress || '';
                document.getElementById('return-ucc-ean-number').value = warehouseToEdit.returnUccEanNumber || '';

                document.getElementById('slotting-move-file-directory').value = warehouseToEdit.slottingMoveFileDirectory || '';
                document.getElementById('default-location-for-unslotted-items').value = warehouseToEdit.defaultLocationForUnslottedItems || '';
                document.getElementById('rendered-document-pdf-file-directory').value = warehouseToEdit.renderedDocumentPdfFileDirectory || '';

                document.getElementById('user-defined-field1').value = warehouseToEdit.userDefinedField1 || '';
                document.getElementById('user-defined-field2').value = warehouseToEdit.userDefinedField2 || '';
                document.getElementById('user-defined-field3').value = warehouseToEdit.userDefinedField3 || '';
                document.getElementById('user-defined-field4').value = warehouseToEdit.userDefinedField4 || '';
                document.getElementById('user-defined-field5').value = warehouseToEdit.userDefinedField5 || '';
                document.getElementById('user-defined-field6').value = warehouseToEdit.userDefinedField6 || '';
                document.getElementById('user-defined-field7').value = warehouseToEdit.userDefinedField7 || '';
                document.getElementById('user-defined-field8').value = warehouseToEdit.userDefinedField8 || '';

                window.renderUserCheckboxes(warehouseToEdit.users || []);
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    /**
     * Menutup modal form gudang.
     */
    window.closeWarehouseForm = function() {
        const modal = document.getElementById('warehouse-form-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        currentWarehouseId = null;
    };

    /**
     * Menangani submit form gudang (membuat atau mengupdate).
     * @param {Event} event - Objek event submit.
     */
    window.handleWarehouseSubmit = function(event) {
        event.preventDefault();
        const warehouseId = document.getElementById('warehouse-name').value;
        const description = document.getElementById('warehouse-description').value;
        const inactive = document.getElementById('warehouse-inactive').checked;
        const active = !inactive;

        const address1 = document.getElementById('address1').value;
        const address2 = document.getElementById('address2').value;
        const address3 = document.getElementById('address3').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const postalCode = document.getElementById('postal-code').value;
        const country = document.getElementById('country').value;
        const faxNumber = document.getElementById('fax-number').value;
        const attentionTo = document.getElementById('attention-to').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const emailAddress = document.getElementById('email-address').value;
        const uccEanNumber = document.getElementById('ucc-ean-number').value;

        const returnAddressSame = document.getElementById('same-as-warehouse-address-return').checked;
        const returnName = document.getElementById('return-name').value;
        const returnAddress1 = document.getElementById('return-address1').value;
        const returnAddress2 = document.getElementById('return-address2').value;
        const returnAddress3 = document.getElementById('return-address3').value;
        const returnCity = document.getElementById('return-city').value;
        const returnState = document.getElementById('return-state').value;
        const returnPostalCode = document.getElementById('return-postal-code').value;
        const returnCountry = document.getElementById('return-country').value;
        const returnFaxNumber = document.getElementById('return-fax-number').value;
        const returnAttentionTo = document.getElementById('return-attention-to').value;
        const returnPhoneNumber = document.getElementById('return-phone-number').value;
        const returnEmailAddress = document.getElementById('return-email-address').value;
        const returnUccEanNumber = document.getElementById('return-ucc-ean-number').value;

        const slottingMoveFileDirectory = document.getElementById('slotting-move-file-directory').value;
        const defaultLocationForUnslottedItems = document.getElementById('default-location-for-unslotted-items').value;
        const renderedDocumentPdfFileDirectory = document.getElementById('rendered-document-pdf-file-directory').value;

        const userDefinedField1 = document.getElementById('user-defined-field1').value;
        const userDefinedField2 = document.getElementById('user-defined-field2').value;
        const userDefinedField3 = document.getElementById('user-defined-field3').value;
        const userDefinedField4 = document.getElementById('user-defined-field4').value;
        const userDefinedField5 = document.getElementById('user-defined-field5').value;
        const userDefinedField6 = document.getElementById('user-defined-field6').value;
        const userDefinedField7 = document.getElementById('user-defined-field7').value;
        const userDefinedField8 = document.getElementById('user-defined-field8').value;

        const selectedUsers = Array.from(document.querySelectorAll('#user-checkbox-list input[type="checkbox"]:checked'))
                                     .map(checkbox => checkbox.value);

        const newWarehouse = {
            id: warehouseId,
            description,
            active,
            address1, address2, address3, city, state, postalCode, country, faxNumber, attentionTo, phoneNumber, emailAddress, uccEanNumber,
            returnAddressSame, returnName, returnAddress1, returnAddress2, returnAddress3, returnCity, returnState, returnPostalCode, returnCountry, returnFaxNumber, returnAttentionTo, returnPhoneNumber, returnEmailAddress, returnUccEanNumber,
            slottingMoveFileDirectory, defaultLocationForUnslottedItems, renderedDocumentPdfFileDirectory,
            userDefinedField1, userDefinedField2, userDefinedField3, userDefinedField4, userDefinedField5, userDefinedField6, userDefinedField7, userDefinedField8,
            users: selectedUsers,
        };

        if (currentWarehouseId) {
            const index = warehouses.findIndex(wh => wh.id === currentWarehouseId);
            if (index !== -1) {
                warehouses[index] = { ...warehouses[index], ...newWarehouse };
            }
        } else {
            if (warehouses.some(wh => wh.id === warehouseId)) {
                console.error('ID Gudang sudah ada!');
                return;
            }
            warehouses.push(newWarehouse);
        }
        saveWarehouses();
        window.renderWarehouseList();
        window.closeWarehouseForm();
    };

    /**
     * Menghapus gudang berdasarkan ID.
     * @param {string} id - ID gudang yang akan dihapus.
     */
    window.deleteWarehouse = function(id) {
        const isConfirmed = window.confirm(`Apakah kamu yakin ingin menghapus gudang ${id}?`);
        if (isConfirmed) {
            warehouses = warehouses.filter(wh => wh.id !== id);
            saveWarehouses();
            window.renderWarehouseList();
        }
    };

    /**
     * Memfilter daftar gudang berdasarkan query.
     * @param {string} query - Query filter.
     */
    window.filterWarehouseList = function(query) {
        window.renderWarehouseList(query);
    };

    /**
     * Mengaktifkan/menonaktifkan field alamat pengembalian berdasarkan checkbox "Same as warehouse address".
     */
    window.toggleReturnAddressFields = function() {
        const sameAsCheckbox = document.getElementById('same-as-warehouse-address-return');
        const returnAddressFields = document.getElementById('return-address-fields');
        if (!sameAsCheckbox || !returnAddressFields) return;

        const fields = returnAddressFields.querySelectorAll('input, select');

        if (sameAsCheckbox.checked) {
            returnAddressFields.classList.add('hidden');
            fields.forEach(field => field.disabled = true);
        } else {
            returnAddressFields.classList.remove('hidden');
            fields.forEach(field => field.disabled = false);
        }
    };

    /**
     * Merender checkbox untuk daftar pengguna.
     * @param {Array<string>} selectedUsers - Daftar pengguna yang sudah terpilih.
     */
    window.renderUserCheckboxes = function(selectedUsers) {
        const userListContainer = document.getElementById('user-checkbox-list');
        if (!userListContainer) return;
        userListContainer.innerHTML = '';

        allUsers.forEach(user => {
            const isChecked = selectedUsers.includes(user);
            const div = document.createElement('div');
            div.classList.add('flex', 'items-center');
            div.innerHTML = `
                <input type="checkbox" id="user-${user}" value="${user}" class="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500" ${isChecked ? 'checked' : ''}>
                <label for="user-${user}" class="ml-2 text-sm text-gray-900">${user}</label>
            `;
            userListContainer.appendChild(div);
        });
        const checkAllCheckbox = document.getElementById('check-all-users');
        if (checkAllCheckbox) {
            checkAllCheckbox.checked = (selectedUsers.length === allUsers.length && allUsers.length > 0);
        }
    };

    /**
     * Mengaktifkan/menonaktifkan semua checkbox pengguna.
     */
    window.toggleAllUsers = function() {
        const checkAllCheckbox = document.getElementById('check-all-users');
        const userCheckboxes = document.querySelectorAll('#user-checkbox-list input[type="checkbox"]');
        if (checkAllCheckbox) {
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = checkAllCheckbox.checked;
            });
        }
    };

    // --- Zone CRUD Functions ---
    /**
     * Merender daftar zona ke dalam tabel.
     * @param {string} filterQuery - Query untuk memfilter daftar zona.
     */
    window.renderZoneList = function(filterQuery = '') {
        const container = document.getElementById('zone-list-container');
        if (!container) return;
        container.innerHTML = '';

        const filteredZones = zones.filter(zone =>
            zone.identifier.toLowerCase().includes(filterQuery.toLowerCase()) ||
            zone.description.toLowerCase().includes(filterQuery.toLowerCase())
        );

        if (filteredZones.length === 0) {
            container.innerHTML = `<p class="text-gray-600 mt-4">Tidak ada zona ditemukan.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.classList.add('min-w-full', 'divide-y', 'divide-gray-200', 'mt-4', 'shadow-md', 'rounded-lg', 'overflow-hidden');
        table.innerHTML = `
            <thead class="bg-gray-100">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System created</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" id="zone-table-body">
            </tbody>
        `;
        container.appendChild(table);

        const tbody = document.getElementById('zone-table-body');
        if (!tbody) return;
        filteredZones.forEach(zone => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${zone.identifier}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.systemCreated ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.active ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="window.showZoneForm('edit', '${zone.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="window.deleteZone('${zone.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    /**
     * Menampilkan modal form zona (untuk membuat atau mengedit).
     * @param {string} mode - 'create' atau 'edit'.
     * @param {string} id - ID zona jika mode adalah 'edit'.
     */
    window.showZoneForm = function(mode, id = null) {
        const modal = document.getElementById('zone-form-modal');
        const title = document.getElementById('zone-form-title');
        const form = document.getElementById('zone-form');
        if (!modal || !title || !form) return;
        form.reset();
        currentZoneId = id;

        if (mode === 'create') {
            title.textContent = 'Buat Zona Baru';
            const submitButton = document.getElementById('zone-submit-button');
            if (submitButton) submitButton.textContent = 'Buat';
            const zoneIdentifierInput = document.getElementById('zone-identifier');
            if (zoneIdentifierInput) zoneIdentifierInput.disabled = false;
            const zoneInactiveCheckbox = document.getElementById('zone-inactive');
            if (zoneInactiveCheckbox) zoneInactiveCheckbox.checked = false;
            const zoneSystemCreatedCheckbox = document.getElementById('zone-system-created');
            if (zoneSystemCreatedCheckbox) zoneSystemCreatedCheckbox.checked = false;
        } else {
            title.textContent = 'Edit Zona';
            const submitButton = document.getElementById('zone-submit-button');
            if (submitButton) submitButton.textContent = 'Simpan Perubahan';
            const zoneIdentifierInput = document.getElementById('zone-identifier');
            if (zoneIdentifierInput) zoneIdentifierInput.disabled = true;

            const zoneToEdit = zones.find(z => z.id === id);
            if (zoneToEdit) {
                document.getElementById('zone-identifier').value = zoneToEdit.identifier || '';
                document.getElementById('zone-record-type').value = zoneToEdit.recordType || 'ZONETYPE';
                document.getElementById('zone-description').value = zoneToEdit.description || '';
                document.getElementById('zone-inactive').checked = !zoneToEdit.active;
                document.getElementById('zone-system-created').checked = zoneToEdit.systemCreated;
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    /**
     * Menutup modal form zona.
     */
    window.closeZoneForm = function() {
        const modal = document.getElementById('zone-form-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        currentZoneId = null;
    };

    /**
     * Menangani submit form zona (membuat atau mengupdate).
     * @param {Event} event - Objek event submit.
     */
    window.handleZoneSubmit = function(event) {
        event.preventDefault();
        const identifier = document.getElementById('zone-identifier').value;
        const recordType = document.getElementById('zone-record-type').value;
        const description = document.getElementById('zone-description').value;
        const inactive = document.getElementById('zone-inactive').checked;
        const active = !inactive;
        const systemCreated = document.getElementById('zone-system-created').checked;

        const newZone = {
            id: currentZoneId || identifier,
            identifier,
            recordType,
            description,
            systemValue1: systemCreated ? 'Yes' : 'No',
            systemCreated,
            active,
        };

        if (currentZoneId) {
            const index = zones.findIndex(z => z.id === currentZoneId);
            if (index !== -1) {
                zones[index] = { ...zones[index], ...newZone };
            }
        } else {
            if (zones.some(z => z.identifier === identifier)) {
                console.error('Zone Identifier sudah ada!');
                return;
            }
            newZone.id = identifier;
            zones.push(newZone);
        }
        saveZones();
        window.renderZoneList();
        window.closeZoneForm();
    };

    /**
     * Menghapus zona berdasarkan ID.
     * @param {string} id - ID zona yang akan dihapus.
     */
    window.deleteZone = function(id) {
        const isConfirmed = window.confirm(`Apakah kamu yakin ingin menghapus zona ${id}?`);
        if (isConfirmed) {
            zones = zones.filter(z => z.id !== id);
            saveZones();
            window.renderZoneList();
        }
    };

    /**
     * Memfilter daftar zona berdasarkan query.
     * @param {string} query - Query filter.
     */
    window.filterZoneList = function(query) {
        window.renderZoneList(query);
    };

    // --- Location Type CRUD Functions ---
    /**
     * Merender daftar tipe lokasi ke dalam tabel.
     * @param {string} filterQuery - Query untuk memfilter daftar tipe lokasi.
     */
    window.renderLocationTypeList = function(filterQuery = '') {
        const container = document.getElementById('location-type-list-container');
        if (!container) return;
        container.innerHTML = '';

        const filteredLocationTypes = locationTypes.filter(lt =>
            lt.locationType.toLowerCase().includes(filterQuery.toLowerCase())
        );

        if (filteredLocationTypes.length === 0) {
            container.innerHTML = `<p class="text-gray-600 mt-4">Tidak ada tipe lokasi ditemukan.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.classList.add('min-w-full', 'divide-y', 'divide-gray-200', 'mt-4', 'shadow-md', 'rounded-lg', 'overflow-hidden');
        table.innerHTML = `
            <thead class="bg-gray-100">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location type</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimension um</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maximum weight</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight um</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" id="location-type-table-body">
            </tbody>
        `;
        container.appendChild(table);

        const tbody = document.getElementById('location-type-table-body');
        if (!tbody) return;
        filteredLocationTypes.forEach(lt => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${lt.locationType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.length.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.width.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.height.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.dimensionUM}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.maximumWeight.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.weightUM}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${lt.active ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="window.showLocationTypeForm('edit', '${lt.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="window.deleteLocationType('${lt.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    /**
     * Menampilkan modal form tipe lokasi (untuk membuat atau mengedit).
     * @param {string} mode - 'create' atau 'edit'.
     * @param {string} id - ID tipe lokasi jika mode adalah 'edit'.
     */
    window.showLocationTypeForm = function(mode, id = null) {
        const modal = document.getElementById('location-type-form-modal');
        const title = document.getElementById('location-type-form-title');
        const form = document.getElementById('location-type-form');
        if (!modal || !title || !form) return;
        form.reset();
        
        // Reset tab styles dan aktifkan tab pertama
        const tabButtons = form.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-blue-500', 'text-blue-500'));
        const firstTabButton = tabButtons[0];
        if (firstTabButton) {
            firstTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
        const tabContents = form.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.add('hidden'));
        const generalLocationTab = document.getElementById('general-location');
        if (generalLocationTab) generalLocationTab.classList.remove('hidden');

        currentLocationTypeId = id;

        if (mode === 'create') {
            title.textContent = 'Buat Tipe Lokasi Baru';
            const submitButton = document.getElementById('location-type-submit-button');
            if (submitButton) submitButton.textContent = 'Buat';
            const locationTypeNameInput = document.getElementById('location-type-name');
            if (locationTypeNameInput) locationTypeNameInput.disabled = false;
            const locationTypeInactiveCheckbox = document.getElementById('location-type-inactive');
            if (locationTypeInactiveCheckbox) locationTypeInactiveCheckbox.checked = false;
        } else {
            title.textContent = 'Edit Tipe Lokasi';
            const submitButton = document.getElementById('location-type-submit-button');
            if (submitButton) submitButton.textContent = 'Simpan Perubahan';
            const locationTypeNameInput = document.getElementById('location-type-name');
            if (locationTypeNameInput) locationTypeNameInput.disabled = true;

            const locationTypeToEdit = locationTypes.find(lt => lt.id === id);
            if (locationTypeToEdit) {
                document.getElementById('location-type-name').value = locationTypeToEdit.locationType || '';
                document.getElementById('location-type-length').value = locationTypeToEdit.length || 0;
                document.getElementById('location-type-width').value = locationTypeToEdit.width || 0;
                document.getElementById('location-type-height').value = locationTypeToEdit.height || 0;
                document.getElementById('location-type-length-um').value = locationTypeToEdit.dimensionUM || 'CM';
                document.getElementById('location-type-maximum-weight').value = locationTypeToEdit.maximumWeight || 0;
                document.getElementById('location-type-weight-um').value = locationTypeToEdit.weightUM || 'KG';
                document.getElementById('location-type-inactive').checked = !locationTypeToEdit.active;
                document.getElementById('location-user-defined-field1').value = locationTypeToEdit.userDefinedField1 || '';
                document.getElementById('location-user-defined-field2').value = locationTypeToEdit.userDefinedField2 || '';
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    /**
     * Menutup modal form tipe lokasi.
     */
    window.closeLocationTypeForm = function() {
        const modal = document.getElementById('location-type-form-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        currentLocationTypeId = null;
    };

    /**
     * Menangani submit form tipe lokasi (membuat atau mengupdate).
     * @param {Event} event - Objek event submit.
     */
    window.handleLocationTypeSubmit = function(event) {
        event.preventDefault();
        const locationTypeName = document.getElementById('location-type-name').value;
        const length = parseFloat(document.getElementById('location-type-length').value) || 0;
        const width = parseFloat(document.getElementById('location-type-width').value) || 0;
        const height = parseFloat(document.getElementById('location-type-height').value) || 0;
        const dimensionUM = document.getElementById('location-type-length-um').value;
        const maximumWeight = parseFloat(document.getElementById('location-type-maximum-weight').value) || 0;
        const weightUM = document.getElementById('location-type-weight-um').value;
        const inactive = document.getElementById('location-type-inactive').checked;
        const active = !inactive;
        const userDefinedField1 = document.getElementById('location-user-defined-field1').value;
        const userDefinedField2 = document.getElementById('location-user-defined-field2').value;

        const newLocationType = {
            id: currentLocationTypeId || locationTypeName,
            locationType: locationTypeName,
            length,
            width,
            height,
            dimensionUM,
            maximumWeight,
            weightUM,
            active,
            lastUpdated: `Sekarang Pengguna: ${document.getElementById('username-display').textContent}`,
            userDefinedField1,
            userDefinedField2
        };

        if (currentLocationTypeId) {
            const index = locationTypes.findIndex(lt => lt.id === currentLocationTypeId);
            if (index !== -1) {
                locationTypes[index] = { ...locationTypes[index], ...newLocationType };
            }
        } else {
            if (locationTypes.some(lt => lt.locationType === locationTypeName)) {
                console.error('Nama Tipe Lokasi sudah ada!');
                return;
            }
            newLocationType.id = locationTypeName;
            locationTypes.push(newLocationType);
        }
        saveLocationTypes();
        window.renderLocationTypeList();
        window.closeLocationTypeForm();
    };

    /**
     * Menghapus tipe lokasi berdasarkan ID.
     * @param {string} id - ID tipe lokasi yang akan dihapus.
     */
    window.deleteLocationType = function(id) {
        const isConfirmed = window.confirm(`Apakah kamu yakin ingin menghapus tipe lokasi ${id}?`);
        if (isConfirmed) {
            locationTypes = locationTypes.filter(lt => lt.id !== id);
            saveLocationTypes();
            window.renderLocationTypeList();
        }
    };

    /**
     * Memfilter daftar tipe lokasi berdasarkan query.
     * @param {string} query - Query filter.
     */
    window.filterLocationTypeList = function(query) {
        window.renderLocationTypeList(query);
    };

    // --- Tab functionality for forms ---
    /**
     * Menginisialisasi tombol tab dalam modal.
     * @param {string} modalId - ID modal yang berisi tab.
     */
    window.initializeTabButtons = function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.onclick = () => {
                const tabId = button.dataset.tab;
                window.activateTab(tabId, modalId);
            };
        });
    };

    /**
     * Mengaktifkan tab tertentu dalam modal.
     * @param {string} tabId - ID konten tab yang akan diaktifkan.
     * @param {string} modalId - ID modal yang berisi tab.
     */
    window.activateTab = function(tabId, modalId = null) {
        const parentElement = modalId ? document.getElementById(modalId) : document;
        if (!parentElement) return;
        
        parentElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        parentElement.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active-tab', 'border-blue-500', 'text-blue-500');
        });

        const targetTabContent = document.getElementById(tabId);
        if (targetTabContent) {
            targetTabContent.classList.remove('hidden');
        }
        const activeTabButton = parentElement.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (activeTabButton) {
            activeTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
    };

    // Inisialisasi halaman saat dimuat
    function initializeApp() {
        // Event listener untuk klik di sidebar
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]');
            const externalLink = e.target.closest('a[href$=".html"]');
            const dropdownButton = e.target.closest('.sidebar-group > button');

            if (link && !externalLink) {
                e.preventDefault();
                const page = link.dataset.page;
                window.selectCategory(page);
            }
            
            if (externalLink) {
                // Biarkan browser menangani navigasi normal
            }

            if (dropdownButton) {
                const submenu = dropdownButton.nextElementSibling;
                if (submenu) {
                    submenu.classList.toggle('hidden');
                    const arrow = dropdownButton.querySelector('.submenu-arrow');
                    if (arrow) {
                        arrow.classList.toggle('rotate-180');
                    }
                }
            }
        });

        // Event listener untuk tombol menu user
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
        }

        // Event listener untuk tombol logout
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.handleLogout();
            });
        }

        // Event listener untuk klik pada search input utama
        if (searchInput) {
            searchInput.addEventListener('click', (e) => {
                e.stopPropagation();
                if (searchOverlay) searchOverlay.classList.remove('hidden');
                if (overlaySearchInput) {
                    overlaySearchInput.focus();
                    if (searchInput.value.length > 0) {
                        overlaySearchInput.value = searchInput.value;
                        window.performSearch(searchInput.value, 'overlay');
                    } else {
                        window.showSearchHistory();
                    }
                }
            });

            // Event listener untuk input di searchbar utama
            searchInput.addEventListener('input', (e) => {
                window.handleSearch(e.target.value);
            });
        }

        // Event listener untuk tombol "Cari" di header utama
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (searchInput.value.length > 0) {
                    if (searchOverlay) searchOverlay.classList.remove('hidden');
                    if (overlaySearchInput) overlaySearchInput.value = searchInput.value;
                    window.performSearch(searchInput.value, 'overlay');
                } else {
                    if (searchOverlay) searchOverlay.classList.remove('hidden');
                    window.showSearchHistory();
                }
            });
        }

        // Event listener untuk input di searchbar overlay
        if (overlaySearchInput) {
            overlaySearchInput.addEventListener('input', (e) => {
                window.performSearch(e.target.value, 'overlay');
            });
        }

        // Event listener untuk tombol "Cari" di overlay
        if (overlaySearchButton) {
            overlaySearchButton.addEventListener('click', () => {
                if (overlaySearchInput) window.performSearch(overlaySearchInput.value, 'overlay');
            });
        }

        // Event listener untuk tombol tutup overlay
        if (closeOverlayButton) {
            closeOverlayButton.addEventListener('click', () => {
                window.closeSearchOverlay();
            });
        }

        // Event listener untuk filter di overlay
        if (overlayFilterArticles) {
            overlayFilterArticles.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                window.removeOverlayFilter('articles');
            });
            overlayFilterArticles.addEventListener('click', () => window.addOverlayFilter('articles'));
        }
        if (overlayFilterPhotography) {
            overlayFilterPhotography.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                window.removeOverlayFilter('photography');
            });
            overlayFilterPhotography.addEventListener('click', () => window.addOverlayFilter('photography'));
        }
        if (overlayRemoveAllFiltersButton) {
            overlayRemoveAllFiltersButton.addEventListener('click', () => window.removeAllOverlayFilters());
        }

        // Atur nama pengguna
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = "SuperAdmin";
        }

        // Sesuaikan margin konten utama berdasarkan visibilitas sidebar saat ukuran diubah
        window.addEventListener('resize', () => {
            const mainContentArea = document.querySelector('.flex-1');
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('-translate-x-full');
                mainContentArea.classList.add('md:ml-64');
            } else {
                sidebar.classList.add('-translate-x-full');
                mainContentArea.classList.remove('md:ml-64');
            }
        });

        // Panggil fungsi inisialisasi CRUD jika kategori konfigurasi dipilih saat halaman dimuat
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page') || 'configuration'; // Default ke 'configuration' (overview)

        window.selectCategory(initialPage); // Muat kategori awal
    }
    
    initializeApp(); 
});
