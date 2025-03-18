// Script para el visualizador interactivo
document.addEventListener('DOMContentLoaded', function() {
    initVisualizer();
});

// Inicializar el visualizador de manera asíncrona
async function initVisualizer() {
    // Configuración
    const visualizer = document.querySelector('.visualizer');
    
    // Limpiar el contenedor
    visualizer.innerHTML = '';
    
    // SVG original de la bicicleta (para referencia)
    const svgPath = "M12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5H13.5585C13.9889 5 14.3711 5.27543 14.5072 5.68377L15.2792 8H8.75009L8.00009 7C8.55233 6.99995 9 6.55226 9 6C9 5.44772 8.55228 5 8 5H5C4.44772 5 4 5.44772 4 6C4 6.55228 4.44772 7 5 7H5.50009L6.95959 8.94601C6.90736 9.0303 6.86098 9.11916 6.82112 9.21216L6.01107 11.1023C5.68453 11.0352 5.34638 11 5 11C2.23858 11 0 13.2386 0 16C0 18.7614 2.23858 21 5 21C7.76142 21 10 18.7614 10 16C10 15.8706 9.99509 15.7424 9.98544 15.6155L11.9679 15.0491C12.3671 14.9351 12.7209 14.6996 12.9802 14.3755L16.1032 10.4718L16.5019 11.6678C15.0063 12.5321 14 14.1485 14 16C14 18.7614 16.2386 21 19 21C21.7614 21 24 18.7614 24 16C24 13.2386 21.7614 11 19 11C18.7967 11 18.5963 11.0121 18.3993 11.0357L16.4045 5.05132C15.9962 3.82629 14.8498 3 13.5585 3H12ZM17.1458 13.5998L18.0513 16.3162C18.226 16.8402 18.7923 17.1233 19.3162 16.9487C19.8402 16.774 20.1233 16.2077 19.9487 15.6838L19.0432 12.9674C20.6983 12.9906 22.0329 14.3394 22.0329 16C22.0329 17.675 20.675 19.0329 19 19.0329C17.325 19.0329 15.9671 17.675 15.9671 16C15.9671 15.0233 16.4288 14.1545 17.1458 13.5998ZM7.84914 11.8906L8.32875 10.7715L10.3283 13.4376L9.43675 13.6923C9.06058 12.9706 8.51348 12.3521 7.84914 11.8906ZM10.2501 10L12.0255 12.3673L13.9193 10L10.2501 10ZM7.45806 14.2576C7.33518 14.0846 7.19448 13.9251 7.03865 13.7818L6.74774 14.4606L7.45806 14.2576ZM5.28731 16.9579C5.0705 17.023 4.83046 17.0153 4.60609 16.9191C4.09846 16.7016 3.86331 16.1137 4.08087 15.6061L5.2004 12.9938C5.13416 12.9895 5.06734 12.9873 5 12.9873C3.33612 12.9873 1.98728 14.3361 1.98728 16C1.98728 17.6639 3.33612 19.0127 5 19.0127C6.60321 19.0127 7.91394 17.7605 8.00739 16.1807L5.28731 16.9579Z";
    
    // Crear la estructura básica
    const pixelGridContainer = document.createElement('div');
    pixelGridContainer.className = 'pixel-grid-container';
    
    // Tamaño de la cuadrícula (aumentado para mayor resolución)
    const gridSize = 48; // 48x48 píxeles
    
    // Dibujamos el SVG en un canvas oculto para crear la matriz y calcular intensidades
    const createBicycleMatrixAndIntensities = () => {
        // Creamos un canvas temporal con alta resolución
        const canvas = document.createElement('canvas');
        // Usamos un tamaño de canvas mayor para capturar más detalles
        const canvasSize = 240; // 10x la resolución del SVG original
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        
        // Creamos un SVG temporal con el path
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", canvasSize);
        svg.setAttribute("height", canvasSize);
        svg.setAttribute("viewBox", "0 0 24 24"); // Mantenemos el viewBox original
        
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", svgPath);
        path.setAttribute("fill", "#ffffff");
        svg.appendChild(path);
        
        // Convertimos el SVG a una imagen para dibujarla en el canvas
        const svgString = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.src = "data:image/svg+xml;base64," + btoa(svgString);
        
        // Creamos una matriz inicializada con ceros del tamaño deseado
        const matrix = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // Matriz para almacenar las intensidades (qué tan cerca está cada píxel del centro del trazo)
        const intensities = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // Cuando la imagen cargue, la dibujamos en el canvas y analizamos los pixels
        return new Promise(resolve => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
                const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
                const data = imageData.data;
                
                // Recorremos los pixels del canvas y los mapeamos a nuestra matriz más pequeña
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        // Calculamos las coordenadas correspondientes en el canvas de alta resolución
                        const canvasX = Math.floor(x * (canvasSize / gridSize));
                        const canvasY = Math.floor(y * (canvasSize / gridSize));
                        
                        // Verificamos un área de píxeles para determinar si hay contenido y su intensidad
                        let hasContent = false;
                        let maxIntensity = 0;
                        const sampleSize = Math.floor(canvasSize / gridSize);
                        
                        // Muestreamos un área para determinar si este "pixel" de la cuadrícula debe estar activo
                        for (let sy = 0; sy < sampleSize; sy++) {
                            for (let sx = 0; sx < sampleSize; sx++) {
                                const i = ((canvasY + sy) * canvasSize + (canvasX + sx)) * 4;
                                // Si hay algún color visible
                                if (data[i + 3] > 0) { // Alpha > 0
                                    hasContent = true;
                                    // Guardamos la mayor intensidad (opacidad) encontrada en el área
                                    const alphaValue = data[i + 3];
                                    if (alphaValue > maxIntensity) {
                                        maxIntensity = alphaValue;
                                    }
                                }
                            }
                        }
                        
                        matrix[y][x] = hasContent ? 1 : 0;
                        // Normalizamos la intensidad a un valor entre 0 y 1
                        intensities[y][x] = maxIntensity / 255;
                    }
                }
                
                resolve({ matrix, intensities });
            };
        });
    };
    
    // Función para crear la visualización con la matriz e intensidades de la bicicleta
    const createVisualization = async () => {
        // Obtenemos la matriz y las intensidades
        const { matrix: bicycleMatrix, intensities: bicycleIntensities } = await createBicycleMatrixAndIntensities();
        
        // Contamos cuántos píxeles componen la bicicleta
        const totalBicyclePixels = bicycleMatrix.flat().filter(value => value === 1).length;
        let discoveredPixels = 0;
        
        // Creamos la cuadrícula
        const pixelGrid = document.createElement('div');
        pixelGrid.className = 'pixel-grid';
        pixelGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        pixelGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        // Creamos los píxeles en la cuadrícula
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                
                // Generamos tonos aleatorios de rojo para la congestión
                const redValue = 170 + Math.floor(Math.random() * 60); // Entre 170-230
                const opacity = 0.8 + Math.random() * 0.2; // Entre 0.8-1.0
                
                pixel.style.backgroundColor = `rgba(${redValue}, 30, 50, ${opacity})`;
                
                // Si este pixel forma parte de la bicicleta
                if (bicycleMatrix[i][j] === 1) {
                    pixel.dataset.bicycle = "true";
                    
                    // Guardamos la intensidad para usarla al revelar
                    pixel.dataset.intensity = bicycleIntensities[i][j];
                    
                    // Función para revelar el pixel
                    const revealPixel = (el) => {
                        if (!el.classList.contains('revealed')) {
                            // Obtenemos la intensidad (qué tan cerca está del trazo principal)
                            const intensity = parseFloat(el.dataset.intensity);
                            
                            // Usamos la intensidad para determinar el tono de verde
                            // Generamos un verde más oscuro cuanto más cerca esté del centro del trazo
                            const greenBase = 160; // Base del valor verde
                            const greenIntensity = Math.floor(60 + (1 - intensity) * 140); // Entre 60-200
                            const blueIntensity = Math.floor(100 + (1 - intensity) * 80); // Entre 100-180
                            
                            el.style.backgroundColor = `rgba(27, ${greenBase + greenIntensity}, ${blueIntensity}, ${opacity})`;
                            el.classList.add('revealed');
                            
                            // Incrementamos contador
                            discoveredPixels++;
                            
                            // Calculamos porcentaje completado
                            const percentComplete = (discoveredPixels / totalBicyclePixels) * 100;
                            
                            // Si hemos revelado más del 70%
                            if (percentComplete >= 70 && !document.querySelector('.completion-message')) {
                                showCompletionMessage();
                            }
                        }
                    };
                    
                    // Revelar al hacer clic
                    pixel.addEventListener('click', function() {
                        revealPixel(this);
                    });
                    
                    // Revelar también al hacer hover
                    let hoverTimer;
                    pixel.addEventListener('mouseenter', function() {
                        if (!this.classList.contains('revealed')) {
                            // Efecto de hover
                            this.style.backgroundColor = `rgba(220, 80, 80, ${opacity})`;
                            this.style.transform = 'scale(1.05)';
                            
                            // Configuramos un temporizador corto
                            hoverTimer = setTimeout(() => {
                                revealPixel(this);
                            }, 100); // 100ms de retraso
                        }
                    });
                    
                    pixel.addEventListener('mouseleave', function() {
                        // Cancelamos el temporizador si el mouse sale antes de tiempo
                        clearTimeout(hoverTimer);
                        
                        // Restauramos el aspecto si no ha sido revelado
                        if (!this.classList.contains('revealed')) {
                            this.style.backgroundColor = `rgba(${redValue}, 30, 50, ${opacity})`;
                            this.style.transform = '';
                        }
                    });
                } else {
                    // Para píxeles que no son parte de la bicicleta
                    pixel.addEventListener('mouseenter', function() {
                        // Oscurecemos ligeramente
                        this.style.backgroundColor = `rgba(${redValue-40}, 20, 30, ${opacity})`;
                        this.style.transform = 'scale(0.98)';
                    });
                    
                    pixel.addEventListener('mouseleave', function() {
                        // Restauramos el color original
                        this.style.backgroundColor = `rgba(${redValue}, 30, 50, ${opacity})`;
                        this.style.transform = '';
                    });
                }
                
                pixelGrid.appendChild(pixel);
            }
        }
        
        // Función para mostrar el mensaje de completado
        function showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'completion-message';
    
    // Obtener el mensaje de las traducciones según el idioma actual
    const currentLang = localStorage.getItem('preferredLanguage') || 'es';
    const completionMessage = translations[currentLang]['visualizer.completion'] || 
                            translations['es']['visualizer.completion']; // Fallback a español
    
    message.innerHTML = `
        <div class="message-content">
            ${completionMessage}
        </div>
        <button class="close-message">×</button>
    `;
    visualizer.appendChild(message);
    visualizer.classList.add('completed');
            
            // Agregamos funcionalidad para cerrar el mensaje
            const closeButton = message.querySelector('.close-message');
            closeButton.addEventListener('click', function() {
                message.remove();
            });
            
            // Revelamos todos los píxeles restantes de forma escalonada
            revealRemainingPixels();
        }
        
        // Función para revelar los píxeles restantes
        function revealRemainingPixels() {
            const unrevealed = Array.from(document.querySelectorAll('.pixel[data-bicycle="true"]:not(.revealed)'));
            
            unrevealed.forEach((pixel, index) => {
                setTimeout(() => {
                    pixel.click();
                }, index * 15); // Revelamos cada 15ms
            });
        }
        
        // Botón para revelar automáticamente
        const revealButton = document.createElement('button');
        revealButton.className = 'reveal-button';
        revealButton.textContent = translations[localStorage.getItem('preferredLanguage') || 'es']['visualizer.reveal'];
        revealButton.addEventListener('click', function() {
            // Si ya están todos revelados, no hacemos nada
            const unrevealed = document.querySelectorAll('.pixel[data-bicycle="true"]:not(.revealed)');
            if (unrevealed.length === 0) return;
            
            // Desactivamos el botón durante la animación
            this.disabled = true;
            this.textContent = translations[localStorage.getItem('preferredLanguage') || 'es']['visualizer.revealing'];
            
            // Revelamos todos los píxeles de forma rápida pero escalonada
            const revealInterval = 5; // ms entre revelaciones
            let index = 0;
            
            const revealNext = () => {
                if (index < unrevealed.length) {
                    unrevealed[index].click();
                    index++;
                    setTimeout(revealNext, revealInterval);
                } else {
                    // Restauramos el botón cuando termine
                    revealButton.disabled = false;
                    revealButton.textContent = translations[localStorage.getItem('preferredLanguage') || 'es']['visualizer.reveal'];
                }
            };
            
            revealNext();
        });
        
        // Botón de reinicio
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-button';
        resetButton.textContent = translations[localStorage.getItem('preferredLanguage') || 'es']['visualizer.reset'];
        resetButton.addEventListener('click', function() {
            // Resetear contador
            discoveredPixels = 0;
            
            // Resetear todos los píxeles
            document.querySelectorAll('.pixel').forEach(pixel => {
                if (pixel.classList.contains('revealed')) {
                    pixel.classList.remove('revealed');
                    const redValue = 170 + Math.floor(Math.random() * 60);
                    const opacity = 0.8 + Math.random() * 0.2;
                    pixel.style.backgroundColor = `rgba(${redValue}, 30, 50, ${opacity})`;
                    pixel.style.transform = '';
                }
            });
            
            // Eliminar mensaje de completado si existe
            const message = document.querySelector('.completion-message');
            if (message) {
                message.remove();
            }
            
            // Quitar clase de completado
            visualizer.classList.remove('completed');
        });
        
        // Añadir botones y cuadrícula al visualizador
        pixelGridContainer.appendChild(pixelGrid);
        visualizer.appendChild(pixelGridContainer);
        
        // Contenedor para los botones
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(revealButton);
        buttonContainer.appendChild(resetButton);
        visualizer.appendChild(buttonContainer);
        
        // Añadir instrucciones
        const instructions = document.createElement('p');
        instructions.className = 'instructions';
        instructions.textContent = translations[localStorage.getItem('preferredLanguage') || 'es']['visualizer.instructions'];
        visualizer.parentNode.insertBefore(instructions, visualizer.nextSibling);
    };
    
    // Iniciar la visualización
    createVisualization();

    // Escuchar cambios de idioma
window.addEventListener('languageChange', function(e) {
    // Actualizar textos de los botones e instrucciones
    if (revealButton && !revealButton.disabled) {
        revealButton.textContent = translations[e.detail.lang]['visualizer.reveal'];
    }
    resetButton.textContent = translations[e.detail.lang]['visualizer.reset'];
    instructions.textContent = translations[e.detail.lang]['visualizer.instructions'];
    
    // Actualizar mensaje de completado si está visible
    const messageContent = document.querySelector('.completion-message .message-content');
    if (messageContent) {
        messageContent.innerHTML = translations[e.detail.lang]['visualizer.completion'];
    }
});
};