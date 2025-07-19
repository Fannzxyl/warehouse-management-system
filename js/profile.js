// DOM Elements
const usernameDisplay = document.getElementById('usernameDisplay');
const emailDisplay = document.getElementById('emailDisplay');
const phoneDisplay = document.getElementById('phoneDisplay');
const employeeIdDisplay = document.getElementById('employeeIdDisplay');
const joinDateDisplay = document.getElementById('joinDateDisplay');
const shiftDisplay = document.getElementById('shiftDisplay');
const locationDisplay = document.getElementById('locationDisplay');

const editProfileButton = document.getElementById('editProfileButton');

const editModal = document.getElementById('editModal');
const editUsernameInput = document.getElementById('editUsername');
const editEmailInput = document.getElementById('editEmail');
const editPhoneInput = document.getElementById('editPhone');
const editShiftSelect = document.getElementById('editShift');
const editLocationSelect = document.getElementById('editLocation');

// Initial User Data (can be fetched from an API in a real application)
let userData = {
    username: "Warehouse User",
    email: "user@warehouse.com",
    phone: "+62 812 3456 7890",
    employeeId: "WH-EMP-12345",
    joinDate: "January 15, 2024",
    shift: "Morning Shift (08:00 - 16:00)",
    location: "Warehouse A, Block 3"
};

// Function to populate display fields from userData
function renderProfileData() {
    usernameDisplay.textContent = userData.username;
    emailDisplay.textContent = userData.email;
    phoneDisplay.textContent = userData.phone;
    employeeIdDisplay.textContent = userData.employeeId;
    joinDateDisplay.textContent = userData.joinDate;
    shiftDisplay.textContent = userData.shift;
    locationDisplay.textContent = userData.location;
}

// Function to navigate to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html'; 
}

// Function to open the edit modal
function openEditModal() {
    // Populate modal fields with current data
    editUsernameInput.value = userData.username;
    editEmailInput.value = userData.email;
    editPhoneInput.value = userData.phone;
    
    // Set selected option for Shift dropdown
    editShiftSelect.value = userData.shift;
    
    // Set selected option for Location dropdown
    editLocationSelect.value = userData.location;

    editModal.style.display = 'flex';
}

// Function to close the edit modal
function closeEditModal() {
    editModal.style.display = 'none';
}

// Function to save changes from the modal
function saveChanges() {
    // Update userData object with values from modal inputs
    userData.username = editUsernameInput.value.trim() || 'Warehouse User';
    userData.email = editEmailInput.value.trim() || 'user@warehouse.com';
    userData.phone = editPhoneInput.value.trim() || '+62 XXXX XXXX XXXX';
    
    // Get selected value from Shift dropdown
    userData.shift = editShiftSelect.value || 'Not specified';
    
    // Get selected value from Location dropdown
    userData.location = editLocationSelect.value || 'Not specified';

    // Re-render the profile display with updated data
    renderProfileData();
    closeEditModal();
    alert('Profile updated successfully!');
}

// Event listener for the "Edit Profile" button
editProfileButton.addEventListener('click', openEditModal);

// Close modal when clicking outside of modal content
window.onclick = function(event) {
    if (event.target === editModal) {
        closeEditModal();
    }
};

// Initial load and animation
document.addEventListener('DOMContentLoaded', function() {
    renderProfileData(); // Display initial data

    // Card animation on load
    const cards = document.querySelectorAll('.profile-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 180); 
    });
});