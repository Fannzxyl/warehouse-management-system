(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // Memastikan window.contentData sudah tersedia
        if (typeof window.contentData === 'undefined') {
            window.contentData = {};
        }
        if (typeof window.searchItems === 'undefined') window.searchItems = [];
        if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
        if (typeof window.allMenus === 'undefined') window.allMenus = [];
        
        // --- INVENTORY CONTROL: landing page + daftar anak ---
        const invChildren = [
            'adjustment-type', 'harmonized-code', 'inventory-control-values', 'inventory-status',
            'item', 'item-class', 'item-cross-reference', 'item-location-assignment',
            'item-location-capacity', 'item-template', 'item-unit-of-measure',
            'location', 'location-class', 'location-status', 'location-template', 'location-type',
            'lot-template', 'movement-class', 'serial-number-template', 'storage-template',
            'zone', 'zone-type'
        ];

        // judul & deskripsi singkat untuk kartu
        const invMeta = {
            'adjustment-type': ['Adjustment Type', 'Manage adjustment types for stock transactions.'],
            'harmonized-code': ['Harmonized Code', 'Classification codes for inventory.'],
            'inventory-control-values': ['Inventory Control Values', 'Defaults & control flags.'],
            'inventory-status': ['Inventory Status', 'Available, Damaged, Hold, etc.'],
            'item': ['Item', 'Master data for items.'],
            'item-class': ['Item Class', 'Group items for easier control.'],
            'item-cross-reference': ['Item Cross Reference', 'Alternate/Supplier part numbers.'],
            'item-location-assignment': ['Item Location Assignment', 'Bind item to locations.'],
            'item-location-capacity': ['Item Location Capacity', 'Capacity rules per item/location.'],
            'item-template': ['Item Template', 'Reusable new item templates.'],
            'item-unit-of-measure': ['Item Unit of Measure', 'UoM list and conversions.'],
            'location': ['Location', 'Locations master.'],
            'location-class': ['Location Class', 'Group locations by class.'],
            'location-status': ['Location Status', 'Usable, Blocked, Audit, etc.'],
            'location-template': ['Location Template', 'Blueprint to create locations.'],
            'location-type': ['Location Type', 'Type by size/weight limits.'],
            'lot-template': ['Lot Template', 'Auto-generate lot pattern.'],
            'movement-class': ['Movement Class', 'Velocity/ABC movement classes.'],
            'serial-number-template': ['Serial Number Template', 'Pattern for serials.'],
            'storage-template': ['Storage Template', 'Storage rule presets.'],
            'zone': ['Zone', 'Warehouse zones.'],
            'zone-type': ['Zone Type', 'Types of zones.']
        };

        // Halaman landing page untuk Inventory Control
        window.contentData['inventory-control'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">
                    Inventory Control
                </h2>
                <p class="text-wise-gray mb-6">Select a sub-category to manage inventory controls.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${invChildren.map(k => `
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md hover:shadow-lg transition">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">${invMeta[k][0]}</h3>
                            <p class="text-wise-gray text-sm">${invMeta[k][1]}</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition"
                                    onclick="selectCategory('${k}')">
                                Open
                            </button>
                        </div>
                    `).join('')}
                </div>`
        };

        // Konten untuk setiap sub-menu Inventory Control
        window.contentData['adjustment-type'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Adjustment Type</h2>
                <p class="text-gray-600">Manage adjustment types used in inventory transactions.</p>
                <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform mt-2" onclick="showAdjustmentTypeForm('create')">
                    Create New Adjustment Type
                </button>
                <div id="adjustment-type-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>
            `,
        };
        // Tambahkan konten untuk semua sub-menu lainnya...
        window.contentData['harmonized-code'] = { full: `<h2 class="text-xl font-semibold mb-4">Harmonized Code</h2><p class="text-gray-600">Manage harmonized codes for inventory classification.</p>` };
        window.contentData['inventory-control-values'] = { full: `<h2 class="text-xl font-semibold mb-4">Inventory Control Values</h2><p class="text-gray-600">Configure inventory control values and defaults.</p>` };
        window.contentData['inventory-status'] = { full: `<h2 class="text-xl font-semibold mb-4">Inventory Status</h2><p class="text-gray-600">Manage different inventory statuses (e.g., Available, Damaged).</p>` };
        window.contentData['item'] = { full: `<h2 class="text-xl font-semibold mb-4">Item</h2><p class="text-gray-600">Manage all items in the inventory.</p>` };
        window.contentData['item-class'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Class</h2><p class="text-gray-600">Group items into classes for easier management.</p>` };
        window.contentData['item-cross-reference'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Cross Reference</h2><p class="text-gray-600">Manage cross-references for items (e.g., different part numbers).</p>` };
        window.contentData['item-location-assignment'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Location Assignment</h2><p class="text-gray-600">Assign specific items to warehouse locations.</p>` };
        window.contentData['item-location-capacity'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Location Capacity</h2><p class="text-gray-600">Define capacity rules for items in specific locations.</p>` };
        window.contentData['item-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Template</h2><p class="text-gray-600">Create templates for new items to standardize properties.</p>` };
        window.contentData['item-unit-of-measure'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Unit of Measure</h2><p class="text-gray-600">Manage different units of measure for items.</p>` };
        window.contentData['location'] = { full: `<h2 class="text-xl font-semibold mb-4">Location</h2><p class="text-gray-600">Manage all storage locations in the warehouse.</p>` };
        window.contentData['location-class'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Class</h2><p class="text-gray-600">Categorize locations for logical grouping and rules.</p>` };
        window.contentData['location-status'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Status</h2><p class="text-gray-600">Define statuses for warehouse locations (e.g., Available, Damaged).</p>` };
        window.contentData['location-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Template</h2><p class="text-gray-600">Create templates for locations to standardize properties.</p>` };
        window.contentData['location-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Type</h2><p class="text-gray-600">Configure storage location types based on dimensions and weight.</p>` };
        window.contentData['lot-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Lot Template</h2><p class="text-gray-600">Define templates for lot numbers and expiration rules.</p>` };
        window.contentData['movement-class'] = { full: `<h2 class="text-xl font-semibold mb-4">Movement Class</h2><p class="text-gray-600">Categorize movements for tracking and reporting purposes.</p>` };
        window.contentData['serial-number-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Serial Number Template</h2><p class="text-gray-600">Create templates for serial number generation.</p>` };
        window.contentData['storage-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Storage Template</h2><p class="text-gray-600">Manage templates for storage configurations.</p>` };
        window.contentData['zone'] = { full: `<h2 class="text-xl font-semibold mb-4">Zone</h2><p class="text-gray-600">Manage all zones in the warehouse.</p>` };
        window.contentData['zone-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Zone Type</h2><p class="text-gray-600">Manage different zone types in the warehouse.</p>` };

        // Mapping parent→children & registrasi ke pencarian/menu global
        window.parentMapping['inventory-control'] = 'configuration'; // Parent dari Inventory Control adalah Configuration
        invChildren.forEach(key => {
            window.parentMapping[key] = 'inventory-control'; // Child → parent
            // Daftarkan ke menu & pencarian global
            window.searchItems.push({ id: key, title: invMeta[key][0], category: 'Inventory Control', lastUpdated: 'Latest' });
            window.allMenus.push({ name: invMeta[key][0], category: 'Inventory Control' });
        });
        
        // Daftarkan key root juga
        window.searchItems.push({ id: 'inventory-control', title: 'Inventory Control', category: 'Configurations', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Inventory Control', category: 'Configurations' });

        // DUMMY DATA & RENDER FUNCTIONS
        let adjustmentTypes = JSON.parse(localStorage.getItem('adjustmentTypes')) || [
            { id: 'ADJ001', identifier: 'ADJ_PLUS', recordType: 'ADJTYPE', description: 'Positive Adjustment', inactive: false, systemCreated: true },
            { id: 'ADJ002', identifier: 'ADJ_MINUS', recordType: 'ADJTYPE', description: 'Negative Adjustment', inactive: false, systemCreated: true },
        ];

        function saveAdjustmentTypes() { localStorage.setItem('adjustmentTypes', JSON.stringify(adjustmentTypes)); }

        window.renderAdjustmentTypeList = function(filter = '') {
            const container = document.getElementById('adjustment-type-list-container');
            if (!container) return;
            const filteredData = adjustmentTypes.filter(ad => ad.identifier.toLowerCase().includes(filter.toLowerCase()) || ad.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-left">System Created</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;
            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No adjustment types found.</td></tr>`;
            } else {
                filteredData.forEach(ad => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${ad.identifier}</td>
                            <td class="py-3 px-6 text-left">${ad.description}</td>
                            <td class="py-3 px-6 text-left">${ad.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${ad.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAdjustmentTypeForm('edit', '${ad.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAdjustmentType('${ad.id}')" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            tableHtml += `</tbody></table>`;
            container.innerHTML = tableHtml;
        };

        window.showAdjustmentTypeForm = function(mode, id = null) {
            const modal = document.getElementById('adjustment-type-form-modal');
            const form = document.getElementById('adjustment-type-form');
            const title = document.getElementById('adjustment-type-form-title');
            const submitButton = document.getElementById('adj-type-submit-button');
            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;
            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });
            if (mode === 'create') {
                title.textContent = 'Create New Adjustment Type';
                submitButton.textContent = 'Save';
            } else {
                title.textContent = 'Edit Adjustment Type';
                submitButton.textContent = 'Update';
                const type = adjustmentTypes.find(at => at.id === id);
                if (type) {
                    document.getElementById('adj-type-identifier').value = type.identifier;
                    document.getElementById('adj-type-description').value = type.description;
                    document.getElementById('adj-type-inactive').checked = type.inactive;
                    document.getElementById('adj-type-system-created').checked = type.systemCreated;
                    if (type.systemCreated) {
                         document.getElementById('adj-type-identifier').setAttribute('readonly', true);
                         document.getElementById('adj-type-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAdjustmentTypeForm = function() {
            document.getElementById('adjustment-type-form-modal').classList.add('hidden');
            document.getElementById('adjustment-type-form-modal').classList.remove('flex');
        };

        window.handleAdjustmentTypeSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            const newType = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['inactive'].checked,
                systemCreated: form['systemCreated'].checked,
            };
            if (mode === 'create') {
                newType.id = 'ADJ' + String(adjustmentTypes.length + 1).padStart(3, '0');
                adjustmentTypes.push(newType);
                await window.showCustomAlert('Success', 'Adjustment Type created successfully!');
            } else {
                const index = adjustmentTypes.findIndex(at => at.id === id);
                if (index !== -1) {
                    adjustmentTypes[index] = { ...adjustmentTypes[index], ...newType };
                    await window.showCustomAlert('Success', 'Adjustment Type updated successfully!');
                }
            }
            saveAdjustmentTypes();
            closeAdjustmentTypeForm();
            window.renderAdjustmentTypeList();
        };

        window.deleteAdjustmentType = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this adjustment type?');
            if (confirmed) {
                adjustmentTypes = adjustmentTypes.filter(ad => ad.id !== id);
                saveAdjustmentTypes();
                window.renderAdjustmentTypeList();
                await window.showCustomAlert('Deleted', 'Adjustment Type deleted successfully!');
            }
        };

        // ======================================
        // AUTO-RENDER on MOUNT
        // ======================================
        (function autoRenderV3() {
            const obs = new MutationObserver(() => {
                const c1 = document.getElementById('adjustment-type-list-container');
                if (c1) window.renderAdjustmentTypeList();
                const c2 = document.getElementById('harmonized-code-list-container');
                if (c2) console.log('Rendering harmonized code list...'); // Placeholder render call
                const c3 = document.getElementById('inventory-status-list-container');
                if (c3) console.log('Rendering inventory status list...'); // Placeholder render call
                
                const mainContentArea = document.getElementById('default-content-area');
                if (mainContentArea && mainContentArea.innerHTML.includes('Adjustment Type')) {
                    const adjustBtn = mainContentArea.querySelector('button[onclick*="showAdjustmentTypeForm"]');
                    if (adjustBtn) {
                        window.renderAdjustmentTypeList();
                        obs.disconnect();
                    }
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
        })();
        
        console.log('Configuration V3 (Inventory Control) loaded successfully');
    });
})();
