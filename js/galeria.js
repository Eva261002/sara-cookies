// public/js/galeria.js - Modifica la función cargarGaleria
async function cargarGaleria() {
    const container = document.getElementById('gallery-container');
    
    // Mostrar loader
    container.innerHTML = `
        <div class="gallery-loader">
            <i class="fas fa-cookie-bite fa-spin"></i>
            <p>Cargando galería...</p>
        </div>
    `;
    
    try {
        // Intentar con la nueva ruta /api/galeria
        const response = await fetch('/api/galeria');
        const data = await response.json();
        
        if (data.imagenes && data.imagenes.length > 0) {
            mostrarGaleria(data.imagenes);
        } else {
            // Si no hay imágenes, intentar con /api/images
            await cargarGaleriaAlternativa();
        }
    } catch (error) {
        console.log('Error cargando galería:', error);
        await cargarGaleriaAlternativa();
    }
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