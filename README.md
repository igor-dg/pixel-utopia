# Pixel-Utopía

Sitio web para el proyecto artístico "Pixel-Utopía: De la congestión al fluir colectivo", una intervención para la Bienal de Arquitectura Mugak 2025.

## Tecnologías

- HTML5 / CSS3 / JavaScript (vanilla)
- Three.js para efectos 3D
- Compatibilidad con múltiples navegadores y dispositivos
- Diseño responsive

## Características

- **Animación 3D**: Header interactivo creado con Three.js que responde al movimiento del cursor
- **Internacionalización**: Sistema completo para alternar entre español y euskera
- **Visualizador interactivo**: Componente que revela una imagen oculta mediante interacción del usuario
- **Formulario AJAX**: Envío de datos sin recarga de página con validación
- **Sistema de notificaciones**: Implementación de toasts para feedback al usuario

## Estructura del proyecto

```
pixel-utopia/
│
├── index.html             # Documento principal
├── css/
│   └── styles.css         # Estilos del sitio
├── js/
│   ├── header-3d-animation.js  # Animación 3D del encabezado con Three.js
│   ├── i18n.js            # Sistema de internacionalización
│   ├── main.js            # Funciones principales y manejo de eventos
│   ├── translations.js    # Diccionario de traducciones ES/EU
│   └── visualizer.js      # Lógica del visualizador interactivo
├── img/                   # Imágenes y recursos gráficos
└── README.md              # Este archivo
```

## Requisitos

- Navegador moderno con soporte para ES6 y WebGL
- Conexión a internet para cargar las librerías de CDN:
  - Three.js (animación 3D)
  - Font Awesome (iconos)
  - Google Fonts (tipografías)

## Instalación y desarrollo local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/bizikleteroak/pixel-utopia.git
   cd pixel-utopia
   ```

2. Inicia un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx http-server
   ```

3. Abre `http://localhost:8000` en tu navegador

## Características técnicas destacadas

### Sistema de internacionalización

El sistema i18n personalizado permite:
- Cambiar dinámicamente entre español y euskera sin recargar la página
- Persistencia de la preferencia del usuario con localStorage
- Traducción mediante atributos data-i18n y un diccionario centralizado

```javascript
// Ejemplo de uso en HTML
<h2 data-i18n="section.title">Título por defecto</h2>

// Activación del sistema
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('preferredLanguage') || 'es';
    changeLanguage(currentLang);
});
```

### Animación 3D

Implementación avanzada con Three.js que:
- Crea un grid de bloques 3D personalizados
- Adapta la densidad y rendimiento según el dispositivo
- Implementa interactividad con el cursor y eventos de scroll
- Utiliza iluminación y sombras para mejorar la percepción de profundidad

### Visualizador interactivo

- Genera dinámicamente una matriz de píxeles basada en un SVG de referencia
- Implementa detección de intensidad para efectos de revelado
- Ofrece interactividad con eventos de mouse (hover/click)
- Incluye animación secuencial para revelar la imagen completa

## API

El formulario envía datos a:
```
/pixel-utopia/api/process-contact.php
```

Formato esperado:
```json
{
  "name": "Nombre completo",
  "email": "correo@ejemplo.com",
  "subject": "Participación en Pixel-Utopía",
  "message": "Datos adicionales del formulario"
}
```

## Compatibilidad

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Optimizado para dispositivos móviles y tablets

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un nuevo Pull Request

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - consulta el archivo LICENSE para más detalles.

Copyright (c) 2025 Gasteizko Bizikleteroak