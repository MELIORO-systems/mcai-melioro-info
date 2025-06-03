// Konfigurace aplikace - My AI Chat

const CONFIG = {
    // HLAVNÍ PŘEPÍNAČ REŽIMU
    MODE: "agent", // "knowledge" = s knowledge base, "agent" = vlastní agent/assistant
    
    // API nastavení pro KNOWLEDGE režim
    API: {
        OPENAI: {
            // API klíč - v produkci nahradit skutečným klíčem
            API_KEY: "sk-proj-Vc9pQxICiLuY_-OSQ6kW3T9veszAytpLLSeb7G4V0vLu1XqHY12FyZnLKO0G8XpGHVZLIhynv1T3BlbkFJoB6Bd2ySJi_Om3OvMXXxxbzxy3OUPUAt0TMvCynctupZ3DlcF057uITUBmkzEcIB0RdDVUgMkA", // Zde vložit váš OpenAI API klíč
            // Příklad: API_KEY: "sk-proj-abcd1234...",
            MODEL: "gpt-3.5-turbo",
            TEMPERATURE: 0.7,
            MAX_TOKENS: 1000,
            // Systémový prompt - definuje chování chatbota
            SYSTEM_PROMPT: "Jsi AI asistent společnosti MELIORO Systems. Odpovídáš profesionálně a přátelsky na otázky o našich službách, produktech a firmě. Vždy se snaž být konkrétní a nápomocný. Odpovídej v češtině."
        }
    },
    
    // Nastavení pro AGENT režim
    AGENT: {
        TYPE: "assistant", // "assistant" = OpenAI Assistant API, "custom-gpt" = Custom GPT (budoucnost)
        API_KEY: "", // Stejný nebo jiný API klíč pro agenta
        ASSISTANT_ID: "", // ID vašeho assistanta, např. "asst_abc123..."
        // Pro Assistant API není potřeba system prompt ani knowledge base
        // Assistant už má vše nastavené přímo v OpenAI
        
        // JAK VYTVOŘIT ASSISTANTA:
        // 1. Jděte na https://platform.openai.com/assistants
        // 2. Klikněte na "Create assistant"
        // 3. Nastavte jméno, instrukce a knowledge (soubory)
        // 4. Zkopírujte Assistant ID (začíná "asst_")
        // 5. Vložte ID výše a změňte MODE na "agent"
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
        NO_API_KEY: "API klíč není nastaven. Přidejte API klíč do souboru config.js.",
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
