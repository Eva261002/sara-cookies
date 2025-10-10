// Cargar productos desde JSON
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});

async function cargarProductos() {
    try {
        const response = await fetch('data/productos.json');
        const data = await response.json();
        mostrarProductos(data.productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        // Cargar productos por defecto si hay error
        cargarProductosPorDefecto();
    }
}

function mostrarProductos(productos) {
    const catalogo = document.querySelector('.catalogo');
    catalogo.innerHTML = '';

    productos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.className = 'producto';
        productoElement.setAttribute('data-categoria', producto.categoria);
        
        const precioTexto = producto.precio === 0 ? 'Bs. Consultar' : `Bs. ${producto.precio}${producto.unidad === 'c/u' ? ' c/u' : ''}`;
        
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
            <div class="producto-info">
                <div class="producto-categoria">${producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}</div>
                <h3 class="producto-titulo">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <div class="producto-precio">${precioTexto}</div>
                <div class="producto-acciones">
                    <button class="btn btn-ver-mas" data-id="${producto.id}">Ver Más</button>
                    <button class="btn" data-id="${producto.id}"><i class="fas fa-shopping-cart"></i></button>
                </div>
            </div>
        `;
        
        catalogo.appendChild(productoElement);
    });

    agregarEventListeners();
}

function cargarProductosPorDefecto() {
    const productosPorDefecto = [
        {
            id: 1,
            nombre: "Galletas Decoradas",
            categoria: "individuales",
            descripcion: "Galletas individuales con diseños únicos y personalizados. Precio por unidad.",
            precio: 3,
            imagen: "https://images.unsplash.com/photo-1590080874087-e58821782cb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            unidad: "c/u"
        },
        // ... otros productos por defecto
    ];
    
    mostrarProductos(productosPorDefecto);
}