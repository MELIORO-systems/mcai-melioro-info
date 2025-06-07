// Hlavní aplikační logika - My AI Chat
// Verze: 2.0 - Univerzální podpora modelů

const APP_VERSION = "2.0";

// Globální proměnné
let messages = [];
let rateLimitCounter = 0;
let rateLimitTimer = null;
let knowledgeBase = "";
let agentThreadId = null;

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
    
    // Přidat uživatelovu zprávu
    if (window.uiManager) {
        window.uiManager.addMessage('user', messageText);
    }
    messages.push({ role: 'user', content: messageText });
    
    // Vyčistit input a nastavit loading stav
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.style.overflowY = 'hidden';
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
            response = await callAgentViaProxy(messageText);
        } else {
            response = await callKnowledgeViaProxy(messages);
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
            errorMessage = 'Neplatný API klíč. Zkontrolujte nastavení v Cloudflare.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Překročen limit požadavků. Zkuste to později.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Chyba připojení k internetu.';
        } else if (error.message.includes('agent') || error.message.includes('Agent')) {
            errorMessage = 'Chyba Agent API. Zkontrolujte AGENT ID v config.js.';
        }
        
        if (window.uiManager) {
            window.uiManager.addMessage('error', errorMessage);
        }
    } finally {
        // Obnovit UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = CONFIG.UI.SEND_BUTTON_TEXT;
        chatInput.focus();
    }
}

// Volání OpenAI Agent API přes proxy
async function callAgentViaProxy(userMessage) {
    console.log('🤖 Using Agent mode via proxy');
    console.log('🔗 Proxy URL:', CONFIG.PROXY.URL);
    console.log('📝 Agent ID:', CONFIG.AGENT.AGENT_ID);
    console.log('🧠 Model:', CONFIG.DEFAULT_MODEL);
    console.log('📤 Message:', userMessage.substring(0, 50) + '...');
    
    // 1. Vytvořit thread pokud neexistuje
    if (!agentThreadId) {
        console.log('🔄 Creating new thread...');
        const threadResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.AGENT}/threads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (!threadResponse.ok) {
            const errorData = await threadResponse.json();
            console.error('❌ Thread creation error:', errorData);
            throw new Error(`Agent API error: ${errorData.error || threadResponse.status}`);
        }
        
        const threadData = await threadResponse.json();
        agentThreadId = threadData.id;
        console.log('✅ Created thread:', agentThreadId);
    }
    
    // 2. Přidat zprávu
    console.log('📨 Adding message...');
    const messageResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${agentThreadId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            role: "user",
            content: userMessage
        })
    });
    
    if (!messageResponse.ok) {
        const error = await messageResponse.json();
        console.error('❌ Failed to add message:', error);
        throw new Error('Failed to add message to thread');
    }
    
    // 3. Spustit agenta
    console.log('🏃 Starting run...');
    const runResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${agentThreadId}/runs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            assistant_id: CONFIG.AGENT.AGENT_ID
        })
    });
    
    if (!runResponse.ok) {
        const errorData = await runResponse.json();
        console.error('❌ Run creation failed:', errorData);
        throw new Error(`Agent run error: ${errorData.error || runResponse.status}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    console.log('🏃 Run started with ID:', runId);
    
    // 4. Čekat na dokončení
    let runStatus = "in_progress";
    let attempts = 0;
    const maxAttempts = CONFIG.AGENT.MAX_WAIT_TIME / CONFIG.AGENT.POLLING_INTERVAL;
    
    while ((runStatus === "in_progress" || runStatus === "queued") && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.AGENT.POLLING_INTERVAL));
        attempts++;
        
        if (attempts % 4 === 1) {
            console.log(`⏳ Checking run status... (${Math.ceil(attempts * CONFIG.AGENT.POLLING_INTERVAL / 1000)}s)`);
        }
        
        const statusResponse = await fetch(
            `${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${agentThreadId}/runs/${runId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!statusResponse.ok) {
            const error = await statusResponse.json();
            console.error('❌ Status check failed:', error);
            break;
        }
        
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
        
        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
            console.error('❌ Run failed with status:', runStatus);
            throw new Error(`Agent run ${runStatus}`);
        }
    }
    
    if (attempts >= maxAttempts) {
        throw new Error('Agent timeout - took too long to respond');
    }
    
    // 5. Získat odpověď
    console.log('📩 Getting messages...');
    const messagesResponse = await fetch(
        `${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${agentThreadId}/messages`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    
    if (!messagesResponse.ok) {
        const error = await messagesResponse.json();
        console.error('❌ Failed to get messages:', error);
        throw new Error('Failed to retrieve agent response');
    }
    
    const messagesData = await messagesResponse.json();
    const agentMessages = messagesData.data.filter(msg => msg.role === 'assistant');
    
    if (agentMessages.length === 0) {
        throw new Error('Agent did not respond');
    }
    
    const lastMessage = agentMessages[0];
    const responseText = lastMessage.content[0].text.value;
    console.log('✅ Agent response received');
    
    return responseText;
}

// Volání Knowledge API přes proxy
async function callKnowledgeViaProxy(messageHistory) {
    console.log('💬 Using Knowledge mode via proxy');
    console.log('🔗 Proxy URL:', CONFIG.PROXY.URL);
    console.log('🧠 Model:', CONFIG.DEFAULT_MODEL);
    
    // Sestavit systémový prompt s knowledge base
    let systemPrompt = CONFIG.API.SYSTEM_PROMPT;
    if (knowledgeBase) {
        systemPrompt = `${CONFIG.API.SYSTEM_PROMPT}\n\n${knowledgeBase}`;
        console.log('📚 Knowledge base included in prompt');
    }
    
    // Získat max_tokens pro model
    const modelInfo = CONFIG.KNOWN_MODELS[CONFIG.DEFAULT_MODEL];
    const maxTokens = modelInfo?.max_output || CONFIG.API.MAX_TOKENS;
    
    const requestPayload = {
        model: CONFIG.DEFAULT_MODEL,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...messageHistory
        ],
        temperature: CONFIG.API.TEMPERATURE,
        max_tokens: maxTokens
    };
    
    console.log('📊 Request details:');
    console.log('  - Model:', requestPayload.model);
    console.log('  - Messages count:', requestPayload.messages.length);
    console.log('  - Temperature:', requestPayload.temperature);
    console.log('  - Max tokens:', requestPayload.max_tokens);
    
    const response = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.KNOWLEDGE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        let errorMessage = errorData.error || `Status ${response.status}`;
        if (typeof errorData.error === 'object') {
            errorMessage = errorData.error.message || errorData.error.error || JSON.stringify(errorData.error);
        }
        
        throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log('✅ Response received successfully');
    
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
        }, 60000);
    }
    
    return rateLimitCounter <= CONFIG.RATE_LIMITING.MAX_MESSAGES_PER_MINUTE;
}

// Inicializace aplikace
async function initApp() {
    console.log('🚀 Starting My AI Chat...');
    console.log('📌 App Version:', APP_VERSION);
    console.log('📌 Config Version:', CONFIG.VERSION);
    console.log('🤖 Mode:', CONFIG.MODE);
    console.log('🧠 Model:', CONFIG.DEFAULT_MODEL);
    console.log('🔐 Using proxy:', CONFIG.PROXY.URL);
    
    // Zobrazit info o modelu pokud je známý
    const modelInfo = CONFIG.KNOWN_MODELS[CONFIG.DEFAULT_MODEL];
    if (modelInfo) {
        console.log('');
        console.log(`=== ${modelInfo.name.toUpperCase()} INFO ===`);
        console.log('📝 Description:', modelInfo.description);
        if (modelInfo.context_window) {
            console.log('📊 Context window:', modelInfo.context_window.toLocaleString(), 'tokens');
        }
        if (modelInfo.max_output) {
            console.log('📤 Max output:', modelInfo.max_output.toLocaleString(), 'tokens');
        }
        console.log('========================');
    }
    
    // Načíst knowledge base pouze v knowledge režimu
    if (CONFIG.MODE === "knowledge") {
        await loadKnowledgeBase();
    } else if (CONFIG.MODE === "agent") {
        console.log('🤖 Using Agent:', CONFIG.AGENT.AGENT_ID);
    }
    
    // Načíst uložené téma
    if (window.uiManager) {
        const savedTheme = localStorage.getItem('selectedTheme');
        const themeToUse = savedTheme || CONFIG.UI.DEFAULT_THEME;
        console.log('🎨 Loading theme:', themeToUse);
        window.uiManager.setTheme(themeToUse);
    }
    
    console.log('✅ My AI Chat ready!');
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
        agentThreadId = null;
    },
    mode: CONFIG.MODE
};

// Zachování kompatibility
window.sendMessage = sendMessage;

console.log('📦 Main.js loaded successfully');
