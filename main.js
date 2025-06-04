// Hlavní aplikační logika - My AI Chat - Verze s proxy
// Verze: 1.2 - 2024-01-XX - Rozšířené logování pro Assistant mode

const APP_VERSION = "1.2";

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
        
        // Volání podle zvoleného režimu - NYNí PŘES PROXY
        if (CONFIG.MODE === "agent") {
            response = await callAssistantViaProxy(messageText);
        } else {
            response = await callOpenAIViaProxy(messages);
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

// Volání OpenAI Assistant API přes proxy
async function callAssistantViaProxy(userMessage) {
    console.log('🤖 Using Assistant mode via proxy');
    console.log('🔗 Proxy URL:', CONFIG.PROXY.URL);
    console.log('📝 Assistant ID:', CONFIG.AGENT.ASSISTANT_ID);
    console.log('📤 Message:', userMessage.substring(0, 50) + '...');
    
    // 1. Vytvořit thread pokud neexistuje
    if (!assistantThreadId) {
        console.log('🔄 Creating new thread...');
        const threadResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.ASSISTANT}/threads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        console.log('📥 Thread creation response:', threadResponse.status);
        
        if (!threadResponse.ok) {
            const errorData = await threadResponse.json();
            console.error('❌ Thread creation error:', errorData);
            throw new Error(`Assistant API error: ${errorData.error || threadResponse.status}`);
        }
        
        const threadData = await threadResponse.json();
        assistantThreadId = threadData.id;
        console.log('✅ Created thread:', assistantThreadId);
    }
    
    // 2. Přidat zprávu do threadu
    console.log('📨 Adding message to thread...');
    const messageResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.ASSISTANT}/threads/${assistantThreadId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            role: "user",
            content: userMessage
        })
    });
    
    console.log('📥 Message add response:', messageResponse.status);
    if (!messageResponse.ok) {
        const error = await messageResponse.json();
        console.error('❌ Failed to add message:', error);
    }
    
    // 3. Spustit assistanta
    console.log('🚀 Starting assistant run...');
    const runResponse = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.ASSISTANT}/threads/${assistantThreadId}/runs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            assistant_id: CONFIG.AGENT.ASSISTANT_ID
        })
    });
    
    if (!runResponse.ok) {
        const errorData = await runResponse.json();
        throw new Error(`Assistant run error: ${errorData.error || runResponse.status}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    
    // 4. Čekat na dokončení
    let runStatus = "in_progress";
    while (runStatus === "in_progress" || runStatus === "queued") {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Čekat 1s
        
        const statusResponse = await fetch(
            `${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.ASSISTANT}/threads/${assistantThreadId}/runs/${runId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
    }
    
    // 5. Získat odpověď
    const messagesResponse = await fetch(
        `${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.ASSISTANT}/threads/${assistantThreadId}/messages`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    
    console.log('📥 Messages response:', messagesResponse.status);
    if (!messagesResponse.ok) {
        const error = await messagesResponse.json();
        console.error('❌ Failed to get messages:', error);
        throw new Error('Failed to retrieve assistant response');
    }
    
    const messagesData = await messagesResponse.json();
    console.log('📬 Retrieved messages count:', messagesData.data.length);
    
    // Najít poslední zprávu od assistanta
    const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
    console.log('🤖 Assistant messages found:', assistantMessages.length);
    
    if (assistantMessages.length === 0) {
        console.error('❌ No assistant response found');
        console.log('All messages:', messagesData.data.map(m => ({role: m.role, content: m.content[0]?.text?.value?.substring(0, 50)})));
        throw new Error('Assistant did not respond');
    }
    
    const lastMessage = assistantMessages[0]; // Nejnovější je první
    const responseText = lastMessage.content[0].text.value;
    console.log('✅ Assistant response received:', responseText.substring(0, 100) + '...');
    
    return responseText;
}

// Volání OpenAI API přes proxy
async function callOpenAIViaProxy(messageHistory) {
    console.log('💬 Using Knowledge mode via proxy');
    console.log('🔗 Proxy URL:', CONFIG.PROXY.URL);
    console.log('📤 Sending request to:', `${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.CHAT}`);
    
    // Sestavit systémový prompt s knowledge base
    let systemPrompt = CONFIG.API.OPENAI.SYSTEM_PROMPT;
    if (knowledgeBase) {
        systemPrompt = `${CONFIG.API.OPENAI.SYSTEM_PROMPT}\n\n${knowledgeBase}`;
        console.log('📚 Knowledge base included in prompt');
    }
    
    const requestPayload = {
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
    };
    
    console.log('📊 Request details:');
    console.log('  - Model:', requestPayload.model);
    console.log('  - Messages count:', requestPayload.messages.length);
    console.log('  - Temperature:', requestPayload.temperature);
    console.log('  - Max tokens:', requestPayload.max_tokens);
    
    const response = await fetch(`${CONFIG.PROXY.URL}${CONFIG.PROXY.ENDPOINTS.CHAT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error details:', errorData);
        console.error('❌ Full error:', JSON.stringify(errorData, null, 2));
        
        // Specifické chyby podle odpovědi
        let errorMessage = errorData.error || `Status ${response.status}`;
        if (typeof errorData.error === 'object') {
            errorMessage = errorData.error.message || errorData.error.error || JSON.stringify(errorData.error);
        }
        
        throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log('✅ Response received successfully');
    console.log('📝 Response preview:', data.choices[0].message.content.substring(0, 100) + '...');
    
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
    console.log(`🔐 Using proxy: ${CONFIG.PROXY.URL}`);
    
    // Načíst knowledge base pouze v knowledge režimu
    if (CONFIG.MODE === "knowledge") {
        await loadKnowledgeBase();
    } else if (CONFIG.MODE === "agent") {
        console.log('🤖 Using Assistant:', CONFIG.AGENT.ASSISTANT_ID || 'Not configured');
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
    
    console.log('✅ My AI Chat ready with proxy protection');
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
