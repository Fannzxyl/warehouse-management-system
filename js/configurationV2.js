(function () {
    document.addEventListener('DOMContentLoaded', () => {
        // Memastikan variabel global dari configuration.js sudah tersedia
        if (typeof window.contentData === 'undefined') {
            console.error("Error: window.contentData is not defined. Ensure configuration.js is loaded before configurationV2.js.");
            return;
        }
        if (typeof window.searchItems === 'undefined') { console.error("Error: window.searchItems is not defined."); return; }
        if (typeof window.parentMapping === 'undefined') { console.error("Error: window.parentMapping is not defined."); return; }
        if (typeof window.allMenus === 'undefined') { console.error("Error: window.allMenus is not defined."); return; }
        if (typeof window.showCustomAlert === 'undefined') { console.error("Error: window.showCustomAlert is not defined."); return; }
        if (typeof window.showCustomConfirm === 'undefined') { console.error("Error: window.showCustomConfirm is not defined."); return; }
        if (typeof window.setupTabSwitching === 'undefined') { console.error("Error: window.setupTabSwitching is not defined."); return; }
        if (typeof window.zones === 'undefined') {
            console.warn("Warning: window.zones is not defined. Using fallback zones.");
            window.zones = [{ identifier: 'Z-01' }, { identifier: 'Z-02' }];
        }
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

        // =========================
        // CONTENT (HTML Skeletons)
        // =========================
        Object.assign(window.contentData, {
            'configuration-user-profile': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - User Profile</h2>
                    <p class="text-wise-gray mb-4">Manage user profiles, permissions, and other user-specific settings.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showUserProfileForm('create')">
                            Create New User Profile
                        </button>
                        <input type="text" id="user-profile-search" placeholder="Search user profile..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterUserProfileList(this.value)">
                    </div>
                    <div id="user-profile-list-container" class="overflow-x-auto">
                        <!-- User profile list table will be rendered here -->
                    </div>
                    
                    <!-- User Profile Form Modal -->
                    <div id="user-profile-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl flex flex-col max-h-[90vh]">
                            <h3 id="user-profile-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="user-profile-form" onsubmit="handleUserProfileSubmit(event)">
                                    <!-- Tab Buttons -->
                                    <div class="flex space-x-2 mb-2 border-b">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-general">General</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-preferences">Preferences</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-company-access">Company access</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-warehouse-access">Warehouse access</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-work-profile">Work profile</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="up-authorized-adjustment-types">Authorized adjustment types</button>
                                    </div>

                                    <!-- General Tab -->
                                    <div id="up-general" class="tab-content">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-user" class="block text-sm font-medium text-wise-dark-gray">User:</label>
                                                <input type="text" id="up-user" name="user" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                                <input type="text" id="up-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-warehouse" class="block text-sm font-medium text-wise-dark-gray">Default warehouse:</label>
                                                <input type="text" id="up-default-warehouse" name="defaultWarehouse" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-email-address" class="block text-sm font-medium text-wise-dark-gray">Email address:</label>
                                                <input type="email" id="up-email-address" name="emailAddress" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-department" class="block text-sm font-medium text-wise-dark-gray">Department:</label>
                                                <input type="text" id="up-department" name="department" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-shift" class="block text-sm font-medium text-wise-dark-gray">Shift:</label>
                                                <input type="text" id="up-shift" name="shift" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <h4 class="font-semibold text-wise-dark-gray mt-4 mb-2">Security Information</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-rf-password" class="block text-sm font-medium text-wise-dark-gray">RF password:</label>
                                                <input type="text" id="up-rf-password" name="rfPassword" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div class="flex items-center mt-6">
                                                <input type="checkbox" id="up-hide-rf-password" name="hideRfPassword" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="togglePasswordVisibility('up-rf-password', this.checked)">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Hide RF password</span>
                                            </div>
                                            <div>
                                                <label for="up-uncollected-password" class="block text-sm font-medium text-wise-dark-gray">Uncollected password:</label>
                                                <input type="text" id="up-uncollected-password" name="uncollectedPassword" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div class="flex items-center mt-6">
                                                <input type="checkbox" id="up-hide-uncollected-password" name="hideUncollectedPassword" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="togglePasswordVisibility('up-uncollected-password', this.checked)">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Hide uncollected password</span>
                                            </div>
                                            <div>
                                                <label for="up-security-group" class="block text-sm font-medium text-wise-dark-gray">Security group:</label>
                                                <select id="up-security-group" name="securityGroup" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    <option value="">--Select--</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Cycle Counting">Cycle Counting</option>
                                                </select>
                                            </div>
                                        </div>
                                        <h4 class="font-semibold text-wise-dark-gray mt-4 mb-2">Payroll Information</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-payroll-id" class="block text-sm font-medium text-wise-dark-gray">Payroll id:</label>
                                                <input type="text" id="up-payroll-id" name="payrollId" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-wage-rate" class="block text-sm font-medium text-wise-dark-gray">Wage rate:</label>
                                                <input type="number" step="0.01" id="up-wage-rate" name="wageRate" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-hire-date" class="block text-sm font-medium text-wise-dark-gray">Hire date:</label>
                                                <input type="date" id="up-hire-date" name="hireDate" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Preferences Tab -->
                                    <div id="up-preferences" class="tab-content hidden space-y-6">
                                        <div>
                                            <h4 class="text-sm font-semibold text-wise-dark-gray pb-2 mb-3 border-b border-wise-border">-Processing</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="up-pref-cycle-counting" class="block text-sm font-medium text-wise-dark-gray">Cycle counting:</label>
                                                    <select id="up-pref-cycle-counting" name="cycleCounting" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        ${window.defaultStandardOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="up-pref-shipping" class="block text-sm font-medium text-wise-dark-gray">Shipping:</label>
                                                    <select id="up-pref-shipping" name="shipping" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        ${window.defaultStandardOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="up-pref-packing" class="block text-sm font-medium text-wise-dark-gray">Packing:</label>
                                                    <select id="up-pref-packing" name="packing" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        ${window.defaultStandardOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="up-pref-work-order" class="block text-sm font-medium text-wise-dark-gray">Work order:</label>
                                                    <select id="up-pref-work-order" name="workOrder" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        ${window.defaultStandardOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                                    </select>
                                                </div>
                                                <div class="md:col-span-2">
                                                    <label for="up-pref-receiving" class="block text-sm font-medium text-wise-dark-gray">Receiving:</label>
                                                    <select id="up-pref-receiving" name="receiving" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        ${window.defaultStandardOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 class="text-sm font-semibold text-wise-dark-gray pb-2 mb-3 border-b border-wise-border">-Supply chain intelligence</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="up-pref-report-dir" class="block text-sm font-medium text-wise-dark-gray">Report directory:</label>
                                                    <input type="text" id="up-pref-report-dir" name="reportDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="up-pref-my-link-dir" class="block text-sm font-medium text-wise-dark-gray">My link directory:</label>
                                                    <input type="text" id="up-pref-my-link-dir" name="myLinkDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div class="md:col-span-2">
                                                    <label for="up-pref-default-chart" class="block text-sm font-medium text-wise-dark-gray">Default chart:</label>
                                                    <select id="up-pref-default-chart" name="defaultChart" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        <option value="">-- Select Chart --</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 class="text-sm font-semibold text-wise-dark-gray pb-2 mb-3 border-b border-wise-border">-System</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="up-pref-desktop-template" class="block text-sm font-medium text-wise-dark-gray">Desktop template:</label>
                                                    <select id="up-pref-desktop-template" name="desktopTemplate" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        <option value="">Select Template --</option>
                                                        <option value="Adminisitrasi">Adminisitrasi</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label for="up-pref-rf-style-sheet" class="block text-sm font-medium text-wise-dark-gray">RF style sheet:</label>
                                                    <select id="up-pref-rf-style-sheet" name="rfStyleSheet" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                        <option value="">-- Select Style Sheet --</option>
                                                    </select>
                                                </div>
                                                <div class="md:col-span-2">
                                                    <label for="up-pref-excel-dir" class="block text-sm font-medium text-wise-dark-gray">Excel export directory:</label>
                                                    <input type="text" id="up-pref-excel-dir" name="excelExportDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Company Access Tab -->
                                    <div id="up-company-access" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Company Authorization</h4>
                                        <div class="mb-4">
                                            <label class="inline-flex items-center">
                                                <input type="radio" name="companyAccessType" value="All" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                                <span class="ml-2 text-sm text-wise-dark-gray">All</span>
                                            </label>
                                            <label class="inline-flex items-center ml-4">
                                                <input type="radio" name="companyAccessType" value="List" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">List</span>
                                            </label>
                                        </div>
                                        <div id="company-access-list" class="border border-wise-border p-4 rounded-md bg-wise-light-gray max-h-40 overflow-y-auto">
                                            <!-- Company checkboxes will be rendered here -->
                                            <div class="flex items-center"><input type="checkbox" id="company-dcb" name="companyAccess" value="DCB" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="company-dcb" class="ml-2 text-sm text-wise-dark-gray">DCB</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="company-dci" name="companyAccess" value="DCI" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="company-dci" class="ml-2 text-sm text-wise-dark-gray">DCI</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="company-dmr" name="companyAccess" value="DMR" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="company-dmr" class="ml-2 text-sm text-wise-dark-gray">DMR</label></div>
                                        </div>
                                    </div>

                                    <!-- Warehouse Access Tab -->
                                    <div id="up-warehouse-access" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Warehouse Authorization</h4>
                                        <div class="mb-4">
                                            <label class="inline-flex items-center">
                                                <input type="radio" name="warehouseAccessType" value="All" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                                <span class="ml-2 text-sm text-wise-dark-gray">All</span>
                                            </label>
                                            <label class="inline-flex items-center ml-4">
                                                <input type="radio" name="warehouseAccessType" value="List" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">List</span>
                                            </label>
                                        </div>
                                        <div id="warehouse-access-list" class="border border-wise-border p-4 rounded-md bg-wise-light-gray max-h-40 overflow-y-auto">
                                            <!-- Warehouse checkboxes will be rendered here -->
                                            <div class="flex items-center"><input type="checkbox" id="warehouse-dci" name="warehouseAccess" value="DCI" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="warehouse-dci" class="ml-2 text-sm text-wise-dark-gray">DCI</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="warehouse-dmr" name="warehouseAccess" value="DMR" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="warehouse-dmr" class="ml-2 text-sm text-wise-dark-gray">DMR</label></div>
                                        </div>
                                    </div>

                                    <!-- Work Profile Tab -->
                                    <div id="up-work-profile" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Work Profile Authorization</h4>
                                        <div class="mb-4">
                                            <label class="inline-flex items-center">
                                                <input type="radio" name="workProfileAccessType" value="All" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                                <span class="ml-2 text-sm text-wise-dark-gray">All</span>
                                            </label>
                                            <label class="inline-flex items-center ml-4">
                                                <input type="radio" name="workProfileAccessType" value="List" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">List</span>
                                            </label>
                                        </div>
                                        <div class="mb-4">
                                            <label for="up-default-work-profile" class="block text-sm font-medium text-wise-dark-gray">Default work profile:</label>
                                            <input type="text" id="up-default-work-profile" name="defaultWorkProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div id="work-profile-list" class="border border-wise-border p-4 rounded-md bg-wise-light-gray max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
                                            <!-- Work profile checkboxes will be rendered here -->
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-cycle-count-system-direct" name="workProfileAccess" value="Cycle Count System Direct" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-cycle-count-system-direct" class="ml-2 text-sm text-wise-dark-gray">Cycle Count System Direct</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-area-2" name="workProfileAccess" value="Pick - SMS Area 2" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-area-2" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS Area 2</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-cycle-count-load-direct" name="workProfileAccess" value="Cycle Count Load Direct" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-cycle-count-load-direct" class="ml-2 text-sm text-wise-dark-gray">Cycle Count Load Direct</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-replenishment-user-directed" name="workProfileAccess" value="Replenishment - User Directed" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-replenishment-user-directed" class="ml-2 text-sm text-wise-dark-gray">Replenishment - User Directed</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-loading-user-direct" name="workProfileAccess" value="Loading User Direct" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-loading-user-direct" class="ml-2 text-sm text-wise-dark-gray">Loading User Direct</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-full-pallet" name="workProfileAccess" value="Pick - SMS Full Pallet" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-full-pallet" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS Full Pallet</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-location-transfer" name="workProfileAccess" value="Location Transfer" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-location-transfer" class="ml-2 text-sm text-wise-dark-gray">Location Transfer</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-dlclw" name="workProfileAccess" value="Pick - SMS DLCLW" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-dlclw" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS DLCLW</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-cby-good" name="workProfileAccess" value="Pick - CBY Good" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-cby-good" class="ml-2 text-sm text-wise-dark-gray">Pick - CBY Good</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-quick-do" name="workProfileAccess" value="Pick - Quick DO" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-quick-do" class="ml-2 text-sm text-wise-dark-gray">Pick - Quick DO</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-cby-bad" name="workProfileAccess" value="Pick - CBY Bad" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-cby-bad" class="ml-2 text-sm text-wise-dark-gray">Pick - CBY Bad</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-return-supplier" name="workProfileAccess" value="Pick - Return Supplier" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-return-supplier" class="ml-2 text-sm text-wise-dark-gray">Pick - Return Supplier</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-area-1-f1-f4" name="workProfileAccess" value="Pick - SMS Area 1 F1 F4" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-area-1-f1-f4" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS Area 1 F1 F4</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-user-loaded" name="workProfileAccess" value="Pick - User Loaded" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-user-loaded" class="ml-2 text-sm text-wise-dark-gray">Pick - User Loaded</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-area-1-f5-f7" name="workProfileAccess" value="Pick - SMS Area 1 F5 F7" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-area-1-f5-f7" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS Area 1 F5 F7</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-condensed-open" name="workProfileAccess" value="Pick - Condensed Open" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-condensed-open" class="ml-2 text-sm text-wise-dark-gray">Pick - Condensed Open</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-pick-sms-area-1-usat" name="workProfileAccess" value="Pick - SMS Area 1 USAT" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-pick-sms-area-1-usat" class="ml-2 text-sm text-wise-dark-gray">Pick - SMS Area 1 USAT</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="work-profile-putaway" name="workProfileAccess" value="Putaway" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="work-profile-putaway" class="ml-2 text-sm text-wise-dark-gray">Putaway</label></div>
                                        </div>
                                    </div>

                                    <!-- Authorized Adjustment Types Tab -->
                                    <div id="up-authorized-adjustment-types" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Adjustment type authorization</h4>
                                        <div class="mb-4">
                                            <label class="inline-flex items-center">
                                                <input type="radio" name="adjustmentTypeAccessType" value="All" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" checked>
                                                <span class="ml-2 text-sm text-wise-dark-gray">All</span>
                                            </label>
                                            <label class="inline-flex items-center ml-4">
                                                <input type="radio" name="adjustmentTypeAccessType" value="List" class="form-radio h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">List</span>
                                            </label>
                                        </div>
                                        <div id="authorized-adjustment-types-list" class="border border-wise-border p-4 rounded-md bg-wise-light-gray max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
                                            <!-- Adjustment type checkboxes will be rendered here -->
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-100-do-supply" name="adjustmentTypeAccess" value="100-DO Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-100-do-supply" class="ml-2 text-sm text-wise-dark-gray">100-DO Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-101-do-consumption" name="adjustmentTypeAccess" value="101-DO Consumption (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-101-do-consumption" class="ml-2 text-sm text-wise-dark-gray">101-DO Consumption (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-102-inventory-correction-plus" name="adjustmentTypeAccess" value="102-Inventory Correction (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-102-inventory-correction-plus" class="ml-2 text-sm text-wise-dark-gray">102-Inventory Correction (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-103-inventory-correction-minus" name="adjustmentTypeAccess" value="103-Inventory Correction (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-103-inventory-correction-minus" class="ml-2 text-sm text-wise-dark-gray">103-Inventory Correction (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-104-production-supply" name="adjustmentTypeAccess" value="104-Production Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-104-production-supply" class="ml-2 text-sm text-wise-dark-gray">104-Production Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-105-production-consumption" name="adjustmentTypeAccess" value="105-Production Consumption (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-105-production-consumption" class="ml-2 text-sm text-wise-dark-gray">105-Production Consumption (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-106-damage" name="adjustmentTypeAccess" value="106-Damage (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-106-damage" class="ml-2 text-sm text-wise-dark-gray">106-Damage (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-107-return-to-vendor" name="adjustmentTypeAccess" value="107-Return to Vendor (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-107-return-to-vendor" class="ml-2 text-sm text-wise-dark-gray">107-Return to Vendor (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-108-customer-return" name="adjustmentTypeAccess" value="108-Customer Return (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-108-customer-return" class="ml-2 text-sm text-wise-dark-gray">108-Customer Return (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-109-sample" name="adjustmentTypeAccess" value="109-Sample (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-109-sample" class="ml-2 text-sm text-wise-dark-gray">109-Sample (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-110-kitting-supply" name="adjustmentTypeAccess" value="110-Kitting Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-110-kitting-supply" class="ml-2 text-sm text-wise-dark-gray">110-Kitting Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-111-kitting-output" name="adjustmentTypeAccess" value="111-Kitting Output (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-111-kitting-output" class="ml-2 text-sm text-wise-dark-gray">111-Kitting Output (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-112-value-added-service-supply" name="adjustmentTypeAccess" value="112-Value Added Service Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-112-value-added-service-supply" class="ml-2 text-sm text-wise-dark-gray">112-Value Added Service Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-113-value-added-service-output" name="adjustmentTypeAccess" value="113-Value Added Service Output (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-113-value-added-service-output" class="ml-2 text-sm text-wise-dark-gray">113-Value Added Service Output (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-114-do-supply-plus" name="adjustmentTypeAccess" value="114-DO Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-114-do-supply-plus" class="ml-2 text-sm text-wise-dark-gray">114-DO Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-115-do-consumption-plus" name="adjustmentTypeAccess" value="115-DO Consumption (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-115-do-consumption-plus" class="ml-2 text-sm text-wise-dark-gray">115-DO Consumption (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-116-inventory-correction-plus-two" name="adjustmentTypeAccess" value="116-Inventory Correction (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-116-inventory-correction-plus-two" class="ml-2 text-sm text-wise-dark-gray">116-Inventory Correction (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-117-inventory-correction-minus-two" name="adjustmentTypeAccess" value="117-Inventory Correction (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-117-inventory-correction-minus-two" class="ml-2 text-sm text-wise-dark-gray">117-Inventory Correction (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-118-production-supply-plus" name="adjustmentTypeAccess" value="118-Production Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-118-production-supply-plus" class="ml-2 text-sm text-wise-dark-gray">118-Production Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-119-production-consumption-plus" name="adjustmentTypeAccess" value="119-Production Consumption (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-119-production-consumption-plus" class="ml-2 text-sm text-wise-dark-gray">119-Production Consumption (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-120-damage-plus" name="adjustmentTypeAccess" value="120-Damage (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-120-damage-plus" class="ml-2 text-sm text-wise-dark-gray">120-Damage (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-121-return-to-vendor-plus" name="adjustmentTypeAccess" value="121-Return to Vendor (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-121-return-to-vendor-plus" class="ml-2 text-sm text-wise-dark-gray">121-Return to Vendor (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-122-customer-return-plus" name="adjustmentTypeAccess" value="122-Customer Return (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-122-customer-return-plus" class="ml-2 text-sm text-wise-dark-gray">122-Customer Return (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-123-sample-plus" name="adjustmentTypeAccess" value="123-Sample (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-123-sample-plus" class="ml-2 text-sm text-wise-dark-gray">123-Sample (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-124-kitting-supply-plus" name="adjustmentTypeAccess" value="124-Kitting Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-124-kitting-supply-plus" class="ml-2 text-sm text-wise-dark-gray">124-Kitting Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-125-kitting-output-plus" name="adjustmentTypeAccess" value="125-Kitting Output (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-125-kitting-output-plus" class="ml-2 text-sm text-wise-dark-gray">125-Kitting Output (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-126-value-added-service-supply-plus" name="adjustmentTypeAccess" value="126-Value Added Service Supply (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-126-value-added-service-supply-plus" class="ml-2 text-sm text-wise-dark-gray">126-Value Added Service Supply (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-127-value-added-service-output-plus" name="adjustmentTypeAccess" value="127-Value Added Service Output (+)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-127-value-added-service-output-plus" class="ml-2 text-sm text-wise-dark-gray">127-Value Added Service Output (+)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-128-do-supply-minus" name="adjustmentTypeAccess" value="128-DO Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-128-do-supply-minus" class="ml-2 text-sm text-wise-dark-gray">128-DO Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-129-do-consumption-minus" name="adjustmentTypeAccess" value="129-DO Consumption (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-129-do-consumption-minus" class="ml-2 text-sm text-wise-dark-gray">129-DO Consumption (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-130-inventory-correction-minus-three" name="adjustmentTypeAccess" value="130-Inventory Correction (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-130-inventory-correction-minus-three" class="ml-2 text-sm text-wise-dark-gray">130-Inventory Correction (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-131-inventory-correction-minus-four" name="adjustmentTypeAccess" value="131-Inventory Correction (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-131-inventory-correction-minus-four" class="ml-2 text-sm text-wise-dark-gray">131-Inventory Correction (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-132-production-supply-minus" name="adjustmentTypeAccess" value="132-Production Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-132-production-supply-minus" class="ml-2 text-sm text-wise-dark-gray">132-Production Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-133-production-consumption-minus" name="adjustmentTypeAccess" value="133-Production Consumption (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-133-production-consumption-minus" class="ml-2 text-sm text-wise-dark-gray">133-Production Consumption (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-134-damage-minus" name="adjustmentTypeAccess" value="134-Damage (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-134-damage-minus" class="ml-2 text-sm text-wise-dark-gray">134-Damage (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-135-return-to-vendor-minus" name="adjustmentTypeAccess" value="135-Return to Vendor (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-135-return-to-vendor-minus" class="ml-2 text-sm text-wise-dark-gray">135-Return to Vendor (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-136-customer-return-minus" name="adjustmentTypeAccess" value="136-Customer Return (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-136-customer-return-minus" class="ml-2 text-sm text-wise-dark-gray">136-Customer Return (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-137-sample-minus" name="adjustmentTypeAccess" value="137-Sample (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-137-sample-minus" class="ml-2 text-sm text-wise-dark-gray">137-Sample (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-138-kitting-supply-minus" name="adjustmentTypeAccess" value="138-Kitting Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-138-kitting-supply-minus" class="ml-2 text-sm text-wise-dark-gray">138-Kitting Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-139-kitting-output-minus" name="adjustmentTypeAccess" value="139-Kitting Output (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-139-kitting-output-minus" class="ml-2 text-sm text-wise-dark-gray">139-Kitting Output (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-140-value-added-service-supply-minus" name="adjustmentTypeAccess" value="140-Value Added Service Supply (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-140-value-added-service-supply-minus" class="ml-2 text-sm text-wise-dark-gray">140-Value Added Service Supply (-)</label></div>
                                            <div class="flex items-center"><input type="checkbox" id="adj-type-141-value-added-service-output-minus" name="adjustmentTypeAccess" value="141-Value Added Service Output (-)" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="adj-type-141-value-added-service-output-minus" class="ml-2 text-sm text-wise-dark-gray">141-Value Added Service Output (-)</label></div>
                                        </div>
                                    </div>

                                    <!-- User Defined Data Tab -->
                                    <div id="up-user-defined" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${Array.from({ length: 8 }, (_, i) => `
                                            <div>
                                                <label for="up-udf${i + 1}" class="block text-sm font-medium text-wise-dark-gray">User defined field ${i + 1}:</label>
                                                <input type="text" id="up-udf${i + 1}" name="udf${i + 1}" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray" onclick="closeUserProfileForm()">Cancel</button>
                                <button type="submit" form="user-profile-form" id="user-profile-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-lg hover:bg-blue-700 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'allocation-rule': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Rule</h2>
                    <p class="text-wise-gray mb-4">Manage rules that determine how items are allocated from warehouse locations.</p>

                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform"
                            onclick="showAllocationRuleForm('create')">Create New Allocation Rule</button>
                        <input type="text" id="allocation-rule-search" placeholder="Search allocation rule..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationRuleList(this.value)">
                    </div>

                    <div id="allocation-rule-list-container" class="overflow-x-auto"></div>

                    <!-- MODAL -->
                    <div id="allocation-rule-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="allocation-rule-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="allocation-rule-form" onsubmit="handleAllocationRuleSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="allocation-rule-name" class="block text-sm font-medium text-wise-dark-gray">Allocation Rule Name:</label>
                                            <input type="text" id="allocation-rule-name" name="ruleName" required
                                                class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray"
                                                oninput="checkAllocationRuleFormValidity()">
                                        </div>
                                        <div>
                                            <label for="allocation-rule-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="allocation-rule-description" name="description"
                                                class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray"
                                                oninput="checkAllocationRuleFormValidity()">
                                        </div>
                                    </div>

                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="allocation-rule-inactive" name="inactive"
                                                class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>

                                    <!-- Tabs -->
                                    <div class="flex space-x-2 mb-2 border-b">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ar-detail-records">Detail Records</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ar-user-defined">User Defined Data</button>
                                    </div>

                                    <div id="ar-detail-records" class="tab-content">
                                        <div class="mb-4">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">Detail Records</h4>
                                            <div id="allocation-rule-detail-records-container" class="space-y-3 p-4 border border-wise-border rounded-md bg-wise-light-gray">
                                                <p id="allocation-detail-records-placeholder" class="text-wise-gray text-sm">Input Allocation Rule Name and Description first to enable detail records.</p>
                                                <div id="allocation-detail-records-list" class="space-y-2"></div>
                                                <button type="button" id="add-allocation-detail-record-btn"
                                                    class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform"
                                                    onclick="addAllocationDetailRecord()" disabled>Add Detail Record</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="ar-user-defined" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${Array.from({ length: 8 }, (_, i) => `
                                            <div>
                                                <label for="ar-udf${i + 1}" class="block text-sm font-medium text-wise-dark-gray">User defined field ${i + 1}:</label>
                                                <input type="text" id="ar-udf${i + 1}" name="udf${i + 1}"
                                                    class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationRuleForm()">Cancel</button>
                                <button type="submit" form="allocation-rule-form" id="allocation-rule-submit-button"
                                    class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
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
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform"
                            onclick="showAllocationStrategyForm('create')">Create New Allocation Strategy</button>
                        <input type="text" id="allocation-strategy-search" placeholder="Search allocation strategy..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationStrategyList(this.value)">
                    </div>

                    <div id="allocation-strategy-list-container" class="overflow-x-auto"></div>

                    <!-- MODAL -->
                    <div id="allocation-strategy-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                            <h3 id="allocation-strategy-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="allocation-strategy-form" onsubmit="handleAllocationStrategySubmit(event)">
                                    <div class="mb-4">
                                        <label for="allocation-strategy-identifier" class="block text-sm font-medium text-wise-dark-gray">Identifier:</label>
                                        <input type="text" id="allocation-strategy-identifier" name="identifier" required
                                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>

                                    <div class="mb-4">
                                        <label for="allocation-strategy-record-type" class="block text-sm font-medium text-wise-dark-gray">Record type:</label>
                                        <input type="text" id="allocation-strategy-record-type" name="recordType" value="ALLOCSTRAT" readonly
                                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-gray-100 text-wise-gray cursor-not-allowed">
                                    </div>

                                    <div class="mb-4">
                                        <label for="allocation-strategy-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                        <input type="text" id="allocation-strategy-description" name="description"
                                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>

                                    <div class="mb-4">
                                        <label for="allocation-strategy-system-value" class="block text-sm font-medium text-wise-dark-gray">System Value I:</label>
                                        <input type="text" id="allocation-strategy-system-value" name="systemValueI" placeholder="e.g., 30"
                                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                    </div>

                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="allocation-strategy-inactive" name="inactive"
                                                class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>

                                    <div class="mb-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="allocation-strategy-system-created" name="systemCreated"
                                                class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">System created</span>
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationStrategyForm()">Cancel</button>
                                <button type="submit" form="allocation-strategy-form" id="allocation-strategy-submit-button"
                                    class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'allocation-rule-assignment': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Rule Assignment</h2>
                    <p class="text-wise-gray mb-4">Set criteria, rule, and priority.</p>
                    
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform"
                            onclick="showAllocationRuleAssignmentForm('create')">Create New Assignment</button>
                        <input type="text" id="allocation-rule-assignment-search" placeholder="Search assignment..."
                            class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationRuleAssignmentList(this.value)">
                    </div>

                    <div id="allocation-rule-assignment-list-container" class="overflow-x-auto">
                        <!-- Table will be rendered by JavaScript here -->
                    </div>

                    <!-- MODAL -->
                    <div id="allocation-rule-assignment-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="allocation-rule-assignment-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="allocation-rule-assignment-form" onsubmit="handleAllocationRuleAssignmentSubmit(event)">
                                    <!-- Tabs -->
                                    <div class="flex space-x-2 mb-2 border-b">
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ara-general">General</button>
                                        <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="ara-user-defined">User Defined Data</button>
                                    </div>

                                    <div id="ara-general" class="tab-content">
                                        <div class="grid grid-cols-1 gap-4 mb-4">
                                            <div>
                                                <label for="ara-priority" class="block text-sm font-medium text-wise-dark-gray">Priority:</label>
                                                <input type="number" id="ara-priority" name="priority" required
                                                    class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="ara-criteria" class="block text-sm font-medium text-wise-dark-gray">Criteria:</label>
                                                <select id="ara-criteria" name="criteria" required
                                                    class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    <option value="">Select Criteria...</option>
                                                    <!-- Criteria options will be populated by JS -->
                                                </select>
                                                <p class="text-xs text-wise-gray mt-1">Choose which filter/criteria this assignment applies to.</p>
                                            </div>
                                            <div>
                                                <label for="ara-allocation-rule" class="block text-sm font-medium text-wise-dark-gray">Allocation Rule:</label>
                                                <select id="ara-allocation-rule" name="allocationRule" required
                                                    class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                                    <option value="">Select Allocation Rule...</option>
                                                    <!-- Allocation Rule options will be populated by JS -->
                                                </select>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-4">
                                            <!-- Always override toggle -->
                                            <div class="flex items-center">
                                                <label for="ara-always-override" class="flex items-center cursor-pointer">
                                                    <div class="relative">
                                                        <input type="checkbox" id="ara-always-override" name="alwaysOverride" class="sr-only" onchange="toggleSwitch(this)" />
                                                        <div class="block bg-gray-300 w-10 h-6 rounded-full transition-colors duration-200 ease-in-out"></div>
                                                        <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></div>
                                                    </div>
                                                    <div class="ml-2 text-sm font-medium text-wise-dark-gray">Always override</div>
                                                </label>
                                            </div>
                                            <!-- Active toggle -->
                                            <div class="flex items-center">
                                                <label for="ara-active" class="flex items-center cursor-pointer">
                                                    <div class="relative">
                                                        <input type="checkbox" id="ara-active" name="active" class="sr-only" checked onchange="toggleSwitch(this)" />
                                                        <div class="block bg-wise-primary w-10 h-6 rounded-full transition-colors duration-200 ease-in-out"></div>
                                                        <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out translate-x-full"></div>
                                                    </div>
                                                    <div class="ml-2 text-sm font-medium text-wise-dark-gray">Active</div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="mt-4 text-xs text-wise-gray flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 mr-1">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span id="ara-last-updated-info">Last updated 21/22 10:21 AM — Candra</span>
                                        </div>
                                    </div>

                                    <div id="ara-user-defined" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${Array.from({ length: 8 }, (_, i) => `
                                            <div>
                                                <label for="ara-udf${i + 1}" class="block text-sm font-medium text-wise-dark-gray">User defined field ${i + 1}:</label>
                                                <input type="text" id="ara-udf${i + 1}" name="udf${i + 1}"
                                                    class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationRuleAssignmentForm()">Cancel</button>
                                <button type="submit" form="allocation-rule-assignment-form" id="allocation-rule-assignment-submit-button"
                                    class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'allocation-location-selection': {
    full: `
        <style>
            /* kunci page di belakang saat modal terbuka */
            body.modal-open { height: 100vh; overflow: hidden; }
            /* cegah scroll chaining ke body (opsional tapi bagus) */
            html, body { overscroll-behavior: contain; }
            /* pastikan isi modal tidak bikin scrollbar internal */
            #alsModal .als-body { overflow: visible; }

            /* Optional: Adjust header/footer padding for compactness */
            #alsModal .als-header {
                padding-top: 12px; /* py-3 equivalent */
                padding-bottom: 8px; /* pb-2 equivalent */
            }
            #alsModal .als-footer {
                padding-top: 8px; /* pt-2 equivalent */
                padding-bottom: 12px; /* pb-3 equivalent */
            }
        </style>
        <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Location Selection</h2>
        <p class="text-wise-gray mb-4">Manage strategies used to allocate items from warehouse locations.</p>

        <div class="flex justify-between items-center mb-4">
            <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform"
                onclick="showAllocationLocationSelectionForm('create')">Create New</button>
            <input type="text" id="allocation-location-selection-search" placeholder="Search allocation location selection..."
                class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterAllocationLocationSelectionList(this.value)">
        </div>

        <div id="allocation-location-selection-list-container" class="overflow-x-auto"></div>

        <!-- MODAL STRUCTURE -->
        <div id="alsModal"
             class="fixed inset-0 z-[60] flex items-start justify-center
                    p-4 md:p-6 bg-black/30 overflow-y-auto hidden">
            <div class="als-content w-[min(1100px,95vw)] bg-white rounded-xl shadow-2xl">
                <div class="als-header px-6 pt-5 pb-3 border-b border-gray-200 bg-white rounded-t-xl">

                    <h3 id="allocation-location-selection-form-title" class="text-lg font-semibold text-wise-dark-gray mb-2"></h3>
                    <!-- Close button can be added here if needed -->
                </div>
                <div class="als-body px-6 py-5">
                    <form id="allocation-location-selection-form" onsubmit="handleAllocationLocationSelectionSubmit(event)">
                        <div class="p-5 md:p-6 border-b border-gray-100 -mx-6 -mt-6 mb-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-wise-dark-gray">Record type</label>
                                    <input id="als-recType" name="recordType" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-gray-100 text-wise-gray cursor-not-allowed" value="ALLOC SEL" readonly>
                                </div>
                                <div class="lg:col-span-2">
                                    <label class="block text-sm font-medium text-wise-dark-gray">Filter name</label>
                                    <input id="als-filterName" name="filterName" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-wise-dark-gray">Table name</label>
                                    <select id="als-tableName" name="tableName" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        <option>Location</option>
                                        <option>Location inventory</option>
                                        <option>Location inventory attributes</option>
                                    </select>
                                </div>
                                <div class="md:col-span-2 lg:col-span-4">
                                    <label class="block text-sm font-medium text-wise-dark-gray">Description</label>
                                    <input id="als-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                </div>
                            </div>
                        </div>

                        <div class="flex space-x-6 mb-4 border-b border-wise-border">
                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium tab-active" data-tab="als-filter-data">Filter data</button>
                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium" data-tab="als-order-by">Order by</button>
                        </div>

                        <div id="als-filter-data" class="tab-content space-y-5">
                            <div class="flex items-center justify-between flex-wrap gap-3">
                                <h3 class="text-sm font-semibold text-wise-dark-gray">Filter criteria</h3>
                                <div class="segmented">
                                    <input type="radio" id="als-logic-and" name="logic" value="AND" checked>
                                    <label for="als-logic-and">And</label>
                                    <input type="radio" id="als-logic-or" name="logic" value="OR">
                                    <label for="als-logic-or">Or</label>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div class="md:col-span-6">
                                    <label class="block text-sm font-medium text-wise-dark-gray mb-1">Attribute</label>
                                    <select id="als-attr" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        <option>Active</option>
                                        <option>Allocate in transit</option>
                                        <option>Allocation zone</option>
                                        <option>Allow work unit selection on system-directed work</option>
                                        <option>Check digit</option>
                                        <option>Date/time stamp</option>
                                        <option>Dock area anchor criteria</option>
                                        <option>Dock area selection priority</option>
                                        <option>Warehouse</option>
                                        <option>Inventory status</option>
                                        <option>LOC_INV_ATTRIBUTE4</option>
                                    </select>
                                </div>
                                <div class="md:col-span-3">
                                    <label class="block text-sm font-medium text-wise-dark-gray mb-1">Operand</label>
                                    <select id="als-op" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        <option>=</option>
                                        <option>!=</option>
                                        <option>&lt;</option>
                                        <option>&gt;</option>
                                        <option>&lt;=</option>
                                        <option>&gt;=</option>
                                        <option>is null</option>
                                        <option>is not null</option>
                                    </select>
                                </div>
                                <div class="md:col-span-3">
                                    <label class="block text-sm font-medium text-wise-dark-gray mb-1">Value</label>
                                    <input id="als-val" list="als-valOptions"
                                           class="mt-1 block w-64 md:w-72 max-w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray"
                                           placeholder="N'DCB' / <User_def4>">
                                    <datalist id="als-valOptions">
                                      <option value="N'DCB'">
                                      <option value="N'Available'">
                                      <option value="<User_def4>">
                                      <option value="N'Y'">
                                      <option value="0">
                                    </datalist>
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-12 lg:col-span-2 xl:col-span-2 flex flex-col gap-2">
                                    <button id="als-btnAddRule" type="button" class="px-3 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform whitespace-nowrap">Add rule</button>
                                    <button id="als-btnUpdateSelectedRule" type="button" class="px-3 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform whitespace-nowrap">Update selected</button>
                                    <button id="als-btnClearInputs" type="button" class="px-3 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform whitespace-nowrap">Clear inputs</button>
                                </div>

                                <div class="col-span-12 lg:col-span-7 xl:col-span-8">
                                    <div class="rounded-2xl border border-wise-border bg-white h-full">
                                        <div class="flex items-center justify-between px-3 py-2 border-b border-wise-border">
                                            <span class="text-xs uppercase tracking-wider text-wise-gray">Current expression</span>
                                            <div class="flex gap-2">
                                                <button id="als-btnUpRule" type="button" class="px-2.5 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">↑ Up</button>
                                                <button id="als-btnDownRule" type="button" class="px-2.5 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">↓ Down</button>
                                            </div>
                                        </div>
                                        <div id="als-ruleList" class="mono scroll-slim max-h-64 overflow-auto p-3 text-[13px] leading-6 text-wise-dark-gray"></div>
                                    </div>
                                </div>
                                
                                <div class="col-span-12 lg:col-span-2 xl:col-span-2 flex flex-col gap-2 items-start">
                                    <button id="als-btnDeleteSelectedRule" type="button" class="als-action inline-flex items-center justify-center w-[160px] whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-wise-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary">Delete selected</button>
                                    <button id="als-btnDeleteLastRule" type="button" class="als-action inline-flex items-center justify-center w-[160px] whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-wise-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary">Delete last</button>
                                    <div class="h-1"></div>
                                    <button id="als-btnLParen" type="button" class="als-action inline-flex items-center justify-center w-[160px] whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-wise-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary">Insert (</button>
                                    <button id="als-btnRParen" type="button" class="als-action inline-flex items-center justify-center w-[160px] whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-wise-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary">Insert )</button>
                                    <button id="als-btnDelParen" type="button" class="als-action inline-flex items-center justify-center w-[160px] whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-wise-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary">Delete ( )</button>
                                </div>
                            </div>
                            <div class="flex items-center gap-6 pt-1">
                                <label class="inline-flex items-center gap-2 text-sm text-wise-dark-gray">
                                    <input type="checkbox" id="als-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"> Inactive
                                </label>
                                <label class="inline-flex items-center gap-2 text-sm text-wise-dark-gray">
                                    <input type="checkbox" id="als-systemCreated" name="systemCreated" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"> System created
                                </label>
                            </div>
                        </div>

                        <div id="als-order-by" class="tab-content hidden space-y-5">
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div class="md:col-span-5 flex flex-col gap-4">
                                    <div class="space-y-3">
                                        <h3 class="text-sm font-semibold text-wise-dark-gray">Order by criteria</h3>
                                        <div class="segmented">
                                            <input type="radio" id="als-order-asc" name="order-direction" value="Ascending" checked>
                                            <label for="als-order-asc">Ascending</label>
                                            <input type="radio" id="als-order-desc" name="order-direction" value="Descending">
                                            <label for="als-order-desc">Descending</label>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-wise-dark-gray mb-1">Attribute</label>
                                        <select id="als-obAttribute" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            <option>LOCATION.LOCATION</option>
                                            <option>Warehouse</option>
                                            <option>Location</option>
                                            <option>Allocation zone</option>
                                            <option>Inventory status</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button id="als-btnAddSortCriteria" type="button" class="px-3 py-1 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform w-full">Add sort criteria</button>
                                    </div>
                                </div>

                                <div class="md:col-span-7 flex flex-col gap-2">
                                    <div class="rounded-2xl border border-wise-border bg-white flex-1 min-h-[150px]">
                                        <div class="flex items-center justify-between px-3 py-2 border-b border-wise-border">
                                            <span class="text-xs uppercase tracking-wider text-wise-gray">Sorted items</span>
                                            <div class="flex gap-2">
                                                <button id="als-btnUpOrder" type="button" class="px-2.5 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">↑ Up</button>
                                                <button id="als-btnDownOrder" type="button" class="px-2.5 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">↓ Down</button>
                                            </div>
                                        </div>
                                        <div id="als-orderList" class="mono scroll-slim max-h-48 overflow-auto p-3 text-[13px] leading-6 text-wise-dark-gray">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        <button id="als-btnDeleteSelectedSortItem" type="button" class="px-3 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">Delete selected</button>
                                        <button id="als-btnDeleteLastSortItem" type="button" class="px-3 py-1.5 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm active-press transform">Delete last</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="als-footer px-6 pt-2 pb-3 border-t border-wise-border bg-white rounded-b-xl flex justify-between items-center">
                    <div class="text-xs text-wise-gray flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 mr-1">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span id="als-last-updated-info">Last updated 02-08-2017 2:09:32 PM — User: chandra</span>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeAllocationLocationSelectionForm()">Cancel</button>
                        <button type="submit" form="allocation-location-selection-form" id="allocation-location-selection-submit-button"
                            class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `,
},
            'allocation-rule-assignment-criteria': {
    full: `
        <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Allocation Rule Assignment Criteria</h2>
        <p class="text-wise-gray mb-4">Set criteria, and record type, etc.</p>
        
        <div class="flex justify-between items-center mb-4">
            <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform"
                onclick="showARACForm('create')">Create New</button>
            <input type="text" id="arac-search" placeholder="Search Allocation Rule Criteria..."
                class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterARACList(this.value)">
        </div>

        <div id="arac-list-container" class="overflow-x-auto"></div>

        <div id="arac-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl flex flex-col max-h-[95vh] card">
                <h3 class="text-lg font-semibold text-wise-dark-gray mb-4">Allocation Rule Assignment Criteria</h3>
                <p class="text-sm text-wise-gray mb-4 -mt-3">Set criteria, and record type, etc.</p>

                <div class="flex-1 overflow-y-auto pr-2 -mr-4 text-sm text-wise-dark-gray">
                    <form id="arac-form" onsubmit="handleARACSubmit(event)" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label for="arac-record-type" class="block font-medium mb-1">Record type:</label>
                                <input type="text" id="arac-record-type" name="recordType" readonly class="input bg-gray-100 cursor-not-allowed">
                            </div>
                            <div>
                                <label for="arac-filter-name" class="block font-medium mb-1">Filter Name:</label>
                                <input type="text" id="arac-filter-name" name="filterName" required class="input">
                            </div>
                            <div class="md:col-span-2">
                                <label for="arac-description" class="block font-medium mb-1">Description:</label>
                                <input type="text" id="arac-description" name="description" class="input">
                            </div>
                            <div>
                                <label for="arac-table-name" class="block font-medium mb-1">Table name:</label>
                                <select id="arac-table-name" name="tableName" class="select">
                                    <option>Shipment detail</option>
                                    <option>Item master</option>
                                    <option>Customer data</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="border border-gray-200 p-2 rounded-xl">
                            <fieldset class="border border-gray-200 p-4 rounded-lg">
                                <legend class="px-2 font-medium text-red-600">Filter criteria</legend>
                                <div class="flex gap-4">
                                    <div class="flex-1 space-y-3">
                                        <div class="flex items-center gap-4">
                                            <label class="flex items-center gap-2"><input type="radio" name="arac-logic" value="And" class="custom-radio" checked> <span>And</span></label>
                                            <label class="flex items-center gap-2"><input type="radio" name="arac-logic" value="Or" class="custom-radio"> <span>Or</span></label>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <label for="arac-attribute" class="block text-xs font-medium mb-1">Attribute:</label>
                                                <select id="arac-attribute" class="select h-9 text-xs">
                                                    <option>warehouse</option>
                                                    <option>ORDER_TYP</option>
                                                    <option>ITEM.CATEGORY</option>
                                                    <option>ITEM.SEASON</option>
                                                    <option>carrier</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label for="arac-operand" class="block text-xs font-medium mb-1">Operand:</label>
                                                <select id="arac-operand" class="select h-9 text-xs">
                                                    <option>=</option>
                                                    <option>!=</option>
                                                    <option>></option>
                                                    <option><</option>
                                                    <option>>=</option>
                                                    <option><=</option>
                                                    <option>is null</option>
                                                    <option>is not null</option>
                                                    <option>LIKE</option>
                                                    <option>NOT LIKE</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label for="arac-value" class="block text-xs font-medium mb-1">Value:</label>
                                                <input type="text" id="arac-value" class="input h-9 text-xs">
                                            </div>
                                        </div>
                                        <div class="w-full border border-gray-300 rounded-lg">
                                            <div class="flex items-center justify-between px-2 py-1 bg-gray-50 border-b rounded-t-lg">
                                                <span class="text-xs font-semibold text-gray-500">CURRENT EXPRESSION</span>
                                                <div class="flex gap-2">
                                                    <button type="button" class="px-2 py-0.5 border rounded-md text-xs hover:bg-gray-100" onclick="moveARACRule('up')">↑ Up</button>
                                                    <button type="button" class="px-2 py-0.5 border rounded-md text-xs hover:bg-gray-100" onclick="moveARACRule('down')">↓ Down</button>
                                                </div>
                                            </div>
                                            <div id="arac-rule-display" class="h-24 p-2 overflow-y-auto font-mono text-xs list-row"></div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="addARACRule()">Add Rule</button>
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="deleteLastARACRule()">Delete Last Rule</button>
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="deleteSelectedARACRule()">Delete Select Rule</button>
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="addARACLeftParen()">Insert (</button>
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="addARACRightParen()">Insert )</button>
                                        <button type="button" class="px-3 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm whitespace-nowrap" onclick="deleteARACParen()">Delete Parenthesis</button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        
                        <div class="flex items-center gap-8 pt-2">
                           <label class="flex items-center gap-2">
                                <input type="checkbox" id="arac-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                <span class="font-medium">Inactive</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="arac-system-created" name="systemCreated" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border">
                                <span class="font-medium">System created</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" class="btn" onclick="closeARACForm()">Cancel</button>
                    <button type="submit" form="arac-form" id="arac-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 shadow-sm text-sm">OK</button>
                </div>
            </div>
        </div>
    `,
},
        });

        // Global flag to track if listeners for ALS form are attached
        let alsFormListenersAttached = false;

        // =========================
        // Search registry & menus
        // =========================
        window.searchItems.push(
            { id: 'allocation-rule', title: 'Allocation Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'allocation-strategies', title: 'Allocation Strategies', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'allocation-rule-assignment', title: 'Allocation Rule Assignment', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'allocation-location-selection', title: 'Allocation Location Selection', category: 'Configuration', lastUpdated: 'Latest' } // New item
        );
        window.allMenus.push(
            { name: 'Allocation Rule', category: 'Configurations' },
            { name: 'Allocation Strategies', category: 'Configurations' },
            { name: 'Allocation Rule Assignment', category: 'Configurations' },
            { name: 'Allocation Location Selection', category: 'Configurations' } // New menu item
        );
        window.parentMapping['allocation-rule'] = 'configuration';
        window.parentMapping['allocation-strategies'] = 'configuration';
        window.parentMapping['allocation-rule-assignment'] = 'configuration';
        window.parentMapping['allocation-location-selection'] = 'configuration'; // New parent mapping

        // =========================
        // Data seeds
        // =========================
        // Allocation Rules (dummy)
        let allocationRules = JSON.parse(localStorage.getItem('allocationRules')) || [
            { id: 'AR001', ruleName: 'Standard Allocation', description: 'Default rule for item allocation', inactive: false, detailRecords: [], udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '' },
            { id: 'AR002', ruleName: 'FIFO Allocation', description: 'First-In, First-Out allocation', inactive: false, detailRecords: [], udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '' },
        ];

        // Allocation Strategies (sesuai isi SS)
        let allocationStrategies = JSON.parse(localStorage.getItem('allocationStrategies')) || [
            { id: 'AS001', identifier: 'MD03', recordType: 'ALLOCSTRAT', description: 'AKUR Pre Allocation Strategy', systemValueI: 'MD03', inactive: false, systemCreated: true },
            { id: 'AS002', identifier: '30', recordType: 'ALLOCSTRAT', description: 'Closest Match - allocate least available that fits entire request', systemValueI: '30', inactive: false, systemCreated: true },
            { id: 'AS003', identifier: '40', recordType: 'ALLOCSTRAT', description: 'First expiration, first out', systemValueI: '40', inactive: false, systemCreated: true },
            { id: 'AS004', identifier: '50', recordType: 'ALLOCSTRAT', description: 'First in, first out', systemValueI: '50', inactive: false, systemCreated: true },
            { id: 'AS005', identifier: '10', recordType: 'ALLOCSTRAT', description: 'Item Location Assignment', systemValueI: '10', inactive: false, systemCreated: true },
            { id: 'AS006', identifier: '20', recordType: 'ALLOCSTRAT', description: 'Item location assignment with over allocation allowed', systemValueI: '20', inactive: false, systemCreated: true },
            { id: 'AS007', identifier: '90', recordType: 'ALLOCSTRAT', description: 'Last expired, first out', systemValueI: '90', inactive: false, systemCreated: true },
            { id: 'AS008', identifier: '60', recordType: 'ALLOCSTRAT', description: 'Last in, first out', systemValueI: '60', inactive: false, systemCreated: true },
            { id: 'AS009', identifier: '70', recordType: 'ALLOCSTRAT', description: 'Maximize space - allocate least available first', systemValueI: '70', inactive: false, systemCreated: true },
            { id: 'AS010', identifier: '80', recordType: 'ALLOCSTRAT', description: 'Minimize visits - allocate most available first', systemValueI: '80', inactive: false, systemCreated: true },
        ];

        // Allocation types (untuk detail records Allocation Rule)
        const allocationTypes = [
            { id: 'AT001', name: 'Full Pallet' },
            { id: 'AT002', name: 'Case Pick' },
            { id: 'AT003', name: 'Each Pick' },
        ];

        // Allocation Rule Assignments (new dummy data)
        let allocationRuleAssignments = JSON.parse(localStorage.getItem('allocationRuleAssignments')) || [
            { id: 'ARA001', priority: 1, criteria: 'DCB-COOKFOOD', allocationRule: 'Standard Allocation', alwaysOverride: false, active: true, udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', lastUpdated: '21/22 10:21 AM', updatedBy: 'Candra' },
            { id: 'ARA002', priority: 2, criteria: 'DCB-EXT-DRY', allocationRule: 'FIFO Allocation', alwaysOverride: false, active: true, udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', lastUpdated: '21/22 10:21 AM', updatedBy: 'Candra' },
            { id: 'ARA003', priority: 3, criteria: 'DCB-FASHION', allocationRule: 'Standard Allocation', alwaysOverride: false, active: true, udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', lastUpdated: '21/22 10:21 AM', updatedBy: 'Candra' },
            { id: 'ARA004', priority: 4, criteria: 'DCB-RETURN-DRY', allocationRule: 'FIFO Allocation', alwaysOverride: false, active: true, udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', lastUpdated: '21/22 10:21 AM', updatedBy: 'Candra' },
        ];

        // Dummy criteria for Allocation Rule Assignment
        const allocationAssignmentCriteria = [
            { id: 'CRT001', identifier: 'DCB-COOKFOOD' },
            { id: 'CRT002', identifier: 'DCB-EXT-DRY' },
            { id: 'CRT003', identifier: 'DCB-FASHION' },
            { id: 'CRT004', identifier: 'DCB-RETURN-DRY' },
            { id: 'CRT005', identifier: 'DCB-FROZEN' },
        ];

        // Allocation Location Selection dummy data
        let allocationLocationSelections = JSON.parse(localStorage.getItem('allocationLocationSelections')) || [
            { id: 'ALS001', recordType: 'ALLOC SEL', filterName: 'A - DCB-OPENBOX', description: 'A - DCB-OPENBOX', tableName: 'Location', inactive: false, systemCreated: false, filterRules: [{ type:'rule', logic:'AND', attribute:'Warehouse', op:'=', value:"N'DCB'"}, { type:'rule', logic:'AND', attribute:'Active', op:'=', value:"N'Y'"}], orderBy: [{ attribute: 'LOCATION.LOCATION', direction: 'Ascending' }], udf1: '0.00000', udf2: '0.00000', udf3: '', udf4: '', udf5: '', udf6: '', udf6: '', udf7: '', udf8: '', lastUpdated: '02-08-2017 2:09:32 PM', updatedBy: 'chandra' },
            { id: 'ALS002', recordType: 'ALLOC SEL', filterName: 'B - XYZ-CLOSED', description: 'B - XYZ-CLOSED', tableName: 'Location inventory', inactive: false, systemCreated: false, filterRules: [{ type:'rule', logic:'AND', attribute:'Warehouse', op:'=', value:"N'XYZ'"}], orderBy: [{ attribute: 'LOCATION_INVENTORY.INVENTORY_STS', direction: 'Descending' }], udf1: '0.00000', udf2: '0.00000', udf3: '', udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', lastUpdated: '02-08-2017 2:09:32 PM', updatedBy: 'chandra' },
        ];

        // ==================================================
// Allocation Rule Assignment Criteria 
// ==================================================
let allocationRuleAssignmentCriteria = JSON.parse(localStorage.getItem('allocationRuleAssignmentCriteria')) || [
    { 
        id: 'ARAC001', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.COOKFOOD', 
        description: 'DCB.COOKFOOD', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: true,
        rules: []
    },
    { 
        id: 'ARAC002', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.EXT.DRY', 
        description: 'DCB.EXT.DRY', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
    { 
        id: 'ARAC003', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.FASHION', 
        description: 'DCB.FASHION', 
        tableName: 'Item master',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
    { 
        id: 'ARAC004', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.RETURN.DRY', 
        description: 'DCB.RETURN.DRY', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
    { 
        id: 'ARAC005', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.RETURN.FRS', 
        description: 'DCB.RETURN.FRS', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
    { 
        id: 'ARAC006', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.RETURN.FSH', 
        description: 'DCB.RETURN.FSH', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
    { 
        id: 'ARAC007', 
        recordType: 'OUT RS CRIT',
        filterName: 'DCB.RETURN.VIRTUAL.SHIP', 
        description: 'DCB.RETURN.VIRTUAL.SHIP', 
        tableName: 'Shipment detail',
        systemCreated: false, 
        inactive: false,
        rules: []
    },
];

let currentARACRules = [];
let selectedARACRuleIndex = -1;

window.renderARACList = function (filter = '') {
    const container = document.getElementById('arac-list-container');
    if (!container) return;

    const filteredData = allocationRuleAssignmentCriteria.filter(c =>
        (c.filterName || '').toLowerCase().includes(filter.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(filter.toLowerCase())
    );

    let tableHtml = `
        <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                    <th class="py-3 px-6 text-left">Filter Name</th>
                    <th class="py-3 px-6 text-left">Description</th>
                    <th class="py-3 px-6 text-left">System Created</th>
                    <th class="py-3 px-6 text-left">Active</th>
                    <th class="py-3 px-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody class="text-wise-gray text-sm font-light">
    `;

    if (filteredData.length === 0) {
        tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No criteria found.</td></tr>`;
    } else {
        filteredData.forEach(c => {
            tableHtml += `
                <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                    <td class="py-3 px-6 text-left font-medium">${c.filterName}</td>
                    <td class="py-3 px-6 text-left">${c.description}</td>
                    <td class="py-3 px-6 text-left">${c.systemCreated ? 'YES' : 'NO'}</td>
                    <td class="py-3 px-6 text-left">${!c.inactive ? 'YES' : 'NO'}</td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center">
                            <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showARACForm('edit', '${c.id}')" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteARAC('${c.id}')" title="Delete">
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

window.filterARACList = function (value) {
    renderARACList(value);
};

window.renderARACRules = function() {
    const display = document.getElementById('arac-rule-display');
    display.innerHTML = '';
    let indent = 0;
    currentARACRules.forEach((rule, index) => {
        const line = document.createElement('div');
        line.className = 'cursor-pointer hover:bg-gray-100 px-1 rounded';
        if (index === selectedARACRuleIndex) {
            line.className += ' bg-blue-100';
        }

        if (rule.type === 'rparen') indent = Math.max(0, indent - 1);
        
        let textContent = '';
        const padding = '&nbsp;'.repeat(indent * 4);
        if (rule.type === 'rule') {
            const logic = (index > 0 && currentARACRules[index - 1].type !== 'lparen') ? `${rule.logic} ` : '';
            textContent = `${padding}${logic}${rule.attribute} ${rule.op} ${rule.value}`;
        } else if (rule.type === 'lparen') {
            const logic = (index > 0) ? 'AND ' : '';
            textContent = `${padding}${logic}(`;
            indent++;
        } else if (rule.type === 'rparen') {
            textContent = `${padding})`;
        }
        
        line.innerHTML = textContent;
        line.onclick = () => {
            selectedARACRuleIndex = index;
            renderARACRules();
        };
        display.appendChild(line);
    });
};

window.addARACRule = function() {
    const logic = document.querySelector('input[name="arac-logic"]:checked').value;
    const attribute = document.getElementById('arac-attribute').value;
    const op = document.getElementById('arac-operand').value;
    const value = document.getElementById('arac-value').value;

    if (!value && op !== 'is null' && op !== 'is not null') {
        window.showCustomAlert('Error', 'Value is required for this operand.');
        return;
    }

    const newRule = { type: 'rule', logic, attribute, op, value };

    if (selectedARACRuleIndex > -1) {
        currentARACRules.splice(selectedARACRuleIndex + 1, 0, newRule);
    } else {
        currentARACRules.push(newRule);
    }
    selectedARACRuleIndex++;
    renderARACRules();
};

window.deleteLastARACRule = function() {
    if (currentARACRules.length > 0) {
        currentARACRules.pop();
        selectedARACRuleIndex = currentARACRules.length - 1;
        renderARACRules();
    }
};

window.deleteSelectedARACRule = function() {
    if (selectedARACRuleIndex > -1) {
        currentARACRules.splice(selectedARACRuleIndex, 1);
        selectedARACRuleIndex = Math.min(selectedARACRuleIndex, currentARACRules.length - 1);
        renderARACRules();
    }
};

window.addARACLeftParen = function() {
    currentARACRules.push({ type: 'lparen' });
    renderARACRules();
};

window.addARACRightParen = function() {
    currentARACRules.push({ type: 'rparen' });
    renderARACRules();
};

window.deleteARACParen = function() {
    for (let i = currentARACRules.length - 1; i >= 0; i--) {
        if (currentARACRules[i].type === 'lparen' || currentARACRules[i].type === 'rparen') {
            currentARACRules.splice(i, 1);
            renderARACRules();
            return;
        }
    }
};

window.moveARACRule = function(direction) {
    if (selectedARACRuleIndex < 0) return;

    if (direction === 'up' && selectedARACRuleIndex > 0) {
        [currentARACRules[selectedARACRuleIndex - 1], currentARACRules[selectedARACRuleIndex]] = 
        [currentARACRules[selectedARACRuleIndex], currentARACRules[selectedARACRuleIndex - 1]];
        selectedARACRuleIndex--;
    } else if (direction === 'down' && selectedARACRuleIndex < currentARACRules.length - 1) {
        [currentARACRules[selectedARACRuleIndex + 1], currentARACRules[selectedARACRuleIndex]] = 
        [currentARACRules[selectedARACRuleIndex], currentARACRules[selectedARACRuleIndex + 1]];
        selectedARACRuleIndex++;
    }
    renderARACRules();
};

window.showARACForm = function (mode, id = null) {
    const modal = document.getElementById('arac-form-modal');
    const form = document.getElementById('arac-form');

    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id;
    
    selectedARACRuleIndex = -1;
    currentARACRules = [];

    if (mode === 'create') {
        document.getElementById('arac-record-type').value = 'OUT RS CRIT';
    } else {
        const criteria = allocationRuleAssignmentCriteria.find(c => c.id === id);
        if (criteria) {
            document.getElementById('arac-record-type').value = criteria.recordType;
            document.getElementById('arac-filter-name').value = criteria.filterName;
            document.getElementById('arac-description').value = criteria.description;
            document.getElementById('arac-table-name').value = criteria.tableName;
            document.getElementById('arac-inactive').checked = criteria.inactive;
            document.getElementById('arac-system-created').checked = criteria.systemCreated;
            currentARACRules = JSON.parse(JSON.stringify(criteria.rules || []));
        }
    }
    renderARACRules();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeARACForm = function () {
    const modal = document.getElementById('arac-form-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

window.handleARACSubmit = async function (event) {
    event.preventDefault();
    const form = event.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;

    const newCriteria = {
        recordType: form['recordType'].value,
        filterName: form['filterName'].value,
        description: form['description'].value,
        tableName: form['tableName'].value,
        inactive: document.getElementById('arac-inactive').checked,
    systemCreated: document.getElementById('arac-system-created').checked,
    rules: currentARACRules,
};

    if (mode === 'create') {
        newCriteria.id = 'ARAC' + String(Date.now()).slice(-5);
        allocationRuleAssignmentCriteria.unshift(newCriteria);
        await window.showCustomAlert('Success', 'Criteria created successfully!');
    } else {
        const index = allocationRuleAssignmentCriteria.findIndex(c => c.id === id);
        if (index !== -1) {
            allocationRuleAssignmentCriteria[index] = { ...allocationRuleAssignmentCriteria[index], ...newCriteria };
            await window.showCustomAlert('Success', 'Criteria updated successfully!');
        }
    }
    saveAllocationRuleAssignmentCriteria();
    closeARACForm();
    renderARACList();
};

window.deleteARAC = async function (id) {
    const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this criteria?');
    if (confirmed) {
        allocationRuleAssignmentCriteria = allocationRuleAssignmentCriteria.filter(c => c.id !== id);
        saveAllocationRuleAssignmentCriteria();
        renderARACList();
        await window.showCustomAlert('Deleted', 'Criteria deleted successfully!');
    }
};


        // Persist helpers
        function saveAllocationRules() { localStorage.setItem('allocationRules', JSON.stringify(allocationRules)); }
        function saveAllocationStrategies() { localStorage.setItem('allocationStrategies', JSON.stringify(allocationStrategies)); }
        function saveAllocationRuleAssignments() { localStorage.setItem('allocationRuleAssignments', JSON.stringify(allocationRuleAssignments)); }
        function saveAllocationLocationSelections() { localStorage.setItem('allocationLocationSelections', JSON.stringify(allocationLocationSelections)); } // New save function
        function saveAllocationRuleAssignmentCriteria() { localStorage.setItem('allocationRuleAssignmentCriteria', JSON.stringify(allocationRuleAssignmentCriteria)); }

        // =========================
        // Allocation Rule Functions
        // =========================
        window.renderAllocationRuleList = function (filter = '') {
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
                    <tr><td colspan="4" class="py-3 px-6 text-center">No allocation rules found.</td></tr>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationRule('${ar.id}')" title="Delete">
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

        window.filterAllocationRuleList = function (value) {
            renderAllocationRuleList(value);
        };

        window.showAllocationRuleForm = function (mode, id = null) {
            const modal = document.getElementById('allocation-rule-form-modal');
            const form = document.getElementById('allocation-rule-form');
            const title = document.getElementById('allocation-rule-form-title');
            const submitButton = document.getElementById('allocation-rule-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Tab default
            window.setupTabSwitching('allocation-rule-form-modal');

            // Reset readonly/disabled visual
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
                for (let i = 1; i <= 8; i++) { const el = document.getElementById(`ar-udf${i}`); if (el) el.value = ''; }
            } else {
                title.textContent = 'Edit Allocation Rule';
                submitButton.textContent = 'Update';
                const rule = allocationRules.find(ar => ar.id === id);
                if (rule) {
                    document.getElementById('allocation-rule-name').value = rule.ruleName;
                    document.getElementById('allocation-rule-description').value = rule.description;
                    document.getElementById('allocation-rule-inactive').checked = rule.inactive;

                    detailRecordsContainer.classList.remove('bg-wise-light-gray', 'cursor-not-allowed');
                    detailRecordsPlaceholder.classList.add('hidden');
                    addDetailRecordBtn.removeAttribute('disabled');
                    renderAllocationDetailRecords(rule.detailRecords);

                    for (let i = 1; i <= 8; i++) {
                        const el = document.getElementById(`ar-udf${i}`);
                        if (el) el.value = rule[`udf${i}`] || '';
                    }
                }
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAllocationRuleForm = function () {
            const modal = document.getElementById('allocation-rule-form-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        window.handleAllocationRuleSubmit = async function (event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const detailRecords = Array.from(document.querySelectorAll('#allocation-detail-records-list .allocation-detail-record-item')).map(item => ({
                sequence: parseInt(item.querySelector('[name="allocation-detail-sequence"]').value, 10),
                allocationStrategy: item.querySelector('[name="allocation-detail-strategy"]').value,
                allocationType: item.querySelector('[name="allocation-detail-type"]').value,
                zone: item.querySelector('[name="allocation-detail-zone"]').value,
                inactive: item.querySelector('[name="allocation-detail-inactive"]').checked,
            }));

            const newRule = {
                ruleName: form['ruleName'].value,
                description: form['description'].value,
                inactive: form['allocation-rule-inactive'].checked,
                detailRecords: detailRecords,
            };
            for (let i = 1; i <= 8; i++) { newRule[`udf${i}`] = form[`udf${i}`]?.value || ''; }

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

        window.deleteAllocationRule = async function (id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation rule?');
            if (confirmed) {
                allocationRules = allocationRules.filter(ar => ar.id !== id);
                saveAllocationRules();
                renderAllocationRuleList();
                await window.showCustomAlert('Deleted', 'Allocation Rule deleted successfully!');
            }
        };

        window.checkAllocationRuleFormValidity = function () {
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
                const list = document.getElementById('allocation-detail-records-list');
                if (list) list.innerHTML = '';
            }
        };

        window.addAllocationDetailRecord = function (record = {}) {
            const detailRecordsList = document.getElementById('allocation-detail-records-list');
            const newIndex = detailRecordsList.children.length;

            const div = document.createElement('div');
            div.className = 'allocation-detail-record-item p-3 border border-wise-border rounded-md bg-white relative';
            div.innerHTML = `
                <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="removeAllocationDetailRecord(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label for="allocation-detail-sequence-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Sequence:</label>
                        <input type="number" id="allocation-detail-sequence-${newIndex}" name="allocation-detail-sequence" value="${record.sequence || (newIndex + 1) * 10}" required
                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                    </div>
                    <div>
                        <label for="allocation-detail-strategy-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Allocation Strategy:</label>
                        <select id="allocation-detail-strategy-${newIndex}" name="allocation-detail-strategy"
                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${window.locatingStrategies.map(as => `<option value="${as.identifier}" ${record.allocationStrategy === as.identifier ? 'selected' : ''}>${as.identifier} - ${as.description}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="allocation-detail-type-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Allocation Type:</label>
                        <select id="allocation-detail-type-${newIndex}" name="allocation-detail-type"
                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${allocationTypes.map(at => `<option value="${at.name}" ${record.allocationType === at.name ? 'selected' : ''}>${at.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="allocation-detail-zone-${newIndex}" class="block text-sm font-medium text-wise-dark-gray">Zone:</label>
                        <select id="allocation-detail-zone-${newIndex}" name="allocation-detail-zone"
                            class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                            <option value="">--Select--</option>
                            ${window.zones.map(z => `<option value="${z.identifier}" ${record.zone === z.identifier ? 'selected' : ''}>${z.identifier}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-span-full">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="allocation-detail-inactive-${newIndex}" name="allocation-detail-inactive"
                                class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" ${record.inactive ? 'checked' : ''}>
                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                        </label>
                    </div>
                </div>
            `;
            detailRecordsList.appendChild(div);
        };

        window.renderAllocationDetailRecords = function (records) {
            const list = document.getElementById('allocation-detail-records-list');
            list.innerHTML = '';
            records.sort((a, b) => a.sequence - b.sequence);
            records.forEach(record => addAllocationDetailRecord(record));
        };

        window.removeAllocationDetailRecord = function (button) {
            const recordItem = button.closest('.allocation-detail-record-item');
            if (recordItem) recordItem.remove();
        };

        // =============================
        // Allocation Strategy Functions
        // =============================
        window.renderAllocationStrategyList = function (filter = '') {
            const container = document.getElementById('allocation-strategy-list-container');
            if (!container) return;

            const filteredStrategies = allocationStrategies.filter(as =>
                as.identifier.toLowerCase().includes(filter.toLowerCase()) ||
                as.description.toLowerCase().includes(filter.toLowerCase()) ||
                (as.systemValueI || '').toString().toLowerCase().includes(filter.toLowerCase())
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
                tableHtml += `<tr><td colspan="6" class="py-3 px-6 text-center">No allocation strategies found.</td></tr>`;
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationStrategy('${as.id}')" title="Delete">
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

        window.filterAllocationStrategyList = function (value) {
            renderAllocationStrategyList(value);
        };

        window.showAllocationStrategyForm = function (mode, id = null) {
            const modal = document.getElementById('allocation-strategy-form-modal');
            const form = document.getElementById('allocation-strategy-form');
            const title = document.getElementById('allocation-strategy-form-title');
            const submitButton = document.getElementById('allocation-strategy-submit-button');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                input.removeAttribute('readonly');
            });

            if (mode === 'create') {
                title.textContent = 'Create New Allocation Strategy';
                submitButton.textContent = 'Save';
                const rt = document.getElementById('allocation-strategy-record-type');
                rt.value = 'ALLOCSTRAT';
                rt.setAttribute('readonly', true);
                rt.classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                const sc = document.getElementById('allocation-strategy-system-created');
                sc.checked = false;
                // sc.setAttribute('disabled', true);
            } else {
                title.textContent = 'Edit Allocation Strategy';
                submitButton.textContent = 'Update';
                const strategy = allocationStrategies.find(as => as.id === id);
                if (strategy) {
                    document.getElementById('allocation-strategy-identifier').value = strategy.identifier;
                    document.getElementById('allocation-strategy-record-type').value = strategy.recordType;
                    document.getElementById('allocation-strategy-description').value = strategy.description;
                    document.getElementById('allocation-strategy-system-value').value = strategy.systemValueI || '';
                    document.getElementById('allocation-strategy-inactive').checked = strategy.inactive;
                    document.getElementById('allocation-strategy-system-created').checked = strategy.systemCreated;

                    if (strategy.systemCreated) {
                        const idf = document.getElementById('allocation-strategy-identifier');
                        idf.setAttribute('readonly', true);
                        idf.classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');

                        const rt = document.getElementById('allocation-strategy-record-type');
                        rt.setAttribute('readonly', true);
                        rt.classList.add('bg-gray-100', 'text-wise-gray', 'cursor-not-allowed');
                    }
                    document.getElementById('allocation-strategy-system-created').removeAttribute('disabled');
                }
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAllocationStrategyForm = function () {
            const modal = document.getElementById('allocation-strategy-form-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        window.handleAllocationStrategySubmit = async function (event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            const newStrategy = {
                identifier: form['identifier'].value,
                recordType: form['recordType'].value,
                description: form['description'].value,
                systemValueI: form['systemValueI'].value,
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

        window.deleteAllocationStrategy = async function (id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation strategy?');
            if (confirmed) {
                allocationStrategies = allocationStrategies.filter(as => as.id !== id);
                saveAllocationStrategies();
                renderAllocationStrategyList();
                await window.showCustomAlert('Deleted', 'Allocation Strategy deleted successfully!');
            }
        };

        // ==================================
        // Allocation Rule Assignment Functions
        // ==================================
        window.renderAllocationRuleAssignmentList = function (filter = '') {
            const container = document.getElementById('allocation-rule-assignment-list-container');
            if (!container) return;

            const filteredAssignments = allocationRuleAssignments.filter(ara =>
                ara.criteria.toLowerCase().includes(filter.toLowerCase()) ||
                ara.allocationRule.toLowerCase().includes(filter.toLowerCase()) ||
                ara.priority.toString().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Priority</th>
                            <th class="py-3 px-6 text-left">Criteria</th>
                            <th class="py-3 px-6 text-left">Allocation Rule</th>
                            <th class="py-3 px-6 text-left">Active</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredAssignments.length === 0) {
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No allocation rule assignments found.</td></tr>`;
            } else {
                filteredAssignments.forEach(ara => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left">${ara.priority}</td>
                            <td class="py-3 px-6 text-left">${ara.criteria}</td>
                            <td class="py-3 px-6 text-left">${ara.allocationRule}</td>
                            <td class="py-3 px-6 text-left">${ara.active ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAllocationRuleAssignmentForm('edit', '${ara.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationRuleAssignment('${ara.id}')" title="Delete">
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

        window.filterAllocationRuleAssignmentList = function (value) {
            renderAllocationRuleAssignmentList(value);
        };

        window.showAllocationRuleAssignmentForm = function (mode, id = null) {
            const modal = document.getElementById('allocation-rule-assignment-form-modal');
            const form = document.getElementById('allocation-rule-assignment-form');
            const title = document.getElementById('allocation-rule-assignment-form-title');
            const submitButton = document.getElementById('allocation-rule-assignment-submit-button');
            const lastUpdatedInfo = document.getElementById('ara-last-updated-info');


            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            window.setupTabSwitching('allocation-rule-assignment-form-modal');

            // Populate criteria dropdown
            const criteriaSelect = document.getElementById('ara-criteria');
            criteriaSelect.innerHTML = '<option value="">Select Criteria...</option>' +
                allocationAssignmentCriteria.map(c => `<option value="${c.identifier}">${c.identifier}</option>`).join('');

            // Populate allocation rule dropdown
            const allocationRuleSelect = document.getElementById('ara-allocation-rule');
            allocationRuleSelect.innerHTML = '<option value="">Select Allocation Rule...</option>' +
                allocationRules.map(ar => `<option value="${ar.ruleName}">${ar.ruleName}</option>`).join('');


            if (mode === 'create') {
                title.textContent = 'Create New Allocation Rule Assignment';
                submitButton.textContent = 'Save';
                document.getElementById('ara-active').checked = true; // Default active on create
                for (let i = 1; i <= 8; i++) { const el = document.getElementById(`ara-udf${i}`); if (el) el.value = ''; }
                lastUpdatedInfo.textContent = ''; // Clear last updated info for new entry
            } else {
                title.textContent = 'Edit Allocation Rule Assignment';
                submitButton.textContent = 'Update';
                const assignment = allocationRuleAssignments.find(ara => ara.id === id);
                if (assignment) {
                    document.getElementById('ara-priority').value = assignment.priority;
                    document.getElementById('ara-criteria').value = assignment.criteria;
                    document.getElementById('ara-allocation-rule').value = assignment.allocationRule;
                    document.getElementById('ara-always-override').checked = assignment.alwaysOverride;
                    document.getElementById('ara-active').checked = assignment.active;

                    for (let i = 1; i <= 8; i++) {
                        const el = document.getElementById(`ara-udf${i}`);
                        if (el) el.value = assignment[`udf${i}`] || '';
                    }
                    // Set last updated info
                    lastUpdatedInfo.textContent = `Last updated ${assignment.lastUpdated} — ${assignment.updatedBy}`;
                }
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeAllocationRuleAssignmentForm = function () {
            const modal = document.getElementById('allocation-rule-assignment-form-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        window.handleAllocationRuleAssignmentSubmit = async function (event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            // Get current date and time for lastUpdated
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const lastUpdatedString = `${day}/${month} ${hours}:${minutes} AM`; // Assuming AM for simplicity, adjust if needed

            const newAssignment = {
                priority: parseInt(form['priority'].value, 10),
                criteria: form['criteria'].value,
                allocationRule: form['allocationRule'].value,
                alwaysOverride: form['alwaysOverride'].checked,
                active: form['active'].checked,
                lastUpdated: lastUpdatedString, // Add last updated timestamp
                updatedBy: 'Candra', // Hardcoded for now, can be dynamic later
            };
            for (let i = 1; i <= 8; i++) { newAssignment[`udf${i}`] = form[`udf${i}`]?.value || ''; }


            if (mode === 'create') {
                newAssignment.id = 'ARA' + String(allocationRuleAssignments.length + 1).padStart(3, '0');
                allocationRuleAssignments.push(newAssignment);
                await window.showCustomAlert('Success', 'Allocation Rule Assignment created successfully!');
            } else {
                const index = allocationRuleAssignments.findIndex(ara => ara.id === id);
                if (index !== -1) {
                    allocationRuleAssignments[index] = { ...allocationRuleAssignments[index], ...newAssignment };
                    await window.showCustomAlert('Success', 'Allocation Rule Assignment updated successfully!');
                }
            }
            saveAllocationRuleAssignments();
            closeAllocationRuleAssignmentForm();
            renderAllocationRuleAssignmentList();
        };

        window.deleteAllocationRuleAssignment = async function (id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation rule assignment?');
            if (confirmed) {
                allocationRuleAssignments = allocationRuleAssignments.filter(ara => ara.id !== id);
                saveAllocationRuleAssignments();
                renderAllocationRuleAssignmentList();
                await window.showCustomAlert('Deleted', 'Allocation Rule Assignment deleted successfully!');
            }
        };

        // Custom toggle switch styling and behavior
        window.toggleSwitch = function(checkbox) {
            const toggleContainer = checkbox.closest('.flex.items-center');
            const block = toggleContainer.querySelector('.block');
            const dot = toggleContainer.querySelector('.dot');

            if (checkbox.checked) {
                block.classList.remove('bg-gray-300');
                block.classList.add('bg-wise-primary');
                dot.classList.add('translate-x-full');
            } else {
                block.classList.remove('bg-wise-primary');
                block.classList.add('bg-gray-300');
                dot.classList.remove('translate-x-full');
            }
        };

        // ==================================
        // Allocation Location Selection Functions
        // ==================================
        let currentFilterRules = [];
        let currentOrderByRules = [];
        let selectedFilterRuleIndex = -1;
        let selectedOrderByRuleIndex = -1;

        window.renderAllocationLocationSelectionList = function (filter = '') {
            const container = document.getElementById('allocation-location-selection-list-container');
            if (!container) return;

            const filteredSelections = allocationLocationSelections.filter(als =>
                als.filterName.toLowerCase().includes(filter.toLowerCase()) ||
                als.description.toLowerCase().includes(filter.toLowerCase()) ||
                als.tableName.toLowerCase().includes(filter.toLowerCase())
            );

            let tableHtml = `
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-wise-light-gray text-wise-dark-gray uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">Filter Name</th>
                            <th class="py-3 px-6 text-left">Description</th>
                            <th class="py-3 px-6 text-left">Table Name</th>
                            <th class="py-3 px-6 text-left">Inactive</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-wise-gray text-sm font-light">
            `;

            if (filteredSelections.length === 0) {
                tableHtml += `<tr><td colspan="5" class="py-3 px-6 text-center">No allocation location selections found.</td></tr>`;
            } else {
                filteredSelections.forEach(als => {
                    tableHtml += `
                        <tr class="border-b border-wise-border hover:bg-wise-light-gray">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${als.filterName}</td>
                            <td class="py-3 px-6 text-left">${als.description}</td>
                            <td class="py-3 px-6 text-left">${als.tableName}</td>
                            <td class="py-3 px-6 text-left">${als.inactive ? 'Yes' : 'No'}</td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button class="w-6 mr-2 transform hover:text-wise-primary hover:scale-110" onclick="showAllocationLocationSelectionForm('edit', '${als.id}')" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button class="w-6 mr-2 transform hover:text-red-500 hover:scale-110" onclick="deleteAllocationLocationSelection('${als.id}')" title="Delete">
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

        window.filterAllocationLocationSelectionList = function (value) {
            renderAllocationLocationSelectionList(value);
        };

        // Function to open the modal
        function openAlsModal() {
            const m = document.getElementById('alsModal');
            document.body.classList.add('modal-open');
            m.classList.remove('hidden');
            m.scrollTop = 0;                              // mulai dari atas overlay
            m.querySelector('input,select,textarea')?.focus();
        }

        // Function to close the modal
        function closeAlsModal() {
            const m = document.getElementById('alsModal');
            m.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }

        // Add event listener for resize globally (no scaling needed for this approach)
        // window.addEventListener('resize', fitAlsModal); // Removed as scaling is no longer used


        window.showAllocationLocationSelectionForm = function (mode, id = null) {
            const form = document.getElementById('allocation-location-selection-form');
            const title = document.getElementById('allocation-location-selection-form-title');
            const submitButton = document.getElementById('allocation-location-selection-submit-button');
            const lastUpdatedInfo = document.getElementById('als-last-updated-info');

            form.reset();
            form.dataset.mode = mode;
            form.dataset.id = id;

            // Use the correct ID for tab switching, which is the content container inside alsModal
            window.setupTabSwitching('alsModal'); 

            // Reset current filter and order rules
            currentFilterRules = [];
            currentOrderByRules = [];
            selectedFilterRuleIndex = -1;
            selectedOrderByRuleIndex = -1;

            if (mode === 'create') {
                title.textContent = 'Create New Allocation Location Selection';
                submitButton.textContent = 'Save';
                document.getElementById('als-recType').value = 'ALLOC SEL';
                document.getElementById('als-inactive').checked = false;
                document.getElementById('als-systemCreated').checked = false;
                for (let i = 1; i <= 8; i++) { const el = document.getElementById(`als-udf${i}`); if (el) el.value = '0.00000'; } // Default UDFs
                lastUpdatedInfo.textContent = ''; // Clear last updated info for new entry
            } else {
                title.textContent = 'Edit Allocation Location Selection';
                submitButton.textContent = 'Update';
                const selection = allocationLocationSelections.find(als => als.id === id);
                if (selection) {
                    document.getElementById('als-recType').value = selection.recordType;
                    document.getElementById('als-filterName').value = selection.filterName;
                    document.getElementById('als-description').value = selection.description;
                    document.getElementById('als-tableName').value = selection.tableName;
                    document.getElementById('als-inactive').checked = selection.inactive;
                    document.getElementById('als-systemCreated').checked = selection.systemCreated;
                    for (let i = 1; i <= 8; i++) {
                        const el = document.getElementById(`als-udf${i}`);
                        if (el) el.value = selection[`udf${i}`] || '0.00000';
                    }
                    currentFilterRules = JSON.parse(JSON.stringify(selection.filterRules || [])); // Deep copy
                    currentOrderByRules = JSON.parse(JSON.stringify(selection.orderBy || [])); // Deep copy

                    // Set last updated info
                    lastUpdatedInfo.textContent = `Last updated ${selection.lastUpdated} — User: ${selection.updatedBy}`;
                }
            }

            // Attach event listeners for filter/order by controls only once
            if (!alsFormListenersAttached) {
                document.getElementById('als-btnClearInputs').addEventListener('click', () => {
                    document.getElementById('als-attr').selectedIndex = 0;
                    document.getElementById('als-op').selectedIndex = 0;
                    document.getElementById('als-val').value = '';
                    document.getElementById('als-logic-and').checked = true;
                    selectedFilterRuleIndex = -1; // Clear selection on clear inputs
                    renderFilterRules();
                });
                document.getElementById('als-btnAddRule').addEventListener('click', () => {
                    const logic = document.querySelector('#als-filter-data input[name="logic"]:checked').value; // Scope to current tab
                    const attribute = document.getElementById('als-attr').value;
                    const op = document.getElementById('als-op').value;
                    const val = document.getElementById('als-val').value.trim();
                    if (needsValue(op) && !val) { window.showCustomAlert('Error', 'Please input value for the selected operand.'); return; }

                    const newRule = { type: 'rule', logic, attribute, op, value: needsValue(op) ? val : '' };

                    if (selectedFilterRuleIndex !== -1 && selectedFilterRuleIndex < currentFilterRules.length) {
                        currentFilterRules.splice(selectedFilterRuleIndex + 1, 0, newRule);
                        selectedFilterRuleIndex++;
                    } else {
                        currentFilterRules.push(newRule);
                        selectedFilterRuleIndex = currentFilterRules.length - 1;
                    }
                    renderFilterRules();
                });
                document.getElementById('als-btnUpdateSelectedRule').addEventListener('click', () => {
                    if (selectedFilterRuleIndex < 0 || currentFilterRules[selectedFilterRuleIndex]?.type !== 'rule') { window.showCustomAlert('Error', 'Select a rule row first to update.'); return; }
                    const logic = document.querySelector('#als-filter-data input[name="logic"]:checked').value; // Scope to current tab
                    const attribute = document.getElementById('als-attr').value;
                    const op = document.getElementById('als-op').value;
                    const val = document.getElementById('als-val').value.trim();
                    if (needsValue(op) && !val) { window.showCustomAlert('Error', 'Please input value for the selected operand.'); return; }
                    currentFilterRules[selectedFilterRuleIndex] = { type: 'rule', logic, attribute, op, value: needsValue(op) ? val : '' };
                    renderFilterRules();
                });
                document.getElementById('als-btnDeleteSelectedRule').addEventListener('click', () => {
                    if (selectedFilterRuleIndex < 0) { window.showCustomAlert('Error', 'Select a row first to delete.'); return; }
                    currentFilterRules.splice(selectedFilterRuleIndex, 1);
                    if (selectedFilterRuleIndex >= currentFilterRules.length) selectedFilterRuleIndex = currentFilterRules.length - 1;
                    renderFilterRules();
                });
                document.getElementById('als-btnDeleteLastRule').addEventListener('click', () => {
                    if (currentFilterRules.length === 0) { window.showCustomAlert('Error', 'No rules to delete!'); return; }
                    currentFilterRules.pop();
                    selectedFilterRuleIndex = currentFilterRules.length - 1;
                    renderFilterRules();
                });
                document.getElementById('als-btnLParen').addEventListener('click', () => {
                    const newParen = { type: 'lparen' };
                    if (selectedFilterRuleIndex !== -1 && selectedFilterRuleIndex < currentFilterRules.length) {
                        currentFilterRules.splice(selectedFilterRuleIndex + 1, 0, newParen);
                        selectedFilterRuleIndex++;
                    } else {
                        currentFilterRules.push(newParen);
                        selectedFilterRuleIndex = currentFilterRules.length - 1;
                    }
                    renderFilterRules();
                });
                document.getElementById('als-btnRParen').addEventListener('click', () => {
                    const newParen = { type: 'rparen' };
                    if (selectedFilterRuleIndex !== -1 && selectedFilterRuleIndex < currentFilterRules.length) {
                        currentFilterRules.splice(selectedFilterRuleIndex + 1, 0, newParen);
                        selectedFilterRuleIndex++;
                    } else {
                        currentFilterRules.push(newParen);
                        selectedFilterRuleIndex = currentFilterRules.length - 1;
                    }
                    renderFilterRules();
                });
                document.getElementById('als-btnDelParen').addEventListener('click', () => {
                    let deleted = false;
                    for (let i = currentFilterRules.length - 1; i >= 0; i--) {
                        if (currentFilterRules[i].type === 'lparen' || currentFilterRules[i].type === 'rparen') {
                            currentFilterRules.splice(i, 1);
                            deleted = true;
                            break;
                        }
                    }
                    if (!deleted) { window.showCustomAlert('Error', 'No parenthesis to delete!'); }
                    selectedFilterRuleIndex = currentFilterRules.length - 1; renderFilterRules();
                });
                document.getElementById('als-btnUpRule').addEventListener('click', () => {
                    if (selectedFilterRuleIndex <= 0) return;
                    [currentFilterRules[selectedFilterRuleIndex - 1], currentFilterRules[selectedFilterRuleIndex]] = [currentFilterRules[selectedFilterRuleIndex], currentFilterRules[selectedFilterRuleIndex - 1]];
                    selectedFilterRuleIndex--; 
                    renderFilterRules();
                });
                document.getElementById('als-btnDownRule').addEventListener('click', () => {
                    if (selectedFilterRuleIndex < 0 || selectedFilterRuleIndex >= currentFilterRules.length - 1) return;
                    [currentFilterRules[selectedFilterRuleIndex + 1], currentFilterRules[selectedFilterRuleIndex]] = [currentFilterRules[selectedFilterRuleIndex], currentFilterRules[selectedFilterRuleIndex + 1]];
                    selectedFilterRuleIndex++; 
                    renderFilterRules();
                });

                // Order By buttons
                document.getElementById('als-btnAddSortCriteria').addEventListener('click', () => {
                    const attribute = document.getElementById('als-obAttribute').value;
                    const direction = document.querySelector('#als-order-by input[name="order-direction"]:checked').value; // Scope to current tab
                    if (!attribute) { window.showCustomAlert('Error', 'Please select an attribute!'); return; }

                    const newSortItem = { attribute, direction };

                    if (selectedOrderByRuleIndex !== -1 && selectedOrderByRuleIndex < currentOrderByRules.length) {
                        currentOrderByRules.splice(selectedOrderByRuleIndex + 1, 0, newSortItem);
                        selectedOrderByRuleIndex++;
                    } else {
                        currentOrderByRules.push(newSortItem);
                        selectedOrderByRuleIndex = currentOrderByRules.length - 1;
                    }
                    renderOrderByRules();
                });
                document.getElementById('als-btnDeleteSelectedSortItem').addEventListener('click', () => {
                    if (selectedOrderByRuleIndex < 0 || selectedOrderByRuleIndex >= currentOrderByRules.length) { window.showCustomAlert('Error', 'Select a sort item first!'); return; }
                    currentOrderByRules.splice(selectedOrderByRuleIndex, 1);
                    if (selectedOrderByRuleIndex >= currentOrderByRules.length) selectedOrderByRuleIndex = currentOrderByRules.length - 1;
                    renderOrderByRules();
                });
                document.getElementById('als-btnDeleteLastSortItem').addEventListener('click', () => {
                    if (currentOrderByRules.length === 0) { window.showCustomAlert('Error', 'No sort items to delete!'); return; }
                    currentOrderByRules.pop();
                    selectedOrderByRuleIndex = currentOrderByRules.length - 1;
                    renderOrderByRules();
                });
                document.getElementById('als-btnUpOrder').addEventListener('click', () => {
                    if (selectedOrderByRuleIndex <= 0) return;
                    [currentOrderByRules[selectedOrderByRuleIndex - 1], currentOrderByRules[selectedOrderByRuleIndex]] = [currentOrderByRules[selectedOrderByRuleIndex], currentOrderByRules[selectedOrderByRuleIndex - 1]];
                    selectedOrderByRuleIndex--;
                    renderOrderByRules();
                });
                document.getElementById('als-btnDownOrder').addEventListener('click', () => {
                    if (selectedOrderByRuleIndex < 0 || selectedOrderByRuleIndex >= currentOrderByRules.length - 1) return;
                    [currentOrderByRules[selectedOrderByRuleIndex + 1], currentOrderByRules[selectedOrderByRuleIndex]] = [currentOrderByRules[selectedOrderByRuleIndex], currentOrderByRules[selectedOrderByRuleIndex + 1]];
                    selectedOrderByRuleIndex++;
                    renderOrderByRules();
                });

                // Add change listener for tableName to re-render rules
                document.getElementById('als-tableName').addEventListener('change', () => {
                    renderFilterRules();
                    renderOrderByRules();
                });

                alsFormListenersAttached = true;
            }

            openAlsModal(); // Use the new open modal function
            renderFilterRules(); // Initial render when form is shown
            renderOrderByRules(); // Initial render when form is shown
        };

        window.closeAllocationLocationSelectionForm = function () {
            closeAlsModal(); // Use the new close modal function
        };

        window.handleAllocationLocationSelectionSubmit = async function (event) {
            event.preventDefault();
            const form = event.target;
            const mode = form.dataset.mode;
            const id = form.dataset.id;

            // Get current date and time for lastUpdated
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = String(now.getFullYear()).slice(2); // Get last two digits of year
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const lastUpdatedString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} PM`; // Example: 02-08-17 14:09:32 PM

            const newSelection = {
                recordType: form['recordType'].value,
                filterName: form['filterName'].value,
                description: form['description'].value,
                tableName: form['tableName'].value,
                inactive: form['inactive'].checked,
                systemCreated: form['systemCreated'].checked,
                filterRules: currentFilterRules,
                orderBy: currentOrderByRules,
                lastUpdated: lastUpdatedString,
                updatedBy: 'chandra', // Hardcoded for now
            };
            for (let i = 1; i <= 8; i++) { newSelection[`udf${i}`] = form[`udf${i}`]?.value || '0.00000'; }

            if (mode === 'create') {
                newSelection.id = 'ALS' + String(allocationLocationSelections.length + 1).padStart(3, '0');
                allocationLocationSelections.push(newSelection);
                await window.showCustomAlert('Success', 'Allocation Location Selection created successfully!');
            } else {
                const index = allocationLocationSelections.findIndex(als => als.id === id);
                if (index !== -1) {
                    allocationLocationSelections[index] = { ...allocationLocationSelections[index], ...newSelection };
                    await window.showCustomAlert('Success', 'Allocation Location Selection updated successfully!');
                }
            }
            saveAllocationLocationSelections();
            closeAllocationLocationSelectionForm();
            renderAllocationLocationSelectionList();
        };

        window.deleteAllocationLocationSelection = async function (id) {
            const confirmed = await window.showCustomConfirm('Confirm Delete', 'Are you sure you want to delete this allocation location selection?');
            if (confirmed) {
                allocationLocationSelections = allocationLocationSelections.filter(als => als.id !== id);
                saveAllocationLocationSelections();
                renderAllocationLocationSelectionList();
                await window.showCustomAlert('Deleted', 'Allocation Location Selection deleted successfully!');
            }
        };

        // Helper for filter and order by rules
        const needsValue = (op) => !(op === 'is null' || op === 'is not null');

        function getTablePrefix(tableName) {
            if (tableName === 'Location inventory') return 'LOCATION_INVENTORY';
            if (tableName === 'Location inventory attributes') return 'LOCATION_INVENTORY_ATTRIBUTES';
            return 'LOCATION';
        }

        function normalizeField(attribute, tableName) {
            const p = getTablePrefix(tableName);
            if (attribute === 'LOC_INV_ATTRIBUTE4') return `${p}.LOC_INV_ATTRIBUTE4`;
            if (attribute === 'Inventory status') return `${p}.INVENTORY_STS`;
            if (attribute === 'Warehouse') return `${p}.WAREHOUSE`; // Assuming 'warehouse' field in LOCATION table
            if (attribute === 'Active') return `LOCATION.ACTIVE`; // Assuming 'active' field in LOCATION table
            // Add more specific mappings if needed
            return `${p}.${attribute.replaceAll(' ', '_').toUpperCase()}`;
        }

        // Filter Rules Functions
        window.renderFilterRules = function () {
            const ruleList = document.getElementById('als-ruleList');
            if (!ruleList) return;

            ruleList.innerHTML = '';
            if (currentFilterRules.length === 0) {
                const div = document.createElement('div');
                div.className = 'p-3 text-sm text-wise-gray';
                div.textContent = 'No filter rules added.';
                ruleList.appendChild(div);
                return;
            }

            const tableName = document.getElementById('als-tableName').value;

            currentFilterRules.forEach((r, i) => {
                const el = document.createElement('div');
                el.className = 'list-row';
                let text = '';
                if (r.type === 'lparen') {
                    const logic = (i > 0) ? 'AND ' : ''; 
                    text = logic + '(';
                } else if (r.type === 'rparen') {
                    text = ')';
                } else {
                    const lg = (i === 0 || currentFilterRules[i-1]?.type === 'lparen' ? '' : r.logic + ' ');
                    const v = needsValue(r.op) ? (' ' + (r.value || '')) : '';
                    text = `${lg}${normalizeField(r.attribute, tableName)} ${r.op}${v}`;
                }
                el.textContent = text
                if (i === selectedFilterRuleIndex) el.classList.add('selected');
                el.addEventListener('click', () => {
                    selectedFilterRuleIndex = i;
                    const row = currentFilterRules[i];
                    if (row.type === 'rule') {
                        document.getElementById('als-attr').value = row.attribute;
                        document.getElementById('als-op').value = row.op;
                        document.getElementById('als-val').value = row.value || '';
                        (document.getElementById('als-logic-and').value === row.logic ? document.getElementById('als-logic-and') : document.getElementById('als-logic-or')).checked = true; // Corrected selector
                    } else {
                        // If a parenthesis is selected, clear the input fields
                        document.getElementById('als-attr').selectedIndex = 0;
                        document.getElementById('als-op').selectedIndex = 0;
                        document.getElementById('als-val').value = '';
                        document.getElementById('als-logic-and').checked = true; // Default to AND
                    }
                    renderFilterRules();
                });
                ruleList.appendChild(el);
            });
        };


        // Order By Rules Functions
        window.renderOrderByRules = function () {
            const orderList = document.getElementById('als-orderList');
            if (!orderList) return;

            orderList.innerHTML = '';
            if (!currentOrderByRules.length) {
                const div = document.createElement('div');
                div.className = 'p-3 text-sm text-wise-gray';
                div.textContent = 'No sort added.';
                orderList.appendChild(div);
                return;
            }

            const tableName = document.getElementById('als-tableName').value;

            currentOrderByRules.forEach((o, idx) => {
                const div = document.createElement('div');
                div.className = 'list-row flex items-center justify-between p-2';
                div.innerHTML = `<span>${normalizeField(o.attribute, tableName)} <span class="text-wise-gray">(${o.direction})</span></span>`;

                if (idx === selectedOrderByRuleIndex) div.classList.add('selected');

                div.addEventListener('click', () => {
                    selectedOrderByRuleIndex = idx;
                    document.getElementById('als-obAttribute').value = o.attribute;
                    document.getElementById('als-order-asc').checked = (o.direction === 'Ascending');
                    document.getElementById('als-order-desc').checked = (o.direction === 'Descending');
                    renderOrderByRules();
                });
                orderList.appendChild(div);
            });
        };


        // =========================
        // Auto-render on mount
        // =========================
        (function autoRender() {
            const obs = new MutationObserver(() => {
                const c1 = document.getElementById('allocation-rule-list-container');
                if (c1) renderAllocationRuleList();
                const c2 = document.getElementById('allocation-strategy-list-container');
                if (c2) renderAllocationStrategyList();
                const c3 = document.getElementById('allocation-rule-assignment-list-container');
                if (c3) renderAllocationRuleAssignmentList();
                const c4 = document.getElementById('allocation-location-selection-list-container'); // New auto-render
                if (c4) renderAllocationLocationSelectionList();
                if (c1 || c2 || c3 || c4) obs.disconnect();
            });
            obs.observe(document.body, { childList: true, subtree: true });
        })();

        // Bridge ke halaman configurasi
        window.selectCategory('configuration');
        console.log('Configuration V2 loaded successfully');
    });
})();

