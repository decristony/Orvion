"""Generate minified CSS/JS for public home pages; originals stay untouched."""
from pathlib import Path
from rcssmin import cssmin
from rjsmin import jsmin
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/"css/style.css").read_text(encoding="utf-8")
js=(ROOT/"js/main.js").read_text(encoding="utf-8")
# mainScript lookup must also recognize the minified filename.
js=js.replace('script[src*="js/main.js"]','script[src*="js/main"]')
(ROOT/"css/style.min.css").write_text(cssmin(css),encoding="utf-8")
(ROOT/"js/main.min.js").write_text(jsmin(js),encoding="utf-8")
for relative in ("index.html","pt/index.html","en/index.html"):
    page=ROOT/relative
    s=page.read_text(encoding="utf-8")
    s=s.replace("css/style.css?v=49","css/style.min.css?v=53")
    s=s.replace("css/style.min.css?v=51","css/style.min.css?v=53")
    s=s.replace("js/main.js?v=20","js/main.min.js?v=23")
    s=s.replace("js/main.min.js?v=21","js/main.min.js?v=23")
    page.write_text(s,encoding="utf-8")
print("minified CSS and JS",len(css),len(js))
