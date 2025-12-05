# backend/app.py
from flask import request, jsonify, send_from_directory
import os
import json
import time  # <-- FALTABA ESTE IMPORT
from werkzeug.utils import secure_filename
import secrets

# Configuración
UPLOAD_FOLDER = 'backend/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_filename(filename):
    """Mantiene el nombre original o agrega sufijo si existe"""
    original_name = secure_filename(filename)
    name, ext = os.path.splitext(original_name)
    
    # Asegurar que la carpeta existe
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'productos'), exist_ok=True)
    
    filepath = os.path.join(UPLOAD_FOLDER, 'productos', original_name)
    
    # Si el archivo no existe, usar nombre original
    if not os.path.exists(filepath):
        return original_name
    
    # Si existe, agregar timestamp
    timestamp = int(time.time())
    return f"{name}_{timestamp}{ext}"

# Ruta para obtener productos
def get_productos():
    try:
        with open('backend/data/productos.json', 'r', encoding='utf-8') as f:
            productos = json.load(f)
        return jsonify(productos)
    except FileNotFoundError:
        # Si no existe, crear uno por defecto
        productos_por_defecto = {
            "productos": []
        }
        with open('backend/data/productos.json', 'w', encoding='utf-8') as f:
            json.dump(productos_por_defecto, f, ensure_ascii=False, indent=2)
        return jsonify(productos_por_defecto)

# Ruta para actualizar productos
def update_productos():
    try:
        data = request.get_json()
        with open('backend/data/productos.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({"message": "Productos actualizados correctamente", "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

# Ruta para subir imágenes
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró el archivo", "status": "error"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo", "status": "error"}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Validar tamaño
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            
            if file_length > MAX_FILE_SIZE:
                return jsonify({"error": "Archivo demasiado grande (máximo 5MB)", "status": "error"}), 400
            
            # Generar nombre único manteniendo el original
            new_filename = generate_filename(file.filename)
            
            # Guardar en la carpeta de productos
            filepath = os.path.join(UPLOAD_FOLDER, 'productos', new_filename)
            file.save(filepath)
            
            # Devolver URL de la imagen
            image_url = f"/uploads/productos/{new_filename}"
            return jsonify({
                "message": "Imagen subida correctamente",
                "filename": new_filename,
                "original_name": secure_filename(file.filename),
                "url": image_url,
                "status": "success"
            })
            
        except Exception as e:
            return jsonify({"error": f"Error al subir archivo: {str(e)}", "status": "error"}), 500
    
    return jsonify({"error": "Tipo de archivo no permitido", "status": "error"}), 400

# Ruta para eliminar imágenes
def delete_image():
    data = request.get_json()
    filename = data.get('filename')
    
    if not filename:
        return jsonify({"error": "Nombre de archivo requerido", "status": "error"}), 400
    
    try:
        filepath = os.path.join(UPLOAD_FOLDER, 'productos', filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({"message": "Imagen eliminada correctamente", "status": "success"})
        else:
            return jsonify({"error": "Archivo no encontrado", "status": "error"}), 404
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

ETIQUETAS_FILE = 'backend/data/etiquetas.json'

def cargar_etiquetas():
    """Cargar etiquetas desde archivo"""
    try:
        if os.path.exists(ETIQUETAS_FILE):
            with open(ETIQUETAS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except:
        pass
    return {}

def guardar_etiquetas(etiquetas):
    """Guardar etiquetas en archivo"""
    os.makedirs('backend/data', exist_ok=True)
    with open(ETIQUETAS_FILE, 'w', encoding='utf-8') as f:
        json.dump(etiquetas, f, ensure_ascii=False, indent=2)
# Ruta para obtener lista de imágenes
def get_images():
    try:
        uploads_path = os.path.join(UPLOAD_FOLDER, 'productos')
        etiquetas = cargar_etiquetas()
        images = []
        
        if os.path.exists(uploads_path):
            for filename in os.listdir(uploads_path):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    # Obtener etiqueta o usar "Personalizadas" por defecto
                    img_etiquetas = etiquetas.get(filename, ["Personalizadas"])
                    images.append({
                        "filename": filename,
                        "url": f"/uploads/productos/{filename}",
                        "size": os.path.getsize(os.path.join(uploads_path, filename)),
                        "etiquetas": img_etiquetas
                    })
        
        return jsonify({"images": images, "count": len(images), "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

#a Ruta para actualizar etiquetas de imágenes
def update_etiquetas():
    try:
        data = request.get_json()
        filename = data.get('filename')
        nuevas_etiquetas = data.get('etiquetas', [])
        
        if not filename:
            return jsonify({"error": "Nombre de archivo requerido", "status": "error"}), 400
        
        etiquetas = cargar_etiquetas()
        etiquetas[filename] = nuevas_etiquetas
        guardar_etiquetas(etiquetas)
        
        return jsonify({
            "message": "Etiquetas actualizadas correctamente",
            "filename": filename,
            "etiquetas": nuevas_etiquetas,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500