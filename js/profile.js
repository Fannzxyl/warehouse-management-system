// Modal functionality
document.getElementById('editProfileButton').addEventListener('click', function() {
    // Populate form with current values
    document.getElementById('editUsername').value = document.getElementById('usernameDisplay').textContent;
    document.getElementById('editEmail').value = document.getElementById('emailDisplay').textContent;
    document.getElementById('editPhone').value = document.getElementById('phoneDisplay').textContent;
    document.getElementById('editShift').value = document.getElementById('shiftDisplay').textContent;
    document.getElementById('editLocation').value = document.getElementById('locationDisplay').textContent;
    
    // Show modal and trigger transition
    const editModal = document.getElementById('editModal');
    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
    // Tambah delay singkat untuk memastikan transisi CSS dipicu
    setTimeout(() => {
        editModal.querySelector('div').classList.remove('scale-95', 'opacity-0');
        editModal.querySelector('div').classList.add('scale-100', 'opacity-100');
    }, 10);
});

document.getElementById('closeModalButton').addEventListener('click', closeEditModal);
document.getElementById('cancelButton').addEventListener('click', closeEditModal);
document.getElementById('saveChangesButton').addEventListener('click', saveChanges);
document.getElementById('backToDashboardBtn').addEventListener('click', goToDashboard);

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    // Trigger reverse transition
    editModal.querySelector('div').classList.remove('scale-100', 'opacity-100');
    editModal.querySelector('div').classList.add('scale-95', 'opacity-0');

    // Sembunyikan modal setelah transisi selesai
    setTimeout(() => {
        editModal.classList.add('hidden');
        editModal.classList.remove('flex');
    }, 300); // Sesuaikan dengan durasi transisi CSS (duration-300)
}

function saveChanges() {
    // Update display values
    document.getElementById('usernameDisplay').textContent = document.getElementById('editUsername').value;
    document.getElementById('emailDisplay').textContent = document.getElementById('editEmail').value;
    document.getElementById('phoneDisplay').textContent = document.getElementById('editPhone').value;
    document.getElementById('shiftDisplay').textContent = document.getElementById('editShift').value;
    document.getElementById('locationDisplay').textContent = document.getElementById('editLocation').value;
    
    closeEditModal();
    
    // Show success notification (more professional)
    showNotification('Profile updated successfully!', 'success');
}

function goToDashboard() {
    window.history.back(); // Kembali ke halaman sebelumnya (dashboard.html jika dari sana)
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) { // Memastikan klik hanya pada backdrop, bukan isi modal
        closeEditModal();
    }
});