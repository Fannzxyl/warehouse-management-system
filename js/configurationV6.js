(function () {
    // Menambahkan log sederhana saat file dimuat
    console.log("Configuration V6 (Customer) loaded"); // FIX: Tambah console log

    // Memastikan variabel global sudah tersedia
    if (typeof window.contentData === 'undefined') window.contentData = {};
    if (typeof window.searchItems === 'undefined') window.searchItems = [];
    if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
    if (typeof window.allMenus === 'undefined') window.allMenus = [];
    
    // Fallbacks untuk fungsi helper proyek (Dibiarkan tetap sama)
    if (typeof window.showCustomAlert === 'undefined') window.showCustomAlert = (title, message) => console.log(`Alert: ${title} - ${message}`);
    if (typeof window.showCustomConfirm === 'undefined') window.showCustomConfirm = (title, message) => new Promise(resolve => resolve(true));
    if (typeof window.selectCategory === 'undefined') window.selectCategory = (category) => console.log(`Selecting category: ${category}`);
    if (typeof window.renderStandardListHeader === 'undefined') window.renderStandardListHeader = ({ createLabel, onCreate, searchId, searchPlaceholder, onSearch }) => `
        <div class="flex flex-wrap items-center gap-3 mb-4">
            <button onclick="${onCreate}" class="px-4 py-2 bg-blue-500 text-white rounded-md">${createLabel}</button>
            <div class="grow"></div>
            <input id="${searchId}" type="text" placeholder="${searchPlaceholder}" oninput="${onSearch}(this.value)" class="input w-full sm:w-72 pl-10" />
        </div>`;
    if (typeof window.renderStandardModalFooter === 'undefined') window.renderStandardModalFooter = ({ cancelOnclick, submitFormId, submitLabel = 'OK' }) => `
        <div class="px-6 py-4 border-t flex justify-end gap-3">
            <button type="button" class="btn" onclick="${cancelOnclick}">Cancel</button>
            <button type="submit" form="${submitFormId}" class="btn btn-primary">${submitLabel}</button>
        </div>`;
    if (typeof window.debounce === 'undefined') window.debounce = (fn, delay) => {
        let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn.apply(this, args), delay); };
    };
    if (typeof window.activateTab === 'undefined') window.activateTab = (tabName, container) => {
        container.querySelectorAll('[role="tab"]').forEach(tab => tab.classList.remove('tab-active'));
        container.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden'));
        const activeTab = container.querySelector(`[role="tab"][data-tab="${tabName}"]`);
        if (activeTab) { activeTab.classList.add('tab-active'); }
        const activePane = container.querySelector(`[role="tabpanel"][data-pane="${tabName}"]`);
        if (activePane) { activePane.classList.remove('hidden'); }
    };


    document.addEventListener('DOMContentLoaded', () => {

        // --- DATA SEED & STORAGE ---
        const CUSTOMER_STORAGE_KEY = 'wms_customers_v6';
        const CUSTOMER_ID_PREFIX = 'CUS';
        const CUSTOMER_CATEGORY_KEY = 'customer'; 

        // Data Dummy
        const dummyCarriers = ['D8232EC', 'D8375DE', 'D8382EB', 'D8391DA', 'D8434DM', 'D8473FU', 'D8513FU', 'D8517FB'];
        const dummyCities = ['Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];
        const dummyCountries = [{ code: 'ID', name: 'Indonesia' }, { code: 'CN', name: 'China' }];
        const dummyCompanies = ['DCB', 'DCI', 'DMR', 'DCS'];
        const dummyContainerClasses = ['Bag', 'Crate', 'Dus', 'Eggs', 'Pallet', 'Roll Cage', 'Tote'];
        
        // FIX: provide EMPTY_CUSTOMER model and safe fallbacks to avoid undefined on create
        const EMPTY_CUSTOMER = {
            // General
            id: null, customer: '', shipTo: '', company: '', name: '', parent: '', inactive: false,
            onHold: false, carriers: [], 
            // Address (using top-level keys for simplicity in data binding)
            residential: false, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', phoneNumber: '', emailAddress: '',
            // Categories
            categories: Array.from({ length: 10 }, (_, i) => ({ [`category${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
            // FBA
            fba_name: '', fba_address1: '', fba_address2: '', fba_address3: '', fba_city: '', fba_state: '', fba_postalCode: '', fba_country: '',
            // FIX: RFID structure untuk CRUD tabel
            rfid: { 
                rows: [],
                selectedIndex: -1, // State untuk seleksi baris UI
                filter: { andOr: 'AND', attribute: '', op: '=', value: '' }
            },
            // FIX: UDF model diubah menjadi 6 field
            udf: Array.from({ length: 6 }, (_, i) => ({ [`udf${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        };

        let customers = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY)) || [
            { id: CUSTOMER_ID_PREFIX + '001', customer: '12160', shipTo: '001', company: 'DCB', name: 'PT MAJU JAYA ABADI', parent: '12160', inactive: false, residential: false, onHold: false, carriers: ['D8232EC'], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, fba_name: 'Freight Bill Co', fba_address1: 'FBA Address 1', fba_city: 'Jakarta', fba_country: 'ID', 
                rfid: { rows: [{ containerClass: 'Pallet', epcEncoding: 'EPC123', singleItem: true, multiItem: false, udf1: 'A1' }], selectedIndex: -1, filter: EMPTY_CUSTOMER.rfid.filter } 
            },
            { id: CUSTOMER_ID_PREFIX + '002', customer: '12161', shipTo: '001', company: 'DCI', name: 'CV BERKAH MANDIRI', parent: '12161', inactive: false, residential: true, onHold: false, carriers: ['D8375DE', 'D8382EB'], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, rfid: EMPTY_CUSTOMER.rfid },
            { id: CUSTOMER_ID_PREFIX + '003', customer: '12162', shipTo: '002', company: 'DCB', name: 'PT SEJAHTERA SELALU', parent: '12162', inactive: true, residential: false, onHold: true, carriers: [], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, rfid: EMPTY_CUSTOMER.rfid }
        ];

        const generateUniqueId = () => {
            // Menggunakan timestamp milidetik dan prefix 'CUS'
            return CUSTOMER_ID_PREFIX + Date.now().toString().slice(-8);
        };
        const saveCustomers = () => localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));

        // --- RENDER & FILTER FUNCTIONS ---
        window.renderCustomerList = function (filter = '') {
            const container = document.getElementById('customer-list-container');
            if (!container) return;
            const lowerFilter = filter.toLowerCase();

            const filteredData = customers.filter(c => 
                (c.customer || '').toLowerCase().includes(lowerFilter) ||
                (c.name || '').toLowerCase().includes(lowerFilter) ||
                (c.company || '').toLowerCase().includes(lowerFilter)
            );
            
            // Tambahkan wrapper dengan tinggi dan scrollbar
            let listWrapperHtml = `
                <div class="max-h-[60vh] overflow-y-auto border border-wise-border rounded-lg shadow-md">
                <table class="min-w-full bg-white">
                <thead>
                    <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Customer</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Ship To</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Company</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Name</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Parent</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Active</th>
                        <th class="py-3 px-6 text-center sticky top-0 bg-wise-light-gray">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-wise-gray text-sm font-light">`;

            if (filteredData.length === 0) {
                listWrapperHtml += `<tr><td colspan="7" class="py-3 px-6 text-center">No customers found.</td></tr>`;
            } else {
                // Render data apa adanya (Data baru akan muncul di bawah jika ditambahkan dengan 'push')
                filteredData.forEach(c => {
                    listWrapperHtml += `<tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-6 text-left whitespace-nowrap">${c.customer}</td>
                        <td class="py-3 px-6 text-left">${c.shipTo || 'N/A'}</td>
                        <td class="py-3 px-6 text-left">${c.company}</td>
                        <td class="py-3 px-6 text-left">${c.name}</td>
                        <td class="py-3 px-6 text-left">${c.parent || 'N/A'}</td>
                        <td class="py-3 px-6 text-left">${!c.inactive ? 'Yes' : 'No'}</td>
                        <td class="py-3 px-6 text-center">
                            <div class="flex item-center justify-center">
                                <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showCustomerForm('edit', '${c.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                                <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteCustomer('${c.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                            </div>
                        </td>
                    </tr>`;
                });
            }
            listWrapperHtml += `</tbody></table></div>`;
            container.innerHTML = listWrapperHtml;
        };

        window.filterCustomerList = window.debounce((value) => window.renderCustomerList(value), 300); 

        // --- VALIDATION ---
        function validateCustomerForm(modal) {
            const form = document.getElementById('customer-form');
            form.noValidate = true; // Nonaktifkan native HTML5 validation
            
            // Field wajib yang menyebabkan error fokus di awal
            const requiredFields = ['customer', 'company', 'name']; 
            let isValid = true;
            let firstInvalid = null;
            let targetTab = null;

            // Bersihkan error sebelumnya
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
            
            const setError = (input, message, tabId) => {
                let errorEl = document.createElement('p');
                errorEl.className = 'error-message text-red-500 text-xs mt-1';
                errorEl.textContent = message;
                input.parentNode.appendChild(errorEl);
                input.setAttribute('aria-invalid', 'true');
                if (!firstInvalid) { 
                    firstInvalid = input; 
                    targetTab = tabId;
                }
                isValid = false;
            };

            requiredFields.forEach(fieldName => {
                const el = form.querySelector(`[name="${fieldName}"]`); 
                if (el) {
                    // Cari ID tab (pane) tempat elemen ini berada
                    const tabId = el.closest('[role="tabpanel"]')?.dataset.pane;
                    if (!el.value.trim()) { 
                        setError(el, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`, tabId); 
                    }
                }
            });

            if (firstInvalid) {
                // Fokuskan tab yang memuat input invalid
                if (targetTab) {
                    window.activateTab(targetTab, modal); 
                }
                
                // Beri fokus ke elemen yang invalid setelah ada delay 
                // untuk mengatasi masalah fokus saat transisi tab/modal
                setTimeout(() => {
                    try { firstInvalid.focus(); } catch(e) { console.error("Failed to focus invalid input:", e); }
                }, 100); 

                return false;
            }

            return true;
        }

        // --- MODAL FORM FUNCTIONS ---

        function renderAddressTab(data) {
             // FIX: Use destructuring with safe fallbacks
            const { name = '', address1 = '', address2 = '', address3 = '', city = '', state = '', postalCode = '', country = '', faxNumber = '', phoneNumber = '', emailAddress = '', residential = false } = data;

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label for="name" class="block text-sm mb-1">Name: <span class="text-red-500">*</span></label>
                        <input type="text" id="name" name="name" required class="input" value="${name}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="address1" class="block text-sm mb-1">Address 1:</label>
                        <input type="text" id="address1" name="address1" class="input" value="${address1}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="address2" class="block text-sm mb-1">Address 2 (optional):</label>
                        <input type="text" id="address2" name="address2" class="input" value="${address2}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="address3" class="block text-sm mb-1">Address 3 (optional):</label>
                        <input type="text" id="address3" name="address3" class="input" value="${address3}">
                    </div>
                    <div>
                        <label for="city" class="block text-sm mb-1">City:</label>
                        <select id="city" name="city" class="select">
                            <option value="">-- Select --</option>
                            ${dummyCities.map(c => `<option value="${c}" ${city === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="state" class="block text-sm mb-1">State:</label>
                        <input type="text" id="state" name="state" class="input" value="${state}">
                    </div>
                    <div>
                        <label for="postalCode" class="block text-sm mb-1">Postal Code:</label>
                        <input type="text" id="postalCode" name="postalCode" class="input" value="${postalCode}">
                    </div>
                    <div>
                        <label for="country" class="block text-sm mb-1">Country:</label>
                        <select id="country" name="country" class="select">
                            <option value="">-- Select --</option>
                            ${dummyCountries.map(c => `<option value="${c.code}" ${country === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="faxNumber" class="block text-sm mb-1">Fax Number:</label>
                        <input type="text" id="faxNumber" name="faxNumber" class="input" value="${faxNumber}">
                    </div>
                    <div>
                        <label for="phoneNumber" class="block text-sm mb-1">Phone Number:</label>
                        <input type="text" id="phoneNumber" name="phoneNumber" class="input" value="${phoneNumber}">
                    </div>
                    <div>
                        <label for="emailAddress" class="block text-sm mb-1">Email Address:</label>
                        <input type="email" id="emailAddress" name="emailAddress" class="input" value="${emailAddress}">
                    </div>
                    <div class="md:col-span-2 mt-2">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="residential" name="residential" ${residential ? 'checked' : ''}> Residential
                        </label>
                    </div>
                </div>
            `;
        }

        function renderGeneralTab(data) {
            const { customer = '', company = '', onHold = false, carriers = [] } = data; 
            
            // DIHAPUS: Logika readonly dihapus biar field Customer bisa diedit kapan aja
            // const isReadonly = !!data.id; 

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="customer" class="block text-sm mb-1">Customer: <span class="text-red-500">*</span></label>
                        <input type="text" id="customer" name="customer" required class="input" value="${customer}">
                    </div>
                    <div class="md:col-span-1">
                        <label for="company" class="block text-sm mb-1">Company: <span class="text-red-500">*</span></label>
                        <select id="company" name="company" required class="select">
                            <option value="">-- Select --</option>
                            ${dummyCompanies.map(c => `<option value="${c}" ${company === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>              
                    <div class="md:col-span-2">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="onHold" name="onHold" ${onHold ? 'checked' : ''}> On hold for order
                        </label>
                    </div>
                    
                    <fieldset class="border p-4 rounded-md md:col-span-2">
                        <legend class="px-2 text-sm font-medium">Carrier</legend>
                        <div class="space-y-3">
                            <div id="carrier-list-container" class="space-y-2">
                                ${carriers.map(c => `<div class="flex items-center gap-2"><input type="text" name="carriers" class="input flex-1" value="${c}"><button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest('div').remove()">✕</button></div>`).join('')}
                            </div>
                            <div class="flex gap-2">
                                <button type="button" class="btn btn-sm btn-primary" onclick="addCarrierField()">Add Carrier</button>
                                <button type="button" class="btn btn-sm" onclick="removeCarrierField()">Remove Carrier</button>
                            </div>
                        </div>
                    </fieldset>
                </div>
            `;
        }

        window.addCarrierField = function() {
            const container = document.getElementById('carrier-list-container');
            const randomCarrier = dummyCarriers[Math.floor(Math.random() * dummyCarriers.length)];
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            div.innerHTML = `<input type="text" name="carriers" class="input flex-1" value="${randomCarrier}"><button type="button" class="text-red-500 hover:text-red-700" onclick="this.closest('div').remove()">✕</button>`;
            container.appendChild(div);
        }
        window.removeCarrierField = function() {
            const container = document.getElementById('carrier-list-container');
            if (container.lastElementChild) { container.lastElementChild.remove(); }
        }

        function renderCategoriesTab(model) {
            // FIX: Safe destructuring with nested fallback
            const { categories = EMPTY_CUSTOMER.categories } = model || {};
            
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 10 }, (_, i) => {
                        const key = `category${i + 1}`;
                        return `
                        <div>
                            <label for="cat${i + 1}" class="block text-sm mb-1">Category ${i + 1}:</label>
                            <input type="text" id="cat${i + 1}" name="${key}" class="input" value="${categories[key] || ''}">
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
        }

        function renderFreightBillTab(model) {
             // FIX: expand FBA fields to match Address (Name + Address1/2/3)
            const { fba_name = '', fba_address1 = '', fba_address2 = '', fba_address3 = '', fba_city = '', fba_state = '', fba_postalCode = '', fba_country = '' } = model || {};
            
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label for="fba-name" class="block text-sm mb-1">Name:</label>
                        <input type="text" id="fba-name" name="fba_name" class="input" value="${fba_name}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="fba-address1" class="block text-sm mb-1">Address 1:</label>
                        <input type="text" id="fba-address1" name="fba_address1" class="input" value="${fba_address1}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="fba-address2" class="block text-sm mb-1">Address 2 (optional):</label>
                        <input type="text" id="fba-address2" name="fba_address2" class="input" value="${fba_address2}">
                    </div>
                    <div class="md:col-span-2">
                        <label for="fba-address3" class="block text-sm mb-1">Address 3 (optional):</label>
                        <input type="text" id="fba-address3" name="fba_address3" class="input" value="${fba_address3}">
                    </div>
                    <div>
                        <label for="fba-city" class="block text-sm mb-1">City:</label>
                        <select id="fba-city" name="fba_city" class="select">
                            <option value="">-- Select --</option>
                            ${dummyCities.map(c => `<option value="${c}" ${fba_city === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="fba-state" class="block text-sm mb-1">State:</label>
                        <input type="text" id="fba-state" name="fba_state" class="input" value="${fba_state}">
                    </div>
                    <div>
                        <label for="fba-postalCode" class="block text-sm mb-1">Postal Code:</label>
                        <input type="text" id="fba-postalCode" name="fba_postalCode" class="input" value="${fba_postalCode}">
                    </div>
                    <div>
                        <label for="fba-country" class="block text-sm mb-1">Country:</label>
                        <select id="fba-country" name="fba_country" class="select">
                            <option value="">-- Select --</option>
                            ${dummyCountries.map(c => `<option value="${c.code}" ${fba_country === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        }

        // FIX: Render fungsional untuk tabel RFID
        window.renderRFIDTab = function (model) {
            const { rfid = EMPTY_CUSTOMER.rfid } = model || {};
            const rules = rfid.rows || [];
            const selectedIndex = rfid.selectedIndex || -1;
            
            const renderRulesTable = () => {
                let tableHtml = `<table id="rfid-rules-table" class="min-w-full text-sm"><thead><tr class="bg-gray-100 sticky top-0"><th class="py-2 px-4 text-left w-12">#</th><th class="py-2 px-4 text-left">Container Class</th><th class="py-2 px-4 text-left">EPC Encoding</th><th class="py-2 px-4 text-center">Single</th><th class="py-2 px-4 text-center">Multi</th><th class="py-2 px-4 text-left">UDF 1</th></tr></thead><tbody>`;
                
                if (rules.length === 0) {
                    tableHtml += `<tr><td colspan="6" class="p-4 text-center text-gray-400">No rules added.</td></tr>`;
                } else {
                    rules.forEach((r, index) => {
                        tableHtml += `
                            <tr data-index="${index}" onclick="selectRfidRule(${index})" class="border-b hover:bg-gray-50 cursor-pointer ${index === selectedIndex ? 'bg-blue-100' : ''}">
                                <td class="py-2 px-4 w-12">${index + 1}</td>
                                <td class="py-2 px-4">${r.containerClass}</td>
                                <td class="py-2 px-4">${r.epcEncoding}</td>
                                <td class="py-2 px-4 text-center">${r.singleItem ? 'Y' : 'N'}</td>
                                <td class="py-2 px-4 text-center">${r.multiItem ? 'Y' : 'N'}</td>
                                <td class="py-2 px-4">${r.udf1}</td>
                            </tr>
                        `;
                    });
                }
                tableHtml += `</tbody></table>`;
                return tableHtml;
            };

             return `
                <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-wise-dark-gray">RFID Rules (CRUD Fungsional)</h3>
                    
                    <div class="p-4 border rounded-lg bg-gray-50 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="rfid-container-class" class="block text-sm mb-1">Container Class:</label>
                                <select id="rfid-container-class" class="select">
                                    ${dummyContainerClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label for="rfid-epc-encoding" class="block text-sm mb-1">EPC Encoding:</label>
                                <input type="text" id="rfid-epc-encoding" class="input">
                            </div>
                            <div>
                                <label for="rfid-udf1" class="block text-sm mb-1">User defined field 1:</label>
                                <input type="text" id="rfid-udf1" class="input">
                            </div>
                            <div class="flex flex-col justify-end space-y-2 pb-1">
                                <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="rfid-single-item"> Single item</label>
                                <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="rfid-multi-item"> Multi item</label>
                            </div>
                        </div>
                        <div class="flex gap-2">
                             <button type="button" class="btn btn-sm btn-primary" onclick="addRfidRule()">Add</button>
                             <button type="button" class="btn btn-sm btn-primary" onclick="updateRfidRule()">Update Selected</button>
                             <button type="button" class="btn btn-sm" onclick="clearRfidForm()">Clear Form</button>
                        </div>
                    </div>
                    
                    <div class="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto" id="rfid-table-container">
                        ${renderRulesTable()}
                    </div>
                    
                    <div class="flex gap-2">
                        <button type="button" class="btn btn-sm btn-primary" onclick="removeRfidRule()">Remove Selected</button>
                        <button type="button" class="btn btn-sm" onclick="moveRfidRule('up')">↑ Up</button>
                        <button type="button" class="btn btn-sm" onclick="moveRfidRule('down')">↓ Down</button>
                    </div>
                </div>
            `;
        }

        // --- RFID CRUD Logic ---
        const getRfidModel = (customerId) => {
            const customer = customers.find(c => c.id === customerId);
            return (customer ? customer.rfid : EMPTY_CUSTOMER.rfid) || EMPTY_CUSTOMER.rfid;
        };

        /// Update model dan auto-save setelah perubahan.
        const setRfidModelAndSave = (customerId, newRfid) => {
            const customerIndex = customers.findIndex(c => c.id === customerId);
            if (customerIndex !== -1) {
                // Update data internal
                customers[customerIndex].rfid = newRfid;
                
                // Persistensi Seketika
                saveCustomers(); 
                
                // RENDER ULANG TAB RFID DI DALAM MODAL
                const rfidPane = document.getElementById('pane-rfid');
                if (rfidPane) {
                    // Render ulang konten tab
                    rfidPane.innerHTML = window.renderRFIDTab(customers[customerIndex]);
                }
                
                return customers[customerIndex].rfid;
            }
            return EMPTY_CUSTOMER.rfid;
        };
        
        const getRfidFormInput = () => ({
            containerClass: document.getElementById('rfid-container-class').value,
            epcEncoding: document.getElementById('rfid-epc-encoding').value,
            singleItem: document.getElementById('rfid-single-item').checked,
            multiItem: document.getElementById('rfid-multi-item').checked,
            udf1: document.getElementById('rfid-udf1').value,
        });
        
        window.selectRfidRule = function(index) {
            const customerId = document.getElementById('customer-form').dataset.id;
            let rfid = getRfidModel(customerId);
            rfid.selectedIndex = index;
            const rule = rfid.rows[index];
            
            // Isi form dengan data rule yang terpilih
            document.getElementById('rfid-container-class').value = rule.containerClass;
            document.getElementById('rfid-epc-encoding').value = rule.epcEncoding;
            document.getElementById('rfid-single-item').checked = rule.singleItem;
            document.getElementById('rfid-multi-item').checked = rule.multiItem;
            document.getElementById('rfid-udf1').value = rule.udf1;
            
            setRfidModelAndSave(customerId, rfid); // Re-render untuk highlight seleksi
        };

        // window.clearRfidForm = function() {
        //     const customerId = document.getElementById('customer-form').dataset.id;
        //     document.getElementById('rfid-container-class').selectedIndex = 0;
        //     document.getElementById('rfid-epc-encoding').value = '';
        //     document.getElementById('rfid-single-item').checked = false;
        //     document.getElementById('rfid-multi-item').checked = false;
        //     document.getElementById('rfid-udf1').value = '';
            
        //     let rfid = getRfidModel(customerId);
        //     rfid.selectedIndex = -1;
        //     setRfidModelAndSave(customerId, rfid); // Re-render untuk hapus highlight
        // };
        window.addRfidRule = async function() {
            const customerId = document.getElementById('customer-form').dataset.id;
            let rfid = getRfidModel(customerId);
            const newRule = getRfidFormInput();

            // FIX 3: Validasi Cepat sebelum menambah
            if (!newRule.containerClass || !newRule.epcEncoding || !newRule.udf1) {
                 await window.showCustomAlert('Perhatian', 'Container Class, EPC Encoding, dan User Defined Field 1 wajib diisi sebelum menambah aturan.');
                 return;
            }

            rfid.rows.push(newRule);
            rfid.selectedIndex = rfid.rows.length - 1;
            setRfidModelAndSave(customerId, rfid);
            await window.showCustomAlert('Sukses', 'Aturan RFID ditambahkan dan disimpan!');
        };
        
        window.updateRfidRule = async function() {
            const customerId = document.getElementById('customer-form').dataset.id;
            let rfid = getRfidModel(customerId);
            
            if (rfid.selectedIndex === -1) { await window.showCustomAlert('Error', 'Pilih baris yang akan diperbarui dulu!'); return; }
            
            const updatedRule = getRfidFormInput();
            // FIX 3: Validasi Cepat sebelum update
            if (!updatedRule.containerClass || !updatedRule.epcEncoding || !updatedRule.udf1) {
                 await window.showCustomAlert('Perhatian', 'Container Class, EPC Encoding, dan User Defined Field 1 wajib diisi sebelum memperbarui.');
                 return;
            }
            
            rfid.rows[rfid.selectedIndex] = updatedRule;
            setRfidModelAndSave(customerId, rfid);
            await window.showCustomAlert('Sukses', 'Aturan RFID diperbarui dan disimpan!');
        };

        window.removeRfidRule = async function() {
            const customerId = document.getElementById('customer-form').dataset.id;
            let rfid = getRfidModel(customerId);
            
            if (rfid.selectedIndex === -1) { await window.showCustomAlert('Error', 'Pilih baris yang akan dihapus dulu!'); return; }
            
            const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Yakin hapus aturan RFID ini?');
            if (confirmed) {
                rfid.rows.splice(rfid.selectedIndex, 1);
                rfid.selectedIndex = -1;
                setRfidModelAndSave(customerId, rfid);
                clearRfidForm();
                await window.showCustomAlert('Dihapus', 'Aturan RFID berhasil dihapus dan disimpan.');
            }
        };

        window.moveRfidRule = function(direction) {
            const customerId = document.getElementById('customer-form').dataset.id;
            let rfid = getRfidModel(customerId);
            const idx = rfid.selectedIndex;
            if (idx === -1) return;
            
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx >= 0 && newIdx < rfid.rows.length) {
                [rfid.rows[idx], rfid.rows[newIdx]] = [rfid.rows[newIdx], rfid.rows[idx]];
                rfid.selectedIndex = newIdx;
                setRfidModelAndSave(customerId, rfid);
            }
        };
        window.moveRfidRule = function(direction) {
            let rfid = getRfidModel();
            const idx = rfid.selectedIndex;
            if (idx === -1) return;
            
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx >= 0 && newIdx < rfid.rows.length) {
                [rfid.rows[idx], rfid.rows[newIdx]] = [rfid.rows[newIdx], rfid.rows[idx]];
                rfid.selectedIndex = newIdx;
                setRfidModel(rfid);
            }
        };
        
        // FIX: Render UDF hanya 6 field
        function renderUdfTab(model) {
             // Komentar: Ini adalah UI Only, meniru layout "User Defined Data"
            const { udf = EMPTY_CUSTOMER.udf, inactive = false } = model || {};

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 6 }, (_, i) => { // FIX: Loop hanya sampai 6
                        const key = `udf${i + 1}`;
                        return `
                        <div>
                            <label for="${key}" class="block text-sm mb-1">User defined field ${i + 1}:</label>
                            <input type="text" id="${key}" name="${key}" class="input" value="${udf[key] || ''}">
                        </div>
                    `;
                    }).join('')}
                </div>
                <div class="mt-4">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="inactive" name="inactive" ${inactive ? 'checked' : ''}> Inactive
                    </label>
                </div>
            `;
        }

        window.showCustomerForm = function (mode, id = null) {
            const modal = document.getElementById('customer-form-modal');
            const form = document.getElementById('customer-form');
            const title = document.getElementById('customer-form-title');
            
            let customerData = {};

            if (mode === 'create') {
                customerData = JSON.parse(JSON.stringify(EMPTY_CUSTOMER)); 
            } else if (mode === 'edit' && id) {
                const found = customers.find(c => c.id === id);
                if (!found) {
                    window.showCustomAlert('Error', 'Customer not found!');
                    return;
                }
                customerData = JSON.parse(JSON.stringify(found)); 
            } else {
                customerData = JSON.parse(JSON.stringify(EMPTY_CUSTOMER));
            }

            title.textContent = mode === 'create' ? 'Customer - Create New' : 'Customer - Edit Existing';
            
            // Render Tabs Dulu
            document.getElementById('pane-address').innerHTML = renderAddressTab(customerData);
            document.getElementById('pane-general').innerHTML = renderGeneralTab(customerData);
            document.getElementById('pane-categories').innerHTML = renderCategoriesTab(customerData);
            document.getElementById('pane-fba').innerHTML = renderFreightBillTab(customerData); 
            document.getElementById('pane-rfid').innerHTML = renderRFIDTab(customerData);
            document.getElementById('pane-udf').innerHTML = renderUdfTab(customerData);

            if (!modal._listenersAttached) {
                modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => window.activateTab(button.dataset.tab, modal) });
                modal._listenersAttached = true;
            }
            window.activateTab('general', modal);

            form.dataset.id = customerData.id || '';
            form.dataset.mode = mode;

            // MANUAL POPULATE INPUTS (FIX UTAMA AGAR EDIT BERFUNGSI)
            // Ini memastikan elemen form benar-benar diisi dengan nilai lama
            
            // Tab General
            document.getElementById('customer').value = customerData.customer || '';
            document.getElementById('company').value = customerData.company || '';
            if (document.getElementById('onHold')) document.getElementById('onHold').checked = customerData.onHold || false;
            if (document.getElementById('residential')) document.getElementById('residential').checked = customerData.residential || false;
            if (document.getElementById('isActive')) document.getElementById('isActive').checked = customerData.isActive !== false; // Default true
            if (document.getElementById('isBanned')) document.getElementById('isBanned').checked = customerData.isBanned || false;
            
            // Tab Address (tempat field 'name' berada)
            document.getElementById('name').value = customerData.name || ''; // FIX untuk field NAME
            document.getElementById('address1').value = customerData.address1 || '';
            document.getElementById('address2').value = customerData.address2 || '';
            document.getElementById('city').value = customerData.city || '';
            document.getElementById('state').value = customerData.state || '';
            document.getElementById('postalCode').value = customerData.zip || '';
            document.getElementById('country').value = customerData.country || '';
            document.getElementById('emailAddress').value = customerData.email || '';
            document.getElementById('phoneNumber').value = customerData.phone || '';
            
            // Tab FBA (Contoh)
            if (document.getElementById('fba-name')) document.getElementById('fba-name').value = customerData.fba_name || '';


            // Logika Tampilan Modal (Tetap sama seperti perbaikan sebelumnya)
            const modalContent = modal.querySelector('.bg-white.rounded-xl.shadow-2xl');
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');
            
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
                
                const customerInput = document.getElementById('customer');
                if (customerInput) {
                    try { customerInput.focus(); } catch(e) { console.error("Failed to focus customer input:", e); }
                }

                modal._keydownHandler = (e) => {
                    if (e.key === 'Escape') {
                         window.closeCustomerForm();
                    }
                };
                modal.addEventListener('keydown', modal._keydownHandler);
                
            }, 10);
        };

        window.closeCustomerForm = function () {
            const modal = document.getElementById('customer-form-modal');
            const modalContent = modal.querySelector('.bg-white.rounded-xl.shadow-2xl');

             if (modal._keydownHandler) {
                 modal.removeEventListener('keydown', modal._keydownHandler);
                 delete modal._keydownHandler;
            }

            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }, 300); // Sesuai durasi transisi
        };

        window.closeCustomerForm = function () {
            document.getElementById('customer-form-modal').classList.add('hidden');
        };

        window.handleCustomerSubmit = async function (event) {
            event.preventDefault();
            const modal = document.getElementById('customer-form-modal');
            
            // Panggil custom validation. Jika gagal, hentikan proses.
            if (!validateCustomerForm(modal)) {
                return;
            }

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            // Kumpulkan semua data form
            const formData = {
                id: id || generateUniqueId(),
                
                // --- General Tab ---
                customer: document.getElementById('customer').value.trim(),
                // DIHAPUS: Baris untuk shipTo
                // DIHAPUS: Baris untuk parent
                company: document.getElementById('company').value,
                onHold: document.getElementById('onHold')?.checked || false,
                carriers: Array.from(form.querySelectorAll('input[name="carriers"]')).map(el => el.value.trim()).filter(Boolean),
                
                // --- Address Tab ---
                name: document.getElementById('name').value.trim(),
                residential: document.getElementById('residential')?.checked || false,
                address1: document.getElementById('address1').value.trim(),
                address2: document.getElementById('address2').value.trim(),
                address3: document.getElementById('address3').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                postalCode: document.getElementById('postalCode').value.trim(),
                country: document.getElementById('country').value.trim(),
                faxNumber: document.getElementById('faxNumber').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                emailAddress: document.getElementById('emailAddress').value.trim(),

                // --- Categories Tab ---
                categories: Array.from({ length: 10 }).reduce((acc, _, i) => {
                    const key = `category${i + 1}`;
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) acc[key] = input.value.trim();
                    return acc;
                }, {}),

                // --- FBA Tab ---
                fba_name: document.getElementById('fba-name')?.value.trim() || '',
                fba_address1: document.getElementById('fba-address1')?.value.trim() || '',
                fba_address2: document.getElementById('fba-address2')?.value.trim() || '',
                fba_address3: document.getElementById('fba-address3')?.value.trim() || '',
                fba_city: document.getElementById('fba-city')?.value.trim() || '',
                fba_state: document.getElementById('fba-state')?.value.trim() || '',
                fba_postalCode: document.getElementById('fba-postalCode')?.value.trim() || '',
                fba_country: document.getElementById('fba-country')?.value.trim() || '',
                
                // --- RFID Tab (Data RFID di-handle terpisah sama CRUD-nya, jadi gak perlu diambil di sini) ---
                rfid: (customers.find(c => c.id === id) || EMPTY_CUSTOMER).rfid,

                // --- UDF Tab ---
                udf: Array.from({ length: 6 }).reduce((acc, _, i) => {
                    const key = `udf${i + 1}`;
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) acc[key] = input.value.trim();
                    return acc;
                }, {}),
                inactive: document.getElementById('inactive')?.checked || false,

            };


            // Proses penyimpanan (Create / Update)
            if (mode === 'create') {
                customers.push(formData);
                await window.showCustomAlert('Success', 'Customer created successfully.');
            } else if (mode === 'edit') {
                const index = customers.findIndex(c => c.id === id);
                if (index !== -1) {
                    // Gabungkan data lama dengan data baru
                    customers[index] = { ...customers[index], ...formData };
                    await window.showCustomAlert('Success', `Customer ${formData.customer} updated successfully.`);
                }
            }
            
            // Simpan ke Local Storage
            saveCustomers();

            // Tutup modal dan refresh list
            window.closeCustomerForm();
            window.renderCustomerList();
        };

        window.deleteCustomer = async function (id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this customer?');
            if (confirmed) {
                customers = customers.filter(c => c.id !== id);
                saveCustomers();
                window.renderCustomerList();
                await window.showCustomAlert('Deleted', 'Customer deleted successfully!');
            }
        };

        // --- REGISTRATION ---

        if (!window.contentData[CUSTOMER_CATEGORY_KEY]) {
            window.contentData[CUSTOMER_CATEGORY_KEY] = {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Customer</h2>
                    <p class="text-wise-gray mb-4">Manage customer master data, including addresses and classification.</p>
                    ${window.renderStandardListHeader({
                        createLabel: "Create New Customer",
                        onCreate: "showCustomerForm('create')", // FIX: Ensure function is called with mode 'create'
                        searchId: "customer-search",
                        searchPlaceholder: "Search customer...",
                        onSearch: "filterCustomerList"
                    })}
                    <div id="customer-list-container" class="overflow-x-auto"></div>

                    <!-- Customer Form Modal (Menggunakan struktur proyek) -->
                    <div id="customer-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
                        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
                            <div class="px-6 pt-5 pb-3 border-b relative">
                                <h3 id="customer-form-title" class="text-lg font-semibold"></h3>
                                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeCustomerForm()">✕</button>
                            </div>
                            <div class="p-6 overflow-y-auto">
                                <form id="customer-form" onsubmit="handleCustomerSubmit(event)">
                                    <div role="tablist" class="border-b mb-4 flex flex-wrap gap-x-4 text-sm font-medium">
                                        <!-- FIX: re-order tabs (Address first) -->
                                        <button type="button" role="tab" data-tab="address" class="tab tab-active">Address</button>
                                        <button type="button" role="tab" data-tab="general" class="tab">General</button>
                                        <button type="button" role="tab" data-tab="categories" class="tab">Categories</button>
                                        <button type="button" role="tab" data-tab="fba" class="tab">Freight bill to address</button>
                                        <button type="button" role="tab" data-tab="rfid" class="tab">RFID</button>
                                        <button type="button" role="tab" data-tab="udf" class="tab">User defined data</button>
                                    </div>
                                    <!-- FIX: re-order tabpanels -->
                                    <div id="pane-address" role="tabpanel" data-pane="address"></div>
                                    <div id="pane-general" role="tabpanel" data-pane="general" class="hidden"></div>
                                    <div id="pane-categories" role="tabpanel" data-pane="categories" class="hidden"></div>
                                    <div id="pane-fba" role="tabpanel" data-pane="fba" class="hidden"></div>
                                    <div id="pane-rfid" role="tabpanel" data-pane="rfid" class="hidden"></div>
                                    <div id="pane-udf" role="tabpanel" data-pane="udf" class="hidden"></div>
                                    <input type="hidden" name="id" value="">
                                </form>
                            </div>
                            ${window.renderStandardModalFooter({
                                cancelOnclick: "closeCustomerForm()",
                                submitFormId: "customer-form",
                                submitLabel: "Save"
                            })}
                        </div>
                    </div>
                `
            };

            window.searchItems.push({ id: CUSTOMER_CATEGORY_KEY, title: 'Customer', category: 'Configuration', lastUpdated: 'Latest' });
            window.allMenus.push({ name: 'Customer', category: 'Configurations' });
            window.parentMapping[CUSTOMER_CATEGORY_KEY] = 'configuration'; 
        }


        // 3. Auto-render dan listener (Memastikan render list saat berpindah ke tab)
        const autoRenderCustomer = () => {
            const container = document.getElementById('customer-list-container');
            if (container && !container.dataset.bound) {
                window.renderCustomerList();
                container.dataset.bound = '1';
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    autoRenderCustomer();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        document.addEventListener('content:rendered', (e) => {
            if (e.detail.key === CUSTOMER_CATEGORY_KEY) {
                window.renderCustomerList();
            }
        });

    });
})();
