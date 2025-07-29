(function() {
    document.addEventListener('DOMContentLoaded', () => {

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

        // Dummy data for dashboard content and sub-categories
        window.contentData = {
            dashboard: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Dashboard Overview</h2>
                    <p class="text-wise-gray mb-4">Welcome to your dashboard. Here's a quick summary of your operations.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Total Orders</h3>
                            <p class="text-3xl font-bold text-wise-primary">1,250</p>
                            <p class="text-wise-gray text-sm mt-1">last 30 days</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Active Crews</h3>
                            <p class="text-3xl font-bold text-wise-info">85</p>
                            <p class="text-wise-gray text-sm mt-1">currently working</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-bold text-wise-success">$2.5M</p>
                            <p class="text-wise-gray text-sm mt-1">Total assets</p>
                        </div>
                    </div>
                    <div class="mt-8">
                        <h3 class="text-lg md:text-xl font-semibold text-wise-dark-gray mb-3">Recent Activity</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">New order for Project Alpha</h4>
                                <span class="text-wise-gray text-xs md:text-sm">5 minutes ago</span>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">Crew #123 completed task</h4>
                                <span class="text-wise-gray text-xs md:text-sm">1 hour ago</span>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 bg-wise-light-gray rounded-lg shadow-sm">
                                <h4 class="text-wise-dark-gray font-medium">Inventory update: 10 units added to Warehouse</h4>
                                <span class="text-wise-gray text-xs md:text-sm">3 hours ago</span>
                            </div>
                        </div>
                    </div>
                `,
            },
            'yard-management': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard Management</h2>
                    <p class="text-wise-gray mb-4">Manage your yard resources and equipment here. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Overview</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Total Vehicles: 50, Available: 35</li>
                            <li>Total Equipment: 120, Available: 80</li>
                        </ul>
                    </div>
                `,
            },
            'yard-vehicles': {
                full: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard - Vehicles (Full Page)</h2><p class="text-wise-gray">This is the full page view for Vehicles in the Yard. It contains a complete list of vehicles, their status, and history.</p><p class="text-wise-gray text-sm mt-2">Full vehicle details.</p>`,
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard - Vehicles</h2><p class="text-wise-gray">List of vehicles available in the yard.</p><p class="text-wise-gray text-sm mt-2">Count: 35 units</p>`,
            },
            'yard-equipment': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard - Equipment</h2><p class="text-wise-gray">List of equipment available in the yard.</p><p class="text-wise-gray text-sm mt-2">Count: 80 units</p>`,
            },
            'yard-personnel': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Yard - Personnel</h2><p class="text-wise-gray">List of personnel assigned to the yard.</p><p class="text-wise-gray text-sm mt-2">Count: 15 people</p>`,
            },
            receiving: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving Management</h2>
                    <p class="text-wise-gray mb-4">Track and manage all incoming shipments and deliveries. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Pending Receiving</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Shipment #101 - Expected: Today</li>
                            <li>Shipment #102 - Expected: Tomorrow</li>
                        </ul>
                    </div>
                `,
            },
            'receiving-deliveries': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Deliveries</h2><p class="text-wise-gray">Details of all incoming deliveries.</p><p class="text-wise-gray text-sm mt-2">Number of deliveries: 5</p>`,
            },
            'receiving-returns': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Returns</h2><p class="text-wise-gray">Details of all received returns.</p><p class="text-wise-gray text-sm mt-2">Number of returns: 2</p>`,
            },
            'receiving-vendors': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Vendors</h2><p class="text-wise-gray">List of vendors and their delivery status.</p><p class="text-wise-gray text-sm mt-2">Number of active vendors: 10</p>`,
            },
            order: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning</h2>
                    <p class="text-wise-gray mb-4">Plan and optimize your orders. Track order status, manage shipments, and forecast demand. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Pending Orders</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Shipment #X123 - Status: Awaiting Approval</li>
                            <li>Shipment #Y456 - Status: In Transit</li>
                        </ul>
                    </div>
                `,
            },
            'order-new': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - New Orders</h2><p class="text-wise-gray">List of new orders to be processed.</p><p class="text-wise-gray text-sm mt-2">New orders: 7</p>`,
            },
            'order-pending': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Pending Orders</h2><p class="text-wise-gray">List of orders that are in process or awaiting action.</p><p class="text-wise-gray text-sm mt-2">Pending orders: 12</p>`,
            },
            'order-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Order History</h2><p class="text-wise-gray">Archive of all completed orders.</p><p class="text-wise-gray text-sm mt-2">Total completed orders: 500</p>`,
            },
            shipping: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping Management</h2>
                    <p class="text-wise-gray mb-4">Kelola semua aktivitas pengiriman, mulai dari inbound, outbound, sampai manajemen kurir. Pilih sub-kategori dari sidebar.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">In Transit</h3>
                            <p class="text-2xl">42</p>
                            <p class="text-wise-gray text-sm mt-1">pengiriman sedang berjalan</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Pending Pickup</h3>
                            <p class="text-2xl">15</p>
                            <p class="text-wise-gray text-sm mt-1">menunggu dijemput kurir</p>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Delivered Today</h3>
                            <p class="text-2xl">88</p>
                            <p class="text-wise-gray text-sm mt-1">pengiriman sukses hari ini</p>
                        </div>
                    </div>
                `,
            },
            work: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work Management</h2>
                    <p class="text-wise-gray mb-4">Assign tasks, track progress, and manage your workforce efficiently. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Overview</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Tasks Completed (Today): 5</li>
                            <li>Pending Tasks: 12</li>
                        </ul>
                    </div>
                `,
            },
            'work-tasks': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Tasks</h2><p class="text-wise-gray">List of assigned tasks and their status.</p><p class="text-wise-gray text-sm mt-2">Active tasks: 8</p>`,
            },
            'work-schedule': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Schedule</h2><p class="text-wise-gray">Work schedule for all teams and individuals.</p><p class="text-wise-gray text-sm mt-2">Today's schedule: Full</p>`,
            },
            'work-teams': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Teams</h2><p class="text-wise-gray">List of work teams and their members.</p><p class="text-wise-gray text-sm mt-2">Count: 5</p>`,
            },
            'cross-application': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application Management</h2>
                    <p class="text-wise-gray mb-4">Manage integrations and data flow between different applications. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Connected Systems</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>CRM System (Active)</li>
                            <li>ERP System (Active)</li>
                        </ul>
                    </div>
                `,
            },
            'cross-app-integrations': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Integrations</h2><p class="text-wise-gray">Status and configuration of application integrations.</p><p class="text-wise-gray text-sm mt-2">Active integrations: 3</p>`,
            },
            'cross-app-data-sync': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Data Synchronization</h2><p class="text-wise-gray">Track data synchronization status between systems.</p><p class="text-wise-gray text-sm mt-2">Last sync: 10 minutes ago</p>`,
            },
            'cross-app-api': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - API Management</h2><p class="text-wise-gray">Manage API keys and access for integrations.</p><p class="text-wise-gray text-sm mt-2">Active API keys: 7</p>`,
            },
            inventory: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory Overview</h2>
                    <p class="text-wise-gray mb-4">Select an inventory location from the sidebar to view details.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Summary</h3>
                        <p class="text-wise-gray text-sm mt-2">Total Items Across All Locations: 1,500</p>
                        <p class="text-wise-gray text-sm">Available for Use: 1,200</p>
                    </div>
                `,
            },
            yard: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Yard</h2><p class="text-wise-gray">Manage inventory located in the yard.</p><p class="text-wise-gray text-sm mt-2">Item count: 150</p>`,
            },
            warehouse: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Warehouse</h2><p class="text-wise-gray">Manage inventory located in the warehouse.</p><p class="text-wise-gray text-sm mt-2">Item count: 1000</p>`,
            },
            storage: {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Storage</h2><p class="text-wise-gray">Manage long-term or overflow storage.</p><p class="text-wise-gray text-sm mt-2">Item count: 350</p>`,
            },
            performance: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management</h2>
                    <p class="text-wise-gray mb-4">Monitor and analyze performance metrics for various operations and personnel. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Key Performance Indicators (KPIs)</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>On-Time Delivery Rate: 98%</li>
                            <li>Task Completion Rate: 95%</li>
                        </ul>
                    </div>
                `,
            },
            'performance-kpis': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance - KPIs</h2><p class="text-wise-gray">View key performance metrics.</p><p class="text-wise-gray text-sm mt-2">KPIs: 5 active</p>`,
            },
            'performance-analytics': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance - Analytics</h2><p class="text-wise-gray">Analyze detailed performance data.</p><p class="text-wise-gray text-sm mt-2">Last report: Today</p>`,
            },
            'performance-goals': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance - Goals</h2><p class="text-wise-gray">Track and manage performance goals.</p><p class="text-wise-gray text-sm mt-2">Active goals: 3</p>`,
            },

            'setting-optimization': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Setting Optimization</h2>
                    <p class="text-wise-gray mb-4">Manage settings to optimize system performance and notification preferences.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Setting Overview</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Optimization Status: Active</li>
                            <li>Automatic Updates: Enabled</li>
                            <li>Email Notifications: Enabled</li>
                        </ul>
                    </div>
                `,
            },
            'setting-optimization-general': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">General Settings</h2>
                    <p class="text-wise-gray">Configure basic system settings.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="auto-update" class="flex items-center">
                                <input type="checkbox" id="auto-update" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                <span class="ml-2 text-sm text-wise-dark-gray">Enable Automatic Updates</span>
                            </label>
                        </div>
                        <div>
                            <label for="language-select" class="block text-sm font-medium text-wise-dark-gray mb-1">Language:</label>
                            <select id="language-select" class="w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                <option value="id">Indonesian</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                `,
            },
            'setting-optimization-performance': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Adjustments</h2>
                    <p class="text-wise-gray">Optimize application performance.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="cache-size" class="block text-sm font-medium text-wise-dark-gray mb-1">Cache Size (MB):</label>
                            <input type="number" id="cache-size" value="256" class="w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                        </div>
                        <div>
                            <label for="data-compression" class="flex items-center">
                                <input type="checkbox" id="data-compression" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                <span class="ml-2 text-sm text-wise-dark-gray">Enable Data Compression</span>
                            </label>
                        </div>
                    </div>
                `,
            },
            'setting-optimization-notifications': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Notification Preferences</h2>
                    <p class="text-wise-gray">Set how you receive notifications.</p>
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="email-notifications" class="flex items-center">
                                <input type="checkbox" id="email-notifications" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                <span class="ml-2 text-sm text-wise-dark-gray">Email Notifications</span>
                            </label>
                        </div>
                        <div>
                            <label for="sms-notifications" class="flex items-center">
                                <input type="checkbox" id="sms-notifications" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                <span class="ml-2 text-sm text-wise-dark-gray">SMS Notifications</span>
                            </label>
                        </div>
                    </div>
                `,
            },
            'system-management-users': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management Users</h2>
                    <p class="text-wise-gray">Kelola semua pengguna yang ada di dalam sistem.</p>
                    <p class="text-wise-gray text-sm mt-2">Total Pengguna: 5</p>
                `
            },
            'system-management-logs': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management Log</h2>
                    <p class="text-wise-gray">Kelola semua log pengguna yang ada di dalam sistem.</p>
                    <p class="text-wise-gray text-sm mt-2">Total Log Pengguna: 5</p>
                `,
            },
            'system-management-backup': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management Backup</h2>
                    <p class="text-wise-gray">Kelola cadangan sistem.</p>
                    <p class="text-wise-gray text-sm mt-2">Total Cadangan Tersedia: 5</p>
                `,
            },
            'archive': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Data Archiving</h2>
                    <p class="text-wise-gray mb-4">Kelola data yang diarsipkan di sini. Pilih sub-kategori dari sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Ringkasan Arsip</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Total Dokumen Diarsipkan: 150</li>
                            <li>Total Media Diarsipkan: 75</li>
                            <li>Total Arsip Keuangan: 40</li>
                        </ul>
                    </div>
                `,
            },
            'archive-documents': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Archive Documments</h2>
                    <p class="text-wise-gray">Lihat dan kelola semua dokumen yang diarsipkan.</p>
                    <p class="text-wise-gray text-sm mt-2">Total dokumen: 150</p>
                `,
            },
            'archive-media': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Archive Media</h2>
                    <p class="text-wise-gray">Lihat dan kelola semua file media yang diarsipkan.</p>
                    <p class="text-wise-gray text-sm mt-2">Total file media: 75</p>
                `,
            },
            'archive-financial': {
                detail: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Archive Financial</h2>
                    <p class="text-wise-gray">Lihat dan kelola semua laporan keuangan yang diarsipkan.</p>
                    <p class="text-wise-gray text-sm mt-2">Total laporan keuangan: 40</p>
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
        };

        // Dummy data for search results
        const searchItems = [
            { id: 'article a', title: 'Article A', category: 'General', lastUpdated: '2 hours ago' },
            { id: 'paragraph b', title: 'Paragraph B', category: 'Documentation', lastUpdated: '1 hour ago' },
            { id: 'method c', title: 'Method C', category: 'Technical', lastUpdated: '30 minutes ago' },
            { id: 'recent-booking', title: 'New order for Project Alpha', category: 'Orders', lastUpdated: '5 minutes ago' },
            { id: 'crew-task', title: 'Crew #123 completed task', category: 'Work', lastUpdated: '1 hour ago' },
            { id: 'inventory-update', title: 'Inventory update: 10 units added to Warehouse', category: 'Inventory', lastUpdated: '3 hours ago' },
            { id: 'vehicle-a', title: 'Heavy Loader A', category: 'Yard Management', lastUpdated: '1 day ago' },
            { id: 'delivery-x', title: 'Delivery X from Supplier A', category: 'Receiving', lastUpdated: '4 hours ago' },
            { id: 'order-123', title: 'Customer Order #123', category: 'Order Planning', lastUpdated: '1 day ago' },
            { id: 'integration-crm', title: 'CRM Integration Status', category: 'Cross Application', lastUpdated: '1 hour ago' },
            { id: 'report-q1', title: 'Q1 Performance Report', category: 'Performance', lastUpdated: '2 weeks ago' },
            { id: 'setting-notifications', title: 'Notification Preferences', category: 'Setting Optimization', lastUpdated: 'Yesterday' },
            { id: 'log-errors', title: 'Error Logs', category: 'System Management', lastUpdated: '5 minutes ago' },
            { id: 'archive-finance', title: 'Financial Report 2023', category: 'Data Archiving', lastUpdated: 'Jan 2024' },
            { id: 'yard-vehicles', title: 'Yard Vehicles', category: 'Yard Management', lastUpdated: 'Just updated' },
            { id: 'yard-equipment', title: 'Yard Equipment', category: 'Yard Management', lastUpdated: 'Just updated' },
            { id: 'yard-personnel', title: 'Yard Personnel', category: 'Yard Management', lastUpdated: 'Just updated' },
            { id: 'receiving-deliveries', title: 'Receiving Deliveries', category: 'Receiving', lastUpdated: 'Today' },
            { id: 'receiving-returns', title: 'Receiving Returns', category: 'Receiving', lastUpdated: 'Last week' },
            { id: 'receiving-vendors', title: 'Receiving Vendors', category: 'Receiving', lastUpdated: 'Monthly' },
            { id: 'order-new', title: 'New Orders', category: 'Order Planning', lastUpdated: 'Today' },
            { id: 'order-pending', title: 'Pending Orders', category: 'Order Planning', lastUpdated: 'Ongoing' },
            { id: 'order-history', title: 'Order History', category: 'Order Planning', lastUpdated: 'All time' },
            { id: 'work-tasks', title: 'Work Tasks', category: 'Work', lastUpdated: 'Active' },
            { id: 'work-schedule', title: 'Work Schedule', category: 'Work', lastUpdated: 'Daily' },
            { id: 'work-teams', title: 'Work Teams', category: 'Work', lastUpdated: 'Active' },
            { id: 'cross-app-integrations', title: 'Cross Application Integrations', category: 'Cross Application', lastUpdated: 'Active' },
            { id: 'cross-app-data-sync', title: 'Cross Application Data Sync', category: 'Cross Application', lastUpdated: 'Latest' },
            { id: 'cross-app-api', title: 'Cross Application API Management', category: 'Cross Application', lastUpdated: 'Active' },
            { id: 'performance-kpis', title: 'Performance KPIs', category: 'Performance', lastUpdated: 'Live' },
            { id: 'performance-analytics', title: 'Performance Analytics', category: 'Performance', lastUpdated: 'Daily' },
            { id: 'performance-goals', title: 'Performance Goals', category: 'Performance', lastUpdated: 'Quarterly' },
            { id: 'system-users', title: 'System Users', category: 'System Management', lastUpdated: 'Active' },
            { id: 'system-logs', title: 'System Logs', category: 'System Management', lastUpdated: 'Latest' },
            { id: 'system-backup', title: 'System Backup', category: 'System Management', lastUpdated: 'Daily' },
            { id: 'data-archiving', title: 'Data Archiving', category: 'System Management', lastUpdated: 'Weekly' },
            { id: 'archive-documents', title: 'Archived Documents', category: 'Data Archiving', lastUpdated: 'Old' },
            { id: 'archive-media', title: 'Archived Media', category: 'Data Archiving', lastUpdated: 'Old' },
            { id: 'archive-financial', title: 'Archived Financial', category: 'Data Archiving', lastUpdated: 'Old' },
            { id: 'setting-optimization-general', title: 'General Settings', category: 'Setting Optimization', lastUpdated: 'Just now' },
            { id: 'setting-optimization-performance', title: 'Performance Adjustments', category: 'Setting Optimization', lastUpdated: 'Today' },
            { id: 'setting-optimization-notifications', title: 'Notification Preferences', category: 'Setting Optimization', lastUpdated: 'Yesterday' },
            { id: 'locating-strategies', title: 'Locating Strategies', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'locating-rule', title: 'Locating Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'security-group', title: 'Security Group Management', category: 'System Management', lastUpdated: 'Just now' },
            { id: 'security-permission', title: 'Security Permission Management', category: 'System Management', lastUpdated: 'Just now' },
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
            'system-users': 'system', 'system-logs': 'system', 'system-backup': 'system', 'data-archiving': 'archive', // Updated for English names
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            'locating-strategies': 'configuration',
            'locating-rule': 'configuration',
            'archive-documents': 'archive',
            'archive-media': 'archive',
            'archive-financial': 'archive',
            'security-group': 'system', 
            'security-permission': 'system', 
        };

        window.toggleChildren = function(category) {
            const childrenDiv = document.getElementById(`${category}-children`);
            const arrowIcon = document.getElementById(`${category}-arrow`);

            if (childrenDiv && arrowIcon) {
                childrenDiv.classList.toggle('hidden');
                arrowIcon.classList.toggle('rotate-90');
                arrowIcon.classList.toggle('rotate-0');
            }

            if (!childrenDiv.classList.contains('hidden') && window.contentData[category] && window.contentData[category].full) {
                selectCategory(category);
            }
        }

        window.selectCategory = function(category) {

            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active-sidebar-item', 'bg-wise-light-gray');
            });
            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('bg-gray-100', 'font-medium', 'text-wise-dark-gray');
                item.classList.add('text-wise-gray');
            });

            document.querySelectorAll('.sidebar-child').forEach(item => {
                item.classList.remove('border-l-2', 'border-wise-primary');
            });


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
            const content = window.contentData[category];
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
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Content for ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">No specific content available for this category yet.</p>`;
                defaultContentArea.classList.remove('hidden');
            }

            // Initialize form and table if category is related
            if (category === 'configuration-warehouse' && typeof window.renderWarehouseList === 'function') {
                window.renderWarehouseList();
                window.initializeTabButtons('warehouse-form-modal');
                window.activateTab('warehouse-address', 'warehouse-form-modal');
            } else if (category === 'configuration-zone' && typeof window.renderZoneList === 'function') {
                window.renderZoneList();
                window.initializeTabButtons('zone-form-modal');
            } else if (category === 'configuration-location-type' && typeof window.renderLocationTypeList === 'function') {
                window.renderLocationTypeList();
                window.initializeTabButtons('location-type-form-modal');
                window.activateTab('general-location', 'location-type-form-modal');
            } else if (category === 'locating-strategies' && typeof window.renderLocatingStrategyList === 'function') {
                window.renderLocatingStrategyList();
                window.initializeTabButtons('locating-strategy-form-modal');
            } else if (category === 'locating-rule' && typeof window.renderLocatingRuleList === 'function') {
                window.renderLocatingRuleList();
                window.initializeTabButtons('locating-rule-form-modal');
                window.checkLocatingRuleFormValidity();
            } else if (category === 'security-group' && typeof window.renderSecurityGroupList === 'function') {
                window.renderSecurityGroupList();
            } else if (category === 'security-permission' && typeof window.renderSecurityPermissionList === 'function') {
                window.renderSecurityPermissionList();
            }


            // Close sidebar in mobile view after selecting a category
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        }

        /**
         * Handles search input from header or overlay.
         * @param {string} query - The search keyword.
         * @param {string} source - The search source ('overlay' or otherwise).
         */
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

        /**
         * Performs a search and displays the results.
         * @param {string} query - The search keyword.
         * @param {string} source - The search source ('overlay' or otherwise).
         */
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
                            <p class="text-wise-gray text-xs">Category: ${item.category} | Last Updated: ${item.lastUpdated}</p>
                        `;
                        resultItem.onmouseenter = (event) => showPreview(item.id, event);
                        resultItem.onclick = () => selectSearchResult(item.id, item.title, query);
                        resultsPanel.appendChild(resultItem);
                    });
                } else {
                    resultsPanel.innerHTML = `<p class="p-3 text-wise-gray text-sm">No results found.</p>`;
                    filtersContainer.classList.add('hidden');
                }
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Hover over an item on the left for a preview, or click to see details.</p>`;
                }
            } else {
                resultsPanel.innerHTML = '';
                if (detailPanel) {
                    detailPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">Hover over an item on the left for a preview, or click to see details.</p>`;
                }
                filtersContainer.classList.add('hidden');
            }
        }

        /**
         * Displays content preview in the search overlay detail panel.
         * @param {string} id - The ID of the content to preview.
         */
        window.showPreview = function(id) {
            const overlayDetailContentPanel = document.getElementById('overlay-detail-content-panel');
            const content = window.contentData[id];

            if (content && (content.detail || content.full)) {
                overlayDetailContentPanel.innerHTML = `
                    ${content.detail || content.full}
                    <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="displayContentInMainDashboard('${id}')">
                        Display Page
                    </button>
                `;
            } else {
                overlayDetailContentPanel.innerHTML = `<p class="text-wise-gray text-center text-sm">No preview available for this item.</p>`;
            }
        }

        /**
         * Selects a search result and displays its content in the main dashboard.
         * @param {string} id - The ID of the selected content.
         * @param {string} title - The title of the search result.
         * @param {string} query - The search keyword that led to this result.
         */
        window.selectSearchResult = function(id, title, query) {
            addSearchHistory(query);
            displayContentInMainDashboard(id);
        }

        /**
         * Displays content in the main dashboard area.
         * @param {string} id - The ID of the content to display.
         */
        window.displayContentInMainDashboard = function(id) {
            const content = window.contentData[id];
            const defaultContentArea = document.getElementById('default-content-area');

            if (content && content.full) {
                defaultContentArea.innerHTML = content.full;
            } else if (content && content.detail) {
                defaultContentArea.innerHTML = content.detail;
            } else {
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Full Content for ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">No full content available.</p>`;
            }

            closeSearchOverlay();
            selectCategory(id);
        }

        /**
         * Adds a filter to the search overlay.
         * @param {string} filterName - The name of the filter to add.
         */
        window.addOverlayFilter = function(filterName) {
            if (!activeFilters.includes(filterName.toLowerCase())) {
                activeFilters.push(filterName.toLowerCase());
                document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.remove('hidden');
                performSearch(document.getElementById('overlay-search-input').value, 'overlay');
            }
        }

        /**
         * Removes a filter from the search overlay.
         * @param {string} filterName - The name of the filter to remove.
         */
        window.removeOverlayFilter = function(filterName) {
            activeFilters = activeFilters.filter(filter => filter !== filterName.toLowerCase());
            document.getElementById(`overlay-filter-${filterName.toLowerCase()}`).classList.add('hidden');
            performSearch(document.getElementById('overlay-search-input').value, 'overlay');
        }

        /**
         * Removes all filters from the search overlay.
         */
        window.removeAllOverlayFilters = function() {
            activeFilters = [];
            document.getElementById('overlay-filter-articles').classList.add('hidden');
            document.getElementById('overlay-filter-photography').classList.add('hidden');
            document.getElementById('overlay-search-input').value = '';
            performSearch('', 'overlay');
        }

        /**
         * Closes the search overlay.
         */
        window.closeSearchOverlay = function() {
            document.getElementById('search-overlay').classList.add('hidden');
            document.getElementById('search-input').value = '';
            document.getElementById('overlay-search-input').value = '';
            activeFilters = [];
            document.getElementById('overlay-search-filters').classList.add('hidden');
            document.getElementById('filter-articles').classList.add('hidden');
            document.getElementById('filter-photography').classList.add('hidden');
            document.getElementById('search-history-dropdown').classList.add('hidden');
            selectCategory(currentCategory);
        }

        /**
         * Toggles the visibility of the user dropdown.
         */
        window.toggleUserDropdown = function() {
            const userDropdown = document.getElementById('user-dropdown');
            userDropdown.classList.toggle('hidden');
        }

        // Closes user dropdown and search history when clicking outside the area.
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

        /**
         * Handles the logout process.
         */
        window.handleLogout = async function() {
            await showCustomAlert('Log Out', 'You have successfully logged out.');
            window.location.href = 'login.html';
        }

        /**
         * Navigates to the profile page.
         */
        window.navigateToProfile = function() {
            window.location.href = 'profile.html';
        }

        /**
         * Adds a search query to history.
         * @param {string} query - The search keyword.
         */
        function addSearchHistory(query) {
            if (query && !searchHistory.includes(query)) {
                searchHistory.unshift(query);
                searchHistory = searchHistory.slice(0, 5);
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            }
        }

        /**
         * Displays search history in the dropdown.
         */
        window.showSearchHistory = function() {
            const historyDropdown = document.getElementById('search-history-dropdown');
            const historyContent = document.getElementById('search-history-content');

            historyContent.innerHTML = '';

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
                clearAllButton.innerHTML = `<button class="text-wise-gray hover:underline text-xs" onclick="clearAllSearchHistory()">Clear All History</button>`;
                historyContent.appendChild(clearAllButton);

                historyDropdown.classList.remove('hidden');
            } else {
                historyContent.innerHTML = `<p class="p-3 text-wise-gray text-sm">No search history.</p>`;
                historyDropdown.classList.remove('hidden');
            }
        }

        /**
         * Applies a query from search history.
         * @param {string} query - The keyword from history.
         */
        window.applySearchHistory = function(query) {
            document.getElementById('search-input').value = query;
            handleSearch(query);
            document.getElementById('search-history-dropdown').classList.add('hidden');
        }

        /**
         * Removes an item from search history.
         * @param {number} index - The index of the item to remove.
         */
        window.removeSearchHistory = function(index) {
            searchHistory.splice(index, 1);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            showSearchHistory();
        }

        /**
         * Clears all search history.
         */
        window.clearAllSearchHistory = function() {
            searchHistory = [];
            localStorage.removeItem('searchHistory');
            showSearchHistory();
        }


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

        document.addEventListener('click', (event) => {
            if (window.innerWidth < 768 && !sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target) && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
                mainContent.classList.remove('ml-64');
                mainContent.classList.add('ml-0');
                document.getElementById('sidebar-overlay').classList.add('hidden');
            }
        });

        window.closeSidebar = function() {
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-0');
            document.getElementById('sidebar-overlay').classList.add('hidden');
        }

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

        window.onload = function() {
            selectCategory('dashboard');

            const username = "SuperAdmin";
            document.getElementById('username-display').textContent = username;
        };
    });

})();