// Loading Screen
function showLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    
    let progress = 0;
    const duration = 25000; // 25 detik
    const interval = 250; // Update setiap 250ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    const loadingInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 500);
        }
        loadingBar.style.width = progress + '%';
        loadingPercentage.textContent = Math.round(progress) + '%';
    }, interval);
}

// Start loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflow = 'hidden';
    showLoading();
    
    // Set active nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Load accounts
    setTimeout(() => {
        filterAccounts();
    }, 1000);
});

// Render accounts
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
        <div class="account-card" onclick="openDetail(${acc.id})">
            <div class="account-images-slider">
                <img src="${acc.images && acc.images.length > 0 ? acc.images[0] : 'https://via.placeholder.com/400x300'}" alt="${acc.gameName}">
                ${acc.images && acc.images.length > 1 ? `<span style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.6);padding:4px 10px;border-radius:20px;font-size:0.7rem;z-index:2;">+${acc.images.length} foto</span>` : ''}
            </div>
            <span class="account-code">${acc.code}</span>
            <div class="account-info">
                <div class="account-game">${acc.gameName}</div>
                <h3 class="account-title">Akun ${acc.gameName}</h3>
                <div class="account-price">Rp ${formatPrice(acc.price)}</div>
                <div class="account-specs">${acc.specs.substring(0, 80)}${acc.specs.length > 80 ? '...' : ''}</div>
                <button class="buy-btn" onclick="event.stopPropagation(); openDetail(${acc.id})">
                    <i class="fas fa-eye"></i> Lihat Detail
                </button>
            </div>
        </div>
    `).join('');
}

// Open Detail Modal
function openDetail(id) {
    const account = DB.getAccountById(id);
    if (!account) {
        showToast('Akun tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('accountModal');
    const modalBody = document.getElementById('modalBody');
    
    const imagesHtml = account.images && account.images.length > 0 ? 
        account.images.map(img => `<img src="${img}" alt="Foto akun" onclick="window.open('${img}','_blank')">`).join('') :
        '<p style="opacity:0.5;">Tidak ada foto</p>';
    
    modalBody.innerHTML = `
        <div style="position:relative;">
            <h2 class="modal-detail-title">${account.gameName}</h2>
            <span style="background:var(--primary);padding:4px 12px;border-radius:50px;font-size:0.8rem;display:inline-block;margin-bottom:10px;">${account.code}</span>
            
            <div class="modal-detail-images">
                ${imagesHtml}
            </div>
            
            <div class="modal-detail-price">Rp ${formatPrice(account.price)}</div>
            
            <div class="modal-detail-specs">
                <h4><i class="fas fa-info-circle"></i> Spesifikasi</h4>
                <p>${account.specs}</p>
            </div>
            
            ${account.details ? `
            <div style="margin:15px 0;padding:15px;background:rgba(255,255,255,0.03);border-radius:10px;">
                <h4><i class="fas fa-clipboard-list"></i> Detail Lainnya</h4>
                <p style="opacity:0.8;">${account.details}</p>
            </div>
            ` : ''}
            
            <div style="margin-top:20px;display:flex;gap:15px;flex-wrap:wrap;">
                <a href="https://wa.me/${account.whatsapp || '628123456789'}?text=Halo%20saya%20ingin%20beli%20akun%20${account.code}%20-%20${account.gameName}%20seharga%20Rp%20${formatPrice(account.price)}" 
                   target="_blank" 
                   class="modal-whatsapp-btn">
                    <i class="fab fa-whatsapp"></i> Beli via WhatsApp
                </a>
                <button onclick="closeModal()" style="padding:15px 30px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:white;cursor:pointer;">
                    <i class="fas fa-times"></i> Tutup
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('accountModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.getElementById('accountModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Search accounts
function searchAccounts() {
    const query = document.getElementById('searchInput').value.trim();
    const results = DB.searchAccounts(query);
    renderAccounts(results);
    showToast(`Menampilkan ${results.length} hasil pencarian`, 'info');
}

// Filter accounts
function filterAccounts() {
    const gameFilter = document.getElementById('gameFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let accounts = DB.getAccounts();
    
    if (gameFilter !== 'all') {
        accounts = DB.filterByGame(gameFilter);
    }
    
    if (priceFilter !== 'all') {
        accounts = DB.filterByPrice(priceFilter);
    }
    
    accounts = DB.sortAccounts(accounts, sortFilter);
    renderAccounts(accounts);
}

// Toast notification
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

// Event listeners
document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchAccounts();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// Theme functions (for admin)
function setTheme(theme) {
    const root = document.documentElement;
    const themes = {
        'red-white': { primary: '#e74c3c', primaryDark: '#c0392b' },
        'blue-white': { primary: '#3498db', primaryDark: '#2980b9' },
        'yellow-black': { primary: '#f1c40f', primaryDark: '#f39c12' },
        'yellow-white': { primary: '#f1c40f', primaryDark: '#f39c12' },
        'green-white': { primary: '#2ecc71', primaryDark: '#27ae60' },
        'purple-white': { primary: '#9b59b6', primaryDark: '#8e44ad' },
        'orange-white': { primary: '#e67e22', primaryDark: '#d35400' },
        'pink-white': { primary: '#e91e63', primaryDark: '#c2185b' }
    };
    
    const selected = themes[theme];
    if (selected) {
        root.style.setProperty('--primary', selected.primary);
        root.style.setProperty('--primary-dark', selected.primaryDark);
        root.style.setProperty('--primary-glow', selected.primary + '40');
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        localStorage.setItem('selectedTheme', theme);
        showToast('Tema berhasil diubah!', 'success');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('selectedTheme');
if (savedTheme) {
    setTimeout(() => setTheme(savedTheme), 500);
}
