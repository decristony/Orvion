"""Generate production CSS, JS and compact critical CSS for the three homepages."""
from pathlib import Path
import re
import tinycss2
from rcssmin import cssmin
from rjsmin import jsmin

ROOT = Path(__file__).resolve().parents[1]
css = (ROOT / "css/style.css").read_text(encoding="utf-8")
js = (ROOT / "js/main.js").read_text(encoding="utf-8")
js = js.replace('script[src*="js/main.js"]', 'script[src*="js/main"]')
(ROOT / "css/style.min.css").write_text(cssmin(css), encoding="utf-8")
(ROOT / "js/main.min.js").write_text(jsmin(js), encoding="utf-8")

# Keep all paint-critical CSS for the header, hero, mobile layout and carousel.
# The complete stylesheet still loads; only non-critical rules may be deferred.
KEYS = (
    ":root", "html", "body", "*", "a", "img", "svg", "button", ".container",
    ".nav", ".menu", ".logo", ".language", ".mobile", ".hamburger",
    ".hero", ".cf-", ".mockup-", ".stage-dots", ".sd", ".btn",
    ".cursor", ".page", ".header", ".section", ".reveal",
)
def chosen(selector):
    s = selector.lower().strip()
    return any(k in s for k in KEYS)

def filter_css(tokens):
    output = []
    for rule in tokens:
        if rule.type == "qualified-rule":
            name = tinycss2.serialize(rule.prelude).strip()
            if chosen(name):
                output.append(tinycss2.serialize([rule]))
        elif rule.type == "at-rule":
            name = rule.lower_at_keyword
            if name in ("font-face", "property"):
                output.append(tinycss2.serialize([rule]))
            elif name in ("media", "supports", "layer") and rule.content:
                inner = filter_css(tinycss2.parse_rule_list(rule.content, skip_whitespace=True, skip_comments=True))
                if inner.strip():
                    output.append("@" + name + " " + tinycss2.serialize(rule.prelude) + "{" + inner + "}")
    return "".join(output)

critical = cssmin(filter_css(tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True)))
if not (".hero" in critical and ".nav" in critical and "@font-face" in critical):
    raise RuntimeError("Critical CSS extraction failed")
if len(critical) > 80000:
    raise RuntimeError("Critical CSS unexpectedly large")

for rel in ("index.html", "pt/index.html", "en/index.html"):
    page = ROOT / rel
    html = page.read_text(encoding="utf-8")
    prefix = "" if rel == "index.html" else "../"
    # Replace our own previous critical block when rebuilding.
    html = re.sub(r'<style id="orvion-critical-css">.*?</style>\s*', "", html, flags=re.S)
    html = re.sub(r'<link(?=[^>]*rel="stylesheet")(?=[^>]*href="(?:\.\./)?css/style\.min\.css\?v=\d+")[^>]*/>\s*', "", html)
    html = re.sub(r'<link(?=[^>]*rel="preload")(?=[^>]*as="style")(?=[^>]*href="(?:\.\./)?css/style\.min\.css\?v=\d+")[^>]*/>\s*', "", html)
    html = re.sub(r'<noscript><link href="(?:\.\./)?css/style\.min\.css\?v=\d+" rel="stylesheet"/></noscript>\s*', "", html)
    head_insert = (
        '<style id="orvion-critical-css">' + critical + '</style>\n'
        + '<link rel="preload" as="style" href="' + prefix + 'css/style.min.css?v=55" '
        + 'onload="this.onload=null;this.rel=\'stylesheet\'"/>\n'
        + '<noscript><link href="' + prefix + 'css/style.min.css?v=55" rel="stylesheet"/></noscript>\n'
    )
    html = html.replace("</head>", head_insert + "</head>", 1)
    html = html.replace("js/main.min.js?v=21", "js/main.min.js?v=23")
    html = html.replace("js/main.js?v=20", "js/main.min.js?v=23")
    page.write_text(html, encoding="utf-8")
print("built CSS",len(css),"critical",len(critical),"JS",len(js))
