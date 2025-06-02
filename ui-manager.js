// UI Manager - My AI Chat - Zjednodušená verze
class UIManager {
    constructor() {
        this.currentTheme = CONFIG.UI.DEFAULT_THEME || 'claude';
        this.themes = {
            claude: {
                name: 'Claude',
                description: 'Výchozí světlé téma'
            },
            google: {
                name: 'Google',
                description: 'Čisté téma ve stylu Google'
            },
            replit: {
                name: 'Replit',
                description: 'Tmavé téma pro noční práci'
            }
        };
        
        this.initialized = false;
    }
    
    // Načíst téma z localStorage
    loadTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || this.currentTheme;
        this.setTheme(savedTheme);
    }
    
    // Nastavit téma
    setTheme(themeKey) {
        if (!this.themes[themeKey]) {
            console.warn(`Theme ${themeKey} not found, using claude`);
            themeKey = 'claude';
        }
        
        // Odstranit všechny theme třídy
        document.body.classList.remove('theme-claude', 'theme-google', 'theme-replit');
        
        // Přidat třídu jen pro non-claude témata (claude je výchozí)
        if (themeKey !== 'claude') {
            document.body.classList.add(`theme-${themeKey}`);
        }
        
        // Uložit do localStorage
        localStorage.setItem('selectedTheme', themeKey);
        this.currentTheme = themeKey;
        
        // Aktualizovat theme selector
        this.updateThemeSelector();
        
        console.log(`🎨 Theme changed to: ${themeKey}`);
    }
    
    // Aktualizovat theme selector v UI
    updateThemeSelector() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.theme-${this.currentTheme}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    // Zobrazit welcome screen
    showWelcomeScreen() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Vymazat historii zpráv při návratu na index
        if (window.chatSystem && window.chatSystem.clearMessages) {
            window.chatSystem.clearMessages();
        }
        
        chatMessages.innerHTML = `
            <div class="welcome-container">
                <div class="welcome-content">
                    <h2 class="welcome-title">${CONFIG.MESSAGES.WELCOME_TITLE}</h2>
                    <p class="welcome-subtitle">${CONFIG.MESSAGES.WELCOME_SUBTITLE}</p>
                </div>
                <div class="example-queries" id="example-queries">
                    <!-- Příklady budou načteny dynamicky -->
                </div>
            </div>
        `;
        
        this.loadExampleQueries();
    }
    
    // Načíst příklady dotazů
    loadExampleQueries() {
        const exampleQueriesContainer = document.getElementById('example-queries');
        if (!exampleQueriesContainer) return;
        
        const examples = CONFIG.EXAMPLE_QUERIES || [];
        
        exampleQueriesContainer.innerHTML = examples.map(query => `
            <div class="example-query" onclick="uiManager.clickExampleQuery('${query.replace(/'/g, "\\'")}')">
                ${query}
            </div>
        `).join('');
    }
    
    // Klik na příklad dotazu
    clickExampleQuery(query) {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        chatInput.value = query;
        chatInput.focus();
        
        // Auto-resize textarea
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        
        // Skrýt welcome screen
        this.hideWelcomeScreen();
    }
    
    // Skrýt welcome screen
    hideWelcomeScreen() {
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) {
            welcomeContainer.style.display = 'none';
        }
    }
    
    // Přidat zprávu do chatu
    addMessage(role, content) {
        console.log('Adding message:', role, content.substring(0, 50) + '...');
        
        // Odstranit loading zprávu pokud přidáváme assistant zprávu
        if (role === 'assistant') {
            const loadingMessages = document.querySelectorAll('.system-message');
            loadingMessages.forEach(msg => {
                if (msg.textContent === CONFIG.MESSAGES.LOADING) {
                    msg.remove();
                }
            });
        }
        
        // Skrýt welcome screen při první zprávě
        if (role === 'user' || role === 'assistant') {
            this.hideWelcomeScreen();
        }
        
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + role + '-message';
        
        // Zpracovat markdown pro tučný text
        if (content.includes('**')) {
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }
        
        chatMessages.appendChild(messageElement);
        
        // Scrollovat dolů
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }
    
    // Inicializace UI
    initialize() {
        if (this.initialized) {
            console.log('🎨 UI Manager already initialized');
            return;
        }
        
        console.log('🎨 UI Manager initializing...');
        
        // Načíst téma
        this.loadTheme();
        
        // Zobrazit welcome screen
        setTimeout(() => {
            this.showWelcomeScreen();
        }, 100);
        
        this.initialized = true;
        console.log('🎨 UI Manager ready');
    }
}

// Globální instance
const uiManager = new UIManager();

// Export pro ostatní moduly
if (typeof window !== 'undefined') {
    window.uiManager = uiManager;
}

// Inicializace při načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    uiManager.initialize();
});

console.log('📦 UI Manager loaded');
