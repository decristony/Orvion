from pathlib import Path
from PIL import Image
import re
ROOT=Path(__file__).resolve().parents[1]
FILES={**{f"assets/img/logo-partner-{n}.png":(240,150) for n in range(1,7)},
"assets/img/logo-ifortec.webp":(240,150),"assets/img/sites-orvion.webp":(900,900),
"assets/img/logo-full.webp":(420,180),**{f"assets/img/hero-avatar-{n}.webp":(64,64) for n in range(1,4)},
**{f"assets/img/{n}.webp":(64,64) for n in ("Instagram","linkedin","whatsapp","Email")},
**{f"assets/img/flag-{n}.png":(64,64) for n in ("br","pt","us")},
"assets/img/icon-behance.png":(64,64),**{f"public/mockups/slide {n}.webp":(850,580) for n in range(1,7)}}
updated={}
for name,size in FILES.items():
    src=ROOT/name
    if not src.exists(): continue
    target=src.with_name(src.stem+"-optimized.webp")
    with Image.open(src) as im:
        im.thumbnail(size,Image.Resampling.LANCZOS)
        im.save(target,"WEBP",quality=76,method=6)
    if target.stat().st_size < src.stat().st_size:
        updated[name]=name.rsplit(".",1)[0]+"-optimized.webp"
    else:
        target.unlink()
for rel in ("index.html","pt/index.html","en/index.html"):
    p=ROOT/rel
    html=p.read_text(encoding="utf-8")
    prefix="../" if rel!="index.html" else ""
    for old,new in updated.items():
        html=html.replace('src="'+prefix+old+'"','src="'+prefix+new+'"')
    if "public/mockups/slide 1.webp" in updated:
        html=html.replace("slide%201.webp","slide%201-optimized.webp")
    p.write_text(html,encoding="utf-8")
p=ROOT/"js/mockups.js"
js=p.read_text(encoding="utf-8")
for n in range(1,7):
    if f"public/mockups/slide {n}.webp" in updated:
        js=js.replace(f'"slide {n}.webp"',f'"slide {n}-optimized.webp"')
p.write_text(js,encoding="utf-8")
print("optimized",len(updated),"images")

# Responsive secondary imagery: keep the first (LCP) hero slide unchanged.
# All originals and the existing -optimized.webp variants remain available.
# Secondary slides are never the initial LCP element and are displayed smaller.
compact_sources = {f"public/mockups/slide {n}.webp": 640 for n in range(2, 7)}
compact_sources["assets/img/sites-orvion.webp"] = 760
compact_results = {}
for source_name, target_width in compact_sources.items():
    source = ROOT / source_name
    optimized = source.with_name(source.stem + "-optimized.webp")
    compact = source.with_name(source.stem + "-compact.webp")
    if not source.exists() or not optimized.exists():
        continue
    with Image.open(source) as image:
        image.thumbnail((target_width, target_width), Image.Resampling.LANCZOS)
        image.save(compact, "WEBP", quality=78, method=6)
    # A new resource is useful only when it is actually smaller.
    if compact.stat().st_size < optimized.stat().st_size:
        compact_results[source_name] = compact.name
    else:
        compact.unlink()

for rel in ("index.html", "pt/index.html", "en/index.html"):
    page = ROOT / rel
    html = page.read_text(encoding="utf-8")
    if "assets/img/sites-orvion.webp" in compact_results:
        html = html.replace("sites-orvion-optimized.webp", "sites-orvion-compact.webp")
    if any(f"public/mockups/slide {n}.webp" in compact_results for n in range(2, 7)):
        # Bust the 7-day JS cache, keeping the original LCP preload untouched.
        html = html.replace("js/mockups.js?v=4", "js/mockups.js?v=5")
    page.write_text(html, encoding="utf-8")

manifest = ROOT / "js/mockups.js"
data = manifest.read_text(encoding="utf-8")
for n in range(2, 7):
    if f"public/mockups/slide {n}.webp" in compact_results:
        data = data.replace(f"slide {n}-optimized.webp", f"slide {n}-compact.webp")
manifest.write_text(data, encoding="utf-8")
print("Compact secondary images:", len(compact_results))
