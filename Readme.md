# 🤖 My AI Chat - Inteligentní chatbot pro vaši firmu

Profesionální AI chatbot s podporou OpenAI API, bezpečným proxy řešením a moderním uživatelským rozhraním. Nyní poháněný nejnovějším modelem **GPT-4.1 Nano** s masivním kontextem až 1 milion tokenů!

## 🚀 Co je nového

### GPT-4.1 Nano
- **Nejrychlejší model** od OpenAI s velkým kontextem
- **Context window**: 1,047,576 tokenů (250x větší než GPT-3.5)
- **Max output**: 32,768 tokenů
- **Capabilities**: chat, analysis, reasoning, coding, vision, long-context
- **Plná podpora Assistant API**

## 📋 Obsah

- [Funkce](#-funkce)
- [Jak to funguje](#-jak-to-funguje)
- [Instalace](#-instalace)
- [Konfigurace](#-konfigurace)
- [Cloudflare Worker](#-cloudflare-worker)
- [Knowledge Base](#-knowledge-base)
- [Témata](#-témata)
- [Řešení problémů](#-řešení-problémů)

## ✨ Funkce

- **🔐 Bezpečné API volání** - API klíče jsou bezpečně uloženy v Cloudflare Worker
- **🎭 Dva režimy provozu** - Knowledge (rychlé FAQ) nebo Agent (pokročilé konverzace)
- **🧠 GPT-4.1 Nano** - Nejnovější a nejrychlejší model s obrovským kontextem
- **🎨 4 barevná témata** - Claude, Google, Replit, Carrd
- **📱 Plně responzivní** - Funguje na všech zařízeních
- **📚 Knowledge Base** - Vlastní znalostní báze z textových souborů
- **⚡ Rate limiting** - Ochrana proti spamu
- **💾 Pamatuje si nastavení** - Ukládá preferované téma
- **🌐 Snadná integrace** - Stačí nahrát na web a nakonfigurovat

## 🔧 Jak to funguje

### Architektura systému

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Cloudflare  │────▶│  OpenAI API     │
│  (HTML/JS)  │◀────│    Worker    │◀────│  GPT-4.1 Nano   │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                                          
       ▼                                          
┌─────────────┐                                   
│  Knowledge  │                                   
│    Base     │                                   
│ (.txt files)│                                   
└─────────────┘                                   
```

### Dva režimy provozu

#### 1. **Knowledge Mode** (Výchozí)
- Používá OpenAI Chat Completions API s GPT-4.1 Nano
- Načítá lokální textové soubory s informacemi
- Rychlé odpovědi na časté dotazy
- Ideální pro FAQ a základní podporu
- Využívá obrovský kontext modelu pro komplexní znalostní báze

#### 2. **Agent Mode**
- Používá OpenAI Assistants API s GPT-4.1 Nano
- Vytváří konverzační vlákna (threads)
- Pokročilejší schopnosti a delší paměť
- Vhodné pro komplexní dotazy
- Automaticky využívá plný kontext modelu

## 📦 Instalace

### 1. Stažení souborů

```bash
# Stáhněte všechny soubory projektu
git clone https://github.com/yourusername/my-ai-chat.git
cd my-ai-chat
```

### 2. Struktura souborů

```
my-ai-chat/
├── index.html          # Hlavní HTML soubor
├── style.css           # Styly aplikace
├── config.js           # Konfigurace (GPT-4.1 Nano)
├── main.js             # Hlavní logika
├── ui-manager.js       # Správa UI
├── knowledge-company.txt    # Info o firmě
├── knowledge-services.txt   # Seznam služeb
├── knowledge-products.txt   # Seznam produktů
└── knowledge-contacts.txt   # Kontakty
```

### 3. Nasazení Cloudflare Worker

1. Vytvořte účet na [Cloudflare](https://dash.cloudflare.com/)
2. Vytvořte nový Worker
3. Vložte kód proxy (viz sekce [Cloudflare Worker](#-cloudflare-worker))
4. Nastavte environment variables:
   - `OPENAI_API_KEY_KNOWLEDGE` - API klíč pro Knowledge mode
   - `OPENAI_API_KEY_AGENT` - API klíč pro Agent mode

### 4. Nahrání na web

Nahrajte všechny soubory na váš webhosting nebo GitHub Pages.

## ⚙️ Konfigurace

Veškerá konfigurace se provádí v souboru `config.js`:

### Základní nastavení

```javascript
const CONFIG = {
    // Verze konfigurace
    VERSION: "1.3",
    
    // HLAVNÍ PŘEPÍNAČ REŽIMU
    MODE: "knowledge",  // "knowledge" nebo "agent"
    
    // === PROXY NASTAVENÍ ===
    PROXY: {
        // URL vašeho Cloudflare Workeru
        URL: "https://your-worker.workers.dev",
        
        // Endpoints pro různé služby
        ENDPOINTS: {
            KNOWLEDGE: "/knowledge",
            AGENT: "/agent"
        }
    }
}
```

### Knowledge Mode nastavení s GPT-4.1 Nano

```javascript
API: {
    OPENAI: {
        MODEL: "gpt-4.1-nano",  // Nejnovější model!
        TEMPERATURE: 0.7,       // Kreativita odpovědí (0-1)
        MAX_TOKENS: 32768,      // Max délka odpovědi (32K tokenů!)
        CONTEXT_WINDOW: 1047576, // Obrovský kontext (1M+ tokenů!)
        
        // Systémový prompt - definuje chování chatbota
        SYSTEM_PROMPT: "Jsi AI asistent společnosti..."
    }
}
```

**Vysvětlení parametrů GPT-4.1 Nano:**
- **MODEL**: `gpt-4.1-nano` - nejrychlejší a nejlevnější model s velkým kontextem
- **TEMPERATURE**: 0.7 - vyvážená kreativita
- **MAX_TOKENS**: 32,768 - maximální podporovaná délka odpovědi
- **CONTEXT_WINDOW**: 1,047,576 - můžete zpracovat obrovské dokumenty!
- **SYSTEM_PROMPT**: Základní instrukce pro AI (osobnost, pravidla)

### Agent Mode nastavení s GPT-4.1 Nano

```javascript
AGENT: {
    // ID vašeho OpenAI assistanta
    AGENT_ID: "asst_xxxxxxxxxxxxx",
    
    // Model pro Agent mode
    MODEL: "gpt-4.1-nano",  // Explicitní nastavení modelu
    
    // Nastavení časování
    POLLING_INTERVAL: 500,  // ms mezi kontrolami stavu
    MAX_WAIT_TIME: 30000,   // max čekání na odpověď (30s)
}
```

**Vysvětlení parametrů:**
- **AGENT_ID**: Získáte na https://platform.openai.com/assistants
- **MODEL**: Specifikuje použití GPT-4.1 Nano pro agenta
- **POLLING_INTERVAL**: Jak často kontrolovat, zda agent odpověděl
- **MAX_WAIT_TIME**: Po této době vyprší timeout

### Informace o modelu

```javascript
MODEL_INFO: {
    NAME: "GPT-4.1 Nano",
    ID: "gpt-4.1-nano",
    DESCRIPTION: "Nejrychlejší a nejlevnější model s velkým kontextem",
    CONTEXT_WINDOW: 1047576,
    MAX_OUTPUT: 32768,
    CAPABILITIES: ["chat", "analysis", "reasoning", "coding", "vision", "long-context"],
    SUPPORTS_ASSISTANT_API: true
}
```

### UI nastavení

```javascript
UI: {
    DEFAULT_THEME: "claude",  // Výchozí téma
    
    // Texty v aplikaci
    PAGE_TITLE: "AI Chat Assistant",
    APP_TITLE: "My AI Chat",
    APP_SUBTITLE: "Váš inteligentní asistent",
    
    // Tlačítka
    RELOAD_BUTTON_TEXT: "Reload",
    SEND_BUTTON_TEXT: "Odeslat",
    SHOW_RELOAD_BUTTON: true,
    
    // Input
    INPUT_PLACEHOLDER: "Napište svůj dotaz...",
    
    // Patička
    FOOTER: {
        POWERED_BY_TEXT: "Powered by",
        COMPANY_NAME: "Vaše firma",
        COMPANY_URL: "https://vase-firma.cz",
        RETURN_TEXT: "Návrat na stránky",
        RETURN_LINK_TEXT: "FIRMA"
    }
}
```

### Příklady dotazů

```javascript
EXAMPLE_QUERIES: [
    "Jaké služby nabízíte?",
    "Jak vás mohu kontaktovat?",
    "Jaké jsou vaše ceny?",
    // Přidejte vlastní příklady...
]
```

### Zprávy aplikace

```javascript
MESSAGES: {
    WELCOME_TITLE: "Vítejte v AI Chatu",
    WELCOME_SUBTITLE: "Zeptejte se mě na cokoliv",
    ERROR: "Omlouvám se, nastala chyba.",
    LOADING: "Přemýšlím...",
    MODEL_INFO: "Používám GPT-4.1 Nano - nejrychlejší model s velkým kontextem"
}
```

### Knowledge Base nastavení

```javascript
KNOWLEDGE_BASE: {
    ENABLED: true,
    FILE_PREFIX: "knowledge-",
    FILES: [
        { name: "company", description: "Informace o společnosti" },
        { name: "services", description: "Naše služby" },
        { name: "products", description: "Naše produkty" },
        { name: "contacts", description: "Kontaktní údaje" }
    ]
}
```

**Tip pro GPT-4.1 Nano**: Díky obrovskému kontextu můžete nahrát mnohem větší knowledge base soubory než dříve!

### Rate limiting

```javascript
RATE_LIMITING: {
    ENABLED: true,              // true/false - zapnout/vypnout ochranu
    MAX_MESSAGES_PER_MINUTE: 10, // Max počet zpráv za minutu
    COOLDOWN_MESSAGE: "Příliš mnoho dotazů. Počkejte prosím chvíli."
}
```

## ☁️ Cloudflare Worker

Worker je aktualizován pro podporu GPT-4.1 Nano. Vytvořte Worker s následujícím kódem:

```javascript
export default {
    async fetch(request, env) {
        // CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        };

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers });
        }

        const url = new URL(request.url);
        
        try {
            // Knowledge endpoint
            if (url.pathname === '/knowledge' && request.method === 'POST') {
                const body = await request.json();
                
                // Validace modelu - zajistíme, že se používá GPT-4.1 Nano
                if (body.model && body.model !== 'gpt-4.1-nano') {
                    console.log(`Model změněn z ${body.model} na gpt-4.1-nano`);
                    body.model = 'gpt-4.1-nano';
                }
                
                // Validace max_tokens
                if (body.max_tokens && body.max_tokens > 32768) {
                    body.max_tokens = 32768;
                }
                
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.OPENAI_API_KEY_KNOWLEDGE}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                const data = await response.json();
                
                // Přidáme info o modelu
                data._model_info = {
                    model: 'gpt-4.1-nano',
                    context_window: 1047576,
                    max_output: 32768
                };
                
                return new Response(JSON.stringify(data), { headers });
            }
            
            // Agent endpoints
            if (url.pathname.startsWith('/agent')) {
                const openaiUrl = 'https://api.openai.com/v1' + 
                    url.pathname.replace('/agent', '/assistants');
                
                let body = null;
                if (request.method !== 'GET' && request.body) {
                    body = await request.json();
                    
                    // Pro vytváření runů specifikujeme GPT-4.1 Nano
                    if (openaiUrl.includes('/runs') && request.method === 'POST') {
                        body.model = 'gpt-4.1-nano';
                        if (!body.max_completion_tokens) {
                            body.max_completion_tokens = 32768;
                        }
                    }
                }
                
                const response = await fetch(openaiUrl, {
                    method: request.method,
                    headers: {
                        'Authorization': `Bearer ${env.OPENAI_API_KEY_AGENT}`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'assistants=v2',
                    },
                    body: body ? JSON.stringify(body) : undefined,
                });

                const data = await response.json();
                return new Response(JSON.stringify(data), { headers });
            }

            return new Response('Not found', { status: 404, headers });
            
        } catch (error) {
            return new Response(
                JSON.stringify({ error: error.message }), 
                { status: 500, headers }
            );
        }
    },
};
```

## 📚 Knowledge Base

### Formát souborů

S GPT-4.1 Nano můžete používat mnohem větší knowledge base soubory:

**knowledge-company.txt**
```
NÁZEV FIRMY

Jsme moderní IT společnost specializující se na...

ZALOŽENÍ A HISTORIE
- Založeno v roce 2020
- Sídlo v Praze
- Tým 15+ expertů

NAŠE HODNOTY
- Inovace
- Kvalita
- Spolehlivost

[Můžete přidat mnohem více obsahu díky velkému kontextu GPT-4.1 Nano!]
```

### Výhody velkého kontextu

- **Až 1 milion tokenů** - můžete nahrát celé dokumenty, manuály, FAQ
- **Lepší porozumění** - model vidí celý kontext najednou
- **Přesnější odpovědi** - více informací = lepší odpovědi
- **Méně omezení** - nemusíte zkracovat knowledge base

## 🎨 Témata

Aplikace obsahuje 4 profesionální témata:

### Claude (výchozí)
- Světlé, čisté rozhraní
- Jemné béžové tóny
- Profesionální vzhled

### Google
- Minimalistický design
- Modré akcenty
- Čisté linie

### Replit
- Tmavé téma
- Červené akcenty
- Vhodné pro noční práci

### Carrd
- Futuristické téma
- Neonové akcenty (cyan)
- Animované přechody

## 🔍 Řešení problémů

### Chatbot neodpovídá
1. Zkontrolujte URL Cloudflare Workeru v `config.js`
2. Ověřte, že jsou správně nastaveny API klíče
3. Zkontrolujte konzoli prohlížeče (F12)
4. Ověřte, že váš API klíč má přístup k GPT-4.1 Nano

### Chyba 401 - Unauthorized
- Neplatný API klíč v Cloudflare Worker
- API klíč nemá přístup k GPT-4.1 Nano

### Chyba 429 - Too Many Requests
- Překročen limit OpenAI API
- Zkuste snížit `MAX_MESSAGES_PER_MINUTE`

### Agent mode je pomalý
- GPT-4.1 Nano by měl být rychlejší než předchozí modely
- Zkontrolujte, že se skutečně používá správný model v logách

### Knowledge base se nenačítá
- Zkontrolujte názvy souborů (musí začínat `knowledge-`)
- Ověřte, že jsou soubory ve stejné složce jako `index.html`
- S GPT-4.1 Nano můžete používat větší soubory

## 🚀 Optimalizace pro GPT-4.1 Nano

### Využití velkého kontextu

1. **Rozsáhlé knowledge base**
   - Můžete nahrát celé dokumenty (až 1M tokenů)
   - Více detailů = přesnější odpovědi
   - Nemusíte omezovat velikost souborů

2. **Dlouhé konverzace**
   - Model si pamatuje mnohem více historie
   - Lepší kontinuita v konverzaci
   - Možnost komplexních diskuzí

3. **Analýza dokumentů**
   - Můžete vložit celé PDF, manuály, reporty
   - Model dokáže analyzovat a sumarizovat
   - Odpovídat na specifické dotazy z dokumentů

### Doporučená nastavení pro různé use-cases

**Pro rychlou podporu (FAQ):**
```javascript
MODE: "knowledge",
API: {
    OPENAI: {
        MODEL: "gpt-4.1-nano",
        TEMPERATURE: 0.3,     // Konzistentní odpovědi
        MAX_TOKENS: 2000      // Středně dlouhé odpovědi
    }
}
```

**Pro komplexní analýzy:**
```javascript
MODE: "agent",
AGENT: {
    MODEL: "gpt-4.1-nano",
    POLLING_INTERVAL: 500,   // Rychlé kontroly
    MAX_WAIT_TIME: 60000     // Delší timeout pro složité úlohy
}
```

**Pro kreativní úlohy:**
```javascript
API: {
    OPENAI: {
        MODEL: "gpt-4.1-nano",
        TEMPERATURE: 0.9,     // Vysoká kreativita
        MAX_TOKENS: 32768     // Maximální délka pro kreativní obsah
    }
}
```

## 📈 Výkonnostní charakteristiky GPT-4.1 Nano

- **Rychlost**: Nejrychlejší model od OpenAI
- **Cena**: Nejlevnější na token
- **Kvalita**: Srovnatelná s GPT-4 pro většinu úloh
- **Kontext**: 250x větší než GPT-3.5
- **Limity**: 32K tokenů na odpověď

## 📄 Licence

Tento projekt je open source. Můžete ho volně používat a upravovat pro vlastní potřeby.

## 🤝 Podpora

Potřebujete pomoc? Kontaktujte nás na `podpora@vase-firma.cz`

---

**Vytvořeno s ❤️ pomocí OpenAI GPT-4.1 Nano API**
