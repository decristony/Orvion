#!/usr/bin/env python3
"""Generate lightweight portfolio thumbnails without changing full-size screenshots."""
from pathlib import Path
from PIL import Image
import re

ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "public" / "portfolio"
THUMBS = PORTFOLIO / "thumbs"
THUMBS.mkdir(exist_ok=True)
FILES = [
    "IFORTEC.webp", "Dr Diego.webp", "site 04.webp", "Site 01.webp",
    "Site 03.webp", "Site 02.webp", "Camila Ribeiro.webp",
]
for filename in FILES:
    source = PORTFOLIO / filename
    if not source.is_file():
        raise FileNotFoundError(source)
    with Image.open(source) as original:
        image = original.copy()
        image.thumbnail((320, 900), Image.Resampling.LANCZOS)
        image.save(THUMBS / filename, format="WEBP", quality=68, method=6)

for relative in ("index.html", "pt/index.html", "en/index.html"):
    page = ROOT / relative
    html = page.read_text(encoding="utf-8")
    # Only change small portfolio thumbnails; full-size scrolling showcase stays intact.
    pattern = re.compile(r'(<div class="cases-thumb-img">\s*<img\b[^>]*\bsrc=")([^"]+)("[^>]*>)')
    def update(match):
        src = match.group(2)
        if "/portfolio/" not in src:
            return match.group(0)
        name = src.split("/portfolio/", 1)[1].removeprefix("thumbs/")
        if name not in FILES:
            return match.group(0)
        opening, closing = match.group(1), match.group(3)
        if 'fetchpriority=' not in closing:
            closing = closing.replace("/>", ' fetchpriority="low"/>')
        if 'loading=' not in closing:
            closing = closing.replace("/>", ' loading="lazy"/>')
        return opening + src.split("/portfolio/", 1)[0] + "/portfolio/thumbs/" + name + closing
    html = pattern.sub(update, html)
    page.write_text(html, encoding="utf-8")
print("Generated thumbnails and updated PT-BR, PT-PT and EN.")
