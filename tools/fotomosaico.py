import gradio as gr
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import pandas as pd
import io
import torch
import time

# Verificar si hay GPU disponible
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Usando dispositivo: {device}")

def color_promedio_gpu(imagen):
    """Calcula el color promedio usando GPU si está disponible"""
    np_imagen = np.array(imagen)
    w, h, d = np_imagen.shape
    # Convertir a tensor y mover a GPU
    tensor_imagen = torch.tensor(np_imagen, dtype=torch.float32).to(device)
    # Calcular promedio
    tensor_promedio = torch.mean(tensor_imagen.view(w * h, d), dim=0)
    # Devolver como numpy array
    return tensor_promedio.cpu().numpy()

def calcular_distancias_gpu(colores_promedio, color_bloque):
    """Calcula las distancias de color utilizando GPU para acelerar"""
    # Convertir a tensores
    tensor_colores = torch.tensor(colores_promedio, dtype=torch.float32).to(device)
    tensor_color_bloque = torch.tensor(color_bloque, dtype=torch.float32).to(device)
    
    # Calcular distancias euclidianas
    diff = tensor_colores - tensor_color_bloque
    distancias = torch.norm(diff, dim=1)
    
    # Encontrar el índice del valor mínimo
    indice_mejor = torch.argmin(distancias).item()
    
    return indice_mejor

def crear_fotomosaico_con_info(imagen_principal, imagenes_pequenas, colores_promedio, tam_bloque, nombres_archivos):
    """Crea el fotomosaico y devuelve información adicional sobre las imágenes usadas"""
    tiempo_inicio = time.time()
    
    ancho_principal, alto_principal = imagen_principal.size
    fotomosaico = Image.new('RGB', (ancho_principal, alto_principal))
    fotomosaico_guia = Image.new('RGB', (ancho_principal, alto_principal), color=(255, 255, 255))
    draw = ImageDraw.Draw(fotomosaico_guia)

    # Intentar cargar una fuente, si no está disponible usaremos la predeterminada
    try:
        # Rutas de fuente para diferentes sistemas operativos
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "C:/Windows/Fonts/arial.ttf",                       # Windows
            "/Library/Fonts/Arial.ttf"                          # macOS
        ]
        
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, 10)
                break
                
        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Información sobre uso de imágenes
    uso_imagenes = {i: 0 for i in range(len(imagenes_pequenas))}
    mapa_posiciones = []

    # Convertir colores_promedio a tensor para GPU de una sola vez
    colores_promedio_tensor = torch.tensor(colores_promedio, dtype=torch.float32).to(device)
    
    # Procesar bloques por lotes para mejor rendimiento en GPU
    bloques_info = []
    
    # Recopilar información de todos los bloques
    for y in range(0, alto_principal, tam_bloque):
        for x in range(0, ancho_principal, tam_bloque):
            caja = (x, y, min(x + tam_bloque, ancho_principal), min(y + tam_bloque, alto_principal))
            bloque = imagen_principal.crop(caja)
            bloque_np = np.array(bloque)
            
            if len(bloque_np.shape) == 3 and bloque_np.shape[2] >= 3:
                color_bloque = color_promedio_gpu(bloque)
                bloques_info.append((x, y, caja, color_bloque))
    
    # Procesar lotes de bloques para mejorar rendimiento
    lote_size = 100  # Tamaño del lote a procesar a la vez
    for i in range(0, len(bloques_info), lote_size):
        lote_actual = bloques_info[i:i+lote_size]
        
        # Procesar cada bloque en el lote
        for x, y, caja, color_bloque in lote_actual:
            # Calcular el índice de la imagen más cercana en el espacio de color
            tensor_color_bloque = torch.tensor(color_bloque, dtype=torch.float32).to(device)
            diff = colores_promedio_tensor - tensor_color_bloque
            distancias = torch.norm(diff, dim=1)
            indice_mejor = torch.argmin(distancias).item()
            
            # Redimensionar la imagen pequeña para que se ajuste al bloque
            ancho_bloque = caja[2] - caja[0]
            alto_bloque = caja[3] - caja[1]
            imagen_mejor = imagenes_pequenas[indice_mejor].resize((ancho_bloque, alto_bloque))
            
            fotomosaico.paste(imagen_mejor, caja)
            
            # Registrar el uso de esta imagen
            uso_imagenes[indice_mejor] += 1
            
            # Guardar información de posición
            mapa_posiciones.append({
                'posicion_x': x,
                'posicion_y': y,
                'indice_imagen': indice_mejor,
                'nombre_archivo': nombres_archivos[indice_mejor]
            })
            
            # Dibujar un rectángulo en la imagen guía
            draw.rectangle([caja[0], caja[1], caja[2]-1, caja[3]-1], outline=(0, 0, 0))
            
            # Dibujar el número de índice en el centro del rectángulo
            texto = str(indice_mejor)
            
            # Manejo de la medición del texto para diferentes versiones de PIL
            if hasattr(draw, 'textsize'):
                tw, th = draw.textsize(texto, font=font)
            else:
                try:
                    # Para versiones más recientes de PIL
                    bbox = draw.textbbox((0, 0), texto, font=font)
                    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                except:
                    # Fallback si no funciona ninguno
                    tw, th = len(texto)*6, 10
            
            texto_x = x + ancho_bloque//2 - tw//2
            texto_y = y + alto_bloque//2 - th//2
            draw.text((texto_x, texto_y), texto, fill=(0, 0, 0), font=font)

    # Crear el DataFrame con información sobre uso de imágenes
    datos_uso = []
    for i in range(len(imagenes_pequenas)):
        datos_uso.append({
            'indice': i,
            'nombre_archivo': nombres_archivos[i],
            'usos': uso_imagenes[i]
        })

    df_uso = pd.DataFrame(datos_uso)

    # Ordenar por número de usos (descendente)
    df_uso = df_uso.sort_values('usos', ascending=False)
    
    tiempo_total = time.time() - tiempo_inicio
    print(f"Tiempo total para crear el fotomosaico: {tiempo_total:.2f} segundos")

    return fotomosaico, fotomosaico_guia, df_uso, mapa_posiciones

def cargar_imagenes_desde_carpeta(ruta_carpeta, tamano_pequena):
    """Carga todas las imágenes desde una carpeta local"""
    tiempo_inicio = time.time()
    
    imagenes = []
    colores = []
    nombres = []
    archivos_validos = 0
    archivos_invalidos = 0
    formatos_validos = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']

    try:
        # Verificar que la carpeta existe
        if not os.path.exists(ruta_carpeta):
            return [], [], [], 0, 0, f"Error: La carpeta '{ruta_carpeta}' no existe."

        # Obtener lista de archivos
        archivos = os.listdir(ruta_carpeta)

        # Filtrar solo imágenes
        archivos_imagen = [f for f in archivos if os.path.splitext(f.lower())[1] in formatos_validos]

        if not archivos_imagen:
            return [], [], [], 0, 0, f"No se encontraron imágenes en la carpeta '{ruta_carpeta}'."

        # Cargar cada imagen
        for archivo in archivos_imagen:
            ruta_completa = os.path.join(ruta_carpeta, archivo)
            try:
                img = Image.open(ruta_completa)

                # Convertir a RGB si es necesario
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Redimensionar
                img = img.resize((tamano_pequena, tamano_pequena))

                # Guardar imagen, color y nombre
                imagenes.append(img)
                colores.append(color_promedio_gpu(img))
                nombres.append(archivo)
                archivos_validos += 1

            except Exception as e:
                archivos_invalidos += 1
                continue

        tiempo_total = time.time() - tiempo_inicio
        mensaje = f"Se cargaron {archivos_validos} imágenes en {tiempo_total:.2f} segundos. Se ignoraron {archivos_invalidos} archivos con error."
        return imagenes, np.array(colores), nombres, archivos_validos, archivos_invalidos, mensaje

    except Exception as e:
        return [], [], [], 0, 0, f"Error al acceder a la carpeta: {str(e)}"

def calcular_dimensiones_mosaico(imagen_principal, tam_bloque):
    """Calcula cuántos bloques habrá en el mosaico"""
    ancho, alto = imagen_principal.size
    bloques_ancho = ancho // tam_bloque
    bloques_alto = alto // tam_bloque
    return bloques_ancho, bloques_alto

def guardar_resultados(mosaico, mosaico_guia, df_uso, carpeta_salida):
    """Guarda los resultados en archivos"""
    try:
        # Crear la carpeta de salida si no existe
        if not os.path.exists(carpeta_salida):
            os.makedirs(carpeta_salida)
            
        # Guardar las imágenes
        mosaico.save(os.path.join(carpeta_salida, "fotomosaico.png"))
        mosaico_guia.save(os.path.join(carpeta_salida, "guia_montaje.png"))
        
        # Guardar el CSV con información de uso
        df_uso.to_csv(os.path.join(carpeta_salida, "uso_imagenes.csv"), index=False)
        
        return f"Resultados guardados en la carpeta: {carpeta_salida}"
    except Exception as e:
        return f"Error al guardar los resultados: {str(e)}"

def generar_fotomosaico_completo(imagen_principal, ruta_carpeta_pequenas, tam_bloque, tamano_pequena, carpeta_salida):
    # Verificar que se ha seleccionado una imagen principal
    if imagen_principal is None:
        return None, None, None, "Error: No se ha seleccionado una imagen principal."

    # Verificar que se haya especificado una carpeta de imágenes pequeñas
    if not ruta_carpeta_pequenas:
        return None, None, None, "Error: No se ha especificado una carpeta de imágenes pequeñas."
        
    # Verificar que se haya especificado una carpeta de salida
    if not carpeta_salida:
        return None, None, None, "Error: No se ha especificado una carpeta de salida."

    # Cargar la imagen principal
    try:
        imagen_principal_pil = Image.open(imagen_principal)
        # Convertir a RGB si es necesario
        if imagen_principal_pil.mode != 'RGB':
            imagen_principal_pil = imagen_principal_pil.convert('RGB')
    except Exception as e:
        return None, None, None, f"Error al cargar la imagen principal: {str(e)}"

    # Calcular dimensiones del mosaico
    bloques_ancho, bloques_alto = calcular_dimensiones_mosaico(imagen_principal_pil, tam_bloque)
    tamano_total = f"El mosaico tendrá {bloques_ancho} x {bloques_alto} = {bloques_ancho * bloques_alto} bloques."

    tiempo_inicio_total = time.time()
    
    # Cargar las imágenes pequeñas desde la carpeta
    imagenes_pequenas, colores_promedio, nombres_archivos, num_validas, num_invalidas, mensaje = cargar_imagenes_desde_carpeta(
        ruta_carpeta_pequenas, tamano_pequena
    )

    if num_validas == 0:
        return None, None, None, mensaje

    # Crear el fotomosaico
    try:
        mosaico, mosaico_guia, df_uso, mapa_posiciones = crear_fotomosaico_con_info(
            imagen_principal_pil, imagenes_pequenas, colores_promedio, tam_bloque, nombres_archivos
        )

        # Guardar los resultados
        mensaje_guardado = guardar_resultados(mosaico, mosaico_guia, df_uso, carpeta_salida)
        
        tiempo_total = time.time() - tiempo_inicio_total

        # Generar mensaje de resumen
        total_usos = df_uso['usos'].sum()
        mensaje_resumen = f"{tamano_total}\n{mensaje}\nTotal de fotos colocadas: {total_usos}.\nImágenes únicas utilizadas: {len(df_uso[df_uso['usos'] > 0])}\n{mensaje_guardado}\nTiempo total de procesamiento: {tiempo_total:.2f} segundos"

        return mosaico, mosaico_guia, df_uso, mensaje_resumen
    except Exception as e:
        return None, None, None, f"Error al crear el fotomosaico: {str(e)}"

# Crear la interfaz de Gradio
with gr.Blocks(title="Pixel-Utopía - Generador de Fotomosaico GPU") as interface:
    gr.Markdown("""
    # 🧩 Pixel-Utopía: Generador de Fotomosaicos Acelerado con GPU

    Creación del fotomosaico para el muro Utopía:prohibido el paso, usando miles de imágenes con aceleración por GPU.
    """)

    with gr.Row():
        with gr.Column(scale=1):
            imagen_principal = gr.File(label="Imagen Principal", type="filepath")
            ruta_carpeta = gr.Textbox(
                label="Ruta de la carpeta de imágenes pequeñas",
                placeholder="Ejemplo: C:/Usuarios/MiUsuario/Imagenes/pequenas"
            )
            carpeta_salida = gr.Textbox(
                label="Ruta de la carpeta donde guardar resultados",
                placeholder="Ejemplo: C:/Usuarios/MiUsuario/Documentos/Fotomosaico"
            )

            with gr.Row():
                tam_bloque = gr.Slider(10, 200, step=10, value=50, label='Tamaño de Bloque (píxeles)')
                tamano_pequena = gr.Slider(10, 200, step=10, value=50, label='Tamaño de Imágenes Pequeñas (píxeles)')

            generar_btn = gr.Button("Generar Fotomosaico con GPU", variant="primary")

        with gr.Column(scale=2):
            mensaje = gr.Textbox(label="Información del Mosaico", lines=5)

    with gr.Tabs():
        with gr.TabItem("Fotomosaico"):
            resultado = gr.Image(label="Fotomosaico Resultante")
        with gr.TabItem("Guía de Montaje"):
            guia = gr.Image(label="Guía Numerada para Montaje")
        with gr.TabItem("Lista de Imágenes"):
            tabla_uso = gr.Dataframe(label="Tabla de uso de imágenes")

    # Información de uso de GPU
    info_gpu = gr.Markdown(f"""
    ### Información de GPU
    Dispositivo en uso: **{device}**
    
    {'✅ Aceleración GPU activada' if torch.cuda.is_available() else '❌ GPU no disponible - usando CPU'}
    """)

    # Conectar eventos
    generar_btn.click(
        fn=generar_fotomosaico_completo,
        inputs=[imagen_principal, ruta_carpeta, tam_bloque, tamano_pequena, carpeta_salida],
        outputs=[resultado, guia, tabla_uso, mensaje]
    )

# Lanzar la aplicación
if __name__ == "__main__":
    interface.launch()