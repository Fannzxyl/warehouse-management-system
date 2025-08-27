(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // Memastikan window.contentData sudah tersedia
        if (typeof window.contentData === 'undefined') {
            window.contentData = {};
        }
        if (typeof window.searchItems === 'undefined') window.searchItems = [];
        if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
        if (typeof window.allMenus === 'undefined') window.allMenus = [];

        // --- UTILITY FUNCTIONS ---
        // Debounce function to limit how often a function is called
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }
        
        // Trap focus inside modal. Returns a cleanup function.
        function trapFocus(modal) {
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const focusableContent = modal.querySelectorAll(focusableElements);
            if(focusableContent.length === 0) return () => {}; // No focusable elements, do nothing.

            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];
            
            const keydownHandler = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstFocusableElement) {
                            lastFocusableElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastFocusableElement) {
                            firstFocusableElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };

            modal.addEventListener('keydown', keydownHandler);
            firstFocusableElement.focus();
            
            // Return cleanup function to remove the listener
            return () => {
                modal.removeEventListener('keydown', keydownHandler);
            };
        }
        
        // Helper function for custom alerts/confirms
        // Mengimplementasikan pop-up kustom untuk menggantikan alert() dan console.log()
        window.showCustomAlert = async (title, message) => {
            return new Promise((resolve) => {
                const modalHtml = `
                    <div id="custom-alert-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
                            <h3 class="text-lg font-bold mb-2">${title}</h3>
                            <p class="text-sm text-gray-700 mb-4">${message}</p>
                            <div class="flex justify-end">
                                <button id="custom-alert-ok-button" class="btn btn-primary">OK</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                document.getElementById('custom-alert-ok-button').addEventListener('click', () => {
                    document.getElementById('custom-alert-modal').remove();
                    resolve();
                });
            });
        };

        window.showCustomConfirm = async (title, message) => {
            return new Promise((resolve) => {
                const modalHtml = `
                    <div id="custom-confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                        <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
                            <h3 class="text-lg font-bold mb-2">${title}</h3>
                            <p class="text-sm text-gray-700 mb-4">${message}</p>
                            <div class="flex justify-end gap-2">
                                <button id="custom-confirm-cancel-button" class="btn">Cancel</button>
                                <button id="custom-confirm-ok-button" class="btn btn-primary">OK</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                document.getElementById('custom-confirm-ok-button').addEventListener('click', () => {
                    document.getElementById('custom-confirm-modal').remove();
                    resolve(true);
                });
                document.getElementById('custom-confirm-cancel-button').addEventListener('click', () => {
                    document.getElementById('custom-confirm-modal').remove();
                    resolve(false);
                });
            });
        };

        // --- DUMMY DATA ---
        window._adjUsers = [
            'Administrator', 'AgungI100534', 'Asep20180322', 'BagusI17070009', 'BudI12020069', 'Checkreceiving01',
            'Checkreturn01', 'Cyclecounter01', 'FadhilI100520', 'FitrianiI100532', 'HadiP17070019', 'HasanI100536',
            'IrfanF100522', 'JokoW100525', 'JuliantoE100526', 'KadirsyahD100528', 'KurniawanS100530', 'LestariI100535',
            'MaulanaF100531', 'NurulA100533', 'PrabowoS100523', 'PutriD100529', 'RizkiF100521', 'SitiR100537',
            'SutantoA100538', 'TaufikH100539', 'UmarB100540', 'WahyudiJ100541', 'YaniP100542', 'ZainalA100543',
            'User1', 'User2', 'User3', 'User4', 'User5', 'User6', 'User7', 'User8', 'User9', 'User10',
            'User11', 'User12', 'User13', 'User14', 'User15', 'User16', 'User17', 'User18', 'User19', 'User20'
        ].sort();

        window._workCreationMasters = ['PUTAWAY', 'REPLENISHMENT', 'PICKING', 'COUNTING'].sort();
        window._itemBalanceUploadValues = ['Yes', 'No'];
        window._systemValue1Values = ['Yes', 'No'];

        // --- STATE & LOCAL STORAGE ---
        // Penyatuan data untuk Adjustment Type
        let adjustmentTypes = JSON.parse(localStorage.getItem('adjustmentTypes')) || [
             { id: 'ADJ000', identifier: '000-Adj empties', recordType: 'ADJTYPE', description: '000-Adj empties (provisi by GOLD)', inactive: false, systemCreated: true, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: true, workCreationMaster: 'PUTAWAY', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: ['Administrator'], userDefined: {} },
             { id: 'ADJ001', identifier: '000-Invoice Matching', recordType: 'ADJTYPE', description: '000-Invoice Matching', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ002', identifier: '001-Exp Date Correction', recordType: 'ADJTYPE', description: 'Expired Date Correction', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ003', identifier: '002-Inv Correct Migration', recordType: 'ADJTYPE', description: '002-Inv Correct Migration', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ004', identifier: '002-Inventory Corr min', recordType: 'ADJTYPE', description: '002-Inventory Corr min', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ005', identifier: '002-Inventory Correction', recordType: 'ADJTYPE', description: 'Inventory Correction', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ006', identifier: '100-Yogie Head Office(+)', recordType: 'ADJTYPE', description: 'Yogie Head Office', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ007', identifier: '201-InterdestOut(-)', recordType: 'ADJTYPE', description: 'Interdest Out', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ008', identifier: '301-Damaged Product(+)', recordType: 'ADJTYPE', description: 'Damage Product', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ009', identifier: '303-Production(+)', recordType: 'ADJTYPE', description: 'Production', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ010', identifier: '304 - Promotion Adjust', recordType: 'ADJTYPE', description: 'Adjustment Promotion', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ011', identifier: '305-Yogie Member Card', recordType: 'ADJTYPE', description: 'Adjustment Yogie Member Card (YMC)', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ012', identifier: '311 - Store Supply', recordType: 'ADJTYPE', description: 'Store Supply', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ013', identifier: '314 - Employee Allowance', recordType: 'ADJTYPE', description: 'Employee Allowance', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ014', identifier: '316 - Adjustment stock', recordType: 'ADJTYPE', description: 'Adjustment stock', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ015', identifier: '324 - Correction Damage', recordType: 'ADJTYPE', description: 'Correction Damage', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ016', identifier: '325 - Flush Out OI', recordType: 'ADJTYPE', description: 'Flush Out OI', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ017', identifier: '351 - Cycle Count (+)', recordType: 'ADJTYPE', description: 'Cycle Count Positive Adjustment', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ018', identifier: '352 - Cycle Count (-)', recordType: 'ADJTYPE', description: 'Cycle Count Negative Adjustment', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ019', identifier: '353 - Outbound Excess (+)', recordType: 'ADJTYPE', description: 'Outbound Excess', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ020', identifier: '354 - Outbound Short (-)', recordType: 'ADJTYPE', description: 'Outbound Short', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ021', identifier: '355 - Replace (+)', recordType: 'ADJTYPE', description: 'Replacement for Outbound', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ022', identifier: '356 - Meat Resiok (-)', recordType: 'ADJTYPE', description: 'Meat Resiok', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ023', identifier: '357 - KIT Parent (+)', recordType: 'ADJTYPE', description: 'KIT Parent Positive Adjustment', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ024', identifier: '358 - KIT Child (-)', recordType: 'ADJTYPE', description: 'KIT Negative Adjustment', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ025', identifier: '400 - Td Fr /To Adjuro', recordType: 'ADJTYPE', description: '400 - Td Fr /To Adjuro', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ026', identifier: '51-InterdestIn(+)', recordType: 'ADJTYPE', description: 'Interdest In', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ027', identifier: '800-Return to Supplier(-)', recordType: 'ADJTYPE', description: '800-Return to Supplier (-)', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ028', identifier: 'Emptee External In', recordType: 'ADJTYPE', description: 'Emptee External in Suppliere DC In', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ029', identifier: 'Emptee External Out', recordType: 'ADJTYPE', description: 'Emptee External Out (DC ke Supplier)', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ030', identifier: 'Emptee Shipment', recordType: 'ADJTYPE', description: 'Emptee Shipment', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
             { id: 'ADJ031', identifier: 'Item Master Correction', recordType: 'ADJTYPE', description: 'Adjustment untuk perbaikan Item master', inactive: false, systemCreated: false, class: 'adjustment', qtyMin: -9999999, qtyMax: 0.00, rfInitiation: 'item_location', createWork: false, workCreationMaster: '', allowFrozenLocations: false, includeInInterfaceUploads: false, authorizedUsers: [], userDefined: {} },
        ];
        
        let harmonizedCodes = JSON.parse(localStorage.getItem('harmonizedCodes')) || [
            { id: 'HC000', identifier: '1234.56.7890', recordType: 'HARMONIZED', description: 'Dummy Harmonized Code 1', inactive: false, systemCreated: true },
            { id: 'HC001', identifier: '9876.54.3210', recordType: 'HARMONIZED', description: 'Dummy Harmonized Code 2', inactive: false, systemCreated: false },
            { id: 'HC002', identifier: '1122.33.4455', recordType: 'HARMONIZED', description: 'Dummy Harmonized Code 3', inactive: true, systemCreated: false }
        ];
        
        // Menambahkan state dan seed data untuk Location Class & Location Status
        let locationClasses = JSON.parse(localStorage.getItem('locationClasses')) || [
             { id: 'LC000', identifier: 'Equipment', recordType: 'LOCLASS', description: 'Material Handling Equipment', includeInItemBalanceUpload: 'Yes', systemCreated: true, inactive: false },
             { id: 'LC001', identifier: 'Inventory Storage', recordType: 'LOCLASS', description: 'Inventory Storage', includeInItemBalanceUpload: 'Yes', systemCreated: true, inactive: false },
             { id: 'LC002', identifier: 'P&D', recordType: 'LOCLASS', description: 'P&D', includeInItemBalanceUpload: 'Yes', systemCreated: true, inactive: false },
             { id: 'LC003', identifier: 'Put to Store', recordType: 'LOCLASS', description: 'Put to Store', includeInItemBalanceUpload: 'Yes', systemCreated: false, inactive: false },
             { id: 'LC004', identifier: 'Receiving Dock', recordType: 'LOCLASS', description: 'Receiving Dock', includeInItemBalanceUpload: 'No', systemCreated: true, inactive: false },
             { id: 'LC005', identifier: 'Receiving Pre-Check In', recordType: 'LOCLASS', description: 'Receiving Pre-Check In', includeInItemBalanceUpload: 'Yes', systemCreated: true, inactive: false },
             { id: 'LC006', identifier: 'Receiving Pre-Locate', recordType: 'LOCLASS', description: 'Receiving Pre-Locate', includeInItemBalanceUpload: 'No', systemCreated: true, inactive: false },
             { id: 'LC007', identifier: 'Shipping Dock', recordType: 'LOCLASS', description: 'Shipping Dock', includeInItemBalanceUpload: 'No', systemCreated: true, inactive: false },
             { id: 'LC008', identifier: 'Work Order Build', recordType: 'LOCLASS', description: 'Work Order Build', includeInItemBalanceUpload: 'Yes', systemCreated: false, inactive: false },
        ];
        
        let locationStatuses = JSON.parse(localStorage.getItem('locationStatuses')) || [
             { id: 'LS000', identifier: 'Empty', recordType: 'LOCSTATUS', description: 'Empty', systemValue1: 'Yes', systemCreated: true, inactive: false },
             { id: 'LS001', identifier: 'Frozen', recordType: 'LOCSTATUS', description: 'Frozen', systemValue1: 'Yes', systemCreated: true, inactive: false },
             { id: 'LS002', identifier: 'Picking', recordType: 'LOCSTATUS', description: 'Picking', systemValue1: 'Yes', systemCreated: true, inactive: false },
             { id: 'LS003', identifier: 'Storage', recordType: 'LOCSTATUS', description: 'Storage', systemValue1: 'Yes', systemCreated: true, inactive: false },
        ];
        
        // Menambahkan state dan seed data untuk Movement Class
        let movementClasses = JSON.parse(localStorage.getItem('movementClasses')) || [
            { id: 'MC0001', identifier: 'GRAS', recordType: 'MOVEMNTCLS', description: 'PROD RAS RETURN SUPPLIER', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0002', identifier: 'RED LIST SPM', recordType: 'MOVEMNTCLS', description: 'RED LIST SPM', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0003', identifier: 'BLAC', recordType: 'MOVEMNTCLS', description: 'PROD DELETE', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0004', identifier: 'BLU1', recordType: 'MOVEMNTCLS', description: 'Produk Private Label', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0005', identifier: 'BLUB', recordType: 'MOVEMNTCLS', description: 'PL Bahan Baku', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0006', identifier: 'BLUS', recordType: 'MOVEMNTCLS', description: 'PL Seasonal', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0007', identifier: 'CONS', recordType: 'MOVEMNTCLS', description: 'Produk Konsinyasi', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0008', identifier: 'GRAC', recordType: 'MOVEMNTCLS', description: 'PRODUK CONSIGNMENT RASIONALISASI', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0009', identifier: 'GRAD', recordType: 'MOVEMNTCLS', description: 'Produk Rasionalisasi Retur DC', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0010', identifier: 'GRAN', recordType: 'MOVEMNTCLS', description: 'produk food mayonnaise', systemValue1: 'No', systemCreated: true, inactive: false },
            { id: 'MC0011', identifier: 'GRASS', recordType: 'MOVEMNTCLS', description: 'PROD RAS RETURN SUPPLIER', systemValue1: 'No', systemCreated: true, inactive: false },
        ];


        // --- SAVE HELPERS ---
        function saveAdjustmentTypes() { 
            localStorage.setItem('adjustmentTypes', JSON.stringify(adjustmentTypes)); 
        }
        function saveHarmonizedCodes() {
            localStorage.setItem('harmonizedCodes', JSON.stringify(harmonizedCodes));
        }
        function saveLocationClasses() {
            localStorage.setItem('locationClasses', JSON.stringify(locationClasses));
        }
        function saveLocationStatuses() {
            localStorage.setItem('locationStatuses', JSON.stringify(locationStatuses));
        }
        function saveMovementClasses() {
            localStorage.setItem('movementClasses', JSON.stringify(movementClasses));
        }
        
        let currentAdjUsers = [];
        let adjTypeFormValidation = {};
        
        // --- CENTRALIZED HELPER FUNCTIONS ---
        // Penyatuan helper users
        const getAdjTypeAuthorizedUsers = () => {
            return Array.from(document.querySelectorAll('#adj-type-users-list .adj-type-user-checkbox:checked'))
                        .map(cb => cb.value);
        };
        
        const adjUserSearchHandler = debounce(() => {
            const selectedUsers = getAdjTypeAuthorizedUsers();
            _renderAdjUsers(selectedUsers);
        }, 300);

        const _renderAdjUsers = function(selected = []) {
            const box = document.getElementById('adj-type-users-list');
            if (!box) return;
            const q = (document.getElementById('adj-type-search-users')?.value || '').toLowerCase();
            const filteredUsers = window._adjUsers.filter(u => u.toLowerCase().includes(q));
            
            box.innerHTML = filteredUsers
                .map(u => `<label class="flex items-center gap-2 text-sm adj-type-user-label">
                    <input class="adj-type-user-checkbox" type="checkbox" value="${u}" ${selected.includes(u) ? 'checked' : ''}> ${u}
                </label>`).join('');
        };

        const activateTab = (tabId, modal) => {
            const tabButtons = modal.querySelectorAll('[role="tab"]');
            const tabPanes = modal.querySelectorAll('[role="tabpanel"]');
            
            tabButtons.forEach(btn => {
                btn.classList.remove('tab-active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(pane => pane.classList.add('hidden'));

            const activeBtn = modal.querySelector(`[data-tab="${tabId}"]`);
            const activePane = modal.querySelector(`[data-pane="${tabId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('tab-active');
                activeBtn.setAttribute('aria-selected', 'true');
            }
            if (activePane) activePane.classList.remove('hidden');
        };

        function validateAdjustmentTypeForm() {
            const identifier = document.getElementById('adj-type-identifier');
            const qtyMin = document.getElementById('adj-type-qtyMin');
            const qtyMax = document.getElementById('adj-type-qtyMax');
            const submitBtn = document.getElementById('adj-type-submit-button');

            // Reset validation state
            adjTypeFormValidation = {};
            let isValid = true;

            // Validation 1: Identifier is required
            if (!identifier.value.trim()) {
                adjTypeFormValidation.identifier = "Identifier is required.";
                isValid = false;
            } else {
                delete adjTypeFormValidation.identifier;
            }

            // Validation 2: qtyMin <= qtyMax
            const minVal = parseFloat(qtyMin.value);
            const maxVal = parseFloat(qtyMax.value);
            if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
                adjTypeFormValidation.qtyRange = "Minimum quantity cannot be greater than maximum quantity.";
                isValid = false;
            } else {
                delete adjTypeFormValidation.qtyRange;
            }
            
            // Update UI with validation errors
            const identifierError = document.getElementById('adj-type-identifier-error');
            const qtyRangeError = document.getElementById('adj-type-qty-range-error');
            
            if (identifierError) {
                if (adjTypeFormValidation.identifier) {
                    identifierError.textContent = adjTypeFormValidation.identifier;
                    identifierError.classList.remove('hidden');
                } else {
                    identifierError.classList.add('hidden');
                }
            }
            
            if (qtyRangeError) {
                if (adjTypeFormValidation.qtyRange) {
                    qtyRangeError.textContent = adjTypeFormValidation.qtyRange;
                    qtyRangeError.classList.remove('hidden');
                } else {
                    qtyRangeError.classList.add('hidden');
                }
            }

            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }

        function validateHarmonizedCodeForm() {
            const identifier = document.getElementById('hc-identifier');
            const submitBtn = document.getElementById('hc-submit-button');
            
            let isValid = true;
            if (!identifier.value.trim()) {
                isValid = false;
            }
            
            const identifierError = document.getElementById('hc-identifier-error');
            if (identifierError) {
                if (!isValid) {
                    identifierError.textContent = "Identifier is required.";
                    identifierError.classList.remove('hidden');
                } else {
                    identifierError.classList.add('hidden');
                }
            }
            
            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }
        
        // Fungsi validasi baru untuk Location Class
        function validateLocationClassForm() {
            const identifier = document.getElementById('lc-identifier');
            const submitBtn = document.getElementById('lc-submit-button');
            
            let isValid = true;
            if (!identifier.value.trim()) {
                isValid = false;
            }
            
            const identifierError = document.getElementById('lc-identifier-error');
            if (identifierError) {
                if (!isValid) {
                    identifierError.textContent = "Identifier is required.";
                    identifierError.classList.remove('hidden');
                } else {
                    identifierError.classList.add('hidden');
                }
            }
            
            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }
        
        // Fungsi validasi baru untuk Location Status
        function validateLocationStatusForm() {
            const identifier = document.getElementById('ls-identifier');
            const submitBtn = document.getElementById('ls-submit-button');
            
            let isValid = true;
            if (!identifier.value.trim()) {
                isValid = false;
            }
            
            const identifierError = document.getElementById('ls-identifier-error');
            if (identifierError) {
                if (!isValid) {
                    identifierError.textContent = "Identifier is required.";
                    identifierError.classList.remove('hidden');
                } else {
                    identifierError.classList.add('hidden');
                }
            }
            
            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }

        // Fungsi validasi baru untuk Movement Class
        function validateMovementClassForm() {
            const identifier = document.getElementById('mc-identifier');
            const submitBtn = document.getElementById('mc-submit-button');
            
            let isValid = true;
            if (!identifier.value.trim()) {
                isValid = false;
            }
            
            const identifierError = document.getElementById('mc-identifier-error');
            if (identifierError) {
                if (!isValid) {
                    identifierError.textContent = "Identifier is required.";
                    identifierError.classList.remove('hidden');
                } else {
                    identifierError.classList.add('hidden');
                }
            }
            
            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }


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
                <div class="flex justify-between items-center mt-4">
                    <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showAdjustmentTypeForm('create')">
                        Create New Adjustment Type
                    </button>
                    <input type="text" id="adj-type-search" placeholder="Search adjustment type..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAdjustmentTypeList(this.value)">
                </div>
                <div id="adjustment-type-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>

                <!-- Modal Adjustment Type -->
                <div id="adjustment-type-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1100px,95vw)] max-w-3xl bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="adjustment-type-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Adjustment Type</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeAdjustmentTypeForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="adjustment-type-form" onsubmit="handleAdjustmentTypeSubmit(event)">
                                <!-- Tabs -->
                                <div role="tablist" id="adj-type-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button role="tab" type="button" data-tab="gen" class="tab-active" aria-controls="pane-gen">General</button>
                                    <button role="tab" type="button" data-tab="auth" class="tab" aria-controls="pane-auth">Authorized users</button>
                                    <button role="tab" type="button" data-tab="ud" class="tab" aria-controls="pane-ud">User defined data</button>
                                </div>
    
                                <!-- Tab Panes -->
                                <div id="pane-gen" role="tabpanel" data-pane="gen" class="grid gap-4 md:grid-cols-2">
                                    <div class="md:col-span-2">
                                        <label for="adj-type-identifier" class="block text-sm mb-1">Adjustment type <span class="text-red-500">*</span></label>
                                        <input id="adj-type-identifier" name="identifier" required class="input" placeholder="e.g. 000-Adj empties">
                                        <p id="adj-type-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="adj-type-description" class="block text-sm mb-1">Description</label>
                                        <input id="adj-type-description" name="description" class="input" placeholder="Description">
                                    </div>
    
                                    <div class="md:col-span-2 grid md:grid-cols-2 gap-4">
                                        <fieldset>
                                            <legend class="text-sm font-medium mb-2">Adjustment class</legend>
                                            <div class="space-y-1 text-sm">
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="class" value="adjustment" class="custom-radio"> <span>Adjustment</span>
                                                </label>
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="class" value="status_change" class="custom-radio"> <span>Status change</span>
                                                </label>
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="class" value="qty_transfer" class="custom-radio"> <span>Quantity transfer</span>
                                                </label>
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="class" value="transfer" class="custom-radio"> <span>Transfer</span>
                                                </label>
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="class" value="warehouse_transfer" class="custom-radio"> <span>Warehouse transfer</span>
                                                </label>
                                            </div>
                                        </fieldset>
    
                                        <fieldset>
                                            <legend class="text-sm font-medium mb-2">Quantity values</legend>
                                            <div class="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label for="adj-type-qtyMin" class="block text-sm mb-1">Minimum qty</label>
                                                    <input id="adj-type-qtyMin" name="qtyMin" type="number" step="any" class="input">
                                                </div>
                                                <div>
                                                    <label for="adj-type-qtyMax" class="block text-sm mb-1">Maximum qty</label>
                                                    <input id="adj-type-qtyMax" name="qtyMax" type="number" step="any" class="input">
                                                </div>
                                            </div>
                                            <p id="adj-type-qty-range-error" class="text-xs text-red-500 mt-1 hidden">Minimum quantity cannot be greater than maximum quantity.</p>
                                        </fieldset>
                                    </div>
    
                                    <div class="md:col-span-2 grid md:grid-cols-2 gap-4">
                                        <fieldset>
                                            <legend class="text-sm font-medium mb-2">RF initiation type</legend>
                                            <div class="space-y-1 text-sm">
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="rfInitiation" value="item_location" class="custom-radio"> Item/location
                                                </label>
                                                <label class="flex items-center gap-2">
                                                    <input type="radio" name="rfInitiation" value="license_plate" class="custom-radio"> License plate
                                                </label>
                                            </div>
                                        </fieldset>
    
                                        <fieldset>
                                            <legend class="text-sm font-medium mb-2">Work values</legend>
                                            <label class="flex items-center gap-2 text-sm">
                                                <input id="adj-type-createWork" name="createWork" type="checkbox"> Create work
                                            </label>
                                            <label for="adj-type-workCreationMaster" class="block text-sm mt-2">Work creation master</label>
                                            <select id="adj-type-workCreationMaster" name="workCreationMaster" class="select" disabled>
                                                <option value="">-- Select master --</option>
                                                ${window._workCreationMasters.map(m => `<option value="${m}">${m}</option>`).join('')}
                                            </select>
                                        </fieldset>
                                    </div>
    
                                    <label class="flex items-center gap-2 text-sm md:col-span-2">
                                        <input id="adj-type-allowFrozenLocations" name="allowFrozenLocations" type="checkbox"> Allow for frozen locations
                                    </label>
                                    <label class="flex items-center gap-2 text-sm md:col-span-2">
                                        <input id="adj-type-includeInInterfaceUploads" name="includeInInterfaceUploads" type="checkbox"> Include in interface uploads
                                    </label>
    
                                    <label class="flex items-center gap-2 text-sm md:col-span-2">
                                        <input id="adj-type-inactive" name="inactive" type="checkbox"> Inactive
                                    </label>
                                    <input type="hidden" name="recordType" value="ADJTYPE">
                                    <input type="hidden" id="adj-type-system-created" name="systemCreated" value="false">
                                </div>
    
                                <div id="pane-auth" role="tabpanel" data-pane="auth" class="hidden">
                                    <div class="mb-3">
                                        <label for="adj-type-search-users" class="sr-only">Search users</label>
                                        <input id="adj-type-search-users" class="input" placeholder="Search users...">
                                    </div>
                                    <div id="adj-type-users-list" class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-auto border border-gray-200 p-3 rounded-lg">
                                        <!-- checkboxes injected -->
                                    </div>
                                    <div class="mt-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="adj-type-check-all" type="checkbox"> Check all
                                        </label>
                                    </div>
                                </div>
    
                                <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label for="adj-ud-loadNumber" class="block text-sm mb-1">Load number</label>
                                        <input id="adj-ud-loadNumber" name="userDefined_loadNumber" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-lamaProduksi" class="block text-sm mb-1">Lama produksi</label>
                                        <input id="adj-ud-lamaProduksi" name="userDefined_lamaProduksi" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-merkBB" class="block text-sm mb-1">Merk BB</label>
                                        <input id="adj-ud-merkBB" name="userDefined_merkBB" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-bbRijek" class="block text-sm mb-1">BB Rijek</label>
                                        <input id="adj-ud-bbRijek" name="userDefined_bbRijek" type="number" step="any" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-jmlPetugas" class="block text-sm mb-1">Jml Petugas</label>
                                        <input id="adj-ud-jmlPetugas" name="userDefined_jmlPetugas" type="number" step="1" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-receiptId" class="block text-sm mb-1">Receipt ID</label>
                                        <input id="adj-ud-receiptId" name="userDefined_receiptId" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-kodeProduksiBB" class="block text-sm mb-1">Kode Produksi BB</label>
                                        <input id="adj-ud-kodeProduksiBB" name="userDefined_kodeProduksiBB" type="text" class="input">
                                    </div>
                                    <div>
                                        <label for="adj-ud-kemasanRijek" class="block text-sm mb-1">Kemasan Rijek</label>
                                        <input id="adj-ud-kemasanRijek" name="userDefined_kemasanRijek" type="number" step="any" class="input">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeAdjustmentTypeForm()">Cancel</button>
                            <button id="adj-type-submit-button" type="submit" form="adjustment-type-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `,
        };
        // Konten untuk Harmonized Code
        window.contentData['harmonized-code'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Harmonized Code</h2>
                <p class="text-gray-600">Manage harmonized codes for inventory classification.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showHarmonizedCodeForm('create')">
                        Create New Harmonized Code
                    </button>
                    <input type="text" id="hc-search" placeholder="Search harmonized code..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterHarmonizedCodeList(this.value)">
                </div>
                <div id="hc-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>

                <!-- Modal Harmonized Code -->
                <div id="hc-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1100px,95vw)] max-w-3xl bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="hc-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Harmonized Code</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeHarmonizedCodeForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="hc-form" onsubmit="handleHarmonizedCodeSubmit(event)">
                                <div class="grid gap-4">
                                    <div>
                                        <label for="hc-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                                        <input id="hc-identifier" name="identifier" required class="input" placeholder="e.g. 1234.56.7890">
                                        <p id="hc-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div>
                                        <label for="hc-recordType" class="block text-sm mb-1">Record Type</label>
                                        <input id="hc-recordType" name="recordType" class="input bg-gray-100 text-wise-gray cursor-not-allowed" value="HARMONIZED" readonly>
                                    </div>
                                    <div>
                                        <label for="hc-description" class="block text-sm mb-1">Description</label>
                                        <input id="hc-description" name="description" class="input" placeholder="Description">
                                    </div>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="hc-inactive" name="inactive" type="checkbox"> Inactive
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="hc-systemCreated" name="systemCreated" type="checkbox"> System created
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeHarmonizedCodeForm()">Cancel</button>
                            <button id="hc-submit-button" type="submit" form="hc-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `
        };
        // Konten untuk Location Class
        window.contentData['location-class'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Location Class</h2>
                <p class="text-gray-600">Manage location classifications.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showLocationClassForm('create')">
                        Create New Location Class
                    </button>
                    <input type="text" id="lc-search" placeholder="Search location class..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocationClassList(this.value)">
                </div>
                <div id="lc-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>

                <!-- Modal Location Class -->
                <div id="lc-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1100px,95vw)] max-w-3xl bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="lc-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Location Class</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeLocationClassForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="lc-form" onsubmit="handleLocationClassSubmit(event)">
                                <div class="grid gap-4">
                                    <div>
                                        <label for="lc-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                                        <input id="lc-identifier" name="identifier" required class="input" placeholder="e.g. Equipment">
                                        <p id="lc-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div>
                                        <label for="lc-recordType" class="block text-sm mb-1">Record type</label>
                                        <input id="lc-recordType" name="recordType" class="input bg-gray-100 text-wise-gray cursor-not-allowed" value="LOCLASS" readonly>
                                    </div>
                                    <div>
                                        <label for="lc-description" class="block text-sm mb-1">Description</label>
                                        <input id="lc-description" name="description" class="input" placeholder="Description">
                                    </div>
                                    <div>
                                        <label for="lc-includeInItemBalanceUpload" class="block text-sm mb-1">Include in Item Balance Upload</label>
                                        <select id="lc-includeInItemBalanceUpload" name="includeInItemBalanceUpload" class="select">
                                            ${window._itemBalanceUploadValues.map(v => `<option value="${v}">${v}</option>`).join('')}
                                        </select>
                                    </div>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="lc-inactive" name="inactive" type="checkbox"> Inactive
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="lc-systemCreated" name="systemCreated" type="checkbox"> System created
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeLocationClassForm()">Cancel</button>
                            <button id="lc-submit-button" type="submit" form="lc-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `
        };
        
        // Konten baru untuk Location Status
        window.contentData['location-status'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Location Status</h2>
                <p class="text-gray-600">Manage different statuses for warehouse locations.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showLocationStatusForm('create')">
                        Create New Location Status
                    </button>
                    <input type="text" id="ls-search" placeholder="Search location status..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterLocationStatusList(this.value)">
                </div>
                <div id="ls-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>

                <!-- Modal Location Status -->
                <div id="ls-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1100px,95vw)] max-w-3xl bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="ls-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Location Status</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeLocationStatusForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="ls-form" onsubmit="handleLocationStatusSubmit(event)">
                                <div class="grid gap-4">
                                    <div>
                                        <label for="ls-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                                        <input id="ls-identifier" name="identifier" required class="input" placeholder="e.g. Empty">
                                        <p id="ls-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div>
                                        <label for="ls-recordType" class="block text-sm mb-1">Record type</label>
                                        <input id="ls-recordType" name="recordType" class="input bg-gray-100 text-wise-gray cursor-not-allowed" value="LOCSTATUS" readonly>
                                    </div>
                                    <div>
                                        <label for="ls-description" class="block text-sm mb-1">Description</label>
                                        <input id="ls-description" name="description" class="input" placeholder="Description">
                                    </div>
                                    <div>
                                        <label for="ls-systemValue1" class="block text-sm mb-1">System value 1</label>
                                        <select id="ls-systemValue1" name="systemValue1" class="select">
                                            ${window._systemValue1Values.map(v => `<option value="${v}">${v}</option>`).join('')}
                                        </select>
                                    </div>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="ls-inactive" name="inactive" type="checkbox"> Inactive
                                    </label>
                                    <label class="flex items-center gap-2 text-sm">
                                        <input id="ls-systemCreated" name="systemCreated" type="checkbox"> System created
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeLocationStatusForm()">Cancel</button>
                            <button id="ls-submit-button" type="submit" form="ls-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `
        };
        
        // Konten baru untuk Movement Class
        window.contentData['movement-class'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Movement Class</h2>
                <p class="text-gray-600">Categorize movements for tracking and reporting purposes.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showMovementClassForm('create')">
                        Create New Movement Class
                    </button>
                    <input type="text" id="mc-search" placeholder="Search movement class..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterMovementClassList(this.value)">
                </div>
                <div id="mc-list-container" class="mt-4 overflow-x-auto">
                    <!-- Table will be rendered here -->
                </div>

                <!-- Modal Movement Class -->
                <div id="mc-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(1100px,95vw)] max-w-3xl bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b border-gray-200 relative">
                            <h3 id="mc-form-title" class="text-lg font-semibold text-wise-dark-gray">Create New Movement Class</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" onclick="closeMovementClassForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="mc-form" onsubmit="handleMovementClassSubmit(event)">
                                <div class="grid gap-4">
                                    <div>
                                        <label for="mc-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                                        <input id="mc-identifier" name="identifier" required class="input" placeholder="e.g. GRAS">
                                        <p id="mc-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="mc-recordType" class="block text-sm mb-1">Record type</label>
                                        <input id="mc-recordType" name="recordType" class="input bg-gray-100 text-wise-gray cursor-not-allowed" value="MOVEMNTCLS" readonly>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="mc-description" class="block text-sm mb-1">Description</label>
                                        <input id="mc-description" name="description" class="input" placeholder="Description">
                                    </div>
                                    <div>
                                        <label for="mc-systemValue1" class="block text-sm mb-1">System value 1</label>
                                        <select id="mc-systemValue1" name="systemValue1" class="select">
                                            ${window._systemValue1Values.map(v => `<option value="${v}">${v}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="md:col-span-2 flex items-center gap-4 mt-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="mc-inactive" name="inactive" type="checkbox"> Inactive
                                        </label>
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="mc-systemCreated" name="systemCreated" type="checkbox"> System created
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeMovementClassForm()">Cancel</button>
                            <button id="mc-submit-button" type="submit" form="mc-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `
        };
        
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
        window.contentData['location-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Template</h2><p class="text-gray-600">Blueprint to create locations.</p>` };
        window.contentData['location-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Type</h2><p class="text-gray-600">Configure storage location types based on dimensions and weight.</p>` };
        window.contentData['lot-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Lot Template</h2><p class="text-gray-600">Define templates for lot numbers and expiration rules.</p>` };
        window.contentData['serial-number-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Serial Number Template</h2><p class="text-gray-600">Pattern for serials.</p>` };
        window.contentData['storage-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Storage Template</h2><p class="text-gray-600">Storage rule presets.</p>` };
        window.contentData['zone'] = { full: `<h2 class="text-xl font-semibold mb-4">Zone</h2><p class="text-gray-600">Manage all zones in the warehouse.</p>` };
        window.contentData['zone-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Zone Type</h2><p class="text-gray-600">Types of zones.</p>` };


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
        
        // --- RENDER LIST FUNCTIONS ---
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
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAdjustmentTypeForm('edit', '${ad.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAdjustmentType('${ad.id}')" title="Delete">
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

        window.filterAdjustmentTypeList = function(value) {
            renderAdjustmentTypeList(value);
        };

        window.renderHarmonizedCodeList = function(filter = '') {
            const container = document.getElementById('hc-list-container');
            if (!container) return;
            const filteredData = harmonizedCodes.filter(hc => hc.identifier.toLowerCase().includes(filter.toLowerCase()) || hc.description.toLowerCase().includes(filter.toLowerCase()));
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
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No harmonized codes found.</td></tr>`;
            } else {
                filteredData.forEach(hc => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${hc.identifier}</td>
                            <td class="py-3 px-6 text-left">${hc.description}</td>
                            <td class="py-3 px-6 text-left">${hc.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${hc.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showHarmonizedCodeForm('edit', '${hc.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteHarmonizedCode('${hc.id}')" title="Delete">
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

        window.filterAdjustmentTypeList = function(value) {
            renderAdjustmentTypeList(value);
        };
        
        window.filterHarmonizedCodeList = function(value) {
            renderHarmonizedCodeList(value);
        };

        // Fungsi render list baru untuk Location Class
        window.renderLocationClassList = function(filter = '') {
            const container = document.getElementById('lc-list-container');
            if (!container) return;
            const filteredData = locationClasses.filter(lc => lc.identifier.toLowerCase().includes(filter.toLowerCase()) || lc.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Include in Item Balance Upload</th>
                            <th class="py-3 px-6 text-left">System Created</th>
                            <th class="py-3 px-6 text-left">Active</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;
            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="6" class="py-3 px-6 text-center">No location classes found.</td></tr>`;
            } else {
                filteredData.forEach(lc => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${lc.identifier}</td>
                            <td class="py-3 px-6 text-left">${lc.description}</td>
                            <td class="py-3 px-6 text-left">${lc.includeInItemBalanceUpload}</td>
                            <td class="py-3 px-6 text-left">${lc.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${!lc.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showLocationClassForm('edit', '${lc.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteLocationClass('${lc.id}')" title="Delete">
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

        // Fungsi render list baru untuk Location Status
        window.renderLocationStatusList = function(filter = '') {
            const container = document.getElementById('ls-list-container');
            if (!container) return;
            const filteredData = locationStatuses.filter(ls => ls.identifier.toLowerCase().includes(filter.toLowerCase()) || ls.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">System value 1</th>
                            <th class="py-3 px-6 text-left">System created</th>
                            <th class="py-3 px-6 text-left">Active</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;
            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="6" class="py-3 px-6 text-center">No location statuses found.</td></tr>`;
            } else {
                filteredData.forEach(ls => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${ls.identifier}</td>
                            <td class="py-3 px-6 text-left">${ls.description}</td>
                            <td class="py-3 px-6 text-left">${ls.systemValue1}</td>
                            <td class="py-3 px-6 text-left">${ls.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${!ls.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showLocationStatusForm('edit', '${ls.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteLocationStatus('${ls.id}')" title="Delete">
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

        window.filterLocationClassList = function(value) {
            renderLocationClassList(value);
        };
        
        // Fungsi filter baru untuk Location Status
        window.filterLocationStatusList = function(value) {
            renderLocationStatusList(value);
        };

        // Fungsi render list baru untuk Movement Class
        window.renderMovementClassList = function(filter = '') {
            const container = document.getElementById('mc-list-container');
            if (!container) return;
            const filteredData = movementClasses.filter(mc => mc.identifier.toLowerCase().includes(filter.toLowerCase()) || mc.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Identifier</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">System value 1</th>
                            <th class="py-3 px-6 text-left">System created</th>
                            <th class="py-3 px-6 text-left">Active</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;
            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="6" class="py-3 px-6 text-center">No movement classes found.</td></tr>`;
            } else {
                filteredData.forEach(mc => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${mc.identifier}</td>
                            <td class="py-3 px-6 text-left">${mc.description}</td>
                            <td class="py-3 px-6 text-left">${mc.systemValue1}</td>
                            <td class="py-3 px-6 text-left">${mc.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-left">${!mc.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showMovementClassForm('edit', '${mc.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteMovementClass('${mc.id}')" title="Delete">
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

        // Fungsi filter baru untuk Movement Class
        window.filterMovementClassList = function(value) {
            renderMovementClassList(value);
        };


        window.showAdjustmentTypeForm = function(mode, id = null) {
            const modal = document.getElementById('adjustment-type-form-modal');
            const form = document.getElementById('adjustment-type-form');
            const title = document.getElementById('adjustment-type-form-title');
            const submitButton = document.getElementById('adj-type-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;
            
            // Set default values
            form.querySelector('input[name="class"][value="adjustment"]').checked = true;
            form.querySelector('input[name="rfInitiation"][value="item_location"]').checked = true;
            document.getElementById('adj-type-qtyMin').value = '';
            document.getElementById('adj-type-qtyMax').value = '';
            
            // Reset validation state
            adjTypeFormValidation = {};
            document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));

            // Modal visibility
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    // Simpan fungsi cleanup trapFocus di modal element
                    modal._untrap = trapFocus(modalContent);
                }
            }, 10);
            
            // Backdrop click handler
            modal.onclick = (e) => {
                if (e.target.id === 'adjustment-type-form-modal') closeAdjustmentTypeForm();
            };
            
            // Event delegation for tabs
            const tabList = document.getElementById('adj-type-tab-list');
            if (tabList) {
                // Remove existing click handler to prevent duplicates
                if (tabList._onClickHandler) {
                    tabList.removeEventListener('click', tabList._onClickHandler);
                }
                tabList._onClickHandler = (e) => {
                    if (e.target.role === 'tab') {
                        activateTab(e.target.dataset.tab, modal);
                    }
                };
                tabList.addEventListener('click', tabList._onClickHandler);

                // Keyboard navigation
                if (tabList._onKeydownHandler) {
                    tabList.removeEventListener('keydown', tabList._onKeydownHandler);
                }
                tabList._onKeydownHandler = (e) => {
                    const currentTab = e.target;
                    if (currentTab.getAttribute('role') !== 'tab') return;
                    
                    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
                    let newTab;
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const currentIndex = tabs.indexOf(currentTab);
                        let newIndex = (currentIndex + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                        newTab = tabs[newIndex];
                    } else if (e.key === 'Home') {
                        newTab = tabs[0];
                    } else if (e.key === 'End') {
                        newTab = tabs[tabs.length - 1];
                    }
                    
                    if (newTab) {
                        newTab.focus();
                        activateTab(newTab.dataset.tab, modal);
                    }
                };
                tabList.addEventListener('keydown', tabList._onKeydownHandler);
            }
            
            // Checkbox "Create work"
            const createWorkCheckbox = document.getElementById('adj-type-createWork');
            const workCreationMasterSelect = document.getElementById('adj-type-workCreationMaster');
            if (createWorkCheckbox && workCreationMasterSelect) {
                // Set handler via property to overwrite old ones
                createWorkCheckbox.onchange = (e) => {
                    workCreationMasterSelect.disabled = !e.target.checked;
                    if (e.target.checked) {
                        workCreationMasterSelect.focus();
                    } else {
                        workCreationMasterSelect.value = '';
                    }
                };
            }

            // Authorized users tab listeners
            const searchInput = document.getElementById('adj-type-search-users');
            if (searchInput) {
                searchInput.oninput = adjUserSearchHandler;
            }
            const checkAllCheckbox = document.getElementById('adj-type-check-all');
            if (checkAllCheckbox) {
                checkAllCheckbox.onchange = (e) => {
                    document.querySelectorAll('#adj-type-users-list .adj-type-user-checkbox').forEach(cb => cb.checked = e.target.checked);
                };
            }

            // Handle edit mode
            if (mode === 'create') {
                title.textContent = 'Create New Adjustment Type';
                if (submitButton) submitButton.textContent = 'Save';
                _renderAdjUsers();
                document.getElementById('adj-type-system-created').value = false;
                document.getElementById('adj-type-identifier').removeAttribute('readonly');
                document.getElementById('adj-type-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                // Ensure "Create work" select is disabled by default
                if (workCreationMasterSelect) workCreationMasterSelect.disabled = true;

            } else {
                title.textContent = 'Edit Adjustment Type';
                if (submitButton) submitButton.textContent = 'Update';
                const type = adjustmentTypes.find(at => at.id === id);
                if (type) {
                    document.getElementById('adj-type-identifier').value = type.identifier;
                    document.getElementById('adj-type-description').value = type.description;
                    document.getElementById('adj-type-inactive').checked = type.inactive;
                    document.getElementById('adj-type-system-created').value = type.systemCreated;

                    form.querySelector(`input[name="class"][value="${type.class}"]`).checked = true;
                    document.getElementById('adj-type-qtyMin').value = type.qtyMin;
                    document.getElementById('adj-type-qtyMax').value = type.qtyMax;
                    form.querySelector(`input[name="rfInitiation"][value="${type.rfInitiation}"]`).checked = true;
                    if (createWorkCheckbox) createWorkCheckbox.checked = type.createWork;
                    if (workCreationMasterSelect) {
                        workCreationMasterSelect.value = type.workCreationMaster;
                        workCreationMasterSelect.disabled = !type.createWork;
                    }
                    document.getElementById('adj-type-allowFrozenLocations').checked = type.allowFrozenLocations;
                    document.getElementById('adj-type-includeInInterfaceUploads').checked = type.includeInInterfaceUploads;
                    

                    if (type.userDefined) {
                        for (const key in type.userDefined) {
                            const el = document.getElementById(`adj-ud-${key}`);
                            if (el) el.value = type.userDefined[key];
                        }
                    }
                    
                    _renderAdjUsers(type.authorizedUsers);

                    if (type.systemCreated) {
                         document.getElementById('adj-type-identifier').setAttribute('readonly', true);
                         document.getElementById('adj-type-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            // Panggil validasi saat modal dibuka
            validateAdjustmentTypeForm();
            document.getElementById('adj-type-identifier').focus();
        };

        window.showHarmonizedCodeForm = function(mode, id = null) {
            const modal = document.getElementById('hc-form-modal');
            const form = document.getElementById('hc-form');
            const title = document.getElementById('hc-form-title');
            const submitButton = document.getElementById('hc-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Set default values
            document.getElementById('hc-recordType').value = 'HARMONIZED';
            document.getElementById('hc-inactive').checked = false;
            document.getElementById('hc-systemCreated').checked = false;
            
            // Handle edit mode
            if (mode === 'create') {
                title.textContent = 'Create New Harmonized Code';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('hc-identifier').removeAttribute('readonly');
                document.getElementById('hc-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');

            } else {
                title.textContent = 'Edit Harmonized Code';
                if (submitButton) submitButton.textContent = 'Update';
                const code = harmonizedCodes.find(hc => hc.id === id);
                if (code) {
                    document.getElementById('hc-identifier').value = code.identifier;
                    document.getElementById('hc-description').value = code.description;
                    document.getElementById('hc-inactive').checked = code.inactive;
                    document.getElementById('hc-systemCreated').checked = code.systemCreated;
                    if (code.systemCreated) {
                         document.getElementById('hc-identifier').setAttribute('readonly', true);
                         document.getElementById('hc-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            
            // Modal visibility
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modal._untrap = trapFocus(modalContent);
                }
            }, 10);
            
            // Backdrop click handler
            modal.onclick = (e) => {
                if (e.target.id === 'hc-form-modal') closeHarmonizedCodeForm();
            };

            // Panggil validasi saat modal dibuka
            validateHarmonizedCodeForm();
            document.getElementById('hc-identifier').focus();
        };
        
        // Fungsi show form baru untuk Location Class
        window.showLocationClassForm = function(mode, id = null) {
            const modal = document.getElementById('lc-form-modal');
            const form = document.getElementById('lc-form');
            const title = document.getElementById('lc-form-title');
            const submitButton = document.getElementById('lc-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Set default values
            document.getElementById('lc-recordType').value = 'LOCLASS';
            document.getElementById('lc-inactive').checked = false;
            document.getElementById('lc-systemCreated').checked = false;
            document.getElementById('lc-includeInItemBalanceUpload').value = 'Yes';
            
            // Handle edit mode
            if (mode === 'create') {
                title.textContent = 'Create New Location Class';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('lc-identifier').removeAttribute('readonly');
                document.getElementById('lc-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');

            } else {
                title.textContent = 'Edit Location Class';
                if (submitButton) submitButton.textContent = 'Update';
                const item = locationClasses.find(lc => lc.id === id);
                if (item) {
                    document.getElementById('lc-identifier').value = item.identifier;
                    document.getElementById('lc-description').value = item.description;
                    document.getElementById('lc-inactive').checked = item.inactive;
                    document.getElementById('lc-systemCreated').checked = item.systemCreated;
                    document.getElementById('lc-includeInItemBalanceUpload').value = item.includeInItemBalanceUpload;
                    if (item.systemCreated) {
                         document.getElementById('lc-identifier').setAttribute('readonly', true);
                         document.getElementById('lc-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            
            // Modal visibility
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modal._untrap = trapFocus(modalContent);
                }
            }, 10);
            
            // Backdrop click handler
            modal.onclick = (e) => {
                if (e.target.id === 'lc-form-modal') closeLocationClassForm();
            };

            // Panggil validasi saat modal dibuka
            validateLocationClassForm();
            document.getElementById('lc-identifier').focus();
        };
        
        // Fungsi show form baru untuk Location Status
        window.showLocationStatusForm = function(mode, id = null) {
            const modal = document.getElementById('ls-form-modal');
            const form = document.getElementById('ls-form');
            const title = document.getElementById('ls-form-title');
            const submitButton = document.getElementById('ls-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Set default values
            document.getElementById('ls-recordType').value = 'LOCSTATUS';
            document.getElementById('ls-inactive').checked = false;
            document.getElementById('ls-systemCreated').checked = false;
            document.getElementById('ls-systemValue1').value = 'Yes';
            
            // Handle edit mode
            if (mode === 'create') {
                title.textContent = 'Create New Location Status';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('ls-identifier').removeAttribute('readonly');
                document.getElementById('ls-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');

            } else {
                title.textContent = 'Edit Location Status';
                if (submitButton) submitButton.textContent = 'Update';
                const item = locationStatuses.find(ls => ls.id === id);
                if (item) {
                    document.getElementById('ls-identifier').value = item.identifier;
                    document.getElementById('ls-description').value = item.description;
                    document.getElementById('ls-inactive').checked = item.inactive;
                    document.getElementById('ls-systemCreated').checked = item.systemCreated;
                    document.getElementById('ls-systemValue1').value = item.systemValue1;
                    if (item.systemCreated) {
                         document.getElementById('ls-identifier').setAttribute('readonly', true);
                         document.getElementById('ls-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            
            // Modal visibility
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modal._untrap = trapFocus(modalContent);
                }
            }, 10);
            
            // Backdrop click handler
            modal.onclick = (e) => {
                if (e.target.id === 'ls-form-modal') closeLocationStatusForm();
            };

            // Panggil validasi saat modal dibuka
            validateLocationStatusForm();
            document.getElementById('ls-identifier').focus();
        };
        
        // Fungsi show form baru untuk Movement Class
        window.showMovementClassForm = function(mode, id = null) {
            const modal = document.getElementById('mc-form-modal');
            const form = document.getElementById('mc-form');
            const title = document.getElementById('mc-form-title');
            const submitButton = document.getElementById('mc-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Set default values
            document.getElementById('mc-recordType').value = 'MOVEMNTCLS';
            document.getElementById('mc-systemValue1').value = 'Yes';
            document.getElementById('mc-inactive').checked = false;
            document.getElementById('mc-systemCreated').checked = false;
            
            // Handle edit mode
            if (mode === 'create') {
                title.textContent = 'Create New Movement Class';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('mc-identifier').removeAttribute('readonly');
                document.getElementById('mc-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                
                // Set default for tabs
                const tabList = document.getElementById('mc-tab-list');
                if (tabList) {
                    const firstTab = tabList.querySelector('[data-tab="gen"]');
                    if(firstTab) activateTab('gen', modal);
                }

            } else {
                title.textContent = 'Edit Movement Class';
                if (submitButton) submitButton.textContent = 'Update';
                const item = movementClasses.find(mc => mc.id === id);
                if (item) {
                    document.getElementById('mc-identifier').value = item.identifier;
                    document.getElementById('mc-description').value = item.description;
                    document.getElementById('mc-systemValue1').value = item.systemValue1;
                    document.getElementById('mc-inactive').checked = item.inactive;
                    document.getElementById('mc-systemCreated').checked = item.systemCreated;
                    if (item.systemCreated) {
                         document.getElementById('mc-identifier').setAttribute('readonly', true);
                         document.getElementById('mc-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                    const tabList = document.getElementById('mc-tab-list');
                    if (tabList) {
                        const firstTab = tabList.querySelector('[data-tab="gen"]');
                        if(firstTab) activateTab('gen', modal);
                    }
                }
            }

            // Modal visibility
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('scale-100', 'opacity-100');
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modal._untrap = trapFocus(modalContent);
                }
            }, 10);
            
            // Backdrop click handler
            modal.onclick = (e) => {
                if (e.target.id === 'mc-form-modal') closeMovementClassForm();
            };
            
            // Event delegation for tabs
            const tabList = document.getElementById('mc-tab-list');
            if (tabList) {
                // Remove existing click handler to prevent duplicates
                if (tabList._onClickHandler) {
                    tabList.removeEventListener('click', tabList._onClickHandler);
                }
                tabList._onClickHandler = (e) => {
                    if (e.target.role === 'tab') {
                        activateTab(e.target.dataset.tab, modal);
                    }
                };
                tabList.addEventListener('click', tabList._onClickHandler);
                
                // Keyboard navigation
                if (tabList._onKeydownHandler) {
                    tabList.removeEventListener('keydown', tabList._onKeydownHandler);
                }
                tabList._onKeydownHandler = (e) => {
                    const currentTab = e.target;
                    if (currentTab.getAttribute('role') !== 'tab') return;
                    
                    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
                    let newTab;
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const currentIndex = tabs.indexOf(currentTab);
                        let newIndex = (currentIndex + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                        newTab = tabs[newIndex];
                    } else if (e.key === 'Home') {
                        newTab = tabs[0];
                    } else if (e.key === 'End') {
                        newTab = tabs[tabs.length - 1];
                    }
                    
                    if (newTab) {
                        newTab.focus();
                        activateTab(newTab.dataset.tab, modal);
                    }
                };
                tabList.addEventListener('keydown', tabList._onKeydownHandler);
            }
            
            // Panggil validasi saat modal dibuka
            validateMovementClassForm();
            document.getElementById('mc-identifier').focus();
        };



        window.closeAdjustmentTypeForm = function() {
            const modal = document.getElementById('adjustment-type-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                // Panggil fungsi cleanup trapFocus yang disimpan di element
                if (modal._untrap) {
                    modal._untrap();
                    delete modal._untrap;
                }
            }, 300); // match transition duration
        };

        window.closeHarmonizedCodeForm = function() {
            const modal = document.getElementById('hc-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                if (modal._untrap) {
                    modal._untrap();
                    delete modal._untrap;
                }
            }, 300);
        };
        
        // Fungsi close form baru untuk Location Class
        window.closeLocationClassForm = function() {
            const modal = document.getElementById('lc-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                if (modal._untrap) {
                    modal._untrap();
                    delete modal._untrap;
                }
            }, 300);
        };
        
        // Fungsi close form baru untuk Location Status
        window.closeLocationStatusForm = function() {
            const modal = document.getElementById('ls-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                if (modal._untrap) {
                    modal._untrap();
                    delete modal._untrap;
                }
            }, 300);
        };

        // Fungsi close form baru untuk Movement Class
        window.closeMovementClassForm = function() {
            const modal = document.getElementById('mc-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
                if (modal._untrap) {
                    modal._untrap();
                    delete modal._untrap;
                }
            }, 300);
        };


        window.handleAdjustmentTypeSubmit = async function(event) {
            event.preventDefault();
            if (!validateAdjustmentTypeForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const getNum = el => Number(el.value || 0);

            const newType = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['inactive'].checked,
                systemCreated: form['systemCreated'].value === 'true',
                class: (form.querySelector('input[name="class"]:checked') || {}).value || 'adjustment',
                qtyMin: getNum(form['qtyMin']),
                qtyMax: getNum(form['qtyMax']),
                rfInitiation: (form.querySelector('input[name="rfInitiation"]:checked') || {}).value || 'item_location',
                createWork: form['createWork'].checked,
                workCreationMaster: form['workCreationMaster'].value || '',
                allowFrozenLocations: form['allowFrozenLocations'].checked,
                includeInInterfaceUploads: form['includeInInterfaceUploads'].checked,
                authorizedUsers: getAdjTypeAuthorizedUsers(),
                userDefined: {
                    loadNumber: form['userDefined_loadNumber']?.value || '',
                    lamaProduksi: form['userDefined_lamaProduksi']?.value || '',
                    merkBB: form['userDefined_merkBB']?.value || '',
                    bbRijek: form['userDefined_bbRijek']?.value || '',
                    jmlPetugas: form['userDefined_jmlPetugas']?.value || '',
                    receiptId: form['userDefined_receiptId']?.value || '',
                    kodeProduksiBB: form['userDefined_kodeProduksiBB']?.value || '',
                    kemasanRijek: form['userDefined_kemasanRijek']?.value || '',
                }
            };

            let msg = '';
            if (mode === 'create') {
                // Cari ID tertinggi yang ada, lalu tambah 1
                const maxId = adjustmentTypes.reduce((max, item) => {
                    const num = parseInt(item.id.replace('ADJ', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newType.id = 'ADJ' + String(maxId + 1).padStart(3, '0');
                
                adjustmentTypes.push(newType);
                msg = 'Adjustment Type created successfully!';
            } else {
                const index = adjustmentTypes.findIndex(at => at.id === id);
                if (index !== -1) {
                    adjustmentTypes[index] = { ...adjustmentTypes[index], ...newType };
                    msg = 'Adjustment Type updated successfully!';
                }
            }
            saveAdjustmentTypes();
            // TUTUP modal dulu agar alert tidak tertutup oleh z-index modal form
            closeAdjustmentTypeForm();
            // Render list dulu supaya user melihat efeknya setelah OK
            window.renderAdjustmentTypeList();
            // Baru tampilkan alert
            await window.showCustomAlert('Success', msg);
        };
        
        window.handleHarmonizedCodeSubmit = async function(event) {
            event.preventDefault();
            if (!validateHarmonizedCodeForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const newCode = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                inactive: form['inactive'].checked,
                systemCreated: form['systemCreated'].checked,
            };

            let msg = '';
            if (mode === 'create') {
                const maxId = harmonizedCodes.reduce((max, item) => {
                    const num = parseInt(item.id.replace('HC', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newCode.id = 'HC' + String(maxId + 1).padStart(3, '0');
                
                harmonizedCodes.push(newCode);
                msg = 'Harmonized Code created successfully!';
            } else {
                const index = harmonizedCodes.findIndex(hc => hc.id === id);
                if (index !== -1) {
                    harmonizedCodes[index] = { ...harmonizedCodes[index], ...newCode };
                    msg = 'Harmonized Code updated successfully!';
                }
            }
            saveHarmonizedCodes();
            closeHarmonizedCodeForm();
            window.renderHarmonizedCodeList();
            await window.showCustomAlert('Success', msg);
        };

        // Fungsi submit baru untuk Location Class
        window.handleLocationClassSubmit = async function(event) {
            event.preventDefault();
            if (!validateLocationClassForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const newClass = {
                identifier: form['identifier'].value,
                recordType: 'LOCLASS',
                description: form['description'].value,
                includeInItemBalanceUpload: form['includeInItemBalanceUpload'].value,
                systemCreated: form['systemCreated'].checked,
                inactive: form['inactive'].checked,
            };

            let msg = '';
            if (mode === 'create') {
                const maxId = locationClasses.reduce((max, item) => {
                    const num = parseInt(item.id.replace('LC', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newClass.id = 'LC' + String(maxId + 1).padStart(3, '0');
                
                locationClasses.push(newClass);
                msg = 'Location Class created successfully!';
            } else {
                const index = locationClasses.findIndex(lc => lc.id === id);
                if (index !== -1) {
                    locationClasses[index] = { ...locationClasses[index], ...newClass };
                    msg = 'Location Class updated successfully!';
                }
            }
            saveLocationClasses();
            closeLocationClassForm();
            window.renderLocationClassList();
            await window.showCustomAlert('Success', msg);
        };
        
        // Fungsi submit baru untuk Location Status
        window.handleLocationStatusSubmit = async function(event) {
            event.preventDefault();
            if (!validateLocationStatusForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const newStatus = {
                identifier: form['identifier'].value,
                recordType: 'LOCSTATUS',
                description: form['description'].value,
                systemValue1: form['systemValue1'].value,
                systemCreated: form['systemCreated'].checked,
                inactive: form['inactive'].checked,
            };

            let msg = '';
            if (mode === 'create') {
                const maxId = locationStatuses.reduce((max, item) => {
                    const num = parseInt(item.id.replace('LS', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newStatus.id = 'LS' + String(maxId + 1).padStart(3, '0');
                
                locationStatuses.push(newStatus);
                msg = 'Location Status created successfully!';
            } else {
                const index = locationStatuses.findIndex(ls => ls.id === id);
                if (index !== -1) {
                    locationStatuses[index] = { ...locationStatuses[index], ...newStatus };
                    msg = 'Location Status updated successfully!';
                }
            }
            saveLocationStatuses();
            closeLocationStatusForm();
            window.renderLocationStatusList();
            await window.showCustomAlert('Success', msg);
        };

        // Fungsi submit baru untuk Movement Class
        window.handleMovementClassSubmit = async function(event) {
            event.preventDefault();
            if (!validateMovementClassForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const newClass = {
                identifier: form['identifier'].value,
                recordType: 'MOVEMNTCLS',
                description: form['description'].value,
                systemValue1: form['systemValue1'].value,
                systemCreated: form['systemCreated'].checked,
                inactive: form['inactive'].checked,
            };

            let msg = '';
            if (mode === 'create') {
                const maxId = movementClasses.reduce((max, item) => {
                    const num = parseInt(item.id.replace('MC', ''), 10);
                    return Math.max(max, isNaN(num) ? 0 : num);
                }, 0);
                newClass.id = 'MC' + String(maxId + 1).padStart(3, '0');
                
                movementClasses.push(newClass);
                msg = 'Movement Class created successfully!';
            } else {
                const index = movementClasses.findIndex(mc => mc.id === id);
                if (index !== -1) {
                    movementClasses[index] = { ...movementClasses[index], ...newClass };
                    msg = 'Movement Class updated successfully!';
                }
            }
            saveMovementClasses();
            closeMovementClassForm();
            window.renderMovementClassList();
            await window.showCustomAlert('Success', msg);
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

        window.deleteHarmonizedCode = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this harmonized code?');
            if (confirmed) {
                harmonizedCodes = harmonizedCodes.filter(hc => hc.id !== id);
                saveHarmonizedCodes();
                window.renderHarmonizedCodeList();
                await window.showCustomAlert('Deleted', 'Harmonized Code deleted successfully!');
            }
        };
        
        // Fungsi delete baru untuk Location Class
        window.deleteLocationClass = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this location class?');
            if (confirmed) {
                locationClasses = locationClasses.filter(lc => lc.id !== id);
                saveLocationClasses();
                window.renderLocationClassList();
                await window.showCustomAlert('Deleted', 'Location Class deleted successfully!');
            }
        };
        
        // Fungsi delete baru untuk Location Status
        window.deleteLocationStatus = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this location status?');
            if (confirmed) {
                locationStatuses = locationStatuses.filter(ls => ls.id !== id);
                saveLocationStatuses();
                window.renderLocationStatusList();
                await window.showCustomAlert('Deleted', 'Location Status deleted successfully!');
            }
        };
        
        // Fungsi delete baru untuk Movement Class
        window.deleteMovementClass = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this Movement Class?');
            if (confirmed) {
                movementClasses = movementClasses.filter(mc => mc.id !== id);
                saveMovementClasses();
                window.renderMovementClassList();
                await window.showCustomAlert('Deleted', 'Movement Class deleted successfully!');
            }
        };

        // --- EVENT LISTENERS ---
        // Listen for ESC key press on the whole document to close the modal
        document.addEventListener('keydown', (e) => {
            const adjModal = document.getElementById('adjustment-type-form-modal');
            const hcModal = document.getElementById('hc-form-modal');
            const lcModal = document.getElementById('lc-form-modal');
            const lsModal = document.getElementById('ls-form-modal');
            const mcModal = document.getElementById('mc-form-modal');
            const overlay = document.getElementById('custom-modal-overlay');

            if (e.key === 'Escape') {
                if (adjModal && !adjModal.classList.contains('hidden') && !(overlay && overlay.classList.contains('flex'))) {
                    closeAdjustmentTypeForm();
                }
                if (hcModal && !hcModal.classList.contains('hidden') && !(overlay && overlay.classList.contains('flex'))) {
                    closeHarmonizedCodeForm();
                }
                if (lcModal && !lcModal.classList.contains('hidden') && !(overlay && overlay.classList.contains('flex'))) {
                    closeLocationClassForm();
                }
                if (lsModal && !lsModal.classList.contains('hidden') && !(overlay && overlay.classList.contains('flex'))) {
                    closeLocationStatusForm();
                }
                if (mcModal && !mcModal.classList.contains('hidden') && !(overlay && overlay.classList.contains('flex'))) {
                    closeMovementClassForm();
                }
            }
        });

        // General input validation listeners
        document.addEventListener('input', (e) => {
            if (e.target && ['adj-type-identifier', 'adj-type-qtyMin', 'adj-type-qtyMax'].includes(e.target.id)) {
                validateAdjustmentTypeForm();
            }
            if (e.target && e.target.id === 'hc-identifier') {
                validateHarmonizedCodeForm();
            }
            if (e.target && e.target.id === 'lc-identifier') {
                validateLocationClassForm();
            }
            // Tambahkan listener validasi untuk Location Status
            if (e.target && e.target.id === 'ls-identifier') {
                validateLocationStatusForm();
            }
            // Tambahkan listener validasi untuk Movement Class
            if (e.target && e.target.id === 'mc-identifier') {
                validateMovementClassForm();
            }
        });
        
        // Event delegation for tabs on Movement Class modal
        const mcModal = document.getElementById('mc-form-modal');
        if(mcModal){
            const tabList = mcModal.querySelector('#mc-tab-list');
            if(tabList){
                tabList.addEventListener('click', (e) => {
                    if (e.target.role === 'tab') {
                        activateTab(e.target.dataset.tab, mcModal);
                    }
                });
                tabList.addEventListener('keydown', (e) => {
                    const currentTab = e.target;
                    if (currentTab.getAttribute('role') !== 'tab') return;
                    
                    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
                    let newTab;
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const currentIndex = tabs.indexOf(currentTab);
                        let newIndex = (currentIndex + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                        newTab = tabs[newIndex];
                    } else if (e.key === 'Home') {
                        newTab = tabs[0];
                    } else if (e.key === 'End') {
                        newTab = tabs[tabs.length - 1];
                    }
                    
                    if (newTab) {
                        newTab.focus();
                        activateTab(newTab.dataset.tab, mcModal);
                    }
                });
            }
            const authTab = mcModal.querySelector('[data-tab="auth"]');
            if(authTab){
                 authTab.addEventListener('click', () => {
                     _renderAdjUsers();
                     const searchInput = document.getElementById('mc-search-users');
                     if (searchInput) {
                         searchInput.oninput = debounce(() => {
                             const q = searchInput.value.toLowerCase();
                             const labels = document.querySelectorAll('#mc-users-list .adj-type-user-label');
                             labels.forEach(label => {
                                 label.style.display = label.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
                             });
                         }, 300);
                     }
                     const checkAllCheckbox = document.getElementById('mc-check-all');
                     if (checkAllCheckbox) {
                         checkAllCheckbox.onchange = (e) => {
                             document.querySelectorAll('#mc-users-list .adj-type-user-checkbox').forEach(cb => cb.checked = e.target.checked);
                         };
                     }
                 });
            }
        }


        // ======================================
        // AUTO-RENDER on MOUNT
        // ======================================
        (function autoRenderV3() {
            const ensureAdjList = () => {
                const c = document.getElementById('adjustment-type-list-container');
                if (c && !c.dataset.bound) {
                    window.renderAdjustmentTypeList();
                    c.dataset.bound = '1'; // tandai sudah dirender
                }
            };
            const ensureHcList = () => {
                const c = document.getElementById('hc-list-container');
                if (c && !c.dataset.bound) {
                    window.renderHarmonizedCodeList();
                    c.dataset.bound = '1';
                }
            };
            const ensureLcList = () => {
                const c = document.getElementById('lc-list-container');
                if (c && !c.dataset.bound) {
                    window.renderLocationClassList();
                    c.dataset.bound = '1';
                }
            };
            // Tambahkan auto-render untuk Location Status
            const ensureLsList = () => {
                const c = document.getElementById('ls-list-container');
                if (c && !c.dataset.bound) {
                    window.renderLocationStatusList();
                    c.dataset.bound = '1';
                }
            };
            // Tambahkan auto-render untuk Movement Class
            const ensureMcList = () => {
                const c = document.getElementById('mc-list-container');
                if (c && !c.dataset.bound) {
                    window.renderMovementClassList();
                    c.dataset.bound = '1';
                }
            };
            
            // cek awal & setiap ada perubahan DOM
            const obs = new MutationObserver((mutations) => {
                ensureAdjList();
                ensureHcList();
                ensureLcList();
                ensureLsList(); 
                ensureMcList(); // Panggil auto-render untuk MC
            });
            obs.observe(document.body, { childList: true, subtree: true });
            ensureAdjList();
            ensureHcList();
            ensureLcList();
            ensureLsList(); 
            ensureMcList(); // Panggil saat inisialisasi
        })();
        
        console.log('Configuration V3 (Inventory Control) loaded successfully');
    });
})();
