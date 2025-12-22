(function () {
    // Configuration V6 (Customer dan Company)
    // NOTE: Fungsi utility berikut sekarang tersedia dari utils.js:
    // - window.debounce()
    // - window.showCustomAlert()
    // - window.showCustomConfirm()
    // - window.renderStandardListHeader()
    // - window.renderStandardModalFooter()
    // - window.activateTab()

    // Memastikan variabel global utama tersedia
    if (typeof window.contentData === 'undefined') window.contentData = {};
    if (typeof window.searchItems === 'undefined') window.searchItems = [];
    if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
    if (typeof window.allMenus === 'undefined') window.allMenus = [];

    // Fallback untuk selectCategory (fungsi khusus dari configuration.js)
    if (typeof window.selectCategory === 'undefined') window.selectCategory = (category) => console.log(`Selecting category: ${category}`);


    document.addEventListener('DOMContentLoaded', () => {
        // --- KONSTANTA DAN KUNCI STORAGE CUSTOMER ---
        const CUSTOMER_STORAGE_KEY = 'wms_customers_v6';
        const CUSTOMER_ID_PREFIX = 'CUS';
        const CUSTOMER_CATEGORY_KEY = 'customer';

        // --- KONSTANTA DAN KUNCI STORAGE COMPANY ---
        const COMPANY_STORAGE_KEY = 'wms_companies_v6';
        const COMPANY_ID_PREFIX = 'CMP';
        const COMPANY_CATEGORY_KEY = 'company';
        const WAREHOUSE_ID_PREFIX = 'WHS';
        const WAREHOUSE_CATEGORY_KEY = 'configuration-warehouse'; // Kategori halaman Warehouse mandiri

        // State global untuk ID Company yang sedang dipilih
        window.currentSelectedCompanyId = null;

        // --- DATA DUMMY DROPDOWN/LIST ---
        const DUMMY_STATE_CODES = [
            'JAK-PUS', 'JAKTIM', 'JAKBAR', 'JAKSEL', 'JAKUT',
            'ACEH', 'BALI', 'Bandung', 'Banten', 'Bogor',
            'Brebes', 'Ciamis', 'Cianjur'
        ];
        const DUMMY_COUNTRIES = [
            { code: 'ID', name: 'Indonesia' },
            { code: 'CN', name: 'China' }
        ];
        const DUMMY_WAREHOUSES = [
            'DCB', 'DCI', 'DMR', 'DCS', 'JKT', 'BDG',
            'DCE', 'DCF', 'DCJ', 'DCK', 'DCL', 'DCM'
        ];

        const dummyCarriers = ['D8232EC', 'D8375DE', 'D8382EB', 'D8391DA', 'D8434DM', 'D8473FU', 'D8513FU', 'D8517FB'];
        const dummyCompanies = ['DCB', 'DCI', 'DMR', 'DCS', 'DCJ', 'DCK', 'DCL', 'DCM'];
        const dummyContainerClasses = ['Bag', 'Crate', 'Dus', 'Eggs', 'Pallet', 'Roll Cage', 'Tote'];

        // Data lengkap semua user untuk tab Assigned Users (Company)
        const ALL_USERS_LIST = [
            'Abdu23074560', 'Abdul04120625', 'Abdul19100020', 'Abo13080182',
            'Absari93030039', 'Achmad00090094', 'Adam18101751', 'ade', 'Ade15040047',
            'Ade21120012', 'Ades17080031', 'Adi20100099', 'Adi2020284', 'Adi22110060',
            'Adi23070426', 'Adj24070022', 'Administrator', 'ADMReturDCB', 'Affand24051301',
            'Affang12050122', 'Agung15050074', 'Agung92060006', 'AgusHD4182', 'Aji18100334',
            'Aldi18100012', 'Aldi18101752', 'Ali17120115', 'Andri06010006', 'Andri10010079',
            'aneu03090082', 'Angga20030129', 'Anggi12020296', 'Anggi224114936', 'Anthony16070099',
            'Antonius08030061', 'Anwar08060080', 'Anwar23110223', 'Apep12020068', 'Ariefudin08100941',
            'Ari14100032', 'aris03090062', 'Aris09030029', 'Arlan12050176', 'ASEP01100086',
            'Asep08060073', 'Asep11010929', 'Asep12040051', 'Asep17040017', 'Asep18050091',
            'Asep19030279', 'Asep20072189', 'Asep20103123', 'Atun931', 'Bagus1', 'Bambar',
            'Budi08', 'Budi12', 'Budi13', 'Burhani', 'Buyung', 'candra', 'Cece04', 'CecepC',
            'Cheke', 'Cheke'
        ];

        // --- MODEL CUSTOMER DEFAULT ---
        const EMPTY_CUSTOMER = {
            // Data Umum
            id: null, customer: '', shipTo: '', company: '', name: '', parent: '', inactive: false,
            onHold: false, carriers: [],
            // Data Alamat Level-atas
            residential: false, address1: '', address2: '', address3: '', city: '', state: '', postalCode: '', country: '', faxNumber: '', phoneNumber: '', emailAddress: '',
            // Kategori (10 field)
            categories: Array.from({ length: 10 }, (_, i) => ({ [`category${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
            // Alamat Freight Bill To
            fba_name: '', fba_address1: '', fba_address2: '', fba_address3: '', fba_city: '', fba_state: '', fba_postalCode: '', fba_country: '',
            // Struktur data RFID
            rfid: {
                rows: [],
                selectedIndex: -1, // Status seleksi UI
                filter: { andOr: 'AND', attribute: '', op: '=', value: '' }
            },
            // UDF (6 field)
            udf: Array.from({ length: 6 }, (_, i) => ({ [`udf${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        };

        // Memuat atau inisialisasi data Customer
        let customers = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY)) || [
            {
                id: CUSTOMER_ID_PREFIX + '001', customer: '12160', shipTo: '001', company: 'DCB', name: 'PT MAJU JAYA ABADI', parent: '12160', inactive: false, residential: false, onHold: false, carriers: ['D8232EC'], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, fba_name: 'Freight Bill Co', fba_address1: 'FBA Address 1', fba_city: 'Jakarta', fba_country: 'ID',
                rfid: { rows: [{ containerClass: 'Pallet', epcEncoding: 'EPC123', singleItem: true, multiItem: false, udf1: 'A1' }], selectedIndex: -1, filter: EMPTY_CUSTOMER.rfid.filter }
            },
            { id: CUSTOMER_ID_PREFIX + '002', customer: '12161', shipTo: '001', company: 'DCI', name: 'CV BERKAH MANDIRI', parent: '12161', inactive: false, residential: true, onHold: false, carriers: ['D8375DE', 'D8382EB'], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, rfid: EMPTY_CUSTOMER.rfid },
            { id: CUSTOMER_ID_PREFIX + '003', customer: '12162', shipTo: '002', company: 'DCB', name: 'PT SEJAHTERA SELALU', parent: '12162', inactive: true, residential: false, onHold: true, carriers: [], categories: EMPTY_CUSTOMER.categories, udf: EMPTY_CUSTOMER.udf, rfid: EMPTY_CUSTOMER.rfid }
        ];

        // Helper untuk menghasilkan ID unik
        const generateUniqueId = (prefix) => {
            return prefix + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        };
        // Helper untuk menyimpan data Customer
        const saveCustomers = () => localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));

        // --- MODEL COMPANY DEFAULT ---

        // Model Alamat yang terstandarisasi
        const EMPTY_ADDRESS = {
            name: '', address1: '', address2: '', address3: '',
            city: '', statePostalCode: '', postalCode: '', country: 'ID',
            attentionTo: '', faxNumber: '', phoneNumber: '', emailAddress: '',
        };

        // Model detail Warehouse
        const EMPTY_WAREHOUSE_INFO = {
            id: null,
            warehouseCode: '',
            shipFromAddress: { ...EMPTY_ADDRESS },
            warehouseReturnAddress: { ...EMPTY_ADDRESS },
            warehouseFreightBillToAddress: { ...EMPTY_ADDRESS },
            // UDF Warehouse (8 field)
            warehouseUdf: Array.from({ length: 8 }, (_, i) => ({ [`udf${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        };

        // Model Company utama
        const EMPTY_COMPANY = {
            id: null,
            companyCode: '',
            inactive: false,

            // Tab General / Warehouse/company information
            general: {
                uccEanNumber: '', orderIdPrefix: '', receiptIdPrefix: '',
                purchaseOrderIdPrefix: '', availabilityChecking: false,
            },

            // Addresses
            companyAddress: { ...EMPTY_ADDRESS },
            returnAddress: { ...EMPTY_ADDRESS },
            freightBillToAddress: { ...EMPTY_ADDRESS },

            // Tab Internet information & Web header
            webHeader: {
                leftGraphic: '', centerGraphic: '', rightGraphic: '',
                leftUrl: '', centerUrl: '', rightUrl: '',
            },
            internetInfo: {
                websiteUrl: '', emailSupport: '', phoneSupport: ''
            },

            // Tab Assigned users
            assignedUsers: [],

            // Tab User defined data (8 field)
            udf: Array.from({ length: 8 }, (_, i) => ({ [`udf${i + 1}`]: '' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

            // Nested Warehouse/company information list
            warehouses: {
                rows: [],
                selectedIndex: -1
            }
        };

        // Memuat atau inisialisasi data Company
        let companies = JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY)) || [
            {
                ...EMPTY_COMPANY,
                id: COMPANY_ID_PREFIX + '001',
                companyCode: 'DCJ',
                inactive: false,
                companyAddress: {
                    ...EMPTY_ADDRESS,
                    name: 'DC JAKARTA',
                    address1: 'JL. ARTERI MANGGA DUA RAYA PUSAT',
                    statePostalCode: 'JAK-PUS',
                    city: 'JAKARTA',
                    postalCode: '10730'
                },
                assignedUsers: [
                    { userId: 'Anggi12020296', name: 'Anggi12020296' },
                    { userId: 'Anggi224114936', name: 'Anggi224114936' }
                ],
                warehouses: {
                    rows: [
                        {
                            ...EMPTY_WAREHOUSE_INFO,
                            id: WAREHOUSE_ID_PREFIX + '001',
                            warehouseCode: 'WHS01',
                            shipFromAddress: { ...EMPTY_ADDRESS, name: 'DC BUAH BATU WHS', address1: 'Jl. Buah Batu No. 1' }
                        },
                        {
                            ...EMPTY_WAREHOUSE_INFO,
                            id: WAREHOUSE_ID_PREFIX + '002',
                            warehouseCode: 'WHS02',
                            shipFromAddress: { ...EMPTY_ADDRESS, name: 'DC CIKARANG WHS', address1: 'Jl. Cikarang Utama' }
                        }
                    ],
                    selectedIndex: -1
                }
            },
            {
                ...EMPTY_COMPANY,
                id: COMPANY_ID_PREFIX + '002',
                companyCode: 'DCC',
                inactive: true,
                assignedUsers: [{ userId: 'Atun931', name: 'Atun931' }],
                companyAddress: { ...EMPTY_ADDRESS, name: 'DC CIKONENG', address1: 'Jl. Cikoneng No. 10', statePostalCode: 'Bandung', city: 'Bandung' }
            },
        ];

        // Helper untuk menyimpan data Company
        const saveCompanies = () => localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companies));

        // --- HELPER RENDERING ALAMAT (COMPANY/WAREHOUSE) ---

        /**
         * Render formulir input alamat standar.
         * @param {object} data - Objek data alamat.
         * @param {string} type - Tipe prefix field (e.g., 'companyAddress').
         * @param {boolean} isNested - Apakah ini form di sub-modal Warehouse.
         */
        const renderGenericAddressForm = (data, type, isNested = false) => {
            const { name = '', address1 = '', address2 = '', address3 = '',
                city = '', statePostalCode = '', country = 'ID', postalCode = '',
                attentionTo = '', faxNumber = '', phoneNumber = '', emailAddress = ''
            } = data;

            const prefix = type;
            const labelName = type === 'shipFromAddress' ? 'Ship From Name' : 'Company Name';
            const isCompanyAddressTab = type === 'companyAddress';

            // Tombol Copy muncul di alamat selain Company Address, dan di semua alamat Warehouse
            const showCopyButton = (!isNested && !isCompanyAddressTab) || isNested;

            const copyButtonHtml = showCopyButton ? `
                <button type="button" class="btn btn-sm mb-2 text-wise-primary border-wise-primary hover:bg-wise-light-gray" onclick="window.copyCompanyAddress('${type}', ${isNested})">
                    Copy from Company
                </button>
            ` : '';

            const sameAsCheckbox = !isNested && !isCompanyAddressTab ?
                document.getElementById(`${type.replace('Address', '')}-same-as-company`) : null;

            const disabledAttr = sameAsCheckbox?.checked && !isNested ? 'disabled' : '';

            return `
                <div class="space-y-4">
                    ${copyButtonHtml}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label for="${prefix}-name" class="block text-sm mb-1">${labelName}: ${isCompanyAddressTab || type === 'shipFromAddress' ? '<span class="text-red-500">*</span>' : ''}</label>
                            <input type="text" id="${prefix}-name" name="${prefix}_name" class="input" value="${name}" ${disabledAttr}>
                        </div>
                        <div class="md:col-span-2">
                            <label for="${prefix}-address1" class="block text-sm mb-1">Address 1:</label>
                            <input type="text" id="${prefix}-address1" name="${prefix}_address1" class="input" value="${address1}" ${disabledAttr}>
                        </div>
                        <div class="md:col-span-2">
                            <label for="${prefix}-address2" class="block text-sm mb-1">Address 2 (optional):</label>
                            <input type="text" id="${prefix}-address2" name="${prefix}_address2" class="input" value="${address2}" ${disabledAttr}>
                        </div>
                        <div class="md:col-span-2">
                            <label for="${prefix}-address3" class="block text-sm mb-1">Address 3 (optional):</label>
                            <input type="text" id="${prefix}-address3" name="${prefix}_address3" class="input" value="${address3}" ${disabledAttr}>
                        </div>
                        <div>
                            <label for="${prefix}-city" class="block text-sm mb-1">City:</label>
                            <input type="text" id="${prefix}-city" name="${prefix}_city" class="input" value="${city}" ${disabledAttr}>
                        </div>
                        <div>
                            <label for="${prefix}-statePostalCode" class="block text-sm mb-1">State/Postal code: <span class="text-gray-500">(Kode wilayah)</span></label>
                            <div class="flex gap-2">
                                <select id="${prefix}-statePostalCode" name="${prefix}_statePostalCode" class="select flex-1" ${disabledAttr}>
                                    <option value="">-- Select Code --</option>
                                    ${DUMMY_STATE_CODES.map(p => `<option value="${p}" ${statePostalCode === p ? 'selected' : ''}>${p}</option>`).join('')}
                                </select>
                                <input type="text" id="${prefix}-postalCode" name="${prefix}_postalCode" class="input w-20" placeholder="0000" value="${postalCode || ''}" ${disabledAttr}>
                            </div>
                        </div>
                        <div>
                            <label for="${prefix}-country" class="block text-sm mb-1">Country:</label>
                            <select id="${prefix}-country" name="${prefix}_country" class="select" ${disabledAttr}>
                                <option value="">-- Select --</option>
                                ${DUMMY_COUNTRIES.map(c => `<option value="${c.code}" ${country === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="${prefix}-attentionTo" class="block text-sm mb-1">Attention to:</label>
                            <input type="text" id="${prefix}-attentionTo" name="${prefix}_attentionTo" class="input" value="${attentionTo}" ${disabledAttr}>
                        </div>
                        <div>
                            <label for="${prefix}-faxNumber" class="block text-sm mb-1">Fax number:</label>
                            <input type="text" id="${prefix}-faxNumber" name="${prefix}_faxNumber" class="input" value="${faxNumber}" ${disabledAttr}>
                        </div>
                        <div>
                            <label for="${prefix}-phoneNumber" class="block text-sm mb-1">Phone number:</label>
                            <input type="text" id="${prefix}-phoneNumber" name="${prefix}_phoneNumber" class="input" value="${phoneNumber}" ${disabledAttr}>
                        </div>
                        <div>
                            <label for="${prefix}-emailAddress" class="block text-sm mb-1">Email address:</label>
                            <input type="email" id="${prefix}-emailAddress" name="${prefix}_emailAddress" class="input" value="${emailAddress}" ${disabledAttr}>
                        </div>
                    </div>
                </div>
            `;
        };

        /**
         * Helper untuk menyalin alamat Company ke alamat lain di modal Company atau Sub-modal Warehouse.
         */
        window.copyCompanyAddress = function (targetType, isNested = false) {
            const form = isNested ? document.getElementById('warehouse-form') : document.getElementById('company-form');
            const companyId = form.dataset.companyId || form.dataset.id;

            const mode = form.dataset.mode;
            let source = {};

            if (mode === 'create' && !isNested) {
                // Ambil data dari input Company Address di form yang sama
                const companyAddressInputs = Array.from(form.querySelectorAll('[name^="companyAddress_"]'));
                source = {};
                companyAddressInputs.forEach(input => {
                    const key = input.name.replace('companyAddress_', '');
                    source[key] = input.value;
                });

            } else {
                // Ambil data dari Company yang sudah tersimpan
                const companyData = companies.find(c => c.id === companyId);
                if (!companyData) {
                    if (isNested || form.querySelector(`[name="${targetType}_sameAsCompany"]`)) {
                        source = EMPTY_COMPANY.companyAddress;
                    } else {
                        window.showCustomAlert('Error', 'Company data not found for copying.');
                        return;
                    }
                } else {
                    source = companyData.companyAddress;
                }
            }

            const checkboxId = isNested ? 'whs-same-as-company' : `${targetType.replace('Address', '')}-same-as-company`;
            const sameAsCheckbox = document.getElementById(checkboxId);

            const elementsToCopy = [
                { idSuffix: 'name', name: 'name' }, { idSuffix: 'address1', name: 'address1' },
                { idSuffix: 'address2', name: 'address2' }, { idSuffix: 'address3', name: 'address3' },
                { idSuffix: 'city', name: 'city' }, { idSuffix: 'statePostalCode', name: 'statePostalCode' },
                { idSuffix: 'postalCode', name: 'postalCode' }, { idSuffix: 'country', name: 'country' },
                { idSuffix: 'attentionTo', name: 'attentionTo' }, { idSuffix: 'faxNumber', name: 'faxNumber' },
                { idSuffix: 'phoneNumber', name: 'phoneNumber' }, { idSuffix: 'emailAddress', name: 'emailAddress' },
            ];

            // Fungsi untuk mengaktifkan/menonaktifkan field
            const toggleFields = (disabled) => {
                elementsToCopy.forEach(field => {
                    const el = form.querySelector(`[name="${targetType}_${field.idSuffix}"]`);
                    if (el) {
                        if (disabled) {
                            el.setAttribute('disabled', 'disabled');
                        } else {
                            el.removeAttribute('disabled');
                        }
                    }
                });
            };

            const isChecked = sameAsCheckbox?.checked || false;

            if (!isNested) {
                if (sameAsCheckbox) {
                    toggleFields(isChecked);
                }
            }

            // Salin data
            if (!sameAsCheckbox || isChecked) {
                elementsToCopy.forEach(field => {
                    const el = form.querySelector(`[name="${targetType}_${field.idSuffix}"]`);
                    if (el) {
                        el.value = source[field.name] || '';
                    }
                });
            }
        };

        /**
         * Menangani perubahan checkbox "Same as company address" di modal Company.
         */
        window.handleSameAsCompanyChange = function (type) {
            const checkbox = document.getElementById(`${type}-same-as-company`);
            const form = document.getElementById('company-form');

            if (checkbox.checked) {
                window.copyCompanyAddress(`${type}Address`, false);
            } else {
                const elementsToCopy = ['name', 'address1', 'address2', 'address3', 'city', 'statePostalCode', 'postalCode', 'country', 'attentionTo', 'faxNumber', 'phoneNumber', 'emailAddress'];

                elementsToCopy.forEach(field => {
                    const el = form.querySelector(`[name="${type}Address_${field}"]`);
                    if (el) {
                        el.removeAttribute('disabled');
                    }
                });
            }
        };


        // --- FUNGSI RENDER DAN FILTER COMPANY ---

        /**
         * Render daftar Company di halaman utama Company.
         */
        window.renderCompanyList = function (filter = '') {
            const container = document.getElementById('company-list-container');
            if (!container) return;
            const lowerFilter = filter.toLowerCase();

            companies = JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY)) || companies;

            const filteredData = companies.filter(c =>
                (c.companyCode || '').toLowerCase().includes(lowerFilter) ||
                (c.companyAddress.name || '').toLowerCase().includes(lowerFilter)
            );

            let listWrapperHtml = `
                <div class="max-h-[60vh] overflow-y-auto border border-wise-border rounded-lg shadow-md">
                <table class="min-w-full bg-white">
                <thead>
                    <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-xs leading-normal">
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Company</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Name</th>
                        <th class="py-3 px-6 text-left sticky top-0 bg-wise-light-gray">Active</th>
                        <th class="py-3 px-6 text-center sticky top-0 bg-wise-light-gray">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-wise-gray text-sm font-light">`;

            if (filteredData.length === 0) {
                listWrapperHtml += `<tr><td colspan="4" class="py-3 px-6 text-center">No companies found.</td></tr>`;
            } else {
                filteredData.forEach(c => {
                    listWrapperHtml += `<tr class="border-b hover:bg-gray-50 cursor-pointer" onclick="window.currentSelectedCompanyId = '${c.id}'" ondblclick="showCompanyForm('edit', '${c.id}')">
                        <td class="py-3 px-6 text-left whitespace-nowrap">${c.companyCode}</td>
                        <td class="py-3 px-6 text-left">${c.companyAddress.name || 'N/A'}</td>
                        <td class="py-3 px-6 text-left">${!c.inactive ? 'Yes' : 'No'}</td>
                        <td class="py-3 px-6 text-center">
                            <div class="flex item-center justify-center">
                                <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="event.stopPropagation(); showCompanyForm('edit', '${c.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                                <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="event.stopPropagation(); deleteCompany('${c.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                            </div>
                        </td>
                    </tr>`;
                });
            }
            listWrapperHtml += `</tbody></table></div>`;
            container.innerHTML = listWrapperHtml;
        };

        // Fungsi debounce untuk pencarian Company
        window.filterCompanyList = window.debounce((value) => window.renderCompanyList(value), 300);

        // --- VALIDASI FORM COMPANY ---

        function validateCompanyForm(modal) {
            const form = document.getElementById('company-form');
            form.noValidate = true;

            const requiredFields = [
                { name: 'companyCode', tab: 'general', label: 'Company Code' },
                { name: 'companyAddress_name', tab: 'company-address', label: 'Company Address Name' },
            ];

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

            // Validasi field wajib
            requiredFields.forEach(field => {
                const el = form.querySelector(`[name="${field.name}"]`);
                const tabButton = modal.querySelector(`[role="tab"][data-tab="${field.tab}"]`);
                // Cek jika field ada dan tidak disabled
                if (el && !el.disabled) {
                    if (!el.value.trim()) {
                        setError(el, `${field.label} is required.`, field.tab);
                        if (tabButton) tabButton.classList.add('text-red-500');
                    }
                }
            });

            // Validasi format HTML5 lainnya (e.g., email, url, number)
            form.querySelectorAll('input:invalid, select:invalid').forEach(el => {
                if (el.hasAttribute('aria-invalid') || !el.checkValidity()) {
                    let tabId;
                    let currentElement = el;
                    while (currentElement && currentElement !== form) {
                        if (currentElement.getAttribute('role') === 'tabpanel') {
                            tabId = currentElement.dataset.pane;
                            break;
                        }
                        currentElement = currentElement.parentNode;
                    }

                    if (tabId && (!el.checkValidity() || !el.value.trim())) {
                        const label = el.parentNode.querySelector('label')?.textContent.replace(':', '').trim() || 'Field';
                        setError(el, `${label} ${!el.value.trim() ? 'is required.' : 'format is invalid.'}`, tabId);
                        const tabButton = modal.querySelector(`[role="tab"][data-tab="${tabId}"]`);
                        if (tabButton) tabButton.classList.add('text-red-500');
                    }
                }
            });


            if (firstInvalid) {
                if (targetTab) {
                    window.activateTab(targetTab, modal);
                }

                setTimeout(() => {
                    try { firstInvalid.focus(); } catch (e) { console.error("Gagal fokus input Company:", e); }
                }, 100);

                return false;
            }

            return true;
        }


        // --- VALIDASI FORM WAREHOUSE (SUB-MODAL) ---

        function validateWarehouseForm(modal) {
            const form = document.getElementById('warehouse-form');
            form.noValidate = true;

            const requiredFields = [
                { name: 'warehouseCode', tab: 'ship-from', label: 'Warehouse Code' },
                { name: 'shipFromAddress_name', tab: 'ship-from', label: 'Ship From Name' },
            ];

            let isValid = true;
            let firstInvalid = null;
            let targetTab = null;

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

            requiredFields.forEach(field => {
                const el = form.querySelector(`[name="${field.name}"]`);
                const tabButton = modal.querySelector(`[role="tab"][data-tab="${field.tab}"]`);
                if (el && !el.disabled) {
                    if (!el.value.trim()) {
                        setError(el, `${field.label} wajib diisi.`, field.tab);
                        if (tabButton) tabButton.classList.add('text-red-500');
                    }
                }
            });

            // Periksa error HTML5 lainnya
            form.querySelectorAll('input:invalid, select:invalid').forEach(el => {
                if (el.hasAttribute('aria-invalid') || !el.checkValidity()) {
                    let tabId;
                    let currentElement = el;
                    while (currentElement && currentElement !== form) {
                        if (currentElement.getAttribute('role') === 'tabpanel') {
                            tabId = currentElement.dataset.pane;
                            break;
                        }
                        currentElement = currentElement.parentNode;
                    }
                    if (tabId && (!el.checkValidity() || !el.value.trim())) {
                        const label = el.parentNode.querySelector('label')?.textContent.replace(':', '').trim() || 'Field';
                        setError(el, `${label} ${!el.value.trim() ? 'wajib diisi.' : 'format tidak valid.'}`, tabId);
                        const tabButton = modal.querySelector(`[role="tab"][data-tab="${tabId}"]`);
                        if (tabButton) tabButton.classList.add('text-red-500');
                    }
                }
            });


            if (firstInvalid) {
                if (targetTab) {
                    window.activateTab(targetTab, modal);
                }

                setTimeout(() => {
                    try { firstInvalid.focus(); } catch (e) { console.error("Gagal fokus input Warehouse:", e); }
                }, 100);

                return false;
            }

            return true;
        }

        // --- FUNGSI PENGELOLAAN LIST WAREHOUSE (NESTED CRUD) ---

        /**
         * Render list Warehouse di tab Warehouse/company information.
         * Menggunakan nama baru untuk menghindari konflik.
         */
        window.renderCompanyWarehouseList = function (companyId) {
            companies = JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY)) || companies;

            const container = document.getElementById('warehouse-list-container');
            const companyIndex = companies.findIndex(c => c.id === companyId);
            const companyData = companies[companyIndex];

            if (!companyData || !container) return;

            const warehouses = companyData.warehouses.rows || [];

            let currentSelectedIndex = companyData.warehouses.selectedIndex;

            // Koreksi index jika out-of-bounds (clamp)
            if (warehouses.length > 0 && currentSelectedIndex >= warehouses.length) {
                currentSelectedIndex = warehouses.length - 1;
                companyData.warehouses.selectedIndex = currentSelectedIndex;
            } else if (warehouses.length === 0) {
                currentSelectedIndex = -1;
                companyData.warehouses.selectedIndex = -1;
            }

            if (companyData) {
                companies[companyIndex] = companyData;
                saveCompanies();
            }


            // Tentukan status disabled untuk tombol aksi
            const isSelected = currentSelectedIndex !== -1;
            const isFirst = currentSelectedIndex === 0;
            const isLast = currentSelectedIndex === warehouses.length - 1;

            const buttonDisabled = isSelected ? '' : 'disabled';
            const buttonDisabledClass = isSelected ? '' : 'btn-disabled';

            const upDisabled = isSelected && !isFirst ? '' : 'disabled';
            const upDisabledClass = isSelected && !isFirst ? '' : 'btn-disabled';

            const downDisabled = isSelected && !isLast ? '' : 'disabled';
            const downDisabledClass = isSelected && !isLast ? '' : 'btn-disabled';


            // Render toolbar dan tabel
            let listHtml = `
                <div class="flex flex-wrap items-center gap-2 mb-3">
                    <button type="button" id="btn-warehouse-new" class="btn btn-sm btn-primary" onclick="showCompanyWarehouseForm('new', '${companyId}')">New</button>
                    <button type="button" id="btn-warehouse-open" class="btn btn-sm ${buttonDisabledClass} ${isSelected ? 'btn-outline-primary' : ''}" ${buttonDisabled} onclick="openSelectedWarehouse('${companyId}')">Open</button>
                    <button type="button" id="btn-warehouse-delete" class="btn btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white ${buttonDisabledClass}" ${buttonDisabled} onclick="deleteSelectedWarehouse('${companyId}')">Delete</button>
                    <button type="button" id="btn-warehouse-copy" class="btn btn-sm text-green-500 border-green-500 hover:bg-green-500 hover:text-white ${buttonDisabledClass}" ${buttonDisabled} onclick="copySelectedWarehouse('${companyId}')">Copy</button>
                    
                    <div class="grow"></div>
                    
                    <!-- Tombol Pindah Baris -->
                    <button type="button" id="btn-warehouse-up"
                        class="btn btn-sm btn-primary ${upDisabledClass}"
                        ${upDisabled} onclick="moveNestedRow('${companyId}', 'up')">↑ Up</button>
                    <button type="button" id="btn-warehouse-down"
                        class="btn btn-sm btn-primary ${downDisabledClass}"
                        ${downDisabled} onclick="moveNestedRow('${companyId}', 'down')">↓ Down</button>
                </div>

                <div tabIndex="0" class="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" id="whs-table-wrapper">
                    <table id="warehouse-list-table" class="min-w-full text-sm">
                        <thead>
                            <tr class="bg-gray-100 sticky top-0">
                                <th class="py-2 px-4 text-left w-12">#</th>
                                <th class="py-2 px-4 text-left">Warehouse</th>
                                <th class="py-2 px-4 text-left">Ship From Name</th>
                            </tr>
                        </thead>
                        <tbody>`;

            if (warehouses.length === 0) {
                listHtml += `<tr><td colspan="3" class="p-4 text-center text-gray-400">No warehouse information found.</td></tr>`;
            } else {
                warehouses.forEach((w, index) => {
                    const isRowSelected = index === currentSelectedIndex;
                    const selectedClass = isRowSelected ? 'bg-blue-100 font-medium selected' : '';
                    const whsId = w.id;

                    // Baris tabel dengan event handler seleksi dan edit
                    listHtml += `
                        <tr data-id="${whsId}" onclick="selectWarehouseRow('${companyId}', '${whsId}')" ondblclick="openSelectedWarehouse('${companyId}')" class="border-b hover:bg-gray-50 cursor-pointer ${selectedClass}">
                            <td class="py-2 px-4 w-12">${index + 1}</td>
                            <td class="py-2 px-4">${w.warehouseCode}</td>
                            <td class="py-2 px-4">${w.shipFromAddress.name || 'N/A'}</td>
                        </tr>
                    `;
                });
            }
            listHtml += `</tbody></table></div>`;
            container.innerHTML = listHtml;

            // Mengaktifkan keyboard binding untuk navigasi tabel
            bindWarehouseKeys();

            // Auto-scroll ke baris baru
            const table = document.getElementById('warehouse-list-table');
            if (currentSelectedIndex !== -1 && warehouses[currentSelectedIndex]) {
                const selId = warehouses[currentSelectedIndex].id;
                const tr = table?.querySelector(`tr[data-id="${selId}"]`);
                tr?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        };

        /**
         * Membuka sub-modal edit untuk Warehouse yang terpilih.
         */
        window.openSelectedWarehouse = function (companyId) {
            const company = companies.find(c => c.id === companyId);
            const selectedIndex = company?.warehouses?.selectedIndex;

            if (selectedIndex !== undefined && selectedIndex !== -1) {
                const warehouseData = company.warehouses.rows[selectedIndex];
                window.showCompanyWarehouseForm('edit', companyId, warehouseData.id);
            } else {
                window.showCustomAlert('Perhatian', 'Pilih baris warehouse yang ingin dibuka terlebih dahulu.', 'warning');
            }
        };

        /**
         * Menyalin data Warehouse yang terpilih.
         */
        window.copySelectedWarehouse = function (companyId) {
            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) return;

            const selectedIndex = companies[companyIndex].warehouses.selectedIndex;
            if (selectedIndex === -1) {
                window.showCustomAlert("Perhatian", "Pilih warehouse dulu", "warning");
                return;
            }

            const companyData = companies[companyIndex];
            const src = companyData.warehouses.rows[selectedIndex];
            if (!src) return;

            const copy = {
                ...JSON.parse(JSON.stringify(src)),
                id: generateUniqueId(WAREHOUSE_ID_PREFIX),
                warehouseCode: src.warehouseCode + "_COPY",
            };

            companyData.warehouses.rows.push(copy);
            companyData.warehouses.selectedIndex = companyData.warehouses.rows.length - 1;

            saveCompanies();
            window.renderCompanyWarehouseList(companyId);
            window.showCustomAlert('Success', `Warehouse ${src.warehouseCode} berhasil dicopy menjadi ${copy.warehouseCode}.`, 'success');
        };

        /**
         * Menghapus Warehouse yang terpilih setelah konfirmasi.
         */
        window.deleteSelectedWarehouse = function (companyId) {
            const ci = companies.findIndex(c => c.id === companyId);
            if (ci === -1) return;

            const companyData = companies[ci];
            const rows = companyData.warehouses.rows;
            let sel = companyData.warehouses.selectedIndex;

            if (sel === -1 || sel >= rows.length) {
                window.showCustomAlert('Perhatian', 'Pilih baris dulu.', 'warning');
                return;
            }

            const code = rows[sel].warehouseCode;

            if (window.confirm(`Yakin hapus warehouse ${code}?`)) {
                rows.splice(sel, 1);

                if (rows.length === 0) {
                    companyData.warehouses.selectedIndex = -1;
                } else {
                    const next = Math.min(sel, rows.length - 1);
                    companyData.warehouses.selectedIndex = next;
                }

                saveCompanies();
                window.renderCompanyWarehouseList(companyId);
                window.showCustomAlert('Dihapus', `Warehouse ${code} dihapus.`, 'success');
            }
        };

        /**
         * Memindahkan baris ke atas atau ke bawah.
         */
        window.moveNestedRow = function (companyId, direction) {
            const ci = companies.findIndex(c => c.id === companyId);
            if (ci === -1) return;

            const companyData = companies[ci];
            const rows = companyData.warehouses.rows;
            const state = companyData.warehouses;
            if (!rows.length) return;
            const i = state.selectedIndex;
            if (i < 0) return;

            const j = direction === 'up' ? i - 1 : i + 1;

            if (j < 0 || j >= rows.length) return;

            [rows[i], rows[j]] = [rows[j], rows[i]];
            state.selectedIndex = j;

            saveCompanies();
            window.renderCompanyWarehouseList(companyId);

            const table = document.getElementById('warehouse-list-table');
            const selId = rows[j]?.id;
            const tr = table?.querySelector(`tr[data-id="${selId}"]`);
            tr?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        /**
         * Mengikat event keyboard pada tabel Warehouse.
         */
        const bindWarehouseKeys = (function bindWarehouseKeys() {
            return function () {
                const wrap = document.getElementById('whs-table-wrapper');
                if (wrap && wrap._keysBound) {
                    wrap.removeEventListener('keydown', wrap._keysBound);
                    wrap._keysBound = false;
                }

                if (!wrap) return;

                wrap.tabIndex = 0;

                const handler = (e) => {
                    const form = document.getElementById('company-form');
                    const companyId = form?.dataset.id || document.getElementById('wh-company-selector')?.value;

                    if (!companyId) return;

                    if (document.activeElement !== wrap) return;

                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        window.moveNestedRow(companyId, 'up');
                    }
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        window.moveNestedRow(companyId, 'down');
                    }

                    const companyData = companies.find(c => c.id === companyId);
                    const isSelected = companyData?.warehouses?.selectedIndex !== -1;

                    if (isSelected) {
                        const whsModalVisible = !document.getElementById('warehouse-form-modal').classList.contains('hidden');
                        if (e.key === 'Enter' && !whsModalVisible) {
                            e.preventDefault();
                            window.openSelectedWarehouse(companyId);
                        }
                        if (e.key === 'Delete') {
                            e.preventDefault();
                            window.deleteSelectedWarehouse(companyId);
                        }
                    }
                };

                wrap.addEventListener('keydown', handler);
                wrap._keysBound = handler;
            };
        })();


        // --- RENDER TAB COMPANY MODAL ---

        /**
         * Render template tab alamat Company.
         */
        const renderCompanyAddressTab = (data, type) => {
            const baseType = type.replace('Address', '');
            const isCompanyTab = type === 'companyAddress';
            const checkboxHtml = !isCompanyTab ? `
                <div class="md:col-span-2 mb-4">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="${baseType}-same-as-company" name="${type}_sameAsCompany" 
                            onchange="window.handleSameAsCompanyChange('${baseType}')"> 
                        Same as company address
                    </label>
                    <p class="text-xs text-gray-500 mt-1">Centang untuk menyalin dan mengunci field.</p>
                </div>` : '';

            return `
                ${checkboxHtml}
                ${renderGenericAddressForm(data, type, false)}
            `;
        };

        /**
         * Render tab General di modal Company.
         */
        function renderCompanyGeneralTab(data) {
            const { companyCode = '' } = data;

            return `
                <div class="space-y-4 max-w-lg mb-4">
                    <div>
                        <label for="companyCode" class="block text-sm mb-1">Company: <span class="text-red-500">*</span></label>
                        <input type="text" id="companyCode" name="companyCode" required class="input" value="${companyCode}">
                        <p class="text-xs text-gray-500 mt-1">Company code berfungsi sebagai identifier utama.</p>
                    </div>
                </div>
            `;
        }

        /**
         * Render tab Warehouse/company information di modal Company.
         */
        function renderCompanyInfoTab(companyData) {
            const { general, id: companyId } = companyData;
            const { uccEanNumber = '', orderIdPrefix = '', receiptIdPrefix = '', purchaseOrderIdPrefix = '', availabilityChecking = false } = general;

            const form = document.getElementById('company-form');
            const mode = form.dataset.mode;
            const isNewCompany = mode === 'create';

            let whsListContent;
            if (isNewCompany) {
                whsListContent = `<p class="p-4 text-center text-red-500 font-semibold">Simpan Company terlebih dahulu sebelum mengelola daftar Warehouse.</p>`;
            } else {
                whsListContent = ``;
            }

            return `
                <div class="w-full max-w-3xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                        <div>
                            <label for="uccEanNumber" class="block text-sm mb-1">UCC/EAN number:</label>
                            <input type="text" id="uccEanNumber" name="general_uccEanNumber" class="input" value="${uccEanNumber}">
                        </div>
                        <div>
                            <label for="orderIdPrefix" class="block text-sm mb-1">Order ID prefix:</label>
                            <input type="text" id="orderIdPrefix" name="general_orderIdPrefix" class="input" value="${orderIdPrefix}">
                        </div>
                        <div>
                            <label for="receiptIdPrefix" class="block text-sm mb-1">Receipt ID prefix:</label>
                            <input type="text" id="receiptIdPrefix" name="general_receiptIdPrefix" class="input" value="${receiptIdPrefix}">
                        </div>
                        <div>
                            <label for="purchaseOrderIdPrefix" class="block text-sm mb-1">Purchase order ID prefix:</label>
                            <input type="text" id="purchaseOrderIdPrefix" name="general_purchaseOrderIdPrefix" class="input" value="${purchaseOrderIdPrefix}">
                        </div>
                        <div class="flex items-center md:col-span-2 mt-1">
                            <input type="checkbox" id="availabilityChecking" name="general_availabilityChecking" ${availabilityChecking ? 'checked' : ''}>
                            <label for="availabilityChecking" class="ml-2 text-sm">Availability checking</label>
                        </div>
                    </div>
                    <h3 class="text-base font-semibold text-wise-dark-gray mb-3 border-t pt-4 pb-2">Warehouse List (Nested Info)</h3>
                    <p class="text-xs text-gray-500 mb-2">Double click baris, tekan Enter, atau tombol Open untuk membuka detail Warehouse.</p>
                    <div id="warehouse-list-container" data-is-new="${isNewCompany}">
                        ${whsListContent}
                    </div>
                </div>
            `;
        }

        /**
         * Render tab Internet Information di modal Company.
         */
        function renderInternetInfoTab(data) {
            const { websiteUrl = '', emailSupport = '', phoneSupport = '' } = data.internetInfo;
            return `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-full">
                    <div>
                        <label for="internetInfo-websiteUrl" class="block text-sm mb-1">Website URL:</label>
                        <input type="url" id="internetInfo-websiteUrl" name="internetInfo_websiteUrl" class="input" value="${websiteUrl}">
                    </div>
                    <div>
                        <label for="internetInfo-emailSupport" class="block text-sm mb-1">Email Support:</label>
                        <input type="email" id="internetInfo-emailSupport" name="internetInfo_emailSupport" class="input" value="${emailSupport}">
                    </div>
                    <div>
                        <label for="internetInfo-phoneSupport" class="block text-sm mb-1">Phone Support:</label>
                        <input type="tel" id="internetInfo-phoneSupport" name="internetInfo_phoneSupport" class="input" value="${phoneSupport}">
                    </div>
                </div>
            `;
        }

        /**
         * Render tab Web Header di modal Company.
         */
        function renderWebHeaderTab(data) {
            const { leftGraphic = '', centerGraphic = '', rightGraphic = '', leftUrl = '', centerUrl = '', rightUrl = '' } = data.webHeader;

            return `
                <div class="space-y-6">
                    <fieldset class="border p-4 rounded-md">
                        <legend class="px-2 text-sm font-medium">Graphics (Path/URL)</legend>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label for="webHeader-leftGraphic" class="block text-sm mb-1">Left graphic:</label>
                                <div class="flex items-center gap-2">
                                     <input type="text" id="webHeader-leftGraphic" name="webHeader_leftGraphic" class="input flex-1" value="${leftGraphic}">
                                     <button type="button" class="btn btn-sm text-gray-600 hover:text-gray-800" onclick="window.showCustomAlert('File Dialog', 'Simulasi buka dialog file.')">...</button>
                                </div>
                            </div>
                            <div>
                                <label for="webHeader-centerGraphic" class="block text-sm mb-1">Center graphic:</label>
                                <div class="flex items-center gap-2">
                                     <input type="text" id="webHeader-centerGraphic" name="webHeader_centerGraphic" class="input flex-1" value="${centerGraphic}">
                                     <button type="button" class="btn btn-sm text-gray-600 hover:text-gray-800" onclick="window.showCustomAlert('File Dialog', 'Simulasi buka dialog file.')">...</button>
                                </div>
                            </div>
                            <div>
                                <label for="webHeader-rightGraphic" class="block text-sm mb-1">Right graphic:</label>
                                <div class="flex items-center gap-2">
                                     <input type="text" id="webHeader-rightGraphic" name="webHeader_rightGraphic" class="input flex-1" value="${rightGraphic}">
                                     <button type="button" class="btn btn-sm text-gray-600 hover:text-gray-800" onclick="window.showCustomAlert('File Dialog', 'Simulasi buka dialog file.')">...</button>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="border p-4 rounded-md">
                        <legend class="px-2 text-sm font-medium">URLs</legend>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label for="webHeader-leftUrl" class="block text-sm mb-1">Left URL:</label>
                                <input type="url" id="webHeader-leftUrl" name="webHeader_leftUrl" class="input" value="${leftUrl}">
                            </div>
                            <div>
                                <label for="webHeader-centerUrl" class="block text-sm mb-1">Center URL:</label>
                                <input type="url" id="webHeader-centerUrl" name="webHeader_centerUrl" class="input" value="${centerUrl}">
                            </div>
                            <div>
                                <label for="webHeader-rightUrl" class="block text-sm mb-1">Right URL:</label>
                                <input type="url" id="webHeader-rightUrl" name="webHeader_rightUrl" class="input" value="${rightUrl}">
                            </div>
                        </div>
                    </fieldset>
                </div>
            `;
        }

        /**
         * Render tab Assigned Users di modal Company.
         */
        function renderAssignedUsersTab(companyData) {
            const assignedUserIds = (companyData.assignedUsers || []).map(u => u.userId);

            return `
                <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-wise-dark-gray">Assigned Users List</h3>
                    <p class="text-xs text-gray-500">
                        Centang user yang akan di-assign ke Company ini.
                    </p>
                    
                    <div class="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto p-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-1">
                            ${ALL_USERS_LIST.map(user => `
                                <label class="flex items-center gap-2 text-sm whitespace-nowrap">
                                    <input type="checkbox" name="assignedUsers" value="${user}" 
                                        ${assignedUserIds.includes(user) ? 'checked' : ''}> ${user}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                        Catatan: Perubahan akan tersimpan saat kamu klik 'Save' di modal utama.
                    </p>
                </div>
            `;
        }

        /**
         * Render tab User Defined Data (8 field) di modal Company.
         */
        function renderCompanyUdfTab(model) {
            const { udf = EMPTY_COMPANY.udf } = model || {};

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 8 }, (_, i) => { // 8 fields
                const key = `udf${i + 1}`;
                const value = udf[key] || '';
                const isDecimal = i >= 6; // UDF 7 dan 8 adalah angka desimal
                return `
                        <div>
                            <label for="cmp-${key}" class="block text-sm mb-1">User defined field ${i + 1}: ${isDecimal ? '(Decimal)' : ''}</label>
                            <input type="${isDecimal ? 'number' : 'text'}" step="${isDecimal ? '0.0001' : 'any'}" id="cmp-${key}" name="udf_${key}" class="input" value="${value}">
                        </div>
                    `;
            }).join('')}
                </div>
            `;
        }

        // --- HANDLER MODAL UTAMA COMPANY ---

        /**
         * Menampilkan modal form Company (Create/Edit).
         */
        window.showCompanyForm = function (mode, id = null) {
            const modal = document.getElementById('company-form-modal');
            const form = document.getElementById('company-form');
            const title = document.getElementById('company-form-title');

            let companyData = {};

            if (mode === 'create') {
                companyData = JSON.parse(JSON.stringify(EMPTY_COMPANY));
                const tempId = generateUniqueId(COMPANY_ID_PREFIX);
                companyData.id = tempId;
                form.dataset.tempId = tempId;
            } else if (mode === 'edit' && id) {
                const found = companies.find(c => c.id === id);
                if (!found) {
                    window.showCustomAlert('Error', 'Company tidak ditemukan!', 'error');
                    return;
                }
                companyData = JSON.parse(JSON.stringify(found));
            } else {
                companyData = JSON.parse(JSON.stringify(EMPTY_COMPANY));
            }

            // Set data attributes
            form.dataset.id = companyData.id;
            form.dataset.companyId = companyData.id;
            form.dataset.mode = mode;

            const headerCode = mode === 'create' ? 'New Company (Unsaved)' : companyData.companyCode;
            title.innerHTML = mode === 'create' ? 'Company - Create New' : `Company - Edit Existing (<span class="font-bold text-blue-600">${headerCode}</span>)`;

            // Render semua Tab
            document.getElementById('pane-cmp-general').innerHTML = renderCompanyGeneralTab(companyData);
            document.getElementById('pane-cmp-info').innerHTML = renderCompanyInfoTab(companyData);
            document.getElementById('pane-cmp-address').innerHTML = renderCompanyAddressTab(companyData.companyAddress, 'companyAddress');
            document.getElementById('pane-cmp-return').innerHTML = renderCompanyAddressTab(companyData.returnAddress, 'returnAddress');
            document.getElementById('pane-cmp-freight').innerHTML = renderCompanyAddressTab(companyData.freightBillToAddress, 'freightBillToAddress');
            document.getElementById('pane-cmp-internet').innerHTML = renderInternetInfoTab(companyData);
            document.getElementById('pane-cmp-webheader').innerHTML = renderWebHeaderTab(companyData);
            document.getElementById('pane-cmp-assigned').innerHTML = renderAssignedUsersTab(companyData);
            document.getElementById('pane-cmp-udf').innerHTML = renderCompanyUdfTab(companyData);

            // Re-check sameAsCompany state untuk Returns dan Freight
            const addressesToCheck = ['return', 'freight'];
            addressesToCheck.forEach(baseType => {
                const type = `${baseType}Address`;
                const checkbox = document.getElementById(`${baseType}-same-as-company`);
                if (checkbox) {
                    const isSameAsCompany = JSON.stringify(companyData.companyAddress) === JSON.stringify(companyData[type]);
                    checkbox.checked = isSameAsCompany;

                    if (isSameAsCompany) {
                        window.copyCompanyAddress(type, false);
                    } else {
                        window.handleSameAsCompanyChange(baseType);
                    }
                }
            });

            if (!modal._listenersAttached) {
                modal.querySelectorAll('[role="tab"]').forEach(button => {
                    button.onclick = () => {
                        window.activateTab(button.dataset.tab, modal);
                        if (button.dataset.tab === 'company-info') {
                            const currentMode = document.getElementById('company-form').dataset.mode;
                            if (currentMode !== 'create') {
                                window.renderCompanyWarehouseList(form.dataset.id);
                            }
                            const whsWrapper = document.getElementById('whs-table-wrapper');
                            if (whsWrapper) {
                                setTimeout(() => {
                                    whsWrapper.focus();
                                }, 50);
                            }
                        }
                    }
                });
                modal._listenersAttached = true;
            }
            window.activateTab('general', modal);

            // Tampilkan modal dengan transisi
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('max-w-4xl', 'scale-100', 'opacity-100');
            modalContent.classList.add('max-w-4xl', 'scale-95', 'opacity-0');

            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');

            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');

                const companyInput = document.getElementById('companyCode');
                if (companyInput) {
                    try { companyInput.focus(); } catch (e) { console.error("Gagal fokus input Company:", e); }
                }

                modal._keydownHandler = (e) => {
                    if (e.key === 'Escape') {
                        window.closeCompanyForm();
                    }
                };
                modal.addEventListener('keydown', modal._keydownHandler);

                if (document.querySelector('[role="tab"][data-tab="company-info"]').classList.contains('tab-active') && mode !== 'create') {
                    window.renderCompanyWarehouseList(form.dataset.id);
                }

            }, 10);

            // Render footer dengan checkbox Inactive
            const modalFooterPlaceholder = document.getElementById('company-form-footer-placeholder');
            if (modalFooterPlaceholder) {
                modalFooterPlaceholder.innerHTML = window.renderStandardModalFooter({
                    cancelOnclick: "closeCompanyForm()",
                    submitFormId: "company-form",
                    submitLabel: "Save",
                    inactiveCheckboxHtml: `
                        <label class="flex items-center gap-2 text-sm text-wise-dark-gray">
                            <input type="checkbox" id="inactive" name="inactive" ${companyData.inactive ? 'checked' : ''}> Inactive
                        </label>
                    `
                });
            }
        };

        /**
         * Menutup modal form Company.
         */
        window.closeCompanyForm = function () {
            const modal = document.getElementById('company-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            const form = document.getElementById('company-form');

            if (modal._keydownHandler) {
                modal.removeEventListener('keydown', modal._keydownHandler);
                delete modal._keydownHandler;
            }

            if (form.dataset.mode === 'create') {
                delete form.dataset.tempId;
                form.dataset.id = null;
            }


            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }, 300);
        };


        // --- HANDLER SUB MODAL WAREHOUSE ---

        /**
         * Menampilkan sub-modal form Warehouse.
         */
        window.showCompanyWarehouseForm = function (mode, companyId, warehouseId = null) {
            const companyForm = document.getElementById('company-form');
            if (companyForm && companyForm.dataset.mode === 'create') {
                window.showCustomAlert('Aksi Ditolak', 'Harap simpan Company terlebih dahulu sebelum menambahkan Warehouse.', 'error');
                return;
            }

            const companyData = companies.find(c => c.id === companyId);
            if (!companyData) { window.showCustomAlert('Error', 'Company data not found.', 'error'); return; }

            const modal = document.getElementById('warehouse-form-modal');
            const form = document.getElementById('warehouse-form');
            const title = document.getElementById('warehouse-form-title');
            const footerPlaceholder = document.getElementById('warehouse-form-footer-placeholder');

            let warehouseData = {};
            let isEditMode = false;

            if (mode === 'new' || mode === 'create') {
                warehouseData = JSON.parse(JSON.stringify(EMPTY_WAREHOUSE_INFO));
                warehouseData.id = generateUniqueId(WAREHOUSE_ID_PREFIX);
            } else if (mode === 'edit' && warehouseId) {
                const found = companyData.warehouses.rows.find(w => w.id === warehouseId);
                if (!found) {
                    window.showCustomAlert('Error', 'Warehouse Info not found!', 'error');
                    return;
                }
                warehouseData = JSON.parse(JSON.stringify(found));
                isEditMode = true;
            } else {
                return;
            }

            title.innerHTML = isEditMode ?
                `Warehouse/company information detail window (<span class="font-bold text-blue-600">${warehouseData.warehouseCode}</span>)` :
                'Warehouse/company information detail window (New)';

            form.dataset.companyId = companyId;
            form.dataset.warehouseId = warehouseData.id;
            form.dataset.mode = mode;

            const companyCodeEl = document.getElementById('whs-company-code-display');
            if (companyCodeEl) {
                companyCodeEl.textContent = companyData.companyCode;
            }


            // Render Tabs
            document.getElementById('pane-whs-shipfrom').innerHTML = renderWarehouseShipFromTab(warehouseData, companyData);
            document.getElementById('pane-whs-return').innerHTML = renderWarehouseOtherAddressTab(warehouseData.warehouseReturnAddress, 'warehouseReturnAddress', companyData);
            document.getElementById('pane-whs-freight').innerHTML = renderWarehouseOtherAddressTab(warehouseData.warehouseFreightBillToAddress, 'warehouseFreightBillToAddress', companyData);
            document.getElementById('pane-whs-udf').innerHTML = renderWarehouseUdfTab(warehouseData);

            // Reset status checkbox 'Same as company address'
            const shipFromCheckbox = document.getElementById('whs-same-as-company');
            if (shipFromCheckbox) {
                shipFromCheckbox.checked = false;
            }


            if (!modal._listenersAttached) {
                modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => window.activateTab(button.dataset.tab, modal) });
                modal._listenersAttached = true;
            }
            window.activateTab('ship-from', modal);

            // Sembunyikan modal Company yang ada di belakangnya
            document.getElementById('company-form-modal').classList.add('invisible');

            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');

            // Pasang listener submit
            form.onsubmit = window.handleWarehouseSubmit;

            // Render footer
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = window.renderStandardModalFooter({
                    cancelOnclick: "closeCompanyWarehouseForm()",
                    submitFormId: "warehouse-form",
                    submitLabel: "OK"
                });
            }

            // Tampilkan modal dengan transisi
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');

                modal._keydownHandler = (e) => {
                    if (e.key === 'Escape') {
                        window.closeCompanyWarehouseForm();
                    }
                };
                modal.addEventListener('keydown', modal._keydownHandler);

            }, 10);

        };

        /**
         * Menutup sub-modal form Warehouse.
         */
        window.closeCompanyWarehouseForm = function () {
            const modal = document.getElementById('warehouse-form-modal');
            const form = document.getElementById('warehouse-form');
            const modalContent = modal.querySelector('.modal-content');

            if (modal._keydownHandler) {
                modal.removeEventListener('keydown', modal._keydownHandler);
                delete modal._keydownHandler;
            }

            // Hapus listener onsubmit
            form.onsubmit = null;


            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');

                // Tampilkan kembali modal Company
                document.getElementById('company-form-modal').classList.remove('invisible');
            }, 300);
        };

        /**
         * Render tab Ship From Address (termasuk kode Warehouse).
         */
        function renderWarehouseShipFromTab(warehouseData, companyData) {
            const { warehouseCode = '' } = warehouseData;

            return `
                <div class="space-y-4">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-sm font-medium">Company:</span>
                        <span class="font-bold text-sm text-blue-600" id="whs-company-code-display">${companyData.companyCode}</span>
                        <span class="text-sm font-medium ml-4">Warehouse: <span class="text-red-500">*</span></span>
                        <select id="warehouseCode" name="warehouseCode" required class="select select-sm w-32">
                            <option value="">-- Select --</option>
                            ${DUMMY_WAREHOUSES.map(w => `<option value="${w}" ${warehouseCode === w ? 'selected' : ''}>${w}</option>`).join('')}
                        </select>
                    </div>

                    <div class="md:col-span-2 mb-4">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="whs-same-as-company" name="shipFromAddress_sameAsCompany" 
                                onchange="window.copyCompanyAddress('shipFromAddress', true)"> 
                            Same as company address
                        </label>
                        <p class="text-xs text-gray-500 mt-1">Centang untuk menyalin data alamat perusahaan.</p>
                    </div>
                </div>

                <div class="p-2 border rounded-md">
                    ${renderGenericAddressForm(warehouseData.shipFromAddress, 'shipFromAddress', true)}
                </div>
            `;
        }

        /**
         * Render tab Return/Freight Address Warehouse.
         */
        function renderWarehouseOtherAddressTab(addressData, type, companyData) {
            return `
                <div class="p-2 border rounded-md">
                    ${renderGenericAddressForm(addressData, type, true)}
                </div>
            `;
        }

        /**
         * Render tab UDF (8 field) di modal Warehouse.
         */
        function renderWarehouseUdfTab(model) {
            const { warehouseUdf = EMPTY_WAREHOUSE_INFO.warehouseUdf } = model || {};

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 8 }, (_, i) => { // 8 fields
                const key = `udf${i + 1}`;
                const value = warehouseUdf[key] || '';
                const isDecimal = i >= 6; // UDF 7 dan 8 angka desimal
                return `
                        <div>
                            <label for="whs-${key}" class="block text-sm mb-1">User defined field ${i + 1}: ${isDecimal ? '(Decimal)' : ''}</label>
                            <input type="${isDecimal ? 'number' : 'text'}" step="${isDecimal ? '0.0001' : 'any'}" id="whs-${key}" name="warehouseUdf_${key}" class="input" value="${value}">
                        </div>
                    `;
            }).join('')}
                </div>
            `;
        }

        // --- SUBMIT HANDLERS COMPANY ---

        /**
         * Helper untuk mengumpulkan data form Company ke dalam model yang terstruktur.
         */
        const getCompanyFormData = (form) => {
            const getAddressData = (prefix) => ({
                name: form.querySelector(`[name="${prefix}_name"]`)?.value.trim() || '',
                address1: form.querySelector(`[name="${prefix}_address1"]`)?.value.trim() || '',
                address2: form.querySelector(`[name="${prefix}_address2"]`)?.value.trim() || '',
                address3: form.querySelector(`[name="${prefix}_address3"]`)?.value.trim() || '',
                city: form.querySelector(`[name="${prefix}_city"]`)?.value.trim() || '',
                statePostalCode: form.querySelector(`[name="${prefix}_statePostalCode"]`)?.value.trim() || '',
                postalCode: form.querySelector(`[name="${prefix}_postalCode"]`)?.value.trim() || '',
                country: form.querySelector(`[name="${prefix}_country"]`)?.value.trim() || 'ID',
                attentionTo: form.querySelector(`[name="${prefix}_attentionTo"]`)?.value.trim() || '',
                faxNumber: form.querySelector(`[name="${prefix}_faxNumber"]`)?.value.trim() || '',
                phoneNumber: form.querySelector(`[name="${prefix}_phoneNumber"]`)?.value.trim() || '',
                emailAddress: form.querySelector(`[name="${prefix}_emailAddress"]`)?.value.trim() || '',
            });

            const companyId = form.dataset.id;
            const existingCompany = companies.find(c => c.id === companyId) || EMPTY_COMPANY;

            const inactiveStatus = form.querySelector('[name="inactive"]')?.checked || existingCompany.inactive;

            const returnSameAsChecked = form.querySelector('[name="returnAddress_sameAsCompany"]')?.checked || false;
            const freightSameAsChecked = form.querySelector('[name="freightBillToAddress_sameAsCompany"]')?.checked || false;

            const companyAddress = getAddressData('companyAddress');

            const returnAddress = returnSameAsChecked ?
                companyAddress : getAddressData('returnAddress');

            const freightBillToAddress = freightSameAsChecked ?
                companyAddress : getAddressData('freightBillToAddress');

            const assignedUsers = Array.from(form.querySelectorAll('[name="assignedUsers"]'))
                .filter(el => el.checked)
                .map(el => ({
                    userId: el.value,
                    name: el.value
                }));

            const udfData = Array.from({ length: 8 }).reduce((acc, _, i) => {
                const key = `udf${i + 1}`;
                const input = form.querySelector(`[name="udf_${key}"]`);
                if (input) acc[key] = input.value;
                return acc;
            }, {});

            return {
                id: companyId,
                companyCode: form.querySelector('[name="companyCode"]')?.value.trim() || '',
                inactive: inactiveStatus,

                general: {
                    uccEanNumber: form.querySelector('[name="general_uccEanNumber"]')?.value.trim() || '',
                    orderIdPrefix: form.querySelector('[name="general_orderIdPrefix"]')?.value.trim() || '',
                    receiptIdPrefix: form.querySelector('[name="general_receiptIdPrefix"]')?.value.trim() || '',
                    purchaseOrderIdPrefix: form.querySelector('[name="general_purchaseOrderIdPrefix"]')?.value.trim() || '',
                    availabilityChecking: form.querySelector('[name="general_availabilityChecking"]')?.checked || false,
                },

                companyAddress: companyAddress,
                returnAddress: returnAddress,
                freightBillToAddress: freightBillToAddress,

                webHeader: {
                    leftGraphic: form.querySelector('[name="webHeader_leftGraphic"]')?.value.trim() || '',
                    centerGraphic: form.querySelector('[name="webHeader_centerGraphic"]')?.value.trim() || '',
                    rightGraphic: form.querySelector('[name="webHeader_rightGraphic"]')?.value.trim() || '',
                    leftUrl: form.querySelector('[name="webHeader_leftUrl"]')?.value.trim() || '',
                    centerUrl: form.querySelector('[name="webHeader_centerUrl"]')?.value.trim() || '',
                    rightUrl: form.querySelector('[name="webHeader_rightUrl"]')?.value.trim() || '',
                },
                internetInfo: {
                    websiteUrl: form.querySelector('[name="internetInfo_websiteUrl"]')?.value.trim() || '',
                    emailSupport: form.querySelector('[name="internetInfo_emailSupport"]')?.value.trim() || '',
                    phoneSupport: form.querySelector('[name="internetInfo_phoneSupport"]')?.value.trim() || '',
                },

                udf: udfData,
                assignedUsers: assignedUsers,

                warehouses: existingCompany.warehouses,
            };
        }

        /**
         * Menangani submit form Company (Create/Update).
         */
        window.handleCompanySubmit = function (event) {
            event.preventDefault();
            const modal = document.getElementById('company-form-modal');

            if (!validateCompanyForm(modal)) { return; }

            const form = event.target;
            const mode = form.dataset.mode;
            let id = form.dataset.id;

            const formData = getCompanyFormData(form);
            let msg = '';

            if (mode === 'create') {
                if (companies.some(c => c.companyCode === formData.companyCode)) {
                    window.showCustomAlert('Error', `Company code ${formData.companyCode} sudah ada.`, 'error');
                    return;
                }

                id = generateUniqueId(COMPANY_ID_PREFIX);
                formData.id = id;
                companies.push(formData);
                msg = `Company ${formData.companyCode} berhasil dibuat.`;

                form.dataset.id = id;
                form.dataset.companyId = id;
                form.dataset.mode = 'edit';
                document.getElementById('company-form-title').innerHTML = `Company - Edit Existing (<span class="font-bold text-blue-600">${formData.companyCode}</span>)`;

            } else if (mode === 'edit') {
                const index = companies.findIndex(c => c.id === id);
                if (index !== -1) {
                    if (companies.some((c, i) => i !== index && c.companyCode === formData.companyCode)) {
                        window.showCustomAlert('Error', `Company code ${formData.companyCode} sudah ada.`, 'error');
                        return;
                    }
                    companies[index] = { ...companies[index], ...formData };
                    msg = `Company ${formData.companyCode} berhasil diupdate.`;
                }
            }

            saveCompanies();

            if (mode === 'create') {
                window.activateTab('company-info', modal);
                window.renderCompanyWarehouseList(id);
            } else {
                window.closeCompanyForm();
            }

            window.renderCompanyList();
            window.showCustomAlert('Success', msg, 'success');
        };

        /**
         * Menghapus Company.
         */
        window.deleteCompany = function (id) {
            window.showCustomConfirm('Yakin kamu mau hapus Company ini?', () => {
                companies = companies.filter(c => c.id !== id);
                saveCompanies();
                window.renderCompanyList();
                window.showCustomAlert('Dihapus', 'Company berhasil dihapus!', 'success');

                const modal = document.getElementById('company-form-modal');
                if (!modal.classList.contains('hidden') && modal.querySelector('#company-form').dataset.id === id) {
                    window.closeCompanyForm();
                }
            });
        };


        // --- SUBMIT HANDLERS WAREHOUSE ---

        /**
         * Helper untuk mengumpulkan data form Warehouse ke dalam model yang terstruktur.
         */
        const getWarehouseFormData = () => {
            const form = document.getElementById('warehouse-form');
            const pick = (name) => (form.querySelector(`[name="${name}"]`)?.value || "").trim();

            const readAddr = (prefix) => ({
                name: pick(`${prefix}_name`), address1: pick(`${prefix}_address1`), address2: pick(`${prefix}_address2`),
                address3: pick(`${prefix}_address3`), city: pick(`${prefix}_city`), statePostalCode: pick(`${prefix}_statePostalCode`),
                postalCode: pick(`${prefix}_postalCode`), country: pick(`${prefix}_country`), attentionTo: pick(`${prefix}_attentionTo`),
                faxNumber: pick(`${prefix}_faxNumber`), phoneNumber: pick(`${prefix}_phoneNumber`), emailAddress: pick(`${prefix}_emailAddress`)
            });

            const readUdf = () => {
                const o = {};
                for (let i = 1; i <= 8; i++) {
                    o[`udf${i}`] = pick(`warehouseUdf_udf${i}`);
                }
                return o;
            };

            return {
                id: form.dataset.warehouseId,
                warehouseCode: pick("warehouseCode"),
                shipFromAddress: readAddr("shipFromAddress"),
                warehouseReturnAddress: readAddr("warehouseReturnAddress"),
                warehouseFreightBillToAddress: readAddr("warehouseFreightBillToAddress"),
                warehouseUdf: readUdf()
            };
        }

        /**
         * Menangani submit form Warehouse (Create/Update).
         */
        window.handleWarehouseSubmit = function (event) {
            event.preventDefault();
            const modal = document.getElementById('warehouse-form-modal');
            const form = event.target;

            if (!validateWarehouseForm(modal)) { return; }

            const mode = form.dataset.mode;
            const companyId = form.dataset.companyId;
            const warehouseId = form.dataset.warehouseId;

            const companyIndex = companies.findIndex(c => c.id === companyId);
            if (companyIndex === -1) { window.showCustomAlert('Error', 'Company tidak ditemukan.', 'error'); return; }

            let data = getWarehouseFormData();

            const companyData = companies[companyIndex];
            const rows = companyData.warehouses.rows;
            let newSelectedIndex = -1;
            let msg = '';

            if (mode === 'new' || mode === 'create') {
                if (rows.some(w => w.warehouseCode === data.warehouseCode)) {
                    window.showCustomAlert('Error', `Warehouse code ${data.warehouseCode} sudah ada di Company ini.`, 'error');
                    return;
                }

                data.id = generateUniqueId(WAREHOUSE_ID_PREFIX);
                rows.push(data);
                newSelectedIndex = rows.length - 1;
                msg = `Warehouse Info ${data.warehouseCode} berhasil dibuat.`;
            } else if (mode === 'edit') {
                const whsIndex = rows.findIndex(w => w.id === warehouseId);
                if (whsIndex !== -1) {
                    if (rows.some((w, i) => i !== whsIndex && w.warehouseCode === data.warehouseCode)) {
                        window.showCustomAlert('Error', `Warehouse code ${data.warehouseCode} sudah ada di Company ini.`, 'error');
                        return;
                    }

                    data.id = warehouseId;
                    rows[whsIndex] = data;
                    newSelectedIndex = whsIndex;
                    msg = `Warehouse Info ${data.warehouseCode} berhasil diupdate.`;
                }
            }

            companyData.warehouses.selectedIndex = newSelectedIndex;
            saveCompanies();

            window.closeCompanyWarehouseForm();
            window.renderCompanyWarehouseList(companyId);

            window.showCustomAlert('Success', msg, 'success');
        };

        // --- End of Company/Warehouse Logic ---

        // ====================================================================================
        // --- CUSTOMER LOGIC ---
        // ====================================================================================

        /**
         * Render daftar Customer di halaman utama Customer.
         */
        window.renderCustomerList = function (filter = '') {
            const container = document.getElementById('customer-list-container');
            if (!container) return;
            const lowerFilter = filter.toLowerCase();

            const filteredData = customers.filter(c =>
                (c.customer || '').toLowerCase().includes(lowerFilter) ||
                (c.name || '').toLowerCase().includes(lowerFilter) ||
                (c.company || '').toLowerCase().includes(lowerFilter)
            );

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
                filteredData.forEach(c => {
                    listWrapperHtml += `<tr class="border-b hover:bg-gray-50 cursor-pointer" ondblclick="showCustomerForm('edit', '${c.id}')">
                        <td class="py-3 px-6 text-left whitespace-nowrap">${c.customer}</td>
                        <td class="py-3 px-6 text-left">${c.shipTo || 'N/A'}</td>
                        <td class="py-3 px-6 text-left">${c.company}</td>
                        <td class="py-3 px-6 text-left">${c.name}</td>
                        <td class="py-3 px-6 text-left">${c.parent || 'N/A'}</td>
                        <td class="py-3 px-6 text-left">${!c.inactive ? 'Yes' : 'No'}</td>
                        <td class="py-3 px-6 text-center">
                            <div class="flex item-center justify-center">
                                <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="event.stopPropagation(); showCustomerForm('edit', '${c.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                                <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="event.stopPropagation(); deleteCustomer('${c.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                            </div>
                        </td>
                    </tr>`;
                });
            }
            listWrapperHtml += `</tbody></table></div>`;
            container.innerHTML = listWrapperHtml;
        };

        window.filterCustomerList = window.debounce((value) => window.renderCustomerList(value), 300);

        /**
         * Menghapus Customer yang dipilih.
         */
        window.deleteCustomer = function (id) {
            window.showCustomConfirm('Yakin kamu mau hapus Customer ini?', () => {
                customers = customers.filter(c => c.id !== id);
                saveCustomers();
                window.renderCustomerList();
                window.showCustomAlert('Dihapus', 'Customer berhasil dihapus!', 'success');
            });
        };

        /**
         * Validasi form Customer.
         */
        function validateCustomerForm(modal) {
            const form = document.getElementById('customer-form');
            form.noValidate = true;

            const requiredFields = [
                { name: 'customer', tab: 'general' },
                { name: 'shipTo', tab: 'general' },
                { name: 'company', tab: 'general' },
                { name: 'name', tab: 'address' }
            ];

            let isValid = true;
            let firstInvalid = null;
            let targetTab = null;

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

            requiredFields.forEach(field => {
                const el = form.querySelector(`[name="${field.name}"]`);
                const tabButton = modal.querySelector(`[role="tab"][data-tab="${field.tab}"]`);
                if (el) {
                    const label = field.name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                    if (!el.value.trim()) {
                        setError(el, `${label} is required.`, field.tab);
                        if (tabButton) tabButton.classList.add('text-red-500');
                    }
                }
            });

            if (firstInvalid) {
                if (targetTab) {
                    window.activateTab(targetTab, modal);
                }

                setTimeout(() => {
                    try { firstInvalid.focus(); } catch (e) { console.error("Gagal fokus input Customer:", e); }
                }, 100);

                return false;
            }

            return true;
        }

        /**
         * Menangani submit form Customer (Create/Update).
         */
        window.handleCustomerSubmit = function (event) {
            event.preventDefault();
            const modal = document.getElementById('customer-form-modal');

            if (!validateCustomerForm(modal)) { return; }

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const categories = {};
            for (let i = 1; i <= 10; i++) {
                categories[`category${i}`] = form[`category${i}`]?.value || '';
            }
            const udf = {};
            for (let i = 1; i <= 6; i++) {
                udf[`udf${i}`] = form[`udf${i}`]?.value || '';
            }

            const newCustomer = {
                id: id,
                customer: form.customer.value,
                shipTo: form.shipTo.value,
                company: form.company.value,
                name: form.name.value,
                parent: form.parent.value,
                inactive: form.inactive.checked,
                onHold: form.onHold.checked,
                carriers: Array.from(form.querySelectorAll('[name="carriers"]')).filter(el => el.checked).map(el => el.value),

                // Address (top-level)
                residential: form.residential.checked,
                address1: form.address1.value,
                address2: form.address2.value,
                address3: form.address3.value,
                city: form.city.value,
                state: form.state.value,
                postalCode: form.postalCode.value,
                country: form.country.value,
                faxNumber: form.faxNumber.value,
                phoneNumber: form.phoneNumber.value,
                emailAddress: form.emailAddress.value,

                categories: categories,

                // FBA
                fba_name: form.fba_name.value,
                fba_address1: form.fba_address1.value,
                fba_address2: form.fba_address2.value,
                fba_address3: form.fba_address3.value,
                fba_city: form.fba_city.value,
                fba_state: form.fba_state.value,
                fba_postalCode: form.fba_postalCode.value,
                fba_country: form.fba_country.value,

                udf: udf,

                // Pertahankan struktur RFID yang ada (karena CRUD-nya nested)
                rfid: (customers.find(c => c.id === id) || EMPTY_CUSTOMER).rfid
            };

            let msg = '';
            if (mode === 'create') {
                newCustomer.id = generateUniqueId(CUSTOMER_ID_PREFIX);
                customers.push(newCustomer);
                msg = `Customer ${newCustomer.customer} berhasil dibuat.`;
            } else {
                const index = customers.findIndex(c => c.id === id);
                if (index !== -1) {
                    customers[index] = { ...customers[index], ...newCustomer };
                    msg = `Customer ${newCustomer.customer} berhasil diupdate.`;
                }
            }

            saveCustomers();
            window.closeCustomerForm();
            window.renderCustomerList();
            window.showCustomAlert('Success', msg, 'success');
        };

        /**
         * Menampilkan modal form Customer (Create/Edit).
         */
        window.showCustomerForm = function (mode, id = null) {
            const modal = document.getElementById('customer-form-modal');
            const form = document.getElementById('customer-form');
            const title = document.getElementById('customer-form-title');

            let customerData = {};

            if (mode === 'create') {
                customerData = JSON.parse(JSON.stringify(EMPTY_CUSTOMER));
                customerData.customer = generateUniqueId('CUS');
            } else if (mode === 'edit' && id) {
                const found = customers.find(c => c.id === id);
                if (!found) {
                    window.showCustomAlert('Error', 'Customer tidak ditemukan!', 'error');
                    return;
                }
                customerData = JSON.parse(JSON.stringify(found));
            } else {
                customerData = JSON.parse(JSON.stringify(EMPTY_CUSTOMER));
            }

            title.textContent = mode === 'create' ? 'Customer - Create New' : `Customer - Edit Existing (${customerData.customer})`;

            // Render semua Tab
            document.getElementById('pane-cust-general').innerHTML = renderGeneralTab(customerData);
            document.getElementById('pane-cust-address').innerHTML = renderAddressTab(customerData);
            document.getElementById('pane-cust-categories').innerHTML = renderCategoriesTab(customerData);
            document.getElementById('pane-cust-fba').innerHTML = renderFreightBillTab(customerData);
            document.getElementById('pane-cust-rfid').innerHTML = renderRFIDTab(customerData);
            document.getElementById('pane-cust-udf').innerHTML = renderUDFTab(customerData);


            if (!modal._listenersAttached) {
                modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => window.activateTab(button.dataset.tab, modal) });
                modal._listenersAttached = true;
            }
            window.activateTab('general', modal);

            form.dataset.id = customerData.id;
            form.dataset.mode = mode;

            const modalContent = modal.querySelector('.modal-content');

            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');

            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);

            // Render footer
            const modalFooter = document.getElementById('customer-form-footer-placeholder');
            if (modalFooter) {
                modalFooter.innerHTML = window.renderStandardModalFooter({
                    cancelOnclick: "closeCustomerForm()",
                    submitFormId: "customer-form",
                    submitLabel: "Save"
                });
            }
        };

        /**
         * Menutup modal form Customer.
         */
        window.closeCustomerForm = function () {
            const modal = document.getElementById('customer-form-modal');
            const modalContent = modal.querySelector('.modal-content');

            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }, 300);
        };

        /**
         * Render tab General Customer.
         */
        function renderGeneralTab(model) {
            const { customer = '', shipTo = '', company = '', name = '', parent = '', inactive = false, onHold = false, carriers = [] } = model || {};
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="customer" class="block text-sm mb-1">Customer: <span class="text-red-500">*</span></label>
                        <input type="text" id="customer" name="customer" required class="input" value="${customer}">
                    </div>
                    <div>
                        <label for="shipTo" class="block text-sm mb-1">Ship To: <span class="text-red-500">*</span></label>
                        <input type="text" id="shipTo" name="shipTo" required class="input" value="${shipTo}">
                    </div>
                    <div>
                        <label for="company" class="block text-sm mb-1">Company: <span class="text-red-500">*</span></label>
                        <select id="company" name="company" required class="select">
                            <option value="">-- Select Company --</option>
                            ${dummyCompanies.map(c => `<option value="${c}" ${company === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="name" class="block text-sm mb-1">Name:</label>
                        <input type="text" id="name" name="name" class="input" value="${name}">
                    </div>
                    <div>
                        <label for="parent" class="block text-sm mb-1">Parent Customer:</label>
                        <input type="text" id="parent" name="parent" class="input" value="${parent}">
                    </div>
                    
                    <div class="md:col-span-2 flex gap-4 mt-2">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="inactive" name="inactive" ${inactive ? 'checked' : ''}> Inactive
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="onHold" name="onHold" ${onHold ? 'checked' : ''}> On Hold
                        </label>
                    </div>
                </div>
                
                <h4 class="text-md font-semibold text-wise-dark-gray mt-6 mb-4 border-t pt-4">Carriers (Multiple Select)</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${dummyCarriers.map(c => `
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="carriers" value="${c}" ${carriers.includes(c) ? 'checked' : ''}> ${c}
                        </label>
                    `).join('')}
                </div>
            `;
        }


        /**
         * Render tab Address Customer.
         */
        function renderAddressTab(data) {
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
                        <input type="text" id="city" name="city" class="input" value="${city}">
                    </div>
                    <div>
                        <label for="state" class="block text-sm mb-1">State/Postal code: <span class="text-gray-500">(Kode wilayah)</span></label>
                        <div class="flex gap-2">
                            <select id="state" name="state" class="select flex-1">
                                <option value="">-- Select Code --</option>
                                ${DUMMY_STATE_CODES.map(p => `<option value="${p}" ${state === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                            <input type="text" id="postalCode" name="postalCode" class="input w-20" placeholder="0000" value="${postalCode}">
                        </div>
                    </div>
                    <div>
                        <label for="country" class="block text-sm mb-1">Country:</label>
                        <select id="country" name="country" class="select">
                            <option value="">-- Select --</option>
                            ${DUMMY_COUNTRIES.map(c => `<option value="${c.code}" ${country === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`).join('')}
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

        /**
         * Render tab Categories Customer (10 field).
         */
        function renderCategoriesTab(model) {
            const { categories = EMPTY_CUSTOMER.categories } = model;
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 10 }, (_, i) => {
                const key = `category${i + 1}`;
                return `
                        <div>
                            <label for="${key}" class="block text-sm mb-1">Category ${i + 1}:</label>
                            <input type="text" id="${key}" name="${key}" class="input" value="${categories[key] || ''}">
                        </div>
                    `;
            }).join('')}
                </div>
            `;
        }

        /**
         * Render tab Freight Bill To Address Customer.
         */
        function renderFreightBillTab(model) {
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
                         <input type="text" id="fba-city" name="fba_city" class="input" value="${fba_city}">
                    </div>
                    <div>
                        <label for="fba-state" class="block text-sm mb-1">State/Postal code: <span class="text-gray-500">(Kode wilayah)</span></label>
                        <div class="flex gap-2">
                            <select id="fba-state" name="fba_state" class="select flex-1">
                                <option value="">-- Select Code --</option>
                                ${DUMMY_STATE_CODES.map(p => `<option value="${p}" ${fba_state === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                            <input type="text" id="fba-postalCode" name="fba_postalCode" class="input w-20" placeholder="0000" value="${fba_postalCode}">
                        </div>
                    </div>
                    <div>
                        <label for="fba-country" class="block text-sm mb-1">Country:</label>
                        <select id="fba-country" name="fba_country" class="select">
                            <option value="">-- Select --</option>
                            ${DUMMY_COUNTRIES.map(c => `<option value="${c.code}" ${fba_country === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        }

        /**
         * Render tab RFID Customer (list dan filter).
         */
        function renderRFIDTab(model) {
            const { rfid: { rows, selectedIndex, filter } } = model;

            const selectedRow = rows[selectedIndex];

            return `
                <div class="space-y-4">
                    <h4 class="font-semibold mb-3">RFID Attributes</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="rfid-container-class" class="block text-sm mb-1">Container Class:</label>
                            <select id="rfid-container-class" name="containerClass" class="select">
                                <option value="">-- Select --</option>
                                ${dummyContainerClasses.map(cc => `<option value="${cc}" ${selectedRow?.containerClass === cc ? 'selected' : ''}>${cc}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="rfid-epc-encoding" class="block text-sm mb-1">EPC Encoding:</label>
                            <input type="text" id="rfid-epc-encoding" name="epcEncoding" class="input" value="${selectedRow?.epcEncoding || ''}">
                        </div>
                        <div class="flex gap-4 mt-2">
                            <label class="flex items-center gap-2 text-sm">
                                <input type="checkbox" id="rfid-single-item" name="singleItem" ${selectedRow?.singleItem ? 'checked' : ''}> Single Item
                            </label>
                            <label class="flex items-center gap-2 text-sm">
                                <input type="checkbox" id="rfid-multi-item" name="multiItem" ${selectedRow?.multiItem ? 'checked' : ''}> Multi Item
                            </label>
                        </div>
                        <div>
                            <label for="rfid-udf1" class="block text-sm mb-1">UDF1:</label>
                            <input type="text" id="rfid-udf1" name="rfidUdf1" class="input" value="${selectedRow?.udf1 || ''}">
                        </div>
                    </div>
                    
                    <div class="flex gap-2 mt-4">
                        <button type="button" class="btn btn-sm btn-primary" onclick="addRFIDRow()">Add</button>
                        <button type="button" class="btn btn-sm" onclick="updateRFIDRow()" ${selectedIndex === -1 ? 'disabled' : ''}>Update</button>
                        <button type="button" class="btn btn-sm text-red-500" onclick="removeRFIDRow()" ${selectedIndex === -1 ? 'disabled' : ''}>Remove</button>
                    </div>

                    <h4 class="font-semibold mb-3 pt-4 border-t">Current RFID List (${rows.length})</h4>
                    <div class="border rounded-md overflow-y-auto max-h-[200px]">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="py-2 px-4 text-left w-12">#</th>
                                    <th class="py-2 px-4 text-left">Container</th>
                                    <th class="py-2 px-4 text-left">EPC</th>
                                    <th class="py-2 px-left">Single/Multi</th>
                                    <th class="py-2 px-4 text-left">UDF1</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.length === 0 ? `<tr><td colspan="5" class="p-4 text-center text-gray-400">No RFID rows defined.</td></tr>` :
                    rows.map((row, index) => `
                                        <tr class="border-t hover:bg-gray-50 cursor-pointer ${index === selectedIndex ? 'bg-blue-100' : ''}" onclick="selectRFIDRow(${index})">
                                            <td class="py-2 px-4">${index + 1}</td>
                                            <td class="py-2 px-4">${row.containerClass}</td>
                                            <td class="py-2 px-4">${row.epcEncoding}</td>
                                            <td class="py-2 px-4">${row.singleItem ? 'Single' : (row.multiItem ? 'Multi' : 'N/A')}</td>
                                            <td class="py-2 px-4">${row.udf1 || ''}</td>
                                        </tr>
                                    `).join('')
                }
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 p-4 border rounded-md bg-gray-50">
                        <h4 class="font-semibold mb-2">RFID Filter/Query</h4>
                        <div class="grid grid-cols-4 gap-2 text-sm">
                            <select name="rfidFilterAndOr" class="select select-sm">${['AND', 'OR'].map(op => `<option value="${op}" ${filter.andOr === op ? 'selected' : ''}>${op}</option>`).join('')}</select>
                            <input type="text" name="rfidFilterAttribute" placeholder="Attribute" class="input input-sm" value="${filter.attribute}">
                            <select name="rfidFilterOp" class="select select-sm">${['=', '!=', '>', '<'].map(op => `<option value="${op}" ${filter.op === op ? 'selected' : ''}>${op}</option>`).join('')}</select>
                            <input type="text" name="rfidFilterValue" placeholder="Value" class="input input-sm" value="${filter.value}">
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Render tab UDF Customer (6 field).
         */
        function renderUDFTab(model) {
            const { udf = EMPTY_CUSTOMER.udf } = model;

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array.from({ length: 6 }, (_, i) => {
                const key = `udf${i + 1}`;
                return `
                        <div>
                            <label for="${key}" class="block text-sm mb-1">User defined field ${i + 1}:</label>
                            <input type="text" id="${key}" name="${key}" class="input" value="${udf[key] || ''}">
                        </div>
                    `;
            }).join('')}
                </div>
            `;
        }

        // RFID Sub-handlers 

        /**
         * Memilih baris RFID, mengisi form, dan me-render ulang list.
         */
        window.selectRFIDRow = function (index) {
            const form = document.getElementById('customer-form');
            const customerId = form.dataset.id;
            const customerIndex = customers.findIndex(c => c.id === customerId);

            if (customerIndex !== -1) {
                const rfidData = customers[customerIndex].rfid;
                rfidData.selectedIndex = index;

                const row = rfidData.rows[index];
                form.containerClass.value = row.containerClass;
                form.epcEncoding.value = row.epcEncoding;
                form.singleItem.checked = row.singleItem;
                form.multiItem.checked = row.multiItem;
                form.rfidUdf1.value = row.udf1;

                const modal = document.getElementById('customer-form-modal');
                modal.querySelector('#pane-cust-rfid').innerHTML = renderRFIDTab(customers[customerIndex]);
                window.activateTab('rfid', modal);
            }
        };

        /**
         * Mendapatkan data RFID dari input form saat ini.
         */
        const getCurrentRFIDData = (form) => ({
            containerClass: form.containerClass.value,
            epcEncoding: form.epcEncoding.value,
            singleItem: form.singleItem.checked,
            multiItem: form.multiItem.checked,
            udf1: form.rfidUdf1.value,
        });

        /**
         * Menambahkan baris RFID baru ke dalam list.
         */
        window.addRFIDRow = function () {
            const form = document.getElementById('customer-form');
            const customerId = form.dataset.id;
            const customerIndex = customers.findIndex(c => c.id === customerId);

            if (customerIndex === -1) { window.showCustomAlert('Error', 'Customer not found.', 'error'); return; }

            const newRow = getCurrentRFIDData(form);
            if (!newRow.containerClass || !newRow.epcEncoding) {
                window.showCustomAlert('Warning', 'Container Class dan EPC Encoding wajib diisi sebelum menambah baris.', 'warning');
                return;
            }

            customers[customerIndex].rfid.rows.push(newRow);
            customers[customerIndex].rfid.selectedIndex = -1;
            saveCustomers();

            const modal = document.getElementById('customer-form-modal');
            modal.querySelector('#pane-cust-rfid').innerHTML = renderRFIDTab(customers[customerIndex]);
            window.activateTab('rfid', modal);
            window.showCustomAlert('Success', 'Baris RFID berhasil ditambahkan.', 'success');
        };

        /**
         * Mengupdate baris RFID yang sedang dipilih.
         */
        window.updateRFIDRow = function () {
            const form = document.getElementById('customer-form');
            const customerId = form.dataset.id;
            const customerIndex = customers.findIndex(c => c.id === customerId);

            if (customerIndex === -1) { window.showCustomAlert('Error', 'Customer not found.', 'error'); return; }

            const selectedIndex = customers[customerIndex].rfid.selectedIndex;
            if (selectedIndex === -1) { window.showCustomAlert('Warning', 'Pilih baris yang akan diupdate terlebih dahulu.', 'warning'); return; }

            const updatedRow = getCurrentRFIDData(form);
            if (!updatedRow.containerClass || !updatedRow.epcEncoding) {
                window.showCustomAlert('Warning', 'Container Class dan EPC Encoding wajib diisi.', 'warning');
                return;
            }

            customers[customerIndex].rfid.rows[selectedIndex] = updatedRow;
            customers[customerIndex].rfid.selectedIndex = -1;
            saveCustomers();

            const modal = document.getElementById('customer-form-modal');
            modal.querySelector('#pane-cust-rfid').innerHTML = renderRFIDTab(customers[customerIndex]);
            window.activateTab('rfid', modal);
            window.showCustomAlert('Success', 'Baris RFID berhasil diperbarui.', 'success');
        };

        /**
         * Menghapus baris RFID yang sedang dipilih.
         */
        window.removeRFIDRow = function () {
            const form = document.getElementById('customer-form');
            const customerId = form.dataset.id;
            const customerIndex = customers.findIndex(c => c.id === customerId);

            if (customerIndex === -1) { window.showCustomAlert('Error', 'Customer not found.', 'error'); return; }

            const selectedIndex = customers[customerIndex].rfid.selectedIndex;
            if (selectedIndex === -1) { window.showCustomAlert('Warning', 'Pilih baris yang akan dihapus terlebih dahulu.', 'warning'); return; }

            window.showCustomConfirm('Yakin hapus baris RFID yang dipilih?', () => {
                customers[customerIndex].rfid.rows.splice(selectedIndex, 1);
                customers[customerIndex].rfid.selectedIndex = -1;
                saveCustomers();

                const modal = document.getElementById('customer-form-modal');
                modal.querySelector('#pane-cust-rfid').innerHTML = renderRFIDTab(customers[customerIndex]);
                window.activateTab('rfid', modal);
                window.showCustomAlert('Success', 'Baris RFID berhasil dihapus.', 'success');
            });
        };


        // --- REGISTRASI KONTEN CUSTOMER ---

        if (!window.contentData[CUSTOMER_CATEGORY_KEY]) {
            window.contentData[CUSTOMER_CATEGORY_KEY] = {
                // Background halaman utama Customer harus putih
                full: `
                    <div class="bg-white p-6 rounded-lg shadow-lg"> 
                        <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Customer</h2>
                        <p class="text-wise-gray mb-4">Manage customer master data, including shipping attributes and RFID setup.</p>
                        ${window.renderStandardListHeader({
                    createLabel: "Create New Customer",
                    onCreate: "showCustomerForm('create')",
                    searchId: "customer-search",
                    searchPlaceholder: "Search customer...",
                    onSearch: "filterCustomerList"
                })}
                        <div id="customer-list-container" class="overflow-x-auto"></div>
                    </div>

                    <!-- Customer Form Modal -->
                    <div id="customer-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
                        <div class="modal-content bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] opacity-0 scale-95 transition-all duration-300">
                            <div class="px-6 pt-5 pb-3 border-b relative">
                                <h3 id="customer-form-title" class="text-lg font-semibold"></h3>
                                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeCustomerForm()">✕</button>
                            </div>
                            <div class="p-6 overflow-y-auto">
                                <form id="customer-form" onsubmit="handleCustomerSubmit(event)">
                                    <!-- Tabs -->
                                    <div role="tablist" class="border-b mb-4 flex flex-wrap gap-4 text-sm font-medium">
                                        <button type="button" role="tab" data-tab="general" class="tab tab-active">General</button>
                                        <button type="button" role="tab" data-tab="address" class="tab">Address</button>
                                        <button type="button" role="tab" data-tab="categories" class="tab">Categories</button>
                                        <button type="button" role="tab" data-tab="fba" class="tab">Freight bill to address</button>
                                        <button type="button" role="tab" data-tab="rfid" class="tab">RFID</button>
                                        <button type="button" role="tab" data-tab="udf" class="tab">User defined data</button>
                                    </div>
                                    
                                    <div id="pane-cust-general" role="tabpanel" data-pane="general"></div>
                                    <div id="pane-cust-address" role="tabpanel" data-pane="address" class="hidden"></div>
                                    <div id="pane-cust-categories" role="tabpanel" data-pane="categories" class="hidden"></div>
                                    <div id="pane-cust-fba" role="tabpanel" data-pane="fba" class="hidden"></div>
                                    <div id="pane-cust-rfid" role="tabpanel" data-pane="rfid" class="hidden"></div>
                                    <div id="pane-cust-udf" role="tabpanel" data-pane="udf" class="hidden"></div>
                                    
                                </form>
                            </div>
                            <!-- Placeholder untuk Footer -->
                            <div id="customer-form-footer-placeholder"></div>
                        </div>
                    </div>
                `
            };

            window.searchItems.push({ id: CUSTOMER_CATEGORY_KEY, title: 'Customer', category: 'Configuration', lastUpdated: 'Latest' });
            window.allMenus.push({ id: CUSTOMER_CATEGORY_KEY, name: 'Customer', category: 'configuration' });
            window.parentMapping[CUSTOMER_CATEGORY_KEY] = 'configuration';
        }


        // --- REGISTRASI KONTEN COMPANY ---
        if (!window.contentData[COMPANY_CATEGORY_KEY]) {
            window.contentData[COMPANY_CATEGORY_KEY] = {
                // Background halaman utama Company harus putih
                full: `
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Company</h2>
                        <p class="text-wise-gray mb-4">Manage company master data, including addresses and nested warehouse configurations.</p>
                        ${window.renderStandardListHeader({
                    createLabel: "Create New Company",
                    onCreate: "showCompanyForm('create')",
                    searchId: "company-search",
                    searchPlaceholder: "Search company...",
                    onSearch: "filterCompanyList"
                })}
                        <div id="company-list-container" class="overflow-x-auto"></div>
                    </div>

                    <!-- Company Form Modal -->
                    <div id="company-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
                        <div class="modal-content bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden opacity-0 scale-95 transition-all duration-300">
                            <div class="px-6 pt-5 pb-3 border-b relative">
                                <h3 id="company-form-title" class="text-lg font-semibold"></h3>
                                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeCompanyForm()">✕</button>
                            </div>
                            <div class="p-6 overflow-y-auto">
                                <form id="company-form" onsubmit="handleCompanySubmit(event)">
                                    <!-- Tabs di dalam wrapper yang bisa discroll horizontal -->
                                    <div class="overflow-x-auto border-b mb-4">
                                        <div role="tablist" id="company-tab-list" class="flex flex-nowrap gap-x-4 text-sm font-medium w-max min-w-full">
                                            <button type="button" role="tab" data-tab="general" class="tab tab-active">General</button>
                                            <button type="button" role="tab" data-tab="company-info" class="tab">Warehouse/company information</button>
                                            <button type="button" role="tab" data-tab="company-address" class="tab">Company address</button>
                                            <button type="button" role="tab" data-tab="return-address" class="tab">Returns address</button>
                                            <button type="button" role="tab" data-tab="freight-address" class="tab">Freight bill to address</button>
                                            <button type="button" role="tab" data-tab="internet-info" class="tab">Internet information</button>
                                            <button type="button" role="tab" data-tab="web-header" class="tab">Web header</button>
                                            <button type="button" role="tab" data-tab="assigned-users" class="tab">Assigned users</button>
                                            <button type="button" role="tab" data-tab="udf" class="tab">User defined data</button>
                                        </div>
                                    </div>
                                    
                                    <div id="pane-cmp-general" role="tabpanel" data-pane="general"></div>
                                    <div id="pane-cmp-info" role="tabpanel" data-pane="company-info" class="hidden"></div>
                                    <div id="pane-cmp-address" role="tabpanel" data-pane="company-address" class="hidden"></div>
                                    <div id="pane-cmp-return" role="tabpanel" data-pane="return-address" class="hidden"></div>
                                    <div id="pane-cmp-freight" role="tabpanel" data-pane="freight-address" class="hidden"></div>
                                    <div id="pane-cmp-internet" role="tabpanel" data-pane="internet-info" class="hidden"></div>
                                    <div id="pane-cmp-webheader" role="tabpanel" data-pane="web-header" class="hidden"></div>
                                    <div id="pane-cmp-assigned" role="tabpanel" data-pane="assigned-users" class="hidden"></div>
                                    <div id="pane-cmp-udf" role="tabpanel" data-pane="udf" class="hidden"></div>

                                    <input type="hidden" name="id" value="">
                                </form>
                            </div>
                            <!-- Placeholder untuk Footer -->
                            <div id="company-form-footer-placeholder"></div>
                        </div>
                    </div>

                    <!-- Warehouse Info Sub-Modal (Nested CRUD) -->
                    <div id="warehouse-form-modal" class="hidden fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
                        <div class="modal-content bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden opacity-0 scale-95 transition-all duration-300">
                            <div class="px-6 pt-5 pb-3 border-b relative">
                                <h3 id="warehouse-form-title" class="text-lg font-semibold"></h3>
                                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeCompanyWarehouseForm()">✕</button>
                            </div>
                            <div class="p-6 overflow-y-auto">
                                <form id="warehouse-form">
                                    <div class="overflow-x-auto border-b mb-4">
                                        <div role="tablist" class="flex flex-nowrap gap-x-4 text-sm font-medium w-max min-w-full">
                                            <button type="button" role="tab" data-tab="ship-from" class="tab tab-active">Ship from address</button>
                                            <button type="button" role="tab" data-tab="return-whs" class="tab">Return address</button>
                                            <button type="button" role="tab" data-tab="freight-whs" class="tab">Freight bill to address</button>
                                            <button type="button" role="tab" data-tab="udf-whs" class="tab">User defined data</button>
                                        </div>
                                    </div>
                                    
                                    <div id="pane-whs-shipfrom" role="tabpanel" data-pane="ship-from"></div>
                                    <div id="pane-whs-return" role="tabpanel" data-pane="return-whs" class="hidden"></div>
                                    <div id="pane-whs-freight" role="tabpanel" data-pane="freight-whs" class="hidden"></div>
                                    <div id="pane-whs-udf" role="tabpanel" data-pane="udf-whs" class="hidden"></div>

                                    <input type="hidden" name="id" value="">
                                </form>
                            </div>
                            <!-- Placeholder untuk Footer -->
                            <div id="warehouse-form-footer-placeholder"></div>
                        </div>
                    </div>
                `
            };

            window.searchItems.push({ id: COMPANY_CATEGORY_KEY, title: 'Company', category: 'Configuration', lastUpdated: 'Latest' });
            window.allMenus.push({ id: COMPANY_CATEGORY_KEY, name: 'Company', category: 'configuration' });
            window.parentMapping[COMPANY_CATEGORY_KEY] = 'configuration';
        }

        // --- LOGIKA HALAMAN WAREHOUSE MANDIRI (OPSIONAL) ---

        const WAREHOUSE_LAST_COMPANY_KEY = 'wms_whs_last_company_id';

        window.renderWarehousePage = function () {
            companies = JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY)) || companies;

            const container = document.getElementById('content-container');
            const targetContainer = container.querySelector(`[data-key="${WAREHOUSE_CATEGORY_KEY}"]`);
            if (!targetContainer) return;

            if (companies.length === 0) {
                targetContainer.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-lg"> 
                        <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Warehouse/company information</h2>
                        <p class="p-6 bg-red-100 border border-red-300 text-red-700 rounded-lg shadow-md mt-4">
                            <span class="font-bold">Perhatian:</span> Tidak ada Company ditemukan. Harap buat Company terlebih dahulu di menu "Company".
                        </p>
                    </div>
                 `;
                return;
            }

            let selectedCompanyId = localStorage.getItem(WAREHOUSE_LAST_COMPANY_KEY);
            const firstCompanyId = companies[0].id;

            if (!selectedCompanyId || !companies.some(c => c.id === selectedCompanyId)) {
                selectedCompanyId = firstCompanyId;
                localStorage.setItem(WAREHOUSE_LAST_COMPANY_KEY, selectedCompanyId);
            }

            let companyOptions = companies.map(c =>
                `<option value="${c.id}" ${c.id === selectedCompanyId ? 'selected' : ''}>${c.companyCode} - ${c.companyAddress.name || 'N/A'}</option>`
            ).join('');

            targetContainer.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Warehouse/company information</h2>
                    <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-md bg-white">
                        <label for="wh-company-selector" class="font-medium text-sm whitespace-nowrap">Pilih Company Aktif:</label>
                        <select id="wh-company-selector" class="select select-bordered w-full sm:w-80" onchange="window.handleWarehouseCompanyChange(this.value)">
                            ${companyOptions}
                        </select>
                    </div>
                    
                    <div id="warehouse-list-container" class="mt-4">
                        <!-- List akan di-render di sini oleh renderCompanyWarehouseList(selectedCompanyId) -->
                    </div>
                </div>
            `;

            window.renderCompanyWarehouseList(selectedCompanyId);
            window.currentSelectedCompanyId = selectedCompanyId;
        };

        window.handleWarehouseCompanyChange = function (companyId) {
            if (!companyId) return;
            localStorage.setItem(WAREHOUSE_LAST_COMPANY_KEY, companyId);
            window.renderCompanyWarehouseList(companyId);
        };


        // --- PENGENDALIAN AUTORENDER ---

        const autoRenderContent = () => {
            const customerContainer = document.getElementById('customer-list-container');
            if (customerContainer && !customerContainer.dataset.bound) {
                window.renderCustomerList();
                customerContainer.dataset.bound = '1';
            }

            const companyContainer = document.getElementById('company-list-container');
            if (companyContainer && !companyContainer.dataset.bound) {
                window.renderCompanyList();
                companyContainer.dataset.bound = '1';
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    autoRenderContent();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('content:rendered', (e) => {
            if (e.detail.key === CUSTOMER_CATEGORY_KEY) {
                window.renderCustomerList();
            }
            if (e.detail.key === COMPANY_CATEGORY_KEY) {
                window.renderCompanyList();
            }
            // Hook untuk kategori Warehouse mandiri
            /* if (e.detail.key === WAREHOUSE_CATEGORY_KEY) {
                window.renderWarehousePage();
            }
            */
        });

    });
})();
