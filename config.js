// Konfigurace aplikace - My AI Chat
// Verze: 1.3 - 2024-01-XX - Aktualizováno na GPT-4.1 Nano

const CONFIG = {
    // === VERZE KONFIGURACE ===
    VERSION: "1.3",
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
            MODEL: "gpt-4.1-nano",  // ZMĚNĚNO na GPT-4.1 Nano - nejrychlejší a nejlevnější model s velkým kontextem
            TEMPERATURE: 0.7,
            MAX_TOKENS: 32768,  // ZMĚNĚNO - zvýšeno na maximum pro GPT-4.1 Nano (32,768 tokenů)
            // Systémový prompt - definuje chování chatbota
            SYSTEM_PROMPT: "Jsi AI asistent společnosti MELIORO Systems. Odpovídáš profesionálně a přátelsky na otázky o našich službách, produktech a firmě. Vždy se snaž být konkrétní a nápomocný. Odpovídej v češtině.",
            // Nové parametry pro GPT-4.1 Nano
            CONTEXT_WINDOW: 1047576,  // Maximální velikost kontextu (1,047,576 tokenů)
            CAPABILITIES: ["chat", "analysis", "reasoning", "coding", "vision", "long-context"]
        }
    },
    
    // Nastavení pro AGENT režim
    AGENT: {
        // ID vašeho OpenAI assistanta (ano, OpenAI to stále nazývá "assistant")
        AGENT_ID: "asst_zTqY6AIGJZUprgy04VK2Bw0S",
        
        // Model pro Agent mode - GPT-4.1 Nano podporuje Assistant API
        MODEL: "gpt-4.1-nano",  // PŘIDÁNO - specifikace modelu pro agenta
        
        // Nastavení časování
        POLLING_INTERVAL: 500,  // ms mezi kontrolami stavu (500 = 2x rychlejší)
        MAX_WAIT_TIME: 30000,   // max čekání v ms (30 sekund)
        
        // JAK VYTVOŘIT AGENTA:
        // 1. Jděte na https://platform.openai.com/assistants
        // 2. Klikněte na "Create assistant"
        // 3. Vyberte model "gpt-4.1-nano" (nejrychlejší a nejlevnější)
        // 4. Nastavte KRÁTKÉ instrukce (max 500 znaků)
        // 5. Nepoužívejte tools/functions (zpomalují)
        // 6. Knowledge files max 1-2 malé soubory
        // 7. Zkopírujte Assistant ID (začíná "asst_")
        // 8. Vložte ID výše a změňte MODE na "agent"
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
        LOADING: "Přemýšlím...",
        // Nová zpráva pro info o modelu
        MODEL_INFO: "Používám GPT-4.1 Nano - nejrychlejší model s velkým kontextem"
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
    },
    
    // Informace o použitém modelu
    MODEL_INFO: {
        NAME: "GPT-4.1 Nano",
        ID: "gpt-4.1-nano",
        DESCRIPTION: "Nejrychlejší a nejlevnější model s velkým kontextem",
        CONTEXT_WINDOW: 1047576,
        MAX_OUTPUT: 32768,
        CAPABILITIES: ["chat", "analysis", "reasoning", "coding", "vision", "long-context"],
        SUPPORTS_ASSISTANT_API: true
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
