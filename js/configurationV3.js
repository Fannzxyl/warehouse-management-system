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

        // Tambahkan data dummy untuk Inventory Control Values dan Item Class
        let inventoryControlValues = JSON.parse(localStorage.getItem('inventoryControlValues')) || [
            { id: 'icv_10', key: 10, description: 'Whether inventory is being tracked by default', systemValue: 'Y', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_40', key: 40, description: 'Default inventory status for adjustments', systemValue: 'Available', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_50', key: 50, description: 'Allow Duplicate Serial Numbers?', systemValue: 'N', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_70', key: 70, description: 'Write Location UM overrides on item UM Change', systemValue: 'N', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_110', key: 110, description: 'Should item be validated throughout system?', systemValue: 'Y', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_130', key: 130, description: 'Inventory status for frozen lots', systemValue: 'Held', valueRequired: true, systemCreated: true, userDefined: {} },
            { id: 'icv_160', key: 160, description: 'Adj Type For Status Change during Transfer', systemValue: 'Status Change', valueRequired: true, systemCreated: true, userDefined: {} }
        ];

        let itemClasses = JSON.parse(localStorage.getItem('itemClasses')) || [
            { id: 'ic_1', identifier: 'GENERAL', recordType: 'ITEMCLASS', description: 'GENERAL', storageTemplate: 'PC-IPCK-PCK-PLT', inactive: false, systemCreated: false },
            { id: 'ic_2', identifier: 'FRESH', recordType: 'ITEMCLASS', description: 'Fresh Products', storageTemplate: 'FR-STOR-REF-PLT', inactive: false, systemCreated: false },
            { id: 'ic_3', identifier: 'FROZEN', recordType: 'ITEMCLASS', description: 'Frozen Goods', storageTemplate: 'FZ-STOR-FRZ-PLT', inactive: true, systemCreated: true }
        ];

        // Data dummy untuk dropdown Storage Template
        window._storageTemplates = ['PC-IPCK-PCK-PLT', 'FR-STOR-REF-PLT', 'FZ-STOR-FRZ-PLT', 'DRY-STOR-GEN-PLT'];

        let storageTemplates = JSON.parse(localStorage.getItem('storageTemplates')) || [
            { id: 'st_1', identifier: '*Default', description: 'Default Storage Template', inactive: false, systemCreated: true, detailRecords: [{ sequence: 1, um: 'PLT', treatAsFullPercent: 100, groupDuringCheckIn: true }] },
            { id: 'st_2', identifier: 'KG', description: 'Kilogram', inactive: false, systemCreated: false, detailRecords: [{ sequence: 1, um: 'KG', treatAsFullPercent: 100, groupDuringCheckIn: false }] },
            { id: 'st_3', identifier: 'PC', description: 'Piece', inactive: false, systemCreated: false, detailRecords: [{ sequence: 1, um: 'PC', treatAsFullPercent: 100, groupDuringCheckIn: true }] },
            { id: 'st_4', identifier: 'PC-IPCK', description: 'Piece-InnerPack', inactive: false, systemCreated: false, detailRecords: [{ sequence: 1, um: 'PC', treatAsFullPercent: 100, groupDuringCheckIn: true }, { sequence: 2, um: 'IPCK', treatAsFullPercent: 100, groupDuringCheckIn: true }] },
            { id: 'st_5', identifier: 'PC-PCK', description: 'Piece-Pack', inactive: false, systemCreated: false, detailRecords: [{ sequence: 1, um: 'PC', treatAsFullPercent: 100, groupDuringCheckIn: true }, { sequence: 2, um: 'PCK', treatAsFullPercent: 100, groupDuringCheckIn: true }] },
            { id: 'st_6', identifier: 'PC-PCK-PLT', description: 'Piece-Pack-Pallet', inactive: false, systemCreated: false, detailRecords: [{ sequence: 1, um: 'PC', treatAsFullPercent: 100, groupDuringCheckIn: true }, { sequence: 2, um: 'PCK', treatAsFullPercent: 100, groupDuringCheckIn: true }, { sequence: 3, um: 'PLT', treatAsFullPercent: 100, groupDuringCheckIn: false }] },
        ];

        let inventoryStatuses = JSON.parse(localStorage.getItem('inventoryStatuses')) || [
    { id: 'is_1', identifier: 'Available', recordType: 'INVSTATUS', description: 'Available', inactive: false, systemCreated: true },
    { id: 'is_2', identifier: 'Held', recordType: 'INVSTATUS', description: 'Held', inactive: false, systemCreated: false }
];

let locationTemplates = JSON.parse(localStorage.getItem('locationTemplates')) || [
    { 
        id: 'lt_1', 
        identifier: '10A', 
        inactive: false, 
        separator: '', 
        useSpaceSeparator: true, 
        fields: [
            { length: 10, type: 'Alpha', description: 'LOCATION' },
            { length: null, type: '', description: '' },
            { length: null, type: '', description: '' },
            { length: null, type: '', description: '' },
            { length: null, type: '', description: '' }
        ],
        userDefined: {} 
    },
    { 
        id: 'lt_2', 
        identifier: '1A.1A.1N.1A', 
        inactive: false, 
        separator: '.', 
        useSpaceSeparator: false, 
        fields: [
            { length: 1, type: 'Alpha', description: 'AGING' },
            { length: 1, type: 'Alpha', description: 'STORE' },
            { length: 1, type: 'Num', description: 'num' },
            { length: 1, type: 'Alpha', description: 'alpha' },
            { length: null, type: '', description: '' }
        ],
        userDefined: {} 
    }
];
// Letakkan di bawah deklarasi `let locationTemplates = ...`
let lotTemplates = JSON.parse(localStorage.getItem('lotTemplates')) || [
    {
        id: 'lot_1',
        name: 'Expiry Date',
        inactive: false,
        descriptions: ['Expiry Date'],
        patternFields: [
            { type: 'Alphanumeric', length: 6, value: '' }
        ],
        userDefined: {}
    },
    {
        id: 'lot_2',
        name: 'Manufacturing Date',
        inactive: false,
        descriptions: ['Packing / Manufacturing Date'],
        patternFields: [],
        userDefined: {}
    }
];
let zones = JSON.parse(localStorage.getItem('zones')) || [
    { id: 'zone_1', identifier: 'A-DCB.BB.FACE', description: 'Zone pick face or raw material premix & Suggar', zoneType: 'Allocation', pickManagementActive: true, inactive: false, userDefined: {} },
    { id: 'zone_2', identifier: 'A-DCB.CDX.OPEN', description: 'Zone pick crossdock open', zoneType: 'Allocation', pickManagementActive: false, inactive: false, userDefined: {} }
];

        // Letakkan di bawah deklarasi `window._storageTemplates = ...`
        window._locationTemplateFieldTypes = ['Alpha', 'Num'];
        window._ums = ['PLT', 'KG', 'PC', 'IPCK', 'PCK'];
        window._lotTemplatePatternTypes = ['Alphanumeric', 'Date', 'Julian Date', 'Literal', 'Sequence Number'];
        window._zoneTypes = ['Allocation', 'Storage', 'Picking'];

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
        function saveInventoryControlValues() {
            localStorage.setItem('inventoryControlValues', JSON.stringify(inventoryControlValues));
        }
        function saveItemClasses() {
            localStorage.setItem('itemClasses', JSON.stringify(itemClasses));
        }
        function saveStorageTemplates() {
            localStorage.setItem('storageTemplates', JSON.stringify(storageTemplates));
        }
        function saveInventoryStatuses() {
    localStorage.setItem('inventoryStatuses', JSON.stringify(inventoryStatuses));
}
function saveLocationTemplates() {
    localStorage.setItem('locationTemplates', JSON.stringify(locationTemplates));
}
function saveLotTemplates() {
    localStorage.setItem('lotTemplates', JSON.stringify(lotTemplates));
}
function saveZones() {
    localStorage.setItem('zones', JSON.stringify(zones));
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
                // adjTypeFormValidation.identifier = "Identifier is required.";
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
                    // identifierError.textContent = "Identifier is required.";
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
                    // identifierError.textContent = "Identifier is required.";
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
                    // identifierError.textContent = "Identifier is required.";
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
                    // identifierError.textContent = "Identifier is required.";
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

        // Fungsi validasi baru untuk Inventory Control Values
        function validateICVForm() {
            const key = document.getElementById('icv-key');
            const submitBtn = document.getElementById('icv-submit-button');
            let isValid = true;
            if (!key.value.trim()) {
                isValid = false;
            }
            const keyError = document.getElementById('icv-key-error');
            if (keyError) {
                if (!isValid) {
                    keyError.textContent = "Key is required.";
                    keyError.classList.remove('hidden');
                } else {
                    keyError.classList.add('hidden');
                }
            }
            if (submitBtn) {
                submitBtn.disabled = !isValid;
            }
            return isValid;
        }

        // Fungsi validasi baru untuk Item Class
        function validateItemClassForm() {
            const identifier = document.getElementById('ic-identifier');
            const submitBtn = document.getElementById('ic-submit-button');
            
            let isValid = true;
            if (!identifier.value.trim()) {
                isValid = false;
            }
            const identifierError = document.getElementById('ic-identifier-error');
            if (identifierError) {
                if (!isValid) {
                    // identifierError.textContent = "Identifier is required.";
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

        window.contentData['inventory-control-values'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Inventory Control Values</h2>
                <p class="text-gray-600">Manage system-wide inventory control settings and defaults.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="btn btn-primary" onclick="showICVForm('create')">
                        Create New Value
                    </button>
                    <input type="text" id="icv-search" placeholder="Search by description..."
                            class="input max-w-xs" oninput="filterICVList(this.value)">
                </div>
                <div id="icv-list-container" class="mt-4 overflow-x-auto">
                    </div>

                <div id="icv-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(800px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b">
                            <h3 id="icv-form-title" class="text-lg font-semibold">Create New Value</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeICVForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="icv-form" onsubmit="handleICVSubmit(event)">
                                <div role="tablist" id="icv-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button role="tab" type="button" data-tab="gen" class="tab-active">General</button>
                                    <button role="tab" type="button" data-tab="ud" class="tab">User defined data</button>
                                </div>

                                <div id="pane-gen" role="tabpanel" data-pane="gen" class="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label for="icv-key" class="block text-sm mb-1">Key <span class="text-red-500">*</span></label>
                                        <input id="icv-key" name="key" type="number" required class="input" placeholder="e.g. 160">
                                        <p id="icv-key-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="icv-description" class="block text-sm mb-1">Description <span class="text-red-500">*</span></label>
                                        <input id="icv-description" name="description" required class="input" placeholder="Description of the control value">
                                    </div>
                                    <div>
                                        <label for="icv-systemValue" class="block text-sm mb-1">System value</label>
                                        <input id="icv-systemValue" name="systemValue" class="input" placeholder="e.g. Status Change">
                                    </div>
                                    <div class="flex items-end pb-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="icv-valueRequired" name="valueRequired" type="checkbox"> Value required
                                        </label>
                                    </div>
                                     <div class="md:col-span-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="icv-systemCreated" name="systemCreated" type="checkbox"> System created
                                        </label>
                                    </div>
                                </div>

                                <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                                    ${Array.from({length: 8}, (_, i) => `
                                    <div>
                                        <label for="icv-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label>
                                        <input id="icv-udf${i+1}" name="udf${i+1}" type="text" class="input">
                                    </div>
                                    `).join('')}
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeICVForm()">Cancel</button>
                            <button id="icv-submit-button" type="submit" form="icv-form" class="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            `
        };
        window.contentData['item-class'] = {
            full: `
                <h2 class="text-xl font-semibold mb-4">Item Class</h2>
                <p class="text-gray-600">Group items into different classes for easier management and reporting.</p>
                <div class="flex justify-between items-center mt-4">
                    <button class="btn btn-primary" onclick="showItemClassForm('create')">
                        Create New Item Class
                    </button>
                    <input type="text" id="item-class-search" placeholder="Search by identifier..."
                            class="input max-w-xs" oninput="filterItemClassList(this.value)">
                </div>
                <div id="item-class-list-container" class="mt-4 overflow-x-auto">
                    </div>

                <div id="item-class-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
                    <div class="modal-content w-[min(600px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                        <div class="px-6 pt-5 pb-3 border-b">
                            <h3 id="item-class-form-title" class="text-lg font-semibold">Create New Item Class</h3>
                            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeItemClassForm()" aria-label="Close">✕</button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <form id="item-class-form" onsubmit="handleItemClassSubmit(event)">
                                <div class="grid gap-4">
                                     <div>
                                        <label for="ic-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                                        <input id="ic-identifier" name="identifier" required class="input" placeholder="e.g. GENERAL">
                                        <p id="ic-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                    <div>
                                        <label for="ic-recordType" class="block text-sm mb-1">Record type</label>
                                        <input id="ic-recordType" name="recordType" class="input bg-gray-100" value="ITEMCLASS" readonly>
                                    </div>
                                    <div>
                                        <label for="ic-description" class="block text-sm mb-1">Description</label>
                                        <input id="ic-description" name="description" class="input" placeholder="Description of the item class">
                                    </div>
                                    <fieldset class="border p-4 rounded-lg">
                                        <legend class="text-sm font-medium px-2">System defined values</legend>
                                        <label for="ic-storageTemplate" class="block text-sm mb-1">Storage Template</label>
                                        <select id="ic-storageTemplate" name="storageTemplate" class="select">
                                            <option value="">-- Select Template --</option>
                                            ${window._storageTemplates.map(t => `<option value="${t}">${t}</option>`).join('')}
                                        </select>
                                    </fieldset>
                                     <div class="flex items-center gap-4 mt-2">
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="ic-inactive" name="inactive" type="checkbox"> Inactive
                                        </label>
                                        <label class="flex items-center gap-2 text-sm">
                                            <input id="ic-systemCreated" name="systemCreated" type="checkbox"> System created
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="px-6 py-4 border-t flex justify-end gap-3">
                            <button type="button" class="btn" onclick="closeItemClassForm()">Cancel</button>
                            <button id="ic-submit-button" type="submit" form="item-class-form" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                </div>
            `
        };
        window.contentData['storage-template'] = {
    full: `
        <h2 class="text-xl font-semibold mb-4">Storage Template</h2>
        <p class="text-gray-600">Define storage templates to standardize how items are stored.</p>
        <div class="flex justify-between items-center mt-4">
            <button class="btn btn-primary" onclick="showStorageTemplateForm('create')">
                Create New Storage Template
            </button>
            <input type="text" id="st-search" placeholder="Search template..."
                    class="input max-w-xs" oninput="filterStorageTemplateList(this.value)">
        </div>
        <div id="st-list-container" class="mt-4 overflow-x-auto">
        </div>
        
        <!-- Modal Storage Template -->
        <div id="st-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
            <div class="modal-content w-[min(900px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                <div class="px-6 pt-5 pb-3 border-b relative">
                    <h3 id="st-form-title" class="text-lg font-semibold">Create New Storage Template</h3>
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeStorageTemplateForm()" aria-label="Close">✕</button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="st-form" onsubmit="handleStorageTemplateSubmit(event)">
                        <div role="tablist" id="st-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                            <button role="tab" type="button" data-tab="gen" class="tab-active">General</button>
                            <button role="tab" type="button" data-tab="ud" class="tab">User defined data</button>
                        </div>
                        <div id="pane-gen" role="tabpanel" data-pane="gen" class="grid gap-4 md:grid-cols-2">
                            <div class="md:col-span-2">
                                <label for="st-identifier" class="block text-sm mb-1">Storage template <span class="text-red-500">*</span></label>
                                <input id="st-identifier" name="identifier" required class="input" placeholder="e.g. PC-IPCK-PCK-PLT">
                                <p id="st-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                            </div>
                            <div class="md:col-span-2">
                                <label for="st-description" class="block text-sm mb-1">Description</label>
                                <input id="st-description" name="description" class="input" placeholder="Description of the template">
                            </div>
                            <div class="md:col-span-2">
                                <label class="flex items-center gap-2 text-sm mt-2">
                                    <input id="st-inactive" name="inactive" type="checkbox"> Inactive
                                </label>
                                <label class="flex items-center gap-2 text-sm mt-2">
                                    <input id="st-systemCreated" name="systemCreated" type="checkbox"> System created
                                </label>
                            </div>
                            <div class="md:col-span-2 mt-4">
                                <h4 class="text-base font-semibold mb-2">Detail records</h4>
                                <div id="st-detail-records-list" class="space-y-3 p-4 border border-gray-200 rounded-lg">
                                </div>
                                <button type="button" class="btn mt-3" onclick="addStorageTemplateDetailRecord()">Add Detail</button>
                            </div>
                        </div>

                        <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                            ${Array.from({length: 8}, (_, i) => `
                            <div>
                                <label for="st-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label>
                                <input id="st-udf${i+1}" name="udf${i+1}" type="text" class="input">
                            </div>
                            `).join('')}
                        </div>
                    </form>
                </div>
                <div class="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" class="btn" onclick="closeStorageTemplateForm()">Cancel</button>
                    <button id="st-submit-button" type="submit" form="st-form" class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    `
};
window.contentData['inventory-status'] = {
    full: `
        <h2 class="text-xl font-semibold mb-4">Inventory Status</h2>
        <p class="text-gray-600">Manage inventory statuses like Available, Held, or Damaged.</p>
        <div class="flex justify-between items-center mt-4">
            <button class="btn btn-primary" onclick="showInventoryStatusForm('create')">
                Create New Status
            </button>
            <input type="text" id="is-search" placeholder="Search by identifier..."
                    class="input max-w-xs" oninput="filterInventoryStatusList(this.value)">
        </div>
        <div id="is-list-container" class="mt-4 overflow-x-auto">
            <!-- Tabel dirender di sini -->
        </div>

        <!-- Modal untuk Inventory Status -->
        <div id="is-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
            <div class="modal-content w-[min(600px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                <div class="px-6 pt-5 pb-3 border-b">
                    <h3 id="is-form-title" class="text-lg font-semibold">Create New Status</h3>
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeInventoryStatusForm()" aria-label="Close">✕</button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="is-form" onsubmit="handleInventoryStatusSubmit(event)" class="grid gap-4">
                        <div>
                            <label for="is-identifier" class="block text-sm mb-1">Identifier <span class="text-red-500">*</span></label>
                            <input id="is-identifier" name="identifier" required class="input" placeholder="e.g. Available">
                            <p id="is-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                        </div>
                        <div>
                            <label for="is-recordType" class="block text-sm mb-1">Record type</label>
                            <input id="is-recordType" name="recordType" class="input bg-gray-100" value="INVSTATUS" readonly>
                        </div>
                        <div>
                            <label for="is-description" class="block text-sm mb-1">Description</label>
                            <input id="is-description" name="description" class="input" placeholder="Description of the status">
                        </div>
                        <div class="flex items-center gap-4 mt-2">
                            <label class="flex items-center gap-2 text-sm">
                                <input id="is-inactive" name="inactive" type="checkbox"> Inactive
                            </label>
                            <label class="flex items-center gap-2 text-sm">
                                <input id="is-systemCreated" name="systemCreated" type="checkbox"> System created
                            </label>
                        </div>
                    </form>
                </div>
                <div class="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" class="btn" onclick="closeInventoryStatusForm()">Cancel</button>
                    <button id="is-submit-button" type="submit" form="is-form" class="btn btn-primary">OK</button>
                </div>
            </div>
        </div>
    `
};
window.contentData['location-template'] = {
    full: `
        <h2 class="text-xl font-semibold mb-4">Location Template</h2>
        <p class="text-gray-600">Define blueprints to generate new warehouse locations systematically.</p>
        <div class="flex justify-between items-center mt-4">
            <button class="btn btn-primary" onclick="showLocationTemplateForm('create')">
                Create New Template
            </button>
            <input type="text" id="lt-search" placeholder="Search by template..."
                    class="input max-w-xs" oninput="filterLocationTemplateList(this.value)">
        </div>
        <div id="lt-list-container" class="mt-4 overflow-x-auto">
            <!-- Tabel dirender di sini -->
        </div>

        <!-- Modal untuk Location Template -->
        <div id="lt-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
            <div class="modal-content w-[min(800px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                <div class="px-6 pt-5 pb-3 border-b">
                    <h3 id="lt-form-title" class="text-lg font-semibold">Create New Template</h3>
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeLocationTemplateForm()" aria-label="Close">✕</button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="lt-form" onsubmit="handleLocationTemplateSubmit(event)">
                        <div role="tablist" id="lt-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                            <button role="tab" type="button" data-tab="gen" class="tab-active">General</button>
                            <button role="tab" type="button" data-tab="ud" class="tab">User defined data</button>
                        </div>

                        <!-- Tab General -->
                        <div id="pane-gen" role="tabpanel" data-pane="gen">
                            <div>
                                <label for="lt-identifier" class="block text-sm mb-1">Location template <span class="text-red-500">*</span></label>
                                <input id="lt-identifier" name="identifier" required class="input" placeholder="e.g. 10A">
                                <p id="lt-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                            </div>
                            <div class="flex items-center gap-4 mt-4">
                                <div>
                                    <label for="lt-separator" class="block text-sm mb-1">Separator character</label>
                                    <input id="lt-separator" name="separator" class="input w-24" maxlength="1">
                                </div>
                                <label class="flex items-center gap-2 text-sm mt-6">
                                    <input id="lt-useSpaceSeparator" name="useSpaceSeparator" type="checkbox"> Use space as separator
                                </label>
                            </div>
                            <div id="lt-fields-container" class="mt-4 space-y-2">
                                <!-- Fields dirender di sini -->
                            </div>
                             <label class="flex items-center gap-2 text-sm mt-4">
                                <input id="lt-inactive" name="inactive" type="checkbox"> Inactive
                            </label>
                        </div>

                        <!-- Tab User Defined Data -->
                        <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                            ${Array.from({length: 8}, (_, i) => `
                            <div>
                                <label for="lt-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label>
                                <input id="lt-udf${i+1}" name="udf${i+1}" type="text" class="input">
                            </div>
                            `).join('')}
                        </div>
                    </form>
                </div>
                <div class="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" class="btn" onclick="closeLocationTemplateForm()">Cancel</button>
                    <button id="lt-submit-button" type="submit" form="lt-form" class="btn btn-primary">OK</button>
                </div>
            </div>
        </div>
    `
};
window.contentData['lot-template'] = {
    full: `
        <h2 class="text-xl font-semibold mb-4">Lot Template</h2>
        <p class="text-gray-600">Define templates for lot numbers and expiration rules.</p>
        <div class="flex justify-between items-center mt-4">
            <button class="btn btn-primary" onclick="showLotTemplateForm('create')">
                Create New Template
            </button>
            <input type="text" id="lot-template-search" placeholder="Search by template name..."
                    class="input max-w-xs" oninput="filterLotTemplateList(this.value)">
        </div>
        <div id="lot-template-list-container" class="mt-4 overflow-x-auto">
            <!-- Tabel list akan dirender di sini -->
        </div>

        <!-- MODAL STRUCTURE BARU (Mirip Allocation Selection) -->
        <div id="lot-template-form-modal" class="hidden fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-6 bg-black/40 overflow-y-auto" aria-modal="true" role="dialog">
            <div class="modal-content w-[min(1000px,95vw)] bg-white rounded-xl shadow-2xl flex flex-col max-h-[95vh] transition-all duration-300 opacity-0 scale-95">
                
                <!-- HEADER (Sticky) -->
                <div class="sticky top-0 z-10 px-6 pt-5 pb-3 border-b border-gray-200 bg-white rounded-t-xl flex-shrink-0">
                    <h3 id="lot-template-form-title" class="text-lg font-semibold text-wise-dark-gray"></h3>
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeLotTemplateForm()" aria-label="Close">✕</button>
                </div>
                
                <!-- BODY (Non-Scrollable) -->
                <div class="px-6 py-5 flex-grow">
                    <form id="lot-template-form" onsubmit="handleLotTemplateSubmit(event)">
                        <div class="p-5 border-b border-gray-100 -mx-6 -mt-5 mb-4 bg-gray-50/50">
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="lot-template-name" class="block text-sm mb-1 font-medium">Template name: <span class="text-red-500">*</span></label>
                                    <input id="lot-template-name" name="name" required class="input">
                                    <p id="lot-template-name-error" class="text-xs text-red-500 mt-1 hidden"></p>
                                </div>
                                <div>
                                    <label for="lot-template-description" class="block text-sm mb-1 font-medium">Description</label>
                                    <input id="lot-template-description" name="description" class="input">
                                </div>
                           </div>
                        </div>

                        <div role="tablist" id="lot-template-tab-list" class="flex space-x-6 mb-4 border-b border-wise-border">
                            <button role="tab" type="button" data-tab="pattern" class="tab-button tab-active">Pattern fields</button>
                            <button role="tab" type="button" data-tab="ud" class="tab-button">User defined data</button>
                        </div>

                        <div id="pane-pattern" role="tabpanel" data-pane="pattern">
                            <h3 class="text-sm font-semibold text-wise-dark-gray mb-3">Field criteria</h3>
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                               <div class="md:col-span-5">
                                    <label for="lt-pattern-type" class="block text-sm font-medium text-wise-dark-gray mb-1">Type</label>
                                    <select id="lt-pattern-type" class="select">${window._lotTemplatePatternTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select>
                               </div>
                               <div class="md:col-span-3">
                                    <label for="lt-pattern-length" class="block text-sm font-medium text-wise-dark-gray mb-1">Length</label>
                                    <input id="lt-pattern-length" type="number" class="input">
                               </div>
                               <div class="md:col-span-4">
                                    <label for="lt-pattern-value" class="block text-sm font-medium text-wise-dark-gray mb-1">Value</label>
                                    <input id="lt-pattern-value" type="text" class="input">
                               </div>
                            </div>

                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-12 lg:col-span-2 flex flex-col gap-2">
                                    <button type="button" class="btn btn-primary" id="lt-btn-add">Add</button>
                                    <button type="button" class="btn btn-primary" id="lt-btn-update">Update</button>
                                    <button type="button" class="btn btn-primary" id="lt-btn-clear">Clear</button>
                                </div>
                                <div class="col-span-12 lg:col-span-7">
                                     <div class="border rounded-lg h-full flex flex-col">
                                        <div class="flex items-center justify-between px-3 py-2 border-b bg-gray-50/70 rounded-t-lg">
                                            <span class="text-xs uppercase tracking-wider text-wise-gray">Current Pattern</span>
                                        </div>
                                        <div id="lot-template-patterns-list" class="p-2 flex-1 overflow-auto min-h-[120px] font-mono text-sm">
                                            <!-- Pattern list rendered here -->
                                        </div>
                                    </div>
                                </div>
                                <div class="col-span-12 lg:col-span-3 flex flex-col gap-2">
                                    <button type="button" id="lt-btn-up" class="btn btn-primary">↑ Up</button>
                                    <button type="button" id="lt-btn-down" class="btn btn-primary">↓ Down</button>
                                    <div class="h-2"></div>
                                    <button type="button" id="lt-btn-remove" class="btn btn-primary">Remove selected</button>
                                </div>
                            </div>
                            <div class="mt-4">
                                <label class="flex items-center gap-2 text-sm">
                                   <input id="lot-template-inactive" name="inactive" type="checkbox"> Inactive
                               </label>
                            </div>
                        </div>

                        <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                            ${Array.from({length: 8}, (_, i) => `
                            <div>
                                <label for="lot-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label>
                                <input id="lot-udf${i+1}" name="udf${i+1}" type="text" class="input">
                            </div>
                            `).join('')}
                        </div>
                    </form>
                </div>
                
                <!-- FOOTER (Sticky) -->
                <div class="sticky bottom-0 z-10 px-6 py-3 border-t border-gray-200 flex justify-end gap-3 bg-white rounded-b-xl flex-shrink-0">
                    <button type="button" class="btn" onclick="closeLotTemplateForm()">Cancel</button>
                    <button id="lot-template-submit-button" type="submit" form="lot-template-form" class="btn btn-primary">OK</button>
                </div>
            </div>
        </div>
    `
};
window.contentData['zone'] = {
    full: `
        <h2 class="text-xl font-semibold mb-4">Zone</h2>
        <p class="text-gray-600">Manage warehouse zones for different purposes like picking or storage.</p>
        <div class="flex justify-between items-center mt-4">
            <button class="btn btn-primary" onclick="showZoneForm('create')">
                Create New Zone
            </button>
            <input type="text" id="zone-search" placeholder="Search by zone..."
                    class="input max-w-xs" oninput="filterZoneList(this.value)">
        </div>
        <div id="zone-list-container" class="mt-4 overflow-x-auto">
            <!-- Tabel dirender di sini -->
        </div>

        <!-- Modal untuk Zone -->
        <div id="zone-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30" aria-modal="true" role="dialog">
            <div class="modal-content w-[min(800px,95vw)] bg-white rounded-xl shadow-2xl grid grid-rows-[auto,1fr,auto] max-h-[85vh] opacity-0 scale-95 transition-all">
                <div class="px-6 pt-5 pb-3 border-b">
                    <h3 id="zone-form-title" class="text-lg font-semibold">Create New Zone</h3>
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeZoneForm()" aria-label="Close">✕</button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="zone-form" onsubmit="handleZoneSubmit(event)">
                        <div class="mb-4">
                            <label for="zone-identifier" class="block text-sm mb-1">Zone: <span class="text-red-500">*</span></label>
                            <input id="zone-identifier" name="identifier" required class="input">
                            <p id="zone-identifier-error" class="text-xs text-red-500 mt-1 hidden"></p>
                        </div>
                        <div class="mb-4">
                            <label for="zone-description" class="block text-sm mb-1">Description:</label>
                            <input id="zone-description" name="description" class="input">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="zone-type" class="block text-sm mb-1">Zone type:</label>
                                <select id="zone-type" name="zoneType" class="select">
                                    ${window._zoneTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                                </select>
                            </div>
                            <div class="flex items-end pb-2">
                                <label class="flex items-center gap-2 text-sm">
                                    <input id="zone-pick-management" name="pickManagementActive" type="checkbox"> Pick management active
                                </label>
                            </div>
                        </div>
                        
                        <div role="tablist" id="zone-tab-list" class="border-b mb-4 flex gap-4 text-sm font-medium">
                            <button role="tab" type="button" data-tab="ud" class="tab-active">User defined data</button>
                        </div>

                        <div id="pane-ud" role="tabpanel" data-pane="ud" class="grid gap-3 md:grid-cols-2">
                            ${Array.from({length: 8}, (_, i) => `
                            <div>
                                <label for="zone-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label>
                                <input id="zone-udf${i+1}" name="udf${i+1}" type="text" class="input">
                            </div>
                            `).join('')}
                        </div>
                        
                        <label class="flex items-center gap-2 text-sm mt-4">
                            <input id="zone-inactive" name="inactive" type="checkbox"> Inactive
                        </label>
                    </form>
                </div>
                <div class="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" class="btn" onclick="closeZoneForm()">Cancel</button>
                    <button id="zone-submit-button" type="submit" form="zone-form" class="btn btn-primary">OK</button>
                </div>
            </div>
        </div>
    `
};
        window.contentData['item'] = { full: `<h2 class="text-xl font-semibold mb-4">Item</h2><p class="text-gray-600">Manage all items in the inventory.</p>` };
        window.contentData['item-cross-reference'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Cross Reference</h2><p class="text-gray-600">Manage cross-references for items (e.g., different part numbers).</p>` };
        window.contentData['item-location-assignment'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Location Assignment</h2><p class="text-gray-600">Assign specific items to warehouse locations.</p>` };
        window.contentData['item-location-capacity'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Location Capacity</h2><p class="text-gray-600">Define capacity rules for items in specific locations.</p>` };
        window.contentData['item-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Template</h2><p class="text-gray-600">Create templates for new items to standardize properties.</p>` };
        window.contentData['item-unit-of-measure'] = { full: `<h2 class="text-xl font-semibold mb-4">Item Unit of Measure</h2><p class="text-gray-600">Manage different units of measure for items.</p>` };
        window.contentData['location'] = { full: `<h2 class="text-xl font-semibold mb-4">Location</h2><p class="text-gray-600">Manage all storage locations in the warehouse.</p>` };
        window.contentData['location-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Location Type</h2><p class="text-gray-600">Configure storage location types based on dimensions and weight.</p>` };
        window.contentData['serial-number-template'] = { full: `<h2 class="text-xl font-semibold mb-4">Serial Number Template</h2><p class="text-gray-600">Pattern for serials.</p>` };
        window.contentData['zone-type'] = { full: `<h2 class="text-xl font-semibold mb-4">Zone Type</h2><p class="text-gray-600">Types of zones.</p>` };


        // Mapping parent→children & registrasi ke pencarian/menu global
        window.parentMapping['inventory-control'] = 'configuration'; // Parent dari Inventory Control adalah Configuration
        invChildren.forEach(key => {
            window.parentMapping[key] = 'inventory-control'; // Child → parent
            // Daftarkan ke menu & pencarian global
            window.searchItems.push({ id: key, title: invMeta[key][0], category: 'Inventory Control', lastUpdated: 'Latest' });
            window.allMenus.push({ name: invMeta[key][0], category: 'Inventory Control' });
        });
        window.parentMapping['storage-template'] = 'inventory-control';
        
        // Daftarkan key root juga
        window.searchItems.push({ id: 'inventory-control', title: 'Inventory Control', category: 'Configurations', lastUpdated: 'Latest' });
        window.allMenus.push({ name: 'Inventory Control', category: 'Configurations' });
        window.searchItems.push({ id: 'storage-template', title: 'Storage Template', category: 'Inventory Control', lastUpdated: 'Latest' });
window.allMenus.push({ name: 'Storage Template', category: 'Inventory Control' });
        
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

        window.renderStorageTemplateList = function(filter = '') {
    const container = document.getElementById('st-list-container');
    if (!container) return;
    const filteredData = storageTemplates.filter(st => st.identifier.toLowerCase().includes(filter.toLowerCase()) || st.description.toLowerCase().includes(filter.toLowerCase()));
    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Storage template</th>
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">System created</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;
    if (filteredData.length === 0) {
        tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No storage templates found.</td></tr>`;
    } else {
        filteredData.forEach(st => {
            tableHtml += `
                <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                    <td class="py-3 px-6 text-left whitespace-nowrap">${st.identifier}</td>
                    <td class="py-3 px-6 text-left">${st.description}</td>
                    <td class="py-3 px-6 text-left">${st.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-left">${!st.inactive ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showStorageTemplateForm('edit', '${st.id}')" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteStorageTemplate('${st.id}')" title="Delete">
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

        window.filterStorageTemplateList = function(value) {
    renderStorageTemplateList(value);
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

        // Fungsi render list baru untuk Inventory Control Values
        window.renderICVList = function(filter = '') {
            const container = document.getElementById('icv-list-container');
            if (!container) return;
            const filteredData = inventoryControlValues.filter(icv => icv.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Key</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">System Value</th>
                            <th class="py-3 px-6 text-left">System Created</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;
            if (filteredData.length === 0) {
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No inventory control values found.</td></tr>`;
            } else {
                filteredData.forEach(icv => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${icv.key}</td>
                            <td class="py-3 px-6 text-left">${icv.description}</td>
                            <td class="py-3 px-6 text-left">${icv.systemValue}</td>
                            <td class="py-3 px-6 text-left">${icv.systemCreated ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showICVForm('edit', '${icv.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 h-6 p-1 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteICV('${icv.id}')" title="Delete">
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

        // Ganti fungsi renderItemClassList yang lama dengan yang ini
window.renderItemClassList = function(filter = '') {
    const container = document.getElementById('item-class-list-container');
    if (!container) return;

    const lowerCaseFilter = filter.toLowerCase();

    // FIX: Tambahkan pengecekan untuk memastikan properti ada sebelum memanggil toLowerCase()
    const filteredItemClasses = itemClasses.filter(item => {
        // Pengecekan ini mencegah error jika salah satu properti (cth: description) tidak ada (undefined)
        const identifierMatch = item && item.identifier && item.identifier.toLowerCase().includes(lowerCaseFilter);
        const descriptionMatch = item && item.description && item.description.toLowerCase().includes(lowerCaseFilter);
        return identifierMatch || descriptionMatch;
    });

    let tableHtml = `
        <table class="min-w-full bg-white card">
            <thead>
                <tr class="border-b border-gray-200">
                    <th class="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Identifier</th>
                    <th class="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="text-gray-700 text-sm">`;

    if (filteredItemClasses.length === 0) {
        tableHtml += `<tr><td colspan="3" class="py-4 px-4 text-center text-gray-500">No item classes found.</td></tr>`;
    } else {
        filteredItemClasses.forEach(item => {
            tableHtml += `
                <tr class="border-b border-gray-200 hover:bg-indigo-50/50">
                    <td class="py-3 px-4 whitespace-nowrap">${item.identifier}</td>
                    <td class="py-3 px-4">${item.description || '<em class="text-gray-400">No description</em>'}</td>
                    <td class="py-3 px-4 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 mr-2 text-gray-500 hover:text-indigo-600 transition-colors" onclick="showItemClassForm('edit', '${item.id}')" title="Edit">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" onclick="deleteItemClass('${item.id}')" title="Delete">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
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

        // Fungsi filter baru untuk Movement Class
        window.filterMovementClassList = function(value) {
            renderMovementClassList(value);
        };
        
        window.filterICVList = function(value) {
            renderICVList(value);
        };

        window.filterItemClassList = function(value) {
            renderItemClassList(value);
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

        window.showICVForm = function(mode, id = null) {
            const modal = document.getElementById('icv-form-modal');
            const form = document.getElementById('icv-form');
            const title = document.getElementById('icv-form-title');
            const submitButton = document.getElementById('icv-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Reset validation state
            document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));

            if (mode === 'create') {
                title.textContent = 'Create New Value';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('icv-key').removeAttribute('readonly');
                document.getElementById('icv-key').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                document.getElementById('icv-systemCreated').checked = false;
                document.getElementById('icv-systemCreated').disabled = false;
                // Atur tab ke "General" secara default
                activateTab('gen', modal);
            } else {
                title.textContent = 'Edit Value';
                if (submitButton) submitButton.textContent = 'Update';
                const item = inventoryControlValues.find(icv => icv.id === id);
                if (item) {
                    document.getElementById('icv-key').value = item.key;
                    document.getElementById('icv-description').value = item.description;
                    document.getElementById('icv-systemValue').value = item.systemValue;
                    document.getElementById('icv-valueRequired').checked = item.valueRequired;
                    document.getElementById('icv-systemCreated').checked = item.systemCreated;
                    
                    // Isi User Defined data
                    if (item.userDefined) {
                        for (let i = 1; i <= 8; i++) {
                            const udfEl = document.getElementById(`icv-udf${i}`);
                            if (udfEl) {
                                udfEl.value = item.userDefined[`udf${i}`] || '';
                            }
                        }
                    }

                    if (item.systemCreated) {
                        document.getElementById('icv-key').setAttribute('readonly', true);
                        document.getElementById('icv-key').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                        document.getElementById('icv-systemCreated').disabled = true;
                    } else {
                        document.getElementById('icv-key').removeAttribute('readonly');
                        document.getElementById('icv-key').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                        document.getElementById('icv-systemCreated').disabled = false;
                    }
                    // Atur tab ke "General" secara default
                    activateTab('gen', modal);
                }
            }
            
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
            modal.onclick = (e) => {
                if (e.target.id === 'icv-form-modal') closeICVForm();
            };

            // Event listener untuk tabs di modal ICV
            const tabList = document.getElementById('icv-tab-list');
            if (tabList) {
                tabList.onclick = (e) => {
                    if (e.target.role === 'tab') {
                        activateTab(e.target.dataset.tab, modal);
                    }
                };
            }
            document.getElementById('icv-key').focus();
        };


        // Fungsi show form baru untuk Item Class
        window.showItemClassForm = function(mode, id = null) {
            const modal = document.getElementById('item-class-form-modal');
            const form = document.getElementById('item-class-form');
            const title = document.getElementById('item-class-form-title');
            const submitButton = document.getElementById('ic-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Reset validation state
            document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));

            if (mode === 'create') {
                title.textContent = 'Create New Item Class';
                if (submitButton) submitButton.textContent = 'Save';
                document.getElementById('ic-identifier').removeAttribute('readonly');
                document.getElementById('ic-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                document.getElementById('ic-systemCreated').checked = false;
                document.getElementById('ic-systemCreated').disabled = false;
                document.getElementById('ic-recordType').value = 'ITEMCLASS';
            } else {
                title.textContent = 'Edit Item Class';
                if (submitButton) submitButton.textContent = 'Update';
                const item = itemClasses.find(ic => ic.id === id);
                if (item) {
                    document.getElementById('ic-identifier').value = item.identifier;
                    document.getElementById('ic-recordType').value = item.recordType;
                    document.getElementById('ic-description').value = item.description;
                    document.getElementById('ic-storageTemplate').value = item.storageTemplate;
                    document.getElementById('ic-inactive').checked = item.inactive;
                    document.getElementById('ic-systemCreated').checked = item.systemCreated;

                    if (item.systemCreated) {
                         document.getElementById('ic-identifier').setAttribute('readonly', true);
                         document.getElementById('ic-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                }
            }
            
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
            modal.onclick = (e) => {
                if (e.target.id === 'item-class-form-modal') closeItemClassForm();
            };

            validateItemClassForm();
            document.getElementById('ic-identifier').focus();
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
        
        // Fungsi close form baru untuk Inventory Control Values
        window.closeICVForm = function() {
            const modal = document.getElementById('icv-form-modal');
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

        // Fungsi close form baru untuk Item Class
        window.closeItemClassForm = function() {
            const modal = document.getElementById('item-class-form-modal');
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
        
        // Fungsi handle submit baru untuk Inventory Control Values
        window.handleICVSubmit = async function(event) {
            event.preventDefault();
            if (!validateICVForm()) return;

            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;
            
            const newICV = {
                key: parseInt(form['key'].value, 10),
                description: form['description'].value,
                systemValue: form['systemValue'].value,
                valueRequired: form['valueRequired'].checked,
                systemCreated: form['systemCreated'].checked,
                userDefined: {}
            };

            // Ambil nilai UDFs
            for (let i = 1; i <= 8; i++) {
                const udfEl = document.getElementById(`icv-udf${i}`);
                if (udfEl) {
                    newICV.userDefined[`udf${i}`] = udfEl.value;
                }
            }

            let msg = '';
            if (mode === 'create') {
                // FIX: Cek dulu apa 'key' nya udah ada, biar gak duplikat
                const keyExists = inventoryControlValues.some(icv => icv.key === newICV.key);
                if (keyExists) {
                    await window.showCustomAlert('Error', `Key "${newICV.key}" sudah ada. Tolong pakai key lain.`);
                    return; // Hentikan proses
                }

                // FIX: Cara bikin ID-nya salah. Harusnya pakai 'key' dari form, bukan dihitung dari ID yg ada.
                // Ini yang bikin error 'replace of undefined'.
                newICV.id = 'icv_' + newICV.key;
                
                inventoryControlValues.push(newICV);
                msg = 'Inventory Control Value created successfully!';
            } else {
                const index = inventoryControlValues.findIndex(icv => icv.id === id);
                if (index !== -1) {
                    // FIX: Pastikan ID yang lama tetap dipakai waktu update.
                    const oldId = inventoryControlValues[index].id;
                    inventoryControlValues[index] = { ...inventoryControlValues[index], ...newICV, id: oldId };
                    msg = 'Inventory Control Value updated successfully!';
                } else {
                    await window.showCustomAlert('Error', 'Data tidak ditemukan untuk di-update.');
                    return;
                }
            }
            saveInventoryControlValues();
            closeICVForm();
            window.renderICVList();
            await window.showCustomAlert('Success', msg);
        };
        
        // Ganti fungsi handleItemClassSubmit yang lama dengan yang ini
window.handleItemClassSubmit = async function(event) {
    event.preventDefault();
    if (!validateItemClassForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;

    const newItemClass = {
        // FIX: Nama input disesuaikan dari 'identifier' menjadi 'ic-identifier'
        identifier: form['ic-identifier'].value,
        // FIX: Nama input disesuaikan dari 'description' menjadi 'ic-description'
        description: form['ic-description'].value || '',
        // FIX: Nama input disesuaikan dari 'inactive' menjadi 'ic-inactive'
        inactive: form['ic-inactive'] ? form['ic-inactive'].checked : false,
        userDefined: {}
    };

    for (let i = 1; i <= 8; i++) {
        const udfEl = document.getElementById(`ic-udf${i}`);
        if (udfEl) {
            newItemClass.userDefined[`udf${i}`] = udfEl.value;
        }
    }

    let msg = '';
    if (mode === 'create') {
        const identifierExists = itemClasses.some(ic => 
            ic && ic.identifier && ic.identifier.toLowerCase() === newItemClass.identifier.toLowerCase()
        );
        if (identifierExists) {
            await window.showCustomAlert('Error', `Identifier "${newItemClass.identifier}" already exists.`);
            return;
        }
        const maxId = itemClasses.reduce((max, item) => {
            if (item && item.id && typeof item.id === 'string') {
                const num = parseInt(item.id.replace('ic_', ''), 10);
                return Math.max(max, isNaN(num) ? 0 : num);
            }
            return max;
        }, 0);
        newItemClass.id = 'ic_' + String(maxId + 1);
        itemClasses.push(newItemClass);
        msg = 'Item Class created successfully!';
    } else {
        const index = itemClasses.findIndex(ic => ic.id === id);
        if (index !== -1) {
            const oldId = itemClasses[index].id;
            itemClasses[index] = { ...itemClasses[index], ...newItemClass, id: oldId };
            msg = 'Item Class updated successfully!';
        }
    }
    saveItemClasses();
    closeItemClassForm();
    window.renderItemClassList();
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
        
        // Fungsi delete baru untuk Inventory Control Values
        window.deleteICV = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this inventory control value?');
            if (confirmed) {
                const initialLength = inventoryControlValues.length;
                inventoryControlValues = inventoryControlValues.filter(icv => icv.id !== id);
                
                // Cek apa beneran ada yg kehapus
                if (inventoryControlValues.length < initialLength) {
                    saveInventoryControlValues();
                    window.renderICVList();
                    await window.showCustomAlert('Deleted', 'Inventory Control Value deleted successfully!');
                } else {
                    await window.showCustomAlert('Error', 'Could not delete the item. It might not exist.');
                }
            }
        };

        // Fungsi delete baru untuk Item Class
        window.deleteItemClass = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this item class?');
            if (confirmed) {
                itemClasses = itemClasses.filter(ic => ic.id !== id);
                saveItemClasses();
                window.renderItemClassList();
                await window.showCustomAlert('Deleted', 'Item Class deleted successfully!');
            }
        };


        // ===================================================================================
// EVENT LISTENERS
// ===================================================================================
// Listen for ESC key press on the whole document to close the active modal
document.addEventListener('keydown', (e) => {
    // Cari modal yang sedang aktif (yang tidak punya class 'hidden')
    const activeModal = document.querySelector('.fixed.inset-0.z-\\[60\\]:not(.hidden)');
    const customOverlay = document.getElementById('custom-alert-modal') || document.getElementById('custom-confirm-modal');

    // Hanya tutup modal jika tombolnya 'Escape' dan tidak ada custom alert/confirm yang aktif
    if (e.key === 'Escape' && activeModal && !customOverlay) {
        switch (activeModal.id) {
            case 'adjustment-type-form-modal':
                closeAdjustmentTypeForm();
                break;
            case 'hc-form-modal':
                closeHarmonizedCodeForm();
                break;
            case 'lc-form-modal':
                closeLocationClassForm();
                break;
            case 'ls-form-modal':
                closeLocationStatusForm();
                break;
            case 'mc-form-modal':
                closeMovementClassForm();
                break;
            case 'icv-form-modal':
                closeICVForm();
                break;
            case 'item-class-form-modal':
                closeItemClassForm();
                break;
            case 'is-form-modal':
                closeInventoryStatusForm();
                break;
            case 'lt-form-modal':
                closeLocationTemplateForm();
                break;
            case 'lot-template-form-modal':
                closeLotTemplateForm();
                break;
            case 'zone-form-modal':
                closeZoneForm();
                break;
            // Tambahkan case untuk modal lain di sini jika ada
        }
    }
});

// General input validation listeners
document.addEventListener('input', (e) => {
    if (!e.target || !e.target.id) return; // Pastikan elemen dan ID-nya ada

    const id = e.target.id;

    if (['adj-type-identifier', 'adj-type-qtyMin', 'adj-type-qtyMax'].includes(id)) {
        validateAdjustmentTypeForm();
    } else if (id === 'hc-identifier') {
        validateHarmonizedCodeForm();
    } else if (id === 'lc-identifier') {
        validateLocationClassForm();
    } else if (id === 'ls-identifier') {
        validateLocationStatusForm();
    } else if (id === 'mc-identifier') {
        validateMovementClassForm();
    } else if (id === 'icv-key') {
        validateICVForm();
    } else if (id === 'ic-identifier') {
        validateItemClassForm();
    } else if (id === 'is-identifier') {
        validateInventoryStatusForm();
    } else if (id === 'lt-identifier') {
        validateLocationTemplateForm();
    } else if (id === 'lot-template-name') {
        validateLotTemplateForm();
    } else if (id === 'zone-identifier') {
        validateZoneForm();
    }
    // Tambahkan validasi untuk fitur lain di sini
});

function validateInventoryStatusForm() {
    const identifier = document.getElementById('is-identifier');
    const submitBtn = document.getElementById('is-submit-button');
    let isValid = !!identifier.value.trim();
    
    const identifierError = document.getElementById('is-identifier-error');
    if (identifierError) {
        if (!isValid) {
            // identifierError.textContent = "Identifier is required.";
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

function validateLocationTemplateForm() {
    const identifier = document.getElementById('lt-identifier');
    const submitBtn = document.getElementById('lt-submit-button');
    let isValid = !!identifier.value.trim();
    
    const identifierError = document.getElementById('lt-identifier-error');
    if (identifierError) {
        if (!isValid) {
            // identifierError.textContent = "Location template identifier is required.";
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

function validateLotTemplateForm() {
    const nameInput = document.getElementById('lot-template-name');
    const submitBtn = document.getElementById('lot-template-submit-button');
    let isValid = !!nameInput.value.trim();
    
    const nameError = document.getElementById('lot-template-name-error');
    if (nameError) {
        if (!isValid) {
            // nameError.textContent = "Template name is required.";
            nameError.classList.remove('hidden');
        } else {
            nameError.classList.add('hidden');
        }
    }
    
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    return isValid;
}

function validateZoneForm() {
    const identifierInput = document.getElementById('zone-identifier');
    const submitBtn = document.getElementById('zone-submit-button');
    let isValid = !!identifierInput.value.trim();
    
    const identifierError = document.getElementById('zone-identifier-error');
    if (identifierError) {
        if (!isValid) {
            // identifierError.textContent = "Zone identifier is required.";
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

        window.showStorageTemplateForm = function(mode, id = null) {
    const modal = document.getElementById('st-form-modal');
    const form = document.getElementById('st-form');
    const title = document.getElementById('st-form-title');
    const submitButton = document.getElementById('st-submit-button');

    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;

    document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));
    activateTab('gen', modal);

    if (mode === 'create') {
        title.textContent = 'Create New Storage Template';
        if (submitButton) submitButton.textContent = 'Save';
        document.getElementById('st-identifier').removeAttribute('readonly');
        document.getElementById('st-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
        document.getElementById('st-systemCreated').checked = false;
        document.getElementById('st-systemCreated').disabled = false;
        renderStorageTemplateDetails([]);
    } else {
        title.textContent = 'Edit Storage Template';
        if (submitButton) submitButton.textContent = 'Update';
        const item = storageTemplates.find(st => st.id === id);
        if (item) {
            document.getElementById('st-identifier').value = item.identifier;
            document.getElementById('st-description').value = item.description;
            document.getElementById('st-inactive').checked = item.inactive;
            document.getElementById('st-systemCreated').checked = item.systemCreated;
            renderStorageTemplateDetails(item.detailRecords);

            if (item.systemCreated) {
                document.getElementById('st-identifier').setAttribute('readonly', true);
                document.getElementById('st-identifier').classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                document.getElementById('st-systemCreated').disabled = true;
            } else {
                document.getElementById('st-identifier').removeAttribute('readonly');
                document.getElementById('st-identifier').classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                document.getElementById('st-systemCreated').disabled = false;
            }
        }
    }

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
    modal.onclick = (e) => {
        if (e.target.id === 'st-form-modal') closeStorageTemplateForm();
    };

    const tabList = document.getElementById('st-tab-list');
    if (tabList) {
        tabList.onclick = (e) => {
            if (e.target.role === 'tab') {
                activateTab(e.target.dataset.tab, modal);
            }
        };
    }
    validateStorageTemplateForm();
    document.getElementById('st-identifier').focus();
};

window.closeStorageTemplateForm = function() {
    const modal = document.getElementById('st-form-modal');
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

window.handleStorageTemplateSubmit = async function(event) {
    event.preventDefault();
    if (!validateStorageTemplateForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;

    const details = Array.from(document.querySelectorAll('#st-detail-records-list .detail-record-item')).map((item, index) => {
        return {
            sequence: index + 1,
            um: item.querySelector('[name="detail-um"]').value,
            treatAsFullPercent: parseInt(item.querySelector('[name="detail-treatAsFullPercent"]').value, 10),
            groupDuringCheckIn: item.querySelector('[name="detail-groupDuringCheckIn"]').checked,
        };
    });

    const newTemplate = {
        identifier: form['identifier'].value,
        description: form['description'].value,
        inactive: form['inactive'].checked,
        systemCreated: form['systemCreated'].checked,
        detailRecords: details,
    };

    let msg = '';
    if (mode === 'create') {
        const identifierExists = storageTemplates.some(st => st.identifier === newTemplate.identifier);
        if (identifierExists) {
            await window.showCustomAlert('Error', `Storage template "${newTemplate.identifier}" sudah ada.`);
            return;
        }
        const maxId = storageTemplates.reduce((max, item) => {
            const num = parseInt(item.id.replace('st_', ''), 10);
            return Math.max(max, isNaN(num) ? 0 : num);
        }, 0);
        newTemplate.id = 'st_' + String(maxId + 1);

        storageTemplates.push(newTemplate);
        msg = 'Storage Template created successfully!';
    } else {
        const index = storageTemplates.findIndex(st => st.id === id);
        if (index !== -1) {
            storageTemplates[index] = { ...storageTemplates[index], ...newTemplate };
            msg = 'Storage Template updated successfully!';
        }
    }
    saveStorageTemplates();
    closeStorageTemplateForm();
    window.renderStorageTemplateList();
    await window.showCustomAlert('Success', msg);
};

window.deleteStorageTemplate = async function(id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this storage template?');
    if (confirmed) {
        storageTemplates = storageTemplates.filter(st => st.id !== id);
        saveStorageTemplates();
        window.renderStorageTemplateList();
        await window.showCustomAlert('Deleted', 'Storage Template deleted successfully!');
    }
};

function validateStorageTemplateForm() {
    const identifier = document.getElementById('st-identifier');
    const submitBtn = document.getElementById('st-submit-button');
    let isValid = true;
    
    if (!identifier.value.trim()) {
        isValid = false;
    }
    
    const identifierError = document.getElementById('st-identifier-error');
    if (identifierError) {
        if (!isValid) {
            // identifierError.textContent = "Storage template is required.";
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

// Ganti fungsi ini
window.renderStorageTemplateDetails = function(records) {
    const container = document.getElementById('st-detail-records-list');
    if (!container) return;
    container.innerHTML = '';

    // Selalu buat salinan array biar aman
    const recordsToRender = records && records.length > 0 ? [...records] : [{ sequence: 1, um: '', treatAsFullPercent: 100, groupDuringCheckIn: false }];

    recordsToRender.forEach((record, index) => {
        const sequence = index + 1; // Pastikan sequence selalu urut
        const div = document.createElement('div');
        div.className = 'detail-record-item p-3 border border-gray-200 rounded-md bg-gray-50 relative';
        // Tambahkan tombol hapus di setiap baris
        div.innerHTML = `
            <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1" onclick="removeStorageTemplateDetailRecord(this)" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label for="detail-um-${sequence}" class="block text-sm mb-1">UM:</label>
                    <select id="detail-um-${sequence}" name="detail-um" class="select">
                        <option value="">-- Pilih UM --</option>
                        ${window._ums.map(um => `<option value="${um}" ${record.um === um ? 'selected' : ''}>${um}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="detail-treatAsFullPercent-${sequence}" class="block text-sm mb-1">Treat as full percent:</label>
                    <input id="detail-treatAsFullPercent-${sequence}" name="detail-treatAsFullPercent" type="number" value="${record.treatAsFullPercent || 100}" class="input">
                </div>
                <div class="md:col-span-2">
                    <label class="flex items-center gap-2 text-sm">
                        <input id="detail-groupDuringCheckIn-${sequence}" name="detail-groupDuringCheckIn" type="checkbox" ${record.groupDuringCheckIn ? 'checked' : ''}> Group during check in
                    </label>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
};

// Ganti fungsi ini
window.addStorageTemplateDetailRecord = function() {
    const container = document.getElementById('st-detail-records-list');
    if (!container) return;
    
    // Buat baris baru yang kosong
    const newRecordHtml = `
        <div class="detail-record-item p-3 border border-gray-200 rounded-md bg-gray-50 relative">
            <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1" onclick="removeStorageTemplateDetailRecord(this)" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-sm mb-1">UM:</label>
                    <select name="detail-um" class="select">
                        <option value="">-- Pilih UM --</option>
                        ${window._ums.map(um => `<option value="${um}">${um}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm mb-1">Treat as full percent:</label>
                    <input name="detail-treatAsFullPercent" type="number" value="100" class="input">
                </div>
                <div class="md:col-span-2">
                    <label class="flex items-center gap-2 text-sm">
                        <input name="detail-groupDuringCheckIn" type="checkbox"> Group during check in
                    </label>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', newRecordHtml);
};

// Tambahkan fungsi baru ini
window.removeStorageTemplateDetailRecord = function(button) {
    // Hapus elemen parent dari tombol (yaitu baris detail record)
    button.closest('.detail-record-item').remove();
};


// Letakkan di bagian RENDER & FILTER FUNCTIONS
window.renderInventoryStatusList = function(filter = '') {
    const container = document.getElementById('is-list-container');
    if (!container) return;
    const lowerFilter = filter.toLowerCase();
    const filteredData = inventoryStatuses.filter(is => 
        is.identifier.toLowerCase().includes(lowerFilter) || 
        is.description.toLowerCase().includes(lowerFilter)
    );

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm">
                    <th class="py-3 px-6 text-left">Identifier</th>
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">System Created</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredData.length === 0) {
        tableHtml += '<tr><td colspan="5" class="py-3 px-6 text-center">No inventory statuses found.</td></tr>';
    } else {
        filteredData.forEach(is => {
            tableHtml += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${is.identifier}</td>
                    <td class="py-3 px-6 text-left">${is.description}</td>
                    <td class="py-3 px-6 text-left">${is.systemCreated ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-left">${!is.inactive ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showInventoryStatusForm('edit', '${is.id}')" title="Edit">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteInventoryStatus('${is.id}')" title="Delete">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
};

window.filterInventoryStatusList = function(value) {
    renderInventoryStatusList(value);
};

window.showInventoryStatusForm = function(mode, id = null) {
    const modal = document.getElementById('is-form-modal');
    const form = document.getElementById('is-form');
    const title = document.getElementById('is-form-title');
    
    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;

    const identifierInput = document.getElementById('is-identifier');
    identifierInput.readOnly = false;
    identifierInput.classList.remove('bg-gray-100');
    
    if (mode === 'create') {
        title.textContent = 'Create New Inventory Status';
    } else {
        title.textContent = 'Edit Inventory Status';
        const status = inventoryStatuses.find(is => is.id === id);
        if (status) {
            identifierInput.value = status.identifier;
            document.getElementById('is-description').value = status.description;
            document.getElementById('is-inactive').checked = status.inactive;
            document.getElementById('is-systemCreated').checked = status.systemCreated;

            if(status.systemCreated) {
                identifierInput.readOnly = true;
                identifierInput.classList.add('bg-gray-100');
            }
        }
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('scale-100', 'opacity-100');
        modal._untrap = trapFocus(modalContent);
    }, 10);
    validateInventoryStatusForm();
};

window.closeInventoryStatusForm = function() {
    const modal = document.getElementById('is-form-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        if (modal._untrap) modal._untrap();
    }, 300);
};

// Di dalam file configurationV3.js
window.handleInventoryStatusSubmit = async function(event) {
    event.preventDefault();
    if (!validateInventoryStatusForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    
    const newStatus = {
        identifier: form.identifier.value,
        recordType: 'INVSTATUS',
        description: form.description.value,
        inactive: form.inactive.checked,
        systemCreated: form.systemCreated.checked,
    };

    let msg = '';
    if (mode === 'create') {
        // FIX: Ganti cara pembuatan ID biar konsisten dengan fitur lain
        const maxId = inventoryStatuses.reduce((max, item) => {
            if (item && item.id && typeof item.id === 'string') {
                const num = parseInt(item.id.replace('is_', ''), 10);
                return Math.max(max, isNaN(num) ? 0 : num);
            }
            return max;
        }, 0);
        newStatus.id = 'is_' + String(maxId + 1);
        
        inventoryStatuses.push(newStatus);
        msg = 'Inventory Status created successfully!';
    } else {
        const index = inventoryStatuses.findIndex(is => is.id === id);
        if (index !== -1) {
            inventoryStatuses[index] = { ...inventoryStatuses[index], ...newStatus };
            msg = 'Inventory Status updated successfully!';
        }
    }
    saveInventoryStatuses();
    closeInventoryStatusForm();
    renderInventoryStatusList();
    await window.showCustomAlert('Success', msg);
};

window.deleteInventoryStatus = async function(id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this status?');
    if (confirmed) {
        inventoryStatuses = inventoryStatuses.filter(is => is.id !== id);
        saveInventoryStatuses();
        renderInventoryStatusList();
        await window.showCustomAlert('Deleted', 'Inventory Status deleted successfully!');
    }
};
        
// Letakkan di bagian RENDER & FILTER FUNCTIONS
window.renderLocationTemplateList = function(filter = '') {
    const container = document.getElementById('lt-list-container');
    if (!container) return;
    const lowerFilter = filter.toLowerCase();
    const filteredData = locationTemplates.filter(lt => lt.identifier.toLowerCase().includes(lowerFilter));

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm">
                    <th class="py-3 px-6 text-left">Location template</th>
                    ${Array.from({length: 5}, (_, i) => `<th class="py-3 px-6 text-left">Field ${i+1} description</th>`).join('')}
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredData.length === 0) {
        tableHtml += '<tr><td colspan="8" class="py-3 px-6 text-center">No location templates found.</td></tr>';
    } else {
        filteredData.forEach(lt => {
            // PERBAIKAN: Pastikan selalu ada 5 field, isi dengan string kosong jika tidak ada
            const fullFields = Array.from({ length: 5 }, (_, i) => lt.fields[i] || { description: '' });
            tableHtml += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${lt.identifier}</td>
                    ${fullFields.map(f => `<td class="py-3 px-6 text-left">${f.description}</td>`).join('')}
                    <td class="py-3 px-6 text-left">${!lt.inactive ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showLocationTemplateForm('edit', '${lt.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteLocationTemplate('${lt.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
};


window.filterLocationTemplateList = function(value) {
    renderLocationTemplateList(value);
};

// Letakkan di bagian MODAL FUNCTIONS
function renderLocationTemplateFields(fields = []) {
    const container = document.getElementById('lt-fields-container');
    if (!container) return;
    container.innerHTML = ''; // Kosongkan dulu
    
    // PERBAIKAN: Pastikan selalu ada 5 field, isi yang kosong jika perlu
    const fullFields = Array.from({ length: 5 }, (_, i) => fields[i] || { length: null, type: '', description: '' });

    fullFields.forEach((field, i) => {
        const fieldHtml = `
            <div class="grid grid-cols-[auto,1fr,auto,1.5fr] gap-2 items-center">
                <label class="text-sm font-medium">Field ${i + 1}:</label>
                <input name="field_length_${i}" type="number" class="input w-24" placeholder="Length" value="${field.length || ''}">
                <select name="field_type_${i}" class="select w-32">
                    <option value="">-- Tipe --</option>
                    ${window._locationTemplateFieldTypes.map(t => `<option value="${t}" ${field.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
                <input name="field_description_${i}" class="input" placeholder="Description" value="${field.description || ''}">
            </div>
        `;
        container.insertAdjacentHTML('beforeend', fieldHtml);
    });
}

window.showLocationTemplateForm = function(mode, id = null) {
    const modal = document.getElementById('lt-form-modal');
    const form = document.getElementById('lt-form');
    const title = document.getElementById('lt-form-title');
    
    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;
    activateTab('gen', modal);

    const identifierInput = document.getElementById('lt-identifier');
    identifierInput.readOnly = false;
    identifierInput.classList.remove('bg-gray-100');
    
    if (mode === 'create') {
        title.textContent = 'Create New Location Template';
        renderLocationTemplateFields([]); // Render field kosong
    } else {
        title.textContent = 'Edit Location Template';
        const template = locationTemplates.find(lt => lt.id === id);
        if (template) {
            identifierInput.value = template.identifier;
            document.getElementById('lt-separator').value = template.separator;
            document.getElementById('lt-useSpaceSeparator').checked = template.useSpaceSeparator;
            document.getElementById('lt-inactive').checked = template.inactive;
            renderLocationTemplateFields(template.fields);
            
            if (template.userDefined) {
                for(let i = 1; i <= 8; i++) {
                    const udfInput = document.getElementById(`lt-udf${i}`);
                    if (udfInput) udfInput.value = template.userDefined[`udf${i}`] || '';
                }
            }
        }
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('scale-100', 'opacity-100');
        modal._untrap = trapFocus(modalContent);
    }, 10);
    validateLocationTemplateForm();
};

window.closeLocationTemplateForm = function() {
    const modal = document.getElementById('lt-form-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        if (modal._untrap) modal._untrap();
    }, 300);
};

window.handleLocationTemplateSubmit = async function(event) {
    event.preventDefault();
    if (!validateLocationTemplateForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    
    const fields = [];
    for (let i = 0; i < 5; i++) {
        const length = form[`field_length_${i}`].value;
        fields.push({
            length: length ? parseInt(length, 10) : null,
            type: form[`field_type_${i}`].value,
            description: form[`field_description_${i}`].value,
        });
    }

    const userDefined = {};
    for(let i = 1; i <= 8; i++) { userDefined[`udf${i}`] = form[`udf${i}`].value; }
    
    const newTemplate = {
        identifier: form.identifier.value,
        separator: form.separator.value,
        useSpaceSeparator: form.useSpaceSeparator.checked,
        inactive: form.inactive.checked,
        fields,
        userDefined,
    };

    let msg = '';
    if (mode === 'create') {
        newTemplate.id = 'lt_' + Date.now();
        locationTemplates.push(newTemplate);
        msg = 'Location Template created successfully!';
    } else {
        const index = locationTemplates.findIndex(lt => lt.id === id);
        if (index !== -1) {
            locationTemplates[index] = { ...locationTemplates[index], ...newTemplate };
            msg = 'Location Template updated successfully!';
        }
    }
    saveLocationTemplates();
    closeLocationTemplateForm();
    renderLocationTemplateList();
    await window.showCustomAlert('Success', msg);
};

window.deleteLocationTemplate = async function(id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this template?');
    if (confirmed) {
        locationTemplates = locationTemplates.filter(lt => lt.id !== id);
        saveLocationTemplates();
        renderLocationTemplateList();
        await window.showCustomAlert('Deleted', 'Location Template deleted successfully!');
    }
};

// Ganti semua fungsi lot template yang lama dengan blok kode ini

// Ganti semua fungsi lot template yang lama dengan blok kode revisi ini

// --- State (tetap sama)
let currentPatternFields = [];
let selectedPatternIndex = -1;

// --- RENDER & FILTER FUNCTIONS
window.renderLotTemplateList = function(filter = '') {
    const container = document.getElementById('lot-template-list-container');
    if (!container) return;
    const lowerFilter = filter.toLowerCase();
    const filteredData = lotTemplates.filter(lt => lt.name.toLowerCase().includes(lowerFilter));

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm">
                    <th class="py-3 px-6 text-left">Lot template</th>
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredData.length === 0) {
        tableHtml += '<tr><td colspan="4" class="py-3 px-6 text-center">No lot templates found.</td></tr>';
    } else {
        filteredData.forEach(lt => {
            tableHtml += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${lt.name}</td>
                    <td class="py-3 px-6 text-left">${lt.description || ''}</td>
                    <td class="py-3 px-6 text-left">${!lt.inactive ? 'Y' : 'N'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showLotTemplateForm('edit', '${lt.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteLotTemplate('${lt.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
};

window.filterLotTemplateList = function(value) {
    renderLotTemplateList(value);
};

// --- MODAL & FORM FUNCTIONS (REVISI)
function renderLotTemplatePatterns() {
    const container = document.getElementById('lot-template-patterns-list');
    if (!container) return;
    container.innerHTML = '';
    
    if(currentPatternFields.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">No pattern fields added.</div>';
        return;
    }

    currentPatternFields.forEach((pattern, index) => {
        const div = document.createElement('div');
        div.className = 'list-row';
        div.dataset.index = index;
        if (index === selectedPatternIndex) {
            div.classList.add('selected');
        }
        div.textContent = `[${pattern.type}] Length: ${pattern.length || 'N/A'}, Value: ${pattern.value || 'N/A'}`;
        
        div.onclick = () => {
            selectedPatternIndex = index;
            document.getElementById('lt-pattern-type').value = pattern.type;
            document.getElementById('lt-pattern-length').value = pattern.length || '';
            document.getElementById('lt-pattern-value').value = pattern.value || '';
            renderLotTemplatePatterns(); 
        };
        container.appendChild(div);
    });
}

function clearPatternInputs() {
    document.getElementById('lt-pattern-type').value = 'Alphanumeric';
    document.getElementById('lt-pattern-length').value = '';
    document.getElementById('lt-pattern-value').value = '';
    selectedPatternIndex = -1;
    renderLotTemplatePatterns();
}

function addPatternField() {
    const type = document.getElementById('lt-pattern-type').value;
    const length = document.getElementById('lt-pattern-length').value;
    const value = document.getElementById('lt-pattern-value').value;
    currentPatternFields.push({ type, length: length || null, value: value || null });
    selectedPatternIndex = currentPatternFields.length - 1;
    renderLotTemplatePatterns();
}

function updatePatternField() {
    if (selectedPatternIndex < 0) {
        window.showCustomAlert('Info', 'Please select a field to update.');
        return;
    }
    const type = document.getElementById('lt-pattern-type').value;
    const length = document.getElementById('lt-pattern-length').value;
    const value = document.getElementById('lt-pattern-value').value;
    currentPatternFields[selectedPatternIndex] = { type, length: length || null, value: value || null };
    renderLotTemplatePatterns();
}

function removePatternField() {
    if (selectedPatternIndex < 0) {
        window.showCustomAlert('Info', 'Please select a field to remove.');
        return;
    }
    currentPatternFields.splice(selectedPatternIndex, 1);
    clearPatternInputs();
}

function movePatternField(direction) {
    if (selectedPatternIndex < 0) {
        window.showCustomAlert('Info', 'Please select a field to move.');
        return;
    }
    const newIndex = direction === 'up' ? selectedPatternIndex - 1 : selectedPatternIndex + 1;
    if (newIndex >= 0 && newIndex < currentPatternFields.length) {
        [currentPatternFields[selectedPatternIndex], currentPatternFields[newIndex]] = [currentPatternFields[newIndex], currentPatternFields[selectedPatternIndex]];
        selectedPatternIndex = newIndex;
        renderLotTemplatePatterns();
    }
}

window.showLotTemplateForm = function(mode, id = null) {
    const modal = document.getElementById('lot-template-form-modal');
    const form = document.getElementById('lot-template-form');
    const title = document.getElementById('lot-template-form-title');
    
    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;
    activateTab('pattern', modal);
    
    currentPatternFields = [];
    selectedPatternIndex = -1;

    if (mode === 'create') {
        title.textContent = 'Create New Lot Template';
    } else {
        title.textContent = 'Edit Lot Template';
        const template = lotTemplates.find(lt => lt.id === id);
        if (template) {
            document.getElementById('lot-template-name').value = template.name;
            document.getElementById('lot-template-description').value = template.description || '';
            document.getElementById('lot-template-inactive').checked = template.inactive;
            currentPatternFields = JSON.parse(JSON.stringify(template.patternFields || []));
        }
    }
    
    clearPatternInputs(); 

    // Buka modal dengan animasi
    document.body.classList.add('modal-open');
    modal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('opacity-0', 'scale-95');
        modal._untrap = trapFocus(modalContent);

        if (!modal._listenersAttached) {
            document.getElementById('lt-btn-add').onclick = addPatternField;
            document.getElementById('lt-btn-update').onclick = updatePatternField;
            document.getElementById('lt-btn-clear').onclick = clearPatternInputs;
            document.getElementById('lt-btn-remove').onclick = removePatternField;
            document.getElementById('lt-btn-up').onclick = () => movePatternField('up');
            document.getElementById('lt-btn-down').onclick = () => movePatternField('down');

            const tabList = document.getElementById('lot-template-tab-list');
            tabList.onclick = (e) => {
                if (e.target.role === 'tab') {
                    activateTab(e.target.dataset.tab, modal);
                }
            };
            modal._listenersAttached = true;
        }
    }, 10);
    validateLotTemplateForm();
};

window.closeLotTemplateForm = function() {
    const modal = document.getElementById('lot-template-form-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        if (modal._untrap) modal._untrap();
    }, 300);
};

window.handleLotTemplateSubmit = async function(event) {
    event.preventDefault();
    if (!validateLotTemplateForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    
    const newTemplate = {
        name: form.name.value,
        description: form.description.value,
        inactive: form.inactive.checked,
        patternFields: currentPatternFields,
        userDefined: {},
    };

    let msg = '';
    if (mode === 'create') {
        newTemplate.id = 'lot_' + Date.now();
        lotTemplates.push(newTemplate);
        msg = 'Lot Template created successfully!';
    } else {
        const index = lotTemplates.findIndex(lt => lt.id === id);
        if (index !== -1) {
            lotTemplates[index] = { ...lotTemplates[index], ...newTemplate };
            msg = 'Lot Template updated successfully!';
        }
    }
    saveLotTemplates();
    closeLotTemplateForm();
    renderLotTemplateList();
    await window.showCustomAlert('Success', msg);
};

window.deleteLotTemplate = async function(id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this lot template?');
    if (confirmed) {
        lotTemplates = lotTemplates.filter(lt => lt.id !== id);
        saveLotTemplates();
        renderLotTemplateList();
        await window.showCustomAlert('Deleted', 'Lot Template deleted successfully!');
    }
};

window.renderZoneList = function(filter = '') {
    const container = document.getElementById('zone-list-container');
    if (!container) return;
    const lowerFilter = filter.toLowerCase();
    const filteredData = zones.filter(z => 
        z.identifier.toLowerCase().includes(lowerFilter) ||
        z.description.toLowerCase().includes(lowerFilter)
    );

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm">
                    <th class="py-3 px-6 text-left">Zone</th>
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">Zone type</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredData.length === 0) {
        tableHtml += '<tr><td colspan="5" class="py-3 px-6 text-center">No zones found.</td></tr>';
    } else {
        filteredData.forEach(z => {
            tableHtml += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${z.identifier}</td>
                    <td class="py-3 px-6 text-left">${z.description}</td>
                    <td class="py-3 px-6 text-left">${z.zoneType}</td>
                    <td class="py-3 px-6 text-left">${!z.inactive ? 'Yes' : 'No'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showZoneForm('edit', '${z.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteZone('${z.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
};

window.filterZoneList = function(value) {
    renderZoneList(value);
};

// Letakkan di bagian MODAL FUNCTIONS
window.showZoneForm = function(mode, id = null) {
    const modal = document.getElementById('zone-form-modal');
    const form = document.getElementById('zone-form');
    const title = document.getElementById('zone-form-title');
    
    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;
    
    if (mode === 'create') {
        title.textContent = 'Create New Zone';
    } else {
        title.textContent = 'Edit Zone';
        const zone = zones.find(z => z.id === id);
        if (zone) {
            document.getElementById('zone-identifier').value = zone.identifier;
            document.getElementById('zone-description').value = zone.description;
            document.getElementById('zone-type').value = zone.zoneType;
            document.getElementById('zone-pick-management').checked = zone.pickManagementActive;
            document.getElementById('zone-inactive').checked = zone.inactive;
            
            if (zone.userDefined) {
                for(let i = 1; i <= 8; i++) {
                    const udfInput = document.getElementById(`zone-udf${i}`);
                    if (udfInput) udfInput.value = zone.userDefined[`udf${i}`] || '';
                }
            }
        }
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('scale-100', 'opacity-100');
        modal._untrap = trapFocus(modalContent);
    }, 10);
    validateZoneForm();
};

window.closeZoneForm = function() {
    const modal = document.getElementById('zone-form-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        if (modal._untrap) modal._untrap();
    }, 300);
};

window.handleZoneSubmit = async function(event) {
    event.preventDefault();
    if (!validateZoneForm()) return;

    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    
    const userDefined = {};
    for(let i = 1; i <= 8; i++) { userDefined[`udf${i}`] = form[`udf${i}`].value; }
    
    const newZone = {
        identifier: form.identifier.value,
        description: form.description.value,
        zoneType: form.zoneType.value,
        pickManagementActive: form.pickManagementActive.checked,
        inactive: form.inactive.checked,
        userDefined,
    };

    let msg = '';
    if (mode === 'create') {
        newZone.id = 'zone_' + Date.now();
        zones.push(newZone);
        msg = 'Zone created successfully!';
    } else {
        const index = zones.findIndex(z => z.id === id);
        if (index !== -1) {
            zones[index] = { ...zones[index], ...newZone };
            msg = 'Zone updated successfully!';
        }
    }
    saveZones();
    closeZoneForm();
    renderZoneList();
    await window.showCustomAlert('Success', msg);
};

window.deleteZone = async function(id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this zone?');
    if (confirmed) {
        zones = zones.filter(z => z.id !== id);
        saveZones();
        renderZoneList();
        await window.showCustomAlert('Deleted', 'Zone deleted successfully!');
    }
};

       // ===================================================================================
// AUTO-RENDER on MOUNT
// ===================================================================================
(function autoRenderV3() {
    // Satu peta untuk semua fungsi render, biar rapi
    const renderMap = {
        'adjustment-type-list-container': window.renderAdjustmentTypeList,
        'hc-list-container': window.renderHarmonizedCodeList,
        'lc-list-container': window.renderLocationClassList,
        'ls-list-container': window.renderLocationStatusList,
        'mc-list-container': window.renderMovementClassList,
        'icv-list-container': window.renderICVList,
        'item-class-list-container': window.renderItemClassList,
        'is-list-container': window.renderInventoryStatusList,
        'lt-list-container': window.renderLocationTemplateList,
        'lot-template-list-container': window.renderLotTemplateList,
        'st-list-container': window.renderStorageTemplateList,
        'zone-list-container': window.renderZoneList,
        // Tambahkan fitur baru di sini, formatnya: 'id-container': window.fungsiRender
    };

    // Satu fungsi untuk ngecek dan render semua list yang ada di halaman
    const ensureAllLists = () => {
        for (const id in renderMap) {
            const container = document.getElementById(id);
            // Cek kalau container-nya ada di DOM dan belum di-render
            if (container && !container.dataset.bound) {
                renderMap[id](); // Panggil fungsi rendernya
                container.dataset.bound = '1'; // Tandain udah di-render
            }
        }
    };
    
    // Observer ini bakal jalanin `ensureAllLists` setiap kali ada perubahan di halaman
    const obs = new MutationObserver(ensureAllLists);
    obs.observe(document.body, { childList: true, subtree: true });
    
    // Panggil sekali pas pertama kali script-nya jalan
    ensureAllLists();
})();

        console.log('Configuration V3 (Inventory Control) loaded successfully');
    });
})();
