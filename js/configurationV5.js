(function () {
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.contentData === 'undefined') window.contentData = {};
        if (typeof window.searchItems === 'undefined') window.searchItems = [];
        if (typeof window.parentMapping === 'undefined') window.parentMapping = {};
        if (typeof window.allMenus === 'undefined') window.allMenus = [];

        // =======================================================================
        // BAGIAN 1: SERIAL NUMBER TEMPLATE
        // =======================================================================
        const SNT_STORAGE_KEY = 'serialNumberTemplates_v5';
        const snt_initialData = [
            { id: 'SNT001', name: 'STD_SERIAL', description: 'Standard Serial Number', allowDuplicates: false, allowRangeEntry: true, inactive: false, patternFields: [{type: 'Alphanumeric', length: 10, value: ''}], userDefined: {} },
            { id: 'SNT002', name: 'DATE_BASED', description: 'Date Based Serial', allowDuplicates: true, allowRangeEntry: false, inactive: false, patternFields: [{type: 'Date', length: 8, value: 'YYYYMMDD'}, {type: 'Sequence', length: 4, value: ''}], userDefined: {} }
        ];
        const snt_loadData = () => JSON.parse(localStorage.getItem(SNT_STORAGE_KEY)) || snt_initialData;
        const snt_saveData = (data) => localStorage.setItem(SNT_STORAGE_KEY, JSON.stringify(data));
        let currentSNT_PatternFields = [];
        let selectedSNT_PatternIndex = -1;

        // =======================================================================
        // BAGIAN 2: ITEM LOCATION ASSIGNMENT
        // =======================================================================
        const ILA_STORAGE_KEY = 'itemLocationAssignments_v5';
        const ila_initialData = [
            { id: 'ILA001', item: '00000000132_1', company: 'DCM', quantityUom: 'PC', warehouse: 'DCM', permanentLocation: '42.08.4.01', inactive: false, userDefined: { udf1: 'Data A' } },
            { id: 'ILA002', item: '00000000135_1', company: 'DCM', quantityUom: 'BOX', warehouse: 'DCM', permanentLocation: '41.27.3.03', inactive: false, userDefined: { udf2: 'Data B' } },
        ];
        const ila_loadData = () => JSON.parse(localStorage.getItem(ILA_STORAGE_KEY)) || ila_initialData;
        const ila_saveData = (data) => localStorage.setItem(ILA_STORAGE_KEY, JSON.stringify(data));

        // =======================================================================
        // BAGIAN 3: ITEM LOCATION CAPACITY
        // =======================================================================
        const ILC_STORAGE_KEY = 'itemLocationCapacities_v5';
        const ilc_initialData = [
            { 
                id: 'ILC001', item: '000000000140_1', company: 'GBG', itemClass: 'CLASS_A',
                capacityDetails: [ { detailId: 'D01', locationType: 'CARTON FLOW 5 SLOT', warehouse: 'GBG', location: '', minQty: 20, maxQty: 20, quantityUm: 'PCK', itemCapacityId: 88139 } ],
                userDefined: { udf1: 'Data UDF 1' }
            }
        ];
        const ilc_loadData = () => JSON.parse(localStorage.getItem(ILC_STORAGE_KEY)) || ilc_initialData;
        const ilc_saveData = (data) => localStorage.setItem(ILC_STORAGE_KEY, JSON.stringify(data));
        let currentCapacityDetails = [];
        let selectedDetailIndex = -1;

        // =======================================================================
        // BAGIAN 4: ITEM TEMPLATE
        // =======================================================================
        const IT_STORAGE_KEY = 'itemTemplates_v5';
        const it_initialData = [
            { 
                id: 'IT001', itemTemplate: 'DEFAULT', separatorCharacter: '.', inactive: false,
                fields: [ { length: 4, type: 'Alpha' }, { length: 8, type: 'Num' }, { length: 2, type: 'Alpha' } ],
                userDefined: { udf1: 'Default Template UDF' }
            }
        ];
        const it_loadData = () => JSON.parse(localStorage.getItem(IT_STORAGE_KEY)) || it_initialData;
        const it_saveData = (data) => localStorage.setItem(IT_STORAGE_KEY, JSON.stringify(data));
        
        // --- PENDAFTARAN SEMUA FITUR BARU KE SISTEM ---
        Object.assign(window.contentData, {
            'serial-number-template': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Serial Number Template</h2>
                    <p class="text-wise-gray mb-4">Manage templates for serial number generation.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="btn btn-primary" onclick="showSerialNumberTemplateForm('create')">Create New Template</button>
                        <input type="text" id="snt-search" placeholder="Search template name..." class="input max-w-xs" oninput="filterSerialNumberTemplateList(this.value)">
                    </div>
                    <div id="snt-list-container" class="overflow-x-auto"></div>
                    <!-- Modal Serial Number Template -->
                    <div id="snt-form-modal" class="hidden fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-6 bg-black/40 overflow-y-auto">
                        <div class="modal-content w-[min(1000px,95vw)] bg-white rounded-xl shadow-2xl flex flex-col max-h-[95vh] transition-all duration-300 opacity-0 scale-95">
                            <div class="sticky top-0 z-10 px-6 pt-5 pb-3 border-b bg-white rounded-t-xl flex-shrink-0">
                                <h3 id="snt-form-title" class="text-lg font-semibold text-wise-dark-gray"></h3>
                                <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeSerialNumberTemplateForm()" aria-label="Close">✕</button>
                            </div>
                            <div class="px-6 py-5 flex-grow overflow-y-auto">
                                <form id="snt-form" onsubmit="handleSerialNumberTemplateSubmit(event)">
                                    <div class="p-5 border-b -mx-6 -mt-5 mb-4 bg-gray-50/50">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label for="snt-name" class="block text-sm mb-1 font-medium">Template name: <span class="text-red-500">*</span></label><input id="snt-name" name="name" required class="input"></div>
                                            <div><label for="snt-description" class="block text-sm mb-1 font-medium">Description</label><input id="snt-description" name="description" class="input"></div>
                                        </div>
                                    </div>
                                    <div role="tablist" class="flex space-x-6 mb-4 border-b">
                                        <button role="tab" type="button" data-tab="pattern" class="tab-button tab-active">Pattern fields</button>
                                        <button role="tab" type="button" data-tab="ud" class="tab-button">User defined data</button>
                                    </div>
                                    <div id="pane-pattern" role="tabpanel" data-pane="pattern">
                                        <div class="grid grid-cols-12 gap-4">
                                            <div class="col-span-12 lg:col-span-8">
                                                <div class="border rounded-lg h-full flex flex-col"><div class="flex items-center justify-between px-3 py-2 border-b bg-gray-50/70 rounded-t-lg">
                                                    <span class="text-xs uppercase tracking-wider text-wise-gray">Current Pattern</span>
                                                </div><div id="snt-patterns-list" class="p-2 flex-1 overflow-auto min-h-[150px] font-mono text-sm"></div></div>
                                            </div>
                                            <div class="col-span-12 lg:col-span-4 flex flex-col gap-2">
                                                <button type="button" id="snt-btn-up" class="btn btn-primary">↑ Up</button>
                                                <button type="button" id="snt-btn-down" class="btn btn-primary">↓ Down</button>
                                                <div class="h-2"></div>
                                                <button type="button" id="snt-btn-remove" class="btn btn-primary">Remove</button>
                                                <button type="button" id="snt-btn-advanced" class="btn btn-primary" onclick="alert('Advanced settings not implemented yet.')">Advanced</button>
                                            </div>
                                        </div>
                                        <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div><label for="snt-pattern-type" class="block text-sm font-medium mb-1">Type</label><select id="snt-pattern-type" class="select"><option>Alpha</option><option>Alphanumeric</option><option>Numeric</option><option>Constant</option></select></div>
                                                <div><label for="snt-pattern-length" class="block text-sm font-medium mb-1">Length</label><input id="snt-pattern-length" type="number" class="input"></div>
                                                <div><label for="snt-pattern-value" class="block text-sm font-medium mb-1">Value</label><input id="snt-pattern-value" type="text" class="input"></div>
                                            </div>
                                            <div class="mt-3 flex gap-2"><button type="button" id="snt-btn-add" class="btn btn-primary">Add</button><button type="button" id="snt-btn-clear" class="btn">Clear</button></div>
                                        </div>
                                        <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                            <label class="flex items-center gap-2 text-sm"><input id="snt-allow-duplicates" name="allowDuplicates" type="checkbox"> Allow duplicates</label>
                                            <label class="flex items-center gap-2 text-sm"><input id="snt-allow-range-entry" name="allowRangeEntry" type="checkbox"> Allow range entry</label>
                                            <label class="flex items-center gap-2 text-sm"><input id="snt-inactive" name="inactive" type="checkbox"> Inactive</label>
                                        </div>
                                    </div>
                                    <div id="pane-ud" role="tabpanel" data-pane="ud" class="hidden grid gap-3 md:grid-cols-2">
                                        ${Array.from({length: 8}, (_, i) => `<div><label for="snt-udf${i+1}" class="block text-sm mb-1">User defined field ${i+1}:</label><input id="snt-udf${i+1}" name="udf${i+1}" type="text" class="input"></div>`).join('')}
                                    </div>
                                </form>
                            </div>
                            <div class="sticky bottom-0 z-10 px-6 py-3 border-t flex justify-end gap-3 bg-white rounded-b-xl flex-shrink-0">
                                <button type="button" class="btn" onclick="closeSerialNumberTemplateForm()">Cancel</button>
                                <button id="snt-submit-button" type="submit" form="snt-form" class="btn btn-primary">OK</button>
                            </div>
                        </div>
                    </div>
                `
            },
            'item-location-assignment': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Location Assignment</h2>
                    <p class="text-wise-gray mb-4">Manage item assignments to specific warehouse locations.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="btn btn-primary" onclick="showItemLocationAssignmentForm('create')">Create New Assignment</button>
                        <input type="text" id="ila-search" placeholder="Search assignment..." class="input max-w-xs" oninput="filterItemLocationAssignmentList(this.value)">
                    </div>
                    <div id="item-location-assignment-list-container" class="overflow-x-auto"></div>
                    <div id="ila-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30">
                        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <div class="px-6 pt-5 pb-3 border-b"><h3 id="ila-form-title" class="text-lg font-semibold"></h3><button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeItemLocationAssignmentForm()">✕</button></div>
                            <div class="p-6 overflow-y-auto"><form id="ila-form" onsubmit="handleItemLocationAssignmentSubmit(event)">
                                <div role="tablist" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button type="button" role="tab" data-tab="general" class="tab tab-active">General</button>
                                    <button type="button" role="tab" data-tab="user-defined" class="tab">User defined data</button>
                                    <button type="button" role="tab" data-tab="lookup" class="tab">Lockup UI Location</button>
                                </div>
                                <div id="pane-general" role="tabpanel" data-pane="general"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label for="ila-item" class="block text-sm mb-1">Item:</label><input type="text" id="ila-item" name="item" required class="input"></div>
                                    <div><label for="ila-company" class="block text-sm mb-1">Company:</label><input type="text" id="ila-company" name="company" class="input"></div>
                                    <div><label for="ila-quantity-um" class="block text-sm mb-1">Quantity um:</label><select id="ila-quantity-um" name="quantityUom" class="select"><option value="">-</option><option value="PC">PC</option><option value="BOX">BOX</option><option value="PLT">PLT</option></select></div>
                                    <div><label for="ila-warehouse" class="block text-sm mb-1">Warehouse:</label><input type="text" id="ila-warehouse" name="warehouse" class="input"></div>
                                    <div class="md:col-span-2"><label for="ila-permanent-location" class="block text-sm mb-1">Permanent location:</label><input type="text" id="ila-permanent-location" name="permanentLocation" class="input"></div>
                                </div></div>
                                <div id="pane-user-defined" role="tabpanel" data-pane="user-defined" class="hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${Array.from({ length: 8 }, (_, i) => `<div><label for="ila-udf${i + 1}" class="block text-sm mb-1">User defined field ${i + 1}:</label><input type="text" id="ila-udf${i + 1}" name="udf${i + 1}" class="input"></div>`).join('')}</div></div>
                                <div id="pane-lookup" role="tabpanel" data-pane="lookup" class="hidden"><div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                                    <div><label for="lookup-location" class="block text-sm mb-1">Location:</label><input type="text" id="lookup-location" class="input" placeholder="e.g., 42.08.4.01"></div>
                                    <button type="button" class="btn btn-primary w-full" onclick="applyLookupLocation()">Apply to Permanent Location</button>
                                </div></div>
                            </form></div>
                            <div class="px-6 py-4 border-t flex justify-end gap-3"><button type="button" class="btn" onclick="closeItemLocationAssignmentForm()">Cancel</button><button id="ila-submit-button" type="submit" form="ila-form" class="btn btn-primary">OK</button></div>
                        </div>
                    </div>
                `
            },
            'item-location-capacity': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Location Capacity</h2>
                    <p class="text-wise-gray mb-4">Manage item capacity settings for specific locations or location types.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="btn btn-primary" onclick="showItemLocationCapacityForm('create')">Create New</button>
                        <input type="text" id="ilc-search" placeholder="Search by item or company..." class="input max-w-xs" oninput="filterItemLocationCapacityList(this.value)">
                    </div>
                    <div id="ilc-list-container" class="overflow-x-auto"></div>
                    <div id="ilc-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
                        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                            <div class="px-6 pt-5 pb-3 border-b"><h3 id="ilc-form-title" class="text-lg font-semibold"></h3><button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeItemLocationCapacityForm()">✕</button></div>
                            <div class="p-6 overflow-y-auto"><form id="ilc-form" onsubmit="handleItemLocationCapacitySubmit(event)">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div><label for="ilc-item" class="block text-sm mb-1">Item:</label><input type="text" id="ilc-item" name="item" required class="input"></div>
                                    <div><label for="ilc-company" class="block text-sm mb-1">Company:</label><input type="text" id="ilc-company" name="company" required class="input"></div>
                                    <div><label for="ilc-item-class" class="block text-sm mb-1">Item Class:</label><input type="text" id="ilc-item-class" name="itemClass" class="input"></div>
                                </div>
                                <div role="tablist" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button type="button" role="tab" data-tab="general" class="tab tab-active">General</button>
                                    <button type="button" role="tab" data-tab="user-defined" class="tab">User defined data</button>
                                </div>
                                <div id="pane-general" role="tabpanel" data-pane="general">
                                    <div class="p-4 border rounded-lg bg-gray-50 mb-4"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div><label for="detail-max-qty" class="block text-sm mb-1">Maximum qty:</label><input type="number" id="detail-max-qty" class="input" value="20.00"></div>
                                        <div><label for="detail-um" class="block text-sm mb-1">UM:</label><select id="detail-um" class="select"><option>Pack</option><option>PCK</option><option>PLT</option></select></div>
                                        <div class="lg:col-span-2"><label for="detail-location-type" class="block text-sm mb-1">Location type:</label><input type="text" id="detail-location-type" class="input" value="CARTON FLOW 5 SLOT"></div>
                                        <div class="lg:col-span-2"><label for="detail-location" class="block text-sm mb-1">Location:</label><div class="flex"><input type="text" id="detail-location" class="input rounded-r-none"><button type="button" class="btn rounded-l-none border-l-0" onclick="openIlcLocationLookup()">...</button></div></div>
                                        <div class="lg:col-span-2 flex items-end gap-2"><button type="button" class="btn btn-primary w-full" onclick="addOrUpdateDetail()">Add/Update to List</button><button type="button" class="btn w-full" onclick="clearDetailForm()">Clear Fields</button></div>
                                    </div></div>
                                    <div id="ilc-detail-table-container" class="border rounded-lg overflow-hidden max-h-48 overflow-y-auto"></div>
                                </div>
                                <div id="pane-user-defined" role="tabpanel" data-pane="user-defined" class="hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${Array.from({ length: 8 }, (_, i) => `<div><label for="ilc-udf${i + 1}" class="block text-sm mb-1">User defined field ${i + 1}:</label><input type="text" id="ilc-udf${i + 1}" name="udf${i + 1}" class="input"></div>`).join('')}</div></div>
                            </form></div>
                            <div class="px-6 py-4 border-t flex justify-end gap-3"><button type="button" class="btn" onclick="closeItemLocationCapacityForm()">Cancel</button><button type="submit" form="ilc-form" class="btn btn-primary">OK</button></div>
                        </div>
                    </div>
                    <div id="ilc-location-lookup-modal" class="hidden fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
                        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                            <div class="p-4 border-b"><h3 class="font-semibold">Lookup UI - Location</h3></div>
                            <div class="p-4 space-y-3">
                                <div><label for="lookup-location" class="block text-sm mb-1">Location:</label><input type="text" id="lookup-location" class="input" value="1"></div>
                                <div><label for="lookup-warehouse" class="block text-sm mb-1">Warehouse:</label><input type="text" id="lookup-warehouse" class="input"></div>
                                <button class="btn btn-primary w-full" onclick="alert('Searching...')">Search</button>
                            </div>
                            <div class="p-4 border-t flex justify-end gap-2"><button class="btn" onclick="closeIlcLocationLookup()">Cancel</button><button class="btn btn-primary" onclick="selectIlcLocation()">OK</button></div>
                        </div>
                    </div>
                `
            },
            'item-template': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Item Template</h2>
                    <p class="text-wise-gray mb-4">Manage templates for creating new items.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="btn btn-primary" onclick="showItemTemplateForm('create')">Create New Template</button>
                        <input type="text" id="it-search" placeholder="Search by template name..." class="input max-w-xs" oninput="filterItemTemplateList(this.value)">
                    </div>
                    <div id="it-list-container" class="overflow-x-auto"></div>
                    <div id="it-form-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
                        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <div class="px-6 pt-5 pb-3 border-b"><h3 id="it-form-title" class="text-lg font-semibold"></h3><button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onclick="closeItemTemplateForm()">✕</button></div>
                            <div class="p-6 overflow-y-auto"><form id="it-form" onsubmit="handleItemTemplateSubmit(event)">
                                <div role="tablist" class="border-b mb-4 flex gap-4 text-sm font-medium">
                                    <button type="button" role="tab" data-tab="general" class="tab tab-active">General</button>
                                    <button type="button" role="tab" data-tab="user-defined" class="tab">User defined data</button>
                                </div>
                                <div id="pane-general" role="tabpanel" data-pane="general">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label for="it-template" class="block text-sm mb-1">Item template:</label><input type="text" id="it-template" name="itemTemplate" required class="input"></div>
                                        <div><label for="it-separator" class="block text-sm mb-1">Separator character:</label><input type="text" id="it-separator" name="separatorCharacter" class="input" maxlength="1"></div>
                                    </div>
                                    <div id="it-fields-container" class="mt-4 space-y-3">
                                        </div>
                                    <div class="mt-4"><label class="flex items-center gap-2 text-sm"><input type="checkbox" id="it-inactive" name="inactive">Inactive</label></div>
                                </div>
                                <div id="pane-user-defined" role="tabpanel" data-pane="user-defined" class="hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${Array.from({ length: 8 }, (_, i) => `<div><label for="it-udf${i + 1}" class="block text-sm mb-1">User defined field ${i + 1}:</label><input type="text" id="it-udf${i + 1}" name="udf${i + 1}" class="input"></div>`).join('')}</div></div>
                            </form></div>
                            <div class="px-6 py-4 border-t flex justify-end gap-3"><button type="button" class="btn" onclick="closeItemTemplateForm()">Cancel</button><button type="submit" form="it-form" class="btn btn-primary">OK</button></div>
                        </div>
                    </div>
                `
            }
        });
        
        // =======================================================================
        // FUNGSI-FUNGSI: SERIAL NUMBER TEMPLATE
        // =======================================================================
        window.renderSerialNumberTemplateList = function(filter = '') {
            const container = document.getElementById('snt-list-container'); if (!container) return;
            const templates = snt_loadData();
            const filteredData = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()) || t.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `<table class="min-w-full bg-white rounded-lg shadow-md"><thead><tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm"><th class="py-3 px-6 text-left">Template name</th><th class="py-3 px-6 text-left">Description</th><th class="py-3 px-6 text-left">Active</th><th class="py-3 px-6 text-center">Actions</th></tr></thead><tbody class="text-wise-gray text-sm font-light">`;
            if (filteredData.length === 0) { tableHtml += `<tr><td colspan="4" class="py-3 px-6 text-center">No templates found.</td></tr>`; }
            else { filteredData.forEach(t => { tableHtml += `<tr class="border-b hover:bg-gray-50"><td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${t.name}</td><td class="py-3 px-6 text-left">${t.description}</td><td class="py-3 px-6 text-left">${!t.inactive ? 'Yes' : 'No'}</td><td class="py-3 px-6 text-center"><div class="flex item-center justify-center"><button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showSerialNumberTemplateForm('edit', '${t.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteSerialNumberTemplate('${t.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></td></tr>`; }); }
            tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
        };
        window.filterSerialNumberTemplateList = debounce((value) => renderSerialNumberTemplateList(value), 300);
        function renderSNT_Patterns() {
            const container = document.getElementById('snt-patterns-list'); if (!container) return;
            container.innerHTML = '';
            if(currentSNT_PatternFields.length === 0) { container.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">No pattern fields added.</div>'; return; }
            currentSNT_PatternFields.forEach((pattern, index) => {
                const div = document.createElement('div');
                div.className = 'list-row p-2'; div.dataset.index = index;
                if (index === selectedSNT_PatternIndex) { div.classList.add('selected'); }
                div.textContent = `[${pattern.type}] Length: ${pattern.length || 'N/A'}, Value: ${pattern.value || 'N/A'}`;
                div.onclick = () => {
                    selectedSNT_PatternIndex = index;
                    document.getElementById('snt-pattern-type').value = pattern.type;
                    document.getElementById('snt-pattern-length').value = pattern.length || '';
                    document.getElementById('snt-pattern-value').value = pattern.value || '';
                    renderSNT_Patterns(); 
                };
                container.appendChild(div);
            });
        }
        function clearSNT_PatternInputs() {
            document.getElementById('snt-pattern-type').value = 'Alpha';
            document.getElementById('snt-pattern-length').value = '';
            document.getElementById('snt-pattern-value').value = '';
            selectedSNT_PatternIndex = -1;
            renderSNT_Patterns();
        }
        function addSNT_Pattern() {
            const type = document.getElementById('snt-pattern-type').value;
            const length = document.getElementById('snt-pattern-length').value;
            const value = document.getElementById('snt-pattern-value').value;
            currentSNT_PatternFields.push({ type, length: length || null, value: value || null });
            selectedSNT_PatternIndex = currentSNT_PatternFields.length - 1;
            renderSNT_Patterns();
        }
        function removeSNT_Pattern() {
            if (selectedSNT_PatternIndex < 0) { window.showCustomAlert('Info', 'Please select a field to remove.'); return; }
            currentSNT_PatternFields.splice(selectedSNT_PatternIndex, 1);
            clearSNT_PatternInputs();
        }
        function moveSNT_Pattern(direction) {
            if (selectedSNT_PatternIndex < 0) { window.showCustomAlert('Info', 'Please select a field to move.'); return; }
            const newIndex = direction === 'up' ? selectedSNT_PatternIndex - 1 : selectedSNT_PatternIndex + 1;
            if (newIndex >= 0 && newIndex < currentSNT_PatternFields.length) {
                [currentSNT_PatternFields[selectedSNT_PatternIndex], currentSNT_PatternFields[newIndex]] = [currentSNT_PatternFields[newIndex], currentSNT_PatternFields[selectedSNT_PatternIndex]];
                selectedSNT_PatternIndex = newIndex;
                renderSNT_Patterns();
            }
        }
        window.showSerialNumberTemplateForm = function(mode, id = null) {
            const modal = document.getElementById('snt-form-modal');
            const form = document.getElementById('snt-form');
            const title = document.getElementById('snt-form-title');
            form.reset(); form.dataset.mode = mode; form.dataset.id = id;
            currentSNT_PatternFields = []; selectedSNT_PatternIndex = -1;
            if (mode === 'create') { title.textContent = 'Create New Serial Number Template'; }
            else { title.textContent = 'Edit Serial Number Template';
                const template = snt_loadData().find(lt => lt.id === id);
                if (template) {
                    form.name.value = template.name;
                    form.description.value = template.description;
                    form.allowDuplicates.checked = template.allowDuplicates;
                    form.allowRangeEntry.checked = template.allowRangeEntry;
                    form.inactive.checked = template.inactive;
                    currentSNT_PatternFields = JSON.parse(JSON.stringify(template.patternFields || []));
                }
            }
            clearSNT_PatternInputs();
            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.classList.remove('opacity-0', 'scale-95');
                if (!modal._listenersAttached) {
                    document.getElementById('snt-btn-add').onclick = addSNT_Pattern;
                    document.getElementById('snt-btn-clear').onclick = clearSNT_PatternInputs;
                    document.getElementById('snt-btn-remove').onclick = removeSNT_Pattern;
                    document.getElementById('snt-btn-up').onclick = () => moveSNT_Pattern('up');
                    document.getElementById('snt-btn-down').onclick = () => moveSNT_Pattern('down');
                    modal.querySelector('[role="tablist"]').onclick = (e) => { if (e.target.role === 'tab') activateTab(e.target.dataset.tab, modal); };
                    modal._listenersAttached = true;
                }
            }, 10);
        };
        window.closeSerialNumberTemplateForm = function() {
            const modal = document.getElementById('snt-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('opacity-0', 'scale-95');
            setTimeout(() => { modal.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 300);
        };
        window.handleSerialNumberTemplateSubmit = async function(event) {
            event.preventDefault();
            const form = event.target; const mode = form.dataset.mode; const id = form.dataset.id;
            const newTemplate = { name: form.name.value, description: form.description.value, allowDuplicates: form.allowDuplicates.checked, allowRangeEntry: form.allowRangeEntry.checked, inactive: form.inactive.checked, patternFields: currentSNT_PatternFields, userDefined: {} };
            let data = snt_loadData(); let msg = '';
            if (mode === 'create') { newTemplate.id = 'SNT' + Date.now(); data.push(newTemplate); msg = 'Template created!'; }
            else { const index = data.findIndex(t => t.id === id); if (index !== -1) data[index] = { ...data[index], ...newTemplate }; msg = 'Template updated!'; }
            snt_saveData(data); closeSerialNumberTemplateForm(); renderSerialNumberTemplateList(); await window.showCustomAlert('Success', msg);
        };
        window.deleteSerialNumberTemplate = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Delete this template?');
            if (confirmed) { let data = snt_loadData(); data = data.filter(t => t.id !== id); snt_saveData(data); renderSerialNumberTemplateList(); await window.showCustomAlert('Deleted', 'Template deleted!'); }
        };

        // --- SEMUA FUNGSI UNTUK SEMUA FITUR ---

        // =======================================================================
        // FUNGSI-FUNGSI: ITEM LOCATION ASSIGNMENT
        // =======================================================================
        window.renderItemLocationAssignmentList = function(filter = '') {
            const container = document.getElementById('item-location-assignment-list-container'); if (!container) return;
            let assignments = ila_loadData();
            const filteredData = assignments.filter(ila => (ila.item || '').toLowerCase().includes(filter.toLowerCase()) || (ila.permanentLocation || '').toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `<table class="min-w-full bg-white rounded-lg shadow-md"><thead><tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal"><th class="py-3 px-6 text-left">Item</th><th class="py-3 px-6 text-left">Company</th><th class="py-3 px-6 text-left">Warehouse</th><th class="py-3 px-6 text-left">Permanent Location</th><th class="py-3 px-6 text-center">Actions</th></tr></thead><tbody class="text-wise-gray text-sm font-light">`;
            if (filteredData.length === 0) { tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No assignments found.</td></tr>`; }
            else { filteredData.forEach(ila => { tableHtml += `<tr class="border-b border-wise-border hover:bg-wise-light-gray"><td class="py-3 px-6 text-left whitespace-nowrap">${ila.item}</td><td class="py-3 px-6 text-left">${ila.company}</td><td class="py-3 px-6 text-left">${ila.warehouse}</td><td class="py-3 px-6 text-left">${ila.permanentLocation}</td><td class="py-3 px-6 text-center"><div class="flex item-center justify-center"><button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showItemLocationAssignmentForm('edit', '${ila.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteItemLocationAssignment('${ila.id}')" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></td></tr>`; }); }
            tableHtml += `</tbody></table>`;
            container.innerHTML = tableHtml;
        };
        window.filterItemLocationAssignmentList = debounce((value) => renderItemLocationAssignmentList(value), 300);
        window.closeItemLocationAssignmentForm = function() { document.getElementById('ila-form-modal').classList.add('hidden'); };
        window.applyLookupLocation = function() {
            const lookupValue = document.getElementById('lookup-location').value;
            if (lookupValue.trim()) { document.getElementById('ila-permanent-location').value = lookupValue; window.showCustomAlert('Info', `Location '${lookupValue}' has been applied.`); document.querySelector('#ila-form-modal [role="tab"][data-tab="general"]').click(); }
            else { window.showCustomAlert('Warning', 'Please enter a location.'); }
        };
        window.showItemLocationAssignmentForm = function(mode, id = null) {
            const modal = document.getElementById('ila-form-modal'); const form = document.getElementById('ila-form'); const title = document.getElementById('ila-form-title');
            form.reset(); form.dataset.mode = mode; form.dataset.id = id;
            modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => { modal.querySelectorAll('[role="tab"]').forEach(btn => btn.classList.remove('tab-active')); modal.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden')); button.classList.add('tab-active'); modal.querySelector(`[data-pane="${button.dataset.tab}"]`).classList.remove('hidden'); }; });
            modal.querySelector('[data-tab="general"]').click();
            if (mode === 'create') { title.textContent = 'Create New Item Location Assignment'; }
            else {
                title.textContent = 'Edit Item Location Assignment';
                let assignments = ila_loadData(); const data = assignments.find(ila => ila.id === id);
                if (data) { form.item.value = data.item; form.company.value = data.company; form.quantityUom.value = data.quantityUom; form.warehouse.value = data.warehouse; form.permanentLocation.value = data.permanentLocation; for (let i = 1; i <= 8; i++) { form[`udf${i}`].value = data.userDefined[`udf${i}`] || ''; } }
            }
            modal.classList.remove('hidden');
        };
        window.handleItemLocationAssignmentSubmit = async function(event) {
            event.preventDefault(); const form = event.target; const mode = form.dataset.mode; const id = form.dataset.id; let assignments = ila_loadData(); const userDefinedData = {};
            for (let i = 1; i <= 8; i++) { userDefinedData[`udf${i}`] = form[`udf${i}`].value; }
            const formData = { item: form.item.value, company: form.company.value, quantityUom: form.quantityUom.value, warehouse: form.warehouse.value, permanentLocation: form.permanentLocation.value, inactive: false, userDefined: userDefinedData };
            let msg = '';
            if (mode === 'create') { formData.id = 'ILA' + Date.now(); assignments.push(formData); msg = 'Assignment created!'; }
            else { const index = assignments.findIndex(ila => ila.id === id); if (index !== -1) { assignments[index] = { ...assignments[index], ...formData }; msg = 'Assignment updated!'; } else { msg = 'Error: Assignment not found.'; } }
            ila_saveData(assignments); closeItemLocationAssignmentForm(); renderItemLocationAssignmentList(); await window.showCustomAlert('Success', msg);
        };
        window.deleteItemLocationAssignment = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure?');
            if (confirmed) { let assignments = ila_loadData(); assignments = assignments.filter(ila => ila.id !== id); ila_saveData(assignments); renderItemLocationAssignmentList(); await window.showCustomAlert('Deleted', 'Assignment deleted!'); }
        };

        // =======================================================================
        // FUNGSI-FUNGSI: ITEM LOCATION CAPACITY
        // =======================================================================
        window.renderItemLocationCapacityList = function(filter = '') {
            const container = document.getElementById('ilc-list-container'); if (!container) return;
            let data = ilc_loadData(); const filteredData = data.filter(d => d.item.toLowerCase().includes(filter.toLowerCase()) || d.company.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `<table class="min-w-full bg-white rounded-lg shadow-md"><thead><tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal"><th class="py-3 px-6 text-left">Item</th><th class="py-3 px-6 text-left">Company</th><th class="py-3 px-6 text-left">Item class</th><th class="py-3 px-6 text-center">Actions</th></tr></thead><tbody class="text-wise-gray text-sm font-light">`;
            if (filteredData.length === 0) { tableHtml += `<tr><td colspan="4" class="py-3 px-6 text-center">No capacity data found.</td></tr>`; }
            else { filteredData.forEach(d => { tableHtml += `<tr class="border-b border-wise-border hover:bg-wise-light-gray"><td class="py-3 px-6 text-left whitespace-nowrap">${d.item}</td><td class="py-3 px-6 text-left">${d.company}</td><td class="py-3 px-6 text-left">${d.itemClass}</td><td class="py-3 px-6 text-center"><div class="flex item-center justify-center"><button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showItemLocationCapacityForm('edit', '${d.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteItemLocationCapacity('${d.id}')" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></td></tr>`; }); }
            tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
        };
        window.filterItemLocationCapacityList = debounce((value) => renderItemLocationCapacityList(value), 300);
        function renderCapacityDetailsTable() {
            const container = document.getElementById('ilc-detail-table-container'); let tableHtml = `<table class="min-w-full text-sm"><thead><tr class="bg-gray-100 sticky top-0"><th class="py-2 px-4 text-left">Location Type</th><th class="py-2 px-4 text-left">Location</th><th class="py-2 px-4 text-right">Max Qty</th><th class="py-2 px-4 text-left">UM</th><th class="py-2 px-4 text-center">...</th></tr></thead><tbody>`;
            if(currentCapacityDetails.length === 0) { tableHtml += `<tr><td colspan="5" class="p-4 text-center text-gray-400">No details.</td></tr>`; }
            else { currentCapacityDetails.forEach((d, index) => { tableHtml += `<tr class="border-b hover:bg-gray-50 ${index === selectedDetailIndex ? 'bg-blue-100' : ''}" onclick="selectDetailToEdit(${index})"><td class="py-2 px-4">${d.locationType}</td><td class="py-2 px-4">${d.location}</td><td class="py-2 px-4 text-right">${d.maxQty}</td><td class="py-2 px-4">${d.quantityUm}</td><td class="py-2 px-4 text-center"><button type="button" class="text-red-500 hover:text-red-700" onclick="event.stopPropagation(); deleteDetail(${index})">✕</button></td></tr>`; }); }
            tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
        }
        window.selectDetailToEdit = function(index) { selectedDetailIndex = index; const detail = currentCapacityDetails[index]; document.getElementById('detail-max-qty').value = detail.maxQty; document.getElementById('detail-um').value = detail.quantityUm; document.getElementById('detail-location-type').value = detail.locationType; document.getElementById('detail-location').value = detail.location; renderCapacityDetailsTable(); }
        window.clearDetailForm = function() { selectedDetailIndex = -1; document.getElementById('detail-max-qty').value = ''; document.getElementById('detail-um').value = 'Pack'; document.getElementById('detail-location-type').value = ''; document.getElementById('detail-location').value = ''; renderCapacityDetailsTable(); }
        window.addOrUpdateDetail = function() { const newDetail = { maxQty: document.getElementById('detail-max-qty').value, quantityUm: document.getElementById('detail-um').value, locationType: document.getElementById('detail-location-type').value, location: document.getElementById('detail-location').value, minQty: 0, warehouse: document.getElementById('ilc-company').value, itemCapacityId: Math.floor(Math.random() * 90000) + 10000 }; if (selectedDetailIndex > -1) { currentCapacityDetails[selectedDetailIndex] = {...currentCapacityDetails[selectedDetailIndex], ...newDetail}; } else { newDetail.detailId = 'D' + Date.now(); currentCapacityDetails.push(newDetail); } clearDetailForm(); }
        window.deleteDetail = async function(index) { const confirmed = await window.showCustomConfirm('Delete Detail', 'Remove this detail?'); if(confirmed) { currentCapacityDetails.splice(index, 1); clearDetailForm(); } }
        window.showItemLocationCapacityForm = function(mode, id = null) {
            const modal = document.getElementById('ilc-form-modal'); const form = document.getElementById('ilc-form'); const title = document.getElementById('ilc-form-title');
            form.reset(); form.dataset.mode = mode; form.dataset.id = id;
            if (mode === 'create') { title.textContent = 'Create New Item Location Capacity'; currentCapacityDetails = []; }
            else { title.textContent = 'Edit Item Location Capacity'; let data = ilc_loadData(); const item = data.find(d => d.id === id); if (item) { form.item.value = item.item; form.company.value = item.company; form.itemClass.value = item.itemClass; currentCapacityDetails = JSON.parse(JSON.stringify(item.capacityDetails)); } }
            modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => { modal.querySelectorAll('[role="tab"]').forEach(btn => btn.classList.remove('tab-active')); modal.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden')); button.classList.add('tab-active'); modal.querySelector(`[data-pane="${button.dataset.tab}"]`).classList.remove('hidden'); }; });
            modal.querySelector('[data-tab="general"]').click(); clearDetailForm(); modal.classList.remove('hidden');
        };
        window.closeItemLocationCapacityForm = () => document.getElementById('ilc-form-modal').classList.add('hidden');
        window.openIlcLocationLookup = () => document.getElementById('ilc-location-lookup-modal').classList.remove('hidden');
        window.closeIlcLocationLookup = () => document.getElementById('ilc-location-lookup-modal').classList.add('hidden');
        window.selectIlcLocation = () => { document.getElementById('detail-location').value = `LOC.${document.getElementById('lookup-location').value}`; closeIlcLocationLookup(); };
        window.handleItemLocationCapacitySubmit = async function(event) {
            event.preventDefault(); const form = event.target; const mode = form.dataset.mode; const id = form.dataset.id; let data = ilc_loadData();
            const formData = { item: form.item.value, company: form.company.value, itemClass: form.itemClass.value, capacityDetails: currentCapacityDetails, userDefined: {} };
            for(let i = 1; i <= 8; i++) { formData.userDefined[`udf${i}`] = form[`udf${i}`].value; }
            let msg = '';
            if (mode === 'create') { formData.id = 'ILC' + Date.now(); data.push(formData); msg = 'Capacity created!'; }
            else { const index = data.findIndex(d => d.id === id); if (index !== -1) data[index] = { ...data[index], ...formData }; msg = 'Capacity updated!'; }
            ilc_saveData(data); closeItemLocationCapacityForm(); renderItemLocationCapacityList(); await window.showCustomAlert('Success', msg);
        };
        window.deleteItemLocationCapacity = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Delete this record?');
            if (confirmed) { let data = ilc_loadData(); data = data.filter(d => d.id !== id); ilc_saveData(data); renderItemLocationCapacityList(); await window.showCustomAlert('Deleted', 'Record deleted!'); }
        };

        // =======================================================================
        // FUNGSI-FUNGSI: ITEM TEMPLATE
        // =======================================================================
        window.renderItemTemplateList = function(filter = '') {
            const container = document.getElementById('it-list-container'); if (!container) return;
            let templates = it_loadData();
            const filteredData = templates.filter(t => t.itemTemplate.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `<table class="min-w-full bg-white rounded-lg shadow-md"><thead><tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal"><th class="py-3 px-6 text-left">Item Template</th><th class="py-3 px-6 text-left">Separator</th><th class="py-3 px-6 text-left">Field 1 Type</th><th class="py-3 px-6 text-left">Field 1 Length</th><th class="py-3 px-6 text-center">Actions</th></tr></thead><tbody class="text-wise-gray text-sm font-light">`;
            if (filteredData.length === 0) { tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No templates found.</td></tr>`; }
            else { filteredData.forEach(t => { tableHtml += `<tr class="border-b border-wise-border hover:bg-wise-light-gray"><td class="py-3 px-6 text-left whitespace-nowrap">${t.itemTemplate}</td><td class="py-3 px-6 text-left">${t.separatorCharacter}</td><td class="py-3 px-6 text-left">${t.fields[0].type}</td><td class="py-3 px-6 text-left">${t.fields[0].length}</td><td class="py-3 px-6 text-center"><div class="flex item-center justify-center"><button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showItemTemplateForm('edit', '${t.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteItemTemplate('${t.id}')" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></td></tr>`; }); }
            tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
        };
        window.filterItemTemplateList = debounce((value) => renderItemTemplateList(value), 300);
        function renderTemplateFields(fields = []) {
            const container = document.getElementById('it-fields-container'); if (!container) return;
            container.innerHTML = '';
            const fieldTypes = ['Alpha', 'Num'];
            const fullFields = Array.from({ length: 5 }, (_, i) => fields[i] || { length: 0, type: '' });
            fullFields.forEach((field, i) => {
                const fieldHtml = `<div class="grid grid-cols-[auto,1fr,1fr] gap-3 items-center">
                    <label class="text-sm font-medium">Field ${i + 1}:</label>
                    <input name="field_length_${i}" type="number" class="input" placeholder="Length" value="${field.length || ''}">
                    <select name="field_type_${i}" class="select">
                        <option value="">-- Type --</option>
                        ${fieldTypes.map(t => `<option value="${t}" ${field.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>`;
                container.insertAdjacentHTML('beforeend', fieldHtml);
            });
        }
        window.showItemTemplateForm = function(mode, id = null) {
            const modal = document.getElementById('it-form-modal'); const form = document.getElementById('it-form'); const title = document.getElementById('it-form-title');
            form.reset(); form.dataset.mode = mode; form.dataset.id = id;
            if (mode === 'create') { title.textContent = 'Create New Item Template'; renderTemplateFields(); }
            else { title.textContent = 'Edit Item Template'; const template = it_loadData().find(t => t.id === id); if (template) { form.itemTemplate.value = template.itemTemplate; form.separatorCharacter.value = template.separatorCharacter; form.inactive.checked = template.inactive; renderTemplateFields(template.fields); if (template.userDefined) { for(let i = 1; i <= 8; i++) { form[`udf${i}`].value = template.userDefined[`udf${i}`] || ''; } } } }
            modal.querySelectorAll('[role="tab"]').forEach(button => { button.onclick = () => { modal.querySelectorAll('[role="tab"]').forEach(btn => btn.classList.remove('tab-active')); modal.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden')); button.classList.add('tab-active'); modal.querySelector(`[data-pane="${button.dataset.tab}"]`).classList.remove('hidden'); }; });
            modal.querySelector('[data-tab="general"]').click(); modal.classList.remove('hidden');
        };
        window.closeItemTemplateForm = () => document.getElementById('it-form-modal').classList.add('hidden');
        window.handleItemTemplateSubmit = async function(event) {
            event.preventDefault(); const form = event.target; const mode = form.dataset.mode; const id = form.dataset.id;
            const fields = []; for (let i = 0; i < 5; i++) { fields.push({ length: parseInt(form[`field_length_${i}`].value) || 0, type: form[`field_type_${i}`].value }); }
            const userDefined = {}; for(let i = 1; i <= 8; i++) { userDefined[`udf${i}`] = form[`udf${i}`].value; }
            const formData = { itemTemplate: form.itemTemplate.value, separatorCharacter: form.separatorCharacter.value, inactive: form.inactive.checked, fields, userDefined };
            let data = it_loadData(); let msg = '';
            if (mode === 'create') { formData.id = 'IT' + Date.now(); data.push(formData); msg = 'Template created!'; }
            else { const index = data.findIndex(t => t.id === id); if (index !== -1) data[index] = { ...data[index], ...formData }; msg = 'Template updated!'; }
            it_saveData(data); closeItemTemplateForm(); renderItemTemplateList(); await window.showCustomAlert('Success', msg);
        };
        window.deleteItemTemplate = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Delete this template?');
            if (confirmed) { let data = it_loadData(); data = data.filter(t => t.id !== id); it_saveData(data); renderItemTemplateList(); await window.showCustomAlert('Deleted', 'Template deleted!'); }
        };

        // =======================================================================
        // FUNGSI-FUNGSI: SERIAL NUMBER TEMPLATE
        // =======================================================================
        window.renderSerialNumberTemplateList = function(filter = '') {
            const container = document.getElementById('snt-list-container'); if (!container) return;
            const templates = snt_loadData();
            const filteredData = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()) || t.description.toLowerCase().includes(filter.toLowerCase()));
            let tableHtml = `<table class="min-w-full bg-white rounded-lg shadow-md"><thead><tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm"><th class="py-3 px-6 text-left">Template name</th><th class="py-3 px-6 text-left">Description</th><th class="py-3 px-6 text-left">Active</th><th class="py-3 px-6 text-center">Actions</th></tr></thead><tbody class="text-wise-gray text-sm font-light">`;
            if (filteredData.length === 0) { tableHtml += `<tr><td colspan="4" class="py-3 px-6 text-center">No templates found.</td></tr>`; }
            else { filteredData.forEach(t => { tableHtml += `<tr class="border-b hover:bg-gray-50"><td class="py-3 px-6 text-left font-semibold text-wise-dark-gray">${t.name}</td><td class="py-3 px-6 text-left">${t.description}</td><td class="py-3 px-6 text-left">${!t.inactive ? 'Yes' : 'No'}</td><td class="py-3 px-6 text-center"><div class="flex item-center justify-center"><button class="w-6 h-6 p-1 mr-2 hover:text-wise-primary" onclick="showSerialNumberTemplateForm('edit', '${t.id}')" title="Edit"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button class="w-6 h-6 p-1 mr-2 hover:text-red-500" onclick="deleteSerialNumberTemplate('${t.id}')" title="Delete"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></td></tr>`; }); }
            tableHtml += `</tbody></table>`; container.innerHTML = tableHtml;
        };
        window.filterSerialNumberTemplateList = debounce((value) => renderSerialNumberTemplateList(value), 300);
        function renderSNT_Patterns() {
            const container = document.getElementById('snt-patterns-list'); if (!container) return;
            container.innerHTML = '';
            if(currentSNT_PatternFields.length === 0) { container.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">No pattern fields added.</div>'; return; }
            currentSNT_PatternFields.forEach((pattern, index) => {
                const div = document.createElement('div');
                div.className = 'list-row p-2'; div.dataset.index = index;
                if (index === selectedSNT_PatternIndex) { div.classList.add('selected'); }
                div.textContent = `[${pattern.type}] Length: ${pattern.length || 'N/A'}, Value: ${pattern.value || 'N/A'}`;
                div.onclick = () => {
                    selectedSNT_PatternIndex = index;
                    document.getElementById('snt-pattern-type').value = pattern.type;
                    document.getElementById('snt-pattern-length').value = pattern.length || '';
                    document.getElementById('snt-pattern-value').value = pattern.value || '';
                    renderSNT_Patterns(); 
                };
                container.appendChild(div);
            });
        }
        function clearSNT_PatternInputs() {
            document.getElementById('snt-pattern-type').value = 'Alpha';
            document.getElementById('snt-pattern-length').value = '';
            document.getElementById('snt-pattern-value').value = '';
            selectedSNT_PatternIndex = -1;
            renderSNT_Patterns();
        }
        function addSNT_Pattern() {
            const type = document.getElementById('snt-pattern-type').value;
            const length = document.getElementById('snt-pattern-length').value;
            const value = document.getElementById('snt-pattern-value').value;
            currentSNT_PatternFields.push({ type, length: length || null, value: value || null });
            selectedSNT_PatternIndex = currentSNT_PatternFields.length - 1;
            renderSNT_Patterns();
        }
        function removeSNT_Pattern() {
            if (selectedSNT_PatternIndex < 0) { window.showCustomAlert('Info', 'Please select a field to remove.'); return; }
            currentSNT_PatternFields.splice(selectedSNT_PatternIndex, 1);
            clearSNT_PatternInputs();
        }
        function moveSNT_Pattern(direction) {
            if (selectedSNT_PatternIndex < 0) { window.showCustomAlert('Info', 'Please select a field to move.'); return; }
            const newIndex = direction === 'up' ? selectedSNT_PatternIndex - 1 : selectedSNT_PatternIndex + 1;
            if (newIndex >= 0 && newIndex < currentSNT_PatternFields.length) {
                [currentSNT_PatternFields[selectedSNT_PatternIndex], currentSNT_PatternFields[newIndex]] = [currentSNT_PatternFields[newIndex], currentSNT_PatternFields[selectedSNT_PatternIndex]];
                selectedSNT_PatternIndex = newIndex;
                renderSNT_Patterns();
            }
        }
        window.showSerialNumberTemplateForm = function(mode, id = null) {
            const modal = document.getElementById('snt-form-modal');
            const form = document.getElementById('snt-form');
            const title = document.getElementById('snt-form-title');
            form.reset(); form.dataset.mode = mode; form.dataset.id = id;
            currentSNT_PatternFields = []; selectedSNT_PatternIndex = -1;
            if (mode === 'create') { title.textContent = 'Create New Serial Number Template'; }
            else { title.textContent = 'Edit Serial Number Template';
                const template = snt_loadData().find(lt => lt.id === id);
                if (template) {
                    form.name.value = template.name;
                    form.description.value = template.description;
                    form.allowDuplicates.checked = template.allowDuplicates;
                    form.allowRangeEntry.checked = template.allowRangeEntry;
                    form.inactive.checked = template.inactive;
                    currentSNT_PatternFields = JSON.parse(JSON.stringify(template.patternFields || []));
                }
            }
            clearSNT_PatternInputs();
            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.classList.remove('opacity-0', 'scale-95');
                if (!modal._listenersAttached) {
                    document.getElementById('snt-btn-add').onclick = addSNT_Pattern;
                    document.getElementById('snt-btn-clear').onclick = clearSNT_PatternInputs;
                    document.getElementById('snt-btn-remove').onclick = removeSNT_Pattern;
                    document.getElementById('snt-btn-up').onclick = () => moveSNT_Pattern('up');
                    document.getElementById('snt-btn-down').onclick = () => moveSNT_Pattern('down');
                    modal.querySelector('[role="tablist"]').onclick = (e) => { if (e.target.role === 'tab') activateTab(e.target.dataset.tab, modal); };
                    modal._listenersAttached = true;
                }
            }, 10);
        };
        window.closeSerialNumberTemplateForm = function() {
            const modal = document.getElementById('snt-form-modal');
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('opacity-0', 'scale-95');
            setTimeout(() => { modal.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 300);
        };
        window.handleSerialNumberTemplateSubmit = async function(event) {
            event.preventDefault();
            const form = event.target; const mode = form.dataset.mode; const id = form.dataset.id;
            const newTemplate = { name: form.name.value, description: form.description.value, allowDuplicates: form.allowDuplicates.checked, allowRangeEntry: form.allowRangeEntry.checked, inactive: form.inactive.checked, patternFields: currentSNT_PatternFields, userDefined: {} };
            let data = snt_loadData(); let msg = '';
            if (mode === 'create') { newTemplate.id = 'SNT' + Date.now(); data.push(newTemplate); msg = 'Template created!'; }
            else { const index = data.findIndex(t => t.id === id); if (index !== -1) data[index] = { ...data[index], ...newTemplate }; msg = 'Template updated!'; }
            snt_saveData(data); closeSerialNumberTemplateForm(); renderSerialNumberTemplateList(); await window.showCustomAlert('Success', msg);
        };
        window.deleteSerialNumberTemplate = async function(id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Delete this template?');
            if (confirmed) { let data = snt_loadData(); data = data.filter(t => t.id !== id); snt_saveData(data); renderSerialNumberTemplateList(); await window.showCustomAlert('Deleted', 'Template deleted!'); }
        };

        function activateTab(tabName, container) {
    // Sembunyikan semua panel dan nonaktifkan semua tombol tab
    container.querySelectorAll('[role="tab"]').forEach(tab => tab.classList.remove('tab-active'));
    container.querySelectorAll('[role="tabpanel"]').forEach(pane => pane.classList.add('hidden'));

    // Tampilkan panel dan aktifkan tombol tab yang dipilih
    container.querySelector(`[role="tab"][data-tab="${tabName}"]`).classList.add('tab-active');
    container.querySelector(`[role="tabpanel"][data-pane="${tabName}"]`).classList.remove('hidden');
}


        // --- PEMICU (TRIGGER) UNTUK RENDER ---
        document.addEventListener('content:rendered', (e) => {
            const key = e.detail.key;
            if (key === 'serial-number-template') { renderSerialNumberTemplateList(); }
            else if (key === 'item-location-assignment') { renderItemLocationAssignmentList(); }
            else if (key === 'item-location-capacity') { renderItemLocationCapacityList(); }
            else if (key === 'item-template') { renderItemTemplateList(); }
        });
        
    });
})();