// Database menggunakan localStorage (free, no server needed)
const DB = {
    // Key untuk menyimpan data di localStorage
    STORAGE_KEY: 'gameStoreAccounts',
    
    // Mendapatkan semua akun
    getAccounts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading database:', error);
            return [];
        }
    },
    
    // Menyimpan akun
    saveAccounts(accounts) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            return false;
        }
    },
    
    // Menambah akun baru
    addAccount(account) {
        const accounts = this.getAccounts();
        // Generate kode otomatis
        const code = `ACC-${String(accounts.length + 1).padStart(4, '0')}`;
        account.code = code;
        account.id = Date.now();
        account.createdAt = new Date().toISOString();
        accounts.push(account);
        return this.saveAccounts(accounts) ? account : null;
    },
    
    // Menghapus akun berdasarkan ID
    deleteAccount(id) {
        let accounts = this.getAccounts();
        accounts = accounts.filter(acc => acc.id !== id);
        return this.saveAccounts(accounts);
    },
    
    // Mendapatkan akun berdasarkan ID
    getAccountById(id) {
        const accounts = this.getAccounts();
        return accounts.find(acc => acc.id === id);
    },
    
    // Update akun
    updateAccount(id, updatedData) {
        let accounts = this.getAccounts();
        const index = accounts.findIndex(acc => acc.id === id);
        if (index === -1) return false;
        accounts[index] = { ...accounts[index], ...updatedData };
        return this.saveAccounts(accounts);
    },
    
    // Search akun
    searchAccounts(query) {
        const accounts = this.getAccounts();
        if (!query) return accounts;
        const lowerQuery = query.toLowerCase();
        return accounts.filter(acc => 
            acc.gameName.toLowerCase().includes(lowerQuery) ||
            acc.specs.toLowerCase().includes(lowerQuery) ||
            acc.details.toLowerCase().includes(lowerQuery) ||
            acc.code.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Filter berdasarkan game
    filterByGame(game) {
        const accounts = this.getAccounts();
        if (game === 'all') return accounts;
        return accounts.filter(acc => 
            acc.gameName.toLowerCase().replace(/ /g, '-') === game
        );
    },
    
    // Filter berdasarkan harga
    filterByPrice(range) {
        const accounts = this.getAccounts();
        if (range === 'all') return accounts;
        
        const [min, max] = range.split('-').map(Number);
        if (range.includes('+')) {
            return accounts.filter(acc => acc.price >= min);
        }
        return accounts.filter(acc => acc.price >= min && acc.price <= max);
    },
    
    // Sort accounts
    sortAccounts(accounts, sortBy) {
        const sorted = [...accounts];
        switch(sortBy) {
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            default:
                return sorted;
        }
    },
    
    // Get all unique games
    getGames() {
        const accounts = this.getAccounts();
        const games = new Set(accounts.map(acc => acc.gameName));
        return Array.from(games);
    },
    
    // Get total accounts
    getTotalAccounts() {
        return this.getAccounts().length;
    },
    
    // Get total games
    getTotalGames() {
        return this.getGames().length;
    },
    
    // Clear all data (for testing)
    clearAll() {
        return this.saveAccounts([]);
    }
};

// Data dummy untuk testing (akan diisi jika kosong)
function initSampleData() {
    const accounts = DB.getAccounts();
    if (accounts.length === 0) {
        const sampleAccounts = [
            {
                id: 1,
                code: 'ACC-0001',
                gameName: 'Free Fire',
                price: 75000,
                image: 'https://picsum.photos/seed/ff1/400/300',
                specs: 'Rank: Heroic | Skin: Elite Pass Season 25 | Karakter: Alok, Kelly',
                details: 'Akun aktif, email terverifikasi, bisa login',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                code: 'ACC-0002',
                gameName: 'Mobile Legends',
                price: 150000,
                image: 'https://picsum.photos/seed/ml1/400/300',
                specs: 'Rank: Mythical Glory | Skin: 50+ skin epic | Hero: 80+ hero',
                details: 'Akun premium, banyak koleksi skin limited',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                code: 'ACC-0003',
                gameName: 'PUBG',
                price: 50000,
                image: 'https://picsum.photos/seed/pubg1/400/300',
                specs: 'Rank: Ace | Skin: M416 Glacier, Kar98k | UC: 1000',
                details: 'Akun dengan skin langka, siap pakai',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                code: 'ACC-0004',
                gameName: 'Genshin Impact',
                price: 250000,
                image: 'https://picsum.photos/seed/gi1/400/300',
                specs: 'AR 55 | Char: Zhongli, Raiden, Ganyu | Weapon: 5 star',
                details: 'Akun endgame, banyak character meta',
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                code: 'ACC-0005',
                gameName: 'Valorant',
                price: 100000,
                image: 'https://picsum.photos/seed/val1/400/300',
                specs: 'Rank: Diamond | Skin: Vandal Prime, Phantom Oni',
                details: 'Akun dengan skin favorit, ready competitive',
                createdAt: new Date().toISOString()
            }
        ];
        sampleAccounts.forEach(acc => DB.addAccount(acc));
    }
}

// Inisialisasi data sample
initSampleData();
