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
                                            <input type="checkbox" id="allocation-strategy-system-created" name="systemCreated" disabled
                                                class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary cursor-not-allowed">
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
                                                <input type="password" id="up-rf-password" name="rfPassword" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div class="flex items-center mt-6">
                                                <input type="checkbox" id="up-hide-rf-password" name="hideRfPassword" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                                <span class="ml-2 text-sm text-wise-dark-gray">Hide RF password</span>
                                            </div>
                                            <div>
                                                <label for="up-uncollected-password" class="block text-sm font-medium text-wise-dark-gray">Uncollected password:</label>
                                                <input type="password" id="up-uncollected-password" name="uncollectedPassword" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div class="flex items-center mt-6">
                                                <input type="checkbox" id="up-hide-uncollected-password" name="hideUncollectedPassword" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
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
                                    <div id="up-preferences" class="tab-content hidden">
                                        <h4 class="font-semibold text-wise-dark-gray mb-2">Preferences</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-default-processing-profile" class="block text-sm font-medium text-wise-dark-gray">Default processing profile:</label>
                                                <input type="text" id="up-default-processing-profile" name="defaultProcessingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-packing-profile" class="block text-sm font-medium text-wise-dark-gray">Default packing profile:</label>
                                                <input type="text" id="up-default-packing-profile" name="defaultPackingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-shipping-profile" class="block text-sm font-medium text-wise-dark-gray">Default shipping profile:</label>
                                                <input type="text" id="up-default-shipping-profile" name="defaultShippingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-receiving-profile" class="block text-sm font-medium text-wise-dark-gray">Default receiving profile:</label>
                                                <input type="text" id="up-default-receiving-profile" name="defaultReceivingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-putaway-profile" class="block text-sm font-medium text-wise-dark-gray">Default putaway profile:</label>
                                                <input type="text" id="up-default-putaway-profile" name="defaultPutawayProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-picking-profile" class="block text-sm font-medium text-wise-dark-gray">Default picking profile:</label>
                                                <input type="text" id="up-default-picking-profile" name="defaultPickingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-cycle-count-profile" class="block text-sm font-medium text-wise-dark-gray">Default cycle count profile:</label>
                                                <input type="text" id="up-default-cycle-count-profile" name="defaultCycleCountProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-label-profile" class="block text-sm font-medium text-wise-dark-gray">Default label profile:</label>
                                                <input type="text" id="up-default-label-profile" name="defaultLabelProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-report-profile" class="block text-sm font-medium text-wise-dark-gray">Default report profile:</label>
                                                <input type="text" id="up-default-report-profile" name="defaultReportProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-inventory-adjustment-profile" class="block text-sm font-medium text-wise-dark-gray">Default inventory adjustment profile:</label>
                                                <input type="text" id="up-default-inventory-adjustment-profile" name="defaultInventoryAdjustmentProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-inventory-transfer-profile" class="block text-sm font-medium text-wise-dark-gray">Default inventory transfer profile:</label>
                                                <input type="text" id="up-default-inventory-transfer-profile" name="defaultInventoryTransferProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-inventory-move-profile" class="block text-sm font-medium text-wise-dark-gray">Default inventory move profile:</label>
                                                <input type="text" id="up-default-inventory-move-profile" name="defaultInventoryMoveProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-kit-production-profile" class="block text-sm font-medium text-wise-dark-gray">Default kit production profile:</label>
                                                <input type="text" id="up-default-kit-production-profile" name="defaultKitProductionProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-kitting-profile" class="block text-sm font-medium text-wise-dark-gray">Default kitting profile:</label>
                                                <input type="text" id="up-default-kitting-profile" name="defaultKittingProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-value-added-service-profile" class="block text-sm font-medium text-wise-dark-gray">Default value added service profile:</label>
                                                <input type="text" id="up-default-value-added-service-profile" name="defaultValueAddedServiceProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-shipping-manifest-profile" class="block text-sm font-medium text-wise-dark-gray">Default shipping manifest profile:</label>
                                                <input type="text" id="up-default-shipping-manifest-profile" name="defaultShippingManifestProfile" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <h4 class="font-semibold text-wise-dark-gray mt-4 mb-2">Processing</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-cycle-counting" class="block text-sm font-medium text-wise-dark-gray">Cycle counting:</label>
                                                <input type="text" id="up-cycle-counting" name="cycleCounting" value="Default" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-packing" class="block text-sm font-medium text-wise-dark-gray">Packing:</label>
                                                <input type="text" id="up-packing" name="packing" value="Default" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-shipping" class="block text-sm font-medium text-wise-dark-gray">Shipping:</label>
                                                <input type="text" id="up-shipping" name="shipping" value="Default" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-receiving" class="block text-sm font-medium text-wise-dark-gray">Receiving:</label>
                                                <input type="text" id="up-receiving" name="receiving" value="Standard" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-inbound-order" class="block text-sm font-medium text-wise-dark-gray">Inbound order:</label>
                                                <input type="text" id="up-inbound-order" name="inboundOrder" value="Default" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <h4 class="font-semibold text-wise-dark-gray mt-4 mb-2">Supply Chain Intelligence</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-report-directory" class="block text-sm font-medium text-wise-dark-gray">Report directory:</label>
                                                <input type="text" id="up-report-directory" name="reportDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-my-jobs-directory" class="block text-sm font-medium text-wise-dark-gray">My jobs directory:</label>
                                                <input type="text" id="up-my-jobs-directory" name="myJobsDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-default-client" class="block text-sm font-medium text-wise-dark-gray">Default client:</label>
                                                <input type="text" id="up-default-client" name="defaultClient" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                        </div>
                                        <h4 class="font-semibold text-wise-dark-gray mt-4 mb-2">System</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="up-desktop-template" class="block text-sm font-medium text-wise-dark-gray">Desktop template:</label>
                                                <input type="text" id="up-desktop-template" name="desktopTemplate" value="Administrator" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-rf-style-sheet" class="block text-sm font-medium text-wise-dark-gray">RF style sheet:</label>
                                                <input type="text" id="up-rf-style-sheet" name="rfStyleSheet" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                            </div>
                                            <div>
                                                <label for="up-excel-export-directory" class="block text-sm font-medium text-wise-dark-gray">Excel export directory:</label>
                                                <input type="text" id="up-excel-export-directory" name="excelExportDirectory" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
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
                                            <div class="flex items-center"><input type="checkbox" id="company-do" name="companyAccess" value="DO" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="company-do" class="ml-2 text-sm text-wise-dark-gray">DO</label></div>
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
                                            <div class="flex items-center"><input type="checkbox" id="warehouse-do" name="warehouseAccess" value="DO" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary"><label for="warehouse-do" class="ml-2 text-sm text-wise-dark-gray">DO</label></div>
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
            'security-group': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Security Group</h2>
                    <p class="text-wise-gray mb-4">Manage security groups and their access levels within the system.</p>
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showSecurityGroupForm('create')">
                            Create New Security Group
                        </button>
                        <input type="text" id="security-group-search" placeholder="Search security group..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray" oninput="filterSecurityGroupList(this.value)">
                    </div>
                    <div id="security-group-list-container" class="overflow-x-auto">
                    </div>

                    <div id="security-group-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                            <h3 id="security-group-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-group-form" onsubmit="handleSecurityGroupSubmit(event)">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="security-group-name" class="block text-sm font-medium text-wise-dark-gray">Security group:</label>
                                            <input type="text" id="security-group-name" name="groupName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="security-group-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="security-group-description" name="description" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                    </div>

                                    <div class="mb-4">
                                        <div class="flex space-x-2 mb-2 border-b border-wise-border">
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="group-users-tab">Group users</button>
                                            <button type="button" class="tab-button px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-transparent text-wise-gray hover:text-wise-primary hover:border-wise-primary transition-all-smooth" data-tab="user-defined-data-tab">User Defined Data</button>
                                        </div>

                                        <div id="group-users-tab" class="tab-content border border-wise-border p-4 rounded-b-md">
                                            <div class="flex justify-between items-center mb-2">
                                                     <input type="text" id="security-group-user-filter" placeholder="Filter users..." class="px-3 py-1 border rounded-md bg-white text-wise-dark-gray text-sm w-1/3" oninput="renderSecurityGroupUserCheckboxes(null, this.value)">
                                                     <label class="inline-flex items-center">
                                                         <input type="checkbox" id="check-all-security-group-users" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary" onclick="toggleAllSecurityGroupUsers()">
                                                         <span class="ml-2 text-sm text-wise-dark-gray">Check all</span>
                                                     </label>
                                            </div>
                                            <div id="security-group-user-checkbox-list" class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-wise-light-gray">
                                                <!-- User checkboxes will be rendered here -->
                                            </div>
                                        </div>

                                        <div id="user-defined-data-tab" class="tab-content border border-wise-border p-4 rounded-b-md hidden">
                                            <h4 class="font-semibold text-wise-dark-gray mb-2">User defined data</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label for="sg-user-defined-field1" class="block text-sm font-medium text-wise-dark-gray">User defined field 1:</label>
                                                    <input type="text" id="sg-user-defined-field1" name="userDefinedField1" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field2" class="block text-sm font-medium text-wise-dark-gray">User defined field 2:</label>
                                                    <input type="text" id="sg-user-defined-field2" name="userDefinedField2" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field3" class="block text-sm font-medium text-wise-dark-gray">User defined field 3:</label>
                                                    <input type="text" id="sg-user-defined-field3" name="userDefinedField3" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field4" class="block text-sm font-medium text-wise-dark-gray">User defined field 4:</label>
                                                    <input type="text" id="sg-user-defined-field4" name="userDefinedField4" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field5" class="block text-sm font-medium text-wise-dark-gray">User defined field 5:</label>
                                                    <input type="text" id="sg-user-defined-field5" name="userDefinedField5" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field6" class="block text-sm font-medium text-wise-dark-gray">User defined field 6:</label>
                                                    <input type="text" id="sg-user-defined-field6" name="userDefinedField6" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                                <div>
                                                    <label for="sg-user-defined-field7" class="block text-sm font-medium text-wise-dark-gray">User defined field 7:</label>
                                                    <input type="text" id="sg-user-defined-field7" name="userDefinedField7" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm sm:text-sm bg-white text-wise-dark-gray">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="security-group-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeSecurityGroupForm()">Cancel</button>
                                <button type="submit" form="security-group-form" id="security-group-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">Save</button>
                            </div>
                        </div>
                    </div>
                `,
            },
            'security-permission': {
                full: `
                    <h2 class="text-xl md:text-2xl font-semibold text-wise-dark-gray mb-4">Configuration - Security Permission</h2>
                    <p class="text-wise-gray mb-4">Manage security permissions and their access to different menus.</p>
                    
                    <!-- Action and Search Buttons -->
                    <div class="flex justify-between items-center mb-4">
                        <button class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md active-press transform" onclick="showSecurityPermissionForm('create')">
                            Create New Permission
                        </button>
                        <input type="text" id="security-permission-search" placeholder="Search permission..." class="px-3 py-2 border rounded-md bg-white text-wise-dark-gray w-full max-w-xs" oninput="renderSecurityPermissionList(this.value)">
                    </div>

                    <!-- Container for Table -->
                    <div id="security-permission-list-container" class="overflow-x-auto">
                        <!-- Table will be rendered by JavaScript here -->
                    </div>

                    <!-- Form Modal for Create/Edit -->
                    <div id="security-permission-form-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50 p-4">
                        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl flex flex-col max-h-[90vh]">
                            <h3 id="security-permission-form-title" class="text-lg font-semibold text-wise-dark-gray mb-4"></h3>
                            
                            <div class="flex-1 overflow-y-auto pr-4 -mr-4">
                                <form id="security-permission-form" onsubmit="handleSecurityPermissionSubmit(event)">
                                    <!-- Name & Description Inputs -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label for="sp-name" class="block text-sm font-medium text-wise-dark-gray">Security permission:</label>
                                            <input type="text" id="sp-name" name="spName" required class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                        <div>
                                            <label for="sp-description" class="block text-sm font-medium text-wise-dark-gray">Description:</label>
                                            <input type="text" id="sp-description" name="spDescription" class="mt-1 block w-full px-3 py-2 border border-wise-border rounded-md shadow-sm focus:outline-none focus:ring-wise-primary focus:border-wise-primary sm:text-sm bg-white text-wise-dark-gray">
                                        </div>
                                    </div>

                                    <!-- KEYWORD: MENU CHECKBOX SECTION -->
                                    <h4 class="font-semibold text-wise-dark-gray mb-2">Menus</h4>
                                    <div class="border border-wise-border rounded-md p-4">
                                        <!-- Filter Radio Buttons -->
                                        <div id="sp-menu-filter" class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 pb-3 border-b border-wise-border">
                                            <span class="text-sm font-medium text-wise-dark-gray">Filter by:</span>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="All" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)" checked><span class="ml-2">All</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Configurations" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Configurations</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Gadgets" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Gadgets</span></label>
                                            <label class="flex items-center text-sm"><input type="radio" name="menuFilter" value="Processing" class="form-radio h-4 w-4 text-wise-primary" onchange="renderMenuCheckboxes(getCurrentSelectedMenus(), this.value)"><span class="ml-2">Processing</span></label>
                                        </div>
                                        <!-- Checkbox List Container -->
                                        <div id="sp-menu-checkbox-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 max-h-60 overflow-y-auto">
                                            <!-- Menu checkboxes will be rendered by JavaScript -->
                                        </div>
                                    </div>
                                    
                                    <!-- Inactive Checkbox -->
                                    <div class="mt-4">
                                        <label class="inline-flex items-center">
                                            <input type="checkbox" id="sp-inactive" name="inactive" class="form-checkbox h-4 w-4 text-wise-primary rounded border-wise-border focus:ring-wise-primary">
                                            <span class="ml-2 text-sm text-wise-dark-gray">Inactive</span>
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <!-- OK and Cancel Buttons -->
                            <div class="mt-4 pt-4 border-t border-wise-border flex justify-end space-x-3">
                                <button type="button" class="px-4 py-2 border border-wise-border rounded-md text-wise-dark-gray hover:bg-wise-light-gray transition-colors duration-200" onclick="closeSecurityPermissionForm()">Cancel</button>
                                <button type="submit" form="security-permission-form" id="security-permission-submit-button" class="px-4 py-2 bg-wise-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">OK</button>
                            </div>
                        </div>
                    </div>
                `,
            },
        });

        // =========================
        // Search registry & menus
        // =========================
        window.searchItems.push(
            { id: 'allocation-rule', title: 'Allocation Rule', category: 'Configuration', lastUpdated: 'Latest' },
            { id: 'allocation-strategies', title: 'Allocation Strategies', category: 'Configuration', lastUpdated: 'Latest' }
        );
        window.allMenus.push(
            { name: 'Allocation Rule', category: 'Configurations' },
            { name: 'Allocation Strategies', category: 'Configurations' }
        );
        window.parentMapping['allocation-rule'] = 'configuration';
        window.parentMapping['allocation-strategies'] = 'configuration';

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

        // Persist helpers
        function saveAllocationRules() { localStorage.setItem('allocationRules', JSON.stringify(allocationRules)); }
        function saveAllocationStrategies() { localStorage.setItem('allocationStrategies', JSON.stringify(allocationStrategies)); }

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
                sc.setAttribute('disabled', true);
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

                        document.getElementById('allocation-strategy-system-created').setAttribute('disabled', true);
                    } else {
                        document.getElementById('allocation-strategy-system-created').removeAttribute('disabled');
                    }
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

        // =========================
        // Auto-render on mount
        // =========================
        (function autoRender() {
            const obs = new MutationObserver(() => {
                const c1 = document.getElementById('allocation-rule-list-container');
                if (c1) renderAllocationRuleList();
                const c2 = document.getElementById('allocation-strategy-list-container');
                if (c2) renderAllocationStrategyList();
                if (c1 || c2) obs.disconnect();
            });
            obs.observe(document.body, { childList: true, subtree: true });
        })();

        // Bridge ke halaman configurasi
        window.selectCategory('configuration');
        console.log('Configuration V2 loaded successfully');
    });
})();
