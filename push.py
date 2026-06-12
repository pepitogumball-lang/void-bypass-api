import os
import subprocess
from datetime import datetime

# ============================================================
# CREDENCIALES — el token se lee desde la variable de entorno
# GITHUB_TOKEN (configúrala en Replit Secrets)
# ============================================================
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_USER  = "pepitogumball-lang"
GITHUB_REPO  = "void-bypass-api"
# ============================================================

def run(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[ERROR] Comando: {command}")
        print(result.stderr)
        raise RuntimeError(f"Falló el comando: {command}")
    print(result.stdout)

def push():
    if not GITHUB_TOKEN:
        print("❌ Error: la variable de entorno GITHUB_TOKEN no está definida.")
        return

    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        run("git add .")

        commit_result = subprocess.run(
            f'git commit -m "Auto-deploy: {timestamp}"',
            shell=True, capture_output=True, text=True
        )
        if commit_result.returncode != 0:
            if "nothing to commit" in commit_result.stdout or "nothing to commit" in commit_result.stderr:
                print("No hay cambios nuevos, procediendo al push...")
            else:
                print(f"[ERROR] git commit\n{commit_result.stderr}")
                raise RuntimeError("Falló el comando: git commit")
        else:
            print(commit_result.stdout)

        run(f"git remote set-url origin https://{GITHUB_TOKEN}@github.com/{GITHUB_USER}/{GITHUB_REPO}.git")
        run("git push origin main")

        print("✅ Push completado con éxito.")
    except RuntimeError as e:
        print(f"❌ Error durante el push: {e}")

if __name__ == "__main__":
    push()
