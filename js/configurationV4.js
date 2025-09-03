(function () {
    document.addEventListener('DOMContentLoaded', () => {
        // Memastikan variabel global sudah tersedia
        if (typeof window.contentData === 'undefined') window.contentData = {};
        if (typeof window.searchItems === 'undefined') window.searchItems = [];
        if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
        if (typeof window.allMenus === 'undefined') window.allMenus = [];

        // --- UTILITY FUNCTIONS ---
        // Reuse global functions from configuration.js and other modules
        const debounce = window.debounce || ((fn, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        });

        // Mendefinisikan IUoM data model
        let itemUoms = JSON.parse(localStorage.getItem('itemUoms')) || [];
        
        // Data dummy untuk UoM, Item, Item Class, dan Company
        const uoms = ['PC', 'BOX', 'PLT', 'KG', 'LBS'];
        const itemCodes = ['000000053068_1', '000000053069_1', '000000053070_1', '000000053071_1'];
        const itemClasses = ['GENERAL', 'FOOD', 'NON-FOOD', 'FROZEN'];
        const companies = ['DCB', 'DCI', 'DMR'];
        const movementClasses = ['GRAY', 'YMA', 'YMB', 'YMW', 'YMC', 'YMK', 'YMD', 'YMX', 'YMF'];

        function seedIUoMData() {
            if (itemUoms.length === 0) {
                const dummyData = [
                    {
                        id: 'IUOM001',
                        targetType: 'item',
                        itemCode: '000000053068_1',
                        itemClass: '',
                        company: 'DCB',
                        conversionQty: 12.00,
                        treatAsFullPercent: 100,
                        epcPackageId: 0,
                        movementClass: 'GRAY',
                        treatAsLooseInContainer: false,
                        length: 1.00, lengthUm: 'CM',
                        width: 1.00, widthUm: 'CM',
                        height: 1.00, heightUm: 'CM',
                        weight: 1.00, weightUm: 'KG',
                        udf: { udf1:'', udf2:'', udf3:'', udf4:'', udf5:'', udf6:'', udf7:'', udf8:'' },
                        updatedAt: '25-08-2017 9:00:48 PM'
                    },
                    {
                        id: 'IUOM002',
                        targetType: 'itemClass',
                        itemCode: '',
                        itemClass: 'GENERAL',
                        company: 'DCI',
                        conversionQty: 100.00,
                        treatAsFullPercent: 100,
                        epcPackageId: 0,
                        movementClass: 'YMA',
                        treatAsLooseInContainer: false,
                        length: 120.00, lengthUm: 'CM',
                        width: 100.00, widthUm: 'CM',
                        height: 150.00, heightUm: 'CM',
                        weight: 500.00, weightUm: 'KG',
                        udf: { udf1:'', udf2:'', udf3:'', udf4:'', udf5:'', udf6:'', udf7:'', udf8:'' },
                        updatedAt: '25-08-2017 9:00:48 PM'
                    },
                ];
                itemUoms = dummyData;
                saveIUoMs();
            }
        }
        
        // Init data
        seedIUoMData();

        function saveIUoMs() {
            localStorage.setItem('itemUoms', JSON.stringify(itemUoms));
        }
        
        // Registrasi modul ke window.contentData
        window.contentData['item-unit-of-measure'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Unit of Measure</h2>
                <p class="text-wise-gray mb-4">Mengelola unit of measure (UoM) dan konversi untuk item atau kelas item.</p>

                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div class="flex gap-2">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showIUoMForm('create')">
                            Create New IUoM
                        </button>
                        <button class="px-4 py-2 bg-gray-200 text-wise-dark-gray rounded-md hover:bg-gray-300 transition-colors duration-200 shadow-md active-press transform" onclick="exportIUoMToCSV()">
                            Export CSV
                        </button>
                        <label for="import-csv" class="cursor-pointer px-4 py-2 bg-gray-200 text-wise-dark-gray rounded-md hover:bg-gray-300 transition-colors duration-200 shadow-md active-press transform">
                            Import CSV
                            <input type="file" id="import-csv" accept=".csv" class="hidden" onchange="importIUoMFromCSV(event)">
                        </label>
                    </div>
                    <input type="text" id="iuom-search" placeholder="Cari IUoM..."
                        class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray max-w-sm" oninput="filterIUoMList(this.value)">
                </div>

                <div id="iuom-list-container" class="overflow-x-auto overflow-y-auto max-h-[70vh]">
                    <!-- Tabel akan dirender di sini -->
                </div>

                <!-- Modal IUoM Form -->
                <div id="iuom-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1200px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[90vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="iuom-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Item Unit of Measure</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeIUoMForm()" aria-label="Tutup">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="iuom-form" onsubmit="handleIUoMSubmit(event)">
                                <!-- General Info on top of tabs -->
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div class="md:col-span-1">
                                        <label for="iuom-company" class="block text-sm mb-1">Company:</label>
                                        <select id="iuom-company" name="company" class="select">
                                            <option value="">-- Pilih Perusahaan --</option>
                                            ${companies.map(c => `<option value="${c}">${c}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div id="iuom-item-code-field" class="md:col-span-2">
                                        <label for="iuom-item-code" class="block text-sm mb-1">Item:</label>
                                        <select id="iuom-item-code" name="itemCode" class="select">
                                            <option value="">-- Pilih Item Code --</option>
                                            ${itemCodes.map(ic => `<option value="${ic}">${ic}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div id="iuom-item-class-field" class="hidden md:col-span-2">
                                        <label for="iuom-item-class" class="block text-sm mb-1">Item class:</label>
                                        <select id="iuom-item-class" name="itemClass" class="select">
                                            <option value="">-- Pilih Item Class --</option>
                                            ${itemClasses.map(ic => `<option value="${ic}">${ic}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="md:col-span-1">
                                         <label class="block text-sm mb-1">UM:</label>
                                         <input type="text" id="iuom-um" name="um" class="input bg-gray-100 cursor-not-allowed" value="PC" readonly>
                                    </div>
                                    <div class="md:col-span-4 flex gap-4">
                                        <fieldset>
                                            <legend class="text-sm font-medium mb-2">Scope</legend>
                                            <div class="flex items-center space-x-4">
                                                <div class="flex items-center">
                                                    <input type="radio" id="scope-item-radio" name="targetType" value="item" class="custom-radio" onchange="toggleScopeInputs()" checked>
                                                    <label for="scope-item-radio" class="ml-2 text-sm text-wise-dark-gray">Item</label>
                                                </div>
                                                <div class="flex items-center">
                                                    <input type="radio" id="scope-itemclass-radio" name="targetType" value="itemClass" class="custom-radio" onchange="toggleScopeInputs()">
                                                    <label for="scope-itemclass-radio" class="ml-2 text-sm text-wise-dark-gray">Item class</label>
                                                </div>
                                            </div>
                                        </fieldset>
                                        <div class="flex items-center">
                                            <label class="flex items-center gap-2 text-sm">
                                                <input type="checkbox" id="iuom-inactive" name="inactive"> Inactive
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <!-- Tabs -->
                                <div role="tablist" id="iuom-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button type="button" role="tab" data-tab="iuom-gen-tab" class="tab-active">General</button>
                                    <button type="button" role="tab" data-tab="iuom-dims-tab" class="tab">Dimensions</button>
                                    <button type="button" role="tab" data-tab="iuom-slot-tab" class="tab">Slotting values</button>
                                    <button type="button" role="tab" data-tab="iuom-ud-tab" class="tab">User defined data</button>
                                </div>
                                <!-- Tab Panes -->
                                <div id="iuom-gen-tab" role="tabpanel" data-pane="iuom-gen-tab" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label for="iuom-conversion-qty" class="block text-sm mb-1">Conversion qty:</label>
                                        <input type="number" step="0.01" id="iuom-conversion-qty" name="conversionQty" class="input" value="1.00">
                                    </div>
                                    <div>
                                        <label for="iuom-treat-as-full" class="block text-sm mb-1">Treat as full percent:</label>
                                        <div class="relative">
                                            <input type="number" id="iuom-treat-as-full" name="treatAsFullPercent" class="input pr-8" value="100">
                                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-wise-gray">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="iuom-epc-package-id" class="block text-sm mb-1">Epc package id:</label>
                                        <input type="number" id="iuom-epc-package-id" name="epcPackageId" class="input" value="0">
                                    </div>
                                    <div>
                                        <label for="iuom-movement-class" class="block text-sm mb-1">Movement class:</label>
                                        <select id="iuom-movement-class" name="movementClass" class="select">
                                            <option value="">-- Select --</option>
                                            ${movementClasses.map(mc => `<option value="${mc}">${mc}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input type="checkbox" id="iuom-loose-in-container" name="treatAsLooseInContainer"> Treat as loose in container creation
                                        </label>
                                    </div>
                                </div>
                                <div id="iuom-dims-tab" role="tabpanel" data-pane="iuom-dims-tab" class="hidden grid grid-cols-2 gap-4">
                                     <div>
                                        <label for="iuom-length" class="block text-sm mb-1">Length:</label>
                                        <div class="flex">
                                            <input type="number" step="0.01" id="iuom-length" name="length" class="input rounded-r-none" value="0.00000">
                                            <select id="iuom-length-um" name="lengthUm" class="select w-24 rounded-l-none">
                                                <option value="CM">CM</option>
                                                <option value="M">M</option>
                                                <option value="IN">IN</option>
                                                <option value="FT">FT</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="iuom-width" class="block text-sm mb-1">Width:</label>
                                        <div class="flex">
                                            <input type="number" step="0.01" id="iuom-width" name="width" class="input rounded-r-none" value="0.00000">
                                            <select id="iuom-width-um" name="widthUm" class="select w-24 rounded-l-none">
                                                <option value="CM">CM</option>
                                                <option value="M">M</option>
                                                <option value="IN">IN</option>
                                                <option value="FT">FT</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="iuom-height" class="block text-sm mb-1">Height:</label>
                                        <div class="flex">
                                            <input type="number" step="0.01" id="iuom-height" name="height" class="input rounded-r-none" value="0.00000">
                                            <select id="iuom-height-um" name="heightUm" class="select w-24 rounded-l-none">
                                                <option value="CM">CM</option>
                                                <option value="M">M</option>
                                                <option value="IN">IN</option>
                                                <option value="FT">FT</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="iuom-weight" class="block text-sm mb-1">Weight:</label>
                                        <div class="flex">
                                            <input type="number" step="0.01" id="iuom-weight" name="weight" class="input rounded-r-none" value="0.00000">
                                            <select id="iuom-weight-um" name="weightUm" class="select w-24 rounded-l-none">
                                                <option value="KG">KG</option>
                                                <option value="G">G</option>
                                                <option value="LB">LB</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div id="iuom-slot-tab" role="tabpanel" data-pane="iuom-slot-tab" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label for="iuom-sloting-id" class="block text-sm mb-1">Sloting id:</label>
                                        <input id="iuom-sloting-id" name="slotingId" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-slotting-pallet-ti" class="block text-sm mb-1">Slotting pallet TI:</label>
                                        <input id="iuom-slotting-pallet-ti" name="slottingPalletTI" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-slotting-pallet-hi" class="block text-sm mb-1">Slotting pallet HI:</label>
                                        <input id="iuom-slotting-pallet-hi" name="slottingPalletHI" class="input">
                                    </div>
                                </div>
                                <div id="iuom-ud-tab" role="tabpanel" data-pane="iuom-ud-tab" class="hidden grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label for="iuom-udf1" class="block text-sm mb-1">User defined field 1:</label>
                                        <input id="iuom-udf1" name="udf1" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf2" class="block text-sm mb-1">User defined field 2:</label>
                                        <input id="iuom-udf2" name="udf2" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf3" class="block text-sm mb-1">User defined field 3:</label>
                                        <input id="iuom-udf3" name="udf3" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf4" class="block text-sm mb-1">User defined field 4:</label>
                                        <input id="iuom-udf4" name="udf4" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf5" class="block text-sm mb-1">User defined field 5:</label>
                                        <input id="iuom-udf5" name="udf5" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf6" class="block text-sm mb-1">User defined field 6:</label>
                                        <input id="iuom-udf6" name="udf6" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf7" class="block text-sm mb-1">User defined field 7:</label>
                                        <input id="iuom-udf7" name="udf7" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="iuom-udf8" class="block text-sm mb-1">User defined field 8:</label>
                                        <input id="iuom-udf8" name="udf8" type="text" class="input">
                                    </div>
                                </div>
                                <input type="hidden" id="iuom-id" name="id">
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeIUoMForm()">Cancel</button>
                            <button id="iuom-submit-button" type="submit" form="iuom-form" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                </div>
            `
        };

        // Daftarkan ke menu & pencarian global
        window.searchItems.push({ id: 'item-unit-of-measure', title: 'Item Unit of Measure', category: 'Inventory Control', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Item Unit of Measure', category: 'Inventory Control' });
        window.parentMapping['item-unit-of-measure'] = 'inventory-control';


        // --- RENDER & FILTER FUNCTIONS ---
        window.renderIUoMList = function (filter = '', sortBy = '', sortDir = 'asc') {
            const container = document.getElementById('iuom-list-container');
            if (!container) return;

            let filteredData = itemUoms.filter(iuom => {
                const searchable = `${iuom.targetType} ${iuom.itemCode} ${iuom.itemClass} ${iuom.company} ${iuom.movementClass}`.toLowerCase();
                return searchable.includes(filter.toLowerCase());
            });

            // Sorting
            if (sortBy) {
                filteredData.sort((a, b) => {
                    const valA = a[sortBy];
                    const valB = b[sortBy];
                    let compare = 0;
                    if (valA > valB) compare = 1;
                    if (valA < valB) compare = -1;
                    return sortDir === 'asc' ? compare : -compare;
                });
            }
            
            // Perbaikan untuk pagination. Saat ini hanya menampilkan semua data.
            const pageSize = 10; // Default page size
            let paginatedData = filteredData;
            
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('targetType')">Target</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('itemCode')">Item / Item class</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('company')">Company</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('conversionQty')">Conversion qty</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('movementClass')">Movement class</th>
                            <th class="py-3 px-6 text-left">Dimensions</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortIUoMList('updatedAt')">Updated</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (paginatedData.length === 0) {
                tableHtml += `<tr><td colspan="8" class="py-3 px-6 text-center">Tidak ada data IUoM ditemukan.</td></tr>`;
            } else {
                paginatedData.forEach(iuom => {
                    const targetIdentifier = iuom.targetType === 'item' ? iuom.itemCode : iuom.itemClass;
                    const dimensions = `${iuom.length}x${iuom.width}x${iuom.height} (${iuom.lengthUm}), ${iuom.weight} (${iuom.weightUm})`;

                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${iuom.targetType}</td>
                            <td class="py-3 px-6 text-left">${targetIdentifier}</td>
                            <td class="py-3 px-6 text-left">${iuom.company}</td>
                            <td class="py-3 px-6 text-left">${iuom.conversionQty}</td>
                            <td class="py-3 px-6 text-left">${iuom.movementClass}</td>
                            <td class="py-3 px-6 text-left">${dimensions}</td>
                            <td class="py-3 px-6 text-left">${iuom.updatedAt}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showIUoMForm('edit', '${iuom.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteIUoM('${iuom.id}')" title="Hapus">
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
        
        let currentSort = { column: '', direction: 'asc' };
        window.sortIUoMList = function(column) {
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort = { column, direction: 'asc' };
            }
            const searchValue = document.getElementById('iuom-search').value;
            renderIUoMList(searchValue, currentSort.column, currentSort.direction);
        };

        const filterIUoMListDebounced = debounce(value => renderIUoMList(value, currentSort.column, currentSort.direction), 300);
        window.filterIUoMList = function (value) {
            filterIUoMListDebounced(value);
        };

        // Fungsi helper untuk tab switching di modal IUoM
        function setupIUoMTabSwitching(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const tabButtons = modal.querySelectorAll('[role="tab"]');
            const tabPanes = modal.querySelectorAll('[role="tabpanel"]');
            
            const activateTab = (tabId) => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('tab-active');
                });
                tabPanes.forEach(pane => pane.classList.add('hidden'));

                const activeBtn = modal.querySelector(`[data-tab="${tabId}"]`);
                const activePane = modal.querySelector(`[data-pane="${tabId}"]`);
                if (activeBtn) {
                    activeBtn.classList.add('tab-active');
                }
                if (activePane) activePane.classList.remove('hidden');
            };

            const onClickHandler = (e) => {
                if (e.target.role === 'tab') {
                    activateTab(e.target.dataset.tab);
                }
            };

            tabButtons.forEach(btn => {
                btn.removeEventListener('click', onClickHandler);
                btn.addEventListener('click', onClickHandler);
            });
            
            // Activate first tab by default
            if(tabButtons.length > 0) {
                 activateTab(tabButtons[0].dataset.tab);
            }
        }


        // --- MODAL FUNCTIONS ---
        window.toggleScopeInputs = function () {
            const scope = document.querySelector('input[name="targetType"]:checked').value;
            const itemCodeField = document.getElementById('iuom-item-code-field');
            const itemClassField = document.getElementById('iuom-item-class-field');

            if (scope === 'item') {
                itemCodeField.classList.remove('hidden');
                itemClassField.classList.add('hidden');
            } else {
                itemCodeField.classList.add('hidden');
                itemClassField.classList.remove('hidden');
            }
        };

        let selectedIUoMDetailRow = null;
        window.renderIUoMDetailRows = function (details = []) {
            const container = document.getElementById('iuom-details-grid');
            if (!container) return;

            container.innerHTML = '';
            details.forEach((detail, index) => {
                const row = document.createElement('div');
                row.className = `iuom-detail-row p-3 border border-gray-200 rounded-md bg-white relative cursor-pointer hover:bg-gray-50 transition-colors ${index === selectedIUoMDetailRow ? 'ring-2 ring-wise-primary' : ''}`;
                row.dataset.index = index;

                row.onclick = () => {
                    selectedIUoMDetailRow = index;
                    renderIUoMDetailRows(getIUoMDetailsFromForm());
                };

                const detailId = `detail-${index}`; // Use index to prevent duplicate IDs
                row.innerHTML = `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label for="${detailId}-sequence" class="block text-sm mb-1">Sequence:</label>
                            <input id="${detailId}-sequence" name="detail-sequence" type="number" value="${detail.sequence}" class="input">
                        </div>
                        <div>
                            <label for="${detailId}-um" class="block text-sm mb-1">Quantity UoM:</label>
                            <select id="${detailId}-um" name="detail-quantityUM" class="select">
                                <option value="">-- Pilih UoM --</option>
                                ${uoms.map(u => `<option value="${u}" ${detail.quantityUM === u ? 'selected' : ''}>${u}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="${detailId}-conversion" class="block text-sm mb-1">Conversion Qty:</label>
                            <input id="${detailId}-conversion" name="detail-conversionQty" type="number" step="0.01" value="${detail.conversionQty}" class="input">
                        </div>
                        <div>
                            <label for="${detailId}-movclass" class="block text-sm mb-1">Movement Class:</label>
                            <select id="${detailId}-movclass" name="detail-movementClass" class="select">
                                <option value="">-- Pilih Class --</option>
                                ${movementClasses.map(m => `<option value="${m}" ${detail.movementClass === m ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                        </div>
                        <div class="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                             <div>
                                <label for="${detailId}-length" class="block text-sm mb-1">Length:</label>
                                <input id="${detailId}-length" name="detail-length" type="number" step="0.01" value="${detail.length}" class="input">
                            </div>
                            <div>
                                <label for="${detailId}-width" class="block text-sm mb-1">Width:</label>
                                <input id="${detailId}-width" name="detail-width" type="number" step="0.01" value="${detail.width}" class="input">
                            </div>
                            <div>
                                <label for="${detailId}-height" class="block text-sm mb-1">Height:</label>
                                <input id="${detailId}-height" name="detail-height" type="number" step="0.01" value="${detail.height}" class="input">
                            </div>
                            <div>
                                <label for="${detailId}-weight" class="block text-sm mb-1">Weight:</label>
                                <input id="${detailId}-weight" name="detail-weight" type="number" step="0.01" value="${detail.weight}" class="input">
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(row);
            });
        };

        window.addIUoMDetailRow = function () {
            const currentDetails = getIUoMDetailsFromForm();
            const newRow = { 
                sequence: (currentDetails.length > 0 ? Math.max(...currentDetails.map(d => d.sequence)) + 1 : 1),
                quantityUM: '',
                conversionQty: 1.00,
                length: 0.00,
                width: 0.00,
                height: 0.00,
                weight: 0.00,
                movementClass: '',
                itemId: ''
            };
            currentDetails.push(newRow);
            renderIUoMDetailRows(currentDetails);
            selectedIUoMDetailRow = currentDetails.length - 1;
        };
        
        window.duplicateIUoMDetailRow = function () {
            if (selectedIUoMDetailRow === null) {
                window.showCustomAlert('Error', 'Pilih baris terlebih dahulu untuk diduplikasi.');
                return;
            }
            const currentDetails = getIUoMDetailsFromForm();
            const originalRow = currentDetails[selectedIUoMDetailRow];
            if (originalRow) {
                const newRow = { ...originalRow };
                newRow.sequence = (currentDetails.length > 0 ? Math.max(...currentDetails.map(d => d.sequence)) + 1 : 1);
                currentDetails.splice(selectedIUoMDetailRow + 1, 0, newRow);
                renderIUoMDetailRows(currentDetails);
            }
        };

        window.deleteIUoMDetailRow = async function () {
            if (selectedIUoMDetailRow === null) {
                window.showCustomAlert('Error', 'Pilih baris terlebih dahulu untuk dihapus.');
                return;
            }
            const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus baris ini?');
            if (confirmed) {
                const currentDetails = getIUoMDetailsFromForm();
                currentDetails.splice(selectedIUoMDetailRow, 1);
                selectedIUoMDetailRow = null;
                renderIUoMDetailRows(currentDetails);
            }
        };

        function getIUoMDetailsFromForm() {
            const rows = document.querySelectorAll('#iuom-details-grid .iuom-detail-row');
            return Array.from(rows).map(row => ({
                sequence: parseFloat(row.querySelector('[name="detail-sequence"]').value),
                quantityUM: row.querySelector('[name="detail-quantityUM"]').value,
                conversionQty: parseFloat(row.querySelector('[name="detail-conversionQty"]').value),
                length: parseFloat(row.querySelector('[name="detail-length"]').value),
                width: parseFloat(row.querySelector('[name="detail-width"]').value),
                height: parseFloat(row.querySelector('[name="detail-height"]').value),
                weight: parseFloat(row.querySelector('[name="detail-weight"]').value),
                movementClass: row.querySelector('[name="detail-movementClass"]').value,
            }));
        }

        window.showIUoMForm = function(mode, id = null) {
            const modal = document.getElementById('iuom-form-modal');
            const form = document.getElementById('iuom-form');
            const title = document.getElementById('iuom-form-title');
            
            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;
            selectedIUoMDetailRow = null;
            
            setupIUoMTabSwitching('iuom-form-modal'); // Gunakan fungsi tab switching lokal

            if (mode === 'create') {
                title.textContent = 'Create New Item Unit of Measure';
                document.getElementById('iuom-id').value = '';
                document.getElementById('scope-item-radio').checked = true;
                document.getElementById('iuom-inactive').checked = false;
                toggleScopeInputs();
                renderIUoMDetailRows([{
                    sequence: 1, quantityUM: '', conversionQty: 1.00, length: 0.00, width: 0.00, height: 0.00, weight: 0.00, movementClass: '', itemId: ''
                }]);
            } else {
                title.textContent = 'Edit Item Unit of Measure';
                const iuom = itemUoms.find(i => i.id === id);
                if (iuom) {
                    document.getElementById('iuom-id').value = iuom.id;
                    if (iuom.targetType === 'item') {
                        document.getElementById('scope-item-radio').checked = true;
                        document.getElementById('iuom-item-code').value = iuom.itemCode;
                    } else {
                        document.getElementById('scope-itemclass-radio').checked = true;
                        document.getElementById('iuom-item-class').value = iuom.itemClass;
                    }
                    document.getElementById('iuom-company').value = iuom.company;
                    document.getElementById('iuom-inactive').checked = iuom.inactive;
                    toggleScopeInputs();
                    
                    document.getElementById('iuom-conversion-qty').value = iuom.conversionQty;
                    document.getElementById('iuom-treat-as-full').value = iuom.treatAsFullPercent;
                    document.getElementById('iuom-epc-package-id').value = iuom.epcPackageId;
                    document.getElementById('iuom-movement-class').value = iuom.movementClass;
                    document.getElementById('iuom-loose-in-container').checked = iuom.treatAsLooseInContainer;

                    document.getElementById('iuom-length').value = iuom.length;
                    document.getElementById('iuom-length-um').value = iuom.lengthUm;
                    document.getElementById('iuom-width').value = iuom.width;
                    document.getElementById('iuom-width-um').value = iuom.widthUm;
                    document.getElementById('iuom-height').value = iuom.height;
                    document.getElementById('iuom-height-um').value = iuom.heightUm;
                    document.getElementById('iuom-weight').value = iuom.weight;
                    document.getElementById('iuom-weight-um').value = iuom.weightUm;

                    // Fill User Defined fields
                    if (iuom.udf) {
                        for (let i = 1; i <= 8; i++) {
                            const udfInput = document.getElementById(`iuom-udf${i}`);
                            if (udfInput) udfInput.value = iuom.udf[`udf${i}`] || '';
                        }
                    }

                    // Since the provided mockups don't have separate detail rows, we'll
                    // use the top-level fields for the single detail row, but for consistency
                    // with the old data model, we'll set a default one here.
                    const detailRow = {
                        sequence: 1, quantityUM: iuom.quantityUM, conversionQty: iuom.conversionQty, length: iuom.length, width: iuom.width, height: iuom.height, weight: iuom.weight, movementClass: iuom.movementClass
                    };
                    renderIUoMDetailRows([detailRow]);
                }
            }

            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    // Fix: Mengomentari baris ini karena window.trapFocus tidak terdefinisi
                    // modal._untrap = window.trapFocus(modalContent);
                }
            }, 10);
            
            modal.onclick = (e) => {
                if (e.target.id === 'iuom-form-modal') closeIUoMForm();
            };
        };

        window.closeIUoMForm = function() {
            const modal = document.getElementById('iuom-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                if (modal._untrap) {
                    // Fix: Mengomentari baris ini
                    // modal._untrap();
                    delete modal._untrap;
                }
            }, 300);
        };

        window.handleIUoMSubmit = async function(event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            // Validasi form
            const targetType = document.querySelector('input[name="targetType"]:checked').value;
            const company = form['company'].value;
            const itemCode = form['itemCode'].value;
            const itemClass = form['itemClass'].value;
            const conversionQty = parseFloat(form['conversionQty'].value);
            
            if (!company) {
                await window.showCustomAlert('Error', 'Company wajib diisi.');
                return;
            }
            if (targetType === 'item' && !itemCode) {
                await window.showCustomAlert('Error', 'Item Code wajib diisi untuk scope Item.');
                return;
            }
            if (targetType === 'itemClass' && !itemClass) {
                await window.showCustomAlert('Error', 'Item Class wajib diisi untuk scope Item Class.');
                return;
            }
            if (isNaN(conversionQty) || conversionQty <= 0) {
                 await window.showCustomAlert('Error', 'Conversion Qty harus lebih besar dari 0.');
                return;
            }

            const newIUoM = {
                targetType: targetType,
                itemCode: targetType === 'item' ? itemCode : '',
                itemClass: targetType === 'itemClass' ? itemClass : '',
                company: company,
                conversionQty: conversionQty,
                treatAsFullPercent: parseFloat(form['treatAsFullPercent'].value) || 0,
                epcPackageId: parseInt(form['epcPackageId'].value) || 0,
                movementClass: form['movementClass'].value,
                treatAsLooseInContainer: form['treatAsLooseInContainer'].checked,
                length: parseFloat(form['length'].value) || 0,
                lengthUm: form['lengthUm'].value,
                width: parseFloat(form['width'].value) || 0,
                widthUm: form['widthUm'].value,
                height: parseFloat(form['height'].value) || 0,
                heightUm: form['heightUm'].value,
                weight: parseFloat(form['weight'].value) || 0,
                weightUm: form['weightUm'].value,
                udf: {
                    udf1: form['udf1']?.value || '',
                    udf2: form['udf2']?.value || '',
                    udf3: form['udf3']?.value || '',
                    udf4: form['udf4']?.value || '',
                    udf5: form['udf5']?.value || '',
                    udf6: form['udf6']?.value || '',
                    udf7: form['udf7']?.value || '',
                    udf8: form['udf8']?.value || '',
                },
                updatedAt: new Date().toISOString().slice(0, 10)
            };

            let msg = '';
            if (mode === 'create') {
                const maxId = itemUoms.reduce((max, item) => {
                    const num = parseInt(item.id.replace('IUOM', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newIUoM.id = 'IUOM' + String(maxId + 1).padStart(3, '0');
                itemUoms.push(newIUoM);
                msg = 'Item Unit of Measure created successfully!';
            } else {
                const index = itemUoms.findIndex(i => i.id === id);
                if (index !== -1) {
                    itemUoms[index] = { ...itemUoms[index], ...newIUoM, id: id };
                    msg = 'Item Unit of Measure updated successfully!';
                }
            }
            saveIUoMs();
            closeIUoMForm();
            window.renderIUoMList();
            await window.showCustomAlert('Success', msg);
        };

        window.deleteIUoM = async function(id) {
            const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus IUoM ini?');
            if (confirmed) {
                itemUoms = itemUoms.filter(iuom => iuom.id !== id);
                saveIUoMs();
                window.renderIUoMList();
                await window.showCustomAlert('Dihapus', 'Item Unit of Measure berhasil dihapus!');
            }
        };

        // --- CSV EXPORT/IMPORT ---
        window.exportIUoMToCSV = function() {
            const headers = [
                "id", "targetType", "itemCode", "itemClass", "company", "conversionQty", "treatAsFullPercent",
                "epcPackageId", "movementClass", "treatAsLooseInContainer",
                "length", "lengthUm", "width", "widthUm", "height", "heightUm",
                "weight", "weightUm", "udf1", "udf2", "udf3", "udf4", "udf5", "udf6", "udf7", "udf8", "updatedAt"
            ];
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += headers.join(",") + "\r\n";

            itemUoms.forEach(iuom => {
                const row = [
                    iuom.id,
                    iuom.targetType,
                    iuom.itemCode || '',
                    iuom.itemClass || '',
                    iuom.company,
                    iuom.conversionQty,
                    iuom.treatAsFullPercent,
                    iuom.epcPackageId,
                    iuom.movementClass,
                    iuom.treatAsLooseInContainer,
                    iuom.length, iuom.lengthUm,
                    iuom.width, iuom.widthUm,
                    iuom.height, iuom.heightUm,
                    iuom.weight, iuom.weightUm,
                    iuom.udf.udf1 || '', iuom.udf.udf2 || '', iuom.udf.udf3 || '', iuom.udf.udf4 || '',
                    iuom.udf.udf5 || '', iuom.udf.udf6 || '', iuom.udf.udf7 || '', iuom.udf.udf8 || '',
                    iuom.updatedAt
                ].map(field => `"${field}"`).join(",");
                csvContent += row + "\r\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "item_uoms.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        };

        window.importIUoMFromCSV = function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                const lines = text.split('\n').filter(l => l.trim() !== '');
                if (lines.length <= 1) {
                    await window.showCustomAlert('Error', 'File CSV kosong atau tidak valid.');
                    return;
                }

                const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
                const newItems = [];
                const errors = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, ''));
                    const item = {};
                    let isValid = true;
                    if (values.length !== headers.length) {
                        errors.push(`Baris ${i + 1}: Jumlah kolom tidak sesuai.`);
                        continue;
                    }

                    headers.forEach((header, index) => {
                        let value = values[index];
                        if (header === 'conversionQty' && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
                            isValid = false;
                            errors.push(`Baris ${i + 1}: ConversionQty harus angka > 0.`);
                        }
                        if (header === 'id') item[header] = value;
                        else if (header === 'targetType') item[header] = value;
                        else if (header === 'itemCode') item[header] = value;
                        else if (header === 'itemClass') item[header] = value;
                        else if (header === 'company') item[header] = value;
                        else if (header === 'conversionQty') item[header] = parseFloat(value);
                        else if (header === 'treatAsFullPercent') item[header] = parseInt(value) || 0;
                        else if (header === 'epcPackageId') item[header] = parseInt(value) || 0;
                        else if (header === 'movementClass') item[header] = value;
                        else if (header === 'treatAsLooseInContainer') item[header] = value === 'true';
                        else if (['length', 'width', 'height', 'weight'].includes(header)) item[header] = parseFloat(value) || 0;
                        else if (['lengthUm', 'widthUm', 'heightUm', 'weightUm'].includes(header)) item[header] = value;
                        else if (header.startsWith('udf')) {
                            item.udf = item.udf || {};
                            item.udf[header] = value;
                        }
                        else item[header] = value;
                    });
                    
                    if(isValid) newItems.push(item);
                }

                if (errors.length > 0) {
                    await window.showCustomAlert('Error Impor', `Ditemukan ${errors.length} error:\n${errors.join('\n')}`);
                }

                if (newItems.length > 0) {
                    itemUoms = [...itemUoms, ...newItems];
                    saveIUoMs();
                    window.renderIUoMList();
                    await window.showCustomAlert('Sukses', `${newItems.length} data IUoM berhasil diimpor!`);
                }
            };
            reader.readAsText(file);
        };
        
        // Letakkan IUoM di dalam grup "Inventory Control"
        if (window.contentData['inventory-control']) {
            const invChildren = [
                'adjustment-type', 'harmonized-code', 'inventory-control-values', 'inventory-status',
                'item', 'item-class', 'item-cross-reference', 'item-location-assignment',
                'item-location-capacity', 'item-template', 'item-unit-of-measure',
                'location', 'location-class', 'location-status', 'location-template', 'location-type',
                'lot-template', 'movement-class', 'serial-number-template', 'storage-template',
                'zone', 'zone-type'
            ];
            // Fix: Merge dengan window.invMeta yang sudah ada dan pastikan default value jika undefined
            const invMeta = { 
                ...(window.invMeta || {}),
                'item-unit-of-measure': ['Item Unit of Measure', 'UoM list and conversions.'],
            };
            
            // Tambahkan IUoM ke daftar anak dan metadata
            window.contentData['inventory-control'].full = `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">
                    Inventory Control
                </h2>
                <p class="text-wise-gray mb-6">Select a sub-category to manage inventory controls.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${invChildren.map(k => {
                        // Fix: Gunakan fallback jika meta tidak terdefinisi
                        const meta = invMeta[k] || [k, ''];
                        return `
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md hover:shadow-lg transition">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">${meta[0]}</h3>
                            <p class="text-wise-gray text-sm">${meta[1]}</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition"
                                    onclick="selectCategory('${k}')">
                                Open
                            </button>
                        </div>
                    `;
                    }).join('')}
                </div>`;
            window.parentMapping['item-unit-of-measure'] = 'inventory-control';
        }
        
        // Auto-render saat modul dimuat
        const autoRenderIUoM = () => {
            const container = document.getElementById('iuom-list-container');
            if (container && !container.dataset.bound) {
                renderIUoMList();
                container.dataset.bound = '1';
            }
        };

        const observer = new MutationObserver(autoRenderIUoM);
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Panggilan awal untuk memastikan konten default dimuat saat startup
        window.navigateToHome();

        console.log('Configuration V4 (Item Unit of Measure) loaded successfully');
    });
})();

// Definisi fungsi global yang harus diakses dari HTML
window.closeSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContent = document.getElementById('main-content');
    const header = document.querySelector('header');
    
    if (sidebar) sidebar.classList.remove('translate-x-0');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (mainContent) mainContent.classList.remove('md:ml-64');
    if (header) header.classList.remove('md:ml-64');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
};

window.selectCategory = function(category) {
    const mainContent = document.getElementById('main-content');
    const categoryMenu = document.getElementById('category-menu');

    if (window.contentData[category]) {
        if (mainContent) mainContent.innerHTML = window.contentData[category].full;
        
        // Panggil renderer yang sesuai setelah konten dimuat
        if (window[`render${category.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}List`]) {
            window[`render${category.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}List`]();
        } else if (category === 'item-unit-of-measure') {
            window.renderIUoMList();
        } else {
            console.warn(`Renderer for category '${category}' not found.`);
        }

        // Panggilan closeSidebar() pada layar kecil (mobile)
        if (window.innerWidth < 768) {
            window.closeSidebar();
        }
        
        // Pastikan menu aktif diperbarui
        if (categoryMenu) {
            const menuItems = categoryMenu.querySelectorAll('button');
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('onclick').match(/selectCategory\('(.*?)'\)/)?.[1];
                if (itemCategory === category) {
                    item.classList.add('bg-wise-dark-gray', 'text-white');
                } else {
                    item.classList.remove('bg-wise-dark-gray', 'text-white');
                }
            });
        }
    } else {
        console.error(`Category data for '${category}' not found in window.contentData.`);
    }
};

window.goBack = function() {
    console.log("Go back function not yet implemented.");
};

window.navigateToHome = function() {
    const mainContent = document.getElementById('main-content');
    const homeContent = `<div class="p-6">
        <h1 class="text-3xl font-bold mb-4">Welcome to Wise Configuration</h1>
        <p class="text-gray-700">Select a category from the menu to get started.</p>
    </div>`;
    if (mainContent) {
        mainContent.innerHTML = homeContent;
    }
};
