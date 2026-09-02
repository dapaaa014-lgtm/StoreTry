// Database menggunakan localStorage
const DB = {
    STORAGE_KEY: 'gameStoreAccounts',
    
    getAccounts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading database:', error);
            return [];
        }
    },
    
    saveAccounts(accounts) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            return false;
        }
    },
    
    addAccount(account) {
        const accounts = this.getAccounts();
        const code = `ACC-${String(accounts.length + 1).padStart(4, '0')}`;
        account.code = code;
        account.id = Date.now();
        account.createdAt = new Date().toISOString();
        accounts.push(account);
        return this.saveAccounts(accounts) ? account : null;
    },
    
    deleteAccount(id) {
        let accounts = this.getAccounts();
        accounts = accounts.filter(acc => acc.id !== id);
        return this.saveAccounts(accounts);
    },
    
    getAccountById(id) {
        const accounts = this.getAccounts();
        return accounts.find(acc => acc.id === id);
    },
    
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
    
    filterByGame(game) {
        const accounts = this.getAccounts();
        if (game === 'all') return accounts;
        return accounts.filter(acc => 
            acc.gameName.toLowerCase().replace(/ /g, '-') === game
        );
    },
    
    filterByPrice(range) {
        const accounts = this.getAccounts();
        if (range === 'all') return accounts;
        
        const [min, max] = range.split('-').map(Number);
        if (range.includes('+')) {
            return accounts.filter(acc => acc.price >= min);
        }
        return accounts.filter(acc => acc.price >= min && acc.price <= max);
    },
    
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
    
    getGames() {
        const accounts = this.getAccounts();
        const games = new Set(accounts.map(acc => acc.gameName));
        return Array.from(games);
    },
    
    getTotalAccounts() {
        return this.getAccounts().length;
    },
    
    getTotalGames() {
        return this.getGames().length;
    },
    
    clearAll() {
        return this.saveAccounts([]);
    }
};

// Sample data
function initSampleData() {
    const accounts = DB.getAccounts();
    if (accounts.length === 0) {
        const sampleAccounts = [
            {
                id: 1,
                code: 'ACC-0001',
                gameName: 'Free Fire',
                price: 75000,
                images: [
                    'https://picsum.photos/seed/ff1/400/300',
                    'https://picsum.photos/seed/ff2/400/300',
                    'https://picsum.photos/seed/ff3/400/300'
                ],
                specs: 'Rank: Heroic | Skin: Elite Pass Season 25 | Karakter: Alok, Kelly',
                details: 'Akun aktif, email terverifikasi, bisa login',
                whatsapp: '628123456789',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                code: 'ACC-0002',
                gameName: 'Mobile Legends',
                price: 150000,
                images: [
                    'https://picsum.photos/seed/ml1/400/300',
                    'https://picsum.photos/seed/ml2/400/300'
                ],
                specs: 'Rank: Mythical Glory | Skin: 50+ skin epic | Hero: 80+ hero',
                details: 'Akun premium, banyak koleksi skin limited',
                whatsapp: '628123456789',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                code: 'ACC-0003',
                gameName: 'PUBG',
                price: 50000,
                images: [
                    'https://picsum.photos/seed/pubg1/400/300',
                    'https://picsum.photos/seed/pubg2/400/300',
                    'https://picsum.photos/seed/pubg3/400/300'
                ],
                specs: 'Rank: Ace | Skin: M416 Glacier, Kar98k | UC: 1000',
                details: 'Akun dengan skin langka, siap pakai',
                whatsapp: '628123456789',
                createdAt: new Date().toISOString()
            }
        ];
        sampleAccounts.forEach(acc => DB.addAccount(acc));
    }
}

initSampleData();
