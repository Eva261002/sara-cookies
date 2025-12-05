# server.py - VERSIÓN COMPLETA Y CORREGIDA
from flask import Flask, send_from_directory, redirect, jsonify, request
import os
import sys
import glob
import time
import hashlib
import secrets
import json

# ========== CONFIGURACIÓN ==========
# Contraseña admin por defecto
ADMIN_PASSWORD = ""
ADMIN_PASSWORD_HASH = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()
ADMIN_SESSION_SECRET = secrets.token_hex(32)

# Archivo de configuración
CONFIG_FILE = 'backend/data/admin_config.json'

# Diccionario para sesiones
admin_sessions = {}

# Añadir el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Importar funciones del backend
try:
    from backend.app import (
        get_productos, update_productos, upload_image, 
        delete_image, get_images, update_etiquetas
    )
except ImportError as e:
    print(f"⚠️  Error importando backend: {e}")
    print("⚠️  Asegúrate de que backend/app.py existe y tiene las funciones necesarias")
    # Definir funciones dummy para que no falle
    def get_productos(): return jsonify({"productos": []})
    def update_productos(): return jsonify({"error": "Backend no cargado"})
    def upload_image(): return jsonify({"error": "Backend no cargado"})
    def delete_image(): return jsonify({"error": "Backend no cargado"})
    def get_images(): return jsonify({"images": []})
    def update_etiquetas(): return jsonify({"error": "Backend no cargado"})

# ========== CREAR APLICACIÓN FLASK ==========
app = Flask(__name__)
app.secret_key = ADMIN_SESSION_SECRET

# Configuración
UPLOAD_FOLDER = 'backend/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ========== FUNCIONES AUXILIARES ==========
def check_admin_session():
    """Verificar si hay sesión admin activa"""
    session_id = request.cookies.get('admin_session')
    
    if not session_id or session_id not in admin_sessions:
        return False
    
    # Verificar que la sesión no haya expirado (24 horas)
    session_data = admin_sessions[session_id]
    if time.time() - session_data['timestamp'] > 86400:
        del admin_sessions[session_id]
        return False
    
    return True

def load_admin_config():
    """Cargar configuración del admin desde archivo"""
    global ADMIN_PASSWORD_HASH
    
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                if 'password_hash' in config:
                    ADMIN_PASSWORD_HASH = config['password_hash']
                    print(f"✅ Configuración admin cargada desde {CONFIG_FILE}")
    except Exception as e:
        print(f"⚠️  Error cargando configuración: {e}")

def save_admin_config():
    """Guardar configuración del admin en archivo"""
    global ADMIN_PASSWORD_HASH
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump({'password_hash': ADMIN_PASSWORD_HASH}, f, indent=2)
        print(f"✅ Configuración admin guardada en {CONFIG_FILE}")
        return True
    except Exception as e:
        print(f"⚠️  Error guardando configuración: {e}")
        return False

# ========== RUTAS DEL BACKEND API ==========

@app.route('/api/productos', methods=['GET'])
def api_get_productos():
    return get_productos()

@app.route('/api/productos', methods=['POST'])
def api_update_productos():
    return update_productos()

@app.route('/api/upload', methods=['POST'])
def api_upload_image():
    return upload_image()

@app.route('/api/delete-image', methods=['POST'])
def api_delete_image():
    return delete_image()

@app.route('/api/images', methods=['GET'])
def api_get_images():
    return get_images()

@app.route('/api/galeria', methods=['GET'])
def api_get_galeria():
    try:
        imagenes_path = 'backend/uploads/productos/*'
        imagenes = []
        
        for filepath in glob.glob(imagenes_path):
            if filepath.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                filename = os.path.basename(filepath)
                imagenes.append({
                    'filename': filename,
                    'url': f'/uploads/productos/{filename}',
                    'size': os.path.getsize(filepath)
                })
        
        # Ordenar alfabéticamente
        imagenes.sort(key=lambda x: x['filename'].lower())
        
        return jsonify({'imagenes': imagenes, 'count': len(imagenes)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-etiquetas', methods=['POST'])
def api_update_etiquetas():
    return update_etiquetas()

# ========== RUTAS DE ADMIN/LOGIN ==========

@app.route('/login-admin')
def login_admin_page():
    """Página de login para admin"""
    return send_from_directory('public', 'admin-login.html')

@app.route('/api/verify-admin', methods=['POST'])
def verify_admin():
    """Verificar contraseña admin"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Datos no proporcionados'}), 400
    
    password = data.get('password', '')
    
    if hashlib.sha256(password.encode()).hexdigest() == ADMIN_PASSWORD_HASH:
        # Crear sesión
        session_id = secrets.token_hex(16)
        admin_sessions[session_id] = {
            'timestamp': time.time(),
            'ip': request.remote_addr
        }
        
        response = jsonify({
            'success': True,
            'message': 'Acceso concedido',
            'session_id': session_id
        })
        
        # Establecer cookie de sesión (24 horas)
        response.set_cookie('admin_session', session_id, max_age=86400, httponly=True, samesite='Lax')
        return response
    else:
        return jsonify({
            'success': False,
            'message': 'Contraseña incorrecta'
        }), 401

@app.route('/admin-panel')
def admin_panel():
    """Panel admin protegido"""
    if not check_admin_session():
        return redirect('/login-admin')
    
    return send_from_directory('admin', 'admin.html')

@app.route('/api/logout-admin', methods=['POST'])
def logout_admin():
    """Cerrar sesión admin"""
    session_id = request.cookies.get('admin_session')
    if session_id and session_id in admin_sessions:
        del admin_sessions[session_id]
    
    response = jsonify({'success': True})
    response.set_cookie('admin_session', '', expires=0)
    return response

@app.route('/api/change-password', methods=['POST'])
def change_password():
    """Cambiar contraseña del admin"""
    if not check_admin_session():
        return jsonify({'success': False, 'message': 'Sesión expirada'}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Datos no proporcionados'}), 400
    
    current_pass = data.get('current_password', '')
    new_pass = data.get('new_password', '')
    confirm_pass = data.get('confirm_password', '')
    
    # IMPORTANTE: global debe estar ANTES de cualquier uso de ADMIN_PASSWORD_HASH
    global ADMIN_PASSWORD_HASH
    
    # Validaciones
    if hashlib.sha256(current_pass.encode()).hexdigest() != ADMIN_PASSWORD_HASH:
        return jsonify({'success': False, 'message': 'Contraseña actual incorrecta'}), 400
    
    if new_pass != confirm_pass:
        return jsonify({'success': False, 'message': 'Las nuevas contraseñas no coinciden'}), 400
    
    if len(new_pass) < 6:
        return jsonify({'success': False, 'message': 'La contraseña debe tener al menos 6 caracteres'}), 400
    
    # Actualizar contraseña
    ADMIN_PASSWORD_HASH = hashlib.sha256(new_pass.encode()).hexdigest()
    
    # Guardar en archivo
    if save_admin_config():
        # Cerrar todas las sesiones existentes (forzar nuevo login)
        admin_sessions.clear()
        
        return jsonify({
            'success': True, 
            'message': '✅ Contraseña cambiada correctamente. Por favor, inicia sesión nuevamente.'
        })
    else:
        return jsonify({
            'success': False, 
            'message': '❌ Error guardando la nueva contraseña'
        }), 500

# ========== RUTAS DEL FRONTEND PÚBLICO ==========

@app.route('/')
def home():
    return redirect('/public')

@app.route('/public/<path:path>')
def serve_public(path):
    return send_from_directory('public', path)

@app.route('/public/')
def serve_public_index():
    return send_from_directory('public', 'index.html')

# Servir archivos estáticos del admin
@app.route('/admin/css/<path:filename>')
def serve_admin_css(filename):
    return send_from_directory('admin/css', filename)

@app.route('/admin/js/<path:filename>')
def serve_admin_js(filename):
    return send_from_directory('admin/js', filename)

@app.route('/admin/<path:path>')
def serve_admin(path):
    """Servir cualquier archivo del admin"""
    return send_from_directory('admin', path)

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"⚠️  Error sirviendo archivo {filename}: {e}")
        return "Archivo no encontrado", 404

# Redirecciones para URLs limpias
@app.route('/galeria')
def galeria():
    return redirect('/public/#galeria')

@app.route('/productos')
def productos():
    return redirect('/public/#productos')

# Ruta de prueba
@app.route('/api/test')
def test_api():
    return jsonify({
        "message": "API funcionando", 
        "status": "ok",
        "version": "1.0",
        "admin_config": os.path.exists(CONFIG_FILE),
        "password_loaded": ADMIN_PASSWORD_HASH != hashlib.sha256("".encode()).hexdigest()
    })

# Manejador de errores
@app.errorhandler(404)
def not_found(e):
    return "Página no encontrada. <a href='/public'>Ir al inicio</a>", 404

@app.errorhandler(500)
def internal_error(e):
    return "Error interno del servidor. <a href='/public'>Ir al inicio</a>", 500

# ========== INICIALIZACIÓN ==========

if __name__ == '__main__':
    # Crear carpetas necesarias
    os.makedirs('backend/uploads/productos', exist_ok=True)
    os.makedirs('backend/data', exist_ok=True)
    
    # Cargar configuración del admin (IMPORTANTE: hacerlo después de crear carpetas)
    load_admin_config()
    
    # Crear archivo de etiquetas si no existe
    etiquetas_file = 'backend/data/etiquetas.json'
    if not os.path.exists(etiquetas_file):
        try:
            with open(etiquetas_file, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            print(f"✅ Archivo de etiquetas creado: {etiquetas_file}")
        except Exception as e:
            print(f"⚠️  Error creando archivo de etiquetas: {e}")
    
    # Crear archivo de productos si no existe
    productos_file = 'backend/data/productos.json'
    if not os.path.exists(productos_file):
        try:
            with open(productos_file, 'w', encoding='utf-8') as f:
                default_data = {"productos": []}
                json.dump(default_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Archivo de productos creado: {productos_file}")
        except Exception as e:
            print(f"⚠️  Error creando archivo de productos: {e}")
    
    # Imprimir información importante
    print("=" * 60)
    print("🌼 SARA COOKIES - SISTEMA INICIADO 🌼")
    print("=" * 60)
    
    print(f"📁 Configuración: {CONFIG_FILE} ({'Existe' if os.path.exists(CONFIG_FILE) else 'No existe'})")
    print("=" * 60)
    print("🌐 Sitio público:    http://localhost:5000/public")

    
    # Desactivar algunas advertencias de Flask en desarrollo
    import warnings
    warnings.filterwarnings("ignore", message=".*")
    
    app.run(debug=True, port=5000, use_reloader=False)