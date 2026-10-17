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
