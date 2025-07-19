document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen-elemen DOM yang dibutuhkan
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input'); // Search input di header utama
    const searchButton = document.getElementById('search-button'); // Tombol cari di header utama
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

    const userMenuButton = document.getElementById('user-menu-button'); // Tombol menu user
    const userDropdown = document.getElementById('user-dropdown'); // Dropdown menu user
    const logoutButton = document.getElementById('logout-button'); // Tombol logout

    // Data mock untuk konten dan pencarian
    // 'path' digunakan untuk memuat konten dari file HTML terpisah
    // 'full' atau 'detail' digunakan jika konten langsung ada di sini (hardcoded HTML)
    const contentData = {
        'dashboard-overview': {
            path: 'component/dashboard-overview.html',
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Ikhtisar Dashboard</h2>
                <p class="text-gray-600 mb-4">Selamat datang di dashboard kamu. Berikut ringkasan singkat operasi kamu.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Total Pemesanan</h3>
                        <p class="text-3xl font-bold text-blue-500">1,250</p>
                        <p class="text-gray-600 text-sm mt-1">30 hari terakhir</p>
                    </div>
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Kru Aktif</h3>
                        <p class="text-3xl font-bold text-teal-500">85</p>
                        <p class="text-gray-600 text-sm mt-1">Sedang bekerja</p>
                    </div>
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Nilai Inventaris</h3>
                        <p class="text-3xl font-bold text-green-500">$2.5M</p>
                        <p class="text-gray-600 text-sm mt-1">Total aset</p>
                    </div>
                </div>
                <div class="mt-8">
                    <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-3">Aktivitas Terbaru</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm">
                            <h4 class="text-gray-900 font-medium">Pemesanan baru untuk Proyek Alpha</h4>
                            <span class="text-gray-600 text-xs md:text-sm">5 menit yang lalu</span>
                        </div>
                        <div class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm">
                            <h4 class="text-gray-900 font-medium">Kru #123 menyelesaikan tugas</h4>
                            <span class="text-gray-600 text-xs md:text-sm">1 jam yang lalu</span>
                        </div>
                        <div class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm">
                            <h4 class="text-gray-900 font-medium">Pembaruan inventaris: 10 unit ditambahkan ke Gudang</h4>
                            <span class="text-gray-600 text-xs md:text-sm">3 jam yang lalu</span>
                        </div>
                    </div>
                </div>
            `,
        },
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
        // Konfigurasi (akan dimuat dari file HTML terpisah di configuration.html)
        // Kita tetap perlu entri ini di contentData dashboard agar searchbar bisa mengarahkannya
        'configuration': { path: 'component/configuration/overview.html' }, // Untuk overview konfigurasi
        'configuration-warehouse': { path: 'component/configuration/warehouse.html' },
        'configuration-zone': { path: 'component/configuration/zone.html' },
        'configuration-location-type': { path: 'component/configuration/location-type.html' },
    };

    // Data untuk item pencarian
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
        { id: 'data archiving/media', title: 'Pengarsipan Data - Media', category: 'Data Archiving', lastUpdated: 'Lama' },
        { id: 'data archiving/financial', title: 'Pengarsipan Data - Keuangan', category: 'Data Archiving', lastUpdated: 'Lama' },
        // Item pencarian untuk konfigurasi
        { id: 'configuration', title: 'Konfigurasi Sistem Overview', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-warehouse', title: 'Konfigurasi - Gudang', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-zone', title: 'Konfigurasi - Zona', category: 'Configuration', lastUpdated: 'Terbaru' },
        { id: 'configuration-location-type', title: 'Konfigurasi - Tipe Lokasi', category: 'Configuration', lastUpdated: 'Terbaru' },
    ];

    let currentCategory = 'dashboard-overview'; // Kategori default saat ini
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
        'system management/overview': 'system', 'system management/users': 'system', 'system management/logs': 'system', 'system management/backup': 'system',
        'setting optimazation/overview': 'setting-optimazation', 'setting optimazation/general': 'setting-optimazation', 'setting optimazation/notifications': 'setting-optimazation', 'setting optimazation/security': 'setting-optimazation',
        'data archiving/overview': 'data-archiving', 'data archiving/documents': 'data-archiving', 'data archiving/media': 'data-archiving', 'data archiving/financial': 'data-archiving',
        'configuration': 'configuration', // Tambahkan ini untuk overview konfigurasi
        'configuration-warehouse': 'configuration',
        'configuration-zone': 'configuration',
        'configuration-location-type': 'configuration',
    };

    /**
     * Memuat konten HTML dari file terpisah ke dalam area konten utama.
     * @param {string} pagePath - Path ke file HTML komponen (e.g., 'dashboard-overview', 'yard management/overview').
     */
    async function loadPage(pagePath) {
        if (!pagePath) return;
        const targetContent = contentData[pagePath];
        if (!mainContent) {
            console.error('Elemen #main-content tidak ditemukan.');
            return;
        }

        mainContent.innerHTML = `<p class="text-center p-12 text-gray-500">Loading content...</p>`;
        
        if (targetContent && targetContent.path) {
            try {
                const response = await fetch(targetContent.path);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`File komponen tidak ditemukan: ${targetContent.path}. Pastikan file-nya ada dan namanya sudah benar ya.`);
                    } else {
                        throw new Error(`Gagal memuat halaman: ${response.status} ${response.statusText}`);
                    }
                }
                mainContent.innerHTML = await response.text();
            } catch (error) {
                console.error('Ada error saat loading halaman:', error);
                mainContent.innerHTML = `<p class="text-center p-12 text-red-500">Error: ${error.message}</p>`;
            }
        } else if (targetContent && targetContent.full) {
            mainContent.innerHTML = targetContent.full;
        } else if (targetContent && targetContent.detail) {
            mainContent.innerHTML = targetContent.detail;
        } else {
            mainContent.innerHTML = `<p class="text-center p-12 text-gray-500">Konten untuk ${pagePath.charAt(0).toUpperCase() + pagePath.slice(1).replace(/-/g, ' ')} belum tersedia.</p>`;
        }
    }

    /**
     * Mengaktifkan/menonaktifkan anak untuk item sidebar mana pun.
     * @param {string} category - ID kategori utama sidebar.
     */
    function toggleChildren(category) {
        // Menggunakan querySelector dengan :has() untuk menemukan sidebar-group yang tepat
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
     * @param {string} category - ID kategori yang dipilih (e.g., 'dashboard-overview', 'configuration-warehouse').
     */
    function selectCategory(category) {
        // Hapus style 'active' dari semua link sidebar sebelumnya
        document.querySelectorAll('.sidebar-item.active, .sidebar-child.active').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('active-sidebar-item', 'bg-gray-100'); // Hapus kelas aktif spesifik
            el.classList.add('text-gray-600'); // Kembalikan warna teks default
        });
        document.querySelectorAll('.sidebar-group button.sidebar-item').forEach(btn => {
            btn.classList.remove('active-sidebar-item', 'bg-gray-100');
        });

        // Tentukan apakah ini navigasi internal (di dashboard.html) atau eksternal (ke configuration.html)
        if (category.startsWith('configuration')) {
            // Ini adalah navigasi eksternal ke halaman configuration.html
            window.location.href = `configuration.html?page=${encodeURIComponent(category)}`;
            return; // Hentikan eksekusi lebih lanjut karena akan pindah halaman
        }

        // Untuk navigasi internal di dashboard.html
        currentCategory = category;
        loadPage(category); // Muat konten sesuai kategori

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
    }

    /**
     * Menangani input pencarian dari header utama.
     * Membuka overlay pencarian dan memicu pencarian di dalamnya.
     * @param {string} query - Query pencarian.
     */
    function handleSearch(query) {
        if (query.length > 0) {
            if (searchOverlay) searchOverlay.classList.remove('hidden');
            if (overlaySearchInput) overlaySearchInput.value = query; // Sinkronkan kueri ke input pencarian overlay
            performSearch(query, 'overlay'); // Picu pencarian di overlay
            if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden'); // Sembunyikan riwayat saat mengetik
        } else {
            // Jika query kosong, sembunyikan overlay dan tampilkan riwayat pencarian
            if (searchOverlay) searchOverlay.classList.add('hidden');
            showSearchHistory(); // Tampilkan riwayat pencarian
        }
    }

    /**
     * Melakukan pencarian berdasarkan query dan menampilkan hasilnya.
     * Digunakan oleh search bar utama dan overlay.
     * @param {string} query - Query pencarian.
     * @param {string} source - 'main' untuk search bar header, 'overlay' untuk search bar overlay.
     */
    function performSearch(query, source) {
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
                    resultItem.onmouseenter = () => showPreview(item.id); 
                    resultItem.onclick = () => selectSearchResult(item.id, item.title, query);
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
    }

    /**
     * Menampilkan pratinjau di panel detail overlay.
     * @param {string} id - ID item konten.
     */
    function showPreview(id) {
        const content = contentData[id];

        if (!overlayDetailContentPanel) return;

        if (content && (content.detail || content.full)) {
            overlayDetailContentPanel.innerHTML = `
                ${content.detail || content.full}
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="displayContentInMainDashboard('${id}')">
                    Tampilkan Halaman
                </button>
            `;
        } else if (content && content.path) { // Jika ada path, tampilkan pesan pratinjau umum
            // Cari item di searchItems untuk mendapatkan judul yang lebih baik
            const itemInfo = searchItems.find(item => item.id === id);
            overlayDetailContentPanel.innerHTML = `
                <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Pratinjau untuk ${itemInfo ? itemInfo.title : id}</h2>
                <p class="text-gray-600">Konten ini akan dimuat dari file terpisah: ${content.path}.</p>
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md active:scale-95 transform" onclick="displayContentInMainDashboard('${id}')">
                    Tampilkan Halaman
                </button>
            `;
        } else {
            overlayDetailContentPanel.innerHTML = `<p class="text-gray-500 text-center">Tidak ada pratinjau tersedia untuk item ini.</p>`;
        }
    }

    /**
     * Memilih hasil pencarian dari overlay (saat diklik).
     * @param {string} id - ID item yang dipilih.
     * @param {string} title - Judul item yang dipilih.
     * @param {string} query - Query pencarian yang menghasilkan item ini.
     */
    function selectSearchResult(id, title, query) {
        addSearchHistory(query); // Tambahkan query ke riwayat pencarian
        displayContentInMainDashboard(id); // Tampilkan konten lengkapnya di dashboard utama
    }

    /**
     * Menampilkan konten di area dashboard utama dan menutup overlay.
     * @param {string} id - ID konten yang akan ditampilkan.
     */
    function displayContentInMainDashboard(id) {
        const content = contentData[id];
        if (!mainContent) return;
        
        // Jika konten adalah bagian dari konfigurasi, pindah halaman ke configuration.html
        if (id.startsWith('configuration')) {
            window.location.href = `configuration.html?page=${encodeURIComponent(id)}`;
            return; // Hentikan eksekusi karena akan pindah halaman
        }
        // Jika konten adalah bagian dari dashboard utama, muat secara internal
        else if (content && content.path) {
            loadPage(id); // Panggil loadPage untuk memuat dari file
        }
        // Jika konten hardcoded di contentData
        else if (content && content.full) {
            mainContent.innerHTML = content.full;
        } else if (content && content.detail) {
            mainContent.innerHTML = content.detail;
        } else {
            mainContent.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Konten Lengkap untuk ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</h2><p class="text-gray-600">Tidak ada konten lengkap tersedia.</p>`;
        }
        
        closeSearchOverlay(); // Tutup overlay pencarian
        // selectCategory(id); // selectCategory akan dipanggil setelah loadPage selesai
    }

    /**
     * Menambahkan filter ke daftar filter aktif dan memicu pencarian ulang.
     * @param {string} filterName - Nama filter yang akan ditambahkan.
     */
    function addOverlayFilter(filterName) {
        if (!activeFilters.includes(filterName.toLowerCase())) {
            activeFilters.push(filterName.toLowerCase());
            const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
            if (filterElement) filterElement.classList.remove('hidden');
            if (overlaySearchInput) performSearch(overlaySearchInput.value, 'overlay');
        }
    }

    /**
     * Menghapus filter dari daftar filter aktif dan memicu pencarian ulang.
     * @param {string} filterName - Nama filter yang akan dihapus.
     */
    function removeOverlayFilter(filterName) {
        activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
        const filterElement = document.getElementById(`overlay-filter-${filterName.toLowerCase()}`);
        if (filterElement) filterElement.classList.add('hidden');
        if (overlaySearchInput) performSearch(overlaySearchInput.value, 'overlay');
    }

    /**
     * Menghapus semua filter aktif dan memicu pencarian ulang.
     */
    function removeAllOverlayFilters() {
        activeFilters = [];
        if (overlayFilterArticles) overlayFilterArticles.classList.add('hidden');
        if (overlayFilterPhotography) overlayFilterPhotography.classList.add('hidden');
        if (overlaySearchInput) overlaySearchInput.value = '';
        performSearch('', 'overlay'); // Hapus hasil pencarian
    }

    /**
     * Menutup overlay pencarian.
     */
    function closeSearchOverlay() {
        if (searchOverlay) searchOverlay.classList.add('hidden');
        if (searchInput) searchInput.value = ''; // Hapus input pencarian utama
        if (overlaySearchInput) overlaySearchInput.value = ''; // Hapus input pencarian overlay
        activeFilters = []; // Hapus filter aktif
        if (overlaySearchFilters) overlaySearchFilters.classList.add('hidden'); // Sembunyikan filter di overlay
        if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden'); // Sembunyikan riwayat
    }

    /**
     * Mengaktifkan/menonaktifkan dropdown profil pengguna.
     */
    function toggleUserDropdown() {
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    }

    // Tutup dropdown pengguna, riwayat pencarian, dan overlay jika diklik di luar
    document.addEventListener('click', (e) => {
        // Tutup dropdown user
        if (userDropdown && !userDropdown.classList.contains('hidden') && userMenuButton && !userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }

        // Periksa apakah klik terjadi di dalam container search input utama atau overlay/history dropdown
        const isClickInsideSearchArea = (searchInput && searchInput.closest('.flex.items-center.bg-gray-100')) &&
                                        (searchInput.closest('.flex.items-center.bg-gray-100').contains(e.target) ||
                                        (searchOverlay && searchOverlay.contains(e.target)) ||
                                        (searchHistoryDropdown && searchHistoryDropdown.contains(e.target)));

        if (!isClickInsideSearchArea) {
            // Jika klik di luar semua area search, tutup semuanya
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) {
                closeSearchOverlay();
            }
            if (searchHistoryDropdown && !searchHistoryDropdown.classList.contains('hidden')) {
                searchHistoryDropdown.classList.add('hidden');
            }
            // Reset search input jika ditutup dan input tidak kosong
            if (searchInput && searchInput.value !== '') {
                searchInput.value = '';
                selectCategory(currentCategory); // Kembali ke kategori terakhir yang aktif
            }
        }
    });

    /**
     * Menangani logout.
     */
    function handleLogout() {
        console.log('Kamu udah berhasil log out.'); // Mengganti alert dengan console.log
        window.location.href = 'login.html';
    }

    /**
     * Menambahkan query ke riwayat pencarian.
     * @param {string} query - Query pencarian yang akan ditambahkan.
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
    function showSearchHistory() {
        if (!searchHistoryDropdown || !document.getElementById('search-history-content')) return;

        const historyContent = document.getElementById('search-history-content');
        historyContent.innerHTML = ''; // Bersihkan konten sebelumnya

        if (searchHistory.length > 0) {
            searchHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('flex', 'items-center', 'justify-between', 'px-3', 'py-2', 'cursor-pointer', 'hover:bg-gray-100', 'rounded-md');
                historyItem.innerHTML = `
                    <span class="text-gray-700 text-sm" onclick="applySearchHistory('${item}')">${item}</span>
                    <button class="text-gray-400 hover:text-gray-600 text-xs ml-2" onclick="removeSearchHistory(${index})">&times;</button>
                `;
                historyContent.appendChild(historyItem);
            });
            const clearAllButton = document.createElement('div');
            clearAllButton.classList.add('text-right', 'pt-2', 'pb-1', 'px-3');
            clearAllButton.innerHTML = `<button class="text-gray-500 hover:underline text-xs" onclick="clearAllSearchHistory()">Hapus Semua Riwayat</button>`;
            historyContent.appendChild(clearAllButton);

            searchHistoryDropdown.classList.remove('hidden');
        } else {
            historyContent.innerHTML = `<p class="p-3 text-gray-500 text-sm">Tidak ada riwayat pencarian.</p>`;
            searchHistoryDropdown.classList.remove('hidden');
        }
    }

    /**
     * Menerapkan item riwayat pencarian ke input pencarian dan memicu pencarian.
     * @param {string} query - Query dari riwayat yang akan diterapkan.
     */
    function applySearchHistory(query) {
        if (searchInput) {
            searchInput.value = query;
            handleSearch(query); // Memanggil handleSearch untuk memicu overlay
        }
        if (searchHistoryDropdown) searchHistoryDropdown.classList.add('hidden');
    }

    /**
     * Menghapus item individual dari riwayat pencarian.
     * @param {number} index - Indeks item yang akan dihapus.
     */
    function removeSearchHistory(index) {
        searchHistory.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        showSearchHistory(); // Perbarui tampilan riwayat
    }

    /**
     * Menghapus semua riwayat pencarian.
     */
    function clearAllSearchHistory() {
        searchHistory = [];
        localStorage.removeItem('searchHistory');
        showSearchHistory(); // Perbarui tampilan riwayat
    }

    // --- CRUD Data (Simulasi Sisi Klien) ---
    // Data ini akan disimpan di localStorage, bukan di server.
    // Ini hanya contoh untuk menunjukkan fungsionalitas CRUD.
    let warehouses = JSON.parse(localStorage.getItem('warehouses')) || [
        { id: 'DCB', description: 'DC BUAH BATU', active: true, address1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL', address2: '', address3: '', city: 'Bandung', state: 'Jawa Barat', postalCode: '40266', country: 'Indonesia', faxNumber: '(022)-88884377', attentionTo: '', phoneNumber: '(022)-7540576 / 77', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: 'DC BUAH BATU', returnAddress1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL, BANDUNG.', returnAddress2: '', returnAddress3: '', returnCity: 'Bandung', returnState: 'Jawa Barat', returnPostalCode: '40266', returnCountry: 'Indonesia', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '\\\\scale\\fs\\vls\\Report\\DCB', userDefinedField1: 'PT. AKUR PRATAMA', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '8.00000', userDefinedField8: '0.00000', users: ['Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284', 'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301', 'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115', 'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'] }, // Example data [cite: 10, 11]
        { id: 'DCC', description: 'DC CIKONENG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCE', description: 'DC EXTENTION', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCF', description: 'DC BUAH BATU FRESH', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCJ', description: 'DC JAKARTA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCK', description: 'DC KAYU MANIS', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCL', description: 'DC LEUWIPANJANG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCM', description: 'DC MOCHAMAD TOHA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCP', description: 'DC PELABUHAN RATU', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCS', description: 'DC SUMBER', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCT', description: 'DC TEGAL', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'DCY', description: 'DC YOMIMART', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
        { id: 'GBG', description: 'DC GEDE BAGE', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', returnPostalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
    ];
    
    let zones = JSON.parse(localStorage.getItem('zones')) || [
        { id: 'Allocation', identifier: 'Allocation', recordType: 'ZONETYPE', description: 'Allocation', systemValue1: 'Yes', systemCreated: true, active: true }, // Example data [cite: 15]
        { id: 'Locating', identifier: 'Locating', recordType: 'ZONETYPE', description: 'Locating', systemValue1: 'Yes', systemCreated: true, active: true },
        { id: 'Work', identifier: 'Work', recordType: 'ZONETYPE', description: 'Work', systemValue1: 'Yes', systemCreated: true, active: true },
    ];

    let locationTypes = JSON.parse(localStorage.getItem('locationTypes')) || [
        { id: 'CFLOW RESV TYPE 1', locationType: 'CFLOW RESV TYPE 1', length: 120.00, width: 30.00, height: 120.00, dimensionUM: 'CM', maximumWeight: 1000.00, weightUM: 'KG', active: true, lastUpdated: '01-07-2019 9:46:38 AM User: suhartono' }, // Example data [cite: 17, 18]
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

    // Fungsi helper untuk generate ID unik (jika diperlukan)
    function generateUniqueId(prefix) {
        return prefix + Date.now();
    }

    // Fungsi untuk menyimpan data ke localStorage
    function saveWarehouses() {
        localStorage.setItem('warehouses', JSON.stringify(warehouses));
    }

    function saveZones() {
        localStorage.setItem('zones', JSON.stringify(zones));
    }

    function saveLocationTypes() {
        localStorage.setItem('locationTypes', JSON.stringify(locationTypes));
    }

    // --- Warehouse CRUD Functions (for configuration.html) ---
    // Fungsi-fungsi ini akan dipanggil dari configuration.html, tapi definisinya perlu ada di sini
    // agar bisa diakses secara global jika diperlukan atau dipindahkan ke file terpisah nantinya.

    window.renderWarehouseList = function(filterQuery = '') {
        const container = document.getElementById('warehouse-list-container');
        if (!container) return; // Pastikan elemen ada

        container.innerHTML = ''; // Clear existing list

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
        filteredWarehouses.forEach(wh => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${wh.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${wh.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${wh.active ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showWarehouseForm('edit', '${wh.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="deleteWarehouse('${wh.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    window.showWarehouseForm = function(mode, id = null) {
        const modal = document.getElementById('warehouse-form-modal');
        const title = document.getElementById('warehouse-form-title');
        const form = document.getElementById('warehouse-form');
        if (!modal || !title || !form) return;

        form.reset(); // Reset form fields

        // Reset tab styles and activate first tab
        const tabButtons = form.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-blue-500', 'text-blue-500'));
        const firstTabButton = tabButtons[0];
        if (firstTabButton) {
            firstTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
        const tabContents = form.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.add('hidden'));
        document.getElementById('warehouse-address').classList.remove('hidden');

        document.getElementById('same-as-warehouse-address-return').checked = false;
        window.toggleReturnAddressFields(); // Ensure return address fields are enabled by default

        currentWarehouseId = id; // Set current ID for editing

        if (mode === 'create') {
            title.textContent = 'Buat Gudang Baru';
            document.getElementById('warehouse-submit-button').textContent = 'Buat';
            document.getElementById('warehouse-name').disabled = false; // Enable ID for creation
            document.getElementById('warehouse-inactive').checked = false; // Default new to active
            window.renderUserCheckboxes([]); // Render all users for new warehouse
        } else { // mode === 'edit'
            title.textContent = 'Edit Gudang';
            document.getElementById('warehouse-submit-button').textContent = 'Simpan Perubahan';
            document.getElementById('warehouse-name').disabled = true; // Disable ID when editing

            const warehouseToEdit = warehouses.find(wh => wh.id === id);
            if (warehouseToEdit) {
                // Populate main fields
                document.getElementById('warehouse-name').value = warehouseToEdit.id;
                document.getElementById('warehouse-description').value = warehouseToEdit.description;
                document.getElementById('warehouse-inactive').checked = !warehouseToEdit.active;

                // Populate Warehouse Address tab
                document.getElementById('address1').value = warehouseToEdit.address1;
                document.getElementById('address2').value = warehouseToEdit.address2;
                document.getElementById('address3').value = warehouseToEdit.address3;
                document.getElementById('city').value = warehouseToEdit.city;
                document.getElementById('state').value = warehouseToEdit.state;
                document.getElementById('postal-code').value = warehouseToEdit.postalCode;
                document.getElementById('country').value = warehouseToEdit.country;
                document.getElementById('fax-number').value = warehouseToEdit.faxNumber;
                document.getElementById('attention-to').value = warehouseToEdit.attentionTo;
                document.getElementById('phone-number').value = warehouseToEdit.phoneNumber;
                document.getElementById('email-address').value = warehouseToEdit.emailAddress;
                document.getElementById('ucc-ean-number').value = warehouseToEdit.uccEanNumber;

                // Populate Returns Address tab
                document.getElementById('same-as-warehouse-address-return').checked = warehouseToEdit.returnAddressSame;
                window.toggleReturnAddressFields(); // Adjust fields based on checkbox
                document.getElementById('return-name').value = warehouseToEdit.returnName;
                document.getElementById('return-address1').value = warehouseToEdit.returnAddress1;
                document.getElementById('return-address2').value = warehouseToEdit.returnAddress2;
                document.getElementById('return-address3').value = warehouseToEdit.returnAddress3;
                document.getElementById('return-city').value = warehouseToEdit.returnCity;
                document.getElementById('return-state').value = warehouseToEdit.returnState;
                document.getElementById('return-postal-code').value = warehouseToEdit.returnPostalCode;
                document.getElementById('return-country').value = warehouseToEdit.returnCountry;
                document.getElementById('return-fax-number').value = warehouseToEdit.returnFaxNumber;
                document.getElementById('return-attention-to').value = warehouseToEdit.returnAttentionTo;
                document.getElementById('return-phone-number').value = warehouseToEdit.returnPhoneNumber;
                document.getElementById('return-email-address').value = warehouseToEdit.returnEmailAddress;
                document.getElementById('return-ucc-ean-number').value = warehouseToEdit.returnUccEanNumber;

                // Populate Miscellaneous tab
                document.getElementById('slotting-move-file-directory').value = warehouseToEdit.slottingMoveFileDirectory;
                document.getElementById('default-location-for-unslotted-items').value = warehouseToEdit.defaultLocationForUnslottedItems;
                document.getElementById('rendered-document-pdf-file-directory').value = warehouseToEdit.renderedDocumentPdfFileDirectory;

                // Populate User Defined Data tab
                document.getElementById('user-defined-field1').value = warehouseToEdit.userDefinedField1;
                document.getElementById('user-defined-field2').value = warehouseToEdit.userDefinedField2;
                document.getElementById('user-defined-field3').value = warehouseToEdit.userDefinedField3;
                document.getElementById('user-defined-field4').value = warehouseToEdit.userDefinedField4;
                document.getElementById('user-defined-field5').value = warehouseToEdit.userDefinedField5;
                document.getElementById('user-defined-field6').value = warehouseToEdit.userDefinedField6;
                document.getElementById('user-defined-field7').value = warehouseToEdit.userDefinedField7;
                document.getElementById('user-defined-field8').value = warehouseToEdit.userDefinedField8;

                window.renderUserCheckboxes(warehouseToEdit.users || []); // Render users and check selected ones
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Display as flex to center content
    };

    window.closeWarehouseForm = function() {
        document.getElementById('warehouse-form-modal').classList.add('hidden');
        document.getElementById('warehouse-form-modal').classList.remove('flex');
        currentWarehouseId = null;
    };

    window.handleWarehouseSubmit = function(event) {
        event.preventDefault();
        const form = event.target;
        const warehouseId = document.getElementById('warehouse-name').value;
        const description = document.getElementById('warehouse-description').value;
        const inactive = document.getElementById('warehouse-inactive').checked;
        const active = !inactive;

        // Collect address data
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

        // Collect returns address data
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

        // Collect miscellaneous data
        const slottingMoveFileDirectory = document.getElementById('slotting-move-file-directory').value;
        const defaultLocationForUnslottedItems = document.getElementById('default-location-for-unslotted-items').value;
        const renderedDocumentPdfFileDirectory = document.getElementById('rendered-document-pdf-file-directory').value;

        // Collect user defined data
        const userDefinedField1 = document.getElementById('user-defined-field1').value;
        const userDefinedField2 = document.getElementById('user-defined-field2').value;
        const userDefinedField3 = document.getElementById('user-defined-field3').value;
        const userDefinedField4 = document.getElementById('user-defined-field4').value;
        const userDefinedField5 = document.getElementById('user-defined-field5').value;
        const userDefinedField6 = document.getElementById('user-defined-field6').value;
        const userDefinedField7 = document.getElementById('user-defined-field7').value;
        const userDefinedField8 = document.getElementById('user-defined-field8').value;

        // Collect selected users
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
            // Update existing warehouse
            const index = warehouses.findIndex(wh => wh.id === currentWarehouseId);
            if (index !== -1) {
                warehouses[index] = { ...warehouses[index], ...newWarehouse }; // Merge existing with new
            }
        } else {
            // Add new warehouse
            if (warehouses.some(wh => wh.id === warehouseId)) {
                console.log('Warehouse ID already exists!'); // Mengganti alert
                return;
            }
            warehouses.push(newWarehouse);
        }
        saveWarehouses();
        window.renderWarehouseList();
        closeWarehouseForm();
    };

    window.deleteWarehouse = function(id) {
        if (confirm(`Are you sure you want to delete warehouse ${id}?`)) { // Menggunakan confirm bawaan browser
            warehouses = warehouses.filter(wh => wh.id !== id);
            saveWarehouses();
            window.renderWarehouseList();
        }
    };

    window.filterWarehouseList = function(query) {
        window.renderWarehouseList(query);
    };

    window.toggleReturnAddressFields = function() {
        const sameAsCheckbox = document.getElementById('same-as-warehouse-address-return');
        const returnAddressFields = document.getElementById('return-address-fields');
        const fields = returnAddressFields.querySelectorAll('input, select');

        if (sameAsCheckbox.checked) {
            returnAddressFields.classList.add('hidden');
            fields.forEach(field => field.disabled = true);
        } else {
            returnAddressFields.classList.remove('hidden');
            fields.forEach(field => field.disabled = false);
        }
    };

    window.renderUserCheckboxes = function(selectedUsers) {
        const userListContainer = document.getElementById('user-checkbox-list');
        if (!userListContainer) return;

        userListContainer.innerHTML = ''; // Clear existing checkboxes

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

    window.toggleAllUsers = function() {
        const checkAllCheckbox = document.getElementById('check-all-users');
        const userCheckboxes = document.querySelectorAll('#user-checkbox-list input[type="checkbox"]');
        userCheckboxes.forEach(checkbox => {
            checkbox.checked = checkAllCheckbox.checked;
        });
    };


    // --- Zone CRUD Functions (for configuration.html) ---
    window.renderZoneList = function(filterQuery = '') {
        const container = document.getElementById('zone-list-container');
        if (!container) return;

        container.innerHTML = ''; // Clear existing list

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
        filteredZones.forEach(zone => {
            const row = tbody.insertRow();
            row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${zone.identifier}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.systemCreated ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${zone.active ? 'Yes' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showZoneForm('edit', '${zone.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="deleteZone('${zone.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    window.showZoneForm = function(mode, id = null) {
        const modal = document.getElementById('zone-form-modal');
        const title = document.getElementById('zone-form-title');
        const form = document.getElementById('zone-form');
        if (!modal || !title || !form) return;

        form.reset(); 
        currentZoneId = id;

        if (mode === 'create') {
            title.textContent = 'Buat Zona Baru';
            document.getElementById('zone-submit-button').textContent = 'Buat';
            document.getElementById('zone-identifier').disabled = false;
            document.getElementById('zone-inactive').checked = false;
            document.getElementById('zone-system-created').checked = false; // New zones are not system created by default
        } else { // mode === 'edit'
            title.textContent = 'Edit Zona';
            document.getElementById('zone-submit-button').textContent = 'Simpan Perubahan';
            document.getElementById('zone-identifier').disabled = true; // Identifier is usually not editable for existing records

            const zoneToEdit = zones.find(z => z.id === id);
            if (zoneToEdit) {
                document.getElementById('zone-identifier').value = zoneToEdit.identifier;
                document.getElementById('zone-record-type').value = zoneToEdit.recordType;
                document.getElementById('zone-description').value = zoneToEdit.description;
                document.getElementById('zone-inactive').checked = !zoneToEdit.active;
                document.getElementById('zone-system-created').checked = zoneToEdit.systemCreated;
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeZoneForm = function() {
        document.getElementById('zone-form-modal').classList.add('hidden');
        document.getElementById('zone-form-modal').classList.remove('flex');
        currentZoneId = null;
    };

    window.handleZoneSubmit = function(event) {
        event.preventDefault();
        const form = event.target;
        const identifier = document.getElementById('zone-identifier').value;
        const recordType = document.getElementById('zone-record-type').value;
        const description = document.getElementById('zone-description').value;
        const inactive = document.getElementById('zone-inactive').checked;
        const active = !inactive;
        const systemCreated = document.getElementById('zone-system-created').checked; // Value from UI, though it's disabled for edit

        const newZone = {
            id: currentZoneId || identifier, // Use existing ID or new identifier as ID
            identifier,
            recordType,
            description,
            systemValue1: systemCreated ? 'Yes' : 'No', // Assuming System value 1 is tied to system created
            systemCreated,
            active,
        };

        if (currentZoneId) {
            // Update existing zone
            const index = zones.findIndex(z => z.id === currentZoneId);
            if (index !== -1) {
                zones[index] = { ...zones[index], ...newZone };
            }
        } else {
            // Add new zone
            if (zones.some(z => z.identifier === identifier)) {
                console.log('Zone Identifier already exists!'); 
                return;
            }
            newZone.id = identifier; 
            zones.push(newZone);
        }
        saveZones();
        window.renderZoneList();
        closeZoneForm();
    };

    window.deleteZone = function(id) {
        if (confirm(`Are you sure you want to delete zone ${id}?`)) { 
            zones = zones.filter(z => z.id !== id);
            saveZones();
            window.renderZoneList();
        }
    };

    window.filterZoneList = function(query) {
        window.renderZoneList(query);
    };

    // --- Location Type CRUD Functions (for configuration.html) ---
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
                    <button onclick="showLocationTypeForm('edit', '${lt.id}')" class="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                    <button onclick="deleteLocationType('${lt.id}')" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
            `;
        });
    };

    window.showLocationTypeForm = function(mode, id = null) {
        const modal = document.getElementById('location-type-form-modal');
        const title = document.getElementById('location-type-form-title');
        const form = document.getElementById('location-type-form');
        if (!modal || !title || !form) return;

        form.reset();
        
        // Reset tab styles and activate first tab
        const tabButtons = form.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-blue-500', 'text-blue-500'));
        const firstTabButton = tabButtons[0];
        if (firstTabButton) {
            firstTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
        const tabContents = form.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.add('hidden'));
        document.getElementById('general-location').classList.remove('hidden');


        currentLocationTypeId = id;

        if (mode === 'create') {
            title.textContent = 'Buat Tipe Lokasi Baru';
            document.getElementById('location-type-submit-button').textContent = 'Buat';
            document.getElementById('location-type-name').disabled = false;
            document.getElementById('location-type-inactive').checked = false; // Default new to active
        } else { // mode === 'edit'
            title.textContent = 'Edit Tipe Lokasi';
            document.getElementById('location-type-submit-button').textContent = 'Simpan Perubahan';
            document.getElementById('location-type-name').disabled = true; // Location Type is usually not editable for existing records

            const locationTypeToEdit = locationTypes.find(lt => lt.id === id);
            if (locationTypeToEdit) {
                document.getElementById('location-type-name').value = locationTypeToEdit.locationType;
                document.getElementById('location-type-length').value = locationTypeToEdit.length;
                document.getElementById('location-type-width').value = locationTypeToEdit.width;
                document.getElementById('location-type-height').value = locationTypeToEdit.height;
                document.getElementById('location-type-length-um').value = locationTypeToEdit.dimensionUM;
                document.getElementById('location-type-maximum-weight').value = locationTypeToEdit.maximumWeight;
                document.getElementById('location-type-weight-um').value = locationTypeToEdit.weightUM;
                document.getElementById('location-type-inactive').checked = !locationTypeToEdit.active;
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeLocationTypeForm = function() {
        document.getElementById('location-type-form-modal').classList.add('hidden');
        document.getElementById('location-type-form-modal').classList.remove('flex');
        currentLocationTypeId = null;
    };

    window.handleLocationTypeSubmit = function(event) {
        event.preventDefault();
        const form = event.target;
        const locationTypeName = document.getElementById('location-type-name').value;
        const length = parseFloat(document.getElementById('location-type-length').value) || 0;
        const width = parseFloat(document.getElementById('location-type-width').value) || 0;
        const height = parseFloat(document.getElementById('location-type-height').value) || 0;
        const dimensionUM = document.getElementById('location-type-length-um').value;
        const maximumWeight = parseFloat(document.getElementById('location-type-maximum-weight').value) || 0;
        const weightUM = document.getElementById('location-type-weight-um').value;
        const inactive = document.getElementById('location-type-inactive').checked;
        const active = !inactive;

        const newLocationType = {
            id: currentLocationTypeId || locationTypeName, // Use existing ID or new name as ID
            locationType: locationTypeName,
            length,
            width,
            height,
            dimensionUM,
            maximumWeight,
            weightUM,
            active,
            lastUpdated: `Now User: ${document.getElementById('username-display').textContent}`
        };

        if (currentLocationTypeId) {
            // Update existing location type
            const index = locationTypes.findIndex(lt => lt.id === currentLocationTypeId);
            if (index !== -1) {
                locationTypes[index] = { ...locationTypes[index], ...newLocationType };
            }
        } else {
            // Add new location type
            if (locationTypes.some(lt => lt.locationType === locationTypeName)) {
                console.log('Location Type name already exists!'); 
                return;
            }
            newLocationType.id = locationTypeName; 
            locationTypes.push(newLocationType);
        }
        saveLocationTypes();
        window.renderLocationTypeList();
        closeLocationTypeForm();
    };

    window.deleteLocationType = function(id) {
        if (confirm(`Are you sure you want to delete location type ${id}?`)) { 
            locationTypes = locationTypes.filter(lt => lt.id !== id);
            saveLocationTypes();
            window.renderLocationTypeList();
        }
    };

    window.filterLocationTypeList = function(query) {
        window.renderLocationTypeList(query);
    };

    // --- Tab functionality for forms (for configuration.html) ---
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

    window.activateTab = function(tabId, modalId = null) {
        const parentElement = modalId ? document.getElementById(modalId) : document;
        
        parentElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        parentElement.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active-tab', 'border-blue-500', 'text-blue-500');
        });

        document.getElementById(tabId).classList.remove('hidden');
        const activeTabButton = parentElement.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (activeTabButton) {
            activeTabButton.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        }
    };

    // Inisialisasi aplikasi saat DOM dimuat
    function initializeApp() {
        // Event listener untuk klik di sidebar
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]'); // Cari link <a> yang punya atribut data-page
            const externalLink = e.target.closest('a[href$=".html"]'); // Cari link <a> yang href-nya berakhir dengan .html (untuk navigasi halaman penuh)
            const dropdownButton = e.target.closest('.sidebar-group > button'); // Cari tombol dropdown menu

            // Kalau yang diklik itu link sidebar yang memuat konten dinamis (punya data-page)
            if (link && !externalLink) {
                e.preventDefault(); // Biar gak reload halaman
                const page = link.dataset.page; // Ambil nilai data-page
                selectCategory(page); // Muat halaman sesuai data-page
            }
            
            // Kalau yang diklik itu link yang mengarah ke halaman HTML lain (misal configuration.html, profile.html, login.html)
            if (externalLink) {
            }

            // Kalau yang diklik itu tombol buat ngebuka/nutup submenu
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

        // Event listener buat tombol menu user
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Biar gak langsung nutup lagi karena event document click
                userDropdown.classList.toggle('hidden'); // Tunjukin/sembunyiin dropdown user
            });
        }

        // Event listener buat tombol logout
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                handleLogout();
            });
        }

        // Event listener untuk klik pada search input utama
        if (searchInput) {
            searchInput.addEventListener('click', (e) => {
                e.stopPropagation(); // Penting: Hentikan event click agar tidak langsung menutup overlay
                // Tampilkan overlay dan fokuskan input di dalamnya
                if (searchOverlay) searchOverlay.classList.remove('hidden');
                if (overlaySearchInput) {
                    overlaySearchInput.focus();
                    // Jika ada query di input utama, sinkronkan ke overlay dan lakukan pencarian
                    if (searchInput.value.length > 0) {
                        overlaySearchInput.value = searchInput.value;
                        performSearch(searchInput.value, 'overlay');
                    } else {
                        // Jika input utama kosong, tampilkan riwayat pencarian
                        showSearchHistory();
                    }
                }
            });

            // Event listener untuk input di searchbar utama (untuk memicu overlay saat mengetik)
            searchInput.addEventListener('input', (e) => {
                handleSearch(e.target.value);
            });
        }

        // Event listener untuk tombol "Cari" di header utama (opsional, bisa juga dihilangkan jika hanya mengandalkan input click/focus)
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (searchInput.value.length > 0) {
                    if (searchOverlay) searchOverlay.classList.remove('hidden');
                    if (overlaySearchInput) overlaySearchInput.value = searchInput.value;
                    performSearch(searchInput.value, 'overlay');
                } else {
                    // Jika input kosong, tampilkan riwayat pencarian
                    if (searchOverlay) searchOverlay.classList.remove('hidden');
                    showSearchHistory();
                }
            });
        }

        // Event listener untuk input di searchbar overlay
        if (overlaySearchInput) {
            overlaySearchInput.addEventListener('input', (e) => {
                performSearch(e.target.value, 'overlay');
            });
        }

        // Event listener untuk tombol "Cari" di overlay
        if (overlaySearchButton) {
            overlaySearchButton.addEventListener('click', () => {
                if (overlaySearchInput) performSearch(overlaySearchInput.value, 'overlay');
            });
        }

        // Event listener untuk tombol tutup overlay
        if (closeOverlayButton) {
            closeOverlayButton.addEventListener('click', () => {
                closeSearchOverlay();
            });
        }

        // Event listener untuk filter di overlay
        if (overlayFilterArticles) {
            overlayFilterArticles.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah event span terpicu
                removeOverlayFilter('articles');
            });
            overlayFilterArticles.addEventListener('click', () => addOverlayFilter('articles'));
        }
        if (overlayFilterPhotography) {
            overlayFilterPhotography.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah event span terpicu
                removeOverlayFilter('photography');
            });
            overlayFilterPhotography.addEventListener('click', () => addOverlayFilter('photography'));
        }
        if (overlayRemoveAllFiltersButton) {
            overlayRemoveAllFiltersButton.addEventListener('click', () => removeAllOverlayFilters());
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
        const initialPage = urlParams.get('page') || 'dashboard-overview';

        loadPage(initialPage).then(() => {
            // Setelah halaman dimuat, baru aktifkan link sidebar yang sesuai
            const activeLinkSelector = `[data-page="${initialPage}"]`;
            const activeLink = document.querySelector(activeLinkSelector);
            if (activeLink) {
                activeLink.classList.add('active'); // Tambah kelas 'active' ke link child
                activeLink.classList.remove('text-gray-500'); // Pastikan teksnya tidak abu-abu
                activeLink.classList.add('font-medium', 'text-gray-900', 'bg-gray-100'); // Tambah gaya aktif
                
                // Aktifkan juga parent group-nya jika ada
                const parentGroup = activeLink.closest('.sidebar-group');
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
                }
            }
            // Jika halaman yang dimuat adalah halaman konfigurasi, panggil fungsi render yang sesuai
            if (initialPage === 'configuration-warehouse') {
                window.renderWarehouseList();
                window.initializeTabButtons('warehouse-form-modal');
                window.activateTab('warehouse-address', 'warehouse-form-modal');
            } else if (initialPage === 'configuration-zone') {
                window.renderZoneList();
                window.initializeTabButtons('zone-form-modal');
                // Tidak ada tab di form zona, tapi jaga fungsi
            } else if (initialPage === 'configuration-location-type') {
                window.renderLocationTypeList();
                window.initializeTabButtons('location-type-form-modal');
                window.activateTab('general-location', 'location-type-form-modal');
            }
        });
    }
    
    initializeApp(); // Jalanin semua event listener dan fungsionalitas lainnya
});
