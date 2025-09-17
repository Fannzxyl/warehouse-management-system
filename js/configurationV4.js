(function () {
    document.addEventListener('DOMContentLoaded', () => {
        // Memastikan variabel global sudah tersedia
        if (typeof window.contentData === 'undefined') window.contentData = {};
        if (typeof window.searchItems === 'undefined') window.searchItems = [];
        if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
        if (typeof window.allMenus === 'undefined') window.allMenus = [];
        
        // --- UTILITY FUNCTIONS ---
        // Helper untuk memformat tanggal dan waktu
        const formatDate = (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            const pad = (n) => n < 10 ? `0${n}` : n;
            const day = pad(d.getDate());
            const month = pad(d.getMonth() + 1);
            const year = d.getFullYear();
            const hours = pad(d.getHours());
            const minutes = pad(d.getMinutes());
            const seconds = pad(d.getSeconds());
            return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`; 
        };
        
        // Debounce function
        const debounce = window.debounce || ((fn, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        });

        // Custom Alert and Confirm to avoid browser pop-ups
        function createCustomModal(id, title, message, isConfirm = false, onOk, onCancel) {
    let modal = document.getElementById(id);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-auto">
            <h3 class="text-lg font-semibold mb-4">${title}</h3>
            <p class="text-sm text-gray-600 mb-4">${message}</p>
            <div class="flex justify-end gap-2">
                ${isConfirm ? `<button id="${id}-cancel" class="px-4 py-2 text-sm rounded-md hover:bg-gray-200">Batal</button>` : ''}
                <button id="${id}-ok" class="px-4 py-2 text-sm bg-wise-primary text-white rounded-md hover:bg-blue-600">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById(`${id}-ok`).onclick = () => {
        modal.remove();
        if (onOk) onOk();
    };

    if (isConfirm) {
        document.getElementById(`${id}-cancel`).onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };
    }
}

window.showCustomAlert = (title, message) => {
    return new Promise(resolve => {
        const modalId = 'custom-alert-modal';
        createCustomModal(modalId, title, message, false, resolve);
    });
};

window.showCustomConfirm = (title, message) => {
    return new Promise(resolve => {
        const modalId = 'custom-confirm-modal';
        createCustomModal(modalId, title, message, true, () => resolve(true), () => resolve(false));
    });
};

        const showToast = (message, type = 'success') => {
            const toastId = 'toast-notification';
            let toast = document.getElementById(toastId);
            if (!toast) {
                toast = document.createElement('div');
                toast.id = toastId;
                toast.className = 'fixed bottom-4 right-4 z-[99] p-4 rounded-md shadow-lg text-white transition-opacity duration-300 aria-live="polite"';
                document.body.appendChild(toast);
            }
            
            const colorClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            toast.className = `fixed bottom-4 right-4 z-[99] p-4 rounded-md shadow-lg text-white transition-opacity duration-300 ${colorClass}`;
            toast.textContent = message;
            toast.classList.remove('opacity-0');
            
            setTimeout(() => {
                toast.classList.add('opacity-0');
            }, 3000);
        };
        
        // Helper untuk membuat dropdown panjang yang dapat dicari
        const makeLongDropdown = (selectId, options, currentValue) => {
            const selectEl = document.getElementById(selectId);
            if (!selectEl) return;
            const selectContainer = document.createElement('div');
            selectContainer.className = 'relative w-full';
            
            const inputId = `${selectId}-input`;
            const dropdownId = `${selectId}-dropdown`;
            
            selectContainer.innerHTML = `
                <input type="text" id="${inputId}" class="input w-full cursor-pointer focus:ring-2 focus:ring-wise-primary" readonly
                       placeholder="-- Pilih --" value="${currentValue || ''}" autocomplete="off" aria-haspopup="listbox" aria-expanded="false">
                <div id="${dropdownId}" class="absolute z-10 hidden bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full max-h-[280px] overflow-y-auto">
                    <div class="p-2 border-b border-gray-200">
                        <input type="text" id="${dropdownId}-filter" class="w-full text-sm p-2 border rounded-md focus:outline-none" placeholder="Cari...">
                    </div>
                    <ul role="listbox" id="${dropdownId}-list" class="text-sm"></ul>
                </div>
            `;
            selectEl.parentNode.replaceChild(selectContainer, selectEl);
            
            const dropdown = document.getElementById(dropdownId);
            const input = document.getElementById(inputId);
            const filterInput = document.getElementById(`${dropdownId}-filter`);
            const list = document.getElementById(`${dropdownId}-list`);
            
            let filteredOptions = options;
            let activeIndex = -1;

            const renderOptions = (opts) => {
                list.innerHTML = opts.map((opt, index) => {
                    const value = typeof opt === 'object' ? opt.value : opt;
                    const label = typeof opt === 'object' ? opt.label : opt;
                    return `<li role="option" data-value="${value}" class="p-2 cursor-pointer hover:bg-wise-light-gray" id="${dropdownId}-option-${index}">${label}</li>`;
                }).join('');
            };

            input.addEventListener('click', () => {
                const isHidden = dropdown.classList.contains('hidden');
                dropdown.classList.toggle('hidden', !isHidden);
                input.setAttribute('aria-expanded', isHidden);
                if (isHidden) {
                    filterInput.focus();
                }
                renderOptions(filteredOptions);
            });
            
            document.addEventListener('click', (e) => {
                if (!selectContainer.contains(e.target) && !dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                    input.setAttribute('aria-expanded', 'false');
                }
            });

            filterInput.addEventListener('input', debounce(() => {
                const filterText = filterInput.value.toLowerCase();
                filteredOptions = options.filter(opt => {
                    const label = typeof opt === 'object' ? opt.label.toLowerCase() : opt.toLowerCase();
                    return label.includes(filterText);
                });
                renderOptions(filteredOptions);
            }, 200));

            list.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (li) {
                    const value = li.dataset.value;
                    input.value = li.textContent;
                    input.dataset.value = value;
                    dropdown.classList.add('hidden');
                    input.setAttribute('aria-expanded', 'false');
                    
                    // Trigger custom change event for reactivity
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (dropdown.classList.contains('hidden')) {
                        dropdown.classList.remove('hidden');
                        input.setAttribute('aria-expanded', 'true');
                        renderOptions(filteredOptions);
                        activeIndex = -1;
                    }
                    activeIndex = (activeIndex + 1) % list.children.length;
                    list.children[activeIndex].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (dropdown.classList.contains('hidden')) return;
                    activeIndex = (activeIndex - 1 + list.children.length) % list.children.length;
                    list.children[activeIndex].focus();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeIndex !== -1) {
                        list.children[activeIndex].click();
                    }
                } else if (e.key === 'Escape') {
                    dropdown.classList.add('hidden');
                    input.setAttribute('aria-expanded', 'false');
                    input.focus();
                }
            });

            renderOptions(options);
        };
        
        // Helper untuk memvalidasi form
        const validateItemForm = () => {
            const form = document.getElementById('item-form');
            const mode = form.dataset.mode;
            let isValid = true;
            let firstInvalidField = null;

            // Clear previous errors
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

            const showError = (input, message) => {
                if (!input) return;
                const errorId = `${input.id}-error`;
                let errorEl = document.getElementById(errorId);
                if (!errorEl) {
                    errorEl = document.createElement('p');
                    errorEl.id = errorId;
                    errorEl.className = 'error-message text-red-500 text-xs mt-1';
                    input.parentNode.appendChild(errorEl);
                }
                errorEl.textContent = message;
                input.setAttribute('aria-invalid', 'true');
                input.setAttribute('aria-describedby', errorId);
                if (!firstInvalidField) {
                    firstInvalidField = input;
                }
                isValid = false;
            };

            const companyInput = form.querySelector('[name="company-input"]');
            const itemCodeInput = form.querySelector('[name="itemCode"]');
            const eqValueInput = form.querySelector('[name="eqValue"]');
            const costInput = form.querySelector('[name="cost"]');
            const listPriceInput = form.querySelector('[name="listPrice"]');
            const netPriceInput = form.querySelector('[name="netPrice"]');
            const shelfLifeInput = form.querySelector('[name="shelfLife"]');
            const lotControlledCheckbox = form.querySelector('[name="lotControlled"]');
            const lotTemplateSelect = form.querySelector('[name="lotTemplate-input"]');
            const lotDaysToExpireInput = form.querySelector('[name="lotDaysToExpire"]');
            const gs1EnabledCheckbox = form.querySelector('[name="gs1GtinEnabled"]');
            const gs1TypeRadio = form.querySelector('input[name="gs1Type"]:checked');
            const computeQtyAsRadio = form.querySelector('input[name="computeQtyAs"]:checked');
            const inspectionQtyInput = form.querySelector('[name="inspectionQty"]');
            const serialControlledCheckbox = form.querySelector('[name="serialControlled"]');
            const serialTemplateSelect = form.querySelector('[name="serialTemplate-input"]');

            // Business Rules
            if (!companyInput?.value) showError(companyInput, 'Company diperlukan.');
            if (!itemCodeInput?.value && mode === 'create') showError(itemCodeInput, 'Item Code diperlukan.');

            const numValue = (el) => parseFloat(el?.value) || 0;

            if (numValue(eqValueInput) < 0) showError(eqValueInput, 'EQ Value harus ≥ 0.');
            if (numValue(costInput) < 0) showError(costInput, 'Cost harus ≥ 0.');
            if (numValue(listPriceInput) < 0) showError(listPriceInput, 'List price harus ≥ 0.');
            if (numValue(netPriceInput) < 0) showError(netPriceInput, 'Net price harus ≥ 0.');
            if (numValue(shelfLifeInput) < 0) showError(shelfLifeInput, 'Shelf life harus ≥ 0.');

            if (lotControlledCheckbox?.checked && !lotTemplateSelect?.value) {
                showError(lotTemplateSelect, 'Lot template diperlukan.');
            }
            
            if (gs1EnabledCheckbox?.checked && !gs1TypeRadio?.value) {
                const radioGroup = form.querySelector('input[name="gs1Type"]');
                showError(radioGroup, 'Pilih satu opsi GS1.');
            } else if (!gs1EnabledCheckbox?.checked) {
                form.querySelector('input[name="gs1Type"]').checked = false;
            }

            if (computeQtyAsRadio?.value === 'PERCENTAGE' && numValue(inspectionQtyInput) > 100) {
                 showError(inspectionQtyInput, 'Inspection Qty tidak boleh > 100%');
            }
            
            const serialFlags = form.querySelector('[name="serialInbound"]').checked ||
                                form.querySelector('[name="serialInventory"]').checked ||
                                form.querySelector('[name="serialOutbound"]').checked;
            
            if (serialControlledCheckbox?.checked && !serialTemplateSelect?.value) {
                 showError(serialTemplateSelect, 'Serial template diperlukan.');
            } else if (!serialControlledCheckbox?.checked && serialTemplateSelect?.value) {
                 showError(serialTemplateSelect, 'Kosongkan template karena Serial controlled tidak aktif.');
            }


            if (firstInvalidField) {
                // Temukan tab yang berisi field pertama yang invalid
                const tabPane = firstInvalidField.closest('[role="tabpanel"]');
                if (tabPane) {
                    const tabId = tabPane.dataset.pane;
                    document.getElementById('item-tab-list').querySelector(`[data-tab="${tabId}"]`).click();
                }
                firstInvalidField.focus();
            }

            return isValid;
        };
        
        // --- DATA MODELS & SEEDING ---
        let items = JSON.parse(localStorage.getItem('items')) || [];
        // Data dummy untuk Item Cross Reference
        let itemCrossReferences = JSON.parse(localStorage.getItem('itemCrossReferences')) || [
            { id: 'ICR000', item: '000000003072_1', company: 'DCB', crossReferenceItemNumber: '0275375', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR001', item: '000000003073_1', company: 'DCB', crossReferenceItemNumber: '02753362', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR002', item: '000000003083_1', company: 'DCB', crossReferenceItemNumber: '02753380', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR003', item: '000000003083_1', company: 'DCI', crossReferenceItemNumber: '8992030000961', quantityUm: 'PC', gtinEnabled: true, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR004', item: '000000003083_1', company: 'DCS', crossReferenceItemNumber: '02753382', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR005', item: '000000003083_1', company: 'DCJ', crossReferenceItemNumber: '8992030000991', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR006', item: '000000003083_1', company: 'DCK', crossReferenceItemNumber: '02753384', quantityUm: 'PC', gtinEnabled: false, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
            { id: 'ICR007', item: '000000003083_1', company: 'DCM', crossReferenceItemNumber: '8992030000981', quantityUm: 'PC', gtinEnabled: true, lastUpdated: '12-03-2020 12:44:49 AM', user: 'ILSSRV', userDefined: {} },
        ];

        let inventoryControlValues = JSON.parse(localStorage.getItem('inventoryControlValues')) || [
             { id: 10, key: "Whether inventory is being tracked by default", value: "Y", systemValue: "Y", systemCreated: "Yes" },
             { id: 40, key: "Default inventory status for adjustments", value: "Available", systemValue: "Available", systemCreated: "Yes" },
             { id: 50, key: "Allow Duplicate Serial Numbers?", value: "N", systemValue: "N", systemCreated: "Yes" },
             { id: 70, key: "Write Location UM overrides on Item UM Change", value: "N", systemValue: "N", systemCreated: "Yes" },
             { id: 110, key: "Should item be validated throughout system?", value: "Y", systemValue: "Y", systemCreated: "Yes" },
             { id: 130, key: "Inventory status for frozen lots", value: "Held", systemValue: "Held", systemCreated: "Yes" }
        ];
        
        function saveInventoryControlValues() {
            localStorage.setItem('inventoryControlValues', JSON.stringify(inventoryControlValues));
        }
        
        const uoms = ['PC', 'BOX', 'PLT', 'KG', 'LBS', 'M', 'CM', 'IN', 'FT', 'G', 'LB'];
        const itemClasses = ['GENERAL', 'FOOD', 'NON-FOOD', 'FROZEN'];
        const companies = ['DCB', 'DCI', 'DMR', 'DCS', 'DCJ', 'DCK', 'DCM', 'DCT'];
        const inspectionUms = ['PC', 'PCK', 'PCK-PLT'];
        const lotTemplates = ['Expiry Date', 'Manufacturing Date', 'Packing/Manufacturing Date'];
        const serialTemplates = ['Standard', 'Custom 1', 'Custom 2'];
        const shippingBOMOptions = [
            { value: 'create_work_order', label: 'Create work order for rejected quantity' },
            { value: 'add_bom_components', label: 'Add BOM components as shipment details' },
            { value: 'none', label: 'None' },
        ];
        
        const longRuleList = Array.from({ length: 50 }, (_, i) => `RULE-${i + 1}`);
        const allocationRules = [
            'A-DCB.COOKFOOD', 'A-DCB.DAILYDAIRY', 'A-DCB.EGGS', 'A-DCB.EXP EMPTIES',
            'A-DCB.EXPENSE', 'A-DCB.EXT.DRY', 'A-DCB.FASHION', 'A-DCB.FD.PICK',
            ...Array.from({length: 20}, (_, i) => `A-DCB.RULE${i+1}`),
        ];
        const locatingRules = [
            'L-DAB.FASHION FACE', 'L-DCB.AISLE 31.61', 'L-DCB.AISLE 32.62', 'L-DCB.AISLE 33.63',
            'L-DCB.AISLE 34.64', 'L-DCB.AISLE 35-39', 'L-DCB.AISLE88 CIGARETTE', 'L-DCB.CFLOW.LT2',
            ...Array.from({length: 20}, (_, i) => `L-DCB.RULE${i+1}`),
        ];

        const packingClasses = ['Default Packing Class', 'CFLOWFD', 'CFLOWLT2FACE', 'CFLOWNF', 'CFLOW14', 'CFLOW15'];
        const storageTemplates = ['PC-PCK', 'PC-PCK-PLT', 'KG', 'PC', 'PLT'];
        const countryList = [
            {code: 'ID', name: 'Indonesia'}, {code: 'CN', name: 'China'}, {code: 'US', name: 'United States'}
        ];
        const netCostOptions = ['NONE', 'C', 'N'];
        const categoryList = [
            'A - LADIES', 'A2 - YOUNG', 'A21 - T-SHIRT', 'A21A03 - LONG T-SHIRT', 'A21A03B', 
            'PC', 'A1', 'B - MENS', 'B3 - SHIRTS', 'C - CHILDREN', 'D - HOMEWARE'
        ];
        
        // Seeding data
        function seedItemData() {
            if (items.length === 0) {
                const dummyData = [
                    {
                        id: 'ITM000001',
                        company: 'DCB',
                        itemCode: '000000002077_1', 
                        description: '1B RM2003 BO TS SLR01MG LONG T-SHIRT RM2', 
                        inactive: false,
                        inventoryTracking: true,
                        itemTemplate: '',
                        
                        inboundShelfLife: '365D', 
                        promoItem: 'N',
                        containerType: 'PALLET',
                        tiHi: '8 x 5',
                        primarySupplier: 'SUP001',
                        mfgExpDate: 'Mfg',
                        shelfLife: 730,
                        outboundShelfLife: '180D',

                        immediateEligible: true,
                        immediateLocatingRule: 'L-DAB.FASHION FACE',
                        inboundQcStatus: 'Active', // Read-only status
                        
                        cost: 125000.00000,
                        listPrice: 150000.00000,
                        netPrice: 135000.00000,
                        companyPrefix: '12345',
                        itemReference: 'ABC-123',
                        cageCode: 'CAGE-123',
                        gs1GtinEnabled: true,
                        gs1Type: '01AI',
                        eqValue: 1,
                        division: 'FASHION',
                        department: 'TSHIRT',
                        itemColor: 'MG',
                        itemStyle: 'LONG',
                        shippingBOM: 'add_bom_components',
                        
                        char2a: 'Value A',
                        char2b: 'Value B',
                        udf: { 
                            udf1: 'UDF1', udf2: 'UDF2', udf3: 'UDF3', udf4: 'UDF4', 
                            udf5: '', udf6: '', udf7: '', udf8: '' 
                        },
                        
                        allocationRule: 'A-DCB.FASHION',
                        locatingRule: 'L-DAB.FASHION FACE',
                        nmfcCode: 'NMFC-123',
                        itemClass: 'GENERAL',
                        packingClass: 'CFLOWLT2FACE',
                        storageTemplate: 'PC-PCK',

                        catchWeightRequired: false,
                        lotControlled: true,
                        lotTemplate: 'Expiry Date',
                        lotDaysToExpire: 30,
                        serialControlled: true,
                        serialInbound: false,
                        serialInventory: true,
                        serialOutbound: true,
                        serialTemplate: 'Standard',
                        
                        inboundEligible: true,
                        computeQtyAs: 'AMOUNT',
                        inspectionQty: 10.00,
                        inspectionUm: 'PC',
                        qcLocatingRule: 'L-DAB.FASHION FACE',

                        webImage: 'http://example.com/image.jpg',
                        webThumb: 'http://example.com/thumb.jpg',
                        longDescription: 'Long description for the item goes here.',
                        availableForWebOrder: true,
                        
                        alternateItem: 'ALT-ITEM-1',
                        substituteItem: 'SUB-ITEM-1',
                        substituteList: [
                            { code: 'SUB-A', description: 'Substitute Item A' },
                            { code: 'SUB-B', description: 'Substitute Item B' },
                        ],
                        
                        preferenceCriterion: true,
                        harmonizedCode: 'HS-12345',
                        harmonizedUploaded: true,
                        countryOfOrigin: 'CN',
                        netCost: 'C',
                        countries: [{ code: 'CN', name: 'China' }, { code: 'ID', name: 'Indonesia' }, { code: 'US', name: 'United States' }],
                        
                        categories: {
                            1: 'A - LADIES', 2: 'A2 - YOUNG', 3: 'A21 - T-SHIRT', 4: '', 5: '',
                            6: '', 7: '', 8: '', 9: '', 10: ''
                        },

                        updatedAt: Date.now() 
                    },
                ];
                items = dummyData;
                localStorage.setItem('items', JSON.stringify(items));
            }
        }
        
        function saveItems() {
            localStorage.setItem('items', JSON.stringify(items));
        }
        function saveItemCrossReferences() {
            localStorage.setItem('itemCrossReferences', JSON.stringify(itemCrossReferences));
        }
        
        // --- MODAL AND UI SETUP ---
        const createModal = (id, sizeClass = 'w-[min(1200px,95vw)]') => {
            const modal = document.createElement('div');
            modal.id = id;
            modal.className = 'hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30';
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('role', 'dialog');
            modal.innerHTML = `
                <div class="modal-content ${sizeClass} bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[90vh] opacity-0 scale-95 transition-all">
                    <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                        <h3 id="${id}-title" class="text-lg font-semibold text-wise-dark-gray"></h3>
                    </div>
                    <div id="${id}-body" class="p-6 overflow-y-auto"></div>
                    <div id="${id}-footer" class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"></div>
                </div>
            `;
            document.body.appendChild(modal);
            return modal;
        };

        const showModal = (id) => {
            const modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                }
                modal.querySelector('.modal-content').focus();
            }, 10);
        };
        
        // --- UTILITY FUNCTIONS FOR STANDARD UI ---

        /**
         * Renders a standard list header with a "Create New" button and a search input.
         * @param {string} createLabel - Label for the create button.
         * @param {string} onCreate - The JS function call for the create button.
         * @param {string} searchId - The ID for the search input.
         * @param {string} searchPlaceholder - Placeholder text for the search input.
         * @param {string} onSearch - The JS function call for the search input's oninput event.
         * @returns {string} The HTML string for the header.
         */
        const renderStandardListHeader = ({ createLabel, onCreate, searchId, searchPlaceholder, onSearch }) => `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="${onCreate}">${createLabel}</button>
      <div class="grow"></div>
      <div class="relative">
        <input id="${searchId}" type="text" placeholder="${searchPlaceholder}" oninput="${onSearch}(this.value)" class="input w-full sm:w-72 pl-10" />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
`;


        /**
         * Renders a standard modal footer with Cancel and OK buttons.
         * @param {string} cancelOnclick - The JS function call for the cancel button.
         * @param {string} submitFormId - The ID of the form to be submitted.
         * @param {string} submitLabel - Label for the submit button (default: 'OK').
         * @returns {string} The HTML string for the footer.
         */
        // TAMBAHKAN parameter 'submitButtonId'
        const renderStandardModalFooter = ({ cancelOnclick, submitFormId, submitLabel = 'OK', submitButtonId = '' }) => `
            <div class="px-6 py-4 border-t flex justify-end gap-3">
                <button type="button" class="btn" onclick="${cancelOnclick}">Cancel</button>
                <button type="submit" form="${submitFormId}" ${submitButtonId ? `id="${submitButtonId}"` : ''} class="btn btn-primary">${submitLabel}</button>
            </div>
        `;

        // --- ITEM MODAL FUNCTIONS ---
        createModal('item-form-modal');
        
        window.showItemForm = (mode, id = null) => {
    const modal = document.getElementById('item-form-modal');
    const title = document.getElementById('item-form-modal-title');
    const body = document.getElementById('item-form-modal-body');
    const footer = document.getElementById('item-form-modal-footer');
    
    // Render the form HTML inside the modal body
    body.innerHTML = `
        <form id="item-form" class="h-full" data-mode="${mode}">
            <div role="tablist" id="item-tab-list" class="border-b mb-4 flex flex-wrap gap-4 text-sm font-medium w-full justify-between">
            <button type="button" role="tab" data-tab="item-gen-tab" class="tab-active">General</button>
                <button type="button" role="tab" data-tab="item-char1-tab" class="tab">Item char(1)</button>
                <button type="button" role="tab" data-tab="item-char2-tab" class="tab">Item char(2)</button>
                <button type="button" role="tab" data-tab="item-handling1-tab" class="tab">Handling(1)</button>
                <button type="button" role="tab" data-tab="item-handling2-tab" class="tab">Handling(2)</button>
                <button type="button" role="tab" data-tab="item-internet-tab" class="tab">Internet information</button>
                <button type="button" role="tab" data-tab="item-subst-tab" class="tab">Alternate/Substitute</button>
                <button type="button" role="tab" data-tab="item-int-tab" class="tab">International</button>
                <button type="button" role="tab" data-tab="item-cats-tab" class="tab">Categories</button>
                <button type="button" role="tab" data-tab="item-udf-tab" class="tab">User defined data</button>
            </div>
            <div id="item-form-scroll-container" class="max-h-[70vh] overflow-y-auto pr-1">
                <div id="item-gen-tab" role="tabpanel" data-pane="item-gen-tab"></div>
                <div id="item-char1-tab" role="tabpanel" data-pane="item-char1-tab" class="hidden"></div>
                <div id="item-char2-tab" role="tabpanel" data-pane="item-char2-tab" class="hidden"></div>
                <div id="item-handling1-tab" role="tabpanel" data-pane="item-handling1-tab" class="hidden"></div>
                <div id="item-handling2-tab" role="tabpanel" data-pane="item-handling2-tab" class="hidden"></div>
                <div id="item-internet-tab" role="tabpanel" data-pane="item-internet-tab" class="hidden"></div>
                <div id="item-subst-tab" role="tabpanel" data-pane="item-subst-tab" class="hidden"></div>
                <div id="item-int-tab" role="tabpanel" data-pane="item-int-tab" class="hidden"></div>
                <div id="item-cats-tab" role="tabpanel" data-pane="item-cats-tab" class="hidden"></div>
                <div id="item-udf-tab" role="tabpanel" data-pane="item-udf-tab" class="hidden"></div>
            </div>
            <input type="hidden" id="item-id" name="id">
        </form>
    `;
    
    // Use the new standard footer function
    footer.innerHTML = renderStandardModalFooter({
        cancelOnclick: "closeModal('item-form-modal')",
        submitFormId: "item-form"
    });
    
    // Render content per tab
    renderTabGeneral(mode);
    renderTabChar1(mode);
    renderTabChar2(mode);
    renderTabHandling1(mode);
    renderTabHandling2(mode);
    renderTabInternet(mode);
    renderTabAlternate(mode);
    renderTabInternational(mode);
    renderTabCategories(mode);
    renderTabUdf(mode);

    // Set modal title and footer buttons
    title.textContent = mode === 'create' ? 'Create New Item' : (mode === 'edit' ? 'Edit Item' : 'View Item');
    
    setupTabSwitching('item-form-modal');
    
    let item = {};
    if (mode !== 'create' && id) {
        item = items.find(i => i.id === id);
        if (item) {
            fillItemForm(item);
        }
    } else {
         applyStateFromForm();
    }
    
    // Add event listeners for dynamic states
    document.getElementById('item-form').addEventListener('change', (e) => {
        if (e.target.name === 'lotControlled' || e.target.name === 'serialControlled' || e.target.name === 'gs1GtinEnabled' || e.target.name === 'computeQtyAs') {
            applyStateFromForm();
        }
        // Sinkronisasi Allocation/Locating
        if (e.target.id === 'item-allocation-rule' || e.target.id === 'item-locating-rule') {
             syncAllocationLocating(e.target.id, e.target.value);
        }
        const longDropdownInputs = ['item-allocation-rule-long', 'item-locating-rule-long', 'item-qc-locating-rule-long'];
        if(longDropdownInputs.includes(e.target.id)) {
            if (e.target.id === 'item-allocation-rule-long' || e.target.id === 'item-locating-rule-long') {
               syncAllocationLocating(e.target.id, e.target.value);
            }
        }
    });
    
    const form = document.getElementById('item-form');
    if(form) {
        renderSubstituteTable(item?.substituteList || []);
        document.getElementById('add-substitute')?.addEventListener('click', addSubstituteItem);
        document.getElementById('delete-substitute')?.addEventListener('click', deleteSubstituteItem);
        document.getElementById('up-substitute')?.addEventListener('click', moveSubstituteItemUp);
        document.getElementById('down-substitute')?.addEventListener('click', moveSubstituteItemDown);
        document.getElementById('select-all-subs')?.addEventListener('change', (e) => {
            document.querySelectorAll('#item-substitute-table .subst-select-row')
                .forEach(cb => cb.checked = e.target.checked);
        });
        
        form.addEventListener('submit', handleItemSubmit);
    }

    showModal('item-form-modal');
    
    // Initialize custom long dropdowns
    makeLongDropdown('item-company', companies, item.company);
    makeLongDropdown('item-allocation-rule-long', allocationRules, item.allocationRule);
    makeLongDropdown('item-locating-rule-long', locatingRules, item.locatingRule);
    makeLongDropdown('item-packing-class', packingClasses, item.packingClass);
    makeLongDropdown('item-storage-template', storageTemplates, item.storageTemplate);
    makeLongDropdown('item-immediate-locating-rule-long', locatingRules, item.immediateLocatingRule);
    makeLongDropdown('item-qc-locating-rule-long', locatingRules, item.qcLocatingRule);
    makeLongDropdown('item-lot-template', lotTemplates, item.lotTemplate);
    makeLongDropdown('item-serial-template', serialTemplates, item.serialTemplate);
    makeLongDropdown('item-country-origin', countryList.map(c => ({ value: c.code, label: c.name })), item.countryOfOrigin);
};
        
        // Renderers per tab
        const renderTabGeneral = (mode) => {
            const container = document.getElementById('item-gen-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">General</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-1">
                    <label for="item-template" class="block text-sm mb-1">Item template:</label>
                    <input type="text" id="item-template" name="itemTemplate" class="input bg-gray-100 cursor-not-allowed" value="PC-PCK-PLT" readonly>
                </div>
                <div class="md:col-span-1">
                    <label for="item-company" class="block text-sm mb-1">Company:</label>
                    <select id="item-company" name="company" class="select" required ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div class="md:col-span-2">
                    <label for="item-code" class="block text-sm mb-1">Item:</label>
                    <input type="text" id="item-code" name="itemCode" class="input" required ${mode === 'view' || mode === 'edit' ? 'readonly' : ''}>
                </div>
                <div class="md:col-span-4">
                    <label for="item-description" class="block text-sm mb-1">Description:</label>
                    <input type="text" id="item-description" name="description" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <div class="md:col-span-4 flex gap-4 mt-2 mb-6">
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" id="item-inactive" name="inactive" ${mode === 'view' ? 'disabled' : ''}> Inactive
                </label>
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" id="item-inventory-tracking" name="inventoryTracking" ${mode === 'view' ? 'disabled' : ''}> Inventory tracking
                </label>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Logistics Data</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label for="item-inbound-shelf-life" class="block text-sm mb-1">Inbound shelf life:</label>
                    <input type="text" id="item-inbound-shelf-life" name="inboundShelfLife" class="input" placeholder="e.g., 365D" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-promo-item" class="block text-sm mb-1">Promo item:</label>
                    <select id="item-promo-item" name="promoItem" class="select" ${mode === 'view' ? 'disabled' : ''}>
                        <option value="N">N</option>
                        <option value="Y">Y</option>
                    </select>
                </div>
                <div>
                    <label for="item-ti-hi" class="block text-sm mb-1">TI x HI:</label>
                    <input type="text" id="item-ti-hi" name="tiHi" class="input" placeholder="e.g., 0 x 0" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-primary-supplier" class="block text-sm mb-1">Primary supplier:</label>
                    <input type="text" id="item-primary-supplier" name="primarySupplier" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-mfg-exp-date" class="block text-sm mb-1">Mfg / Exp Date:</label>
                    <input type="text" id="item-mfg-exp-date" name="mfgExpDate" class="input" placeholder="e.g., Mfg" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-shelf-life" class="block text-sm mb-1">Shelf life:</label>
                    <input type="number" step="0.00001" id="item-shelf-life" name="shelfLife" class="input" value="0.00000" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-outbound-shelf-life" class="block text-sm mb-1">Outbound shelf life:</label>
                    <input type="text" id="item-outbound-shelf-life" name="outboundShelfLife" class="input" placeholder="e.g., 0.00000" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                 <div class="md:col-span-1">
                    <label for="item-container-type" class="block text-sm mb-1">Container Type:</label>
                    <input type="text" id="item-container-type" name="containerType" class="input" placeholder="e.g., PALLET" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4 mt-6">Handling Rules</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                 <div class="md:col-span-2">
                    <label for="item-allocation-rule-long" class="block text-sm mb-1">Allocation rule:</label>
                    <select id="item-allocation-rule-long" name="allocationRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div class="md:col-span-2">
                    <label for="item-locating-rule-long" class="block text-sm mb-1">Locating rule:</label>
                    <select id="item-locating-rule-long" name="locatingRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4 mt-6">Immediate needs</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-immediate-eligible" name="immediateEligible" ${mode === 'view' ? 'disabled' : ''}> Eligible
                    </label>
                </div>
                <div class="md:col-span-3">
                    <label for="item-immediate-locating-rule-long" class="block text-sm mb-1">Locating rule:</label>
                    <select id="item-immediate-locating-rule-long" name="immediateLocatingRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Inbound QC</h4>
            <div class="flex items-center gap-2 text-sm">
                Status: <span id="inbound-qc-status" class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Inactive</span>
            </div>
            `;
        };

        const renderTabChar1 = (mode) => {
            const container = document.getElementById('item-char1-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Values</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label for="item-cost" class="block text-sm mb-1">Cost:</label>
                    <input type="number" step="0.00001" id="item-cost" name="cost" class="input" value="0.00000" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-list-price" class="block text-sm mb-1">List price:</label>
                    <input type="number" step="0.00001" id="item-list-price" name="listPrice" class="input" value="0.00000" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-net-price" class="block text-sm mb-1">Net price:</label>
                    <input type="number" step="0.00001" id="item-net-price" name="netPrice" class="input" value="0.00000" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">EPC</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label for="item-company-prefix" class="block text-sm mb-1">Company prefix:</label>
                    <input type="text" id="item-company-prefix" name="companyPrefix" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-reference" class="block text-sm mb-1">Item reference:</label>
                    <input type="text" id="item-reference" name="itemReference" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-cage-code" class="block text-sm mb-1">CAGE code:</label>
                    <input type="text" id="item-cage-code" name="cageCode" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">GS1</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-gs1-gtin-enabled" name="gs1GtinEnabled" ${mode === 'view' ? 'disabled' : ''}> GTIN enabled
                    </label>
                </div>
                <div class="flex items-center space-x-4 md:col-span-3">
                   <div class="flex items-center">
                       <input type="radio" id="gs1-type-01ai" name="gs1Type" value="01AI" class="custom-radio" ${mode === 'view' ? 'disabled' : ''}>
                       <label for="gs1-type-01ai" class="ml-2 text-sm text-wise-dark-gray">01 AI</label>
                   </div>
                   <div class="flex items-center">
                       <input type="radio" id="gs1-type-02ai" name="gs1Type" value="02AI" class="custom-radio" ${mode === 'view' ? 'disabled' : ''}>
                       <label for="gs1-type-02ai" class="ml-2 text-sm text-wise-dark-gray">02 AI</label>
                   </div>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Item Characteristics</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label for="item-eq-value" class="block text-sm mb-1">EQ Value:</label>
                    <input type="number" id="item-eq-value" name="eqValue" class="input" value="0" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-division" class="block text-sm mb-1">Division:</label>
                    <input type="text" id="item-division" name="division" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-color" class="block text-sm mb-1">Item color:</label>
                    <input type="text" id="item-color" name="itemColor" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-department" class="block text-sm mb-1">Department:</label>
                    <input type="text" id="item-department" name="department" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-style" class="block text-sm mb-1">Item style:</label>
                    <input type="text" id="item-style" name="itemStyle" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Shipping BOM Action</h4>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                ${shippingBOMOptions.map(option => `
                    <div class="flex items-center">
                        <input type="radio" id="shipping-bom-${option.value}" name="shippingBOM" value="${option.value}" class="custom-radio" ${mode === 'view' ? 'disabled' : ''}>
                        <label for="shipping-bom-${option.value}" class="ml-2 text-sm text-wise-dark-gray">${option.label}</label>
                    </div>
                `).join('')}
             </div>
            `;
        };

        const renderTabChar2 = (mode) => {
            const container = document.getElementById('item-char2-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">User defined data</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="item-char2a" class="block text-sm mb-1">Char 2A:</label>
                    <input type="text" id="item-char2a" name="char2a" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-char2b" class="block text-sm mb-1">Char 2B:</label>
                    <input type="text" id="item-char2b" name="char2b" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${Array.from({ length: 8 }, (_, i) => `
                     <div>
                        <label for="item-udf${i + 1}" class="block text-sm mb-1">UDF${i + 1}:</label>
                        <input id="item-udf${i + 1}" name="udf${i + 1}" type="text" class="input" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                `).join('')}
            </div>
            `;
        };

        const renderTabHandling1 = (mode) => {
             const container = document.getElementById('item-handling1-tab');
             container.innerHTML = `
                <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Handling(1)</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div class="md:col-span-2">
                        <label for="item-allocation-rule" class="block text-sm mb-1">Allocation Rule:</label>
                        <select id="item-allocation-rule" name="allocationRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="item-locating-rule" class="block text-sm mb-1">Locating Rule:</label>
                        <select id="item-locating-rule" name="locatingRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="item-nmfc-code" class="block text-sm mb-1">NMFC code:</label>
                        <input type="text" id="item-nmfc-code" name="nmfcCode" class="input" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                    <div class="md:col-span-2">
                        <label for="item-class" class="block text-sm mb-1">Item class:</label>
                        <select id="item-class" name="itemClass" class="select" ${mode === 'view' ? 'disabled' : ''}>
                            <option value="">-- Select --</option>
                            ${itemClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="item-packing-class" class="block text-sm mb-1">Packing class:</label>
                        <select id="item-packing-class" name="packingClass" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="item-storage-template" class="block text-sm mb-1">Storage template:</label>
                        <select id="item-storage-template" name="storageTemplate" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                     </div>
                     <div class="md:col-span-4 mt-2">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="item-inventory-tracking-h1" name="inventoryTracking" ${mode === 'view' ? 'disabled' : ''}> Inventory Tracking
                        </label>
                    </div>
                </div>
             `;
        };

        const renderTabHandling2 = (mode) => {
            const container = document.getElementById('item-handling2-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Inbound QC</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-inbound-eligible" name="inboundEligible" ${mode === 'view' ? 'disabled' : ''}> Eligible
                    </label>
                </div>
                <div class="md:col-span-1 flex flex-col justify-center">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="radio" id="item-compute-qty-amount" name="computeQtyAs" value="AMOUNT" class="custom-radio" ${mode === 'view' ? 'disabled' : ''}>
                        <span class="ml-2">Amount</span>
                    </label>
                    <label class="flex items-center gap-2 text-sm mt-1">
                        <input type="radio" id="item-compute-qty-percentage" name="computeQtyAs" value="PERCENTAGE" class="custom-radio" ${mode === 'view' ? 'disabled' : ''}>
                        <span class="ml-2">Percentage</span>
                    </label>
                </div>
                <div>
                    <label for="item-inspection-qty" class="block text-sm mb-1">Inspection Qty:</label>
                    <input type="number" step="0.01" id="item-inspection-qty" name="inspectionQty" class="input" value="0.00" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-inspection-um" class="block text-sm mb-1">UM:</label>
                    <select id="item-inspection-um" name="inspectionUm" class="select" ${mode === 'view' ? 'disabled' : ''}>
                        <option value="">-- Pilih --</option>
                        ${inspectionUms.map(um => `<option value="${um}">${um}</option>`).join('')}
                    </select>
                </div>
                <div class="md:col-span-4">
                    <label for="item-qc-locating-rule-long" class="block text-sm mb-1">Locating rule:</label>
                    <select id="item-qc-locating-rule-long" name="qcLocatingRule" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div class="md:col-span-4 flex items-center gap-2 text-sm">
                    <input type="checkbox" id="item-catch-weight-required" name="catchWeightRequired" ${mode === 'view' ? 'disabled' : ''}> Catch Weight Required
                </label>
                </div>
            </div>
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4 mt-6">Lot & Serial</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-lot-controlled" name="lotControlled" ${mode === 'view' ? 'disabled' : ''}> Lot controlled
                    </label>
                </div>
                <div class="md:col-span-1">
                    <label for="item-lot-template" class="block text-sm mb-1">Lot template:</label>
                    <select id="item-lot-template" name="lotTemplate" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div class="md:col-span-1">
                    <label for="item-lot-days" class="block text-sm mb-1">Days to expire:</label>
                    <input type="number" id="item-lot-days" name="lotDaysToExpire" class="input" value="0" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div class="md:col-span-1"></div>
                <div class="md:col-span-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-serial-controlled" name="serialControlled" ${mode === 'view' ? 'disabled' : ''}> Serial controlled
                    </label>
                </div>
                <div class="md:col-span-1">
                    <label for="item-serial-template" class="block text-sm mb-1">Template:</label>
                    <select id="item-serial-template" name="serialTemplate" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div class="md:col-span-2 grid grid-cols-3 gap-4" id="serial-flags-container">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-serial-inbound" name="serialInbound" ${mode === 'view' ? 'disabled' : ''}> Inbound
                    </label>
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-serial-inventory" name="serialInventory" ${mode === 'view' ? 'disabled' : ''}> Inventory
                    </label>
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-serial-outbound" name="serialOutbound" ${mode === 'view' ? 'disabled' : ''}> Outbound
                    </label>
                </div>
            </div>
            `;
        };

        const renderTabInternet = (mode) => {
             const container = document.getElementById('item-internet-tab');
             container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Internet Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="item-web-image" class="block text-sm mb-1">Web image:</label>
                    <input type="text" id="item-web-image" name="webImage" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-web-thumb" class="block text-sm mb-1">Web thumbnail:</label>
                    <input type="text" id="item-web-thumb" name="webThumb" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div class="md:col-span-2">
                    <label for="item-long-description" class="block text-sm mb-1">Long description:</label>
                    <textarea id="item-long-description" name="longDescription" class="input" rows="3" ${mode === 'view' ? 'readonly' : ''}></textarea>
                </div>
                <div class="md:col-span-2">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-available-for-web-order" name="availableForWebOrder" ${mode === 'view' ? 'disabled' : ''}> Available for web order
                    </label>
                </div>
            </div>
             `;
        };
        
        const renderTabAlternate = (mode) => {
            const container = document.getElementById('item-subst-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Alternate / Substitute</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="item-alternate" class="block text-sm mb-1">Alternate item:</label>
                    <input type="text" id="item-alternate" name="alternateItem" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label for="item-substitute" class="block text-sm mb-1">Substitute item:</label>
                    <input type="text" id="item-substitute" name="substituteItem" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
            </div>
            
            <div class="flex justify-between items-center mb-2">
                <h5 class="font-medium text-wise-dark-gray">Substitute List</h5>
                
                <div class="flex gap-2">
                    <button type="button" class="btn btn-sm" onclick="addSubstituteItem()" ${mode === 'view' ? 'disabled' : ''}>Add</button>
                    <button type="button" class="btn btn-sm" onclick="deleteSubstituteItem()" ${mode === 'view' ? 'disabled' : ''}>Delete</button>
                    <button type="button" class="btn btn-sm" onclick="moveSubstituteItemUp()" ${mode === 'view' ? 'disabled' : ''}>Up</button>
                    <button type="button" class="btn btn-sm" onclick="moveSubstituteItemDown()" ${mode === 'view' ? 'disabled' : ''}>Down</button>
                </div>
                </div>
            
            <div class="border rounded-md max-h-[200px] overflow-y-auto">
                <table id="item-substitute-table" class="min-w-full text-sm">
                    <thead>
                        <tr class="bg-gray-100 sticky top-0">
                            <th class="py-2 px-4 text-left w-12"><input type="checkbox" id="select-all-subs"></th>
                            <th class="py-2 px-4 text-left">Code</th>
                            <th class="py-2 px-4 text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                </table>
                 <div id="substitute-empty-state" class="text-center py-8 text-gray-400 hidden">
                    <p>No substitute items added.</p>
                </div>
            </div>
            `;
        };
        
        const renderTabInternational = (mode) => {
            const container = document.getElementById('item-int-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">International</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="md:col-span-2">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-preference-criterion" name="preferenceCriterion" ${mode === 'view' ? 'disabled' : ''}> Preference Criterion
                    </label>
                </div>
                <div>
                    <label for="item-harmonized-code" class="block text-sm mb-1">Harmonized code:</label>
                    <input type="text" id="item-harmonized-code" name="harmonizedCode" class="input" ${mode === 'view' ? 'readonly' : ''}>
                </div>
                <div>
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" id="item-harmonized-uploaded" name="harmonizedUploaded" ${mode === 'view' ? 'disabled' : ''}> Uploaded
                    </label>
                </div>
                <div>
                    <label for="item-country-origin" class="block text-sm mb-1">Country of origin:</label>
                    <select id="item-country-origin" name="countryOfOrigin" class="select" ${mode === 'view' ? 'disabled' : ''}></select>
                </div>
                <div>
                    <label for="item-net-cost" class="block text-sm mb-1">Net cost:</label>
                    <select id="item-net-cost" name="netCost" class="select" ${mode === 'view' ? 'disabled' : ''}>
                         ${netCostOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="mt-4">
                <h5 class="font-medium text-wise-dark-gray mb-2">Countries</h5>
                <div class="border rounded-md max-h-[150px] overflow-y-auto">
                    <table id="item-countries-table" class="min-w-full text-sm">
                        <thead>
                            <tr class="bg-gray-100 sticky top-0">
                                <th class="py-2 px-4 text-left">Code</th>
                                <th class="py-2 px-4 text-left">Name</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                 <div id="countries-empty-state" class="text-center py-4 text-gray-400 hidden">
                     <span class="text-3xl">🌍</span><br>Tidak ada negara terkait.
                </div>
            </div>
            `;
        };

        const renderTabCategories = (mode) => {
            const container = document.getElementById('item-cats-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">Categories</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${Array.from({ length: 10 }, (_, i) => `
                    <div>
                        <label for="item-cat-${i + 1}" class="block text-sm mb-1">Category ${i + 1}:</label>
                        <input type="text" id="item-cat-${i + 1}" name="categories[${i + 1}]" class="input" list="category-list" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                `).join('')}
                <datalist id="category-list">
                    ${categoryList.map(c => `<option value="${c}">`).join('')}
                </datalist>
            </div>
            `;
        };

        const renderTabUdf = (mode) => {
            const container = document.getElementById('item-udf-tab');
            container.innerHTML = `
            <h4 class="text-md font-semibold text-wise-dark-gray mb-4">User defined data</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${Array.from({ length: 8 }, (_, i) => `
                     <div>
                        <label for="item-udf${i + 1}" class="block text-sm mb-1">UDF${i + 1}:</label>
                        <input id="item-udf${i + 1}" name="udf${i + 1}" type="text" class="input" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                `).join('')}
            </div>
            `;
        };
        
        const syncAllocationLocating = (sourceId, value) => {
            const rules = sourceId === 'item-allocation-rule-long' ? allocationRules : locatingRules;
            const targetId = sourceId === 'item-allocation-rule-long' ? 'item-allocation-rule' : 'item-locating-rule';
            const sourceEl = document.getElementById(sourceId);
            const targetEl = document.getElementById(targetId);
            
            if (targetEl) {
                 const newOption = `<option value="${value}">${value}</option>`;
                 if (!rules.includes(value) && value) {
                     if (!targetEl.querySelector(`option[value="${value}"]`)) {
                         targetEl.insertAdjacentHTML('beforeend', newOption);
                     }
                 }
                 targetEl.value = value;
            }
        };

        const applyStateFromForm = () => {
             const form = document.getElementById('item-form');
             if (!form) return;
             const mode = form.dataset.mode;
             const isViewMode = mode === 'view';

             // GS1 state
             const gs1Enabled = form.querySelector('[name="gs1GtinEnabled"]')?.checked;
             const gs1Radios = form.querySelectorAll('input[name="gs1Type"]');
             gs1Radios.forEach(radio => {
                 radio.disabled = isViewMode || !gs1Enabled;
             });

             // Lot state
             const lotControlled = form.querySelector('[name="lotControlled"]')?.checked;
             const lotTemplate = form.querySelector('[name="lotTemplate-input"]');
             const lotDays = form.querySelector('[name="lotDaysToExpire"]');
             if (lotTemplate) lotTemplate.disabled = isViewMode || !lotControlled;
             if (lotDays) lotDays.readOnly = isViewMode || !lotControlled;

             // Serial state
             const serialControlled = form.querySelector('[name="serialControlled"]')?.checked;
             const serialTemplate = form.querySelector('[name="serialTemplate-input"]');
             const serialFlags = form.querySelectorAll('#serial-flags-container input[type="checkbox"]');
             if (serialTemplate) {
                 serialTemplate.disabled = isViewMode || !serialControlled;
                 if (!serialControlled) {
                     const inputEl = document.getElementById('item-serial-template-input');
                     if(inputEl) inputEl.value = '';
                 }
             }
             serialFlags.forEach(flag => flag.disabled = isViewMode || !serialControlled);
             if (!serialControlled) {
                 serialFlags.forEach(flag => flag.checked = false);
             }

             // Inbound QC status (read-only)
             const inboundEligible = form.querySelector('[name="inboundEligible"]')?.checked;
             const qcStatusEl = document.getElementById('inbound-qc-status');
             if (qcStatusEl) {
                 qcStatusEl.textContent = inboundEligible ? 'Aktif' : 'Tidak Aktif';
                 qcStatusEl.className = `px-2 py-1 rounded-full text-xs font-semibold ${inboundEligible ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'}`;
             }

             // Inbound QC fields
             const computeQtyAs = form.querySelector('input[name="computeQtyAs"]:checked')?.value;
             const inspectionQty = form.querySelector('[name="inspectionQty"]');
             if (inspectionQty) {
                 if (computeQtyAs === 'PERCENTAGE') {
                     inspectionQty.placeholder = '0 - 100';
                 } else {
                     inspectionQty.placeholder = '';
                 }
             }
        };

        const fillItemForm = (item) => {
            const form = document.getElementById('item-form');
            if (!form) return;
            form['id'].value = item.id;
            
            // Text/Checkbox inputs
            const fields = ['itemTemplate', 'itemCode', 'description', 'inactive', 'inventoryTracking',
                'inboundShelfLife', 'promoItem', 'containerType', 'tiHi', 'primarySupplier', 'mfgExpDate', 
                'shelfLife', 'outboundShelfLife', 'immediateEligible', 'inboundEligible', 'catchWeightRequired',
                'lotControlled', 'lotDaysToExpire', 'serialControlled', 'serialInbound', 'serialInventory', 'serialOutbound',
                'cost', 'listPrice', 'netPrice', 'companyPrefix', 'itemReference', 'cageCode', 'gs1GtinEnabled',
                'eqValue', 'division', 'itemColor', 'department', 'itemStyle',
                'nmfcCode', 'webImage', 'webThumb', 'longDescription', 'availableForWebOrder',
                'alternateItem', 'substituteItem', 'preferenceCriterion', 'harmonizedCode', 'harmonizedUploaded'];

            fields.forEach(field => {
                const el = form.querySelector(`[name="${field}"]`);
                if (el) {
                    if (el.type === 'checkbox') {
                         el.checked = !!item[field];
                    } else if (el.type === 'number') {
                         el.value = item[field] || 0;
                    } else {
                         el.value = item[field] || '';
                    }
                }
            });

            // Radio buttons
            if (item.computeQtyAs) {
                const radio = form.querySelector(`input[name="computeQtyAs"][value="${item.computeQtyAs}"]`);
                if (radio) radio.checked = true;
            }
             if (item.gs1Type) {
                const radio = form.querySelector(`input[name="gs1Type"][value="${item.gs1Type}"]`);
                if (radio) radio.checked = true;
            }
             if (item.shippingBOM) {
                const radio = form.querySelector(`input[name="shippingBOM"][value="${item.shippingBOM}"]`);
                if (radio) radio.checked = true;
            }
            
            // Dropdowns (native & long)
            const nativeSelects = ['itemClass', 'inspectionUm', 'netCost'];
            nativeSelects.forEach(selId => {
                const el = document.getElementById(`item-${selId.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
                if (el) el.value = item[selId] || '';
            });

            const longDropdowns = ['company', 'allocationRule', 'locatingRule', 'immediateLocatingRule', 'qcLocatingRule', 
                                   'packingClass', 'storageTemplate', 'lotTemplate', 'serialTemplate', 'countryOfOrigin'];
            longDropdowns.forEach(field => {
                const inputEl = document.getElementById(`item-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`);
                const value = item[field] || '';
                if (inputEl) {
                    inputEl.value = value;
                    inputEl.dataset.value = value;
                }
            });

            // UDFs & Categories
            for (let i = 1; i <= 8; i++) {
                const udfInput = document.getElementById(`item-udf${i}`);
                if (udfInput) udfInput.value = item.udf[`udf${i}`] || '';
            }
            for (let i = 1; i <= 10; i++) {
                const catInput = document.getElementById(`item-cat-${i}`);
                if (catInput) catInput.value = item.categories[i] || '';
            }
            
            // Tables
            renderSubstituteTable(item.substituteList || []);
            renderCountriesTable(item.countries || []);

            // UI state
            applyStateFromForm();
        };

        window.renderSubstituteTable = (substitutes) => {
            const tbody = document.getElementById('item-substitute-table')?.querySelector('tbody');
            const emptyState = document.getElementById('substitute-empty-state');
            if (!tbody || !emptyState) return;
            
            tbody.innerHTML = '';
            if (substitutes.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            emptyState.classList.add('hidden');
            
            substitutes.forEach(sub => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-gray-200 hover:bg-gray-50';
                tr.innerHTML = `
                    <td class="py-2 px-4"><input type="checkbox" class="subst-select-row" value="${sub.code}"></td>
                    <td class="py-2 px-4">${sub.code}</td>
                    <td class="py-2 px-4">${sub.description}</td>
                `;
                tbody.appendChild(tr);
            });
        };

        window.addSubstituteItem = async () => {
            const confirmed = await showCustomConfirm('Add Substitute Item', 'This will open a lookup form. Add a dummy row for now?');
            if (!confirmed) return;

            const tbody = document.getElementById('item-substitute-table')?.querySelector('tbody');
            if (!tbody) return;

            const newItemCode = `SUB_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const newItemDesc = `New Substitute`;
            
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-200 hover:bg-gray-50';
            tr.innerHTML = `
                <td class="py-2 px-4"><input type="checkbox" class="subst-select-row" value="${newItemCode}"></td>
                <td class="py-2 px-4">${newItemCode}</td>
                <td class="py-2 px-4">${newItemDesc}</td>
            `;
            tbody.appendChild(tr);
            showToast('Dummy substitute item added to the list.');
            document.getElementById('substitute-empty-state').classList.add('hidden');
        };

        window.deleteSubstituteItem = async () => {
            const checked = document.querySelectorAll('#item-substitute-table .subst-select-row:checked');
            if (!checked.length) {
                showToast('Please select items to delete from the list.', 'error');
                return;
            }
            
            const confirmed = await showCustomConfirm('Confirm Deletion', `Delete ${checked.length} selected substitute item(s) from the list?`);
            if (!confirmed) return;

            checked.forEach(cb => cb.closest('tr').remove());
            showToast(`${checked.length} substitute item(s) have been deleted from the list.`);
            
            const tbody = document.getElementById('item-substitute-table')?.querySelector('tbody');
            if(tbody && tbody.rows.length === 0) {
                document.getElementById('substitute-empty-state').classList.remove('hidden');
            }
        };
        
        window.moveSubstituteItemUp = () => {
            const checked = document.querySelectorAll('#item-substitute-table .subst-select-row:checked');
            if (checked.length !== 1) {
                showToast('Please select only one row to move.', 'error');
                return;
            }
            const row = checked[0].closest('tr');
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                prevRow.before(row);
                showToast('Item moved up.');
            } else {
                showToast('Already at the top.', 'info');
            }
        };

        window.moveSubstituteItemDown = () => {
            const checked = document.querySelectorAll('#item-substitute-table .subst-select-row:checked');
            if (checked.length !== 1) {
                showToast('Please select only one row to move.', 'error');
                return;
            }
            const row = checked[0].closest('tr');
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                nextRow.after(row);
                showToast('Item moved down.');
            } else {
                showToast('Already at the bottom.', 'info');
            }
        };

        window.renderCountriesTable = (countries) => {
            const tbody = document.getElementById('item-countries-table')?.querySelector('tbody');
            const emptyState = document.getElementById('countries-empty-state');
            if (!tbody || !emptyState) return;
            
            tbody.innerHTML = '';
            if (countries.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            emptyState.classList.add('hidden');
            
            countries.forEach(country => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-gray-200 hover:bg-gray-50';
                tr.innerHTML = `<td class="py-2 px-4">${country.code}</td><td class="py-2 px-4">${country.name}</td>`;
                tbody.appendChild(tr);
            });
        };

        window.handleItemSubmit = async (event) => {
    event.preventDefault();
    // PERBAIKAN: Mengambil form berdasarkan ID, bukan dari event.target
    const form = document.getElementById('item-form'); 
    const mode = form.dataset.mode;
    const id = form['id'].value;

    if (!validateItemForm()) {
        showToast('Form not valid. Please fix the errors.', 'error');
        return;
    }

    const getLongDropdownValue = (id) => document.getElementById(id)?.value || '';

    const company = getLongDropdownValue('item-company-input');
    const allocationRule = getLongDropdownValue('item-allocation-rule-long-input');
    const locatingRule = getLongDropdownValue('item-locating-rule-long-input');
    const immediateLocatingRule = getLongDropdownValue('item-immediate-locating-rule-long-input');
    const qcLocatingRule = getLongDropdownValue('item-qc-locating-rule-long-input');
    const packingClass = getLongDropdownValue('item-packing-class-input');
    const storageTemplate = getLongDropdownValue('item-storage-template-input');
    const lotTemplate = getLongDropdownValue('item-lot-template-input');
    const serialTemplate = getLongDropdownValue('item-serial-template-input');
    const countryOfOrigin = getLongDropdownValue('item-country-origin-input');
    
    if (mode === 'create') {
        const isCodeExist = items.some(item => item.itemCode === form['itemCode'].value && item.company === company);
        if (isCodeExist) {
            showToast('Item with this code and company already exists.', 'error');
            return;
        }
    }
    
    const categories = {};
    for (let i = 1; i <= 10; i++) {
        categories[i] = form[`categories[${i}]`]?.value || '';
    }
    
    const udf = {};
    for (let i = 1; i <= 8; i++) {
        udf[`udf${i}`] = form[`udf${i}`]?.value || '';
    }
    
    const serialControlled = form['serialControlled']?.checked;
    
    const newItem = {
        id: id, 
        company: company,
        itemCode: form['itemCode'].value,
        description: form['description'].value,
        inactive: form['inactive'].checked,
        inventoryTracking: form['inventoryTracking'].checked, 
        inboundShelfLife: form['inboundShelfLife'].value || '',
        promoItem: form['promoItem'].value || 'N',
        containerType: form['containerType'].value || '', 
        tiHi: form['tiHi'].value || '0 x 0',
        primarySupplier: form['primarySupplier'].value || '',
        mfgExpDate: form['mfgExpDate'].value || '',
        shelfLife: parseFloat(form['shelfLife'].value) || 0,
        outboundShelfLife: form['outboundShelfLife'].value || '',
        immediateEligible: form['immediateEligible'].checked,
        immediateLocatingRule: immediateLocatingRule,
        cost: parseFloat(form['cost'].value) || 0,
        listPrice: parseFloat(form['listPrice'].value) || 0,
        netPrice: parseFloat(form['netPrice'].value) || 0,
        companyPrefix: form['companyPrefix'].value || '',
        itemReference: form['itemReference'].value || '',
        cageCode: form['cageCode'].value || '',
        gs1GtinEnabled: form['gs1GtinEnabled'].checked,
        gs1Type: form['gs1GtinEnabled'].checked ? form.querySelector('input[name="gs1Type"]:checked')?.value || '' : '',
        eqValue: parseInt(form['eqValue'].value) || 0,
        division: form['division'].value || '',
        itemColor: form['itemColor'].value || '',
        department: form['department'].value || '',
        itemStyle: form['itemStyle'].value || '',
        shippingBOM: form.querySelector('input[name="shippingBOM"]:checked')?.value || 'none',
        
        char2a: form['char2a'].value || '',
        char2b: form['char2b'].value || '',
        udf: udf,
        
        allocationRule: allocationRule,
        locatingRule: locatingRule,
        nmfcCode: form['nmfcCode'].value || '',
        itemClass: form['itemClass'].value || 'GENERAL',
        packingClass: packingClass,
        storageTemplate: storageTemplate,

        catchWeightRequired: form['catchWeightRequired'].checked,
        lotControlled: form['lotControlled'].checked,
        lotTemplate: form['lotControlled'].checked ? lotTemplate : '',
        lotDaysToExpire: form['lotControlled'].checked ? parseInt(form['lotDaysToExpire'].value) || 0 : 0,
        serialControlled: serialControlled,
        serialInbound: serialControlled ? form['serialInbound'].checked : false,
        serialInventory: serialControlled ? form['serialInventory'].checked : false,
        serialOutbound: serialControlled ? form['serialOutbound'].checked : false,
        serialTemplate: serialControlled ? serialTemplate : '',
        
        inboundEligible: form['inboundEligible'].checked,
        computeQtyAs: form.querySelector('input[name="computeQtyAs"]:checked')?.value || 'AMOUNT',
        inspectionQty: parseFloat(form['inspectionQty'].value) || 0,
        inspectionUm: form['inspectionUm'].value || 'PC',
        qcLocatingRule: qcLocatingRule,

        webImage: form['webImage'].value || '',
        webThumb: form['webThumb'].value || '',
        longDescription: form['longDescription'].value || '',
        availableForWebOrder: form['availableForWebOrder'].checked,
        
        alternateItem: form['alternateItem'].value || '',
        substituteItem: form['substituteItem'].value || '',
        substituteList: Array.from(document.querySelectorAll('#item-substitute-table tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                code: cells[1].textContent,
                description: cells[2].textContent
            };
        }), 
        
        preferenceCriterion: form['preferenceCriterion'].checked,
        harmonizedCode: form['harmonizedCode'].value || '',
        harmonizedUploaded: form['harmonizedUploaded'].checked,
        countryOfOrigin: countryOfOrigin,
        netCost: form['netCost'].value || 'NONE',
        countries: [], 
        
        categories: categories,

        updatedAt: Date.now()
    };

    let msg = '';
    if (mode === 'create') {
        const isCodeExist = items.some(item => item.itemCode === form['itemCode'].value && item.company === company);
        if (isCodeExist) {
            showToast('Item with this code and company already exists.', 'error');
            return;
        }
        const maxId = items.reduce((max, item) => {
            const num = parseInt(item.id.replace('ITM', ''), 10);
            return Math.max(max, isNaN(num) ? 0 : num);
        }, 0);
        newItem.id = 'ITM' + String(maxId + 1).padStart(6, '0');
        items.push(newItem);
        msg = 'Item created successfully!';
    } else {
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            newItem.substituteList = newItem.substituteList.length > 0 ? newItem.substituteList : items[index].substituteList;
            newItem.countries = items[index].countries;
            Object.assign(items[index], newItem);
            msg = 'Item updated successfully!';
        }
    }
     saveItems();
    closeModal('item-form-modal');
    window.renderItemList();
    await window.showCustomAlert('Success', msg); 
};
        window.deleteItem = async (id) => {
            const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus Item ini?');
            if (confirmed) {
                items = items.filter(item => item.id !== id);
                saveItems();
                window.renderItemList();
                showToast('Item berhasil dihapus!');
            }
        };
        
        // --- ITEM LIST RENDER & FILTER ---
        window.renderItemList = (filter = '', sortBy = '', sortDir = 'asc') => {
            const container = document.getElementById('item-list-container');
            if (!container) return;
            
            let filteredData = items.filter(item => {
                const searchable = `${item.itemCode} ${item.company} ${item.description} ${item.itemClass} ${item.nmfcCode} ${item.allocationRule} ${item.locatingRule}`.toLowerCase();
                return searchable.includes(filter.toLowerCase());
            });

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

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('itemCode')">Item</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('company')">Company</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('description')">Description</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('itemClass')">Item class</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('inactive')">Active</th>
                            <th class="py-3 px-6 text-left cursor-pointer" onclick="sortItemList('updatedAt')">Updated</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="7" class="py-3 px-6 text-center text-gray-400">Tidak ada data item.</td></tr>`;
            } else {
                filteredData.forEach(item => { 
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${item.itemCode}</td>
                            <td class="py-3 px-6 text-left">${item.company}</td>
                            <td class="py-3 px-6 text-left">${item.description}</td>
                            <td class="py-3 px-6 text-left">${item.itemClass}</td>
                            <td class="py-3 px-6 text-left">${item.inactive ? 'Tidak' : 'Ya'}</td>
                            <td class="py-3 px-6 text-left">${formatDate(item.updatedAt)}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showItemForm('edit', '${item.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteItem('${item.id}')" title="Hapus">
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

        let currentItemSort = { column: '', direction: 'asc' };
        window.sortItemList = (column) => {
            if (currentItemSort.column === column) {
                currentItemSort.direction = currentItemSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentItemSort = { column, direction: 'asc' };
            }
            const searchValue = document.getElementById('item-search').value;
            renderItemList(searchValue, currentItemSort.column, currentItemSort.direction);
        };

        const filterItemListDebounced = debounce(value => renderItemList(value, currentItemSort.column, currentItemSort.direction), 300);
        window.filterItemList = (value) => {
            filterItemListDebounced(value);
        };
        
        function setupTabSwitching(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            const tabButtons = modal.querySelectorAll('[role="tab"]');
            const tabPanes = modal.querySelectorAll('[role="tabpanel"]');
            
            const activateTab = (tabId) => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('tab-active');
                    btn.classList.add('tab');
                });
                tabPanes.forEach(pane => pane.classList.add('hidden'));

                const activeBtn = modal.querySelector(`[data-tab="${tabId}"]`);
                const activePane = modal.querySelector(`[data-pane="${tabId}"]`);
                if (activeBtn) {
                    activeBtn.classList.add('tab-active');
                    activeBtn.classList.remove('tab');
                }
                if (activePane) activePane.classList.remove('hidden');
            };

            const onClickHandler = (e) => {
                const tabId = e.target.dataset.tab;
                if (tabId) {
                    activateTab(tabId);
                }
            };
            
            const onKeyHandler = (e) => {
                const activeTab = modal.querySelector('.tab-active');
                if (!activeTab) return;
                let newIndex;
                const tabs = Array.from(tabButtons);
                const currentIndex = tabs.indexOf(activeTab);
                
                if (e.key === 'ArrowRight') {
                    newIndex = (currentIndex + 1) % tabs.length;
                    tabs[newIndex].focus();
                    activateTab(tabs[newIndex].dataset.tab);
                } else if (e.key === 'ArrowLeft') {
                    newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    tabs[newIndex].focus();
                    activateTab(tabs[newIndex].dataset.tab);
                }
            };

            tabButtons.forEach(btn => {
                btn.removeEventListener('click', onClickHandler);
                btn.addEventListener('click', onClickHandler);
            });
            
            if(tabButtons.length > 0) {
                 activateTab(tabButtons[0].dataset.tab);
            }
        }
        
        // --- IUOM FUNCTIONS ---
        // Helper IUoM
const IUOM_STORAGE_KEY = 'iuoms_v4';
const IUOM_SEED_UOMS = ['PC', 'PCK', 'PLT', 'KG', 'LT', 'M', 'CM'];
const IUOM_SEED_MOVEMENT_CLASSES = ['GRAY', 'WHITE', 'BLACK', 'DEFAULT', 'HEAVY', 'LIGHT'];
const IUOM_SEED_ITEM_CLASSES = ['GENERAL', 'FOOD', 'NON-FOOD', 'FROZEN'];

const loadIUoMs = () => {
  try {
    const data = localStorage.getItem(IUOM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load IUoMs from localStorage", e);
    return [];
  }
};

const saveIUoMs = (arr) => {
  try {
    localStorage.setItem(IUOM_STORAGE_KEY, JSON.stringify(arr));
    window.renderIUoMList();
  } catch (e) {
    console.error("Failed to save IUoMs to localStorage", e);
    showToast('Gagal menyimpan data IUoM.', 'error');
  }
};

const nextIUoMId = () => {
  const iuoms = loadIUoMs();
  const maxId = iuoms.reduce((max, iuom) => {
    const num = parseInt(iuom.id.replace('IUOM', ''), 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0);
  return 'IUOM' + String(maxId + 1).padStart(4, '0');
};

const getCompanies = () => {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    return Array.from(new Set(items.map(item => item.company))).filter(Boolean).sort();
};

const getItemCodes = () => {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    return items.map(item => item.itemCode).filter(Boolean).sort();
};

const num = (v, d = 0) => {
  const n = parseFloat(typeof v === 'object' && v && 'value' in v ? v.value : v);
  return Number.isFinite(n) ? n : d;
};

const str = (v) => (typeof v === 'object' && v && 'value' in v ? v.value : v || '').toString().trim();

const nowIsoDate = () => new Date().toISOString();

// Render IUoM List Page
window.renderIUoMList = (filter = '', sortBy = 'updatedAt', sortDir = 'desc') => {
    const iuoms = loadIUoMs();
    const container = document.getElementById('iuom-list-container');
    if (!container) return;
    
    // Seeding dummy data if empty
    if (iuoms.length === 0) {
         const seedData = [{
            id: 'IUOM0001',
            scope: 'ITEM',
            company: 'DCB',
            itemCode: '0000000053068_1',
            uom: 'PC',
            description: 'Piece',
            conversions: [{
                seq: 1, quantity: 1, quantityUom: 'PC', conversionQty: 1.00000,
                length: 1.00, width: 1.00, height: 1.00, weight: 1.00,
                movementClass: 'GRAY'
            }],
            updatedAt: '2023-09-03T09:18:55Z',
            createdAt: '2023-09-03T09:18:55Z'
        }];
        saveIUoMs(seedData);
        // Recurse to render after seeding
        renderIUoMList(filter, sortBy, sortDir);
        return;
    }

    // Apply search filter
    let filteredData = iuoms.filter(iuom => {
        const searchable = `${iuom.scope} ${iuom.company || ''} ${iuom.itemCode || ''} ${iuom.itemClass || ''} ${iuom.uom}`.toLowerCase();
        return searchable.includes(filter.toLowerCase());
    });

    // Apply sort
    if (sortBy) {
        filteredData.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            let compare = 0;
            if (valA === undefined || valA === null) compare = 1;
            else if (valB === undefined || valB === null) compare = -1;
            else if (valA > valB) compare = 1;
            else if (valA < valB) compare = -1;
            return sortDir === 'asc' ? compare : -compare;
        });
    }

    // Render table HTML
    let tableHtml = `
        <div class="overflow-x-auto border rounded-lg shadow-md">
            <table class="min-w-full bg-white">
                <thead class="sticky top-0 bg-wise-light-gray text-wise-dark-gray uppercase text-xs leading-normal">
                    <tr>
                        <th class="py-2 px-4 text-left cursor-pointer" onclick="sortIUoMList('scope')">Scope</th>
                        <th class="py-2 px-4 text-left cursor-pointer" onclick="sortIUoMList('itemCode')">Key</th>
                        <th class="py-2 px-4 text-left cursor-pointer" onclick="sortIUoMList('company')">Company</th>
                        <th class="py-2 px-4 text-left cursor-pointer" onclick="sortIUoMList('uom')">UoM</th>
                        <th class="py-2 px-4 text-left">Conversions</th>
                        <th class="py-2 px-4 text-left cursor-pointer" onclick="sortIUoMList('updatedAt')">Updated At</th>
                        <th class="py-2 px-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-wise-gray text-sm font-light">
                `;

    if (filteredData.length === 0) {
        tableHtml += `<tr><td colspan="7" class="py-10 text-center text-gray-400">
            Tidak ada records IUoM. Klik "Create New item unit of measure" untuk menambahkan.
            </td></tr>`;
    } else {
        filteredData.forEach(iuom => {
            const conversionsCount = iuom.conversions?.length || 0;
            tableHtml += `
                <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                    <td class="py-2 px-4 text-left whitespace-nowrap">${iuom.scope}</td>
                    <td class="py-2 px-4 text-left whitespace-nowrap">${iuom.itemCode || iuom.itemClass || 'N/A'}</td>
                    <td class="py-2 px-4 text-left">${iuom.company || 'N/A'}</td>
                    <td class="py-2 px-4 text-left">${iuom.uom}</td>
                    <td class="py-2 px-4 text-left">${conversionsCount}</td>
                    <td class="py-2 px-4 text-left">${formatDate(iuom.updatedAt)}</td>
                    <td class="py-2 px-4 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showIUoMForm('edit', '${iuom.id}')" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteIUoM('${iuom.id}')" title="Hapus">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;
};

let currentIUoMSort = { column: 'updatedAt', direction: 'desc' };
window.sortIUoMList = (column) => {
    if (currentIUoMSort.column === column) {
        currentIUoMSort.direction = currentIUoMSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentIUoMSort = { column, direction: 'asc' };
    }
    const searchValue = document.getElementById('iuom-search').value;
    renderIUoMList(searchValue, currentIUoMSort.column, currentIUoMSort.direction);
};
const filterIUoMListDebounced = debounce(value => renderIUoMList(value, currentIUoMSort.column, currentIUoMSort.direction), 300);
window.filterIUoMList = (value) => {
    filterIUoMListDebounced(value);
};

// Render IUoM Form Modal
createModal('iuom-form-modal', 'w-[min(1100px,95vw)]');
window.showIUoMForm = (mode, id = null) => {
    const modal = document.getElementById('iuom-form-modal');
    const titleEl = document.getElementById('iuom-form-modal-title');
    const bodyEl = document.getElementById('iuom-form-modal-body');
    const footerEl = document.getElementById('iuom-form-modal-footer');
    
    const iuoms = loadIUoMs();
    const iuom = iuoms.find(i => i.id === id) || {
        scope: 'ITEM_CLASS', itemClass: '', itemCode: '', company: '', uom: '', description: '', conversions: []
    };

    titleEl.textContent = mode === 'create' ? 'Create New IUoM' : `Edit IUoM: ${iuom.id}`;
    
    // --- AWAL PERUBAHAN ---
    // Struktur HTML di bawah ini dirombak total untuk memperbaiki layout
    bodyEl.innerHTML = `
        <form id="iuom-form" data-mode="${mode}" class="h-full space-y-6">
            <input type="hidden" id="iuom-id" value="${iuom.id || ''}">
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div class="space-y-3">
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2 text-sm w-24">
                                <input type="radio" name="scope" value="ITEM_CLASS" id="scope-item-class" class="custom-radio" ${iuom.scope === 'ITEM_CLASS' ? 'checked' : ''} onchange="toggleIUoMScope()"> Item Class
                            </label>
                            <div id="scope-item-class-fields" class="flex-1">
                                <select id="iuom-item-class-select" name="itemClass" class="select w-full" required></select>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2 text-sm w-24">
                                <input type="radio" name="scope" value="ITEM" id="scope-item" class="custom-radio" ${iuom.scope === 'ITEM' ? 'checked' : ''} onchange="toggleIUoMScope()"> Item
                            </label>
                            <div id="scope-item-fields" class="flex-1">
                                <select id="iuom-item-code-select" name="itemCode" class="select w-full"></select>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="grid grid-cols-[auto,1fr] items-center gap-x-4">
                            <label for="iuom-company-select-input" class="text-sm text-right">Company:</label>
                            <select id="iuom-company-select" name="company" class="select w-full"></select>
                        </div>
                        <div class="grid grid-cols-[auto,1fr] items-center gap-x-4">
                            <label for="iuom-uom-select" class="text-sm text-right">UoM:</label>
                            <select id="iuom-uom-select" name="uom" class="select w-full"><option value="">-- Pilih --</option>${IUOM_SEED_UOMS.map(u => `<option value="${u}" ${u === iuom.uom ? 'selected' : ''}>${u}</option>`).join('')}</select>
                        </div>
                        <div class="grid grid-cols-[auto,1fr] items-center gap-x-4">
                            <label for="iuom-description" class="text-sm text-right">Description:</label>
                            <input type="text" id="iuom-description" name="description" class="input w-full" value="${iuom.description || ''}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <h5 class="font-medium text-wise-dark-gray">Conversions</h5>
                    <div class="flex items-center gap-2">
                        <button type="button" class="btn btn-sm btn-outline flex items-center gap-1" onclick="addConversionRow()">+ Add Row</button>
                        <button type="button" class="btn btn-sm btn-outline flex items-center gap-1" onclick="deleteSelectedConversionRows()">Delete</button>
                        <button type="button" class="btn btn-sm btn-outline" onclick="moveConversionRowUp()">↑</button>
                        <button type="button" class="btn btn-sm btn-outline" onclick="moveConversionRowDown()">↓</button>
                    </div>
                </div>
                <div class="border rounded-md overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table class="min-w-full text-sm"><thead class="sticky top-0 bg-gray-100"><tr>
                        <th class="py-2 px-4 w-12"><input type="checkbox" id="iuom-select-all-conversions" onchange="toggleAllConversions(this.checked)"></th>
                        <th class="py-2 px-4 text-left">Seq</th>
                        <th class="py-2 px-4 text-left">Quantity UM</th>
                        <th class="py-2 px-4 text-right">Conversion Qty</th>
                        <th class="py-2 px-4 text-right">Length</th>
                        <th class="py-2 px-4 text-right">Width</th>
                        <th class="py-2 px-4 text-right">Height</th>
                        <th class="py-2 px-4 text-right">Weight</th>
                        <th class="py-2 px-4 text-left">Movement Class</th>
                        <th class="py-2 px-4 text-left">To UoM</th>
                    </tr></thead><tbody id="iuom-conversions-body">
                        <tr id="iuom-conversions-empty-state" class="hidden"><td colspan="10" class="p-8 text-center text-gray-400">No conversions. Click '+ Add Row' to start.</td></tr>
                    </tbody></table>
                </div>
            </div>
        </form>
    `;
    
    // Use the new standard footer function
    footerEl.innerHTML = renderStandardModalFooter({
        cancelOnclick: "closeModal('iuom-form-modal')",
        submitFormId: "iuom-form",
        submitButtonId: "iuom-submit-btn"
    });

    // Initialize custom dropdowns
    makeLongDropdown('iuom-item-code-select', getItemCodes(), iuom.itemCode);
    makeLongDropdown('iuom-company-select', getCompanies(), iuom.company);
    makeLongDropdown('iuom-item-class-select', IUOM_SEED_ITEM_CLASSES, iuom.itemClass);

    prefillIUoMForm(iuom);
    
    document.getElementById('iuom-form').addEventListener('input', validateIUoMForm);
    document.getElementById('iuom-form').addEventListener('change', validateIUoMForm);
    document.getElementById('iuom-form').addEventListener('submit', handleIUoMSubmit);

    document.removeEventListener('keydown', handleIUoMKeyboardShortcuts); // Hapus listener lama
    document.addEventListener('keydown', handleIUoMKeyboardShortcuts);
    
    document.getElementById('scope-item-class').focus();
    
    showModal('iuom-form-modal');
};

window.toggleIUoMScope = () => {
    const scopeItemClassRadio = document.getElementById('scope-item-class');
    const scopeItemFields = document.getElementById('scope-item-fields');
    const scopeItemClassFields = document.getElementById('scope-item-class-fields');
    
    if (scopeItemClassRadio.checked) {
        scopeItemFields.classList.add('hidden');
        scopeItemClassFields.classList.remove('hidden');
    } else {
        scopeItemClassFields.classList.add('hidden');
        scopeItemFields.classList.remove('hidden');
    }
    validateIUoMForm();
};

const prefillIUoMForm = (data) => {
    const form = document.getElementById('iuom-form');
    if (!form) return;

    form.querySelector('input[name="scope"][value="' + data.scope + '"]').checked = true;
    document.getElementById('iuom-id').value = data.id || '';
    document.getElementById('iuom-description').value = data.description || '';
    document.getElementById('iuom-uom-select').value = data.uom || '';
    
    const itemClassInput = document.getElementById('iuom-item-class-select-input');
    const itemCodeInput = document.getElementById('iuom-item-code-select-input');
    const companyInput = document.getElementById('iuom-company-select-input');
    if(itemClassInput) itemClassInput.value = data.itemClass || '-- Pilih --';
    if(itemCodeInput) itemCodeInput.value = data.itemCode || '-- Pilih --';
    if(companyInput) companyInput.value = data.company || '-- Pilih --';

    toggleIUoMScope();
    renderIUoMConversionsTable(data.conversions);
};

const validateIUoMForm = () => {
    const form = document.getElementById('iuom-form'); if (!form) return false;
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    let isValid = true;
    
    const showError = (el, message) => {
        if (!el) return;
        el.classList.add('border-red-500');
        const errorEl = document.createElement('p');
        errorEl.className = 'error-message text-red-500 text-xs mt-1';
        errorEl.textContent = message;
        el.parentElement.appendChild(errorEl);
        isValid = false;
    };
    
    const scope = form.querySelector('input[name="scope"]:checked')?.value;
    const itemClassInput = document.getElementById('iuom-item-class-select-input');
    const itemCodeInput = document.getElementById('iuom-item-code-select-input');
    const companyInput = document.getElementById('iuom-company-select-input');
    const uomSelect = document.getElementById('iuom-uom-select');

    if (scope === 'ITEM_CLASS' && !itemClassInput.value) showError(itemClassInput, 'Item Class wajib diisi.');
    if (scope === 'ITEM' && !itemCodeInput.value) showError(itemCodeInput, 'Item wajib diisi.');
    if (scope === 'ITEM' && !companyInput.value) showError(companyInput, 'Company wajib diisi.');
    if (!uomSelect.value) showError(uomSelect, 'UoM wajib diisi.');
    
    document.getElementById('iuom-submit-btn').disabled = !isValid;
    return isValid;
};

const renderIUoMConversionsTable = (conversions) => {
    const tbody = document.getElementById('iuom-conversions-body');
    const emptyState = document.getElementById('iuom-conversions-empty-state');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!conversions || conversions.length === 0) {
        // Tampilkan pesan kosong jika tidak ada konversi
        const emptyRow = document.createElement('tr');
        emptyRow.id = 'iuom-conversions-empty-state';
        emptyRow.innerHTML = `<td colspan="10" class="p-8 text-center text-gray-400">No conversions. Click '+ Add Row' to start.</td>`;
        tbody.appendChild(emptyRow);
    } else {
        conversions.forEach((conv, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.dataset.index = index;
            row.innerHTML = `
                <td class="py-2 px-4"><input type="checkbox" class="iuom-conv-select" data-index="${index}"></td>
                <td class="py-2 px-4 text-left">${index + 1}</td>
                <td class="py-2 px-4 text-left"><div class="flex items-center gap-2"><input type="number" name="quantity" class="input w-16 text-right" value="${conv.quantity || 1}"><select name="quantityUom" class="select w-24"><option value="">--</option>${IUOM_SEED_UOMS.map(u => `<option value="${u}" ${u === conv.quantityUom ? 'selected' : ''}>${u}</option>`).join('')}</select></div></td>
                <td class="py-2 px-4 text-right"><input type="number" step="0.00001" name="conversionQty" class="input w-24 text-right" value="${conv.conversionQty || 1}"></td>
                <td class="py-2 px-4 text-right"><input type="number" step="0.01" name="length" class="input w-20 text-right" value="${conv.length || 0}"></td>
                <td class="py-2 px-4 text-right"><input type="number" step="0.01" name="width" class="input w-20 text-right" value="${conv.width || 0}"></td>
                <td class="py-2 px-4 text-right"><input type="number" step="0.01" name="height" class="input w-20 text-right" value="${conv.height || 0}"></td>
                <td class="py-2 px-4 text-right"><input type="number" step="0.01" name="weight" class="input w-20 text-right" value="${conv.weight || 0}"></td>
                <td class="py-2 px-4 text-left"><select name="movementClass" class="select w-24"><option value="">--</option>${IUOM_SEED_MOVEMENT_CLASSES.map(mc => `<option value="${mc}" ${mc === conv.movementClass ? 'selected' : ''}>${mc}</option>`).join('')}</select></td>
                <td class="py-2 px-4 text-left"><select name="toUom" class="select w-24"><option value="">--</option>${IUOM_SEED_UOMS.map(u => `<option value="${u}" ${u === conv.toUom ? 'selected' : ''}>${u}</option>`).join('')}</select></td>
            `;
            tbody.appendChild(row);
        });
    }
};

const getIUoMConversionsFromForm = () => {
    const conversions = [];
    document.querySelectorAll('#iuom-conversions-body tr').forEach(row => {
        if (row.id === 'iuom-conversions-empty-state') return;
        const rowData = {
            seq: parseInt(row.querySelector('td:nth-child(2)').textContent),
            quantity: num(row.querySelector('[name="quantity"]')),
            quantityUom: str(row.querySelector('[name="quantityUom"]')),
            conversionQty: num(row.querySelector('[name="conversionQty"]')),
            length: num(row.querySelector('[name="length"]')),
            width: num(row.querySelector('[name="width"]')),
            height: num(row.querySelector('[name="height"]')),
            weight: num(row.querySelector('[name="weight"]')),
            movementClass: str(row.querySelector('[name="movementClass"]')),
            toUom: str(row.querySelector('[name="toUom"]'))
        };
        conversions.push(rowData);
    });
    return conversions;
};

window.addConversionRow = () => {
    const conversions = getIUoMConversionsFromForm();
    const newSeq = conversions.length > 0 ? conversions[conversions.length - 1].seq + 1 : 1;
    const newConversion = {
        seq: newSeq, quantity: 1, quantityUom: '', conversionQty: 1,
        length: 0, width: 0, height: 0, weight: 0, movementClass: ''
    };
    conversions.push(newConversion);
    renderIUoMConversionsTable(conversions);
    showToast('Row added successfully!');
};

window.deleteSelectedConversionRows = () => {
    const checkboxes = document.querySelectorAll('.iuom-conv-select:checked');
    if (checkboxes.length === 0) { showToast('Pilih setidaknya satu baris untuk dihapus.', 'error'); return; }
    window.showCustomConfirm('Konfirmasi Hapus', `Hapus ${checkboxes.length} baris konversi?`).then(confirmed => {
        if (confirmed) {
            let currentConversions = getIUoMConversionsFromForm();
            const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index, 10)).sort((a,b) => b-a);
            for (const index of indicesToDelete) { currentConversions.splice(index, 1); }
            currentConversions.forEach((conv, idx) => conv.seq = idx + 1);
            renderIUoMConversionsTable(currentConversions);
            showToast(`${indicesToDelete.length} baris berhasil dihapus.`);
        }
    });
};

window.moveConversionRowUp = () => {
    const checkboxes = document.querySelectorAll('.iuom-conv-select:checked');
    if (checkboxes.length !== 1) { showToast('Pilih tepat satu baris untuk dipindahkan.', 'error'); return; }
    let conversions = getIUoMConversionsFromForm();
    const selectedIndex = parseInt(checkboxes[0].dataset.index, 10);
    if (selectedIndex > 0) {
        [conversions[selectedIndex - 1], conversions[selectedIndex]] = [conversions[selectedIndex], conversions[selectedIndex - 1]];
        conversions.forEach((c, i) => c.seq = i + 1);
        renderIUoMConversionsTable(conversions);
        document.querySelector(`[data-index="${selectedIndex - 1}"]`).checked = true;
    }
};

window.moveConversionRowDown = () => {
    const checkboxes = document.querySelectorAll('.iuom-conv-select:checked');
    if (checkboxes.length !== 1) { showToast('Pilih tepat satu baris untuk dipindahkan.', 'error'); return; }
    let conversions = getIUoMConversionsFromForm();
    const selectedIndex = parseInt(checkboxes[0].dataset.index, 10);
    if (selectedIndex < conversions.length - 1) {
        [conversions[selectedIndex + 1], conversions[selectedIndex]] = [conversions[selectedIndex], conversions[selectedIndex + 1]];
        conversions.forEach((c, i) => c.seq = i + 1);
        renderIUoMConversionsTable(conversions);
        document.querySelector(`[data-index="${selectedIndex + 1}"]`).checked = true;
    }
};

window.toggleAllConversions = (checked) => {
    document.querySelectorAll('.iuom-conv-select').forEach(cb => cb.checked = checked);
};

window.handleIUoMSubmit = (event) => {
    event.preventDefault();
    if (!validateIUoMForm()) { showToast('Form tidak valid.', 'error'); return; }
    
    const form = event.target;
    const mode = form.dataset.mode;
    let iuoms = loadIUoMs();
    const id = form['iuom-id'].value;
    
    const scope = form.querySelector('input[name="scope"]:checked')?.value;
    const itemClass = document.getElementById('iuom-item-class-select-input')?.value;
    const itemCode = document.getElementById('iuom-item-code-select-input')?.value;
    const company = document.getElementById('iuom-company-select-input')?.value;
    const uom = document.getElementById('iuom-uom-select')?.value;
    const description = form.querySelector('[name="description"]')?.value;

    const newIUoM = {
        id: id, scope: scope,
        company: scope === 'ITEM' ? company : undefined,
        itemClass: scope === 'ITEM_CLASS' ? itemClass : undefined,
        itemCode: scope === 'ITEM' ? itemCode : undefined,
        uom: uom, description: description,
        conversions: getIUoMConversionsFromForm(),
        updatedAt: nowIsoDate()
    };
    
    if (mode === 'create') {
        newIUoM.id = nextIUoMId();
        newIUoM.createdAt = nowIsoDate();
        iuoms.push(newIUoM);
        showToast('IUoM berhasil dibuat!');
    } else {
        const index = iuoms.findIndex(i => i.id === id);
        if (index !== -1) {
            iuoms[index] = { ...iuoms[index], ...newIUoM };
            showToast('IUoM berhasil diperbarui!');
        }
    }
    
    saveIUoMs(iuoms);
    closeModal('iuom-form-modal');
};

const handleIUoMKeyboardShortcuts = (e) => {
    const isModalOpen = !document.getElementById('iuom-form-modal')?.classList.contains('hidden');
    if (isModalOpen && (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'Enter')) {
        e.preventDefault();
        document.getElementById('iuom-submit-btn').click();
    }
};

window.deleteIUoM = async (id) => {
    const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Hapus Item Unit of Measure ini?');
    if (confirmed) {
        let iuoms = loadIUoMs();
        iuoms = iuoms.filter(iuom => iuom.id !== id);
        saveIUoMs(iuoms);
        showToast('IUoM berhasil dihapus!');
    }
};

        
        // --- ITEM CROSS REFERENCE FUNCTIONS ---
        window.renderItemCrossReferenceList = (filter = '') => {
            const container = document.getElementById('item-cross-reference-list-container');
            if (!container) return;
            
            let filteredData = itemCrossReferences.filter(icr => {
                const searchable = `${icr.item} ${icr.company} ${icr.crossReferenceItemNumber} ${icr.quantityUm}`.toLowerCase();
                return searchable.includes(filter.toLowerCase());
            });

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Item</th>
                            <th class="py-3 px-6 text-left">Company</th>
                            <th class="py-3 px-6 text-left">Cross reference item number</th>
                            <th class="py-3 px-6 text-left">Quantity um</th>
                            <th class="py-3 px-6 text-left">GTIN Enabled</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="6" class="py-3 px-6 text-center text-gray-400">Tidak ada data Item Cross Reference.</td></tr>`;
            } else {
                filteredData.forEach(icr => { 
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${icr.item}</td>
                            <td class="py-3 px-6 text-left">${icr.company}</td>
                            <td class="py-3 px-6 text-left">${icr.crossReferenceItemNumber}</td>
                            <td class="py-3 px-6 text-left">${icr.quantityUm}</td>
                            <td class="py-3 px-6 text-left">${icr.gtinEnabled ? 'Ya' : 'Tidak'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showItemCrossReferenceForm('edit', '${icr.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteItemCrossReference('${icr.id}')" title="Hapus">
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

        const filterItemCrossReferenceListDebounced = debounce(value => renderItemCrossReferenceList(value), 300);
        window.filterItemCrossReferenceList = (value) => {
            filterItemCrossReferenceListDebounced(value);
        };

        createModal('item-cross-reference-form-modal', 'max-w-xl');

        window.showItemCrossReferenceForm = (mode, id = null) => {
            const modal = document.getElementById('item-cross-reference-form-modal');
            const titleEl = document.getElementById('item-cross-reference-form-modal-title');
            const bodyEl = document.getElementById('item-cross-reference-form-modal-body');
            const footerEl = document.getElementById('item-cross-reference-form-modal-footer');
            
            const icr = itemCrossReferences.find(i => i.id === id) || {};

            titleEl.textContent = mode === 'create' ? 'Create New Item Cross Reference' : `Edit Item Cross Reference - Edit existing`;
            
            bodyEl.innerHTML = `
                <form id="item-cross-reference-form" data-mode="${mode}">
                    <div role="tablist" id="icr-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                        <button type="button" role="tab" data-tab="icr-general" class="tab-active">General</button>
                        <button type="button" role="tab" data-tab="icr-udf" class="tab">User defined data</button>
                    </div>
                    
                    <div id="icr-general" role="tabpanel" data-pane="icr-general">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="icr-item" class="block text-sm mb-1">Item:</label>
                                <input type="text" id="icr-item" name="item" class="input" value="${icr.item || ''}" ${mode === 'edit' ? 'readonly' : ''}>
                            </div>
                            <div>
                                <label for="icr-company" class="block text-sm mb-1">Company:</label>
                                <input type="text" id="icr-company" name="company" class="input" value="${icr.company || ''}" ${mode === 'edit' ? 'readonly' : ''}>
                            </div>
                            <div class="md:col-span-2">
                                <label for="icr-cross-reference-item-number" class="block text-sm mb-1">Cross reference item number:</label>
                                <input type="text" id="icr-cross-reference-item-number" name="crossReferenceItemNumber" class="input" value="${icr.crossReferenceItemNumber || ''}">
                            </div>
                             <div class="md:col-span-2">
                                <label for="icr-quantity-um" class="block text-sm mb-1">Quantity unit of measure:</label>
                                <input type="text" id="icr-quantity-um" name="quantityUm" class="input" value="${icr.quantityUm || ''}">
                            </div>
                            <div class="md:col-span-2 flex items-center gap-4">
                                <label class="flex items-center gap-2 text-sm">
                                    <input type="checkbox" id="icr-gtin-enabled" name="gtinEnabled" class="h-4 w-4">
                                    GTIN enabled
                                </label>
                            </div>
                        </div>
                    </div>

                    <div id="icr-udf" role="tabpanel" data-pane="icr-udf" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${Array.from({ length: 8 }, (_, i) => `
                                <div>
                                    <label for="icr-udf${i + 1}" class="block text-sm mb-1">User defined field ${i + 1}:</label>
                                    <input id="icr-udf${i + 1}" name="udf${i + 1}" type="text" class="input" value="${icr.userDefined?.[`udf${i + 1}`] || ''}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <input type="hidden" name="id" value="${icr.id || ''}">
                </form>
            `;

            // Use the new standard footer function
            footerEl.innerHTML = renderStandardModalFooter({
                cancelOnclick: "closeModal('item-cross-reference-form-modal')",
                submitFormId: "item-cross-reference-form"
            });

            // Fill checkboxes and UDFs
            const form = document.getElementById('item-cross-reference-form');
            if (form) {
                document.getElementById('icr-gtin-enabled').checked = icr.gtinEnabled || false;
                for (let i = 1; i <= 8; i++) {
                     const udfEl = document.getElementById(`icr-udf${i}`);
                     if (udfEl) udfEl.value = icr.userDefined?.[`udf${i}`] || '';
                }
                form.addEventListener('submit', handleItemCrossReferenceSubmit);
            }

            setupTabSwitching('item-cross-reference-form-modal');
            showModal('item-cross-reference-form-modal');
        };

        window.handleItemCrossReferenceSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const mode = form.dataset.mode;
    const id = form['id'].value;

    const now = new Date();
    const lastUpdatedString = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} AM`;
    const currentUser = 'ILSSRV';

    const userDefined = {};
    for (let i = 1; i <= 8; i++) {
        userDefined[`udf${i}`] = form[`udf${i}`].value;
    }

    const newICR = {
        id: id,
        item: form['item'].value,
        company: form['company'].value,
        crossReferenceItemNumber: form['crossReferenceItemNumber'].value,
        quantityUm: form['quantityUm'].value,
        gtinEnabled: form['gtinEnabled'].checked,
        lastUpdated: lastUpdatedString,
        user: currentUser,
        userDefined: userDefined,
    };

    let msg = '';
    if (mode === 'create') {
        const maxId = itemCrossReferences.reduce((max, icr) => {
            const num = parseInt(icr.id.replace('ICR', ''), 10);
            return Math.max(max, isNaN(num) ? 0 : num);
        }, 0);
        newICR.id = 'ICR' + String(maxId + 1).padStart(3, '0');
        itemCrossReferences.push(newICR);
        msg = 'Item Cross Reference created successfully!';
    } else {
        const index = itemCrossReferences.findIndex(icr => icr.id === id);
        if (index !== -1) {
            itemCrossReferences[index] = { ...itemCrossReferences[index], ...newICR };
            msg = 'Item Cross Reference updated successfully!';
        }
    }
    saveItemCrossReferences();
    closeModal('item-cross-reference-form-modal');
    window.renderItemCrossReferenceList();
    await window.showCustomAlert('Success', msg);
};

window.deleteItemCrossReference = async (id) => {
    const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Apakah kamu yakin ingin menghapus Item Cross Reference ini?');
    if (confirmed) {
        itemCrossReferences = itemCrossReferences.filter(icr => icr.id !== id);
        saveItemCrossReferences();
        window.renderItemCrossReferenceList();
        await window.showCustomAlert('Deleted', 'Item Cross Reference deleted successfully!');
    }
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }, 300);
};

        // --- INVENTORY CONTROL VALUES FUNCTIONS ---
        createModal('icv-form-modal');
        
        window.showInventoryControlValuesForm = (mode, id = null) => {
            const modal = document.getElementById('icv-form-modal');
            const titleEl = document.getElementById('icv-form-modal-title');
            const bodyEl = document.getElementById('icv-form-modal-body');
            const footerEl = document.getElementById('icv-form-modal-footer');
            
            const icv = inventoryControlValues.find(v => v.id === id) || {};

            titleEl.textContent = mode === 'create' ? 'Create New Inventory Control Value' : `Edit Inventory Control Value`;

            bodyEl.innerHTML = `
                <form id="icv-form" data-mode="${mode}">
                    <input type="hidden" name="id" value="${icv.id || ''}">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="icv-key" class="block text-sm mb-1">Key:</label>
                            <input type="text" id="icv-key" name="key" class="input" value="${icv.key || ''}">
                        </div>
                        <div>
                            <label for="icv-value" class="block text-sm mb-1">Value:</label>
                            <input type="text" id="icv-value" name="value" class="input" value="${icv.value || ''}">
                        </div>
                        <div class="md:col-span-2">
                            <label for="icv-description" class="block text-sm mb-1">Description:</label>
                            <textarea id="icv-description" name="description" class="input" rows="2">${icv.description || ''}</textarea>
                        </div>
                        <div class="md:col-span-2">
                             <label class="flex items-center gap-2 text-sm">
                                 <input type="checkbox" id="icv-system-created" name="systemCreated" ${icv.systemCreated === 'Yes' ? 'checked' : ''}>
                                 System Created
                             </label>
                        </div>
                    </div>
                </form>
            `;
            
            footerEl.innerHTML = renderStandardModalFooter({
                cancelOnclick: "closeModal('icv-form-modal')",
                submitFormId: "icv-form"
            });

            const form = document.getElementById('icv-form');
            if (form) {
                form.addEventListener('submit', handleInventoryControlValuesSubmit);
            }

            showModal('icv-form-modal');
        };

        window.handleInventoryControlValuesSubmit = async (event) => {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.id.value;
            
            const newValue = {
                id: id,
                key: form.key.value,
                value: form.value.value,
                description: form.description.value,
                systemCreated: form.systemCreated.checked ? "Yes" : "No"
            };
            
            let msg = '';
            if (mode === 'create') {
                const maxId = inventoryControlValues.reduce((max, val) => Math.max(max, val.id), 0);
                newValue.id = maxId + 1;
                inventoryControlValues.push(newValue);
                msg = 'Inventory Control Value created successfully!';
            } else {
                const index = inventoryControlValues.findIndex(v => v.id == id);
                if (index !== -1) {
                    inventoryControlValues[index] = { ...inventoryControlValues[index], ...newValue };
                    msg = 'Inventory Control Value updated successfully!';
                }
            }
            saveInventoryControlValues();
            closeModal('icv-form-modal');
            window.renderInventoryControlValuesList();
            await window.showCustomAlert('Success', msg);
        };

        window.deleteInventoryControlValues = async (id) => {
            const confirmed = await window.showCustomConfirm('Konfirmasi Hapus', 'Apakah kamu yakin ingin menghapus nilai kontrol inventaris ini?');
            if (confirmed) {
                inventoryControlValues = inventoryControlValues.filter(v => v.id != id);
                saveInventoryControlValues();
                window.renderInventoryControlValuesList();
                await window.showCustomAlert('Deleted', 'Nilai kontrol inventaris berhasil dihapus!');
            }
        };

        window.renderInventoryControlValuesList = (filter = '') => {
            const container = document.getElementById('icv-list-container');
            if (!container) return;

            let filteredData = inventoryControlValues.filter(icv => {
                const searchable = `${icv.key} ${icv.value} ${icv.description} ${icv.systemValue}`.toLowerCase();
                return searchable.includes(filter.toLowerCase());
            });
            
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">KEY</th>
                            <th class="py-3 px-6 text-left">DESCRIPTION</th>
                            <th class="py-3 px-6 text-left">SYSTEM VALUE</th>
                            <th class="py-3 px-6 text-left">SYSTEM CREATED</th>
                            <th class="py-3 px-6 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center text-gray-400">Tidak ada nilai kontrol inventaris yang ditemukan.</td></tr>`;
            } else {
                filteredData.forEach(icv => { 
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${icv.id}</td>
                            <td class="py-3 px-6 text-left">${icv.key}</td>
                            <td class="py-3 px-6 text-left">${icv.systemValue}</td>
                            <td class="py-3 px-6 text-left">${icv.systemCreated}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showInventoryControlValuesForm('edit', ${icv.id})" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteInventoryControlValues(${icv.id})" title="Hapus">
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
        
        const filterInventoryControlValuesDebounced = debounce(value => window.renderInventoryControlValuesList(value), 300);
        window.filterInventoryControlValuesList = (value) => {
             filterInventoryControlValuesDebounced(value);
        };
        
        // --- ROUTING & REGISTRATION ---
        window.contentData['item'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item</h2>
                <p class="text-wise-gray mb-4">Kelola semua item dalam inventaris.</p>
                ${renderStandardListHeader({
                    createLabel: "Create New Item",
                    onCreate: "showItemForm('create')",
                    searchId: "item-search",
                    searchPlaceholder: "Search...",
                    onSearch: "filterItemList"
                })}
                <div id="item-list-container" class="max-h-[70vh] overflow-y-auto overflow-x-auto border border-wise-border rounded-lg bg-white"></div>
            `
        };
        
        window.contentData['item-unit-of-measure'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Unit of Measure</h2>
                <p class="text-wise-gray mb-4">
                    Mengelola unit pengukuran dan faktor konversi untuk item atau kelas item.
                </p>
                ${renderStandardListHeader({
                    createLabel: "Create New Item Unit of Measure",
                    onCreate: "showIUoMForm('create')",
                    searchId: "iuom-search",
                    searchPlaceholder: "Search...",
                    onSearch: "filterIUoMList"
                })}
                <div id="iuom-list-container" class="max-h-[70vh] overflow-y-auto overflow-x-auto border border-wise-border rounded-lg bg-white"></div>
            `
        };

        window.contentData['item-cross-reference'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Cross Reference</h2>
                <p class="text-wise-gray mb-4">
                    Kelola referensi silang untuk item (misalnya, nomor bagian yang berbeda).
                </p>
                ${renderStandardListHeader({
                    createLabel: "Create New Item Cross Reference",
                    onCreate: "showItemCrossReferenceForm('create')",
                    searchId: "item-cross-reference-search",
                    searchPlaceholder: "Search...",
                    onSearch: "filterItemCrossReferenceList"
                })}
                <div id="item-cross-reference-list-container" class="max-h-[70vh] overflow-y-auto overflow-x-auto border border-wise-border rounded-lg bg-white"></div>
            `
        };

        window.contentData['inventory-control-values'] = {
            full: `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Inventory Control Values</h2>
                <p class="text-wise-gray mb-4">Manage system-wide inventory control settings and defaults.</p>
                ${renderStandardListHeader({
                    createLabel: "Create New Value",
                    onCreate: "showInventoryControlValuesForm('create')",
                    searchId: "icv-search",
                    searchPlaceholder: "Search inventory control values...",
                    onSearch: "filterInventoryControlValuesList"
                })}
                <div id="icv-list-container" class="max-h-[70vh] overflow-y-auto overflow-x-auto border border-wise-border rounded-lg bg-white"></div>
            `
        };

        // Daftarkan ke menu & pencarian global
        window.searchItems.push({ id: 'item', title: 'Item', category: 'Inventory Control', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Item', category: 'Inventory Control' });
        window.parentMapping['item'] = 'inventory-control';
        window.searchItems.push({ id: 'item-unit-of-measure', title: 'Item Unit of Measure', category: 'Inventory Control', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Item Unit of Measure', category: 'Inventory Control' });
        window.parentMapping['item-unit-of-measure'] = 'inventory-control';
        window.searchItems.push({ id: 'item-cross-reference', title: 'Item Cross Reference', category: 'Inventory Control', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Item Cross Reference', category: 'Inventory Control' });
        window.parentMapping['item-cross-reference'] = 'inventory-control';
        window.searchItems.push({ id: 'inventory-control-values', title: 'Inventory Control Values', category: 'Inventory Control', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Inventory Control Values', category: 'Inventory Control' });
        window.parentMapping['inventory-control-values'] = 'inventory-control';


        if (window.contentData['inventory-control']) {
            const invChildren = [
                'item', 'adjustment-type', 'harmonized-code', 'inventory-control-values', 'inventory-status',
                'item-class', 'item-cross-reference', 'item-location-assignment',
                'item-location-capacity', 'item-template', 'item-unit-of-measure',
                'location', 'location-class', 'location-status', 'location-template', 'location-type',
                'lot-template', 'movement-class', 'serial-number-template', 'storage-template',
                'zone', 'zone-type'
            ].sort(); 
            
            const invMeta = { 
                ...(window.invMeta || {}),
                'item': ['Item', 'Kelola data master item dan atributnya.'], 
                'item-unit-of-measure': ['Item Unit of Measure', 'Kelola UoM dan konversi untuk item/kelas item.'],
                'item-cross-reference': ['Item Cross Reference', 'Kelola referensi silang untuk item.'],
                'adjustment-type': ['Adjustment Type', 'Tentukan jenis untuk penyesuaian inventaris.'],
                'harmonized-code': ['Harmonized Code', 'Kelola kode sistem harmonisasi untuk bea cukai.'],
                'inventory-control-values': ['Inventory Control Values', 'Konfigurasi berbagai parameter kontrol inventaris.'],
                'inventory-status': ['Inventory Status', 'Tentukan dan kelola status stok inventaris.'],
                'item-class': ['Item Class', 'Kategorikan item ke dalam kelas untuk manajemen yang lebih baik.'],
                'item-location-assignment': ['Item Location Assignment', 'Tetapkan item ke lokasi tertentu di gudang.'],
                'item-location-capacity': ['Item Location Capacity', 'Tentukan kapasitas penyimpanan untuk berbagai lokasi item.'],
                'item-template': ['Item Template', 'Buat template untuk pembuatan item baru.'],
                'location': ['Location', 'Kelola lokasi penyimpanan fisik di gudang.'],
                'location-class': ['Location Class', 'Kategorikan lokasi untuk pengelompokan logis.'],
                'location-status': ['Location Status', 'Tentukan status untuk lokasi gudang.'],
                'location-template': ['Location Template', 'Buat template untuk penyiapan lokasi baru.'],
                'location-type': ['Location Type', 'Tentukan berbagai jenis lokasi penyimpanan.'],
                'lot-template': ['Lot Template', 'Tentukan template untuk pembuatan dan pelacakan nomor lot.'],
                'movement-class': ['Movement Class', 'Kategorikan item berdasarkan karakteristik pergerakannya.'],
                'serial-number-template': ['Serial Number Template', 'Tentukan template untuk pembuatan dan pelacakan nomor seri.'],
                'storage-template': ['Storage Template', 'Konfigurasi aturan dan template penyimpanan.'],
                'zone': ['Zone', 'Kelola zona logis di dalam gudang.'],
                'zone-type': ['Zone Type', 'Tentukan jenis zona dalam tata letak gudang.']
            };
            
            window.contentData['inventory-control'].full = `
                <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">
                    Inventory Control
                </h2>
                <p class="text-wise-gray mb-6">Pilih sub-kategori untuk mengelola kontrol inventaris.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${invChildren.map(k => {
                        const meta = invMeta[k] || [k, ''];
                        return `
                        <div class="bg-wise-light-gray p-5 rounded-lg shadow-md hover:shadow-lg transition">
                            <h3 class="text-lg font-medium text-wise-dark-gray mb-2">${meta[0]}</h3>
                            <p class="text-wise-gray text-sm">${meta[1]}</p>
                            <button class="mt-4 px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition"
                                    onclick="selectCategory('${k}')">
                                Buka
                            </button>
                        </div>
                    `;
                    }).join('')}
                </div>`;
            window.parentMapping['item'] = 'inventory-control';
        }
        
        const autoRenderItem = () => {
            const container = document.getElementById('item-list-container');
            if (container && !container.dataset.bound) {
                seedItemData();
                renderItemList();
                container.dataset.bound = '1';
            }
        };

        const autoRenderIUoM = () => {
             const container = document.getElementById('iuom-list-container');
             if (container && !container.dataset.bound) {
                 renderIUoMList();
                 container.dataset.bound = '1';
             }
        };
        
        const autoRenderICR = () => {
            const container = document.getElementById('item-cross-reference-list-container');
            if (container && !container.dataset.bound) {
                renderItemCrossReferenceList();
                container.dataset.bound = '1';
            }
        };

        const autoRenderICV = () => {
            const container = document.getElementById('icv-list-container');
            if (container && !container.dataset.bound) {
                 window.renderInventoryControlValuesList();
                 container.dataset.bound = '1';
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    autoRenderItem();
                    autoRenderIUoM();
                    autoRenderICR();
                    autoRenderICV();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('content:rendered', (e) => {
            if (e.detail.key === 'item') {
                window.renderItemList();
            } else if (e.detail.key === 'item-unit-of-measure') {
                window.renderIUoMList();
            } else if (e.detail.key === 'item-cross-reference') {
                window.renderItemCrossReferenceList();
            } else if (e.detail.key === 'inventory-control-values') {
                window.renderInventoryControlValuesList();
            }
        });
        
        const originalSelectCategory = window.selectCategory;
        window.selectCategory = function(category) {
            originalSelectCategory(category);
            document.dispatchEvent(new CustomEvent('content:rendered', { detail: { key: category } }));
        };
        
        // Listen for Esc key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.fixed.inset-0:not(.hidden)');
                if (modal) {
                    closeModal(modal.id);
                }
            }
        });
        
        window.navigateToHome();

        console.log('Configuration V4 (Item & IUoM) loaded successfully');
    });
})();

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
        
        if (category === 'item') {
            window.renderItemList();
        } else if (category === 'item-unit-of-measure') {
            window.renderIUoMList();
        } else if (category === 'item-cross-reference') {
            window.renderItemCrossReferenceList();
        } else {
            const rendererName = `render${category.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}List`;
            if (typeof window[rendererName] === 'function') {
                window[rendererName]();
            } else {
                console.warn(`Renderer for category '${category}' (${rendererName}) not found.`);
            }
        }

        if (window.innerWidth < 768) {
            window.closeSidebar();
        }
        
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
        <p class="text-gray-700">Pilih kategori dari menu untuk memulai.</p>
    </div>`;
    if (mainContent) {
        mainContent.innerHTML = homeContent;
    }
};
