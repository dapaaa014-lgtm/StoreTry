// Main JavaScript

// Render accounts ke halaman utama
function renderAccounts(accounts) {
    const container = document.getElementById('accountList');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Belum ada akun</h3>
                <p>Belum ada akun yang tersedia saat ini</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = accounts.map(acc => `
        <div class="account-card" data-id="${acc.id}">
            <img src="${acc.image}" alt="${acc.gameName}" class="account-image">
            <span class="account-code">${acc.code}</span>
            <div class="account-info">
                <div class="account-game">${acc.gameName}</div>
                <h3 class="account-title">Akun ${acc.gameName}</h3>
                <div class="account-price">Rp ${formatPrice(acc.price)}</div>
                <div class="account-specs">${acc.specs}</div>
                ${acc.details ? `<div class="account-details">${acc.details}</div>` : ''}
                <button class="buy-btn" onclick="buyAccount(${acc.id})">
                    <i class="fas fa-shopping-cart"></i> Beli Sekarang
                </button>
            </div>
        </div>
    `).join('');
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Search accounts
function searchAccounts() {
    const query = document.getElementById('searchInput').value.trim();
    const results = DB.searchAccounts(query);
    renderAccounts(results);
    
    // Show toast
    showToast(`Menampilkan ${results.length} hasil pencarian`, 'info');
}

// Filter accounts
function filterAccounts() {
    const gameFilter = document.getElementById('gameFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let accounts = DB.getAccounts();
    
    // Filter by game
    if (gameFilter !== 'all') {
        accounts = DB.filterByGame(gameFilter);
    }
    
    // Filter by price
    if (priceFilter !== 'all') {
        accounts = DB.filterByPrice(priceFilter);
    }
    
    // Sort
    accounts = DB.sortAccounts(accounts, sortFilter);
    
    renderAccounts(accounts);
}

// Buy account
function buyAccount(id) {
    const account = DB.getAccountById(id);
    if (!account) {
        showToast('Akun tidak ditemukan!', 'error');
        return;
    }
    
    if (confirm(`Anda yakin ingin membeli akun ${account.code} - ${account.gameName} seharga Rp ${formatPrice(account.price)}?`)) {
        // Delete account after purchase
        if (DB.deleteAccount(id)) {
            showToast(`Akun ${account.code} berhasil dibeli!`, 'success');
            filterAccounts(); // Refresh list
        } else {
            showToast('Gagal membeli akun!', 'error');
        }
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event listener untuk search on enter
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchAccounts();
    }
});

// Load accounts on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set active nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Load accounts
    filterAccounts();
});

// Theme switcher (public)
function setTheme(theme) {
    const root = document.documentElement;
    const themes = {
        'red-white': { primary: '#e74c3c', primaryDark: '#c0392b' },
        'blue-white': { primary: '#3498db', primaryDark: '#2980b9' },
        'yellow-black': { primary: '#f1c40f', primaryDark: '#f39c12' },
        'yellow-white': { primary: '#f1c40f', primaryDark: '#f39c12' },
        'green-white': { primary: '#2ecc71', primaryDark: '#27ae60' },
        'purple-white': { primary: '#9b59b6', primaryDark: '#8e44ad' }
    };
    
    const selected = themes[theme];
    if (selected) {
        root.style.setProperty('--primary', selected.primary);
        root.style.setProperty('--primary-dark', selected.primaryDark);
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(theme)) {
                btn.classList.add('active');
            }
        });
        
        showToast('Tema berhasil diubah!', 'success');
    }
}
