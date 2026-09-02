// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check login status
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

// Show dashboard
function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadAdminData();
    renderAdminAccounts();
}

// Load stats
function loadAdminData() {
    const total = DB.getTotalAccounts();
    const games = DB.getTotalGames();
    document.getElementById('totalAccounts').textContent = total;
    document.getElementById('totalGames').textContent = games;
}

// Handle upload with multiple images
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
    const whatsapp = document.getElementById('whatsappNumber').value;
    const imageFiles = document.getElementById('accountImages').files;
    
    if (imageFiles.length === 0) {
        showToast('Silakan upload minimal 1 foto akun!', 'error');
        return;
    }
    
    const images = [];
    let loaded = 0;
    
    for (let i = 0; i < imageFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            images.push(e.target.result);
            loaded++;
            
            if (loaded === imageFiles.length) {
                const newAccount = {
                    gameName,
                    price,
                    specs,
                    details,
                    whatsapp,
                    images: images
                };
                
                const result = DB.addAccount(newAccount);
                if (result) {
                    showToast(`Akun ${result.code} berhasil diupload dengan ${images.length} foto!`, 'success');
                    document.getElementById('uploadForm').reset();
                    document.getElementById('imagePreview').innerHTML = '';
                    renderAdminAccounts();
                    loadAdminData();
                    if (typeof filterAccounts === 'function') filterAccounts();
                } else {
                    showToast('Gagal upload akun!', 'error');
                }
            }
        };
        reader.readAsDataURL(imageFiles[i]);
    }
}

// Image preview for multiple files
document.getElementById('accountImages')?.addEventListener('change', function(e) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(files[i]);
    }
});

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
            <div class="images-preview">
                ${acc.images && acc.images.length > 0 ? 
                    acc.images.slice(0, 3).map(img => `<img src="${img}" alt="Foto">`).join('') :
                    '<div style="background:#1a1a2e;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);">No Image</div>'
                }
                ${acc.images && acc.images.length > 3 ? `<div style="background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">+${acc.images.length - 3}</div>` : ''}
            </div>
            <div class="info">
                <h4>${acc.gameName}</h4>
                <small>${acc.code}</small>
                <div class="price">Rp ${formatPrice(acc.price)}</div>
                <small style="opacity:0.6;">${acc.images ? acc.images.length : 0} foto</small>
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
            if (typeof filterAccounts === 'function') filterAccounts();
        } else {
            showToast('Gagal menghapus akun!', 'error');
        }
    }
}

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Show toast
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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

// Load saved theme for admin
const savedTheme = localStorage.getItem('selectedTheme');
if (savedTheme && typeof setTheme === 'function') {
    setTimeout(() => setTheme(savedTheme), 500);
}
