// Sistema de internacionalización
document.addEventListener('DOMContentLoaded', function() {
    // Valor por defecto: español
    let currentLang = 'es';
    
    // Comprobar si hay un idioma guardado en localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    
    // Función para cambiar el idioma
    function changeLanguage(lang) {
        if (!translations[lang]) {
            console.error(`El idioma "${lang}" no está disponible.`);
            return;
        }
        
        currentLang = lang;
        updateContent();
        updateLangButtons();
        
        // Guardar preferencia en localStorage
        localStorage.setItem('preferredLanguage', lang);
        
        // Cambiar atributo lang del documento HTML
        document.documentElement.lang = lang;
    }
    
    // Actualizar contenido según el idioma seleccionado
    function updateContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (translations[currentLang][key]) {
                // Comprobar si el contenido debe insertarse como HTML
                if (key.includes('html') || translations[currentLang][key].includes('<')) {
                    element.innerHTML = translations[currentLang][key];
                } else {
                    element.textContent = translations[currentLang][key];
                }
            } else {
                console.warn(`Clave de traducción "${key}" no encontrada para el idioma "${currentLang}"`);
            }
        });
        
        // Actualizar placeholder y contenido en formularios
        updateFormElements();
    }
    
    // Actualizar elementos de formulario (placeholders, opciones, etc.)
    function updateFormElements() {
        // Actualizar opciones de select
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                if (option.hasAttribute('data-i18n')) {
                    const key = option.getAttribute('data-i18n');
                    if (translations[currentLang][key]) {
                        option.textContent = translations[currentLang][key];
                    }
                }
            });
        });
    }
    
    // Actualizar estado de los botones de idioma
    function updateLangButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            const buttonLang = button.getAttribute('data-lang');
            if (buttonLang === currentLang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    // Añadir evento click a los botones de idioma
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    
    // Inicializar con el idioma actual
    changeLanguage(currentLang);
});