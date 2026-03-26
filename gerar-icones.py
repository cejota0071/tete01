#!/usr/bin/env python3
"""
Gerador de ícones PWA — QG Marmitas
Gera todos os tamanhos necessários a partir de um arquivo PNG base.

Uso:
  pip install Pillow
  python gerar-icones.py --input logo.png

Se não tiver uma logo, o script cria um ícone padrão com as cores do QG Marmitas.
"""

import os
import sys
import argparse
from PIL import Image, ImageDraw

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUTPUT_DIR = "icons"
BG_COLOR = (26, 10, 0)      # #1a0a00
ACCENT_COLOR = (232, 93, 4)  # #e85d04

def criar_icone_padrao(size: int) -> Image.Image:
    """Cria um ícone simples com as cores do QG Marmitas caso não haja logo."""
    img = Image.new("RGBA", (size, size), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    # Círculo de destaque
    padding = size * 0.15
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=ACCENT_COLOR + (255,)
    )

    # Letra "Q" central (simplificado como retângulo)
    cx, cy = size / 2, size / 2
    r = size * 0.22
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BG_COLOR + (255,))

    return img


def gerar_icones(input_path: str | None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if input_path and os.path.exists(input_path):
        base = Image.open(input_path).convert("RGBA")
        print(f"✅ Usando imagem base: {input_path}")
    else:
        print("⚠️  Nenhuma imagem base encontrada. Gerando ícone padrão...")
        base = criar_icone_padrao(512)

    for size in SIZES:
        resized = base.resize((size, size), Image.LANCZOS)
        # Garante fundo sólido (sem transparência) para maskable
        bg = Image.new("RGBA", (size, size), BG_COLOR + (255,))
        bg.paste(resized, (0, 0), resized if resized.mode == 'RGBA' else None)
        output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}.png")
        bg.save(output_path, "PNG")
        print(f"  🖼️  {output_path}")

    print(f"\n✅ {len(SIZES)} ícones gerados na pasta '{OUTPUT_DIR}/'")
    print("📋 Copie a pasta 'icons/' para a raiz do seu site.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gera ícones PWA para QG Marmitas")
    parser.add_argument("--input", "-i", help="Caminho para a logo PNG (opcional)", default=None)
    args = parser.parse_args()
    gerar_icones(args.input)
