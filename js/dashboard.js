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

        // New elements for DCS dropdown
        const configDropdownToggle = document.getElementById('config-dropdown-toggle');
        const configDropdown = document.getElementById('config-dropdown');

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
            'receiving-open-box-balance-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Open/Box Balance Viewer</h2><p class="text-wise-gray">View open and box balances.</p>`,
            },
            'receiving-po-quick-find': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Purchase Order Quick Find</h2><p class="text-wise-gray">Quickly find purchase orders.</p>`,
            },
            'receiving-receipt-closet-supplier': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Closet By Supplier</h2><p class="text-wise-gray">Receipt details organized by supplier.</p>`,
            },
            'receiving-receipt-container-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Container Viewer</h2><p class="text-wise-gray">View receipt containers.</p>`,
            },
            'receiving-receipt-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Explorer</h2><p class="text-wise-gray">Explore all receipt details.</p>`,
            },
            'receiving-receipt-monitoring-close': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Monitoring/Close Viewer</h2><p class="text-wise-gray">Monitor and close receipts.</p>`,
            },
            'receiving-receipt-no-close': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt No/Close Viewer</h2><p class="text-wise-gray">View receipts that are not closed.</p>`,
            },
            'receiving-receipt-open-closed': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Open And Closed Viewer</h2><p class="text-wise-gray">View both open and closed receipts.</p>`,
            },
            'receiving-receipt-shipment-closed': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receipt Shipment Closed Viewer</h2><p class="text-wise-gray">View closed receipt shipments.</p>`,
            },
            'receiving-performance-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receiving Performance Viewer</h2><p class="text-wise-gray">Analyze receiving performance.</p>`,
            },
            'receiving-workbench': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Receiving Workbench</h2><p class="text-wise-gray">Workbench for receiving operations.</p>`,
            },
            'receiving-shipment-closed-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Shipment Closed Viewer</h2><p class="text-wise-gray">View closed shipments.</p>`,
            },
            'receiving-virtual-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Receiving - Virtual Receiving Viewer</h2><p class="text-wise-gray">View virtual receiving details.</p>`,
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
            'order-planning-consolidated-shipment-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Consolidated Shipment History</h2><p class="text-wise-gray">Review consolidated shipment history.</p>`,
            },
            'order-planning-order-entry': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Order Entry</h2><p class="text-wise-gray">Enter new orders.</p>`,
            },
            'order-planning-wave-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Wave Explorer</h2><p class="text-wise-gray">Explore order waves.</p>`,
            },
            'order-planning-wave-quick-find': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Order Planning - Wave Quick Find</h2><p class="text-wise-gray">Quickly find order waves.</p>`,
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
            'shipping-close-container': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Close Container</h2><p class="text-wise-gray">Close shipping containers.</p>`,
            },
            'shipping-consolidated-container-location-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Consolidated Container Location Viewer</h2><p class="text-wise-gray">View consolidated container locations.</p>`,
            },
            'shipping-containers-delivered': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Containers Delivered</h2><p class="text-wise-gray">Track delivered containers.</p>`,
            },
            'shipping-outbound-surplus-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Outbound Surplus Viewer</h2><p class="text-wise-gray">View outbound surplus.</p>`,
            },
            'shipping-dock-scheduler': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Dock Scheduler</h2><p class="text-wise-gray">Schedule dock appointments.</p>`,
            },
            'shipping-load-close-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Close Viewer</h2><p class="text-wise-gray">View load close details.</p>`,
            },
            'shipping-load-count-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Count Viewer</h2><p class="text-wise-gray">View load counts.</p>`,
            },
            'shipping-load-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Load Explorer</h2><p class="text-wise-gray">Explore shipping loads.</p>`,
            },
            'shipping-maxi-high-container-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Maxi High Container Viewer</h2><p class="text-wise-gray">View maxi high containers.</p>`,
            },
            'shipping-multiple-order-pallet-close': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Multiple Order Pallet Close</h2><p class="text-wise-gray">Close multiple order pallets.</p>`,
            },
            'shipping-oos-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - OOS Viewer</h2><p class="text-wise-gray">View Out-of-Stock information.</p>`,
            },
            'shipping-operator-surplus-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Operator Surplus Viewer</h2><p class="text-wise-gray">View operator surplus.</p>`,
            },
            'shipping-pallet-close': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Pallet Close</h2><p class="text-wise-gray">Close pallets.</p>`,
            },
            'shipping-pallet-in-staging-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Pallet In Staging Viewer</h2><p class="text-wise-gray">View pallets in staging.</p>`,
            },
            'shipping-put-to-store-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Put to Store Viewer</h2><p class="text-wise-gray">View put-to-store details.</p>`,
            },
            'shipping-qc-workbench': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - QC Workbench</h2><p class="text-wise-gray">Quality Control workbench.</p>`,
            },
            'shipping-shipment-detail-allocation-rejection': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Detail Allocation Rejection Viewer</h2><p class="text-wise-gray">View shipment allocation rejections.</p>`,
            },
            'shipping-shipment-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Explorer</h2><p class="text-wise-gray">Explore shipments.</p>`,
            },
            'shipping-shipment-quick-find': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Quick Find</h2><p class="text-wise-gray">Quickly find shipments.</p>`,
            },
            'shipping-shipment-start-pick-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Start/Pick Viewer</h2><p class="text-wise-gray">View shipment start and pick details.</p>`,
            },
            'shipping-shipment-stop-tuk-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipment Stop/Tuk Viewer</h2><p class="text-wise-gray">View shipment stop/Tuk details.</p>`,
            },
            'shipping-container-identification': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipping Container Identification</h2><p class="text-wise-gray">Identify shipping containers.</p>`,
            },
            'shipping-container-workbench': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - Shipping Container Workbench</h2><p class="text-wise-gray">Shipping container workbench.</p>`,
            },
            'shipping-sit-workbench': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Shipping - SIT Workbench</h2><p class="text-wise-gray">SIT workbench details.</p>`,
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
            'work-label-reprint-utility': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Label Reprint Utility</h2><p class="text-wise-gray">Utility for reprinting labels.</p>`,
            },
            'work-picking-management-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Picking Management Explorer</h2><p class="text-wise-gray">Explore picking management.</p>`,
            },
            'work-picking-sigtion': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Picking Sigtion</h2><p class="text-wise-gray">Picking sigtion details.</p>`,
            },
            'work-execution': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Execution</h2><p class="text-wise-gray">Monitor work execution.</p>`,
            },
            'work-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Explorer</h2><p class="text-wise-gray">Explore work tasks.</p>`,
            },
            'work-insight': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Insight</h2><p class="text-wise-gray">Gain insights into work processes.</p>`,
            },
            'work-monitoring-customer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Monitoring: Customer</h2><p class="text-wise-gray">Monitor work related to customers.</p>`,
            },
            'work-monitoring-group': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Monitoring: Group</h2><p class="text-wise-gray">Monitor work by groups.</p>`,
            },
            'work-quick-find': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Work - Work Quick Find</h2><p class="text-wise-gray">Quickly find work tasks.</p>`,
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
            'cross-app-ar-upload-interface-data-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - AR Upload Interface Data Viewer</h2><p class="text-wise-gray">View AR upload interface data.</p>`,
            },
            'cross-app-background-job-request-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Background Job Request Viewer</h2><p class="text-wise-gray">View background job requests.</p>`,
            },
            'cross-app-configurations': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Configurations</h2><p class="text-wise-gray">Manage cross-application configurations.</p>`,
            },
            'cross-app-interface-data': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Interface Data</h2><p class="text-wise-gray">View interface data.</p>`,
            },
            'cross-app-interface-error-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Interface Error Viewer</h2><p class="text-wise-gray">View interface errors.</p>`,
            },
            'cross-app-progistics': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Progistics</h2><p class="text-wise-gray">Progistics details.</p>`,
            },
            'cross-app-reupload-interface-data-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - ReUpload Interface Data Viewer</h2><p class="text-wise-gray">View re-uploaded interface data.</p>`,
            },
            'cross-app-rf': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - RF</h2><p class="text-wise-gray">RF functionality details.</p>`,
            },
            'cross-app-trading-partner-management': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Trading Partner Management</h2><p class="text-wise-gray">Manage trading partners.</p>`,
            },
            'cross-app-transaction-and-process-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Transaction and Process History</h2><p class="text-wise-gray">View transaction and process history.</p>`,
            },
            'cross-app-upload-interface-data-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Upload Interface Data Viewer</h2><p class="text-wise-gray">View uploaded interface data.</p>`,
            },
            'cross-app-wave-repost-ptl-rabbitmq': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Wave repost only for PTL Messages to RabbitMQ</h2><p class="text-wise-gray">Wave repost details for PTL Messages to RabbitMQ.</p>`,
            },
            'cross-app-web-statistics-generation': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Cross Application - Web Statistics Generation</h2><p class="text-wise-gray">Generate web statistics.</p>`,
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
            'inventory-cycle-count-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Cycle Count Explorer</h2><p class="text-wise-gray">Explore cycle counts.</p>`,
            },
            'inventory-cycle-count-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Cycle Count Viewer</h2><p class="text-wise-gray">View cycle counts.</p>`,
            },
            'inventory-edit-customer-shelflife': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Edit Customer Shelflife</h2><p class="text-wise-gray">Edit customer shelflife.</p>`,
            },
            'inventory-finished-item-breakdown': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Finished Item Breakdown</h2><p class="text-wise-gray">View finished item breakdown.</p>`,
            },
            'inventory-immediate-needs-insight': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Immediate Needs Insight</h2><p class="text-wise-gray">Gain insight into immediate needs.</p>`,
            },
            'inventory-immediate-needs-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Immediate Needs Viewer</h2><p class="text-wise-gray">View immediate needs.</p>`,
            },
            'inventory-interdept': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Interdept</h2><p class="text-wise-gray">Interdepartmental inventory details.</p>`,
            },
            'inventory-adjustment-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Adjustment Viewer</h2><p class="text-wise-gray">View inventory adjustments.</p>`,
            },
            'inventory-insight': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Insight</h2><p class="text-wise-gray">Gain inventory insights.</p>`,
            },
            'inventory-management': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Inventory Management</h2><p class="text-wise-gray">Manage inventory.</p>`,
            },
            'inventory-item-master-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Item Master Viewer</h2><p class="text-wise-gray">View item master data.</p>`,
            },
            'inventory-location-explorer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Explorer</h2><p class="text-wise-gray">Explore locations.</p>`,
            },
            'inventory-location-inventory-attribute-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Inventory Attribute Viewer</h2><p class="text-wise-gray">View location inventory attributes.</p>`,
            },
            'inventory-location-inventory-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Inventory Viewer</h2><p class="text-wise-gray">View location inventory.</p>`,
            },
            'inventory-location-master-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Master Viewer</h2><p class="text-wise-gray">View location master data.</p>`,
            },
            'inventory-location-quick-find': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Location Quick Find</h2><p class="text-wise-gray">Quickly find locations.</p>`,
            },
            'inventory-lot-freight': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Lot Freight</h2><p class="text-wise-gray">Lot freight details.</p>`,
            },
            'inventory-lot-workbench': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Lot Workbench</h2><p class="text-wise-gray">Workbench for lot management.</p>`,
            },
            'inventory-mismatch-company-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory - Mismatch Company Viewer</h2><p class="text-wise-gray">View mismatch company details.</p>`,
            },
            'performance': {
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
            'performance-management-dashboard': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Dashboard</h2><p class="text-wise-gray">View performance metrics on the dashboard.</p>`,
            },
            'performance-quality-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Quality History</h2><p class="text-wise-gray">Review quality history data.</p>`,
            },
            'performance-rfid-history': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - RFID History</h2><p class="text-wise-gray">View RFID history.</p>`,
            },
            'performance-supply-chain-intelligence': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Supply Chain Intelligence</h2><p class="text-wise-gray">Access supply chain intelligence reports.</p>`,
            },
            'performance-warehouse-alerts': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Warehouse Alerts</h2><p class="text-wise-gray">View warehouse alerts.</p>`,
            },
            'performance-warehouse-utilization-report': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Performance Management - Warehouse Utilization Report</h2><p class="text-wise-gray">Generate warehouse utilization reports.</p>`,
            },
            'slotting-optimization': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Slotting Optimization</h2>
                    <p class="text-wise-gray mb-4">Optimize slotting strategies for efficient warehouse operations. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">Optimization Status</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Last Run: Yesterday</li>
                            <li>Next Scheduled Run: Tomorrow</li>
                        </ul>
                    </div>
                `,
            },
            'slotting-optimization-rules': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Slotting Optimization - Optimization Rules</h2><p class="text-wise-gray">Manage slotting optimization rules.</p>`,
            },
            'slotting-optimization-reports': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Slotting Optimization - Optimization Reports</h2><p class="text-wise-gray">View slotting optimization reports.</p>`,
            },
            'slotting-optimization-settings': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Slotting Optimization - Optimization Settings</h2><p class="text-wise-gray">Configure slotting optimization settings.</p>`,
            },
            'system-management': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management</h2>
                    <p class="text-wise-gray mb-4">Manage system users, logs, and backups. Select a sub-category from the sidebar.</p>
                    <div class="bg-wise-light-gray p-4 rounded-lg shadow-sm">
                        <h3 class="font-medium text-wise-dark-gray">System Health</h3>
                        <ul class="list-disc list-inside text-wise-gray text-sm mt-2 space-y-1">
                            <li>Server Status: Online</li>
                            <li>Last Backup: 2 hours ago</li>
                        </ul>
                    </div>
                `,
            },
            'system-management-audit-log-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Audit Log Viewer</h2><p class="text-wise-gray">View system audit logs.</p>`,
            },
            'system-management-background-job-queue-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Background Job Queue Viewer</h2><p class="text-wise-gray">View background job queue.</p>`,
            },
            'system-management-dif-incoming-message-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - DIF Incoming Message Viewer</h2><p class="text-wise-gray">View DIF incoming messages.</p>`,
            },
            'system-management-dif-outgoing-message-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - DIF Outgoing Message Viewer</h2><p class="text-wise-gray">View DIF outgoing messages.</p>`,
            },
            'system-management-display-properties': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Display Properties</h2><p class="text-wise-gray">Configure display properties.</p>`,
            },
            'system-management-license-key-information': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - License Key Information</h2><p class="text-wise-gray">View license key information.</p>`,
            },
            'system-management-manual-inventory-adjustment': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Manual Inventory Adjustment</h2><p class="text-wise-gray">Perform manual inventory adjustments.</p>`,
            },
            'system-management-scale-configuration': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - Scale Configuration</h2><p class="text-wise-gray">Configure scale settings.</p>`,
            },
            'system-management-system-text-editor': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - System Text Editor</h2><p class="text-wise-gray">Edit system texts.</p>`,
            },
            'system-management-user-activity-viewer': {
                detail: `<h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">System Management - User Activity Viewer</h2><p class="text-wise-gray">View user activity logs.</p>`,
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
            'performance-management-dashboard': 'performance',
            'performance-quality-history': 'performance',
            'performance-rfid-history': 'performance',
            'performance-supply-chain-intelligence': 'performance',
            'performance-warehouse-alerts': 'performance',
            'performance-warehouse-utilization-report': 'performance',
            'slotting-optimization-rules': 'slotting-optimization',
            'slotting-optimization-reports': 'slotting-optimization',
            'slotting-optimization-settings': 'slotting-optimization',
            'system-management-audit-log-viewer': 'system-management',
            'system-management-background-job-queue-viewer': 'system-management',
            'system-management-dif-incoming-message-viewer': 'system-management',
            'system-management-dif-outgoing-message-viewer': 'system-management',
            'system-management-display-properties': 'system-management',
            'system-management-license-key-information': 'system-management',
            'system-management-manual-inventory-adjustment': 'system-management',
            'system-management-scale-configuration': 'system-management',
            'system-management-system-text-editor': 'system-management',
            'system-management-user-activity-viewer': 'system-management',
            'archive-documents': 'archive',
            'archive-media': 'archive',
            'archive-financial': 'archive',
            'receiving-deliveries': 'receiving', 'receiving-returns': 'receiving', 'receiving-vendors': 'receiving',
            'order-new': 'order', 'order-pending': 'order', 'order-history': 'order',
            'work-tasks': 'work', 'work-schedule': 'work', 'work-teams': 'work',
            'cross-app-integrations': 'cross-application', 'cross-app-data-sync': 'cross-application', 'cross-app-api': 'cross-application',
            'yard': 'inventory', 'warehouse': 'inventory', 'storage': 'inventory',
            'performance-kpis': 'performance', 'performance-analytics': 'performance', 'performance-goals': 'performance',
            'system-users': 'system-management', 'system-logs': 'system-management', 'system-backup': 'system-management',
            'setting-optimization-general': 'setting-optimization',
            'setting-optimization-performance': 'setting-optimization',
            'setting-optimization-notifications': 'setting-optimization',
            'locating-strategies': 'setting-optimization',
            'locating-rule': 'setting-optimization',
            'security-group': 'system-management',
            'security-permission': 'system-management',
        };

        window.toggleChildren = function(category) {
            const childrenDiv = document.getElementById(`${category}-children`);
            const arrowIcon = document.getElementById(`${category}-arrow`);

            if (childrenDiv && arrowIcon) {
                // Close all other open sections
                document.querySelectorAll('.sidebar-section .space-y-1:not(.hidden)').forEach(openContainer => {
                    if (openContainer.id !== `${category}-children`) {
                        openContainer.classList.add('hidden');
                        const openArrow = document.getElementById(openContainer.id.replace('-children', '-arrow'));
                        if (openArrow) {
                            openArrow.classList.remove('rotate-90');
                            openArrow.classList.add('rotate-0');
                        }
                    }
                });

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
            const userIconContainer = document.querySelector('header .flex.justify-end.items-center.space-x-3');
            const userDropdown = document.getElementById('user-dropdown');
            const searchInput = document.getElementById('search-input');
            const searchHistoryDropdown = document.getElementById('search-history-dropdown');
            const configDropdown = document.getElementById('config-dropdown');
            const configDropdownToggle = document.getElementById('config-dropdown-toggle');


            if (userIconContainer && userDropdown && !userIconContainer.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
            if (!searchInput.contains(event.target) && !searchHistoryDropdown.contains(event.target)) {
                searchHistoryDropdown.classList.add('hidden');
            }
            // Close config dropdown if click outside
            if (configDropdown && !configDropdown.contains(event.target) && !configDropdownToggle.contains(event.target)) {
                configDropdown.classList.add('hidden');
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

        // --- New DCS Dropdown Functionality ---
        /**
         * Toggles the visibility of the DCS dropdown.
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
         * Handles selection of an option from the DCS dropdown.
         * @param {string} option - The selected option (e.g., 'DCC', 'DCS').
         */
        window.selectConfigOption = function(option) {
            const configDropdownToggle = document.getElementById('config-dropdown-toggle');
            configDropdownToggle.querySelector('span').textContent = option; // Update button text
            document.getElementById('config-dropdown').classList.add('hidden'); // Hide dropdown
            // Redirect to configuration.html with the selected option
            window.location.href = `configuration.html?option=${option}`;
        };

        // Close DCS dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const configDropdown = document.getElementById('config-dropdown');
            const configDropdownToggle = document.getElementById('config-dropdown-toggle');
            if (configDropdown && !configDropdown.contains(event.target) && !configDropdownToggle.contains(event.target)) {
                configDropdown.classList.add('hidden');
            }
        });

    });

})();
