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
        const contentData = {
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

            configuration: {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Configuration</h2>
                    <p class="text-wise-gray mb-4">Here you can manage various configurations for the WISE system. Select a sub-category from the sidebar to manage Warehouse, Zone, or Location Type.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Warehouse Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Manage warehouse details, including addresses and authorized users.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-warehouse')">
                                Manage Warehouses
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Zone Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Define and manage various zones within the warehouse.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-zone')">
                                Manage Zones
                            </button>
                        </div>
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">Location Type Management</h3>
                            <p class="text-wise-gray text-sm mt-1">Configure storage location types based on dimensions and weight.</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="selectCategory('configuration-location-type')">
                                Manage Location Types
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
                    </div>
                `,
            },
            'configuration-warehouse': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Warehouse </h2>
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
                                                            <option value="Jawa Barat">West Java</option>
                                                            <option value="Jawa Tengah">Central Java</option>
                                                            <option value="Jawa Timur">East Java</option>
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
                                                            <option value="Jawa Barat">West Java</option>
                                                            <option value="Jawa Tengah">Central Java</option>
                                                            <option value="Jawa Timur">East Java</option>
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
            'configuration-zone': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Zone</h2>
                    <p class="text-wise-gray mb-4">Manage zone types for various areas within the warehouse.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showZoneForm('create')">
                            Create New Zone
                        </button>
                        <input type="text" id="zone-search" placeholder="Search zone..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterZoneList(this.value)">
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
                                <button type="submit" form="zone-form" id="zone-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'configuration-location-type': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Location Type</h2>
                    <p class="text-wise-gray mb-4">Configure storage location types based on dimensions and weight.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showLocationTypeForm('create')">
                            Create New Location Type
                        </button>
                        <input type="text" id="location-type-search" placeholder="Search location type..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocationTypeList(this.value)">
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
                                        <p class="text-wise-gray text-sm">Add custom fields for location types here.</p>
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
                                <button type="submit" form="location-type-form" id="location-type-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
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

            'locating-strategies': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Locating Strategy</h2>
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
                                            <input type="checkbox" id="locating-strategy-system-created" name="systemCreated" disabled class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary cursor-not-allowed">
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
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Locating Rule</h2>
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
            'security-group': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Security Group Management</h2>
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
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="security-group-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-group-form" onsubmit="handleSecurityGroupSubmit(event)">
                                    <div class="mb-4">
                                        <label for="security-group-name" class="block text-sm font-medium text-wise-dark-gray">Group Name:</label>
                                        <input type="text" id="security-group-name" name="groupName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label for="security-group-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="security-group-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
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
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Security Permission Management</h2>
                    <p class="text-wise-gray mb-4">Define and manage individual security permissions.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showSecurityPermissionForm('create')">
                            Create New Security Permission
                        </button>
                        <input type="text" id="security-permission-search" placeholder="Search permission..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterSecurityPermissionList(this.value)">
                    </div>
                    <div id="security-permission-list-container" class="overflow-x-auto">
                    </div>

                    <div id="security-permission-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="security-permission-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-permission-form" onsubmit="handleSecurityPermissionSubmit(event)">
                                    <div class="mb-4">
                                        <label for="security-permission-name" class="block text-sm font-medium text-wise-dark-gray">Permission Name:</label>
                                        <input type="text" id="security-permission-name" name="permissionName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label for="security-permission-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="security-permission-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="security-permission-system-created" name="systemCreated" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                        </label>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="security-permission-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeSecurityPermissionForm()">Cancel</button>
                                <button type="submit" form="security-permission-form" id="security-permission-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
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
            }
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
            { id: 'configuration-warehouse', title: 'Warehouse Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-zone', title: 'Zone Configuration', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'configuration-location-type', title: 'Location Type Configuration', category: 'Configuration', lastUpdated: 'Latest' },
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

            // New search items for Security Group and Security Permission
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
            'configuration-warehouse': 'configuration', 'configuration-zone': 'configuration', 'configuration-location-type': 'configuration',
            'system-users': 'system', 'system-logs': 'system', 'system-backup': 'system', 'data-archiving': 'archive', // Updated for English names
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            'locating-strategies': 'configuration',
            'locating-rule': 'configuration',
            'archive-documents': 'archive',
            'archive-media': 'archive',
            'archive-financial': 'archive',
            'security-group': 'system', // New parent mapping
            'security-permission': 'system', // New parent mapping
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
                defaultContentArea.innerHTML = `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Content for ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}</h2><p class="text-wise-gray">No specific content available for this category yet.</p>`;
                defaultContentArea.classList.remove('hidden');
            }

            // Initialize form and table if category is related
            if (category === 'configuration-warehouse') {
                renderWarehouseList();
                initializeTabButtons('warehouse-form-modal');
                activateTab('warehouse-address', 'warehouse-form-modal');
            } else if (category === 'configuration-zone') {
                renderZoneList();
                initializeTabButtons('zone-form-modal');
                activateTab('general-zone', 'zone-form-modal');
            } else if (category === 'configuration-location-type') {
                renderLocationTypeList();
                initializeTabButtons('location-type-form-modal');
                activateTab('general-location', 'location-type-form-modal');
            } else if (category === 'locating-strategies') {
                renderLocatingStrategyList();
                initializeTabButtons('locating-strategy-form-modal');
                activateTab('general-strategy', 'locating-strategy-form-modal');
            } else if (category === 'locating-rule') {
                renderLocatingRuleList();
                initializeTabButtons('locating-rule-form-modal');
                activateTab('general-rule', 'locating-rule-form-modal');
                checkLocatingRuleFormValidity();
            } else if (category === 'security-group') { // New category
                renderSecurityGroupList();
            } else if (category === 'security-permission') { // New category
                renderSecurityPermissionList();
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
            const content = contentData[id];

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
            const content = contentData[id];
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
            if (userDropdown.style.display === 'block' || userDropdown.classList.contains('hidden')) {
                userDropdown.style.display = 'block';
                userDropdown.classList.remove('hidden');
            } else {
                userDropdown.style.display = 'none';
                userDropdown.classList.add('hidden');
            }
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

        // Dummy data for warehouses (from local storage or default)
        let warehouses = JSON.parse(localStorage.getItem('warehouses')) || [
            { id: 'DCB', description: 'DC BUAH BATU', active: true, address1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL', address2: '', address3: '', city: 'Bandung', state: 'West Java', postalCode: '40266', country: 'Indonesia', faxNumber: '(022)-88884377', attentionTo: '', phoneNumber: '(022)-7540576 / 77', emailAddress: '', uccEanNumber: '', returnAddressSame: false, returnName: 'DC BUAH BATU', returnAddress1: 'JL TERUSAN BUAH BATU NO 12, BATUNUNGGAL, BANDUNG.', returnAddress2: '', returnAddress3: '', returnCity: 'Bandung', returnState: 'West Java', returnPostalCode: '40266', returnCountry: 'Indonesia', returnFaxNumber: '', returnAttentionTo: '', returnPhoneNumber: '', returnEmailAddress: '', returnUccEanNumber: '', slottingMoveFileDirectory: '', defaultLocationForUnslottedItems: '', renderedDocumentPdfFileDirectory: '\\\\scale\\fs\\vls\\Report\\DCB', userDefinedField1: 'PT. AKUR PRATAMA', userDefinedField2: '', userDefinedField3: '', userDefinedField4: '', userDefinedField5: '', userDefinedField6: '', userDefinedField7: '8.00000', userDefinedField8: '0.00000', users: ['Abdu23074560', 'Abdul04120625', 'Abdul9100020', 'Ades17080031', 'Adil2010099', 'Adil2020284', 'Adi22110060', 'Adli23070426', 'Adli24070022', 'Administrator', 'ADMReturDCB', 'Alfandi24051301', 'Agung15050074', 'Agung92060006', 'AgusHDA182', 'Aji18100334', 'Aldi18101752', 'Ali17120115', 'Andri06010006', 'Andri10010079', 'Angg', 'Anthc', 'Anwa', 'Apep', 'Arif14', 'anueu03090082'] },
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
            { id: 'CFLOW RESV 115cm', locationType: 'CFLOW RESERVE 115cm', length: 239.00, width: 122.00, height: 115.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
            { id: 'CFLOW RESV 55cm', locationType: 'CFLOW RESERVE 55cm', length: 239.00, width: 122.00, height: 55.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
            { id: 'CFLOW RESV 70cm', locationType: 'CFLOW RESERVE 70cm', length: 239.00, width: 122.00, height: 70.00, dimensionUM: 'CM', maximumWeight: 400.00, weightUM: 'KG', active: true, lastUpdated: '' },
            { id: 'CFLOW RESV 90cm', locationType: 'CFLOW RESERVE 90cm', length: 239.00, width: 122.00, height: 90.00, dimensionUM: 'CM', maximumWeight: 250.00, weightUM: 'KG', active: true, lastUpdated: '' },
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

        // New dummy data for Security Groups
        let securityGroups = JSON.parse(localStorage.getItem('securityGroups')) || [
            { id: 'ADMIN', groupName: 'ADMIN', description: 'Administrator Group', inactive: false },
            { id: 'OPERATOR', groupName: 'OPERATOR', description: 'Operator Group', inactive: false },
            { id: 'VIEWER', groupName: 'VIEWER', description: 'Viewer Group', inactive: true },
        ];

        // New dummy data for Security Permissions
        let securityPermissions = JSON.parse(localStorage.getItem('securityPermissions')) || [
            { id: 'ALL', permissionName: 'ALL', description: 'All Permissions', systemCreated: true, inactive: false },
            { id: 'VIEW_DASHBOARD', permissionName: 'VIEW_DASHBOARD', description: 'View Dashboard', systemCreated: false, inactive: false },
            { id: 'EDIT_WAREHOUSE', permissionName: 'EDIT_WAREHOUSE', description: 'Edit Warehouse Configuration', systemCreated: false, inactive: false },
            { id: 'MANAGE_USERS', permissionName: 'MANAGE_USERS', description: 'Manage User Accounts', systemCreated: false, inactive: false },
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
        let currentSecurityGroupId = null; // New current ID
        let currentSecurityPermissionId = null; // New current ID

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

        // New save functions for Security Groups and Permissions
        function saveSecurityGroups() {
            localStorage.setItem('securityGroups', JSON.stringify(securityGroups));
        }

        function saveSecurityPermissions() {
            localStorage.setItem('securityPermissions', JSON.stringify(securityPermissions));
        }


        window.renderWarehouseList = function(filterQuery = '') {
            const container = document.getElementById('warehouse-list-container');
            container.innerHTML = '';

            const filteredWarehouses = warehouses.filter(wh =>
                wh.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
                wh.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredWarehouses.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">No warehouses found.</p>`;
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
                title.textContent = 'Create New Warehouse';
                document.getElementById('warehouse-submit-button').textContent = 'Create';
                document.getElementById('warehouse-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('warehouse-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('warehouse-name').disabled = false;
                document.getElementById('warehouse-inactive').checked = false;
                renderUserCheckboxes([]);
            } else {
                title.textContent = 'Edit Warehouse';
                document.getElementById('warehouse-submit-button').textContent = 'Save';
                document.getElementById('warehouse-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('warehouse-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
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
                    document.getElementById('return-postal-code').value = warehouseToEdit.postalCode;
                    document.getElementById('return-country').value = warehouseToEdit.returnCountry;
                    document.getElementById('return-fax-number').value = warehouseToEdit.returnFaxNumber;
                    document.getElementById('return-attention-to').value = warehouseToEdit.returnAttentionTo;
                    document.getElementById('return-phone-number').value = warehouseToEdit.returnPhoneNumber;
                    document.getElementById('return-email-address').value = warehouseToEdit.returnEmailAddress;
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
                    await showCustomAlert('Error', 'Warehouse ID already exists!');
                    return;
                }
                newWarehouse.id = warehouseId;
                warehouses.push(newWarehouse);
            }
            saveWarehouses();
            renderWarehouseList();
            closeWarehouseForm();
        }

        window.deleteWarehouse = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this warehouse ${id}?`);
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
                container.innerHTML = `<p class="text-wise-gray mt-4">No zones found.</p>`;
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
                title.textContent = 'Create New Zone';
                document.getElementById('zone-submit-button').textContent = 'Create';
                document.getElementById('zone-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('zone-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('zone-identifier').disabled = false;
                document.getElementById('zone-inactive').checked = false;
                document.getElementById('zone-system-created').checked = false;
            } else {
                title.textContent = 'Edit Zone';
                document.getElementById('zone-submit-button').textContent = 'Save';
                document.getElementById('zone-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('zone-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
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
                    await showCustomAlert('Error', 'Zone Identifier already exists!');
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
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this zone ${id}?`);
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
                container.innerHTML = `<p class="text-wise-gray mt-4">No location types found.</p>`;
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
                title.textContent = 'Create New Location Type';
                document.getElementById('location-type-submit-button').textContent = 'Create';
                document.getElementById('location-type-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('location-type-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('location-type-name').disabled = false;
                document.getElementById('location-type-inactive').checked = false;
            } else {
                title.textContent = 'Edit Location Type';
                document.getElementById('location-type-submit-button').textContent = 'Save';
                document.getElementById('location-type-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('location-type-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
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
                    await showCustomAlert('Error', 'Location Type name already exists!');
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
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this location type ${id}?`);
            if (confirmed) {
                locationTypes = locationTypes.filter(lt => lt.id !== id);
                saveLocationTypes();
                renderLocationTypeList();
            }
        }

        window.filterLocationTypeList = function(query) {
            renderLocationTypeList(query);
        }

        window.renderLocatingStrategyList = function(filterQuery = '') {
            const container = document.getElementById('locating-strategy-list-container');
            container.innerHTML = '';

            const filteredStrategies = locatingStrategies.filter(strategy => {
                const strategyIdOrIdentifier = strategy.id || strategy.identifier;
                return (
                    strategyIdOrIdentifier.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    strategy.description.toLowerCase().includes(filterQuery.toLowerCase())
                );
            });

            if (filteredStrategies.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">No locating strategies found.</p>`;
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

            const identifierInput = document.getElementById('locating-strategy-identifier');
            const recordTypeInput = document.getElementById('locating-strategy-record-type');
            const systemCreatedCheckbox = document.getElementById('locating-strategy-system-created');

            identifierInput.classList.remove('cursor-not-allowed', 'bg-gray-100');
            recordTypeInput.classList.remove('cursor-not-allowed', 'bg-gray-100');
            systemCreatedCheckbox.classList.remove('cursor-not-allowed');

            if (mode === 'create') {
                title.textContent = 'Create New Locating Strategy';
                document.getElementById('locating-strategy-submit-button').textContent = 'Create';
                document.getElementById('locating-strategy-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('locating-strategy-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');

                identifierInput.disabled = false;
                identifierInput.readOnly = false;
                recordTypeInput.disabled = false;
                recordTypeInput.readOnly = false;
                recordTypeInput.value = 'LOCSTRAT';
                systemCreatedCheckbox.disabled = false;
                systemCreatedCheckbox.checked = false;

                document.getElementById('locating-strategy-inactive').checked = false;

            } else {
                title.textContent = 'Edit Locating Strategy';
                document.getElementById('locating-strategy-submit-button').textContent = 'Save';
                document.getElementById('locating-strategy-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('locating-strategy-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');

                const strategyToEdit = locatingStrategies.find(s => s.id === id);
                if (strategyToEdit) {
                    identifierInput.value = strategyToEdit.identifier;
                    recordTypeInput.value = strategyToEdit.recordType;
                    document.getElementById('locating-strategy-description').value = strategyToEdit.description;
                    document.getElementById('locating-strategy-inactive').checked = strategyToEdit.inactive;
                    systemCreatedCheckbox.checked = strategyToEdit.systemCreated;

                    identifierInput.disabled = false;
                    identifierInput.readOnly = false;
                    recordTypeInput.disabled = false;
                    recordTypeInput.readOnly = false;
                    systemCreatedCheckbox.disabled = false;
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
                id: currentLocatingStrategyId || identifier,
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
                    await showCustomAlert('Error', 'Strategy Identifier already exists!');
                    return;
                }
                newStrategy.id = identifier;
                locatingStrategies.push(newStrategy);
            }
            saveLocatingStrategies();
            renderLocatingStrategyList();
            closeLocatingStrategyForm();
        }

        window.deleteLocatingStrategy = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this locating strategy ${id}?`);
            if (confirmed) {
                locatingStrategies = locatingStrategies.filter(s => s.id !== id);
                saveLocatingStrategies();
                renderLocatingStrategyList();
            }
        }

        window.filterLocatingStrategyList = function(query) {
            renderLocatingStrategyList(query);
        }

        window.renderLocatingRuleList = function(filterQuery = '') {
            const container = document.getElementById('locating-rule-list-container');
            container.innerHTML = '';

            const filteredRules = locatingRules.filter(rule =>
                rule.ruleName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                rule.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredRules.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">No locating rules found.</p>`;
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

            detailRecordsList.innerHTML = '';

            if (mode === 'create') {
                title.textContent = 'Create New Locating Rule';
                document.getElementById('locating-rule-submit-button').textContent = 'Create';
                document.getElementById('locating-rule-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('locating-rule-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('locating-rule-name').disabled = false;
                document.getElementById('locating-rule-delayed-locating').checked = false;
                document.getElementById('locating-rule-inactive').checked = false;

                detailRecordsPlaceholder.classList.remove('hidden');
                detailRecordsContainer.classList.add('pointer-events-none', 'opacity-50');
                addDetailRecordBtn.disabled = true;

            } else {
                title.textContent = 'Edit Locating Rule';
                document.getElementById('locating-rule-submit-button').textContent = 'Save';
                document.getElementById('locating-rule-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('locating-rule-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('locating-rule-name').disabled = true;

                const ruleToEdit = locatingRules.find(r => r.id === id);
                if (ruleToEdit) {
                    document.getElementById('locating-rule-name').value = ruleToEdit.ruleName;
                    document.getElementById('locating-rule-description').value = ruleToEdit.description;
                    document.getElementById('locating-rule-delayed-locating').checked = ruleToEdit.delayedLocating;
                    document.getElementById('locating-rule-inactive').checked = ruleToEdit.inactive;

                    detailRecordsPlaceholder.classList.add('hidden');
                    detailRecordsContainer.classList.remove('pointer-events-none', 'opacity-50');
                    addDetailRecordBtn.disabled = false;

                    ruleToEdit.detailRecords.forEach(record => addDetailRecord(record));
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            checkLocatingRuleFormValidity();
        }

        window.closeLocatingRuleForm = function() {
            document.getElementById('locating-rule-form-modal').classList.add('hidden');
            document.getElementById('locating-rule-form-modal').classList.remove('flex');
            currentLocatingRuleId = null;

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
                <input type="number" placeholder="Seq" value="${record.sequence || ''}" class="detail-record-sequence w-12 px-2 py-1 border border-wise-border rounded-md text-sm text-center bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">

                <input type="text" placeholder="Field" value="${record.field || ''}" class="detail-record-field flex-grow px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">

                <input type="text" placeholder="Op" value="${record.operator || ''}" class="detail-record-operator w-12 px-2 py-1 border border-wise-border rounded-md text-sm text-center bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">

                <input type="text" placeholder="Value" value="${record.value || ''}" class="detail-record-value flex-grow px-2 py-1 border border-wise-border rounded-md text-sm bg-white text-wise-dark-gray focus:outline-none focus:ring-wise-primary focus:border-wise-primary">

                <button type="button" onclick="window.removeDetailRecord(this)" class="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-wise-error text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm active-press transform">
                    <i class="fas fa-times text-xs"></i>
                </button>
            `;
            detailRecordsList.appendChild(newRecordDiv);
        }

        window.removeDetailRecord = function(button) {
            const recordDiv = button.closest('.flex.flex-col.md\\:flex-row');
            if (recordDiv) {
                recordDiv.remove();
            } else {
                console.error("Could not find the parent record div to remove.");
            }
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
                    await showCustomAlert('Error', 'Locating Rule Name already exists!');
                    return;
                }
                newRule.id = ruleName;
                locatingRules.push(newRule);
            }
            saveLocatingRules();
            renderLocatingRuleList();
            closeLocatingRuleForm();
        }

        window.deleteLocatingRule = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this locating rule ${id}?`);
            if (confirmed) {
                locatingRules = locatingRules.filter(r => r.id !== id);
                saveLocatingRules();
                renderLocatingRuleList();
            }
        }

        window.filterLocatingRuleList = function(query) {
            renderLocatingRuleList(query);
        }

        // New functions for Security Group management
        window.renderSecurityGroupList = function(filterQuery = '') {
            const container = document.getElementById('security-group-list-container');
            container.innerHTML = '';

            const filteredGroups = securityGroups.filter(group =>
                group.groupName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                group.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredGroups.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">No security groups found.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Group Name</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Inactive</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="security-group-table-body">
                </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('security-group-table-body');
            filteredGroups.forEach(group => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${group.groupName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${group.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${group.inactive ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showSecurityGroupForm('edit', '${group.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteSecurityGroup('${group.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        };

        window.showSecurityGroupForm = function(mode, id = null) {
            const modal = document.getElementById('security-group-form-modal');
            const title = document.getElementById('security-group-form-title');
            const form = document.getElementById('security-group-form');
            form.reset();
            currentSecurityGroupId = id;

            if (mode === 'create') {
                title.textContent = 'Create New Security Group';
                document.getElementById('security-group-submit-button').textContent = 'Create';
                document.getElementById('security-group-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('security-group-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('security-group-name').disabled = false;
                document.getElementById('security-group-inactive').checked = false;
            } else {
                title.textContent = 'Edit Security Group';
                document.getElementById('security-group-submit-button').textContent = 'Save';
                document.getElementById('security-group-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('security-group-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('security-group-name').disabled = true;

                const groupToEdit = securityGroups.find(group => group.id === id);
                if (groupToEdit) {
                    document.getElementById('security-group-name').value = groupToEdit.groupName;
                    document.getElementById('security-group-description').value = groupToEdit.description;
                    document.getElementById('security-group-inactive').checked = groupToEdit.inactive;
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeSecurityGroupForm = function() {
            document.getElementById('security-group-form-modal').classList.add('hidden');
            document.getElementById('security-group-form-modal').classList.remove('flex');
            currentSecurityGroupId = null;
        };

        window.handleSecurityGroupSubmit = async function(event) {
            event.preventDefault();
            const groupName = document.getElementById('security-group-name').value;
            const description = document.getElementById('security-group-description').value;
            const inactive = document.getElementById('security-group-inactive').checked;

            const newGroup = {
                id: currentSecurityGroupId || groupName,
                groupName,
                description,
                inactive,
            };

            if (currentSecurityGroupId) {
                const index = securityGroups.findIndex(group => group.id === currentSecurityGroupId);
                if (index !== -1) {
                    securityGroups[index] = { ...securityGroups[index], ...newGroup };
                }
            } else {
                if (securityGroups.some(group => group.groupName === groupName)) {
                    await showCustomAlert('Error', 'Security Group Name already exists!');
                    return;
                }
                newGroup.id = groupName;
                securityGroups.push(newGroup);
            }
            saveSecurityGroups();
            renderSecurityGroupList();
            closeSecurityGroupForm();
        };

        window.deleteSecurityGroup = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this security group ${id}?`);
            if (confirmed) {
                securityGroups = securityGroups.filter(group => group.id !== id);
                saveSecurityGroups();
                renderSecurityGroupList();
            }
        };

        window.filterSecurityGroupList = function(query) {
            renderSecurityGroupList(query);
        };

        // New functions for Security Permission management
        window.renderSecurityPermissionList = function(filterQuery = '') {
            const container = document.getElementById('security-permission-list-container');
            container.innerHTML = '';

            const filteredPermissions = securityPermissions.filter(permission =>
                permission.permissionName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                permission.description.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredPermissions.length === 0) {
                container.innerHTML = `<p class="text-wise-gray mt-4">No security permissions found.</p>`;
                return;
            }

            const table = document.createElement('table');
            table.classList.add('min-w-full', 'divide-y', 'divide-wise-border', 'mt-4', 'shadow-md', 'rounded-lg');
            table.innerHTML = `
                <thead class="bg-wise-light-gray">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Permission Name</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">System Created</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-wise-gray uppercase tracking-wider">Inactive</th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-wise-border" id="security-permission-table-body">
                </tbody>
            `;
            container.appendChild(table);

            const tbody = document.getElementById('security-permission-table-body');
            filteredPermissions.forEach(permission => {
                const row = tbody.insertRow();
                row.classList.add('hover:bg-wise-light-gray', 'transition-colors', 'duration-150');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-wise-dark-gray">${permission.permissionName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${permission.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${permission.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-wise-gray">${permission.inactive ? 'Yes' : 'No'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showSecurityPermissionForm('edit', '${permission.id}')" class="text-wise-primary hover:text-blue-700 mr-3">Edit</button>
                        <button onclick="deleteSecurityPermission('${permission.id}')" class="text-wise-error hover:text-red-700">Delete</button>
                    </td>
                `;
            });
        };

        window.showSecurityPermissionForm = function(mode, id = null) {
            const modal = document.getElementById('security-permission-form-modal');
            const title = document.getElementById('security-permission-form-title');
            const form = document.getElementById('security-permission-form');
            form.reset();
            currentSecurityPermissionId = id;

            if (mode === 'create') {
                title.textContent = 'Create New Security Permission';
                document.getElementById('security-permission-submit-button').textContent = 'Create';
                document.getElementById('security-permission-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('security-permission-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('security-permission-name').disabled = false;
                document.getElementById('security-permission-system-created').checked = false;
                document.getElementById('security-permission-inactive').checked = false;
            } else {
                title.textContent = 'Edit Security Permission';
                document.getElementById('security-permission-submit-button').textContent = 'Save';
                document.getElementById('security-permission-submit-button').classList.remove('bg-white', 'text-wise-dark-gray', 'hover:bg-gray-100');
                document.getElementById('security-permission-submit-button').classList.add('bg-wise-primary', 'text-white', 'hover:bg-blue-700');
                document.getElementById('security-permission-name').disabled = true;

                const permissionToEdit = securityPermissions.find(permission => permission.id === id);
                if (permissionToEdit) {
                    document.getElementById('security-permission-name').value = permissionToEdit.permissionName;
                    document.getElementById('security-permission-description').value = permissionToEdit.description;
                    document.getElementById('security-permission-system-created').checked = permissionToEdit.systemCreated;
                    document.getElementById('security-permission-inactive').checked = permissionToEdit.inactive;
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeSecurityPermissionForm = function() {
            document.getElementById('security-permission-form-modal').classList.add('hidden');
            document.getElementById('security-permission-form-modal').classList.remove('flex');
            currentSecurityPermissionId = null;
        };

        window.handleSecurityPermissionSubmit = async function(event) {
            event.preventDefault();
            const permissionName = document.getElementById('security-permission-name').value;
            const description = document.getElementById('security-permission-description').value;
            const systemCreated = document.getElementById('security-permission-system-created').checked;
            const inactive = document.getElementById('security-permission-inactive').checked;

            const newPermission = {
                id: currentSecurityPermissionId || permissionName,
                permissionName,
                description,
                systemCreated,
                inactive,
            };

            if (currentSecurityPermissionId) {
                const index = securityPermissions.findIndex(permission => permission.id === currentSecurityPermissionId);
                if (index !== -1) {
                    securityPermissions[index] = { ...securityPermissions[index], ...newPermission };
                }
            } else {
                if (securityPermissions.some(permission => permission.permissionName === permissionName)) {
                    await showCustomAlert('Error', 'Security Permission Name already exists!');
                    return;
                }
                newPermission.id = permissionName;
                securityPermissions.push(newPermission);
            }
            saveSecurityPermissions();
            renderSecurityPermissionList();
            closeSecurityPermissionForm();
        };

        window.deleteSecurityPermission = async function(id) {
            const confirmed = await showCustomConfirm('Confirm Delete', `Are you sure you want to delete this security permission ${id}?`);
            if (confirmed) {
                securityPermissions = securityPermissions.filter(permission => permission.id !== id);
                saveSecurityPermissions();
                renderSecurityPermissionList();
            }
        };

        window.filterSecurityPermissionList = function(query) {
            renderSecurityPermissionList(query);
        };


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
