// También necesitamos inicializar estas variables
let mouseX = 0, mouseY = 0;
let targetRotationX = -0.2; // Inclinación inicial sutil
let targetRotationY = 0;// Animación 3D mejorada para el header usando Three.js
document.addEventListener('DOMContentLoaded', function() {
// Verificar soporte para WebGL
if (!window.WebGLRenderingContext) {
    console.warn('WebGL no está soportado. La animación 3D no se mostrará.');
    return;
}

// Configuración inicial
const headerElement = document.querySelector('header');
if (!headerElement) return;

// Crear contenedor para la animación
const animContainer = document.createElement('div');
animContainer.className = 'header-3d-container';
headerElement.insertBefore(animContainer, headerElement.firstChild);

// Dimensiones del contenedor
const width = animContainer.clientWidth;
const height = animContainer.clientHeight;

// Determinar la densidad de la cuadrícula según el dispositivo
const isMobile = window.innerWidth < 768;
// En móvil usamos la misma densidad que en desktop para mantener el tamaño de bloque
// Incluso podríamos usar más bloques en móvil para que sean más pequeños
const gridSize = 40; // Misma densidad en todos los dispositivos

// Configuración de Three.js
const scene = new THREE.Scene();

// Ajustar cámara según el dispositivo, manteniendo la densidad constante
const camera = new THREE.PerspectiveCamera(isMobile ? 55 : 45, width / height, 0.1, 1000);
// En móvil acercamos la cámara para compensar la pantalla más pequeña
camera.position.z = isMobile ? 250 : 300;
camera.position.y = isMobile ? -120 : -150;
camera.lookAt(0, 0, 0);

// Renderer con antialiasing y sombras para mejor calidad visual
const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: !isMobile // Desactivamos antialiasing en móvil para mejor rendimiento
});
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)); // Limitamos el pixel ratio en móvil
renderer.shadowMap.enabled = !isMobile; // Desactivamos sombras en móvil para mejor rendimiento
if (!isMobile) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves solo en desktop
}
animContainer.appendChild(renderer.domElement);

// Obtener colores del tema del sitio
const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim() || '#b01b2f';

// Convertir color a formato Three.js
const colorValue = parseInt(primaryColor.replace('#', '0x'));

// Grupos para organizar los cubos
const blockGroup = new THREE.Group();
scene.add(blockGroup);

// Tamaño de los bloques
const blockSize = Math.max(width, height) / gridSize;

// Crear la cuadrícula de bloques
const blocks = [];

for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        // Geometría del bloque sin espacios entre ellos para mejor efecto de fotomosaico
        // pero manteniendo la altura variable para simular las capas de cartón pluma
        const height = 0.3 + Math.random() * 1.2; // Mayor variación de altura
        // Ajustar la relación de aspecto para que sean ligeramente diferentes
        // y añadir un sutil espacio entre bloques para mejor definición
        const widthVariation = 0.95 + (Math.random() * 0.05); // Entre 0.95 y 1.0
        const heightVariation = 0.95 + (Math.random() * 0.05); // Entre 0.95 y 1.0
        
        const geometry = new THREE.BoxGeometry(
            blockSize * widthVariation * 0.98, // Sutil espacio entre bloques (2%)
            blockSize * heightVariation * 0.98, // Sutil espacio entre bloques (2%)
            blockSize * height
        );
        
        // Generamos variaciones aleatorias del color base para cada bloque
        const colorVariation = 0.5; // Aumentamos el rango de variación (50%)
        const randomFactor = 0.75 + (Math.random() * colorVariation); // Entre 0.75 y 1.25
        
        // Color base pero con variación aleatoria para cada bloque
        const baseColor = new THREE.Color(colorValue).multiplyScalar(randomFactor);
        
        // Variación en brillos para cada bloque
        const shininessVariation = Math.random() * 15; // Variación adicional
        
        // Aplicamos diferentes tonalidades a las caras para mejor percepción 3D
        const topColor = baseColor.clone();
        const sideColor = baseColor.clone().multiplyScalar(0.85); // Ligeramente más oscuro
        const bottomColor = baseColor.clone().multiplyScalar(0.7); // Más oscuro
        
        // Pequeñas variaciones en el tono para cada cara lateral
        const sideFrontColor = sideColor.clone().multiplyScalar(0.95 + Math.random() * 0.1);
        const sideBackColor = sideColor.clone().multiplyScalar(0.95 + Math.random() * 0.1);
        const sideLeftColor = sideColor.clone().multiplyScalar(0.95 + Math.random() * 0.1);
        const sideRightColor = sideColor.clone().multiplyScalar(0.95 + Math.random() * 0.1);
        
        // Optimización para móviles: menos variación en caras laterales para mejorar rendimiento
        const materials = [];
        
        if (isMobile) {
            // Versión simplificada para móviles: solo 3 materiales diferentes (arriba, lados, abajo)
            materials.push(
                new THREE.MeshPhongMaterial({ color: sideColor, shininess: 20 + shininessVariation }), // Right
                new THREE.MeshPhongMaterial({ color: sideColor, shininess: 20 + shininessVariation }), // Left
                new THREE.MeshPhongMaterial({ color: topColor, shininess: 30 + shininessVariation }), // Top
                new THREE.MeshPhongMaterial({ color: bottomColor, shininess: 10 + shininessVariation }), // Bottom
                new THREE.MeshPhongMaterial({ color: sideColor, shininess: 20 + shininessVariation }), // Front
                new THREE.MeshPhongMaterial({ color: sideColor, shininess: 20 + shininessVariation }) // Back
            );
        } else {
            // Versión completa para desktop: cada cara lateral con su propio tono
            materials.push(
                new THREE.MeshPhongMaterial({ color: sideRightColor, shininess: 20 + shininessVariation }), // Right
                new THREE.MeshPhongMaterial({ color: sideLeftColor, shininess: 20 + shininessVariation }), // Left
                new THREE.MeshPhongMaterial({ color: topColor, shininess: 30 + shininessVariation }), // Top
                new THREE.MeshPhongMaterial({ color: bottomColor, shininess: 10 + shininessVariation }), // Bottom
                new THREE.MeshPhongMaterial({ color: sideFrontColor, shininess: 20 + shininessVariation }), // Front
                new THREE.MeshPhongMaterial({ color: sideBackColor, shininess: 20 + shininessVariation }) // Back
            );
        }
        
        // Calcular distancia desde el centro
        const distanceFromCenter = Math.sqrt(
            Math.pow((x - gridSize/2) / (gridSize/2), 2) + 
            Math.pow((y - gridSize/2) / (gridSize/2), 2)
        );
        
        // Ajustar materiales según la distancia desde el centro
        if (distanceFromCenter >= 0.5) {
            // Para bloques periféricos, oscurecemos aún más los colores
            materials.forEach(mat => {
                mat.color.multiplyScalar(0.7);
            });
        }
        
        // Crear el bloque con materiales múltiples para mejor efecto 3D
        const block = new THREE.Mesh(geometry, materials);
        
        // Configurar para recibir y proyectar sombras
        block.castShadow = true;
        block.receiveShadow = true;
        
        // Posicionamiento en cuadrícula perfecta sin espacios
        const offsetX = (x - gridSize / 2) * blockSize;
        const offsetY = (y - gridSize / 2) * blockSize;
        block.position.set(offsetX, offsetY, 0);
        
        // Datos para la animación - movimientos más sutiles debido a la mayor densidad
        block.userData = {
            originalX: offsetX,
            originalY: offsetY,
            baseZ: -blockSize * height / 2, // Posición inicial en Z (hundido)
            targetZ: -blockSize * height / 2, // Posición objetivo en Z
            amplitude: 1 + Math.random() * 6, // Reducida para movimientos más sutiles
            speed: 0.2 + Math.random() * 0.8, // Reducida para movimientos más armónicos
            phase: Math.random() * Math.PI * 2,
            distanceFromCenter: distanceFromCenter
        };
        
        // Inicializar bloque en posición hundida
        block.position.z = block.userData.baseZ;
        
        blockGroup.add(block);
        blocks.push(block);
    }
}

// Iluminación mejorada con sombras
// Luz ambiental suave
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Luz direccional principal con sombra
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 150);
directionalLight.castShadow = true;

// Configuración precisa de las sombras
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.bias = -0.001;
scene.add(directionalLight);

// Luz de acento desde abajo
const accentLight = new THREE.DirectionalLight(parseInt(primaryColor.replace('#', '0x')), 0.4);
accentLight.position.set(-30, -50, 80);
scene.add(accentLight);

// Eventos para ratón (desktop)
document.addEventListener('mousemove', function(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    
    // Rotación mínima para que se aprecien las alturas pero siga pareciendo vista cenital
    targetRotationY = mouseX * 0.05;
    targetRotationX = -0.2 + (mouseY * 0.03); // Mantenemos cierta inclinación base
});

// No bloqueamos el scroll en dispositivos táctiles, pero mantenemos animación autónoma

// Interacción con scroll
let scrollFactor = 0;
window.addEventListener('scroll', function() {
    // Calcular cuánto ha scrolleado el usuario en relación al header
    const headerRect = headerElement.getBoundingClientRect();
    const headerVisibility = 1 - Math.min(1, Math.max(0, -headerRect.top / headerRect.height));
    
    scrollFactor = headerVisibility;
});

// Efecto de patrón inicial al cargar la página
function triggerInitialPatternEffect() {
    // Crear un patrón que muestre el concepto de fotomosaico
    blocks.forEach((block, index) => {
        // Determinar si este bloque forma parte del patrón
        const blockX = block.position.x / (blockSize * gridSize / 2);
        const blockY = block.position.y / (blockSize * gridSize / 2);
        
        // Calcular distancia desde el centro
        const distanceFromCenter = Math.sqrt(blockX * blockX + blockY * blockY);
        
        // Crear un efecto de círculo o bicicleta simplificada
        let isPartOfPattern = false;
        
        // Círculo exterior - más delgado debido a la mayor densidad
        if (distanceFromCenter > 0.35 && distanceFromCenter < 0.4) {
            isPartOfPattern = true;
        }
        
        // Simular manillar y tubo - más delgado
        if (Math.abs(blockY) < 0.08 && blockX > 0.1 && blockX < 0.35) {
            isPartOfPattern = true;
        }
        
        // Simular cuadro
        if (Math.abs(blockY + blockX - 0.1) < 0.06 && blockX > -0.2 && blockX < 0.15) {
            isPartOfPattern = true;
        }
        
        // Simular ruedas (círculos más pequeños)
        const distFromRightWheel = Math.sqrt(Math.pow(blockX - 0.25, 2) + Math.pow(blockY - 0, 2));
        const distFromLeftWheel = Math.sqrt(Math.pow(blockX + 0.25, 2) + Math.pow(blockY - 0, 2));
        
        if (distFromRightWheel < 0.1 || distFromLeftWheel < 0.1) {
            isPartOfPattern = true;
        }
        
        // Aplicar animación según si forma parte del patrón
        if (isPartOfPattern) {
            // Calcular retraso basado en la distancia desde el centro
            const delay = block.userData.distanceFromCenter * 800; // ms
            
            setTimeout(() => {
                block.userData.targetZ = 15; // Elevación menos agresiva por la mayor densidad
                
                // Mantener arriba un tiempo y luego bajar
                setTimeout(() => {
                    block.userData.targetZ = block.userData.baseZ;
                }, 2000); // Mantener 2 segundos
            }, delay);
        }
    });
}

// Activar el patrón inicial después de un breve retraso
setTimeout(triggerInitialPatternEffect, 800);

// Interactividad al hacer clic
animContainer.addEventListener('click', function(event) {
    // Convertir coordenadas del clic a coordenadas normalizadas (-1 a 1)
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Crear efecto de onda desde el punto de clic
    blocks.forEach(block => {
        // Calcular distancia desde el clic al bloque
        const blockX = block.position.x / (blockSize * gridSize / 2);
        const blockY = block.position.y / (blockSize * gridSize / 2);
        
        const distance = Math.sqrt(Math.pow(blockX - x, 2) + Math.pow(blockY - y, 2));
        
        // Aplicar efecto con retraso basado en la distancia
        setTimeout(() => {
            block.userData.targetZ = 15 * (1 - Math.min(1, distance)); // Mayor altura para bloques cercanos
            
            // Volver a la posición normal después de un tiempo
            setTimeout(() => {
                block.userData.targetZ = block.userData.baseZ;
            }, 300);
        }, distance * 200); // Retraso proporcional a la distancia
    });
});

// Asegurar que se renderice al menos una vez al inicio, sin esperar interacción
renderer.render(scene, camera);

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Restauramos la rotación sutil del grupo para apreciar el efecto 3D
    blockGroup.rotation.y += (targetRotationY - blockGroup.rotation.y) * 0.05;
    blockGroup.rotation.x += (targetRotationX - blockGroup.rotation.x) * 0.05;
    
    const time = Date.now() * 0.001;
    
    blocks.forEach(block => {
        const { amplitude, speed, phase, distanceFromCenter } = block.userData;
        
        // Movimiento base sinusoidal
        const baseMovement = amplitude * Math.sin(time * speed + phase);
        
        // Calcular movimiento con factores adicionales
        let targetHeight = block.userData.targetZ;
        
        // Modificar la altura según el scroll
        const scrollInfluence = 15 * (1 - scrollFactor) * (1 - distanceFromCenter);
        targetHeight += scrollInfluence;
        
        // Añadir movimiento sinusoidal sutil
        targetHeight += baseMovement * 0.5;
        
        // Asegurar animación continua incluso sin interacción del usuario
        // Una muy sutil pulsación constante para que los bloques siempre tengan algo de movimiento
        // Movimiento global más sutil y lento para una experiencia más delicada
        targetHeight += Math.sin(time * 0.3) * 1.5; // Movimiento global más lento y sutil
        
        // Influencia del cursor: cuando el mouse se acerca a un bloque, este sube ligeramente
        // Calcular distancia normalizada del cursor al bloque
        const blockX = block.position.x / (blockSize * gridSize / 2);
        const blockY = block.position.y / (blockSize * gridSize / 2);
        const cursorDistance = Math.sqrt(Math.pow(blockX - mouseX, 2) + Math.pow(blockY - mouseY, 2));
        
        // Si el cursor está cerca, el bloque sube más
        if (cursorDistance < 0.6) {
            const cursorInfluence = 10 * (1 - Math.min(1, cursorDistance / 0.6));
            targetHeight += cursorInfluence;
        }
        
        // Suavizar el movimiento
        block.position.z += (targetHeight - block.position.z) * 0.1;
        
        // Eliminamos la rotación para mantener solo movimiento en eje Z
    });
    
    renderer.render(scene, camera);
}

// También forzamos una actualización en caso de que el usuario cambie el tamaño de la ventana o gire el dispositivo
function onWindowResize() {
    const newWidth = animContainer.clientWidth;
    const newHeight = animContainer.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(newWidth, newHeight);
    
    // Forzar un renderizado inmediato después de cambiar tamaño
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize);

// Iniciar animación con un movimiento sutil pero más lento
animate();

// Simulación de interacción inicial más suave
setTimeout(() => {
    // Valores iniciales para que se aprecie el efecto 3D
    targetRotationY = 0.05;
    targetRotationX = -0.2;
    
    // Activar una "onda" inicial de movimiento en los bloques, pero más lenta
    blocks.forEach(block => {
        // Subir ligeramente los bloques en secuencia para que se note la animación
        setTimeout(() => {
            block.userData.targetZ = 5 + Math.random() * 5; // Altura más sutil
            
            // Y luego bajar después de un tiempo más largo
            setTimeout(() => {
                block.userData.targetZ = block.userData.baseZ;
            }, 800 + Math.random() * 1200); // Entre 0.8 y 2 segundos
        }, Math.random() * 2000); // Distribuir en 2 segundos para efecto más lento
    });
    
    // Forzar un renderizado inmediato
    blockGroup.rotation.y = targetRotationY;
    blockGroup.rotation.x = targetRotationX;
    renderer.render(scene, camera);
}, 300); // Un poco más de retraso inicial
});