# server.py
import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Cambiar al directorio donde está index.html
web_dir = os.path.join(os.path.dirname(__file__))
os.chdir(web_dir)

# Configurar el manejador
Handler = http.server.SimpleHTTPRequestHandler

# Crear el servidor
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor ejecutándose en http://localhost:{PORT}")
    print("Presiona Ctrl+C para detener el servidor")
    
    # Abrir automáticamente el navegador
    webbrowser.open(f'http://localhost:{PORT}')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")