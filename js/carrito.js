// Simulación de carrito de compras
document.addEventListener('DOMContentLoaded', function() {
    const botonesCarrito = document.querySelectorAll('.producto-acciones .btn:last-child');
    
    botonesCarrito.forEach(boton => {
        boton.addEventListener('click', function() {
            const producto = this.closest('.producto');
            const titulo = producto.querySelector('.producto-titulo').textContent;
            const precio = producto.querySelector('.producto-precio').textContent;
            
            // En un caso real, aquí agregarías el producto al carrito
            // Por ahora, solo mostramos un mensaje
            alert(`¡${titulo} agregado a tu pedido!\n\nPrecio: ${precio}\n\nTe contactaremos para confirmar los detalles de tu pedido.`);
            
            // Aquí podrías guardar en localStorage o enviar a un backend
            guardarEnCarrito({
                titulo: titulo,
                precio: precio,
                id: this.getAttribute('data-id')
            });
        });
    });
});

function guardarEnCarrito(producto) {
    // Obtener carrito actual de localStorage
    let carrito = JSON.parse(localStorage.getItem('carritoSaraCookies')) || [];
    
    // Agregar nuevo producto
    carrito.push(producto);
    
    // Guardar en localStorage
    localStorage.setItem('carritoSaraCookies', JSON.stringify(carrito));
    
    console.log('Producto agregado al carrito:', producto);
}