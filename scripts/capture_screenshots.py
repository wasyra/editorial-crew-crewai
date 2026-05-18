"""
Captura screenshots de la UI Next.js (VetaUI) para el README.

Requisitos:
  pip install playwright
  playwright install chromium

Uso:
  Terminal 1: .\\scripts\\run-api.ps1          (API en :8001)
  Terminal 2: cd web && npm run dev             (UI en :3000)
  Terminal 3: python scripts/capture_screenshots.py
"""

import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "screenshots"
WEB_URL = "http://localhost:3000"
TOPIC = "Ciberseguridad en la nube"


def main() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala Playwright: pip install playwright")
        print("Luego: playwright install chromium")
        sys.exit(1)

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(WEB_URL, wait_until="networkidle", timeout=120_000)
        time.sleep(2)

        # 01 — Pantalla inicial (formulario + agentes)
        page.screenshot(path=OUT / "01_ui_inicio.png", full_page=True)

        # Chip de ejemplo
        page.get_by_role("button", name=TOPIC).click(timeout=10_000)
        time.sleep(0.5)

        # 05 — Panel de generación (opcional, captura tras pulsar)
        page.get_by_role("button", name="Generar post").click(timeout=10_000)
        time.sleep(1.5)
        page.screenshot(path=OUT / "05_generando.png", full_page=True)

        # Esperar resultado (~3 min máx)
        page.wait_for_selector("text=Copiar para LinkedIn", timeout=300_000)
        time.sleep(2)

        # 02 — Resultado completo
        page.screenshot(path=OUT / "02_ui_resultado.png", full_page=True)

        # Pestañas
        page.get_by_role("tab", name="Investigación").click()
        time.sleep(1)
        page.screenshot(path=OUT / "03_pestana_investigacion.png", full_page=True)

        page.get_by_role("tab", name="Borrador").click()
        time.sleep(1)
        page.screenshot(path=OUT / "04_pestana_borrador.png", full_page=True)

        page.get_by_role("tab", name="Final").click()
        time.sleep(1)
        page.screenshot(path=OUT / "06_pestana_final.png", full_page=True)

        # Scroll al bloque copiar LinkedIn
        copy_section = page.get_by_text("Copiar para LinkedIn")
        if copy_section.count() > 0:
            copy_section.first.scroll_into_view_if_needed()
            time.sleep(0.5)
            page.screenshot(path=OUT / "07_copiar_linkedin.png", full_page=True)

        browser.close()

    print(f"Screenshots guardados en {OUT}")


if __name__ == "__main__":
    main()
