// admin/js/admin.js - VERSIÓN FUNCIONAL Y SIMPLE
const API_URL = '/api';
let imagenes = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel cargado');
    cargarImagenes();
    setupEventListeners();
    updateCurrentDate();
    
    // Configurar tabs (aunque solo hay uno)
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(this.getAttribute('data-tab') + '-tab').classList.add('active');
        });
    });
});

// Cargar imágenes desde el servidor
async function cargarImagenes() {
    try {
        const response = await fetch(`${API_URL}/images`);
        const data = await response.json();
        
        if (data.images) {
            imagenes = data.images;
            mostrarGaleria();
            updateImageCount();
            updateSessionInfo(); // ← Agrega esta línea
        } else {
            mostrarGaleriaVacia();
        }
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        mostrarGaleriaVacia();
    }
}


// Función para cambiar contraseña
async function cambiarContrasena() {
    const current = document.getElementById('current-password').value;
    const nueva = document.getElementById('new-password').value;
    const confirmar = document.getElementById('confirm-password').value;
    
    if (!current || !nueva || !confirmar) {
        showPasswordMessage('❌ Todos los campos son requeridos', 'error');
        return;
    }
    
    if (nueva !== confirmar) {
        showPasswordMessage('❌ Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (nueva.length < 6) {
        showPasswordMessage('❌ Mínimo 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: current,
                new_password: nueva,
                confirm_password: confirmar
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showPasswordMessage(result.message, 'success');
            // Limpiar campos
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            // Mostrar mensaje de éxito
            setTimeout(() => {
                if (confirm('¿Deseas cerrar sesión e ingresar con la nueva contraseña?')) {
                    logout();
                }
            }, 1000);
        } else {
            showPasswordMessage(result.message || '❌ Error al cambiar contraseña', 'error');
        }
    } catch (error) {
        showPasswordMessage('❌ Error de conexión', 'error');
    }
}

// Función para mostrar mensajes de contraseña
function showPasswordMessage(text, type) {
    const messageDiv = document.getElementById('password-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Función para cerrar sesión
async function cerrarSesion() {
    if (confirm('¿Cerrar sesión del panel admin?')) {
        await logout();
    }
}

// Función logout actualizada
async function logout() {
    try {
        await fetch('/api/logout-admin', { method: 'POST' });
        window.location.href = '/login-admin';
    } catch (error) {
        window.location.href = '/';
    }
}

// Función para mostrar/ocultar contraseña (opcional)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling?.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fas fa-eye';
    }
}

// Actualizar información de sesión
function updateSessionInfo() {
    const statusElement = document.getElementById('session-status');
    if (statusElement) {
        statusElement.innerHTML = '● <span style="color: #28a745;">Sesión activa</span>';
    }
    
    const imagesElement = document.getElementById('total-images');
    if (imagesElement) {
        imagesElement.textContent = imagenes.length;
    }
}


// Mostrar galería
function mostrarGaleria() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    if (imagenes.length === 0) {
        mostrarGaleriaVacia();
        return;
    }
    
    let html = '';
    
    imagenes.forEach(img => {
        const etiqueta = img.etiquetas && img.etiquetas.length > 0 
            ? img.etiquetas[0] 
            : "Personalizadas";
        
        html += `
            <div class="gallery-item" data-filename="${img.filename}" data-etiquetas='${JSON.stringify(img.etiquetas || ["Personalizadas"])}'>
                <div class="gallery-image">
                    <img src="${img.url}" alt="${img.filename}" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=Imagen'">
                </div>
                <div class="gallery-info">
                    <div class="filename">${img.filename}</div>
                    
                    <div class="etiqueta-control">
                        <label>Etiqueta:</label>
                        <select class="etiqueta-selector" onchange="cambiarEtiqueta('${img.filename}', this.value)">
                            <option value="Navidad" ${etiqueta === 'Navidad' ? 'selected' : ''}>🎄 Navidad</option>
                            <option value="Halloween" ${etiqueta === 'Halloween' ? 'selected' : ''}>🎃 Halloween</option>
                            <option value="Temáticas Especiales" ${etiqueta === 'Temáticas Especiales' ? 'selected' : ''}>🎨 Temáticas Especiales</option>
                            <option value="Personalizadas" ${etiqueta === 'Personalizadas' ? 'selected' : ''}>✨ Personalizadas</option>
                        </select>
                        <span class="etiqueta-badge etiqueta-${etiqueta.toLowerCase().replace(/ /g, '-')}">
                            ${etiqueta}
                        </span>
                    </div>
                    
                    <div class="gallery-actions">
                        <button class="btn-view" onclick="window.open('${img.url}', '_blank')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn-delete" onclick="eliminarImagen('${img.filename}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Cambiar etiqueta
async function cambiarEtiqueta(filename, nuevaEtiqueta) {
    if (!nuevaEtiqueta) return;
    
    try {
        showMessage('🔄 Actualizando etiqueta...', 'info');
        
        const response = await fetch(`${API_URL}/update-etiquetas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename, etiquetas: [nuevaEtiqueta] })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('✅ Etiqueta actualizada', 'success');
            cargarImagenes(); // Recargar
        } else {
            showMessage('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error de conexión', 'error');
    }
}

// Filtrar por etiqueta
function filtrarPorEtiqueta() {
    const filtro = document.getElementById('filter-tag').value;
    const items = document.querySelectorAll('.gallery-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const etiquetas = JSON.parse(item.dataset.etiquetas || '["Personalizadas"]');
        
        if (filtro === 'todas' || etiquetas.includes(filtro)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    document.getElementById('image-counter').textContent = `${visibleCount} imágenes`;
}

// Eliminar imagen
async function eliminarImagen(filename) {
    if (!confirm(`¿Eliminar "${filename}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/delete-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('✅ Imagen eliminada', 'success');
            cargarImagenes();
        } else {
            showMessage('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error de conexión', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Drag & drop
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.style.background = '#fff9f0';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.background = '';
        });
        
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.style.background = '';
            handleFiles(e.dataTransfer.files);
        });
    }
    
    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', e => handleFiles(e.target.files));
    }
}

// Manejar archivos
async function handleFiles(files) {
    for (let file of files) {
        await uploadImage(file);
    }
    if (document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = '';
    }
}

// Subir imagen
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        showMessage('📤 Subiendo imagen...', 'info');
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('✅ Imagen subida', 'success');
            cargarImagenes();
        } else {
            showMessage('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error subiendo imagen', 'error');
    }
}

// Mostrar galería vacía
function mostrarGaleriaVacia() {
    const container = document.getElementById('gallery-container');
    if (container) {
        container.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-images"></i>
                <h3>No hay imágenes en la galería</h3>
                <p>Sube algunas imágenes usando el área de arriba</p>
            </div>
        `;
    }
}

// Actualizar contador
function updateImageCount() {
    const counter = document.getElementById('image-counter');
    if (counter) {
        counter.textContent = `${imagenes.length} imágenes`;
    }
}

// Mostrar mensajes
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Actualizar fecha
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Logout
async function logout() {
    if (confirm('¿Cerrar sesión del admin?')) {
        try {
            await fetch('/api/logout-admin', { method: 'POST' });
            window.location.href = '/login-admin';
        } catch (error) {
            window.location.href = '/';
        }
    }
}

