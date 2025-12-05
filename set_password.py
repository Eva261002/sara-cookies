# set_password.py
import hashlib
import json
import os
import getpass

def generar_hash_password():
    """Genera el hash de una contraseña para server.py"""
    print("🔐 GENERADOR DE CONTRASEÑA - SARA COOKIES")
    print("=" * 50)
    
    while True:
        print("\n1. Generar hash para server.py")
        print("2. Actualizar archivo de configuración directamente")
        print("3. Ver contraseña actual")
        print("4. Salir")
        
        opcion = input("\nSelecciona una opción (1-4): ").strip()
        
        if opcion == "1":
            password = getpass.getpass("Nueva contraseña: ")
            confirm = getpass.getpass("Confirmar contraseña: ")
            
            if password == confirm:
                if len(password) < 6:
                    print("❌ La contraseña debe tener al menos 6 caracteres")
                    continue
                
                hash_value = hashlib.sha256(password.encode()).hexdigest()
                
                print("\n" + "=" * 50)
                print("✅ CONTRASEÑA GENERADA CORRECTAMENTE")
                print("=" * 50)
                print("\nCopia esta línea y pégala en server.py:")
                print(f'ADMIN_PASSWORD_HASH = "{hash_value}"')
                print("\nUbicación en server.py: línea ~14")
                print("=" * 50)
            else:
                print("❌ Las contraseñas no coinciden")
                
        elif opcion == "2":
            password = getpass.getpass("Nueva contraseña: ")
            confirm = getpass.getpass("Confirmar contraseña: ")
            
            if password == confirm:
                if len(password) < 6:
                    print("❌ La contraseña debe tener al menos 6 caracteres")
                    continue
                
                hash_value = hashlib.sha256(password.encode()).hexdigest()
                
                # Guardar en archivo de configuración
                config_file = 'backend/data/admin_config.json'
                os.makedirs(os.path.dirname(config_file), exist_ok=True)
                
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump({'password_hash': hash_value}, f, indent=2)
                
                print(f"\n✅ Contraseña guardada en {config_file}")
                print("⚠️  Reinicia el servidor para aplicar los cambios")
                
        elif opcion == "3":
            config_file = 'backend/data/admin_config.json'
            if os.path.exists(config_file):
                try:
                    with open(config_file, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                        print(f"\n📁 Configuración cargada de {config_file}")
                        print(f"🔑 Hash almacenado: {config.get('password_hash', 'No encontrado')[:50]}...")
                except:
                    print(f"\n❌ Error leyendo {config_file}")
            else:
                print(f"\n📁 {config_file} no existe")
                print("🔑 Usando contraseña por defecto: sara123")
                
        elif opcion == "4":
            print("\n👋 ¡Hasta luego!")
            break
            
        else:
            print("❌ Opción no válida")

if __name__ == "__main__":
    try:
        generar_hash_password()
        input("\nPresiona Enter para salir...")
    except KeyboardInterrupt:
        print("\n\nOperación cancelada.")