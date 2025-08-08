(function() {
    document.addEventListener('DOMContentLoaded', () => {

        // Memastikan variabel global dari configuration.js sudah tersedia
        // Ini penting karena configurationV2.js akan memperluas data yang ada di configuration.js
        if (typeof window.contentData === 'undefined') {
            console.error("Error: window.contentData is not defined. Ensure configuration.js is loaded before configurationV2.js and its variables are exposed globally.");
            return;
        }
        if (typeof window.searchItems === 'undefined') {
            console.error("Error: window.searchItems is not defined.");
            return;
        }
        if (typeof window.parentMapping === 'undefined') {
            console.error("Error: window.parentMapping is not defined.");
            return;
        }
        if (typeof window.allMenus === 'undefined') {
            console.error("Error: window.allMenus is not defined.");
            return;
        }
        if (typeof window.zones === 'undefined') {
            console.error("Error: window.zones is not defined.");
            return;
        }
        if (typeof window.showCustomAlert === 'undefined') {
            console.error("Error: window.showCustomAlert is not defined.");
            return;
        }
        if (typeof window.showCustomConfirm === 'undefined') {
            console.error("Error: window.showCustomConfirm is not defined.");
            return;
        }
        if (typeof window.setupTabSwitching === 'undefined') {
            console.error("Error: window.setupTabSwitching is not defined.");
            return;
        }
        // Asumsi locatingStrategies dan locationTypes juga global dari configuration.js
        if (typeof window.locatingStrategies === 'undefined') {
            console.warn("Warning: window.locatingStrategies is not defined. Using local dummy data.");
            window.locatingStrategies = [
                { id: 'LS001', identifier: 'FIFO', recordType: 'LOCSTRAT', description: 'First-In, First-Out', inactive: false, systemCreated: true },
                { id: 'LS002', identifier: 'LIFO', recordType: 'LOCSTRAT', description: 'Last-In, First-Out', inactive: false, systemCreated: false },
            ];
        }
        if (typeof window.locationTypes === 'undefined') {
            console.warn("Warning: window.locationTypes is not defined. Using local dummy data.");
            window.locationTypes = [
                { id: 'LT001', locationType: 'PALLET', length: 120, lengthUM: 'Centimeters', width: 100, height: 150, maximumWeight: 1000, weightUM: 'Kilograms', inactive: false },
                { id: 'LT002', locationType: 'SHELF', length: 60, lengthUM: 'Centimeters', width: 40, height: 30, maximumWeight: 50, weightUM: 'Kilograms', inactive: false },
            ];
        }


        // Memperluas objek contentData global dengan bagian-bagian baru
        Object.assign(window.contentData, {
            'allocation-rule': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Rule</h2>
                    <p class="text-wise-gray mb-4">Manage rules that determine how items are allocated from warehouse locations.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showAllocationRuleForm('create')">
                            Create New Allocation Rule
                        </button>
                        <input type="text" id="allocation-rule-search" placeholder="Search allocation rule..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationRuleList(this.value)">
                    </div>
                    <div id="allocation-rule-list-container" class="overflow-x-auto">
                        <!-- Tabel daftar Allocation Rule akan dirender di sini -->
                    </div>

                    <div id="allocation-rule-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="allocation-rule-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="allocation-rule-form" onsubmit="handleAllocationRuleSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="allocation-rule-name" class="block text-sm font-medium text-wise-dark-gray">Allocation Rule Name:</label>
                                            <input type="text" id="allocation-rule-name" name="ruleName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray" oninput="checkAllocationRuleFormValidity()">
                                        </div>
                                        <div>
                                            <label for="allocation-rule-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="allocation-rule-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray" oninput="checkAllocationRuleFormValidity()">
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="allocation-rule-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>

                                    <!-- Tombol Tab untuk Form Aturan Alokasi -->
                                    <div class="flex space-x-2 mb-2 border-b">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ar-detail-records">Detail Records</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ar-user-defined">User Defined Data</button>
                                    </div>

                                    <!-- Konten Tab Detail Records -->
                                    <div id="ar-detail-records" class="tab-content">
                                        <div class="mb-4">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Detail Records</h4>
                                            <div id="allocation-rule-detail-records-container" class="space-y-3 p-4 border border-wise-border rounded-md bg-wise-light-gray">
                                                <p id="allocation-detail-records-placeholder" class="text-wise-gray text-sm">Input Allocation Rule Name and Description first to enable detail records.</p>
                                                <div id="allocation-detail-records-list" class="space-y-2">
                                                    <!-- Detail records akan ditambahkan secara dinamis di sini -->
                                                </div>
                                                <button type="button" id="add-allocation-detail-record-btn" class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform" onclick="addAllocationDetailRecord()" disabled>Add Detail Record</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Konten Tab User Defined Data -->
                                    <div id="ar-user-defined" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${Array.from({ length: 8 }, (_, i) => `
                                            <div>
                                                <label for="ar-udf${i + 1}" class="block text-sm font-medium text-wise-dark-gray">User defined field ${i + 1}:</label>
                                                <input type="text" id="ar-udf${i + 1}" name="udf${i + 1}" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationRuleForm()">Cancel</button>
                                <button type="submit" form="allocation-rule-form" id="allocation-rule-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'allocation-strategies': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Strategies</h2>
                    <p class="text-wise-gray mb-4">Manage strategies used to allocate items from warehouse locations.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showAllocationStrategyForm('create')">
                            Create New Allocation Strategy
                        </button>
                        <input type="text" id="allocation-strategy-search" placeholder="Search allocation strategy..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationStrategyList(this.value)">
                    </div>
                    <div id="allocation-strategy-list-container" class="overflow-x-auto">
                        </div>

                    <div id="allocation-strategy-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="allocation-strategy-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="allocation-strategy-form" onsubmit="handleAllocationStrategySubmit(event)">
                                    <div class="mb-4">
                                        <label for="allocation-strategy-identifier" class="block text-sm font-medium text-wise-dark-gray">Identifier:</label>
                                        <input type="text" id="allocation-strategy-identifier" name="identifier" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label for="allocation-strategy-record-type" class="block text-sm font-medium text-wise-dark-gray">Record type:</label>
                                        <input type="text" id="allocation-strategy-record-type" name="recordType" value="ALLOCSTRAT" readonly class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-gray-100 text-wise-gray cursor-not-allowed">
                                    </div>
                                    <div class="mb-4">
                                        <label for="allocation-strategy-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="allocation-strategy-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>
                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="allocation-strategy-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                    <div class="mb-4">
                                    <label class="inline-flex items-center">
                                        <input type="checkbox" id="allocation-strategy-system-created" name="systemCreated" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                        <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                    </label>
                                </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationStrategyForm()">Cancel</button>
                                <button type="submit" form="allocation-strategy-form" id="allocation-strategy-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
        });

        // Menambahkan kategori baru ke searchItems global
        window.searchItems.push(
            { id: 'allocation-rule', title: 'Allocation Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'allocation-strategies', title: 'Allocation Strategies', category: 'Configuration', lastUpdated: 'Latest' }
        );

        // Menambahkan menu baru ke allMenus global untuk izin keamanan
        window.allMenus.push(
            { name: 'Allocation Rule', category: 'Configurations' },
            { name: 'Allocation Strategies', category: 'Configurations' }
        );

        // Menambahkan pemetaan induk untuk kategori baru
        window.parentMapping['allocation-rule'] = 'configuration';
        window.parentMapping['allocation-strategies'] = 'configuration';

        // Data dummy untuk Allocation Rules
        let allocationRules = JSON.parse(localStorage.getItem('allocationRules')) || [
            { id: 'AR001', ruleName: 'Standard Allocation', description: 'Default rule for item allocation', inactive: false, detailRecords: [], udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '' },
            { id: 'AR002', ruleName: 'FIFO Allocation', description: 'First-In, First-Out allocation', inactive: false, detailRecords: [], udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '' },
        ];

        // Data dummy untuk Allocation Strategies
        let allocationStrategies = JSON.parse(localStorage.getItem('allocationStrategies')) || [
            { id: 'AS001', identifier: 'AKUR Pre Allocation Strategy', recordType: 'ALLOCSTRAT', description: 'AKUR Pre Allocation Strategy', systemValueI: 'MD03', inactive: false, systemCreated: true },
            { id: 'AS002', identifier: 'CLOSEST', recordType: 'ALLOCSTRAT', description: 'Closest Match - allocate least available that fits entire request', systemValueI: '30', inactive: false, systemCreated: true },
            { id: 'AS003', identifier: 'FIRST_EXP', recordType: 'ALLOCSTRAT', description: 'First expiration, first out', systemValueI: '40', inactive: false, systemCreated: true },
            { id: 'AS004', identifier: 'FIRST_IN', recordType: 'ALLOCSTRAT', description: 'First in, first out', systemValueI: '50', inactive: false, systemCreated: true },
            { id: 'AS005', identifier: 'ITEM_LOC_ASSIGN', recordType: 'ALLOCSTRAT', description: 'Item location assignment', systemValueI: '10', inactive: false, systemCreated: true },
            { id: 'AS006', identifier: 'ITEM_LOC_OVER_ALLOC', recordType: 'ALLOCSTRAT', description: 'Item location assignment with over allocation allowed', systemValueI: '20', inactive: false, systemCreated: true },
            { id: 'AS007', identifier: 'LAST_EXP', recordType: 'ALLOCSTRAT', description: 'Last expired, first out', systemValueI: '90', inactive: false, systemCreated: true },
            { id: 'AS008', identifier: 'LAST_IN', recordType: 'ALLOCSTRAT', description: 'Last in, first out', systemValueI: '60', inactive: false, systemCreated: true },
            { id: 'AS009', identifier: 'MAX_SPACE', recordType: 'ALLOCSTRAT', description: 'Maximize space - allocate least available first', systemValueI: '70', inactive: false, systemCreated: true },
            { id: 'AS010', identifier: 'MIN_VISITS', recordType: 'ALLOCSTRAT', description: 'Minimize visits - allocate most available first', systemValueI: '80', inactive: false, systemCreated: true },
        ];


        // Data dummy untuk Allocation Types (digunakan di detail records Allocation Rule)
        const allocationTypes = [
            { id: 'AT001', name: 'Full Pallet' },
            { id: 'AT002', name: 'Case Pick' },
            { id: 'AT003', name: 'Each Pick' },
        ];

        // --- Fungsi pembantu untuk persistensi data ---
        function saveAllocationRules() { localStorage.setItem('allocationRules', JSON.stringify(allocationRules)); }
        function saveAllocationStrategies() { localStorage.setItem('allocationStrategies', JSON.stringify(allocationStrategies)); }

        // --- Fungsi Manajemen Allocation Rule ---
        window.renderAllocationRuleList = function(filter = '') {
            const container = document.getElementById('allocation-rule-list-container');
            if (!container) return;

            const filteredRules = allocationRules.filter(ar =>
                ar.ruleName.toLowerCase().includes(filter.toLowerCase()) ||
                ar.description.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Rule Name</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredRules.length === 0) {
                tableHtml += `
                    <tr>
                        <td colspan="4" class="py-3 px-6 text-center">No allocation rules found.</td>
                    </tr>
                `;
            } else {
                filteredRules.forEach(ar => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${ar.ruleName}</td>
                            <td class="py-3 px-6 text-left">${ar.description}</td>
                            <td class="py-3 px-6 text-left">${ar.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAllocationRuleForm('edit', '${ar.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationRule('${ar.id}')" title="Delete">
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

        window.filterAllocationRuleList = function(value) {
            renderAllocationRuleList(value);
        };

        window.showAllocationRuleForm = function(mode, id = null) {
            const modal = document.getElementById('allocation-rule-form-modal');
            const form = document.getElementById('allocation-rule-form');
            const title = document.getElementById('allocation-rule-form-title');
            const submitButton = document.getElementById('allocation-rule-submit-button');

            form.reset(); // Mengosongkan field form
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Mengatur ulang tab ke default (Detail Records)
            window.setupTabSwitching('allocation-rule-form-modal');

            // Mengatur ulang semua field input ke gaya default
            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            const detailRecordsContainer = document.getElementById('allocation-rule-detail-records-container');
            const detailRecordsPlaceholder = document.getElementById('allocation-detail-records-placeholder');
            const addDetailRecordBtn = document.getElementById('add-allocation-detail-record-btn');

            if (mode === 'create') {
                title.textContent = 'Create New Allocation Rule';
                submitButton.textContent = 'Save';
                detailRecordsContainer.classList.add('bg-wise-light-gray', 'cursor-not-allowed');
                detailRecordsPlaceholder.classList.remove('hidden');
                document.getElementById('allocation-detail-records-list').innerHTML = '';
                addDetailRecordBtn.setAttribute('disabled', true);
                // Mengosongkan UDF untuk pembuatan baru
                for (let i = 1; i <= 8; i++) {
                    document.getElementById(`ar-udf${i}`).value = '';
                }
            } else { // mode edit
                title.textContent = 'Edit Allocation Rule';
                submitButton.textContent = 'Update';
                const rule = allocationRules.find(ar => ar.id === id);
                if (rule) {
                    document.getElementById('allocation-rule-name').value = rule.ruleName;
                    document.getElementById('allocation-rule-description').value = rule.description;
                    document.getElementById('allocation-rule-inactive').checked = rule.inactive;

                    // Mengaktifkan bagian detail records dan mengisi data
                    detailRecordsContainer.classList.remove('bg-wise-light-gray', 'cursor-not-allowed');
                    detailRecordsPlaceholder.classList.add('hidden');
                    addDetailRecordBtn.removeAttribute('disabled');
                    renderAllocationDetailRecords(rule.detailRecords);

                    // Mengisi UDF
                    for (let i = 1; i <= 8; i++) {
                        document.getElementById(`ar-udf${i}`).value = rule[`udf${i}`] || '';
                    }
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAllocationRuleForm = function() {
            document.getElementById('allocation-rule-form-modal').classList.add('hidden');
            document.getElementById('allocation-rule-form-modal').classList.remove('flex');
        };

        window.handleAllocationRuleSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const detailRecords = Array.from(document.querySelectorAll('#allocation-detail-records-list .allocation-detail-record-item')).map(item => {
                return {
                    sequence: parseInt(item.querySelector('[name="allocation-detail-sequence"]').value),
                    allocationStrategy: item.querySelector('[name="allocation-detail-strategy"]').value,
                    allocationType: item.querySelector('[name="allocation-detail-type"]').value,
                    zone: item.querySelector('[name="allocation-detail-zone"]').value,
                    inactive: item.querySelector('[name="allocation-detail-inactive"]').checked,
                };
            });

            const newRule = {
                ruleName: form['ruleName'].value,
                description: form['description'].value,
                inactive: form['allocation-rule-inactive'].checked,
                detailRecords: detailRecords
            };
            for (let i = 1; i <= 8; i++) {
                newRule[`udf${i}`] = form[`udf${i}`].value;
            }


            if (mode === 'create') {
                newRule.id = 'AR' + String(allocationRules.length + 1).padStart(3, '0');
                allocationRules.push(newRule);
                await window.showCustomAlert('Success', 'Allocation Rule created successfully!');
            } else {
                const index = allocationRules.findIndex(ar => ar.id === id);
                if (index !== -1) {
                    allocationRules[index] = { ...allocationRules[index], ...newRule };
                    await window.showCustomAlert('Success', 'Allocation Rule updated successfully!');
                }
            }
            saveAllocationRules();
            closeAllocationRuleForm();
            renderAllocationRuleList();
        };

        window.deleteAllocationRule = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation rule?');
            if (confirmed) {
                allocationRules = allocationRules.filter(ar => ar.id !== id);
                saveAllocationRules();
                renderAllocationRuleList();
                await window.showCustomAlert('Deleted', 'Allocation Rule deleted successfully!');
            }
        };

        window.checkAllocationRuleFormValidity = function() {
            const ruleNameInput = document.getElementById('allocation-rule-name');
            const descriptionInput = document.getElementById('allocation-rule-description');
            const detailRecordsContainer = document.getElementById('allocation-rule-detail-records-container');
            const detailRecordsPlaceholder = document.getElementById('allocation-detail-records-placeholder');
            const addDetailRecordBtn = document.getElementById('add-allocation-detail-record-btn');

            if (ruleNameInput.value.trim() !== '' && descriptionInput.value.trim() !== '') {
                detailRecordsContainer.classList.remove('bg-wise-light-gray', 'cursor-not-allowed');
                detailRecordsPlaceholder.classList.add('hidden');
                addDetailRecordBtn.removeAttribute('disabled');
            } else {
                detailRecordsContainer.classList.add('bg-wise-light-gray', 'cursor-not-allowed');
                detailRecordsPlaceholder.classList.remove('hidden');
                addDetailRecordBtn.setAttribute('disabled', true);
                document.getElementById('allocation-detail-records-list').innerHTML = ''; // Mengosongkan record yang ada jika dinonaktifkan
            }
        };

        window.addAllocationDetailRecord = function(record = {}) {
            const detailRecordsList = document.getElementById('allocation-detail-records-list');
            const newIndex = detailRecordsList.children.length;

            const div = document.createElement('div');
            div.className = 'allocation-detail-record-item p-3 border border-wise-border rounded-md bg-white relative';
            div.innerHTML = `
                <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="removeAllocationDetailRecord(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label for="allocation-detail-sequence-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Sequence:</label>
                        <input type="number" id="allocation-detail-sequence-${newIndex}" name="allocation-detail-sequence" value="${record.sequence || (newIndex + 1) * 10}" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                    </div>
                    <div>
                        <label for="allocation-detail-strategy-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Allocation Strategy:</label>
                        <select id="allocation-detail-strategy-${newIndex}" name="allocation-detail-strategy" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${window.locatingStrategies.map(as => `<option value="${as.identifier}" ${record.allocationStrategy === as.identifier ? 'selected' : ''}>${as.identifier} - ${as.description}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="allocation-detail-type-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Allocation Type:</label>
                        <select id="allocation-detail-type-${newIndex}" name="allocation-detail-type" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${allocationTypes.map(at => `<option value="${at.name}" ${record.allocationType === at.name ? 'selected' : ''}>${at.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="allocation-detail-zone-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Zone:</label>
                        <select id="allocation-detail-zone-${newIndex}" name="allocation-detail-zone" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${window.zones.map(z => `<option value="${z.identifier}" ${record.zone === z.identifier ? 'selected' : ''}>${z.identifier}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-span-full">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="allocation-detail-inactive-${newIndex}" name="allocation-detail-inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${record.inactive ? 'checked' : ''}>
                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                        </label>
                    </div>
                </div>
            `;
            detailRecordsList.appendChild(div);
        };

        window.renderAllocationDetailRecords = function(records) {
            const detailRecordsList = document.getElementById('allocation-detail-records-list');
            detailRecordsList.innerHTML = '';
            records.sort((a, b) => a.sequence - b.sequence); // Urutkan berdasarkan sequence
            records.forEach(record => addAllocationDetailRecord(record));
        };

        window.removeAllocationDetailRecord = function(button) {
            const recordItem = button.closest('.allocation-detail-record-item');
            if (recordItem) {
                recordItem.remove();
            }
        };

        // --- Fungsi Manajemen Allocation Strategy ---
        window.renderAllocationStrategyList = function(filter = '') {
    const container = document.getElementById('allocation-strategy-list-container');
    if (!container) return;

    const filteredStrategies = allocationStrategies.filter(as =>
        as.identifier.toLowerCase().includes(filter.toLowerCase()) ||
        as.description.toLowerCase().includes(filter.toLowerCase())
    );

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">System Value I</th>
                    <th class="py-3 px-6 text-left">System Created</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-left">Identifier</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredStrategies.length === 0) {
        tableHtml += `
            <tr>
                <td colspan="6" class="py-3 px-6 text-center">No allocation strategies found.</td>
            </tr>
        `;
    } else {
        filteredStrategies.forEach(as => {
            tableHtml += `
                <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                    <td class="py-3 px-6 text-left">${as.description}</td>
                    <td class="py-3 px-6 text-left">${as.systemValueI || ''}</td>
                    <td class="py-3 px-6 text-left">${as.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-left">${as.inactive ? 'No' : 'Yes'}</td>
                    <td class="py-3 px-6 text-left whitespace-nowrap">${as.identifier}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAllocationStrategyForm('edit', '${as.id}')" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationStrategy('${as.id}')" title="Delete">
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

        window.filterAllocationStrategyList = function(value) {
            renderAllocationStrategyList(value);
        };

        window.showAllocationStrategyForm = function(mode, id = null) {
            const modal = document.getElementById('allocation-strategy-form-modal');
            const form = document.getElementById('allocation-strategy-form');
            const title = document.getElementById('allocation-strategy-form-title');
            const submitButton = document.getElementById('allocation-strategy-submit-button');

            form.reset(); // Mengosongkan field form
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Mengatur ulang semua field input ke gaya default
            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
        title.textContent = 'Create New Allocation Strategy';
        submitButton.textContent = 'Save';
        document.getElementById('allocation-strategy-record-type').value = 'ALLOCSTRAT';
        document.getElementById('allocation-strategy-record-type').setAttribute('readonly', true);
        document.getElementById('allocation-strategy-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
        document.getElementById('allocation-strategy-system-created').checked = false; 

    } else { // mode edit
        title.textContent = 'Edit Allocation Strategy';
        submitButton.textContent = 'Update';
        const strategy = allocationStrategies.find(as => as.id === id);
        if (strategy) {
                    document.getElementById('allocation-strategy-identifier').value = strategy.identifier;
                    document.getElementById('allocation-strategy-record-type').value = strategy.recordType;
                    document.getElementById('allocation-strategy-description').value = strategy.description;
                    document.getElementById('allocation-strategy-inactive').checked = strategy.inactive;
                    document.getElementById('allocation-strategy-system-created').checked = strategy.systemCreated;
                    document.getElementById('allocation-strategy-system-created').checked = strategy.systemCreated;
                    
                    // Buat identifier dan recordType readonly untuk strategi yang dibuat sistem
                    if (strategy.systemCreated) {
                        document.getElementById('allocation-strategy-identifier').setAttribute('readonly', true);
                        document.getElementById('allocation-strategy-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                        document.getElementById('allocation-strategy-record-type').setAttribute('readonly', true);
                        document.getElementById('allocation-strategy-record-type').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    } else {
                        document.getElementById('allocation-strategy-system-created').removeAttribute('disabled'); // Aktifkan jika tidak dibuat sistem
                    }
                }
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAllocationStrategyForm = function() {
            document.getElementById('allocation-strategy-form-modal').classList.add('hidden');
            document.getElementById('allocation-strategy-form-modal').classList.remove('flex');
        };

        window.handleAllocationStrategySubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newStrategy = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['allocation-strategy-inactive'].checked,
                systemCreated: form['allocation-strategy-system-created'].checked,
            };

            if (mode === 'create') {
                newStrategy.id = 'AS' + String(allocationStrategies.length + 1).padStart(3, '0');
                allocationStrategies.push(newStrategy);
                await window.showCustomAlert('Success', 'Allocation Strategy created successfully!');
            } else {
                const index = allocationStrategies.findIndex(as => as.id === id);
                if (index !== -1) {
                    allocationStrategies[index] = { ...allocationStrategies[index], ...newStrategy };
                    await window.showCustomAlert('Success', 'Allocation Strategy updated successfully!');
                }
            }
            saveAllocationStrategies();
            closeAllocationStrategyForm();
            renderAllocationStrategyList();
        };

        window.deleteAllocationStrategy = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation strategy?');
            if (confirmed) {
                allocationStrategies = allocationStrategies.filter(as => as.id !== id);
                saveAllocationStrategies();
                renderAllocationStrategyList();
                await window.showCustomAlert('Deleted', 'Allocation Strategy deleted successfully!');
            }
        };

        //ini adalah tempat dimana untuk myembungkan antar configurasiV2.js degngan configurasi.js
       window.selectCategory('configuration');
    });
})();
