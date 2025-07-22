(function() { // Menggunakan IIFE untuk membungkus seluruh kode dan menghindari polusi global namespace

    document.addEventListener('DOMContentLoaded', () => {
        // Mendapatkan elemen DOM
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

        // Elemen Modal Kustom
        const customModalOverlay = document.getElementById('custom-modal-overlay');
        const customModalTitle = document.getElementById('custom-modal-title');
        const customModalMessage = document.getElementById('custom-modal-message');
        const customModalOkBtn = document.getElementById('custom-modal-ok-btn');
        const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');

        // Fungsi untuk menampilkan alert kustom (tetap global agar bisa dipanggil dari HTML)
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

        // Fungsi untuk menampilkan konfirmasi kustom (tetap global agar bisa dipanggil dari HTML)
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

        // Data konten (tidak berubah)
        const contentData = {
            dashboard: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Ikhtisar Dashboard</h2>
                    <p class="text-wise-gray mb-4">Selamat datang di dashboard Anda. Berikut ringkasan singkat operasi Anda.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Total Pemesanan</h3>
                            <p class="text-3xl font-bold text-wise-primary">1,250</p>
                            <p class="text-wise-gray text-sm mt-1">30 hari terakhir</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Kru Aktif</h3>
                            <p class="text-3xl font-bold text-wise-info">85</p>
                            <p class="text-wise-gray text-sm mt-1">Sedang bekerja</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-bold text-wise-success">$2.5M</p>
                            <p class="text-wise-gray text-sm mt-1">Total aset</p>
                        </div>
                    </div>
                    <div class="mt-8">
                        <h3 class="text-lg md:text-xl font-semibold text-wise-dark-gray mb-3">Aktivitas Terbaru</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">Pemesanan baru untuk Proyek Alpha</h4>
                                <span class="text-wise-gray text-xs md:text-sm">5 menit yang lalu</span>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">Kru #123 menyelesaikan tugas</h4>
                                <span class="text-wise-gray text-xs md:text-sm">1 jam yang lalu</span>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">Pembaruan inventaris: 10 unit ditambahkan ke Gudang</h4>
                                <span class="text-wise-gray text-xs md:text-sm">3 jam yang lalu</span>
                            </div>
                        </div>
                    </div>
                `,
            },
            'yard-management': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Manajemen Halaman</h2>
                    <p class="text-wise-gray mb-4">Kelola sumber daya dan peralatan halaman Anda di sini. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Ikhtisar</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Total Kendaraan: 50, Tersedia: 35</li>
                            <li>Total Peralatan: 120, Tersedia: 80</li>
                        </ul>
                    </div>
                `,
            },
            'yard-vehicles': {
                full: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Halaman - Kendaraan (Halaman Lengkap)</h2><p class="text-wise-gray">Ini adalah tampilan halaman penuh untuk Kendaraan di Halaman. Berisi daftar lengkap kendaraan, status, dan riwayat.</p><p class="text-wise-gray text-sm mt-2">Detail penuh kendaraan.</p>`,
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Halaman - Kendaraan</h2><p class="text-wise-gray">Daftar kendaraan yang tersedia di halaman.</p><p class="text-wise-gray text-sm mt-2">Jumlah: 35 unit</p>`,
            },
            'yard-equipment': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Halaman - Peralatan</h2><p class="text-wise-gray">Daftar peralatan yang tersedia di halaman.</p><p class="text-wise-gray text-sm mt-2">Jumlah: 80 unit</p>`,
            },
            'yard-personnel': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Halaman - Personel</h2><p class="text-wise-gray">Daftar personel yang ditugaskan ke halaman.</p><p class="text-wise-gray text-sm mt-2">Jumlah: 15 orang</p>`,
            },
            receiving: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Manajemen Penerimaan</h2>
                    <p class="text-wise-gray mb-4">Lacak dan kelola semua pengiriman dan kiriman yang masuk. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Penerimaan Tertunda</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Pengiriman #101 - Diharapkan: Hari Ini</li>
                            <li>Pengiriman #102 - Diharapkan: Besok</li>
                        </ul>
                    </div>
                `,
            },
            'receiving-deliveries': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Penerimaan - Pengiriman</h2><p class="text-wise-gray">Detail semua pengiriman yang masuk.</p><p class="text-wise-gray text-sm mt-2">Jumlah pengiriman: 5</p>`,
            },
            'receiving-returns': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Penerimaan - Pengembalian</h2><p class="text-wise-gray">Detail semua pengembalian yang diterima.</p><p class="text-wise-gray text-sm mt-2">Jumlah pengembalian: 2</p>`,
            },
            'receiving-vendors': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Penerimaan - Vendor</h2><p class="text-wise-gray">Daftar vendor dan status pengiriman mereka.</p><p class="text-wise-gray text-sm mt-2">Jumlah vendor aktif: 10</p>`,
            },
            order: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Perencanaan Pesanan</h2>
                    <p class="text-wise-gray mb-4">Rencanakan dan optimalkan pesanan Anda. Lacak status pesanan, kelola pengiriman, dan perkiraan permintaan. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Pesanan Tertunda</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Pengiriman #X123 - Status: Menunggu Persetujuan</li>
                            <li>Pengiriman #Y456 - Status: Dalam Perjalanan</li>
                        </ul>
                    </div>
                `,
            },
            'order-new': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Perencanaan Pesanan - Pesanan Baru</h2><p class="text-wise-gray">Daftar pesanan baru yang perlu diproses.</p><p class="text-wise-gray text-sm mt-2">Pesanan baru: 7</p>`,
            },
            'order-pending': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Perencanaan Pesanan - Pesanan Tertunda</h2><p class="text-wise-gray">Daftar pesanan yang sedang dalam process atau menunggu tindakan.</p><p class="text-wise-gray text-sm mt-2">Pesanan tertunda: 12</p>`,
            },
            'order-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Perencanaan Pesanan - Riwayat Pesanan</h2><p class="text-wise-gray">Arsip semua pesanan yang telah selesai.</p><p class="text-wise-gray text-sm mt-2">Total pesanan selesai: 500</p>`,
            },
            work: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Manajemen Pekerjaan</h2>
                    <p class="text-wise-gray mb-4">Tetapkan tugas, lacak kemajuan, dan kelola tenaga kerja Anda secara efisien. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Ikhtisar</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Tugas Selesai (Hari Ini): 5</li>
                            <li>Tugas Tertunda: 12</li>
                        </ul>
                    </div>
                `,
            },
            'work-tasks': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Pekerjaan - Tugas</h2><p class="text-wise-gray">Daftar tugas yang ditugaskan dan statusnya.</p><p class="text-wise-gray text-sm mt-2">Tugas aktif: 8</p>`,
            },
            'work-schedule': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Pekerjaan - Jadwal</h2><p class="text-wise-gray">Jadwal kerja untuk semua tim dan individu.</p><p class="text-wise-gray text-sm mt-2">Jadwal hari ini: Penuh</p>`,
            },
            'work-teams': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Pekerjaan - Tim</h2><p class="text-wise-gray">Daftar tim kerja dan anggota mereka.</p><p class="text-wise-gray text-sm mt-2">Jumlah tim: 5</p>`,
            },
            'cross-application': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Manajemen Lintas Aplikasi</h2>
                    <p class="text-wise-gray mb-4">Kelola integrasi dan aliran data antar aplikasi yang berbeda. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Sistem Terhubung</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Sistem CRM (Aktif)</li>
                            <li>Sistem ERP (Aktif)</li>
                        </ul>
                    </div>
                `,
            },
            'cross-app-integrations': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Lintas Aplikasi - Integrasi</h2><p class="text-wise-gray">Status dan konfigurasi integrasi aplikasi.</p><p class="text-wise-gray text-sm mt-2">Integrasi aktif: 3</p>`,
            },
            'cross-app-data-sync': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Lintas Aplikasi - Sinkronisasi Data</h2><p class="text-wise-gray">Lacak status sinkronisasi data antar sistem.</p><p class="text-wise-gray text-sm mt-2">Sinkronisasi terakhir: 10 menit yang lalu</p>`,
            },
            'cross-app-api': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Lintas Aplikasi - Manajemen API</h2><p class="text-wise-gray">Kelola kunci API dan akses untuk integrasi.</p><p class="text-wise-gray text-sm mt-2">Kunci API aktif: 7</p>`,
            },
            inventory: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Ikhtisar Inventaris</h2>
                    <p class="text-wise-gray mb-4">Pilih lokasi inventaris dari sidebar untuk melihat detailnya.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Ringkasan</h3>
                        <p class="text-wise-gray text-sm mt-2">Total Item di Semua Lokasi: 1,500</p>
                        <p class="text-wise-gray text-sm">Tersedia untuk Digunakan: 1,200</p>
                    </div>
                `,
            },
            yard: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventaris - Halaman</h2><p class="text-wise-gray">Kelola inventaris yang berlokasi di halaman.</p><p class="text-wise-gray text-sm mt-2">Jumlah item: 150</p>`,
            },
            warehouse: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventaris - Gudang</h2><p class="text-wise-gray">Kelola inventaris yang berlokasi di gudang.</p><p class="text-wise-gray text-sm mt-2">Jumlah item: 1000</p>`,
            },
            storage: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventaris - Penyimpanan</h2><p class="text-wise-gray">Kelola penyimpanan jangka panjang atau overflow.</p><p class="text-wise-gray text-sm mt-2">Jumlah item: 350</p>`,
            },
            performance: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Manajemen Kinerja</h2>
                    <p class="text-wise-gray mb-4">Pantau dan analisis metrik kinerja untuk berbagai operasi dan personel. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Indikator Kinerja Utama (KPI)</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Tingkat Pengiriman Tepat Waktu: 98%</li>
                            <li>Tingkat Penyelesaian Tugas: 95%</li>
                        </ul>
                    </div>
                `,
            },
            'performance-kpis': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Kinerja - KPI</h2><p class="text-wise-gray">Lihat metrik kinerja utama.</p><p class="text-wise-gray text-sm mt-2">KPI: 5 aktif</p>`,
            },
            'performance-analytics': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Kinerja - Analitik</h2><p class="text-wise-gray">Analisis data kinerja terperinci.</p><p class="text-wise-gray text-sm mt-2">Laporan terakhir: Hari ini</p>`,
            },
            'performance-goals': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Kinerja - Sasaran</h2><p class="text-wise-gray">Lacak dan kelola sasaran kinerja.</p><p class="text-wise-gray text-sm mt-2">Sasaran aktif: 3</p>`,
            },
            
            configuration: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi Sistem</h2>
                    <p class="text-wise-gray mb-4">Di sini Anda dapat mengelola berbagai konfigurasi untuk sistem WISE. Pilih sub-kategori dari sidebar untuk mengelola Warehouse, Zone, atau Location Type.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Gudang</h3>
                            <p class="text-wise-gray text-sm mt-1">Mengelola detail gudang, termasuk alamat dan pengguna resmi.</p>
                            <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-warehouse')">
                                Kelola Gudang
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Zona</h3>
                            <p class="text-wise-gray text-sm mt-1">Menentukan dan mengelola berbagai zona dalam gudang.</p>
                            <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-zone')">
                                Kelola Zona
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Tipe Lokasi</h3>
                            <p class="text-wise-gray text-sm mt-1">Mengonfigurasi tipe lokasi penyimpanan berdasarkan dimensi dan berat.</p>
                            <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-location-type')">
                                Kelola Tipe Lokasi
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Strategi Penempatan</h3>
                            <p class="text-wise-gray text-sm mt-1">Mengelola strategi yang digunakan untuk menempatkan item di lokasi gudang.</p>
                            <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('locating-strategies')">
                                Kelola Strategi Penempatan
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Manajemen Aturan Penempatan</h3>
                            <p class="text-wise-gray text-sm mt-1">Menentukan aturan yang menentukan bagaimana item ditempatkan di lokasi gudang.</p>
                            <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('locating-rule')">
                                Kelola Aturan Penempatan
                            </button>
                        </div>
                    </div>
                `,
            },
            'configuration-warehouse': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi - Gudang </h2>
                    <p class="text-wise-gray mb-4">Kelola gudang yang ada atau tambahkan yang baru.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="showWarehouseForm('create')">
                            Buat Gudang Baru
                        </button>
                        <input type="text" id="warehouse-search" placeholder="Cari gudang..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterWarehouseList(this.value)">
                    </div>
                    <div id="warehouse-list-container" class="overflow-x-auto">
                        </div>
                    <div id="warehouse-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="warehouse-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4"> <!-- Added flex-1, overflow-y-auto, pr-4, -mr-4 -->
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
                                                            <option value="">--Pilih--</option>
                                                            <option value="Jawa Barat">Jawa Barat</option>
                                                            <option value="Jawa Tengah">Jawa Tengah</option>
                                                            <option value="Jawa Timur">Jawa Timur</option>
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
                                                        <option value="">--Pilih--</option>
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
                                                            <option value="">--Pilih--</option>
                                                            <option value="Jawa Barat">Jawa Barat</option>
                                                            <option value="Jawa Tengah">Jawa Tengah</option>
                                                            <option value="Jawa Timur">Jawa Timur</option>
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
                                                        <option value="">--Pilih--</option>
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
                                            <p class="text-wise-gray text-sm">Formulir untuk Freight Bill to Address.</p>
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
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-lg text-wise-gray hover:bg-wise-light-gray transition-all-smooth active-press" onclick="closeWarehouseForm()">Cancel</button>
                                <button type="submit" form="warehouse-form" id="warehouse-submit-button" class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-lg hover:bg-gray-100 transition-all-smooth active-press">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'configuration-zone': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi - Zona</h2>
                    <p class="text-wise-gray mb-4">Kelola tipe zona untuk berbagai area dalam gudang.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="showZoneForm('create')">
                            Buat Zona Baru
                        </button>
                        <input type="text" id="zone-search" placeholder="Cari zona..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterZoneList(this.value)">
                    </div>
                    <div id="zone-list-container" class="overflow-x-auto">
                        </div>

                    <div id="zone-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="zone-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="zone-form" onsubmit="handleZoneSubmit(event)">
                                    <div class="mb-4">
                                        <label for="zone-identifier" class="block text-sm font-medium text-wise-dark-gray">Identifier:</label>
                                        <input type="text" id="zone-identifier" name="identifier" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label for="zone-record-type" class="block text-sm font-medium text-wise-dark-gray">Record type:</label>
                                        <input type="text" id="zone-record-type" name="recordType" value="ZONETYPE" readonly class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-gray-100 text-wise-gray cursor-not-allowed">
                                    </div>
                                    <div class="mb-4">
                                        <label for="zone-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="zone-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="zone-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="zone-system-created" name="systemCreated" disabled class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary cursor-not-allowed">
                                            <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeZoneForm()">Cancel</button>
                                <button type="submit" form="zone-form" id="zone-submit-button" class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'configuration-location-type': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi - Tipe Lokasi</h2>
                    <p class="text-wise-gray mb-4">Konfigurasi tipe lokasi penyimpanan berdasarkan dimensi dan berat.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="showLocationTypeForm('create')">
                            Buat Tipe Lokasi Baru
                        </button>
                        <input type="text" id="location-type-search" placeholder="Cari tipe lokasi..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocationTypeList(this.value)">
                    </div>
                    <div id="location-type-list-container" class="overflow-x-auto">
                        </div>

                    <div id="location-type-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="location-type-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="location-type-form" onsubmit="handleLocationTypeSubmit(event)">
                                    <div class="mb-4">
                                        <label for="location-type-name" class="block text-sm font-medium text-wise-dark-gray">Location type:</label>
                                        <input type="text" id="location-type-name" name="locationType" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="flex space-x-2 mb-2">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="general-location">General</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="user-defined-data-location">User defined data</button>
                                    </div>
                                    <div id="general-location" class="tab-content border border-wise-border p-4 rounded-b-md">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">General</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="location-type-length" class="block text-sm font-medium text-wise-dark-gray">Length:</label>
                                                <input type="number" step="0.01" id="location-type-length" name="length" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="location-type-length-um" class="block text-sm font-medium text-wise-dark-gray">UM:</label>
                                                <input type="text" id="location-type-length-um" name="lengthUM" value="Centimeters" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="location-type-width" class="block text-sm font-medium text-wise-dark-gray">Width:</label>
                                                <input type="number" step="0.01" id="location-type-width" name="width" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="location-type-height" class="block text-sm font-medium text-wise-dark-gray">Height:</label>
                                                <input type="number" step="0.01" id="location-type-height" name="height" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="location-type-maximum-weight" class="block text-sm font-medium text-wise-dark-gray">Maximum weight:</label>
                                                <input type="number" step="0.01" id="location-type-maximum-weight" name="maximumWeight" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="location-type-weight-um" class="block text-sm font-medium text-wise-dark-gray">UM:</label>
                                                <input type="text" id="location-type-weight-um" name="weightUM" value="Kilograms" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                    </div>
                                    <div id="user-defined-data-location" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">User Defined Data for Location Type</h4>
                                        <p class="text-wise-gray text-sm">Tambahkan field kustom untuk tipe lokasi di sini.</p>
                                    </div>

                                    <div class="mb-4 mt-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="location-type-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeLocationTypeForm()">Cancel</button>
                                <button type="submit" form="location-type-form" id="location-type-submit-button" class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            
            'article a': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Detail Artikel A</h2>
                    <p class="text-wise-gray">Ini adalah konten terperinci untuk Artikel A. Ini baru saja diperbarui dan berisi informasi penting mengenai pembaruan sistem.</p>
                    <p class="text-wise-gray text-sm mt-2">Terakhir diperbarui: 2 jam yang lalu</p>
                `,
            },
            'paragraph b': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Detail Paragraf B</h2>
                    <p class="text-wise-gray">Di sini Anda akan menemukan informasi lebih lanjut tentang Paragraf B. Bagian ini mencakup berbagai aspek penanganan dan pemrosesan data.</p>
                    <p class="text-wise-gray text-sm mt-2">Terakhir diperbarui: 1 jam yang lalu</p>
                `,
            },
            'method c': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Detail Metode C</h2>
                    <p class="text-wise-gray">Detail tentang Metode C, termasuk langkah-langkah implementasi dan praktik terbaiknya. Metode ini sangat penting untuk mengoptimalkan kinerja.</p>
                    <p class="text-wise-gray text-sm mt-2">Terakhir diperbarui: 30 menit yang lalu</p>
                `,
            },
            // Start of Setting Optimization Data
            'setting-optimization': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Pengaturan Optimasi</h2>
                    <p class="text-wise-gray mb-4">Kelola pengaturan untuk mengoptimalkan kinerja sistem dan preferensi notifikasi.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Ikhtisar Pengaturan</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Status Optimasi: Aktif</li>
                            <li>Pembaruan Otomatis: Diaktifkan</li>
                            <li>Notifikasi Email: Diaktifkan</li>
                        </ul>
                    </div>
                `,
            },
            'setting-optimization-general': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Pengaturan Umum</h2>
                    <p class="text-wise-gray">Konfigurasi pengaturan dasar sistem.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="auto-update" class="flex items-center">
                                <input type="checkbox" id="auto-update" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                <span class="ml-2 text-sm text-wise-dark-gray">Aktifkan Pembaruan Otomatis</span>
                            </label>
                        </div>
                        <div>
                            <label for="language-select" class="block text-sm font-medium text-wise-dark-gray mb-1">Bahasa:</label>
                            <select id="language-select" class="w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                `,
            },
            'setting-optimization-performance': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Penyesuaian Kinerja</h2>
                    <p class="text-wise-gray">Optimalkan kinerja aplikasi.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="cache-size" class="block text-sm font-medium text-wise-dark-gray mb-1">Ukuran Cache (MB):</label>
                            <input type="number" id="cache-size" value="256" class="w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                        </div>
                        <div>
                            <label for="data-compression" class="flex items-center">
                                <input type="checkbox" id="data-compression" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                <span class="ml-2 text-sm text-wise-dark-gray">Aktifkan Kompresi Data</span>
                            </label>
                        </div>
                    </div>
                `,
            },
            'setting-optimization-notifications': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Preferensi Notifikasi</h2>
                    <p class="text-wise-gray">Atur bagaimana kamu menerima notifikasi.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="email-notifications" class="flex items-center">
                                <input type="checkbox" id="email-notifications" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                <span class="ml-2 text-sm text-wise-dark-gray">Notifikasi Email</span>
                            </label>
                        </div>
                        <div>
                            <label for="sms-notifications" class="flex items-center">
                                <input type="checkbox" id="sms-notifications" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                <span class="ml-2 text-sm text-wise-dark-gray">Notifikasi SMS</span>
                            </label>
                        </div>
                    </div>
                `,
            },
            // End of Setting Optimization Data
            'locating-strategies': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi - Strategi Penempatan</h2>
                    <p class="text-wise-gray mb-4">Kelola strategi yang digunakan untuk menempatkan item di lokasi gudang.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="showLocatingStrategyForm('create')">
                            Buat Strategi Penempatan Baru
                        </button>
                        <input type="text" id="locating-strategy-search" placeholder="Cari strategi penempatan..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocatingStrategyList(this.value)">
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
                                            <input type="checkbox" id="locating-strategy-system-created" name="systemCreated" disabled class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary cursor-not-allowed">
                                            <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeLocatingStrategyForm()">Cancel</button>
                                <button type="submit" form="locating-strategy-form" id="locating-strategy-submit-button" class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'locating-rule': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konfigurasi - Aturan Penempatan</h2>
                    <p class="text-wise-gray mb-4">Kelola aturan yang menentukan bagaimana item ditempatkan di lokasi gudang.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="showLocatingRuleForm('create')">
                            Buat Aturan Penempatan Baru
                        </button>
                        <input type="text" id="locating-rule-search" placeholder="Cari aturan penempatan..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocatingRuleList(this.value)">
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
                                            <input type="text" id="locating-rule-name" name="ruleName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="locating-rule-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="locating-rule-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
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
                                                <!-- Detail records will be dynamically added here -->
                                            </div>
                                            <button type="button" id="add-detail-record-btn" class="px-3 py-1 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-sm text-sm active-press transform" onclick="addDetailRecord()" disabled>Add Detail Record</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeLocatingRuleForm()">Cancel</button>
                                <button type="submit" form="locating-rule-form" id="locating-rule-submit-button" class="px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
        };

        const searchItems = [
            { id: 'article a', title: 'Artikel A', category: 'Umum', lastUpdated: '2 jam yang lalu' },
            { id: 'paragraph b', title: 'Paragraf B', category: 'Dokumentasi', lastUpdated: '1 jam yang lalu' },
            { id: 'method c', title: 'Metode C', category: 'Teknis', lastUpdated: '30 menit yang lalu' },
            { id: 'recent-booking', title: 'Pemesanan baru untuk Proyek Alpha', category: 'Pemesanan', lastUpdated: '5 menit yang lalu' },
            { id: 'crew-task', title: 'Tugas kru #123 selesai', category: 'Pekerjaan', lastUpdated: '1 jam yang lalu' },
            { id: 'inventory-update', title: 'Pembaruan inventaris: 10 unit ditambahkan ke Gudang', category: 'Inventaris', lastUpdated: '3 jam yang lalu' },
            { id: 'vehicle-a', title: 'Loader Berat A', category: 'Manajemen Halaman', lastUpdated: '1 hari yang lalu' },
            { id: 'delivery-x', title: 'Pengiriman X dari Pemasok A', category: 'Penerimaan', lastUpdated: '4 jam yang lalu' },
            { id: 'order-123', title: 'Pesanan Pelanggan #123', category: 'Perencanaan Pesanan', lastUpdated: '1 hari yang lalu' },
            { id: 'integration-crm', title: 'Status Integrasi CRM', category: 'Lintas Aplikasi', lastUpdated: '1 jam yang lalu' },
            { id: 'report-q1', title: 'Laporan Kinerja Q1', category: 'Kinerja', lastUpdated: '2 minggu yang lalu' },
            { id: 'setting-notifications', title: 'Preferensi Notifikasi', category: 'Optimasi Pengaturan', lastUpdated: 'Kemarin' },
            { id: 'log-errors', title: 'Log Kesalahan', category: 'Manajemen Sistem', lastUpdated: '5 menit yang lalu' },
            { id: 'archive-finance', title: 'Laporan Keuangan 2023', category: 'Pengarsipan Data', lastUpdated: 'Jan 2024' },
            { id: 'yard-vehicles', title: 'Kendaraan Halaman', category: 'Manajemen Halaman', lastUpdated: 'Baru saja diperbarui' },
            { id: 'yard-equipment', title: 'Peralatan Halaman', category: 'Manajemen Halaman', lastUpdated: 'Baru saja diperbarui' },
            { id: 'yard-personnel', title: 'Personel Halaman', category: 'Manajemen Halaman', lastUpdated: 'Baru saja diperbarui' },
            { id: 'receiving-deliveries', title: 'Pengiriman Penerimaan', category: 'Penerimaan', lastUpdated: 'Hari ini' },
            { id: 'receiving-returns', title: 'Pengembalian Penerimaan', category: 'Penerimaan', lastUpdated: 'Minggu lalu' },
            { id: 'receiving-vendors', title: 'Vendor Penerimaan', category: 'Penerimaan', lastUpdated: 'Bulanan' },
            { id: 'order-new', title: 'Pesanan Baru', category: 'Perencanaan Pesanan', lastUpdated: 'Hari ini' },
            { id: 'order-pending', title: 'Pesanan Tertunda', category: 'Perencanaan Pesanan', lastUpdated: 'Berlangsung' },
            { id: 'order-history', title: 'Riwayat Pesanan', category: 'Perencanaan Pesanan', lastUpdated: 'Sepanjang waktu' },
            { id: 'work-tasks', title: 'Tugas Pekerjaan', category: 'Pekerjaan', lastUpdated: 'Aktif' },
            { id: 'work-schedule', title: 'Jadwal Pekerjaan', category: 'Pekerjaan', lastUpdated: 'Harian' },
            { id: 'work-teams', title: 'Tim Pekerjaan', category: 'Pekerjaan', lastUpdated: 'Aktif' },
            { id: 'cross-app-integrations', title: 'Integrasi Lintas Aplikasi', category: 'Lintas Aplikasi', lastUpdated: 'Aktif' },
            { id: 'cross-app-data-sync', title: 'Sinkronisasi Data Lintas Aplikasi', category: 'Lintas Aplikasi', lastUpdated: 'Terbaru' },
            { id: 'cross-app-api', title: 'Manajemen API Lintas Aplikasi', category: 'Lintas Aplikasi', lastUpdated: 'Aktif' },
            { id: 'performance-kpis', title: 'KPI Kinerja', category: 'Kinerja', lastUpdated: 'Langsung' },
            { id: 'performance-analytics', title: 'Analitik Kinerja', category: 'Kinerja', lastUpdated: 'Harian' },
            { id: 'performance-goals', title: 'Sasaran Kinerja', category: 'Kinerja', lastUpdated: 'Triwulanan' },
            { id: 'configuration-warehouse', title: 'Konfigurasi Gudang', category: 'Configuration', lastUpdated: 'Terbaru' },
            { id: 'configuration-zone', title: 'Konfigurasi Zona', category: 'Configuration', lastUpdated: 'Terbaru' },
            { id: 'configuration-location-type', title: 'Konfigurasi Tipe Lokasi', category: 'Configuration', lastUpdated: 'Terbaru' },
            { id: 'system-users', title: 'Pengguna Sistem', category: 'Manajemen Sistem', lastUpdated: 'Aktif' },
            { id: 'system-logs', title: 'Log Sistem', category: 'Manajemen Sistem', lastUpdated: 'Terbaru' },
            { id: 'system-backup', title: 'Cadangan Sistem', category: 'Manajemen Sistem', lastUpdated: 'Harian' },
            { id: 'archive-documents', title: 'Dokumen Diarsipkan', category: 'Pengarsipan Data', lastUpdated: 'Lama' },
            { id: 'archive-media', title: 'Media Diarsipkan', category: 'Pengarsipan Data', lastUpdated: 'Lama' },
            { id: 'archive-financial', title: 'Keuangan Diarsipkan', category: 'Pengarsipan Data', lastUpdated: 'Lama' },
            // Start of Setting Optimization Search Items
            { id: 'setting-optimization-general', title: 'Pengaturan Umum', category: 'Setting Optimization', lastUpdated: 'Baru saja' },
            { id: 'setting-optimization-performance', title: 'Penyesuaian Kinerja', category: 'Setting Optimization', lastUpdated: 'Hari ini' },
            { id: 'setting-optimization-notifications', title: 'Preferensi Notifikasi', category: 'Setting Optimization', lastUpdated: 'Kemarin' },
            // End of Setting Optimization Search Items
            { id: 'locating-strategies', title: 'Strategi Penempatan', category: 'Configuration', lastUpdated: 'Terbaru' },
            { id: 'locating-rule', title: 'Aturan Penempatan', category: 'Configuration', lastUpdated: 'Terbaru' },
        ];

        let currentCategory = 'dashboard';
        let activeFilters = [];
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        const parentMapping = {
            'yard-vehicles': 'yard-management', 'yard-equipment': 'yard-management', 'yard-personnel': 'yard-management',
            'receiving-deliveries': 'receiving', 'receiving-returns': 'receiving', 'receiving-vendors': 'receiving',
            'order-new': 'order', 'order-pending': 'order', 'order-history': 'order',
            'work-tasks': 'work', 'work-schedule': 'work', 'work-teams': 'work',
            'cross-app-integrations': 'cross-application', 'cross-app-data-sync': 'cross-application', 'cross-app-api': 'cross-application',
            'yard': 'inventory', 'warehouse': 'inventory', 'storage': 'inventory',
            'performance-kpis': 'performance', 'performance-analytics': 'performance', 'performance-goals': 'performance',
            'configuration-warehouse': 'configuration', 'configuration-zone': 'configuration', 'configuration-location-type': 'configuration',
            'system-users': 'system', 'system-logs': 'system', 'system-backup': 'system',
            // Start of Setting Optimization Parent Mapping
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            // End of Setting Optimization Parent Mapping
            'locating-strategies': 'configuration',
            'locating-rule': 'configuration',
        };

        window.toggleChildren = function(category) {
            const childrenDiv = document.getElementById(`${category}-children`);
            const arrowIcon = document.getElementById(`${category}-arrow`);
            
            if (childrenDiv && arrowIcon) {
                childrenDiv.classList.toggle('hidden');
                arrowIcon.classList.toggle('rotate-90');
                arrowIcon.classList.toggle('rotate-0');
            }

            if (!childrenDiv.classList.contains('hidden') && contentData[category] && contentData[category].full) {
                selectCategory(category);
            }
        }

        window.selectCategory = function(category) {
            // Hapus status aktif dari semua item sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active-sidebar-item', 'bg-wise-light-gray');
            });
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                item.classList.add('text-wise-gray');
            });

            // Hapus border kiri dari semua sidebar children
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('border-l-2', 'border-wise-primary');
            });


            // Tambahkan status aktif ke item yang dipilih
            const selectedMainDashboardItem = document.getElementById('sidebar-dashboard-main');
            const selectedCollapsibleGroup = document.getElementById(`sidebar-${category}`);

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
                        const parentSidebarItem = document.getElementById(`sidebar-${parentCategory}`);
                        if (parentSidebarItem) {
                            parentSidebarItem.classList.add('active-sidebar-item', 'bg-wise-light-gray');
                        }
                        const parentChildrenDiv = document.getElementById(`${parentCategory}-children`);
                        const parentArrowIcon = document.getElementById(`${parentCategory}-arrow`);
                        if (parentChildrenDiv && parentChildrenDiv.classList.contains('hidden')) {
                            parentChildrenDiv.classList.remove('hidden');
                            if (parentArrowIcon) {
                                parentArrowIcon.classList.remove('rotate-0');
                                parentArrowIcon.classList.add('rotate-90');
                            }
                        }
                    }
                }
            }
            
            currentCategory = category;
            const content = contentData[category];
            const defaultContentArea = document.getElementById('default-content-area');
            const searchOverlay = document.getElementById('search-overlay');

            searchOverlay.classList.add('hidden');

            if (content && content.full) {
                defaultContentArea.innerHTML = content.full;
                defaultContentArea.classList.remove('hidden');
            } else if (content && content.detail) {
                defaultContentArea.innerHTML = content.detail;
                defaultContentArea.classList.remove('hidden');
            } else {
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konten untuk ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">Belum ada konten spesifik untuk kategori ini.</p>`;
                defaultContentArea.classList.remove('hidden');
            }
            
            // Penangan khusus untuk kategori konfigurasi untuk merender form/daftar
            if (category === 'configuration-warehouse') {
                renderWarehouseList();
                initializeTabButtons('warehouse-form-modal');
                activateTab('warehouse-address', 'warehouse-form-modal');
            } else if (category === 'configuration-zone') {
                renderZoneList();
                initializeTabButtons('zone-form-modal');
                activateTab('general-zone', 'zone-form-modal'); // Asumsi tab default untuk zona
            } else if (category === 'configuration-location-type') {
                renderLocationTypeList();
                initializeTabButtons('location-type-form-modal');
                activateTab('general-location', 'location-type-form-modal');
            } else if (category === 'locating-strategies') {
                renderLocatingStrategyList();
                initializeTabButtons('locating-strategy-form-modal');
                activateTab('general-strategy', 'locating-strategy-form-modal'); // Asumsi tab default untuk strategi
            } else if (category === 'locating-rule') {
                renderLocatingRuleList();
                initializeTabButtons('locating-rule-form-modal');
                activateTab('general-rule', 'locating-rule-form-modal'); // Asumsi tab default untuk aturan
                // Panggil checkLocatingRuleFormValidity untuk memastikan status awal yang benar
                checkLocatingRuleFormValidity();
            }

            // Tutup sidebar di perangkat seluler setelah pemilihan
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        }

        // Fungsi pencarian utama (tanpa debouncing)
        window.handleSearch = function(query) {
            const searchOverlay = document.getElementById('search-overlay');
            const overlaySearchInput = document.getElementById('overlay-search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');

            if (query.length > 0) {
                searchOverlay.classList.remove('hidden');
                overlaySearchInput.value = query;
                performSearch(query, 'overlay');
                searchHistoryDropdown.classList.add('hidden');
            } else {
                searchOverlay.classList.add('hidden');
                selectCategory(currentCategory);
                showSearchHistory();
            }
        }

        // Fungsi pencarian overlay (tanpa debouncing)
        window.performSearch = function(query, source) {
            const resultsPanel = source === 'overlay' ? document.getElementById('overlay-search-results-list-panel') : document.getElementById('search-results-content');
            const detailPanel = source === 'overlay' ? document.getElementById('overlay-detail-content-panel') : null;
            const filtersContainer = source === 'overlay' ? document.getElementById('overlay-search-filters') : document.getElementById('search-filters');

            document.getElementById('overlay-filter-articles').classList.add('hidden');
            document.getElementById('overlay-filter-photography').classList.add('hidden');
            document.getElementById('filter-articles').classList.add('hidden');
            document.getElementById('filter-photography').classList.add('hidden');


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

                resultsPanel.innerHTML = ''; // Hapus hasil sebelumnya

                if (filteredResults.length > 0) {
                    if (filteredResults.some(item => item.category.toLowerCase().includes('artikel') || item.title.toLowerCase().includes('artikel'))) {
                        document.getElementById(`${source}-filter-articles`).classList.remove('hidden');
                    }
                    if (filteredResults.some(item => item.category.toLowerCase().includes('fotografi') || item.title.toLowerCase().includes('foto'))) {
                        document.getElementById(`${source}-filter-photography`).classList.remove('hidden');
                    }
                    
                    filteredResults.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.classList.add('py-2', 'px-3', 'bg-wise-light-gray', 'rounded-lg', 'shadow-sm', 'cursor-pointer', 'hover:bg-gray-100', 'mb-2', 'transition-all-smooth');
                        resultItem.innerHTML = `
                            <h4 class="text-wise-dark-gray font-medium text-sm">${item.title}</h4>
                            <p class="text-wise-gray text-xs">Kategori: ${item.category} | Terakhir Diperbarui: ${item.lastUpdated}</p>
                        `;
                        resultItem.onmouseenter = (event) => showPreview(item.id, event); // Tampilkan pratinjau saat hover
                        resultItem.onclick = () => selectSearchResult(item.id, item.title, query);
                        resultsPanel.appendChild(resultItem);
                    });
                } else {
                    resultsPanel.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada hasil ditemukan.</p>`;
                    filtersContainer.classList.add('hidden'); // Sembunyikan filter jika tidak ada hasil
                }
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di sebelah kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
            } else {
                resultsPanel.innerHTML = ''; // Hapus hasil jika query kosong
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Arahkan kursor ke item di sebelah kiri untuk pratinjau, atau klik untuk melihat detail.</p>`;
                }
                filtersContainer.classList.add('hidden'); // Sembunyikan filter jika query kosong
            }
        }

        window.showPreview = function(id) {
            const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
            const content = contentData[id];

            if (content && (content.detail || content.full)) {
                overlayDetailContentPanel.innerHTML = `
                    ${content.detail || content.full}
                    <button class="mt-4 px-4 py-2 bg-white text-wise-dark-gray border border-wise-border rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-md active-press transform" onclick="displayContentInMainDashboard('${id}')">
                        Tampilkan Halaman
                    </button>
                `;
            } else {
                overlayDetailContentPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Tidak ada pratinjau tersedia untuk item ini.</p>`;
            }
        }

        window.selectSearchResult = function(id, title, query) {
            addSearchHistory(query);
            displayContentInMainDashboard(id);
        }

        window.displayContentInMainDashboard = function(id) {
            const content = contentData[id];
            const defaultContentArea = document.getElementById('default-content-area');
            
            if (content && content.full) {
                defaultContentArea.innerHTML = content.full;
            } else if (content && content.detail) {
                defaultContentArea.innerHTML = content.detail;
            } else {
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Konten Lengkap untuk ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">Tidak ada konten lengkap tersedia.</p>`;
            }
            
            closeSearchOverlay();
            selectCategory(id); // Juga sorot kategori yang dipilih di sidebar
        }

        window.addOverlayFilter = function(filterName) {
            if (!activeFilters.includes(filterName.toLowerCase())) {
                activeFilters.push(filterName.toLowerCase());
                document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.remove('hidden');
                performSearch(document.getElementById('overlay-search-input').value, 'overlay');
            }
        }

        window.removeOverlayFilter = function(filterName) {
            activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
            document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.add('hidden');
            performSearch(document.getElementById('overlay-search-input').value, 'overlay');
        }

        window.removeAllOverlayFilters = function() {
            activeFilters = [];
            document.getElementById('overlay-filter-articles').classList.add('hidden');
            document.getElementById('overlay-filter-photography').classList.add('hidden');
            document.getElementById('overlay-search-input').value = '';
            performSearch('', 'overlay');
        }
        
        window.closeSearchOverlay = function() {
            document.getElementById('search-overlay').classList.add('hidden');
            document.getElementById('search-input').value = '';
            document.getElementById('overlay-search-input').value = '';
            activeFilters = [];
            document.getElementById('overlay-search-filters').classList.add('hidden');
            document.getElementById('filter-articles').classList.add('hidden');
            document.getElementById('filter-photography').classList.add('hidden');
            document.getElementById('search-history-dropdown').classList.add('hidden');
            selectCategory(currentCategory); // Pilih ulang kategori saat ini untuk menyegarkan konten
        }

        window.toggleUserDropdown = function() {
            const userDropdown = document.getElementById('user-dropdown');
            userDropdown.classList.toggle('hidden');
        }

        // Tutup dropdown saat mengklik di luar
        document.addEventListener('click', function(event) {
            const userIconContainer = document.querySelector('header .relative.flex.items-center');
            const userDropdown = document.getElementById('user-dropdown');
            const searchInput = document.getElementById('search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');

            if (userIconContainer && userDropdown && !userIconContainer.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
            if (!searchInput.contains(event.target) && !searchHistoryDropdown.contains(event.target)) {
                searchHistoryDropdown.classList.add('hidden');
            }
        });

        window.handleLogout = async function() {
            await showCustomAlert('Log Out', 'Kamu udah berhasil keluar.');
            window.location.href = 'login.html';
        }

        window.navigateToProfile = function() {
            window.location.href = 'profile.html';
        }

        function addSearchHistory(query) {
            if (query && !searchHistory.includes(query)) {
                searchHistory.unshift(query); // Tambahkan ke awal
                searchHistory = searchHistory.slice(0, 5); // Hanya simpan 5 terakhir
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            }
        }

        window.showSearchHistory = function() {
            const historyDropdown = document.getElementById('search-history-dropdown');
            const historyContent = document.getElementById('search-history-content');
            
            historyContent.innerHTML = ''; // Hapus riwayat sebelumnya

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
                clearAllButton.innerHTML = `<button class="text-wise-gray hover:underline text-xs" onclick="clearAllSearchHistory()">Hapus Semua Riwayat</button>`;
                historyContent.appendChild(clearAllButton);

                historyDropdown.classList.remove('hidden');
            } else {
                historyContent.innerHTML = `<p class="p-3 text-wise-gray text-sm">Tidak ada riwayat pencarian.</p>`;
                historyDropdown.classList.remove('hidden');
            }
        }

        window.applySearchHistory = function(query) {
            document.getElementById('search-input').value = query;
            handleSearch(query);
            document.getElementById('search-history-dropdown').classList.add('hidden');
        }

        window.removeSearchHistory = function(index) {
            searchHistory.splice(index, 1); // Hapus item pada indeks
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            showSearchHistory(); // Segarkan tampilan riwayat
        }

        window.clearAllSearchHistory = function() {
            searchHistory = [];
            localStorage.removeItem('searchHistory');
            showSearchHistory(); // Segarkan tampilan riwayat
        }

        // Data dummy untuk bagian konfigurasi (Warehouses, Zones, Location Types)
        let warehouses = JSON.parse(localStorage.getItem('warehouses')) || [
            { id: 'DCB', description: 'DC BUAH BATU', active: true, address1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL', address2: '', address3: '', city: 'Bandung', state: 'Jawa Barat', postalCode: '40266', country: 'Indonesia', faxNumber: '(022)-88884377', attentionTo: '', phoneNumber: '(022)-7540576 / 77', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: 'DC BUAH BATU', returnAddress1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL, BANDUNG.', returnAddress2: '', returnAddress3: '', returnCity: 'Bandung', returnState: 'Jawa Barat', returnPostalCode: '40266', returnCountry: 'Indonesia', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '\\\\scale\\fs\\vls\\Report\\DCB', userDefinedField1: 'PT. AKUR PRATAMA', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '8.00000', userDefinedField8: '0.00000', users: ['Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284', 'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301', 'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115', 'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'] },
            { id: 'DCC', description: 'DC CIKONENG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCE', description: 'DC EXTENTION', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCF', description: 'DC BUAH BATU FRESH', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCJ', description: 'DC JAKARTA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCK', description: 'DC KAYU MANIS', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCL', description: 'DC LEUWIPANJANG', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCM', description: 'DC MOCHAMAD TOHA', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCP', description: 'DC PELABUHAN RATU', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCS', description: 'DC SUMBER', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCT', description: 'DC TEGAL', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'DCY', description: 'DC YOMIMART', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
            { id: 'GBG', description: 'DC GEDE BAGE', active: true, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', attentionTo: '', phoneNumber: '', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: '', returnAddress1: '', returnAddress2: '', returnAddress3: '', returnCity: '', returnState: '', postalCode: '', returnCountry: '', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '', userDefinedField1: '', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '', userDefinedField8: '', users: [] },
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

        let locatingStrategies = JSON.parse(localStorage.getItem('locatingStrategies')) || [
            { id: 'LOCSTRAT_DEFAULT', identifier: 'DEFAULT', recordType: 'LOCSTRAT', description: 'Default Locating Strategy', inactive: false, systemCreated: true, lastUpdated: '01-01-2023 10:00:00 AM User: SYSTEM' },
            { id: 'LOCSTRAT_FAST_MOVERS', identifier: 'FAST_MOVERS', recordType: 'LOCSTRAT', description: 'Strategy for fast moving items', inactive: false, systemCreated: false, lastUpdated: '01-01-2023 10:00:00 AM User: Admin' },
            { id: 'LOCSTRAT_OVERSTOCK', identifier: 'OVERSTOCK', recordType: 'LOCSTRAT', description: 'Strategy for overstock items', inactive: true, systemCreated: false, lastUpdated: '01-01-2023 10:00:00 AM User: Admin' },
        ];

        let locatingRules = JSON.parse(localStorage.getItem('locatingRules')) || [
            {
                id: 'LOC_RULE_A',
                ruleName: 'LOC_RULE_A',
                description: 'Rule for small items',
                delayedLocating: false,
                inactive: false,
                detailRecords: [
                    { sequence: 1, field: 'Item Size', operator: '<', value: 'Small' },
                    { sequence: 2, field: 'Zone Type', operator: '=', value: 'PICKING' }
                ],
                lastUpdated: '01-01-2023 11:00:00 AM User: SYSTEM'
            },
            {
                id: 'LOC_RULE_B',
                ruleName: 'LOC_RULE_B',
                description: 'Second Locating Rule',
                delayedLocating: true,
                inactive: false,
                detailRecords: [
                    { sequence: 1, field: 'Weight', operator: '>', value: '50KG' },
                    { sequence: 2, field: 'Location Type', operator: '=', value: 'PALLET' }
                ],
                lastUpdated: '01-01-2023 11:00:00 AM User: Admin'
            },
        ];

        const allUsers = [
            'Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284',
            'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301',
            'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115',
            'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'
        ];


        let currentWarehouseId = null;
        let currentZoneId = null;
        let currentLocationTypeId = null;
        let currentLocatingStrategyId = null;
        let currentLocatingRuleId = null;

        // Fungsi utilitas untuk penyimpanan data
        function saveWarehouses() {
            localStorage.setItem('warehouses', JSON.stringify(warehouses));
        }

        function saveZones() {
            localStorage.setItem('zones', JSON.stringify(zones));
        }

        function saveLocationTypes() {
            localStorage.setItem('locationTypes', JSON.stringify(locationTypes));
        }

        function saveLocatingStrategies() {
            localStorage.setItem('locatingStrategies', JSON.stringify(locatingStrategies));
        }

        function saveLocatingRules() {
            localStorage.setItem('locatingRules', JSON.stringify(locatingRules));
        }

        // Fungsi untuk merender daftar Gudang
        window.renderWarehouseList = function(filterQuery = '') {
            const container = document.getElementById('warehouse-list-container');
            container.innerHTML = '';

            const filteredWarehouses = warehouses.filter(wh =>
                wh.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
                wh.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredWarehouses.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">Tidak ada gudang ditemukan.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Warehouse</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Active</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="warehouse-table-body">
                    </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('warehouse-table-body');
            filteredWarehouses.forEach(wh => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${wh.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${wh.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${wh.active ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showWarehouseForm('edit', '${wh.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteWarehouse('${wh.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        }

        window.showWarehouseForm = function(mode, id = null) {
            const modal = document.getElementById('warehouse-form-modal');
            const title = document.getElementById('warehouse-form-title');
            const form = document.getElementById('warehouse-form');
            form.reset();

            const tabButtons = form.querySelectorAll('.tab-button');
            tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-wise-primary', 'text-wise-primary'));
            const firstTabButton = tabButtons[0];
            if (firstTabButton) {
                firstTabButton.classList.add('active-tab', 'border-wise-primary', 'text-wise-primary');
            }
            const tabContents = form.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById('warehouse-address').classList.remove('hidden');

            document.getElementById('same-as-warehouse-address-return').checked = false;
            toggleReturnAddressFields();

            currentWarehouseId = id;

            if (mode === 'create') {
                title.textContent = 'Buat Gudang Baru';
                document.getElementById('warehouse-submit-button').textContent = 'Buat';
                document.getElementById('warehouse-name').disabled = false;
                document.getElementById('warehouse-inactive').checked = false;
                renderUserCheckboxes([]);
            } else {
                title.textContent = 'Edit Gudang';
                document.getElementById('warehouse-submit-button').textContent = 'Simpan Perubahan';
                document.getElementById('warehouse-name').disabled = true;

                const warehouseToEdit = warehouses.find(wh => wh.id === id);
                if (warehouseToEdit) {
                    document.getElementById('warehouse-name').value = warehouseToEdit.id;
                    document.getElementById('warehouse-description').value = warehouseToEdit.description;
                    document.getElementById('warehouse-inactive').checked = !warehouseToEdit.active;

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

                    document.getElementById('same-as-warehouse-address-return').checked = warehouseToEdit.returnAddressSame;
                    toggleReturnAddressFields();
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
                    document.getElementById('return-email-address').value = warehouseToEdit.emailAddress;
                    document.getElementById('return-ucc-ean-number').value = warehouseToEdit.returnUccEanNumber;

                    document.getElementById('slotting-move-file-directory').value = warehouseToEdit.slottingMoveFileDirectory;
                    document.getElementById('default-location-for-unslotted-items').value = warehouseToEdit.defaultLocationForUnslottedItems;
                    document.getElementById('rendered-document-pdf-file-directory').value = warehouseToEdit.renderedDocumentPdfFileDirectory;

                    document.getElementById('user-defined-field1').value = warehouseToEdit.userDefinedField1;
                    document.getElementById('user-defined-field2').value = warehouseToEdit.userDefinedField2;
                    document.getElementById('user-defined-field3').value = warehouseToEdit.userDefinedField3;
                    document.getElementById('user-defined-field4').value = warehouseToEdit.userDefinedField4;
                    document.getElementById('user-defined-field5').value = warehouseToEdit.userDefinedField5;
                    document.getElementById('user-defined-field6').value = warehouseToEdit.userDefinedField6;
                    document.getElementById('user-defined-field7').value = warehouseToEdit.userDefinedField7;
                    document.getElementById('user-defined-field8').value = warehouseToEdit.userDefinedField8;

                    renderUserCheckboxes(warehouseToEdit.users || []);
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        window.closeWarehouseForm = function() {
            document.getElementById('warehouse-form-modal').classList.add('hidden');
            document.getElementById('warehouse-form-modal').classList.remove('flex');
            currentWarehouseId = null;
        }

        window.handleWarehouseSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
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
                    await showCustomAlert('Error', 'Warehouse ID sudah ada!');
                    return;
                }
                newWarehouse.id = warehouseId; // Set ID untuk gudang baru
                warehouses.push(newWarehouse);
            }
            saveWarehouses();
            renderWarehouseList();
            closeWarehouseForm();
        }

        window.deleteWarehouse = async function(id) {
            const confirmed = await showCustomConfirm('Konfirmasi Hapus', `Kamu yakin mau hapus gudang ${id} ini?`);
            if (confirmed) {
                warehouses = warehouses.filter(wh => wh.id !== id);
                saveWarehouses();
                renderWarehouseList();
            }
        }

        window.filterWarehouseList = function(query) {
            renderWarehouseList(query);
        }

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
        }

        window.renderUserCheckboxes = function(selectedUsers) {
            const userListContainer = document.getElementById('user-checkbox-list');
            userListContainer.innerHTML = '';

            allUsers.forEach(user => {
                const div = document.createElement('div');
                div.classList.add('flex', 'items-center');
                div.innerHTML = `
                    <input type="checkbox" id="user-${user}" value="${user}" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${selectedUsers.includes(user) ? 'checked' : ''}>
                    <label for="user-${user}" class="ml-2 text-sm text-wise-dark-gray">${user}</label>
                `;
                userListContainer.appendChild(div);
            });
            document.getElementById('check-all-users').checked = (selectedUsers.length === allUsers.length && allUsers.length > 0);
        }

        window.toggleAllUsers = function() {
            const checkAllCheckbox = document.getElementById('check-all-users');
            const userCheckboxes = document.querySelectorAll('#user-checkbox-list input[type="checkbox"]');
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = checkAllCheckbox.checked;
            });
        }

        window.renderZoneList = function(filterQuery = '') {
            const container = document.getElementById('zone-list-container');
            container.innerHTML = '';

            const filteredZones = zones.filter(zone =>
                zone.identifier.toLowerCase().includes(filterQuery.toLowerCase()) ||
                zone.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredZones.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">Tidak ada zona ditemukan.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Identifier</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">System created</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Active</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="zone-table-body">
                    </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('zone-table-body');
            filteredZones.forEach(zone => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${zone.identifier}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${zone.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${zone.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${zone.active ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showZoneForm('edit', '${zone.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteZone('${zone.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        }

        window.showZoneForm = function(mode, id = null) {
            const modal = document.getElementById('zone-form-modal');
            const title = document.getElementById('zone-form-title');
            const form = document.getElementById('zone-form');
            form.reset(); 
            currentZoneId = id;

            if (mode === 'create') {
                title.textContent = 'Buat Zona Baru';
                document.getElementById('zone-submit-button').textContent = 'Buat';
                document.getElementById('zone-identifier').disabled = false;
                document.getElementById('zone-inactive').checked = false;
                document.getElementById('zone-system-created').checked = false;
            } else {
                title.textContent = 'Edit Zona';
                document.getElementById('zone-submit-button').textContent = 'Simpan Perubahan';
                document.getElementById('zone-identifier').disabled = true;

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
        }

        window.closeZoneForm = function() {
            document.getElementById('zone-form-modal').classList.add('hidden');
            document.getElementById('zone-form-modal').classList.remove('flex');
            currentZoneId = null;
        }

        window.handleZoneSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
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
                    await showCustomAlert('Error', 'Zone Identifier sudah ada!');
                    return;
                }
                newZone.id = identifier;
                zones.push(newZone);
            }
            saveZones();
            renderZoneList();
            closeZoneForm();
        }

        window.deleteZone = async function(id) {
            const confirmed = await showCustomConfirm('Konfirmasi Hapus', `Kamu yakin mau hapus zona ${id} ini?`);
            if (confirmed) {
                zones = zones.filter(z => z.id !== id);
                saveZones();
                renderZoneList();
            }
        }

        window.filterZoneList = function(query) {
            renderZoneList(query);
        }

        window.renderLocationTypeList = function(filterQuery = '') {
            const container = document.getElementById('location-type-list-container');
            container.innerHTML = '';

            const filteredLocationTypes = locationTypes.filter(lt =>
                lt.locationType.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredLocationTypes.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">Tidak ada tipe lokasi ditemukan.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Location type</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Length</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Width</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Height</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Dimension um</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Maximum weight</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Weight um</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Active</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="location-type-table-body">
                    </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('location-type-table-body');
            filteredLocationTypes.forEach(lt => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${lt.locationType}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.length.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.width.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.height.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.dimensionUM}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.maximumWeight.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.weightUM}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${lt.active ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showLocationTypeForm('edit', '${lt.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteLocationType('${lt.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        }

        window.showLocationTypeForm = function(mode, id = null) {
            const modal = document.getElementById('location-type-form-modal');
            const title = document.getElementById('location-type-form-title');
            const form = document.getElementById('location-type-form');
            form.reset();
            
            const tabButtons = form.querySelectorAll('.tab-button');
            tabButtons.forEach(btn => btn.classList.remove('active-tab', 'border-wise-primary', 'text-wise-primary'));
            const firstTabButton = tabButtons[0];
            if (firstTabButton) {
                firstTabButton.classList.add('active-tab', 'border-wise-primary', 'text-wise-primary');
            }
            const tabContents = form.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById('general-location').classList.remove('hidden');


            currentLocationTypeId = id;

            if (mode === 'create') {
                title.textContent = 'Buat Tipe Lokasi Baru';
                document.getElementById('location-type-submit-button').textContent = 'Buat';
                document.getElementById('location-type-name').disabled = false;
                document.getElementById('location-type-inactive').checked = false;
            } else {
                title.textContent = 'Edit Tipe Lokasi';
                document.getElementById('location-type-submit-button').textContent = 'Simpan Perubahan';
                document.getElementById('location-type-name').disabled = true;

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
        }

        window.closeLocationTypeForm = function() {
            document.getElementById('location-type-form-modal').classList.add('hidden');
            document.getElementById('location-type-form-modal').classList.remove('flex');
            currentLocationTypeId = null;
        }

        window.handleLocationTypeSubmit = async function(event) {
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
                id: currentLocationTypeId || locationTypeName,
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
                const index = locationTypes.findIndex(lt => lt.id === currentLocationTypeId);
                if (index !== -1) {
                    locationTypes[index] = { ...locationTypes[index], ...newLocationType };
                }
            } else {
                if (locationTypes.some(lt => lt.locationType === locationTypeName)) {
                    await showCustomAlert('Error', 'Location Type name sudah ada!');
                    return;
                }
                newLocationType.id = locationTypeName;
                locationTypes.push(newLocationType);
            }
            saveLocationTypes();
            renderLocationTypeList();
            closeLocationTypeForm();
        }

        window.deleteLocationType = async function(id) {
            const confirmed = await showCustomConfirm('Konfirmasi Hapus', `Kamu yakin mau hapus tipe lokasi ${id} ini?`);
            if (confirmed) {
                locationTypes = locationTypes.filter(lt => lt.id !== id);
                saveLocationTypes();
                renderLocationTypeList();
            }
        }

        window.filterLocationTypeList = function(query) {
            renderLocationTypeList(query);
        }

        // Fungsi Strategi Penempatan
        window.renderLocatingStrategyList = function(filterQuery = '') {
            const container = document.getElementById('locating-strategy-list-container');
            container.innerHTML = '';

            const filteredStrategies = locatingStrategies.filter(strategy => {
                // Akses id atau identifier dengan aman untuk filtering
                const strategyIdOrIdentifier = strategy.id || strategy.identifier;
                return (
                    strategyIdOrIdentifier.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    strategy.description.toLowerCase().includes(filterQuery.toLowerCase())
                );
            });

            if (filteredStrategies.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">Tidak ada strategi penempatan ditemukan.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Identifier</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Record Type</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">System Created</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Inactive</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="locating-strategy-table-body">
                </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('locating-strategy-table-body');
            filteredStrategies.forEach(strategy => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${strategy.identifier}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${strategy.recordType}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${strategy.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${strategy.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${strategy.inactive ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showLocatingStrategyForm('edit', '${strategy.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteLocatingStrategy('${strategy.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        }

        window.showLocatingStrategyForm = function(mode, id = null) {
            const modal = document.getElementById('locating-strategy-form-modal');
            const title = document.getElementById('locating-strategy-form-title');
            const form = document.getElementById('locating-strategy-form');
            form.reset();

            currentLocatingStrategyId = id;

            if (mode === 'create') {
                title.textContent = 'Buat Strategi Penempatan Baru';
                document.getElementById('locating-strategy-submit-button').textContent = 'Buat';
                document.getElementById('locating-strategy-identifier').disabled = false;
                document.getElementById('locating-strategy-record-type').value = 'LOCSTRAT'; // Nilai default
                document.getElementById('locating-strategy-inactive').checked = false;
                document.getElementById('locating-strategy-system-created').checked = false; // Default ke false untuk yang baru
            } else {
                title.textContent = 'Edit Strategi Penempatan';
                document.getElementById('locating-strategy-submit-button').textContent = 'Simpan Perubahan';
                document.getElementById('locating-strategy-identifier').disabled = true;

                const strategyToEdit = locatingStrategies.find(s => s.id === id);
                if (strategyToEdit) {
                    document.getElementById('locating-strategy-identifier').value = strategyToEdit.identifier;
                    document.getElementById('locating-strategy-record-type').value = strategyToEdit.recordType;
                    document.getElementById('locating-strategy-description').value = strategyToEdit.description;
                    document.getElementById('locating-strategy-inactive').checked = strategyToEdit.inactive;
                    document.getElementById('locating-strategy-system-created').checked = strategyToEdit.systemCreated;
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        window.closeLocatingStrategyForm = function() {
            document.getElementById('locating-strategy-form-modal').classList.add('hidden');
            document.getElementById('locating-strategy-form-modal').classList.remove('flex');
            currentLocatingStrategyId = null;
        }

        window.handleLocatingStrategySubmit = async function(event) {
            event.preventDefault();
            const identifier = document.getElementById('locating-strategy-identifier').value;
            const recordType = document.getElementById('locating-strategy-record-type').value;
            const description = document.getElementById('locating-strategy-description').value;
            const inactive = document.getElementById('locating-strategy-inactive').checked;
            const systemCreated = document.getElementById('locating-strategy-system-created').checked;

            const newStrategy = {
                id: currentLocatingStrategyId || identifier, // Pastikan ID selalu diatur
                identifier,
                recordType,
                description,
                inactive,
                systemCreated,
                lastUpdated: `Now User: ${document.getElementById('username-display').textContent}`
            };

            if (currentLocatingStrategyId) {
                const index = locatingStrategies.findIndex(s => s.id === currentLocatingStrategyId);
                if (index !== -1) {
                    locatingStrategies[index] = { ...locatingStrategies[index], ...newStrategy };
                }
            } else {
                if (locatingStrategies.some(s => s.identifier === identifier)) {
                    await showCustomAlert('Error', 'Strategy Identifier sudah ada!');
                    return;
                }
                newStrategy.id = identifier; // Gunakan identifier sebagai ID untuk entri baru
                locatingStrategies.push(newStrategy);
            }
            saveLocatingStrategies();
            renderLocatingStrategyList();
            closeLocatingStrategyForm();
        }

        window.deleteLocatingStrategy = async function(id) {
            const confirmed = await showCustomConfirm('Konfirmasi Hapus', `Kamu yakin mau hapus strategi penempatan ${id} ini?`);
            if (confirmed) {
                locatingStrategies = locatingStrategies.filter(s => s.id !== id);
                saveLocatingStrategies();
                renderLocatingStrategyList();
            }
        }

        window.filterLocatingStrategyList = function(query) {
            renderLocatingStrategyList(query);
        }

        // Fungsi Aturan Penempatan
        window.renderLocatingRuleList = function(filterQuery = '') {
            const container = document.getElementById('locating-rule-list-container');
            container.innerHTML = '';

            const filteredRules = locatingRules.filter(rule =>
                rule.ruleName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                rule.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredRules.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">Tidak ada aturan penempatan ditemukan.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Rule Name</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Delayed Locating</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Inactive</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="locating-rule-table-body">
                </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('locating-rule-table-body');
            filteredRules.forEach(rule => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${rule.ruleName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${rule.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${rule.delayedLocating ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${rule.inactive ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showLocatingRuleForm('edit', '${rule.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteLocatingRule('${rule.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        }

        window.showLocatingRuleForm = function(mode, id = null) {
            const modal = document.getElementById('locating-rule-form-modal');
            const title = document.getElementById('locating-rule-form-title');
            const form = document.getElementById('locating-rule-form');
            form.reset();

            currentLocatingRuleId = id;

            const detailRecordsContainer = document.getElementById('locating-rule-detail-records-container');
            const detailRecordsPlaceholder = document.getElementById('detail-records-placeholder');
            const addDetailRecordBtn = document.getElementById('add-detail-record-btn');
            const detailRecordsList = document.getElementById('detail-records-list');

            detailRecordsList.innerHTML = ''; // Hapus detail record yang ada

            // Event listener untuk rule name dan description ditambahkan sekali di DOMContentLoaded
            // Jadi tidak perlu ditambahkan atau dihapus di sini lagi.

            if (mode === 'create') {
                title.textContent = 'Buat Aturan Penempatan Baru';
                document.getElementById('locating-rule-submit-button').textContent = 'Buat';
                document.getElementById('locating-rule-name').disabled = false;
                document.getElementById('locating-rule-delayed-locating').checked = false;
                document.getElementById('locating-rule-inactive').checked = false;
                
                detailRecordsPlaceholder.classList.remove('hidden');
                detailRecordsContainer.classList.add('pointer-events-none', 'opacity-50'); // Nonaktifkan secara visual
                addDetailRecordBtn.disabled = true;

            } else {
                title.textContent = 'Edit Aturan Penempatan';
                document.getElementById('locating-rule-submit-button').textContent = 'Simpan Perubahan';
                document.getElementById('locating-rule-name').disabled = true;

                const ruleToEdit = locatingRules.find(r => r.id === id);
                if (ruleToEdit) {
                    document.getElementById('locating-rule-name').value = ruleToEdit.ruleName;
                    document.getElementById('locating-rule-description').value = ruleToEdit.description;
                    document.getElementById('locating-rule-delayed-locating').checked = ruleToEdit.delayedLocating;
                    document.getElementById('locating-rule-inactive').checked = ruleToEdit.inactive;

                    detailRecordsPlaceholder.classList.add('hidden');
                    detailRecordsContainer.classList.remove('pointer-events-none', 'opacity-50'); // Aktifkan
                    addDetailRecordBtn.disabled = false;

                    ruleToEdit.detailRecords.forEach(record => addDetailRecord(record));
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            checkLocatingRuleFormValidity(); // Pengecekan awal setelah populasi form
        }

        window.closeLocatingRuleForm = function() {
            document.getElementById('locating-rule-form-modal').classList.add('hidden');
            document.getElementById('locating-rule-form-modal').classList.remove('flex');
            currentLocatingRuleId = null;
            // Tidak perlu membersihkan event listener di sini karena sudah ditambahkan sekali di DOMContentLoaded
        }

        window.checkLocatingRuleFormValidity = function() {
            const ruleName = document.getElementById('locating-rule-name').value;
            const description = document.getElementById('locating-rule-description').value;
            const detailRecordsContainer = document.getElementById('locating-rule-detail-records-container');
            const detailRecordsPlaceholder = document.getElementById('detail-records-placeholder');
            const addDetailRecordBtn = document.getElementById('add-detail-record-btn');

            if (ruleName && description) {
                detailRecordsContainer.classList.remove('pointer-events-none', 'opacity-50');
                detailRecordsPlaceholder.classList.add('hidden');
                addDetailRecordBtn.disabled = false;
            } else {
                detailRecordsContainer.classList.add('pointer-events-none', 'opacity-50');
                detailRecordsPlaceholder.classList.remove('hidden');
                addDetailRecordBtn.disabled = true;
            }
        }

        window.addDetailRecord = function(record = {}) {
            const detailRecordsList = document.getElementById('detail-records-list');
            const newRecordDiv = document.createElement('div');
            newRecordDiv.classList.add('flex', 'flex-col', 'md:flex-row', 'gap-2', 'items-center', 'p-2', 'bg-white', 'rounded-md', 'shadow-sm');
            newRecordDiv.innerHTML = `
                <input type="number" placeholder="Sequence" value="${record.sequence || ''}" class="detail-record-sequence w-20 px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                <input type="text" placeholder="Field" value="${record.field || ''}" class="detail-record-field flex-1 px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                <input type="text" placeholder="Operator" value="${record.operator || ''}" class="detail-record-operator w-24 px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                <input type="text" placeholder="Value" value="${record.value || ''}" class="detail-record-value flex-1 px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">
                <button type="button" onclick="removeDetailRecord(this)" class="px-2 py-1 bg-white text-wise-error border border-wise-border rounded-md hover:bg-red-100 transition-colors duration-200 shadow-sm text-sm active-press transform">
                    <i class="fas fa-times w-4 h-4 flex items-center justify-center"></i>
                </button>
            `;
            detailRecordsList.appendChild(newRecordDiv);
        }

        window.removeDetailRecord = function(button) {
            button.closest('div').remove();
        }

        window.handleLocatingRuleSubmit = async function(event) {
            event.preventDefault();
            const ruleName = document.getElementById('locating-rule-name').value;
            const description = document.getElementById('locating-rule-description').value;
            const delayedLocating = document.getElementById('locating-rule-delayed-locating').checked;
            const inactive = document.getElementById('locating-rule-inactive').checked;

            const detailRecords = [];
            document.querySelectorAll('#detail-records-list > div').forEach(recordDiv => {
                detailRecords.push({
                    sequence: parseInt(recordDiv.querySelector('.detail-record-sequence').value) || 0,
                    field: recordDiv.querySelector('.detail-record-field').value,
                    operator: recordDiv.querySelector('.detail-record-operator').value,
                    value: recordDiv.querySelector('.detail-record-value').value,
                });
            });

            const newRule = {
                id: currentLocatingRuleId || ruleName,
                ruleName,
                description,
                delayedLocating,
                inactive,
                detailRecords,
                lastUpdated: `Now User: ${document.getElementById('username-display').textContent}`
            };

            if (currentLocatingRuleId) {
                const index = locatingRules.findIndex(r => r.id === currentLocatingRuleId);
                if (index !== -1) {
                    locatingRules[index] = { ...locatingRules[index], ...newRule };
                }
            } else {
                if (locatingRules.some(r => r.ruleName === ruleName)) {
                    await showCustomAlert('Error', 'Locating Rule Name sudah ada!');
                    return;
                }
                newRule.id = ruleName; // Gunakan ruleName sebagai ID
                locatingRules.push(newRule);
            }
            saveLocatingRules();
            renderLocatingRuleList();
            closeLocatingRuleForm();
        }

        window.deleteLocatingRule = async function(id) {
            const confirmed = await showCustomConfirm('Konfirmasi Hapus', `Kamu yakin mau hapus aturan penempatan ${id} ini?`);
            if (confirmed) {
                locatingRules = locatingRules.filter(r => r.id !== id);
                saveLocatingRules();
                renderLocatingRuleList();
            }
        }

        window.filterLocatingRuleList = function(query) {
            renderLocatingRuleList(query);
        }


        window.initializeTabButtons = function(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const tabButtons = modal.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.onclick = () => {
                    const tabId = button.dataset.tab;
                    activateTab(tabId, modalId);
                };
            });
        }

        window.activateTab = function(tabId, modalId = null) {
            const parentElement = modalId ? document.getElementById(modalId) : document;
            
            parentElement.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            parentElement.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active-tab', 'border-wise-primary', 'text-wise-primary');
                button.classList.add('text-wise-gray', 'border-transparent');
            });

            document.getElementById(tabId).classList.remove('hidden');
            const activeTabButton = parentElement.querySelector(`.tab-button[data-tab="${tabId}"]`);
            if (activeTabButton) {
                activeTabButton.classList.add('active-tab', 'border-wise-primary', 'text-wise-primary');
                activeTabButton.classList.remove('text-wise-gray', 'border-transparent');
            }
        }

        // Fungsionalitas toggle sidebar
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            const mainContentArea = document.querySelector('main'); // Pilih area konten utama
            if (sidebar.classList.contains('-translate-x-full')) {
                mainContentArea.classList.remove('md:ml-64');
                mainContentArea.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden'); // Sembunyikan overlay
            } else {
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                if (window.innerWidth < 768) { // Hanya tampilkan overlay di perangkat seluler
                    document.getElementById('sidebar-overlay').classList.remove('hidden');
                }
            }
        });

        // Tutup sidebar saat mengklik di luar di perangkat seluler
        document.addEventListener('click', (event) => {
            if (window.innerWidth < 768 && !sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target) && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden'); // Sembunyikan overlay
            }
        });

        // Fungsi untuk menutup sidebar (digunakan oleh klik overlay)
        window.closeSidebar = function() {
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-0');
            document.getElementById('sidebar-overlay').classList.add('hidden');
        }

        // Sesuaikan sidebar saat ukuran diubah
        window.addEventListener('resize', () => {
            const mainContentArea = document.querySelector('main'); // Pilih area konten utama
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('-translate-x-full');
                mainContentArea.classList.add('md:ml-64');
                mainContentArea.classList.remove('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden'); // Sembunyikan overlay di desktop
            } else {
                sidebar.classList.add('-translate-x-full');
                mainContentArea.classList.remove('md:ml-64');
                mainContentArea.classList.add('ml-0');
                // Jangan tampilkan overlay saat ukuran diubah jika sidebar sudah tersembunyi
            }
        });

        // Pemuatan awal
        window.onload = function() {
            selectCategory('dashboard');
            
            const username = "SuperAdmin";
            document.getElementById('username-display').textContent = username;

            // Tambahkan event listener untuk input aturan penempatan sekali di sini
            const ruleNameInput = document.getElementById('locating-rule-name');
            const ruleDescriptionInput = document.getElementById('locating-rule-description');
            if (ruleNameInput && ruleDescriptionInput) {
                ruleNameInput.addEventListener('input', checkLocatingRuleFormValidity);
                ruleDescriptionInput.addEventListener('input', checkLocatingRuleFormValidity);
            }
        };
    });

})(); // Akhir dari IIFE
            