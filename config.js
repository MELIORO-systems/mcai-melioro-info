// Konfigurace aplikace - My AI Chat
// Verze: 1.2 - 2024-01-XX - Sjednocené názvy knowledge/agent

const CONFIG = {
    // === VERZE KONFIGURACE ===
    VERSION: "1.2",
    LAST_UPDATE: new Date().toISOString(),
    // HLAVNÍ PŘEPÍNAČ REŽIMU
    MODE: "agent", // "knowledge" = s knowledge base (používá OPENAI_API_KEY_KNOWLEDGE)
                      // "agent" = vlastní assistant (používá OPENAI_API_KEY_AGENT)
    
    // === PROXY NASTAVENÍ ===
    PROXY: {
        // URL vašeho Cloudflare Workeru
        URL: "https://ai-chat-proxy.pavel-2ce.workers.dev",
        
        // Endpoints pro různé služby
        ENDPOINTS: {
            KNOWLEDGE: "/knowledge",         // Pro knowledge mode
            AGENT: "/agent"                  // Pro agent mode
        }
    },
    
    // API nastavení pro KNOWLEDGE režim
    API: {
        OPENAI: {
            // API klíč je nyní bezpečně uložen v Cloudflare Worker
            // API_KEY: "sk-proj-...", // ODSTRANĚNO - není potřeba
            MODEL: "gpt-4o-mini",  // Změněno z gpt-3.5-turbo
            TEMPERATURE: 0.7,
            MAX_TOKENS: 1000,
            // Systémový prompt - definuje chování chatbota
            SYSTEM_PROMPT: "Jsi AI asistent společnosti MELIORO Systems. Odpovídáš profesionálně a přátelsky na otázky o našich službách, produktech a firmě. Vždy se snaž být konkrétní a nápomocný. Odpovídej v češtině."
        }
    },
    
    // Nastavení pro AGENT režim
    AGENT: {
        // ID vašeho OpenAI assistanta (ano, OpenAI to stále nazývá "assistant")
        AGENT_ID: "asst_zTqY6AIGJZUprgy04VK2Bw0S",
        
        // Nastavení časování
        POLLING_INTERVAL: 500,  // ms mezi kontrolami stavu (500 = 2x rychlejší)
        MAX_WAIT_TIME: 30000,   // max čekání v ms (30 sekund)
        
        // JAK VYTVOŘIT AGENTA:
        // 1. Jděte na https://platform.openai.com/assistants
        // 2. Klikněte na "Create assistant"
        // 3. Nastavte KRÁTKÉ instrukce (max 500 znaků)
        // 4. Nepoužívejte tools/functions (zpomalují)
        // 5. Knowledge files max 1-2 malé soubory
        // 6. Zkopírujte Assistant ID (začíná "asst_")
        // 7. Vložte ID výše a změňte MODE na "agent"
    },
    
    // UI nastavení
    UI: {
        DEFAULT_THEME: "claude", // claude, google, replit, carrd
        
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
    
    // Příklady dotazů na úvodní obrazovce
    EXAMPLE_QUERIES: [
        "Jaké služby nabízíte?",
        "Jak vás mohu kontaktovat?",
        "Jaké jsou vaše ceny?",
        "Kde sídlíte?",
        "Jaké máte reference?",
        "Jak dlouho jste na trhu?"
    ],
    
    // Zprávy aplikace
    MESSAGES: {
        WELCOME_TITLE: "Vítejte v AI Chatu",
        WELCOME_SUBTITLE: "Zeptejte se mě na cokoliv o našich službách a produktech",
        ERROR: "Omlouvám se, nastala chyba. Zkuste to prosím znovu.",
        NO_API_KEY: "Chyba konfigurace. Kontaktujte prosím správce.",
        LOADING: "Přemýšlím..."
    },
    
    // Znalostní báze
    KNOWLEDGE_BASE: {
        ENABLED: true,
        FILE_PREFIX: "knowledge-",
        FILES: [
            { name: "company", description: "Informace o společnosti" },
            { name: "services", description: "Naše služby" },
            { name: "products", description: "Naše produkty" },
            { name: "contacts", description: "Kontaktní údaje" }
        ],
        // Jak prezentovat knowledge v promptu
        CONTEXT_TEMPLATE: "Zde jsou informace o naší společnosti, které používej při odpovídání:\n\n{knowledge}\n\nVždy odpovídej na základě těchto informací."
    },
    
    // Ochrana proti spamu
    RATE_LIMITING: {
        ENABLED: true,
        MAX_MESSAGES_PER_MINUTE: 10,
        COOLDOWN_MESSAGE: "Příliš mnoho dotazů. Počkejte prosím chvíli."
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
