// Sistema de galería modal
let productoActual = null;
let imagenActualIndex = 0;

function mostrarGaleria(productoId) {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) return;
    
    productoActual = producto;
    imagenActualIndex = 0;
    
    // Actualizar información del producto
    document.getElementById('modalTitulo').textContent = producto.nombre;
    document.getElementById('modalDescripcion').textContent = producto.descripcion;
    
    const precioTexto = producto.precio === 0 ? 'Bs. Consultar' : `Bs. ${producto.precio}${producto.unidad === 'c/u' ? ' c/u' : ''}`;
    document.getElementById('modalPrecio').textContent = precioTexto;
    
    // Cargar galería
    cargarMiniaturas(producto.galeria);
    
    // Mostrar primera imagen
    mostrarImagen(0);
    
    // Mostrar modal
    document.getElementById('modalGaleria').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function obtenerProductoPorId(id) {
    // Buscar en los productos cargados
    const productos = document.querySelectorAll('.producto');
    for (let productoElement of productos) {
        const boton = productoElement.querySelector('.btn-ver-mas');
        if (boton && boton.getAttribute('data-id') === id) {
            // En una implementación real, buscarías en tu JSON
            // Por ahora, simulamos con los datos del DOM
            return {
                id: id,
                nombre: productoElement.querySelector('.producto-titulo').textContent,
                descripcion: productoElement.querySelector('.producto-descripcion').textContent,
                precio: parseInt(productoElement.querySelector('.producto-precio').textContent.replace('Bs. ', '').replace(' c/u', '')) || 0,
                unidad: productoElement.querySelector('.producto-precio').textContent.includes('c/u') ? 'c/u' : 'combo',
                galeria: generarGaleriaDesdeProducto(id)
            };
        }
    }
    return null;
}

function generarGaleriaDesdeProducto(productoId) {
    // En una implementación real, esto vendría del JSON
    // Por ahora, generamos algunas imágenes de ejemplo basadas en el ID
    const galeriaBase = [
        `imagenes/productos/capi.jpg`,
        `imagenes/productos/varias.jpg`,
        `imagenes/productos/varias2.jpg`,
        `imagenes/productos/navidad.jpg`,
        `imagenes/productos/halloween.jpg`,
        `imagenes/productos/pocker.jpg`
    ];
    
    // Mezclar array para variedad
    return [...galeriaBase].sort(() => Math.random() - 0.5).slice(0, 6);
}

function cargarMiniaturas(galeria) {
    const contenedorMiniaturas = document.getElementById('galeriaMiniaturas');
    contenedorMiniaturas.innerHTML = '';
    
    galeria.forEach((imagenSrc, index) => {
        const miniatura = document.createElement('div');
        miniatura.className = 'miniatura';
        if (index === 0) miniatura.classList.add('activa');
        
        miniatura.innerHTML = `<img src="${imagenSrc}" alt="Miniatura ${index + 1}" onerror="this.src='https://via.placeholder.com/100x80?text=Imagen'">`;
        
        miniatura.addEventListener('click', () => mostrarImagen(index));
        
        contenedorMiniaturas.appendChild(miniatura);
    });
}

function mostrarImagen(index) {
    if (!productoActual || !productoActual.galeria[index]) return;
    
    imagenActualIndex = index;
    const imagenPrincipal = document.getElementById('imagenPrincipal');
    imagenPrincipal.src = productoActual.galeria[index];
    
    // Actualizar miniaturas activas
    document.querySelectorAll('.miniatura').forEach((miniatura, i) => {
        if (i === index) {
            miniatura.classList.add('activa');
        } else {
            miniatura.classList.remove('activa');
        }
    });
}

function cerrarGaleria() {
    document.getElementById('modalGaleria').style.display = 'none';
    document.body.style.overflow = 'auto';
    productoActual = null;
}

// Event Listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalGaleria');
    const btnCerrar = document.querySelector('.modal-cerrar');
    
    btnCerrar.addEventListener('click', cerrarGaleria);
    
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarGaleria();
        }
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', function(event) {
        if (modal.style.display === 'block' && productoActual) {
            if (event.key === 'Escape') {
                cerrarGaleria();
            } else if (event.key === 'ArrowRight') {
                siguienteImagen();
            } else if (event.key === 'ArrowLeft') {
                imagenAnterior();
            }
        }
    });
});

function siguienteImagen() {
    if (productoActual && productoActual.galeria) {
        const siguienteIndex = (imagenActualIndex + 1) % productoActual.galeria.length;
        mostrarImagen(siguienteIndex);
    }
}

function imagenAnterior() {
    if (productoActual && productoActual.galeria) {
        const anteriorIndex = (imagenActualIndex - 1 + productoActual.galeria.length) % productoActual.galeria.length;
        mostrarImagen(anteriorIndex);
    }
}