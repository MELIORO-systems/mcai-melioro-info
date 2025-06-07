// Konfigurace aplikace - My AI Chat
// Verze: 2.0 - Univerzální konfigurace pro různé modely

const CONFIG = {
    // === VERZE KONFIGURACE ===
    VERSION: "2.0",
    LAST_UPDATE: new Date().toISOString(),
    
    // === HLAVNÍ NASTAVENÍ MODELU ===
    // Zde jednoduše změňte model podle potřeby
    DEFAULT_MODEL: "gpt-4.1-nano",  // Změňte zde pro jiný model (gpt-4, gpt-3.5-turbo, atd.)
    
    // === REŽIM APLIKACE ===
    MODE: "agent", // "knowledge" = s knowledge base | "agent" = vlastní assistant
    
    // === PROXY NASTAVENÍ ===
    PROXY: {
        URL: "https://ai-chat-proxy.pavel-2ce.workers.dev",
        ENDPOINTS: {
            KNOWLEDGE: "/knowledge",
            AGENT: "/agent"
        }
    },
    
    // === API NASTAVENÍ ===
    API: {
        TEMPERATURE: 0.7,      // Kreativita odpovědí (0-1)
        MAX_TOKENS: 4096,      // Max délka odpovědi (přizpůsobí se modelu)
        
        // Systémový prompt
        SYSTEM_PROMPT: "Jsi AI asistent společnosti MELIORO Systems. Odpovídáš profesionálně a přátelsky na otázky o našich službách, produktech a firmě. Vždy se snaž být konkrétní a nápomocný. Odpovídej v češtině."
    },
    
    // === AGENT NASTAVENÍ ===
    AGENT: {
        // ID vašeho OpenAI assistanta
        AGENT_ID: "asst_zTqY6AIGJZUprgy04VK2Bw0S",
        
        // Časování
        POLLING_INTERVAL: 500,  // ms mezi kontrolami stavu
        MAX_WAIT_TIME: 30000,   // max čekání v ms (30 sekund)
    },
    
    // === UI NASTAVENÍ ===
    UI: {
        DEFAULT_THEME: "claude",
        
        // Texty v aplikaci
        PAGE_TITLE: "AI Chat Assistant",
        APP_TITLE: "My AI Chat",
        APP_SUBTITLE: "Váš inteligentní asistent",
        
        // Tlačítka
        RELOAD_BUTTON_TEXT: "Reload",
        RELOAD_BUTTON_TOOLTIP: "Znovu načíst chat",
        SEND_BUTTON_TEXT: "Odeslat",
        SHOW_RELOAD_BUTTON: true,
        
        // Input
        INPUT_PLACEHOLDER: "Napište svůj dotaz...",
        
        // Témata
        THEMES: {
            claude: {
                name: "Claude",
                tooltip: "Claude téma",
                description: "Výchozí světlé téma"
            },
            google: {
                name: "Google", 
                tooltip: "Google téma",
                description: "Čisté téma ve stylu Google"
            },
            replit: {
                name: "Replit",
                tooltip: "Tmavé téma",
                description: "Tmavé téma pro noční práci"
            },
            carrd: {
                name: "Carrd",
                tooltip: "Carrd téma",
                description: "Moderní téma s neonovými akcenty"
            }
        },
        
        // Patička
        FOOTER: {
            POWERED_BY_TEXT: "Powered by",
            COMPANY_NAME: "MELIORO Systems",
            COMPANY_URL: "http://melioro.cz",
            RETURN_TEXT: "Návrat na stránky",
            RETURN_LINK_TEXT: "MELIORO"
        }
    },
    
    // === PŘÍKLADY DOTAZŮ ===
    EXAMPLE_QUERIES: [
        "Jaké služby nabízíte?",
        "Jak vás mohu kontaktovat?",
        "Jaké jsou vaše ceny?",
        "Kde sídlíte?",
        "Jaké máte reference?",
        "Jak dlouho jste na trhu?"
    ],
    
    // === ZPRÁVY APLIKACE ===
    MESSAGES: {
        WELCOME_TITLE: "Vítejte v AI Chatu",
        WELCOME_SUBTITLE: "Zeptejte se mě na cokoliv o našich službách a produktech",
        ERROR: "Omlouvám se, nastala chyba. Zkuste to prosím znovu.",
        NO_API_KEY: "Chyba konfigurace. Kontaktujte prosím správce.",
        LOADING: "Přemýšlím..."
    },
    
    // === KNOWLEDGE BASE ===
    KNOWLEDGE_BASE: {
        ENABLED: true,
        FILE_PREFIX: "knowledge-",
        FILES: [
            { name: "company", description: "Informace o společnosti" },
            { name: "services", description: "Naše služby" },
            { name: "products", description: "Naše produkty" },
            { name: "contacts", description: "Kontaktní údaje" }
        ],
        CONTEXT_TEMPLATE: "Zde jsou informace o naší společnosti, které používej při odpovídání:\n\n{knowledge}\n\nVždy odpovídej na základě těchto informací."
    },
    
    // === RATE LIMITING ===
    RATE_LIMITING: {
        ENABLED: true,
        MAX_MESSAGES_PER_MINUTE: 10,
        COOLDOWN_MESSAGE: "Příliš mnoho dotazů. Počkejte prosím chvíli."
    },
    
    // === ZNÁMÉ MODELY (pro referenci) ===
    // Toto je pouze informativní seznam - aplikace bude fungovat s jakýmkoli modelem
    KNOWN_MODELS: {
        "gpt-4.1-nano": {
            name: "GPT-4.1 Nano",
            description: "Nejrychlejší a nejlevnější model s velkým kontextem",
            context_window: 1047576,
            max_output: 32768
        },
        "gpt-4": {
            name: "GPT-4",
            description: "Nejvýkonnější model",
            context_window: 8192,
            max_output: 4096
        },
        "gpt-4-turbo": {
            name: "GPT-4 Turbo",
            description: "Rychlejší verze GPT-4",
            context_window: 128000,
            max_output: 4096
        },
        "gpt-3.5-turbo": {
            name: "GPT-3.5 Turbo",
            description: "Rychlý a cenově efektivní",
            context_window: 16385,
            max_output: 4096
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
