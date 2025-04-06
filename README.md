# Pixel-Utopía

Sitio web para el proyecto artístico "Pixel-Utopía: De la congestión al fluir colectivo", una intervención para la Bienal de Arquitectura Mugak 2025.

## Tecnologías

- HTML5 / CSS3 / JavaScript (vanilla)
- Three.js para efectos 3D
- Compatibilidad con múltiples navegadores y dispositivos
- Diseño responsive
- Python para herramientas de procesamiento de fotomosaicos

## Características

- **Animación 3D**: Header interactivo creado con Three.js que responde al movimiento del cursor
- **Internacionalización**: Sistema completo para alternar entre español y euskera
- **Visualizador interactivo**: Componente que revela una imagen oculta mediante interacción del usuario
- **Formulario AJAX**: Envío de datos sin recarga de página con validación
- **Sistema de notificaciones**: Implementación de toasts para feedback al usuario
- **Herramientas de fotomosaico**: Módulos para crear fotomosaicos tanto en línea (Google Colab) como de forma local con aceleración GPU

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
├── tools/                 # Herramientas para creación de contenido
│   └── fotomosaico.py     # Generador de fotomosaicos con aceleración GPU
├── README.md              # Este archivo
├── LICENSE                # Términos de licencia
└── DEPENDENCIES.md        # Listado de dependencias externas del proyecto
```

## Requisitos

- Navegador moderno con soporte para ES6 y WebGL
- Conexión a internet para cargar las librerías de CDN:
  - Three.js (animación 3D)
  - Font Awesome (iconos)
  - Google Fonts (tipografías)

### Requisitos adicionales para herramientas de fotomosaico

Para usar la herramienta local de fotomosaico con GPU:
- Python 3.8+
- PyTorch con soporte CUDA (para GPU) o CPU
- Gradio
- NumPy
- Pandas
- PIL (Pillow)

## Instalación y desarrollo local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/igor-dg/pixel-utopia.git
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

### Instalación de la herramienta de fotomosaico

Para utilizar la herramienta de fotomosaico con aceleración GPU:

1. Instala las dependencias necesarias:
   ```bash
   pip install torch gradio numpy pandas pillow
   ```

2. Para ejecutar la interfaz web de la herramienta:
   ```bash
   cd tools
   python fotomosaico.py
   ```

3. Accede a la interfaz a través del navegador en `http://127.0.0.1:7860`

## Generador de fotomosaicos

El proyecto cuenta con dos herramientas para crear fotomosaicos:

### 1. Google Colab (online)

Para usuarios sin conocimientos técnicos o sin acceso a GPU local, ofrecemos un cuaderno de Google Colab que permite:
- Subir imágenes de referencia
- Utilizar colecciones de imágenes pequeñas
- Ajustar parámetros de generación
- Descargar resultados

Accede al cuaderno: [Pixel-Utopía en Google Colab](https://colab.research.google.com/drive/1sV6eb63uLDpVT65MavrrQGAIJA4kRPh5)

### 2. Herramienta local con aceleración GPU

Para usuarios avanzados o aquellos que necesitan procesar grandes volúmenes de imágenes, ofrecemos una herramienta Python con interfaz gráfica Gradio que:

- Aprovecha la aceleración GPU para un procesamiento mucho más rápido
- Permite procesar miles de imágenes de forma eficiente
- Genera guías de montaje numeradas para la implementación física
- Analiza y proporciona estadísticas sobre el uso de imágenes
- Funciona completamente sin conexión a internet

#### Uso de la herramienta

1. **Interfaz gráfica**: Ejecuta `python tools/fotomosaico.py` para iniciar la interfaz web.

2. **Parámetros principales**:
   - **Imagen Principal**: La imagen que se recreará con el mosaico.
   - **Ruta de la carpeta de imágenes pequeñas**: Directorio que contiene las imágenes que se usarán como "píxeles".
   - **Tamaño de Bloque**: Define el tamaño de cada "pixel" del mosaico (en píxeles).
   - **Tamaño de Imágenes Pequeñas**: Resolución a la que se redimensionarán las imágenes de entrada.
   - **Carpeta de salida**: Donde se guardarán los resultados.

3. **Resultados**:
   - **Fotomosaico**: Imagen final compuesta por todas las imágenes pequeñas.
   - **Guía de montaje**: Versión numerada para facilitar el montaje físico.
   - **Tabla de uso de imágenes**: CSV con el número de imágenes que hay que imprimir.

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

### Algoritmo de fotomosaico con GPU

- Utiliza PyTorch para cálculos vectorizados en GPU
- Implementa algoritmos de matching de color optimizados
- Procesa las imágenes en lotes para mejorar el rendimiento
- Genera metadatos detallados para facilitar el montaje físico

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
