// Hlavní aplikační logika - My AI Chat - Zjednodušená verze

// Globální proměnné
let messages = [];
let rateLimitCounter = 0;
let rateLimitTimer = null;

// Odeslání zprávy
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;
    
    // Kontrola rate limitingu
    if (CONFIG.RATE_LIMITING.ENABLED && !checkRateLimit()) {
        if (window.uiManager) {
            window.uiManager.addMessage('system', CONFIG.RATE_LIMITING.COOLDOWN_MESSAGE);
        }
        return;
    }
    
    // Kontrola API klíče
    if (!CONFIG.API.OPENAI.API_KEY || CONFIG.API.OPENAI.API_KEY === "") {
        if (window.uiManager) {
            window.uiManager.addMessage('error', CONFIG.MESSAGES.NO_API_KEY);
        }
        return;
    }
    
    // Přidat uživatelovu zprávu
    if (window.uiManager) {
        window.uiManager.addMessage('user', messageText);
    }
    messages.push({ role: 'user', content: messageText });
    
    // Vyčistit input a nastavit loading stav
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = CONFIG.MESSAGES.LOADING;
    
    // Přidat loading indikátor
    if (window.uiManager) {
        window.uiManager.addMessage('system', CONFIG.MESSAGES.LOADING);
    }
    
    try {
        // Volání OpenAI API
        const response = await callOpenAI(messages);
        
        // Přidat odpověď
        if (window.uiManager) {
            window.uiManager.addMessage('assistant', response);
        }
        messages.push({ role: 'assistant', content: response });
        
    } catch (error) {
        console.error('❌ Error:', error);
        let errorMessage = CONFIG.MESSAGES.ERROR;
        
        // Specifické chybové hlášky
        if (error.message.includes('401')) {
            errorMessage = 'Neplatný API klíč. Zkontrolujte nastavení.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Překročen limit požadavků. Zkuste to později.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Chyba připojení k internetu.';
        }
        
        if (window.uiManager) {
            window.uiManager.addMessage('error', errorMessage);
        }
    } finally {
        // Obnovit UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Odeslat';
        chatInput.focus();
    }
}

// Volání OpenAI API
async function callOpenAI(messageHistory) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CONFIG.API.OPENAI.API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.API.OPENAI.MODEL,
            messages: [
                {
                    role: "system",
                    content: CONFIG.API.OPENAI.SYSTEM_PROMPT
                },
                ...messageHistory
            ],
            temperature: CONFIG.API.OPENAI.TEMPERATURE,
            max_tokens: CONFIG.API.OPENAI.MAX_TOKENS
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Rate limiting
function checkRateLimit() {
    if (!CONFIG.RATE_LIMITING.ENABLED) return true;
    
    rateLimitCounter++;
    
    if (!rateLimitTimer) {
        rateLimitTimer = setTimeout(() => {
            rateLimitCounter = 0;
            rateLimitTimer = null;
        }, 60000); // Reset po minutě
    }
    
    return rateLimitCounter <= CONFIG.RATE_LIMITING.MAX_MESSAGES_PER_MINUTE;
}

// Inicializace aplikace
async function initApp() {
    console.log('🚀 Starting My AI Chat...');
    
    // Kontrola API klíče při startu
    if (!CONFIG.API.OPENAI.API_KEY) {
        console.warn('⚠️ OpenAI API key is not set in config.js');
    }
    
    // Nastavit téma
    if (window.uiManager) {
        window.uiManager.setTheme(CONFIG.UI.DEFAULT_THEME);
    }
    
    // Zobrazit welcome screen
    if (window.uiManager) {
        window.uiManager.showWelcomeScreen();
    }
    
    // Nastavit title a subtitle
    const titleElement = document.querySelector('.chat-header h1 a');
    const subtitleElement = document.querySelector('.header-subtitle');
    const reloadButton = document.querySelector('.index-button');
    
    if (titleElement) titleElement.textContent = CONFIG.UI.APP_TITLE;
    if (subtitleElement) subtitleElement.textContent = CONFIG.UI.APP_SUBTITLE;
    if (reloadButton) {
        reloadButton.textContent = CONFIG.UI.RELOAD_BUTTON_TEXT;
        reloadButton.style.display = CONFIG.UI.SHOW_RELOAD_BUTTON ? 'block' : 'none';
    }
    
    console.log('✅ My AI Chat ready');
}

// Spuštění aplikace
window.addEventListener('load', function() {
    console.log('🌟 Window loaded, starting app...');
    setTimeout(initApp, 100);
});

// Export pro testování
window.chatSystem = {
    messages: messages,
    sendMessage: sendMessage,
    config: CONFIG,
    clearMessages: () => { messages = []; }
};

// Zachování kompatibility
window.sendMessage = sendMessage;

console.log('📦 Main.js loaded successfully');
