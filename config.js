// Konfigurace aplikace - My AI Chat

const CONFIG = {
    // API nastavení
    API: {
        OPENAI: {
            // API klíč - v produkci nahradit skutečným klíčem
            API_KEY: "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", // Zde vložit váš OpenAI API klíč
            // Příklad: API_KEY: "sk-proj-abcd1234...",
            MODEL: "gpt-3.5-turbo",
            TEMPERATURE: 0.7,
            MAX_TOKENS: 1000,
            // Systémový prompt - definuje chování chatbota
            SYSTEM_PROMPT: "Jsi AI asistent společnosti MELIORO Systems. Odpovídáš profesionálně a přátelsky na otázky o našich službách, produktech a firmě. Vždy se snaž být konkrétní a nápomocný. Odpovídej v češtině."
        }
    },
    
    // UI nastavení
    UI: {
        DEFAULT_THEME: "claude", // claude, google, replit
        APP_TITLE: "My AI Chat",
        APP_SUBTITLE: "Váš inteligentní asistent",
        RELOAD_BUTTON_TEXT: "Reload",
        SHOW_RELOAD_BUTTON: true
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
        NO_API_KEY: "API klíč není nastaven. Přidejte váš OpenAI API klíč do souboru config.js.",
        LOADING: "Přemýšlím..."
    },
    
    // Budoucí rozšíření - znalostní báze
    KNOWLEDGE_BASE: {
        ENABLED: false,
        SOURCES: [
            // {type: "text", path: "./knowledge/about-us.txt"},
            // {type: "text", path: "./knowledge/services.txt"},
            // {type: "text", path: "./knowledge/products.txt"},
            // {type: "pdf", path: "./knowledge/catalog.pdf"}
        ]
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
