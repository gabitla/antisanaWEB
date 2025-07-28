// micabot.js - Versión con LLM integrado
console.log('🤖 Cargando MicaBot con LLM...');

class MicaBot {
    constructor() {
        console.log('🤖 Inicializando MicaBot...');
        this.isOpen = false;
        this.notificationShown = false;
        
        // Configuración del LLM (puedes cambiar por OpenAI, Anthropic, etc.)
        this.llmConfig = {
            // Opción 1: OpenAI GPT
            //provider: 'openai', // 'openai', 'anthropic', 'groq', 'ollama'
            //apiKey: '', // Dejar vacío para usar variable de entorno o configurar después
            //model: 'gpt-3.5-turbo',
            //endpoint: 'https://api.openai.com/v1/chat/completions',
            
            // Opción 2: Groq (más rápido y gratis)
             provider: 'groq',
             apiKey: '', // Tu API key de Groq
             model: 'llama3-8b-8192',
             endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            
            // Opción 3: Ollama (local)
            // provider: 'ollama',
            // model: 'llama2',
            // endpoint: 'http://localhost:11434/api/generate',
        };

        // Prompt del sistema para el LLM
        this.systemPrompt = `Eres MICA-BOT, un asistente especializado en el Sistema de Agua La Mica de Quito Sur, Ecuador, responde con unas 40 palbras.

CONTEXTO DEL SISTEMA:
- Fuente: Volcán Antisana (5,758m) → Laguna La Mica → El Carmen → El Troje → Distribución Quito Sur
- Caudal actual: 850 L/s (meta: 1,700 L/s)
- Población atendida: 300,000-400,000 personas en 150 barrios
- Zonas: Quitumbe, La Argelia, Turubamba, Guamani, La Ecuatoriana, Chillogallo

SENSORES CRÍTICOS:
- P42 (Ramón Huañuna): 51.86% datos faltantes - CRÍTICO
- P43 (Limboasi): 30.47% datos faltantes - ALTO RIESGO  
- P55 (Diguchi): 13.99% datos faltantes - CONFIABLE

ESPECIALIDADES:
✅ Recomendaciones de sensores según condiciones climáticas y geográficas
✅ Análisis de problemas de telemetría y conectividad
✅ Soluciones de energía solar para zonas remotas
✅ Sistemas de respaldo y redundancia
✅ Análisis de calidad de agua y monitoreo
✅ Prevención de contaminación en fuentes hídricas
✅ Optimización de recursos hídricos

TIPOS DE SENSORES RECOMENDADOS:
🌧️ Precipitación: Pluviómetros digitales, radares meteorológicos
💧 Nivel de agua: Sensores ultrasónicos, radar FMCW, presión hidrostática
🌡️ Calidad: pH, conductividad, turbidez, oxígeno disuelto, cloro residual
📊 Caudal: Medidores electromagnéticos, ultrasónicos, vertederos
⚡ Energía: Paneles solares, baterías de litio, sistemas híbridos

CONSIDERACIONES CLIMÁTICAS ECUADOR:
- Altitud extrema (páramos andinos): Sensores resistentes a heladas
- Humedad alta: Encapsulados IP68, materiales anticorrosión
- Variabilidad estacional: Sistemas adaptativos, calibración automática
- Acceso remoto: Telemetría satelital, LoRaWAN, 4G

FORMATO DE RESPUESTA:
- Usa emojis relevantes (💧🌧️📊⚡🔧)
- Incluye datos técnicos específicos cuando sea apropiado
- Menciona costos estimados si es relevante
- Proporciona soluciones prácticas y aplicables
- Considera el contexto ecuatoriano y las condiciones locales



TONO: Profesional pero amigable, técnico pero comprensible, siempre enfocado en soluciones prácticas para el Sistema La Mica.`;



        this.micaKnowledge = {
            sensores: {
                P42: {
                    nombre: "Ramón Huañuna",
                    perdidaDatos: 51.86,
                    estado: "crítico",
                    tipo: "precipitación",
                    ubicacion: "zona alta, acceso remoto",
                    problemas: ["conectividad", "energía", "mantenimiento"]
                },
                P43: {
                    nombre: "Limboasi",
                    perdidaDatos: 30.47,
                    estado: "alto riesgo",
                    tipo: "precipitación",
                    ubicacion: "zona media",
                    problemas: ["calibración", "telemetría"]
                },
                P55: {
                    nombre: "Diguchi",
                    perdidaDatos: 13.99,
                    estado: "confiable",
                    tipo: "precipitación",
                    ubicacion: "zona accesible",
                    ventajas: ["mantenimiento regular", "buena conectividad"]
                }
            },
            sistema: {
                caudalActual: 850,
                metaFutura: 1700,
                poblacionAtendida: "300,000 a 400,000 personas",
                barrios: 150,
                zonasCobertura: ["Quitumbe", "La Argelia", "Turubamba", "Guamani", "La Ecuatoriana", "Chillogallo"],
                recorrido: "Desde Volcán Antisana → Laguna La Mica → El Carmen → El Troje → Distribución Sur Quito"
            },
            precios: {
                climatologico: 317.13,
                pluviometro: 149.00,
                radarFMCW: "Bajo consulta",
                solarKit: 450.00,
                telemetria4G: 280.00
            }
        };

        this.init();
    }

    init() {
        console.log('🤖 Ejecutando init()...');
        this.addStyles();
        this.createChatInterface();
        this.setupEventListeners();
        this.startNotifications();
        console.log('🤖 MicaBot inicializado correctamente!');
    }

    // [Mantener todos los métodos de UI anteriores: addStyles, createChatInterface, setupEventListeners, etc.]
    addStyles() {
        console.log('🤖 Añadiendo estilos CSS...');
        const style = document.createElement('style');
        style.id = 'micabot-styles';
        style.textContent = `
            /* Mantener todos los estilos anteriores */
            #micaChatContainer {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            }

            .chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
            }

            .chat-icon {
                font-size: 1.8rem;
                animation: pulse 2s infinite;
                color: white;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .chat-notification {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: white;
                color: #333;
                padding: 12px 16px;
                border-radius: 20px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                font-size: 0.9rem;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.4s ease;
                pointer-events: none;
                max-width: 250px;
                white-space: normal;
            }

            .chat-notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            .chat-notification::after {
                content: '';
                position: absolute;
                bottom: -8px;
                right: 20px;
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
            }

            .chat-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 400px;
                height: 600px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 1001;
                backdrop-filter: blur(10px);
            }

            .chat-window.open {
                display: flex !important;
                animation: slideUp 0.4s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                display: flex;
                align-items: center;
                position: relative;
            }

            .bot-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-right: 12px;
                animation: pulse 2s infinite;
            }

            .chat-title h3 {
                margin: 0;
                font-size: 1.1rem;
            }

            .chat-title p {
                margin: 0;
                font-size: 0.8rem;
                opacity: 0.9;
            }

            .status-indicator {
                position: absolute;
                top: 10px;
                right: 40px;
                width: 8px;
                height: 8px;
                background: #2ecc71;
                border-radius: 50%;
                animation: blink 1.5s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            .close-chat-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .close-chat-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            }

            .message {
                margin-bottom: 12px;
                display: flex;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .message.bot {
                justify-content: flex-start;
            }

            .message.user {
                justify-content: flex-end;
            }

            .message-content {
                max-width: 80%;
                padding: 10px 14px;
                border-radius: 15px;
                position: relative;
                font-size: 0.9rem;
            }

            .message.bot .message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-bottom-left-radius: 5px;
            }

            .message.user .message-content {
                background: #e3f2fd;
                color: #1976d2;
                border-bottom-right-radius: 5px;
            }

            .message-time {
                font-size: 0.7rem;
                opacity: 0.7;
                margin-top: 4px;
            }

            .typing-indicator {
                display: none;
                align-items: center;
                margin-bottom: 12px;
                padding: 0 15px;
            }

            .typing-dots {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 10px 14px;
                border-radius: 15px;
                border-bottom-left-radius: 5px;
            }

            .typing-dots span {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: white;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-8px);
                }
            }

            .chat-input-container {
                padding: 15px;
                background: white;
                border-top: 1px solid #e0e0e0;
            }

            .quick-suggestions {
                display: flex;
                gap: 6px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }

            .suggestion-chip {
                background: #e3f2fd;
                color: #1976d2;
                padding: 6px 12px;
                border-radius: 15px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .suggestion-chip:hover {
                background: #1976d2;
                color: white;
                transform: translateY(-1px);
            }

            .input-area {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .chat-input {
                flex: 1;
                padding: 10px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 20px;
                outline: none;
                font-size: 0.9rem;
                transition: border-color 0.3s ease;
            }

            .chat-input:focus {
                border-color: #667eea;
            }

            .send-button {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }

            .send-button:hover {
                transform: scale(1.1);
            }

            .send-button:disabled {
                opacity: 0.5;
                transform: none;
                cursor: not-allowed;
            }

            .welcome-message {
                text-align: center;
                color: #666;
                padding: 20px 10px;
            }

            .welcome-message h4 {
                color: #2c3e50;
                margin-bottom: 8px;
                font-size: 1rem;
            }

            .welcome-message p {
                font-size: 0.85rem;
                margin-bottom: 6px;
            }

            .system-info {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                padding: 12px;
                border-radius: 8px;
                margin: 8px 0;
                border-left: 3px solid #1976d2;
            }

            .data-highlight {
                background: rgba(255, 235, 59, 0.3);
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: bold;
            }

            .alert-critical {
                color: #e74c3c;
                font-weight: bold;
            }

            .alert-warning {
                color: #f39c12;
                font-weight: bold;
            }

            .alert-good {
                color: #27ae60;
                font-weight: bold;
            }

            /* Indicador de LLM activo */
            .llm-thinking {
                background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
                padding: 8px 12px;
                border-radius: 15px;
                border-bottom-left-radius: 5px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .llm-thinking::before {
                content: '🧠';
                animation: pulse 1s infinite;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .chat-window {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 140px);
                    right: 20px;
                    bottom: 90px;
                }

                .suggestion-chip {
                    font-size: 0.7rem;
                    padding: 5px 10px;
                }

                .chat-input {
                    font-size: 0.85rem;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('🤖 Estilos CSS añadidos');
    }

    createChatInterface() {
        console.log('🤖 Creando interfaz de chat...');
        
        if (document.getElementById('micaChatContainer')) {
            console.log('⚠️ El chat ya existe, eliminando el anterior...');
            document.getElementById('micaChatContainer').remove();
        }

        const chatContainer = document.createElement('div');
        chatContainer.id = 'micaChatContainer';
        chatContainer.innerHTML = `
            <div id="chatToggle" class="chat-toggle">
                <div class="chat-icon">🤖</div>
                <div id="chatNotification" class="chat-notification">
                    💧 ¡Hola! Soy MICA-BOT con IA avanzada
                </div>
            </div>

            <div id="chatWindow" class="chat-window">
                <div class="chat-header">
                    <div class="status-indicator"></div>
                    <div class="bot-avatar">🤖</div>
                    <div class="chat-title">
                        <h3>MICA-BOT AI</h3>
                        <p>Asistente IA del Sistema La Mica</p>
                    </div>
                    <button id="closeChatBtn" class="close-chat-btn">×</button>
                </div>
                

                <div class="chat-messages" id="chatMessages">
                    <div class="welcome-message">
                        <h4>¡Hola! Soy MICA-BOT AI 🧠🌊</h4>
                        <p>Asistente inteligente especializado en el Sistema La Mica</p>
                        <p>Puedo responder cualquier pregunta técnica sobre sensores, clima, agua y más!</p>
                    </div>
                </div>

                <div class="typing-indicator" id="typingIndicator">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="chat-input-container">
                    <div class="quick-suggestions">
                        <button class="suggestion-chip" data-suggestion="¿Qué sensor recomiendas para época de lluvias?">
                            🌧️ Sensores lluvia
                        </button>
                        <button class="suggestion-chip" data-suggestion="¿Cómo afecta la altitud a los sensores?">
                            🏔️ Altitud
                        </button>
                        <button class="suggestion-chip" data-suggestion="Sistemas de energía solar para sensores remotos">
                            ☀️ Energía solar
                        </button>
                        <button class="suggestion-chip" data-suggestion="Monitoreo de calidad del agua">
                            💧 Calidad agua
                        </button>
                    </div>

                    <div class="input-area">
                        <input type="text" class="chat-input" id="chatInput"
                            placeholder="Pregúntame cualquier cosa sobre el Sistema La Mica..." />
                        <button class="send-button" id="sendButton">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(chatContainer);
        console.log('🤖 Interfaz de chat creada y añadida al DOM');
    }

    setupEventListeners() {
        console.log('🤖 Configurando event listeners...');
        
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', (e) => {
                console.log('🤖 Click en chat toggle detectado');
                e.preventDefault();
                this.toggleChat();
            });
        }

        const closeChatBtn = document.getElementById('closeChatBtn');
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => {
                this.closeChat();
            });
        }

        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        const suggestionChips = document.querySelectorAll('.suggestion-chip');
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const suggestion = chip.getAttribute('data-suggestion');
                this.sendSuggestion(suggestion);
            });
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.classList.add('open');
            this.isOpen = true;
            this.hideNotification();

            if (!document.getElementById('chatMessages').querySelector('.message')) {
                setTimeout(() => {
                    this.addMessage(`
                        <strong>🌊 ¡Sistema La Mica AI Online!</strong><br><br>
                        🧠 Ahora con inteligencia artificial avanzada para responder todas tus preguntas técnicas.<br><br>
                        
                        <strong>📊 Estado actual:</strong><br>
                        • Caudal: <span class="data-highlight">850 L/s</span><br>
                        • Población: <span class="data-highlight">300K-400K personas</span><br>
                        • IA: <span class="alert-good">Lista para consultas técnicas</span><br><br>
                        
                        ¿Qué necesitas saber hoy?
                    `, true, true);
                }, 1000);
            }
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.classList.remove('open');
            this.isOpen = false;
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        console.log('🤖 Enviando mensaje:', message);

        // Mostrar mensaje del usuario
        this.addMessage(message, false);
        input.value = '';

        // Mostrar indicador de escritura
        this.showTyping();

        try {
            // Primero intentar con la base de conocimientos local
            const localResponse = this.processLocalQuery(message);
            
            if (localResponse && !localResponse.includes('no tengo información específica')) {
                // Si hay respuesta local, usarla
                setTimeout(() => {
                    this.hideTyping();
                    this.addMessage(localResponse, true, true);
                }, 1000);
            } else {
                // Si no hay respuesta local, usar LLM
                console.log('🧠 Consultando LLM para:', message);
                this.showLLMThinking();
                
                const llmResponse = await this.queryLLM(message);
                this.hideTyping();
                this.addMessage(llmResponse, true, false);
            }
        } catch (error) {
            console.error('❌ Error al procesar mensaje:', error);
            this.hideTyping();
            this.addMessage(`
                <strong>⚠️ Error de conexión</strong><br><br>
                No pude conectarme al sistema de IA. Pero puedo ayudarte con:<br>
                • Estado de sensores P42, P43, P55<br>
                • Información de caudales<br>
                • Zonas de cobertura<br><br>
                Por favor, intenta con una pregunta más específica sobre estos temas.
            `, true, true);
        }
    }

    sendSuggestion(suggestion) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = suggestion;
            this.sendMessage();
        }
    }

    processLocalQuery(query) {
        const lowerQuery = query.toLowerCase();

        // Respuestas específicas de la base de conocimientos
        if (lowerQuery.includes('p42') || lowerQuery.includes('ramón') || lowerQuery.includes('huañuna')) {
            return `
                <strong>📊 Análisis Sensor P42 - Ramón Huañuna</strong><br><br>
                🔴 <span class="alert-critical">Estado: CRÍTICO</span><br>
                📉 Pérdida de datos: <span class="data-highlight">51.86%</span><br>
                🌧️ Tipo: Sensor de precipitación<br>
                📍 Ubicación: Zona alta, acceso remoto<br><br>
                
                <strong>🔍 Problemas identificados:</strong><br>
                • Conectividad limitada en zona montañosa<br>
                • Problemas de alimentación eléctrica<br>
                • Falta de mantenimiento preventivo<br><br>
                
                <strong>💡 Soluciones recomendadas:</strong><br>
                • Sistema solar híbrido (panel + batería)<br>
                • Sensor redundante de respaldo<br>
                • Telemetría satelital LoRaWAN<br>
                • Encapsulado resistente a condiciones extremas
            `;
        }

        if (lowerQuery.includes('caudal')) {
            return `
                <strong>💧 Información de Caudales - Sistema La Mica</strong><br><br>
                📊 Caudal actual: <span class="data-highlight">850 L/s</span><br>
                🎯 Meta futura: <span class="data-highlight">1,700 L/s</span> (100% aumento)<br>
                👥 Población atendida: <span class="data-highlight">300,000 - 400,000 personas</span><br>
                🏘️ Barrios cubiertos: <span class="data-highlight">150</span><br><br>
                
                <strong>🌊 Recorrido del agua:</strong><br>
                Volcán Antisana → Laguna La Mica → El Carmen → El Troje → Distribución Sur Quito
            `;
        }

        // Si no hay coincidencias específicas, devolver null para usar LLM
        return null;
    }

    async queryLLM(message) {
        // Preparar el contexto para el LLM
        const contextualMessage = `Pregunta del usuario: "${message}"

Contexto del Sistema La Mica:
- Sensores críticos: P42 (51.86% datos faltantes), P43 (30.47%), P55 (13.99% - confiable)
- Ubicación: Desde Volcán Antisana (5,758m) hasta Quito Sur
- Condiciones: Alta altitud, clima variable, zonas remotas
- Población: 300K-400K personas en 150 barrios de Quito Sur`;

        try {
            // Opción 1: OpenAI/Groq API
            if (this.llmConfig.provider === 'openai' || this.llmConfig.provider === 'groq') {
                const response = await fetch(this.llmConfig.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.llmConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.llmConfig.model,
                        messages: [
                            {
                                role: 'system',
                                content: this.systemPrompt
                            },
                            {
                                role: 'user',
                                content: contextualMessage
                            }
                        ],
                        max_tokens: 500,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            }

            // Opción 2: Ollama (local)
            else if (this.llmConfig.provider === 'ollama') {
                const response = await fetch(this.llmConfig.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.llmConfig.model,
                        prompt: `${this.systemPrompt}\n\n${contextualMessage}`,
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.response;
            }

            // Opción 3: Simulación local (para testing sin API)
            else {
                return this.simulateLLMResponse(message);
            }

        } catch (error) {
            console.error('❌ Error en LLM:', error);
            
            // Fallback: respuesta simulada inteligente
            return this.simulateLLMResponse(message);
        }
    }


    showLLMThinking() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.innerHTML = `
                <div class="llm-thinking">
                    Consultando IA especializada...
                </div>
            `;
            typingIndicator.style.display = 'flex';
            
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }

    addMessage(content, isBot = false, isSystem = false) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-content ${isSystem ? 'system-info' : ''}">
                ${content}
                <div class="message-time">${timeString}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            typingIndicator.style.display = 'flex';
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    startNotifications() {
        console.log('🤖 Iniciando sistema de notificaciones...');
        
        setTimeout(() => {
            if (!this.notificationShown && !this.isOpen) {
                this.showNotification();
            }
        }, 5000);

        setInterval(() => {
            if (Math.random() < 0.3 && !this.isOpen) {
                this.showNotification();
            }
        }, 30000);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.hideNotification();
            }
        });
    }

    showNotification() {
        const notification = document.getElementById('chatNotification');
        if (notification) {
            notification.classList.add('show');
            this.notificationShown = true;

            setTimeout(() => {
                this.hideNotification();
            }, 8000);
        }
    }

    hideNotification() {
        const notification = document.getElementById('chatNotification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    // Método público para configurar API key
    setApiKey(provider, apiKey) {
        this.llmConfig.provider = provider;
        this.llmConfig.apiKey = apiKey;
        
        // Configurar endpoints según el proveedor
        switch(provider) {
            case 'openai':
                this.llmConfig.endpoint = 'https://api.openai.com/v1/chat/completions';
                this.llmConfig.model = 'gpt-3.5-turbo';
                break;
            case 'groq':
                this.llmConfig.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                this.llmConfig.model = 'llama3-8b-8192';
                break;
            case 'anthropic':
                this.llmConfig.endpoint = 'https://api.anthropic.com/v1/messages';
                this.llmConfig.model = 'claude-3-haiku-20240307';
                break;
        }
        
        console.log(`🤖 API configurada para ${provider}`);
    }
}

// Función para inicializar el chatbot
function initMicaBot() {
    console.log('🤖 Iniciando proceso de inicialización...');
    
    if (window.micaBot) {
        console.log('⚠️ MicaBot ya existe, eliminando instancia anterior...');
        delete window.micaBot;
    }
    
    try {
        window.micaBot = new MicaBot();
        console.log('✅ MicaBot con IA inicializado exitosamente!');
        
        // Ejemplo de configuración de API (opcional)
        // window.micaBot.setApiKey('groq', 'tu-api-key-aqui');
        
    } catch (error) {
        console.error('❌ Error al inicializar MicaBot:', error);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMicaBot);
} else {
    initMicaBot();
}

console.log('🤖 Script MicaBot con IA cargado completamente');