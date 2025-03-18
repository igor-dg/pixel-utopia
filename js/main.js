// Archivo principal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Validación del formulario
    // Envío del formulario mediante AJAX
const form = document.getElementById('participacion-form');
if (form) {
    form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Crear objeto con los datos del formulario (con trim para eliminar espacios)
    const formData = {
        name: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(), // Email limpio
        subject: 'Participación en Pixel-Utopía',
        message: `
            Teléfono: ${document.getElementById('telefono').value.trim()}
            Participación: ${document.getElementById('participacion').value}
            Comentarios: ${document.getElementById('comentarios').value.trim()}
        `
    };
        
        // Indicador de carga
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        
        // Obtener mensaje según el idioma seleccionado
        const currentLang = localStorage.getItem('preferredLanguage') || 'es';
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
                               (translations[currentLang]['form.sending'] || 'Enviando...');
        
        // Enviar datos al servidor
        fetch('https://idg.eus/bizikleteroak/pixel-utopia/api/process-contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            
            if (data.success) {
                // Mensaje de éxito con toast en lugar de alert
                showLocalizedToast('form.thanks', 'success');
                form.reset();
            } else {
                // Mensaje de error con toast en lugar de alert
                showLocalizedToast('form.error', 'error');
            }
        })
        .catch(error => {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            
            // Mensaje de error de conexión con toast en lugar de alert
            showLocalizedToast('form.connectionError', 'error');
            console.error('Error:', error);
        });
    });
}

    // Animación suave al scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Detector de cambio de idioma para actualizar elementos dinámicos
    window.addEventListener('languageChange', function(e) {
        // Actualizar elementos dinámicos que no se manejan automáticamente
        updateDynamicElements(e.detail.lang);
    });
    
    // Función para actualizar elementos dinámicos basados en el idioma
    function updateDynamicElements(lang) {
        // Actualizar elementos del visualizador si existen
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.textContent = translations[lang]['visualizer.instructions'] || 
                                    translations['es']['visualizer.instructions'];
        }
        
        const revealButton = document.querySelector('.reveal-button');
        if (revealButton && !revealButton.disabled) {
            revealButton.textContent = translations[lang]['visualizer.reveal'] || 
                                    translations['es']['visualizer.reveal'];
        }
        
        const resetButton = document.querySelector('.reset-button');
        if (resetButton) {
            resetButton.textContent = translations[lang]['visualizer.reset'] || 
                                    translations['es']['visualizer.reset'];
        }
        
        // Actualizar el mensaje de completado si está presente
        const completionMessage = document.querySelector('.completion-message .message-content');
        if (completionMessage) {
            completionMessage.innerHTML = translations[lang]['visualizer.completion'] || 
                                    translations['es']['visualizer.completion'];
        }
    }
    
    // Actualizar elementos al cargar la página
    const currentLang = localStorage.getItem('preferredLanguage') || 'es';
    updateDynamicElements(currentLang);
    
    // Gestión de URL para idioma (para poder compartir enlaces con idioma predefinido)
    function handleURLLanguageParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        
        if (langParam && translations[langParam]) {
            // Solo cambiamos si el idioma es diferente al actual
            const currentLang = localStorage.getItem('preferredLanguage') || 'es';
            if (langParam !== currentLang) {
                // Disparar clic en el botón de idioma correspondiente
                const langButton = document.querySelector(`.lang-btn[data-lang="${langParam}"]`);
                if (langButton) {
                    langButton.click();
                }
            }
        }
    }
    
    // Detectar idioma en URL al cargar
    handleURLLanguageParam();
});

// Función para mostrar toast
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    
    // Crear el toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Determinar el icono adecuado
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    // Crear el contenido del toast
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;
    
    // Añadir al contenedor
    container.appendChild(toast);
    
    // Configurar el cierre automático
    const timeout = setTimeout(() => {
        closeToast(toast);
    }, duration);
    
    // Permitir cerrar manualmente
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeout);
        closeToast(toast);
    });
}

// Función para cerrar un toast
function closeToast(toast) {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Usar la configuración de idioma
function showLocalizedToast(key, type = 'info', duration = 5000) {
    const currentLang = localStorage.getItem('preferredLanguage') || 'es';
    const message = translations[currentLang][key] || translations['es'][key] || key;
    showToast(message, type, duration);
}