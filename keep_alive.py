import requests
import time
import os

# URL del panel en Vercel
URL = os.getenv("SHADOW_PANEL_URL", "https://void-bypass-api.vercel.app/api/health")

def ping_vercel():
    try:
        response = requests.get(URL, timeout=10)
        if response.status_code == 200:
            print(f"[{time.strftime('%H:%M:%S')}] Heartbeat exitoso: {response.json()}")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Error: Status {response.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Fallo al conectar: {e}")

if __name__ == "__main__":
    print("Iniciando motor de persistencia Python (Keep-Alive)...")
    # Este script puede ser ejecutado en un entorno local o vía GitHub Actions
    # para asegurar que el servidor Vercel no entre en hibernación.
    while True:
        ping_vercel()
        # Esperar 5 minutos (300 segundos)
        time.sleep(300)
