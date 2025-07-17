// Sample data for the application
const sampleData = {
   dashboard: {
       title: "Dashboard Overview",
       content: `
           <div class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div class="bg-blue-50 p-4 rounded-lg">
                       <h4 class="font-semibold text-blue-800">Total Orders</h4>
                       <p class="text-2xl font-bold text-blue-900">1,234</p>
                   </div>
                   <div class="bg-green-50 p-4 rounded-lg">
                       <h4 class="font-semibold text-green-800">Active Shipments</h4>
                       <p class="text-2xl font-bold text-green-900">567</p>
                   </div>
                   <div class="bg-yellow-50 p-4 rounded-lg">
                       <h4 class="font-semibold text-yellow-800">Pending Tasks</h4>
                       <p class="text-2xl font-bold text-yellow-900">89</p>
                   </div>
               </div>
               <div class="border-t border-wise-border pt-4">
                   <div class="space-y-3">
                       <div class="flex items-center justify-between py-2 border-b border-wise-border">
                           <span class="text-wise-dark-gray font-medium">Recent Activity</span>
                           <span class="text-wise-gray text-sm">Last updated</span>
                       </div>
                       <div class="flex items-center justify-between py-2 border-b border-wise-border">
                           <span class="text-wise-dark-gray">Order #12345 completed</span>
                           <span class="text-wise-gray text-sm">2 hours ago</span>
                       </div>
                       <div class="flex items-center justify-between py-2 border-b border-wise-border">
                           <span class="text-wise-dark-gray">Inventory updated</span>
                           <span class="text-wise-gray text-sm">4 hours ago</span>
                       </div>
                   </div>
               </div>
           </div>
       `
   },
   pool: {
       title: "Pool Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Pool A - Container Storage</h3>
                   <span class="text-wise-gray text-sm">Capacity: 85%</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Pool B - Equipment Storage</h3>
                   <span class="text-wise-gray text-sm">Capacity: 72%</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Pool C - Temporary Storage</h3>
                   <span class="text-wise-gray text-sm">Capacity: 45%</span>
               </div>
           </div>
       `
   },
   booking: {
       title: "Booking Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Booking #BK001</h3>
                   <span class="text-wise-gray text-sm">Status: Confirmed</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Booking #BK002</h3>
                   <span class="text-wise-gray text-sm">Status: Pending</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Booking #BK003</h3>
                   <span class="text-wise-gray text-sm">Status: In Progress</span>
               </div>
           </div>
       `
   },
   order: {
       title: "Order Planning",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Order Plan #OP001</h3>
                   <span class="text-wise-gray text-sm">Due: Today</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Order Plan #OP002</h3>
                   <span class="text-wise-gray text-sm">Due: Tomorrow</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Order Plan #OP003</h3>
                   <span class="text-wise-gray text-sm">Due: Next Week</span>
               </div>
           </div>
       `
   },
   work: {
       title: "Work Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Task #T001 - Loading Operations</h3>
                   <span class="text-wise-gray text-sm">Status: Active</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Task #T002 - Unloading Operations</h3>
                   <span class="text-wise-gray text-sm">Status: Completed</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Task #T003 - Inventory Check</h3>
                   <span class="text-wise-gray text-sm">Status: Pending</span>
               </div>
           </div>
       `
   },
   crew: {
       title: "Crew Application",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Application #CA001 - John Doe</h3>
                   <span class="text-wise-gray text-sm">Status: Under Review</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Application #CA002 - Jane Smith</h3>
                   <span class="text-wise-gray text-sm">Status: Approved</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Application #CA003 - Mike Johnson</h3>
                   <span class="text-wise-gray text-sm">Status: Rejected</span>
               </div>
           </div>
       `
   },
   inventory: {
       title: "Inventory Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Inventory Overview</h3>
                   <span class="text-wise-gray text-sm">Total Items: 15,234</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Low Stock Items</h3>
                   <span class="text-wise-gray text-sm">23 items</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Recent Movements</h3>
                   <span class="text-wise-gray text-sm">156 transactions</span>
               </div>
           </div>
       `,
       children: {
           yard: {
               title: "Yard Management",
               content: `
                   <div class="space-y-4">
                       <div class="bg-green-50 p-4 rounded-lg">
                           <h4 class="font-semibold text-green-800 mb-2">Yard Status</h4>
                           <p class="text-green-700">Current capacity: 1,250 containers</p>
                           <p class="text-green-700">Available space: 85%</p>
                       </div>
                       <div class="space-y-3">
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Container Block A</span>
                               <span class="text-wise-gray text-sm">450 containers</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Container Block B</span>
                               <span class="text-wise-gray text-sm">380 containers</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Container Block C</span>
                               <span class="text-wise-gray text-sm">420 containers</span>
                           </div>
                       </div>
                   </div>
               `,
               preview: `
                   <div class="text-sm text-wise-gray">
                       <h4 class="font-semibold text-wise-dark-gray mb-2">Yard Preview</h4>
                       <p class="mb-2">Total Containers: 1,250</p>
                       <p class="mb-2">Capacity: 85% utilized</p>
                       <p class="mb-2">Last updated: 15 minutes ago</p>
                       <div class="mt-3 p-2 bg-green-50 rounded">
                           <p class="text-green-700 text-xs">Status: Operational</p>
                       </div>
                   </div>
               `
           },
           warehouse: {
               title: "Warehouse Management",
               content: `
                   <div class="space-y-4">
                       <div class="bg-blue-50 p-4 rounded-lg">
                           <h4 class="font-semibold text-blue-800 mb-2">Warehouse Status</h4>
                           <p class="text-blue-700">Total items: 8,450</p>
                           <p class="text-blue-700">Available space: 72%</p>
                       </div>
                       <div class="space-y-3">
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Section A - Electronics</span>
                               <span class="text-wise-gray text-sm">2,150 items</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Section B - Clothing</span>
                               <span class="text-wise-gray text-sm">3,200 items</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Section C - Furniture</span>
                               <span class="text-wise-gray text-sm">3,100 items</span>
                           </div>
                       </div>
                   </div>
               `,
               preview: `
                   <div class="text-sm text-wise-gray">
                       <h4 class="font-semibold text-wise-dark-gray mb-2">Warehouse Preview</h4>
                       <p class="mb-2">Total Items: 8,450</p>
                       <p class="mb-2">Capacity: 72% utilized</p>
                       <p class="mb-2">Last updated: 8 minutes ago</p>
                       <div class="mt-3 p-2 bg-blue-50 rounded">
                           <p class="text-blue-700 text-xs">Status: Active</p>
                       </div>
                   </div>
               `
           },
           storage: {
               title: "Storage Management",
               content: `
                   <div class="space-y-4">
                       <div class="bg-yellow-50 p-4 rounded-lg">
                           <h4 class="font-semibold text-yellow-800 mb-2">Storage Status</h4>
                           <p class="text-yellow-700">Cold storage: 95% capacity</p>
                           <p class="text-yellow-700">Dry storage: 68% capacity</p>
                       </div>
                       <div class="space-y-3">
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Cold Storage Unit 1</span>
                               <span class="text-wise-gray text-sm">Temperature: -18°C</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Cold Storage Unit 2</span>
                               <span class="text-wise-gray text-sm">Temperature: -15°C</span>
                           </div>
                           <div class="flex items-center justify-between py-2 border-b border-wise-border">
                               <span class="text-wise-dark-gray font-medium">Dry Storage Unit</span>
                               <span class="text-wise-gray text-sm">Humidity: 45%</span>
                           </div>
                       </div>
                   </div>
               `,
               preview: `
                   <div class="text-sm text-wise-gray">
                       <h4 class="font-semibold text-wise-dark-gray mb-2">Storage Preview</h4>
                       <p class="mb-2">Cold Storage: 95% full</p>
                       <p class="mb-2">Dry Storage: 68% full</p>
                       <p class="mb-2">Last updated: 5 minutes ago</p>
                       <div class="mt-3 p-2 bg-yellow-50 rounded">
                           <p class="text-yellow-700 text-xs">Status: Monitored</p>
                       </div>
                   </div>
               `
           }
       }
   },
   performance: {
       title: "Performance Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Overall Performance</h3>
                   <span class="text-wise-gray text-sm">Score: 87%</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Efficiency Metrics</h3>
                   <span class="text-wise-gray text-sm">Improving</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Team Performance</h3>
                   <span class="text-wise-gray text-sm">Excellent</span>
               </div>
           </div>
       `
   },
   setting: {
       title: "Setting Optimization",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">System Configuration</h3>
                   <span class="text-wise-gray text-sm">Last updated: 1 day ago</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Performance Settings</h3>
                   <span class="text-wise-gray text-sm">Optimized</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Security Settings</h3>
                   <span class="text-wise-gray text-sm">Active</span>
               </div>
           </div>
       `
   },
   system: {
       title: "System Management",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">System Health</h3>
                   <span class="text-wise-gray text-sm">Status: Healthy</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Database Status</h3>
                   <span class="text-wise-gray text-sm">Connected</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Server Performance</h3>
                   <span class="text-wise-gray text-sm">Optimal</span>
               </div>
           </div>
       `
   },
   archive: {
       title: "Data Archiving",
       content: `
           <div class="space-y-4">
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Archive Status</h3>
                   <span class="text-wise-gray text-sm">85% complete</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Data Retention</h3>
                   <span class="text-wise-gray text-sm">7 years</span>
               </div>
               <div class="flex items-center justify-between py-3 border-b border-wise-border">
                   <h3 class="text-wise-dark-gray font-medium">Storage Usage</h3>
                   <span class="text-wise-gray text-sm">2.5 TB</span>
               </div>
           </div>
       `
   }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
   // Check if user is logged in (for dashboard)
   if (window.location.pathname.includes('dashboard.html')) {
       const isLoggedIn = localStorage.getItem('isLoggedIn');
       if (!isLoggedIn) {
           window.location.href = 'login.html';
           return;
       }
       
       // Display username
       const username = localStorage.getItem('username') || 'SuperAdmin';
       document.getElementById('username-display').textContent = username;
       document.getElementById('user-initial').textContent = username.charAt(0).toUpperCase();
   }
   
   // Hide search results when clicking outside
   document.addEventListener('click', function(e) {
       if (!e.target.closest('#search-input') && !e.target.closest('#search-results')) {
           hideSearchResults();
       }
   });
});

// Login functionality
function handleLogin(event) {
   event.preventDefault();
   const username = document.getElementById('username').value;
   const password = document.getElementById('password').value;
   
   if (username && password) {
       localStorage.setItem('isLoggedIn', 'true');
       localStorage.setItem('username', username);
       window.location.href = 'dashboard.html';
   } else {
       alert('Please enter both username and password');
   }
}

// Search functionality
function handleSearch(query) {
   const searchResults = document.getElementById('search-results');
   const searchResultsContent = document.getElementById('search-results-content');
   
   if (query.length === 0) {
       hideSearchResults();
       return;
   }
   
   // Filter data based on search query
   const results = [];
   
   // Search in main categories
   Object.keys(sampleData).forEach(key => {
       const item = sampleData[key];
       if (item.title.toLowerCase().includes(query.toLowerCase())) {
           results.push({
               key: key,
               title: item.title,
               type: 'category',
               content: item.title
           });
       }
       
       // Search in children if they exist
       if (item.children) {
           Object.keys(item.children).forEach(childKey => {
               const child = item.children[childKey];
               if (child.title.toLowerCase().includes(query.toLowerCase())) {
                   results.push({
                       key: childKey,
                       title: child.title,
                       type: 'child',
                       parent: key,
                       content: child.title
                   });
               }
           });
       }
   });
   
   // Populate search results
   searchResultsContent.innerHTML = '';
   
   if (results.length === 0) {
       searchResultsContent.innerHTML = '<div class="p-3 text-wise-gray text-sm">No results found</div>';
   } else {
       results.forEach(result => {
           const resultDiv = document.createElement('div');
           resultDiv.className = 'p-3 hover:bg-wise-light-gray cursor-pointer rounded-lg transition-colors duration-200';
           resultDiv.innerHTML = `
               <div class="font-medium text-wise-dark-gray">${result.title}</div>
               ${result.parent ? `<div class="text-xs text-wise-gray">in ${sampleData[result.parent].title}</div>` : ''}
           `;
           resultDiv.onclick = () => {
               if (result.type === 'child') {
                   // Show parent and then child
                   toggleInventory();
                   selectInventoryChild(result.key);
               } else {
                   selectCategory(result.key);
               }
               hideSearchResults();
               document.getElementById('search-input').value = '';
           };
           searchResultsContent.appendChild(resultDiv);
       });
   }
   
   searchResults.classList.remove('hidden');
}

function hideSearchResults() {
   document.getElementById('search-results').classList.add('hidden');
}

// Category selection
function selectCategory(category) {
   const data = sampleData[category];
   if (!data) return;
   
   const mainContent = document.getElementById('main-content');
   mainContent.innerHTML = `
       <h2 class="text-xl font-semibold text-wise-dark-gray mb-6">${data.title}</h2>
       ${data.content}
   `;
   
   // Hide inventory children if not inventory
   if (category !== 'inventory') {
       document.getElementById('inventory-children').classList.add('hidden');
   }
}

// Inventory toggle
function toggleInventory() {
   const inventoryChildren = document.getElementById('inventory-children');
   inventoryChildren.classList.toggle('hidden');
   
   // Show inventory content
   selectCategory('inventory');
}

// Inventory child selection
function selectInventoryChild(childKey) {
   const inventoryData = sampleData.inventory;
   const childData = inventoryData.children[childKey];
   
   if (!childData) return;
   
   const mainContent = document.getElementById('main-content');
   mainContent.innerHTML = `
       <h2 class="text-xl font-semibold text-wise-dark-gray mb-6">${childData.title}</h2>
       ${childData.content}
   `;
}

// Preview functionality
function showPreview(childKey) {
   const inventoryData = sampleData.inventory;
   const childData = inventoryData.children[childKey];
   
   if (!childData) return;
   
   // Create preview overlay
   let previewOverlay = document.getElementById('preview-overlay');
   if (!previewOverlay) {
       previewOverlay = document.createElement('div');
       previewOverlay.id = 'preview-overlay';
       previewOverlay.className = 'fixed top-20 right-6 w-80 bg-white border border-wise-border rounded-lg shadow-lg z-50 p-4';
       document.body.appendChild(previewOverlay);
   }
   
   previewOverlay.innerHTML = `
       <div class="flex items-center justify-between mb-3">
           <h3 class="font-semibold text-wise-dark-gray">${childData.title}</h3>
           <button onclick="hidePreview()" class="text-wise-gray hover:text-wise-dark-gray">
               <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
               </svg>
           </button>
       </div>
       ${childData.preview}
   `;
   
   previewOverlay.style.display = 'block';
   
   // Auto-hide preview after 5 seconds
   setTimeout(() => {
       hidePreview();
   }, 5000);
}

function hidePreview() {
   const previewOverlay = document.getElementById('preview-overlay');
   if (previewOverlay) {
       previewOverlay.style.display = 'none';
   }
}

// Logout functionality
function logout() {
   localStorage.removeItem('isLoggedIn');
   localStorage.removeItem('username');
   window.location.href = 'login.html';
}

// Add event listeners for preview on mouse leave
document.addEventListener('mouseleave', function(e) {
   if (e.target.classList.contains('sidebar-child')) {
       setTimeout(() => {
           if (!document.querySelector('.sidebar-child:hover')) {
               hidePreview();
           }
       }, 100);
   }
});