// Hlavní aplikační logika - My AI Chat - Zjednodušená verze

// Globální proměnné
let messages = [];
let rateLimitCounter = 0;
let rateLimitTimer = null;
let knowledgeBase = ""; // Uložená znalostní báze
let assistantThreadId = null; // Pro Assistant API

// Načíst znalostní bázi
async function loadKnowledgeBase() {
    if (!CONFIG.KNOWLEDGE_BASE.ENABLED) {
        console.log('📚 Knowledge base is disabled');
        return;
    }
    
    console.log('📚 Loading knowledge base...');
    let loadedFiles = 0;
    let allKnowledge = "";
    
    for (const file of CONFIG.KNOWLEDGE_BASE.FILES) {
        try {
            const filename = `${CONFIG.KNOWLEDGE_BASE.FILE_PREFIX}${file.name}.txt`;
            const response = await fetch(filename);
            
            if (response.ok) {
                const content = await response.text();
                if (content.trim()) {
                    allKnowledge += `\n\n=== ${file.description.toUpperCase()} ===\n${content}`;
                    loadedFiles++;
                    console.log(`✅ Loaded: ${filename}`);
                }
            } else {
                console.warn(`⚠️ Could not load: ${filename}`);
            }
        } catch (error) {
            console.warn(`⚠️ Error loading ${file.name}:`, error);
        }
    }
    
    if (loadedFiles > 0) {
        knowledgeBase = CONFIG.KNOWLEDGE_BASE.CONTEXT_TEMPLATE.replace('{knowledge}', allKnowledge);
        console.log(`✅ Knowledge base ready (${loadedFiles} files loaded)`);
    } else {
        console.warn('⚠️ No knowledge files were loaded');
    }
}

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
    const apiKey = CONFIG.MODE === "agent" ? CONFIG.AGENT.API_KEY : CONFIG.API.OPENAI.API_KEY;
    if (!apiKey) {
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
    chatInput.style.height = 'auto'; // Reset výšky
    chatInput.style.overflowY = 'hidden'; // Reset scrollbaru
    chatInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = CONFIG.MESSAGES.LOADING;
    
    // Přidat loading indikátor
    if (window.uiManager) {
        window.uiManager.addMessage('system', CONFIG.MESSAGES.LOADING);
    }
    
    try {
        let response;
        
        // Volání podle zvoleného režimu
        if (CONFIG.MODE === "agent") {
            response = await callAssistant(messageText);
        } else {
            response = await callOpenAI(messages);
        }
        
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
        } else if (error.message.includes('assistant') || error.message.includes('Assistant')) {
            errorMessage = 'Chyba Assistant API. Zkontrolujte ASSISTANT_ID v config.js.';
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

// Volání OpenAI Assistant API
async function callAssistant(userMessage) {
    const WORKER_URL = "https://ai-chat-proxy.pavel36.workers.dev";
    
    console.log('🔐 Using Worker for Assistant API');
    console.log('🤖 Assistant ID:', CONFIG.AGENT.ASSISTANT_ID);
    
    // 1. Vytvořit thread pokud neexistuje
    if (!assistantThreadId) {
        const threadResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                endpoint: "threads",
                method: "POST"
            })
        });
        
        if (!threadResponse.ok) {
            throw new Error(`Assistant API error: ${threadResponse.status}`);
        }
        
        const threadData = await threadResponse.json();
        assistantThreadId = threadData.id;
        console.log('📋 Created thread:', assistantThreadId);
    }
    
    // 2. Přidat zprávu do threadu
    await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            endpoint: `threads/${assistantThreadId}/messages`,
            method: "POST",
            data: {
                role: "user",
                content: userMessage
            }
        })
    });
    
    // 3. Spustit assistanta
    const runResponse = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            endpoint: `threads/${assistantThreadId}/runs`,
            method: "POST",
            data: {
                assistant_id: CONFIG.AGENT.ASSISTANT_ID
            }
        })
    });
    
    if (!runResponse.ok) {
        throw new Error(`Assistant run error: ${runResponse.status}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    
    // 4. Čekat na dokončení
    let runStatus = "in_progress";
    while (runStatus === "in_progress" || runStatus === "queued") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                endpoint: `threads/${assistantThreadId}/runs/${runId}`,
                method: "GET"
            })
        });
        
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
    }
    
    // 5. Získat odpověď
    const messagesResponse = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            endpoint: `threads/${assistantThreadId}/messages`,
            method: "GET"
        })
    });
    
    const messagesData = await messagesResponse.json();
    const lastMessage = messagesData.data[0];
    
    return lastMessage.content[0].text.value;
}

// Volání OpenAI API
async function callOpenAI(messageHistory) {
    // Vaše worker URL
    const WORKER_URL = "https://ai-chat-proxy.pavel36.workers.dev";
    
    // Sestavit systémový prompt s knowledge base
    let systemPrompt = CONFIG.API.OPENAI.SYSTEM_PROMPT;
    if (knowledgeBase) {
        systemPrompt = `${CONFIG.API.OPENAI.SYSTEM_PROMPT}\n\n${knowledgeBase}`;
    }
    
    const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: CONFIG.API.OPENAI.MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messageHistory
            ],
            temperature: CONFIG.API.OPENAI.TEMPERATURE,
            max_tokens: CONFIG.API.OPENAI.MAX_TOKENS
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Worker error:', errorData);
        throw new Error(`API error: ${response.status}`);
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
    console.log(`🤖 Mode: ${CONFIG.MODE}`);
    
    // Načíst knowledge base pouze v knowledge režimu
    if (CONFIG.MODE === "knowledge") {
        await loadKnowledgeBase();
    } else if (CONFIG.MODE === "agent") {
        console.log('🤖 Using Assistant:', CONFIG.AGENT.ASSISTANT_ID || 'Not configured');
    }
    
    // Kontrola API klíče při startu
    const apiKey = CONFIG.MODE === "agent" ? CONFIG.AGENT.API_KEY : CONFIG.API.OPENAI.API_KEY;
    if (!apiKey) {
        console.warn('⚠️ API key is not set in config.js');
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
    clearMessages: () => { 
        messages = []; 
        assistantThreadId = null; // Reset thread při clear
    },
    mode: CONFIG.MODE
};

// Zachování kompatibility
window.sendMessage = sendMessage;

console.log('📦 Main.js loaded successfully');
