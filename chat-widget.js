// Chat Widget Script (Siempre usa MediaRecorder para voz)
(function() {
    // Definimos los estilos CSS para el chat
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            --chat--color-accent: #ff4d4d; /* Color de acento para la grabación */
            font-family: futura-pt;
        }

        /* ... (Resto de los estilos CSS como los tenías - omitidos por brevedad) ... */

         .n8n-chat-widget .chat-input button.mic-button.recording {
            background: var(--chat--color-accent);
            color: white;
        }
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
    `;

    // Load font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Objeto de traducciones
    const translations = {
        de: { /* ... (Traducción Alemana) ... */ },
        en: { /* ... (Traducción Inglesa) ... */ },
        es: { /* ... (Traducción Española) ... */ }
    };

    // Default config
    const defaultConfig = { /* ... (Configuración Default) ... */ };
    const config = window.ChatWidgetConfig ? { /* ... (Fusión de Config) ... */ } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let currentLang = 'de';
    const langCodes = { de: 'de-DE', en: 'en-US', es: 'es-ES' };
    
    // Variables para MediaRecorder
    let mediaRecorder;
    let audioChunks = [];
    let mediaStream = null; 
    let audioMimeType = MediaRecorder.isTypeSupported('audio/webm; codecs=opus') ? 'audio/webm; codecs=opus' : 'audio/wav'; 
    const VOICE_WEBHOOK_URL = "https://rpcnhez7y.app.n8n.cloud/webhook/voice-input"; // URL directa del webhook de voz

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    // ... (Asignación de estilos CSS Variables) ...

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    // ... (Definición de newConversationHTML y chatInterfaceHTML) ...

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

    const toggleButton = document.createElement('button');
    // ... (Configuración del toggleButton) ...

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // Selección de elementos del DOM
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
    const closeButtons = chatContainer.querySelectorAll('.close-button');

    // SVGs para los iconos
    const micSVG = `<svg>...</svg>`; // Tu SVG de Micrófono
    const stopSVG = `<svg>...</svg>`; // Tu SVG de Stop (X)

    // Función para actualizar los textos del UI
    function updateUI() { /* ... (Tu función updateUI) ... */ }
    updateUI(); // Inicializar UI
    
    // Auto-redimensionamiento del Textarea
    textarea.addEventListener('input', () => { /* ... (Tu lógica de redimensionamiento) ... */ });

    let isRecording = false; // Estado de grabación
    let audioContext, analyser, source, animationFrameId; // Para visualizador

    // --- FUNCIONES DE AUDIO VISUALIZER ---
    function startAudioVisualizer() { /* ... (Tu código de visualizador) ... */ }
    function stopAudioVisualizer() { /* ... (Tu código de visualizador) ... */ }
    // --- FIN FUNCIONES DE AUDIO VISUALIZER ---

    // =================================================================
    // FUNCIÓN DE ENVÍO DE AUDIO AL BACKEND (n8n)
    // =================================================================
    async function sendAudioToBackend(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, `audio.${audioMimeType.split('/')[1].split(';')[0]}`);
        formData.append('lang', currentLang); // Enviar el idioma corto ('de', 'en', 'es')

        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'chat-message bot loading-transcription';
        loadingMessage.textContent = 'Transcripción en curso...'; // TODO: Traducir
        messagesContainer.appendChild(loadingMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(VOICE_WEBHOOK_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            messagesContainer.removeChild(loadingMessage); // Quitar mensaje de carga

            if (data.status === 'ok' && data.transcription) {
                textarea.value = data.transcription.trim();
                
                // Si hay transcripción, se envía automáticamente al bot principal
                if (textarea.value) {
                    sendMessage(textarea.value); 
                } else {
                    // Si la transcripción está vacía (no se detectó voz)
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'chat-message bot';
                    emptyMessage.textContent = translations[currentLang].micUnsupported + " No se detectó voz. Intenta de nuevo."; // TODO: Traducir
                    messagesContainer.appendChild(emptyMessage);
                    textarea.value = ''; // Limpiar textarea por si acaso
                }

            } else {
                // Error en la respuesta del webhook de voz
                const errorMessage = document.createElement('div');
                errorMessage.className = 'chat-message bot';
                errorMessage.textContent = translations[currentLang].micUnsupported + " Fallo la transcripción."; // TODO: Traducir
                messagesContainer.appendChild(errorMessage);
            }

        } catch (error) {
            // Error de red al contactar el webhook de voz
            messagesContainer.removeChild(loadingMessage);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-message bot';
            errorMessage.textContent = 'Error de red: No se pudo conectar con el servicio de voz.'; // TODO: Traducir
            messagesContainer.appendChild(errorMessage);
            console.error('Error enviando audio a n8n:', error);
        }
    }

    // =================================================================
    // LÓGICA DE GRABACIÓN DE MEDIA RECORDER (ÚNICO MÉTODO)
    // =================================================================
    function stopMediaRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop(); // Esto dispara el evento 'onstop' donde se envía el audio
        }
        
        // Cierra el stream de audio
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null; 
        }
        
        // Actualiza la UI
        isRecording = false;
        micButton.innerHTML = micSVG;
        micButton.classList.remove('recording');
        chatInputContainer.classList.remove('is-recording');
        stopAudioVisualizer();
    }

    function startMediaRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaStream = stream; 
                mediaRecorder = new MediaRecorder(mediaStream, { mimeType: audioMimeType });
                audioChunks = [];

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                // Define qué hacer cuando la grabación se detiene
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: audioMimeType });
                    if (audioBlob.size > 0) {
                        sendAudioToBackend(audioBlob); // Envía el audio grabado a n8n
                    } else {
                        console.warn("Audio Blob vacío, no se envía.");
                        // Opcional: Mostrar mensaje al usuario
                        stopMediaRecording(); // Asegura que la UI se resetee
                    }
                    // No es necesario llamar a stopMediaRecording aquí de nuevo, ya está en proceso.
                };

                // Inicia la grabación y actualiza UI
                mediaRecorder.start();
                isRecording = true;
                micButton.innerHTML = stopSVG;
                micButton.classList.add('recording');
                chatInputContainer.classList.add('is-recording');
                textarea.value = ''; // Limpia el textarea al iniciar grabación
                startAudioVisualizer();
            })
            .catch(err => {
                console.error('Error al acceder al micrófono:', err);
                alert(translations[currentLang].micUnsupported + " Por favor, permite el acceso al micrófono.");
                // Resetear UI en caso de error
                isRecording = false;
                micButton.innerHTML = micSVG;
                micButton.classList.remove('recording');
            });
    }
    
    // =================================================================
    // ASIGNACIÓN DE FUNCIONES DE GRABACIÓN (AHORA SOLO MEDIARECORDER)
    // =================================================================
    window.startVoiceRecording = startMediaRecording;
    window.stopVoiceRecording = stopMediaRecording;


    // LÓGICA FINAL DEL BOTÓN DE MICRÓFONO
    micButton.addEventListener('click', () => {
        if (isRecording) {
            // Detiene la grabación. El envío se maneja en 'onstop' de MediaRecorder.
            window.stopVoiceRecording(); 
        } else {
            // Inicia la grabación
            window.startVoiceRecording(); 
        }
    });

    // ... (Resto de funciones: generateUUID, startNewConversation, sendMessage, correctTextRealtime (se puede eliminar si ya no se usa)) ...

    // --- EVENT LISTENERS ---
    privacyCheckbox.addEventListener('change', () => {
        newChatBtn.disabled = !privacyCheckbox.checked;
    });

    languageSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            updateUI();
        });
    });
    
    newChatBtn.addEventListener('click', startNewConversation);
    
    sendButton.addEventListener('click', () => {
        // El botón de enviar ahora solo envía texto, no detiene grabación de voz
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
            textarea.style.height = 'auto';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
             // El Enter solo envía texto, no detiene grabación de voz
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
                textarea.style.height = 'auto';
            }
        }
    });

    closeButtons.forEach(button => { button.addEventListener('click', () => { chatContainer.classList.remove('open'); }); });
    toggleButton.addEventListener('click', () => { chatContainer.classList.toggle('open'); });

    // --- FIN EVENT LISTENERS ---

    // =================================================================
    // FUNCIONES DE COMUNICACIÓN CON EL BACKEND (CHAT PRINCIPAL)
    // =================================================================
    
    function generateUUID() { return crypto.randomUUID(); }

    async function startNewConversation() {
        currentSessionId = generateUUID();
        const data = [{ action: "loadPreviousSession", sessionId: currentSessionId, route: config.webhook.route, metadata: { userId: "" } }];
        try {
            const response = await fetch(config.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const responseData = await response.json();
            newConversationWrapper.style.display = 'none';
            chatInterface.classList.add('active');

            const langCode = currentLang.split('-')[0];
            const botGreetingMessage = document.createElement('div');
            botGreetingMessage.className = 'chat-message bot bot-greeting-message';
            botGreetingMessage.innerHTML = translations[langCode].botGreeting;
            messagesContainer.appendChild(botGreetingMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) { console.error('Error:', error); }
    }

    async function sendMessage(message) {
        // Enviar idioma corto (ej: 'de') en metadatos
        const messageData = { action: "sendMessage", sessionId: currentSessionId, route: config.webhook.route, chatInput: message, metadata: { userId: "", lang: currentLang.split('-')[0] } };
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) });
            const data = await response.json();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) { console.error('Error:', error); }
    }
    
    // La función correctTextRealtime ya no es necesaria si la corrección se hace en n8n
    // function correctTextRealtime(text) { ... }

})();
