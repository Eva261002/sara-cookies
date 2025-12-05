// Botones de inspiración que redirigen a WhatsApp con el tema
document.addEventListener('DOMContentLoaded', function() {
    const botonesInspiracion = document.querySelectorAll('.btn-inspiracion');
    
    botonesInspiracion.forEach(boton => {
        boton.addEventListener('click', function() {
            const tema = this.getAttribute('data-tema');
            const mensaje = `¡Hola! Me interesan las galletas ${tema.toLowerCase()}. ¿Podrían darme más información?`;
            const urlWhatsApp = `https://wa.me/59175097054?text=${encodeURIComponent(mensaje)}`;
            window.open(urlWhatsApp, '_blank');
        });
    });
    
    // Efecto de scroll en header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 182, 193, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#ffb6c1';
            header.style.backdropFilter = 'none';
        }
    });
});