// Admin JavaScript

// Admin credentials (hardcoded untuk demo)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if admin is logged in
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminDashboard();
        showToast('Login berhasil!', 'success');
    } else {
        showToast('Username atau password salah!', 'error');
    }
}

// Logout
function logoutAdmin() {
    if (confirm('Anda yakin ingin logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        document.getElementById('adminLogin').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        showToast('Logout berhasil!', 'info');
    }
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadAdminData();
    renderAdminAccounts();
}

// Load admin data
function loadAdminData() {
    const total = DB.getTotalAccounts();
    const games = DB.getTotalGames();
    
    document.getElementById('totalAccounts').textContent = total;
    document.getElementById('totalGames').textContent = games;
}

// Handle upload
function handleUpload(event) {
    event.preventDefault();
    
    if (!isAdminLoggedIn()) {
        showToast('Silakan login terlebih dahulu!', 'error');
        return;
    }
    
    const gameName = document.getElementById('gameName').value;
    const price = parseInt(document.getElementById('price').value);
    const specs = document.getElementById('specs').value;
    const details = document.getElementById('details').value;
    const imageFile = document.getElementById('accountImage').files[0];
    
    if (!imageFile) {
        showToast('Silakan upload foto akun!', 'error');
        return;
    }
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        const newAccount = {
            gameName,
            price,
            specs,
            details,
            image: imageData
        };
        
        const result = DB.addAccount(newAccount);
        if (result) {
            showToast(`Akun ${result.code} berhasil diupload!`, 'success');
            document.getElementById('uploadForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
            renderAdminAccounts();
            loadAdminData();
            
            // Also update main page if open
            if (typeof filterAccounts === 'function') {
                filterAccounts();
            }
        } else {
            showToast('Gagal upload akun!', 'error');
        }
    };
    reader.readAsDataURL(imageFile);
}

// Render admin accounts
function renderAdminAccounts() {
    const container = document.getElementById('adminAccountList');
    const accounts = DB.getAccounts();
    
    if (accounts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Belum ada akun</h3>
                <p>Upload akun pertama Anda!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = accounts.map(acc => `
        <div class="admin-account-card">
            <img src="${acc.image}" alt="${acc.gameName}">
            <div class="info">
                <h4>${acc.gameName}</h4>
                <small>${acc.code}</small>
                <div class="price">Rp ${formatPrice(acc.price)}</div>
                <small>${acc.specs.substring(0, 50)}${acc.specs.length > 50 ? '...' : ''}</small>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="deleteAccount(${acc.id})">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

// Delete account
function deleteAccount(id) {
    if (!isAdminLoggedIn()) {
        showToast('Silakan login terlebih dahulu!', 'error');
        return;
    }
    
    const account = DB.getAccountById(id);
    if (!account) {
        showToast('Akun tidak ditemukan!', 'error');
        return;
    }
    
    if (confirm(`Hapus akun ${account.code} - ${account.gameName}?`)) {
        if (DB.deleteAccount(id)) {
            showToast(`Akun ${account.code} berhasil dihapus!`, 'success');
            renderAdminAccounts();
            loadAdminData();
            
            // Also update main page if open
            if (typeof filterAccounts === 'function') {
                filterAccounts();
            }
        } else {
            showToast('Gagal menghapus akun!', 'error');
        }
    }
}

// Image preview
document.getElementById('accountImage')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        if (isAdminLoggedIn()) {
            showAdminDashboard();
        } else {
            document.getElementById('adminLogin').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
        }
    }
});

// Prevent unauthorized access to admin page
if (window.location.pathname.includes('admin.html')) {
    // Check for admin login status
    if (!isAdminLoggedIn() && !window.location.hash.includes('login')) {
        // Stay on login page
    }
}
