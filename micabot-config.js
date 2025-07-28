// micabot-config.js - Configuración del chatbot con LLM

// Configuración después de que MicaBot esté inicializado
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.micaBot) {
            console.log('🔧 Configurando MicaBot...');
            
            // OPCIÓN 1: Usar Groq (Gratis y rápido)
            // Regístrate en: https://console.groq.com/
            window.micaBot.setApiKey('groq', 'TU_API_KEY_DE_GROQ_AQUI');
            
            // OPCIÓN 2: Usar OpenAI
            // window.micaBot.setApiKey('openai', 'TU_API_KEY_DE_OPENAI_AQUI');
            
            // OPCIÓN 3: Usar Anthropic Claude
            // window.micaBot.setApiKey('anthropic', 'TU_API_KEY_DE_ANTHROPIC_AQUI');
            
           
            console.log('🤖 MicaBot funcionando con IA simulada');
            
        } else {
            console.error('❌ MicaBot no está disponible');
        }
    }, 1000);
});

// Funciones de utilidad para configurar diferentes proveedores
window.configureMicaBotLLM = {
    

    setupGroq: function(apiKey) {
        if (window.micaBot) {
            window.micaBot.setApiKey('groq', apiKey);
            console.log('✅ Groq configurado correctamente');
            return true;
        }
        return false;
    },
    
    // Configurar OpenAI
    setupOpenAI: function(apiKey) {
        if (window.micaBot) {
            window.micaBot.setApiKey('openai', apiKey);
            console.log('✅ OpenAI configurado correctamente');
            return true;
        }
        return false;
    },
    
    // Configurar Anthropic
    setupAnthropic: function(apiKey) {
        if (window.micaBot) {
            window.micaBot.setApiKey('anthropic', apiKey);
            console.log('✅ Anthropic configurado correctamente');
            return true;
        }
        return false;
    },
    
    // Configurar Ollama local
    setupOllama: function(endpoint = 'http://localhost:11434/api/generate', model = 'llama2') {
        if (window.micaBot) {
            window.micaBot.llmConfig.provider = 'ollama';
            window.micaBot.llmConfig.endpoint = endpoint;
            window.micaBot.llmConfig.model = model;
            console.log('✅ Ollama configurado correctamente');
            return true;
        }
        return false;
    },
    
    // Verificar configuración actual
    checkConfig: function() {
        if (window.micaBot) {
            console.log('🔍 Configuración actual:', {
                provider: window.micaBot.llmConfig.provider,
                model: window.micaBot.llmConfig.model,
                hasApiKey: !!window.micaBot.llmConfig.apiKey,
                endpoint: window.micaBot.llmConfig.endpoint
            });
            return window.micaBot.llmConfig;
        }
        return null;
    }
};

// Instrucciones de uso en consola
console.log(`
🤖 MICA-BOT LLM Configuration

1. GROQ (Recomendado - Gratis):
   configureMicaBotLLM.setupGroq('tu-api-key-aqui');

2. OpenAI:
   configureMicaBotLLM.setupOpenAI('tu-api-key-aqui');

3. Anthropic:
   configureMicaBotLLM.setupAnthropic('tu-api-key-aqui');

4. Ollama (Local):
   configureMicaBotLLM.setupOllama();

5. Verificar configuración:
   configureMicaBotLLM.checkConfig();

Sin configurar API, el bot usa respuestas simuladas inteligentes.
`);