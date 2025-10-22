// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            --chat--color-accent: #ff4d4d; /* Nuevo color de acento para la grabación */
            font-family: futura-pt;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }
        
        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
            flex-shrink: 0;
        }

        .n8n-chat-widget .language-select {
            margin-left: auto;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            font-size: 14px;
            font-family: inherit;
            cursor: pointer;
        }

        .n8n-chat-widget .close-button {
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
            margin-left: 8px;
        }

        .n8n-chat-widget .close-button:hover {
            opacity: 1;
        }

        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }

        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }
        
        .n8n-chat-widget .new-conversation-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .n8n-chat-widget .new-conversation {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            text-align: center;
        }

        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 28px;
            line-height: 1.3;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            max-width: 300px;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }
        
        .n8n-chat-widget .new-chat-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
            transform: none;
        }

        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }

        .n8n-chat-widget .chat-btn-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .n8n-chat-widget .chat-line {
            display: block;
            margin-bottom: 8px;
            font-weight: 200;
            font-size: 14px;
        }

        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }

        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: #000;
            opacity: 0.7;
            margin-bottom:28px;
            font-weight: 400;
        }
        
        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
            position: relative;
        }

        .n8n-chat-widget .chat-interface.active {
            display: flex;
        }
        
        .n8n-chat-widget .chat-messages {
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        .n8n-chat-widget .chat-messages::-webkit-scrollbar {
            display: none;
        }

        .n8n-chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .n8n-chat-widget .chat-input {
            flex-shrink: 0;
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
            align-items: center;
            box-sizing: border-box;
            position: relative;
        }

        /* Tooltip CSS */
        .n8n-chat-widget .chat-input button[title]:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 60px;
            background: #333;
            color: #fff;
            font-size: 12px;
            padding: 5px 8px;
            border-radius: 6px;
            white-space: nowrap;
            z-index: 10;
        }

        .n8n-chat-widget .chat-input textarea {
            flex-grow: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
            min-height: 40px;
            overflow: hidden;
        }

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 44px;
            width: 44px;
            flex-shrink: 0;
            position: relative;
        }

        /* Cambios de estilo para el botón de micrófono */
        .n8n-chat-widget .chat-input button.mic-button.recording {
            background: var(--chat--color-accent);
            color: white;
        }

        .n8n-chat-widget .chat-input button.send-button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
        }

        .n8n-chat-widget .chat-input button svg {
            width: 20px;
            height: 20px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin="round"
        }

        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }
        
        .n8n-chat-widget .chat-input button.mic-button[title]:hover::after {
            right: 60px;
        }
        
        .n8n-chat-widget .chat-input button.send-button[title]:hover::after {
            right: 16px;
        }

        /* --- NUEVOS ESTILOS PARA EL VISUALIZADOR --- */
        .n8n-chat-widget #audio-visualizer {
            flex-grow: 1;
            height: 44px;
            background-color: #f8f8f8;
            border-radius: 8px;
            display: none;
            border: 1px solid rgba(133, 79, 255, 0.2);
        }
        .n8n-chat-widget .chat-input.is-recording #audio-visualizer {
            display: block;
        }
        .n8n-chat-widget .chat-input.is-recording textarea {
            display: none;
        }
        /* --- FIN DE NUEVOS ESTILOS --- */
        
        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .n8n-chat-widget .chat-footer {
            flex-shrink: 0;
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }

        .n8n-chat-widget .privacy-checkbox {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: left;
            margin-top: 1.5rem;
            margin-bottom: 20px;
            font-family: inherit;
        }

        .n8n-chat-widget .privacy-checkbox input[type="checkbox"] {
            display: none;
        }

        .n8n-chat-widget .privacy-checkbox label {
            position: relative;
            padding-left: 28px;
            font-size: 14px;
            color: #000;
            cursor: pointer;
            max-width: 300px;
            font-weight: 400;
            opacity: 0.7;
        }

        .n8n-chat-widget .privacy-checkbox label::before {
            content: "";
            position: absolute;
            left: 0;
            top: 2px;
            width: 18px;
            height: 18px;
            border: 1.5px solid rgba(133, 79, 255, 0.6);
            border-radius: 4px;
            background-color: #fff;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .privacy-checkbox input[type="checkbox"]:checked + label::before {
            background: linear-gradient(135deg, var(--chat--color-primary), var(--chat--color-secondary));
            border-color: transparent;
        }

        .n8n-chat-widget .privacy-checkbox input[type="checkbox"]:checked + label::after {
            content: "";
            position: absolute;
            display: block;
            left: 6px;
            top: 4px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2.5px 2.5px 0;
            transform: rotate(45deg);
        }

        .n8n-chat-widget .privacy-checkbox a {
            color: var(--chat--color-primary);
            text-decoration: underline;
            transition: color 0.2s;
        }

        .n8n-chat-widget .privacy-checkbox a:hover {
            color: var(--chat--color-secondary);
        }
    `;


    (function() {
    // ============================
    // CARGA DE FUENTES Y ESTILOS
    // ============================
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles; // Aquí debes definir tu variable 'styles' previamente
    document.head.appendChild(styleSheet);

    // ============================
    // TRADUCCIONES
    // ============================
    const translations = {
        de: {
            language: "Deutsch",
            welcomeText: "HERZLICH WILLKOMMEN BEI AMARETIS!",
            responseTimeText: "AMARETIS AI ist Ihr digitaler Assistent – direkt, unkompliziert und rund um die Uhr erreichbar. Ob Sie einen Termin vereinbaren möchten, Fragen zu unseren Leistungen haben oder herausfinden wollen, ob AMARETIS zu Ihrem Vorhaben passt – wir sind für Sie da.",
            privacyLabel: "Ich habe die <a href='https://www.amaretis.de/datenschutz/' target='_blank'>Datenschutzerklärung</a> gelesen und akzeptiere sie.",
            newChatBtnText: "Starten Sie Ihre Anfrage!",
            placeholder: "Text oder Sprache eingeben…",
            micTitle: "Spracheingabe starten/stoppen",
            sendTitle: "Nachricht senden",
            micUnsupported: "Spracherkennung nicht unterstützt",
            botGreeting: "Hallo! 👋 Ich bin Ihr persönlicher Assistent der Agentur für Kommunikation AMARETIS. Wir sind eine Full-Service-Werbeagentur mit Sitz in Göttingen und arbeiten für Kundinnen und Kunden in ganz Deutschland. Wie kann ich Ihnen heute weiterhelfen?"
        },
        en: {
            language: "English",
            welcomeText: "WELCOME TO AMARETIS!",
            responseTimeText: "AMARETIS AI is your digital assistant – direct, uncomplicated, and available around the clock. Whether you want to schedule an appointment, have questions about our services, or want to find out if AMARETIS is a good fit for your project – we're here for you.",
            privacyLabel: "I have read and accept the <a href='https://www.amaretis.de/datenschutz/' target='_blank'>privacy policy</a>.",
            newChatBtnText: "Start your request!",
            placeholder: "Enter text or voice...",
            micTitle: "Start/stop voice input",
            sendTitle: "Send message",
            micUnsupported: "Speech recognition not supported",
            botGreeting: "Hello! 👋 I am your personal assistant from the AMARETIS communication agency. We are a full-service advertising agency based in Göttingen and work for clients throughout Germany. How can I help you today?"
        },
        es: {
            language: "Español",
            welcomeText: "¡BIENVENIDO A AMARETIS!",
            responseTimeText: "AMARETIS AI es tu asistente digital: directo, sencillo y disponible las 24 horas. Ya sea que quieras programar una cita, tengas preguntas sobre nuestros servicios o quieras saber si AMARETIS es adecuado para tu proyecto, estamos aquí para ayudarte.",
            privacyLabel: "He leído y acepto la <a href='https://www.amaretis.de/datenschutz/' target='_blank'>política de privacidad</a>.",
            newChatBtnText: "¡Inicia tu consulta!",
            placeholder: "Escribe o dicta un mensaje…",
            micTitle: "Iniciar/detener entrada de voz",
            sendTitle: "Enviar mensaje",
            micUnsupported: "Reconocimiento de voz no soportado",
            botGreeting: "¡Hola! 👋 Soy tu asistente personal de la agencia de comunicación AMARETIS. Somos una agencia de publicidad de servicio completo con sede en Göttingen y trabajamos para clientes en toda Alemania. ¿En qué puedo ayudarte hoy?"
        }
    };

    // ============================
    // CONFIGURACIÓN DEFAULT
    // ============================
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: {
            logo: '', name: '', welcomeText: '', responseTimeText: '',
            poweredBy: { text: 'Powered by AMARETIS AI', link: 'https://www.amaretis.de' }
        },
        style: { primaryColor: '', secondaryColor: '', position: 'right', backgroundColor: '#ffffff', fontColor: '#333333' }
    };

    const config = window.ChatWidgetConfig ?
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let currentLang = 'de'; // Idioma por defecto
    const langCodes = { de: 'de-DE', en: 'en-US', es: 'es-ES' };

    // ============================
    // CREACIÓN DEL CONTENEDOR DEL WIDGET
    // ============================
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    // ============================
    // HTML DEL CHAT
    // ============================
    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // HTML para nueva conversación
    const newConversationHTML = `
        <div class="new-conversation-wrapper">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <select class="language-select">
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
                <button class="close-button">×</button>
            </div>
            <div class="new-conversation">
                <h2 class="welcome-text"></h2>
                <p class="response-text"></p>
                <div class="privacy-checkbox">
                    <input type="checkbox" id="datenschutz" name="datenschutz">
                    <label for="datenschutz"></label>
                </div>
                <button class="new-chat-btn" disabled>
                    <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                    </svg>
                    <span></span>
                </button>
            </div>
        </div>
    `;

    // HTML de la interfaz principal del chat
    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <select class="language-select">
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <canvas id="audio-visualizer"></canvas>
                <textarea placeholder="" rows="1"></textarea>
                <button type="button" class="mic-button" title="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>
                <button type="button" class="send-button" title="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

    // ============================
    // BOTÓN TOGGLE DEL CHAT
    // ============================
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0112 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // ============================
    // ELEMENTOS DEL DOM
    // ============================
    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const newChatBtnTextSpan = newChatBtn.querySelector('span');
    const newConversationWrapper = chatContainer.querySelector('.new-conversation-wrapper');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const privacyCheckbox = chatContainer.querySelector('#datenschutz');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('.send-button');
    const micButton = chatContainer.querySelector('.mic-button');
    const chatInputContainer = chatContainer.querySelector('.chat-input');
    const visualizerCanvas = chatContainer.querySelector('#audio-visualizer');
    const languageSelects = chatContainer.querySelectorAll('.language-select');

    // ============================
    // ICONOS SVG
    // ============================
    const micSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>`;
    const stopSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>`;

    // ============================
    // FUNCIONES DE UI Y TRADUCCIÓN
    // ============================
    function updateUI() {
        const langCode = currentLang.split('-')[0];
        const t = translations[langCode] || translations.de;
        
        chatContainer.querySelector('.welcome-text').textContent = t.welcomeText;
        chatContainer.querySelector('.response-text').textContent = t.responseTimeText;
        chatContainer.querySelector('.privacy-checkbox label').innerHTML = t.privacyLabel;
        newChatBtnTextSpan.textContent = t.newChatBtnText;
        textarea.placeholder = t.placeholder;
        micButton.title = t.micTitle;
        sendButton.title = t.sendTitle;

        languageSelects.forEach(select => select.value = langCode);

        const botGreeting = messagesContainer.querySelector('.bot-greeting-message');
        if (botGreeting) botGreeting.textContent = t.botGreeting;
    }

    updateUI(); // Inicializar UI

    // ============================
    // CONFIGURACIÓN DE SPEECH RECOGNITION
    // ============================
    let recognition;
    let isRecording = false;
    let shouldSendMessageAfterStop = false;
    let audioContext;
    let analyser;
    let source;
    let animationFrameId;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = langCodes.de;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
             for (let i = event.resultIndex; i < event.results.length; i++) {
                 const transcript = event.results[i][0].transcript.trim();
                 if (event.results[i].isFinal) {
                     const corrected = correctTextRealtime(transcript);
                     textarea.value += (textarea.value ? ' ' : '') + corrected;
                     textarea.style.height = 'auto';
                     textarea.style.height = `${textarea.scrollHeight}px`;
                 }
             }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech' && isRecording) recognition.start();
            else stopRecording();
        };

        recognition.onend = () => {
            if (isRecording) recognition.start();
            else if (shouldSendMessageAfterStop) {
                const message = textarea.value.trim();
                if (message) { sendMessage(message); textarea.value = ''; textarea.style.height = 'auto'; }
                shouldSendMessageAfterStop = false;
            }
        };
    } else {
        micButton.disabled = true;
        micButton.title = translations[currentLang.split('-')[0]].micUnsupported;
    }

    // ============================
    // AUDIO VISUALIZER
    // ============================
    function startAudioVisualizer() {
        if (!visualizerCanvas) return;
        const canvasCtx = visualizerCanvas.getContext('2d');
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                function draw() {
                    animationFrameId = requestAnimationFrame(draw);
                    analyser.getByteFrequencyData(dataArray);
                    canvasCtx.fillStyle = '#f8f8f8';
                    canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

                    const barWidth = (visualizerCanvas.width / bufferLength) * 2;
                    let x = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = dataArray[i] / 2.5;
                        canvasCtx.fillStyle = getComputedStyle(widgetContainer).getPropertyValue('--n8n-chat-primary-color');
                        canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                }
                draw();
            })
            .catch(err => console.error('Mic error:', err));
    }

    function stopAudioVisualizer() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (source && source.mediaStream) source.mediaStream.getTracks().forEach(track => track.stop());
        if (audioContext && audioContext.state !== 'closed') audioContext.close();
        if (visualizerCanvas) visualizerCanvas.getContext('2d').clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    }

    // ============================
    // FUNCIONES DE GRABACIÓN
    // ============================
    function startRecording() {
        if (!recognition) return;
        isRecording = true;
        micButton.innerHTML = stopSVG;
        textarea.value = '';
        textarea.style.height = 'auto';
        recognition.lang = langCodes[currentLang] || langCodes.de;
        recognition.start();
        startAudioVisualizer();
    }

    function stopRecording() {
        isRecording = false;
        micButton.innerHTML = micSVG;
        if (recognition) recognition.stop();
        stopAudioVisualizer();
    }

    micButton.addEventListener('click', () => {
        if (isRecording) stopRecording();
        else startRecording();
    });

    // ============================
    // ENVÍO DE MENSAJES
    // ============================
    function sendMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'user-message';
        msgDiv.textContent = message;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (config.webhook.url) {
            fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId: currentSessionId })
            })
            .then(res => res.json())
            .then(data => {
                const botMsg = document.createElement('div');
                botMsg.className = 'bot-message';
                botMsg.textContent = data.reply || '';
                messagesContainer.appendChild(botMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            })
            .catch(err => console.error('Webhook error:', err));
        }
    }

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (!message) return;
        sendMessage(message);
        textarea.value = '';
        textarea.style.height = 'auto';
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // ============================
    // CORRECCIÓN AUTOMÁTICA (EJEMPLO)
    // ============================
    function correctTextRealtime(text) {
        return text.replace(/microfon/gi, 'micrófono');
    }

    // ============================
    // CONTROL DE CIERRE Y APERTURA
    // ============================
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => { chatContainer.classList.remove('open'); });
    });

    toggleButton.addEventListener('click', () => { chatContainer.classList.toggle('open'); });

    // ============================
    // SELECCIÓN DE IDIOMA
    // ============================
    languageSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            updateUI();
        });
    });

})();
})();
