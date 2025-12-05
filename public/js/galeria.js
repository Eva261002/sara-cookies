// public/js/galeria.js
document.addEventListener('DOMContentLoaded', function() {
    cargarGaleria();
});

// public/js/galeria.js - Para el sitio público
async function cargarGaleria() {
    try {
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
            mostrarGaleriaOrganizada(data.images);
        } else {
            mostrarGaleriaVacia();
        }
    } catch (error) {
        console.log('Error:', error);
        cargarImagenesPorDefecto();
    }
}

function mostrarGaleriaOrganizada(imagenes) {
    const container = document.getElementById('gallery-container');
    
    // Agrupar imágenes por etiqueta
    const imagenesPorEtiqueta = {};
    
    // Inicializar categorías
    const categorias = ["Navidad", "Halloween", "Temáticas Especiales", "Personalizadas"];
    categorias.forEach(cat => imagenesPorEtiqueta[cat] = []);
    
    // Clasificar imágenes
    imagenes.forEach(img => {
        const etiqueta = img.etiquetas && img.etiquetas.length > 0 
            ? img.etiquetas[0] 
            : "Personalizadas";
        
        if (imagenesPorEtiqueta[etiqueta]) {
            imagenesPorEtiqueta[etiqueta].push(img);
        } else {
            imagenesPorEtiqueta["Personalizadas"].push(img);
        }
    });
    
    // Generar HTML
    let html = '';
    
    // Mostrar cada categoría que tenga imágenes
    categorias.forEach(categoria => {
        const imagenesCategoria = imagenesPorEtiqueta[categoria];
        if (imagenesCategoria.length > 0) {
            // Icono según categoría
            const iconos = {
                "Navidad": "🎄",
                "Halloween": "🎃",
                "Temáticas Especiales": "🎨",
                "Personalizadas": "✨"
            };
            
            html += `
                <div class="categoria-galeria">
                    <h3>${iconos[categoria]} ${categoria} <span class="categoria-count">(${imagenesCategoria.length})</span></h3>
                    <div class="categoria-grid">
            `;
            
            imagenesCategoria.forEach(img => {
                html += `
                    <div class="item-galeria">
                        <img src="${img.url}" alt="${img.filename}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
                        <div class="overlay">
                            <button class="btn-inspiracion" data-tema="${categoria}">
                                Me Interesa
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

async function cargarGaleriaAlternativa() {
    try {
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
            mostrarGaleria(data.images);
        } else {
            mostrarGaleriaVacia();
        }
    } catch (error) {
        console.log('Error cargando galería alternativa:', error);
        cargarImagenesPorDefecto();
    }
}

function mostrarGaleriaVacia() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = `
        <div class="empty-gallery">
            <i class="fas fa-images fa-3x"></i>
            <h3>No hay imágenes en la galería</h3>
            <p>Sube algunas imágenes desde el panel de administración</p>
        </div>
    `;
}

function mostrarGaleria(imagenes) {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    
    // Ordenar alfabéticamente
    imagenes.sort((a, b) => a.filename.localeCompare(b.filename));
    
    // Dividir en grupos para categorías visuales
    const categorias = {
        'Temáticas': [],
        'Navidad': [],
        'Halloween': [],
        'Personalizadas': []
    };
    
    // Clasificar imágenes por nombre
    imagenes.forEach(img => {
        const filename = img.filename.toLowerCase();
        if (filename.includes('navidad')) {
            categorias['Navidad'].push(img);
        } else if (filename.includes('halloween')) {
            categorias['Halloween'].push(img);
        } else if (filename.includes('capi') || filename.includes('tematica')) {
            categorias['Temáticas'].push(img);
        } else {
            categorias['Personalizadas'].push(img);
        }
    });
    
    // Mostrar por categorías
    for (const [categoria, imagenesCategoria] of Object.entries(categorias)) {
        if (imagenesCategoria.length > 0) {
            const categoriaDiv = document.createElement('div');
            categoriaDiv.className = 'categoria-galeria';
            categoriaDiv.innerHTML = `<h3>${categoria}</h3>`;
            
            const gridDiv = document.createElement('div');
            gridDiv.className = 'categoria-grid';
            
            imagenesCategoria.forEach(img => {
                const item = crearItemGaleria(img);
                gridDiv.appendChild(item);
            });
            
            categoriaDiv.appendChild(gridDiv);
            container.appendChild(categoriaDiv);
        }
    }
}

function crearItemGaleria(img) {
    const div = document.createElement('div');
    div.className = 'item-galeria';
    
    // Extraer tema del nombre del archivo
    let tema = 'Personalizadas';
    const filename = img.filename.toLowerCase();
    if (filename.includes('navidad')) tema = 'Navideñas';
    else if (filename.includes('halloween')) tema = 'Halloween';
    else if (filename.includes('capi')) tema = 'Temáticas';
    
    div.innerHTML = `
        <img src="${img.url}" alt="${img.filename}" 
             onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+cargada'">
        <div class="overlay">
            <button class="btn-inspiracion" data-tema="${tema}">Me Interesa</button>
        </div>
    `;
    
    return div;
}

function cargarImagenesPorDefecto() {
    // Lista de imágenes por defecto (las que ya tienes)
    const imagenesPorDefecto = [
        { filename: 'capi.jpg', url: '/uploads/productos/capi.jpg' },
        { filename: 'navidad.jpg', url: '/uploads/productos/navidad.jpg' },
        { filename: 'halloween.jpg', url: '/uploads/productos/halloween.jpg' },
        { filename: 'pocker.jpg', url: '/uploads/productos/pocker.jpg' },
        // ... añade todas las que tienes
    ];
    
    mostrarGaleria(imagenesPorDefecto);
}

// Agregar event listeners a los botones
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-inspiracion')) {
        const tema = e.target.getAttribute('data-tema');
        const mensaje = `¡Hola! Me interesan las galletas ${tema.toLowerCase()}. ¿Podrían darme más información?`;
        const urlWhatsApp = `https://wa.me/59175097054?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
    }
});