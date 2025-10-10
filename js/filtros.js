// Filtrado de productos por categoría
function agregarEventListeners() {
    const filtros = document.querySelectorAll('.categoria-btn');
    const productos = document.querySelectorAll('.producto');
    
    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filtros.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            const categoria = this.getAttribute('data-categoria');
            
            // Mostrar u ocultar productos según la categoría
            productos.forEach(producto => {
                if (categoria === 'todos' || producto.getAttribute('data-categoria') === categoria) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });
        });
    });

    // Botones "Ver Más"
    const botonesVerMas = document.querySelectorAll('.btn-ver-mas');
    botonesVerMas.forEach(boton => {
        boton.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            mostrarGaleria(productoId);
        });
    });
}

function mostrarDetallesProducto(id) {
    // Aquí puedes implementar la lógica para mostrar más detalles del producto
    const productoElement = document.querySelector(`[data-id="${id}"]`).closest('.producto');
    const titulo = productoElement.querySelector('.producto-titulo').textContent;
    const descripcion = productoElement.querySelector('.producto-descripcion').textContent;
    const precio = productoElement.querySelector('.producto-precio').textContent;
    
    alert(`Detalles de ${titulo}\n\n${descripcion}\n\nPrecio: ${precio}\n\nPara realizar un pedido, contáctanos por WhatsApp.`);
}