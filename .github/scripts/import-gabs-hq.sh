#!/usr/bin/env bash
set -euo pipefail

mkdir -p gabs-scrubs/assets/gabs-hq

download() {
  local id="$1"
  local out="$2"
  curl -fL --retry 3 --retry-delay 2 --connect-timeout 20 \
    "https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t" \
    -o "$out"
}

download '1FeYuqDC9s-JIlSm4RsABg3F7BnnYXc1G' 'gabs-scrubs/assets/gabs-hq/hero-beige-mirror-v2.png'
download '1jCmzWb8AkhV3KZrOcF-m2H5V25LnWyiy' 'gabs-scrubs/assets/gabs-hq/hero-beige-portrait-v2.png'
download '1M1SwO1OxObHcNvDCXSFGunfD16Kq8I90' 'gabs-scrubs/assets/gabs-hq/hero-red-v2.png'
download '1i-cKPYmJWbF45rWpiqMZaYZu-598FJM1' 'gabs-scrubs/assets/gabs-hq/hero-blue-client-v2.png'
download '1_1-LSa0QjKwR_eX3kqFEC2kaah9z5OoY' 'gabs-scrubs/assets/gabs-hq/hero-team-navy-v2.png'
download '18YINwRaS163YYqmMCaRvxTSYYXtOa_dJ' 'gabs-scrubs/assets/gabs-hq/detail-sleeve-v2.png'

python -m pip install --quiet pillow

python - <<'PY'
from pathlib import Path
from PIL import Image
import hashlib, re

base = Path('gabs-scrubs/assets/gabs-hq')
expected = {
    'hero-beige-mirror-v2.png': ('b2702017c532e408d3cf212548208fcb0d3fe15e6da8050eadf55ba3a0d09623', 1888389),
    'hero-beige-portrait-v2.png': ('01530410b714a80adafcea78634a58e3419fc09e065132b3ad92b04b2ba3808e', 3214921),
    'hero-red-v2.png': ('19461e7b821ff82cf6af9184fac278f2144ee4271b06988e8e8857f31450acaa', 3083019),
    'hero-blue-client-v2.png': ('5f579a699a0926de8863a17602cb34dae5a579ba3eae05ea91c166bfe072914f', 3274564),
    'hero-team-navy-v2.png': ('56e4a9ef61f1b2d79ded7fb2b1e7255fb5b05a91c68ab1cae4b1bbe6241bfdd5', 2898296),
    'detail-sleeve-v2.png': ('3659d590027aaf71dd708cbedba3f8d987cf6f146ac5f88a079d5bf303e069e2', 3065008),
}
for name, (expected_pixels, original_size) in expected.items():
    p = base / name
    data = p.read_bytes()
    if len(data) < 500_000:
        raise SystemExit(f'{name}: downloaded file is suspiciously small ({len(data)} bytes)')
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit(f'{name}: not a PNG')
    with Image.open(p) as im:
        if im.size != (1122, 1402):
            raise SystemExit(f'{name}: unexpected dimensions {im.size}')
        pixel_hash = hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()
    if pixel_hash != expected_pixels:
        raise SystemExit(f'{name}: pixel data changed in transit')
    print(f'{name}: {len(data)} bytes (Drive original {original_size}), 1122x1402, pixel-sha256={pixel_hash}')

index = Path('gabs-scrubs/index.html')
html = index.read_text(encoding='utf-8')
hero_track = '''<div class="hero-marquee-track" aria-label="Galeria da campanha Gabs Scrubs">
    <figure class="hero-model"><img src="assets/gabs-hq/hero-beige-mirror-v2.png" alt="Profissional usando scrub bege Gabs" width="1122" height="1402" loading="eager" fetchpriority="high" decoding="async"></figure>
    <figure class="hero-model"><img src="assets/gabs-hq/hero-beige-portrait-v2.png" alt="Profissional usando scrub bege Gabs" width="1122" height="1402" loading="lazy" decoding="async"></figure>
    <figure class="hero-model"><img src="assets/gabs-hq/hero-red-v2.png" alt="Profissional usando scrub vermelho Gabs" width="1122" height="1402" loading="lazy" decoding="async"></figure>
    <figure class="hero-model"><img src="assets/gabs-hq/hero-blue-client-v2.png" alt="Profissional usando scrub azul Gabs no trabalho" width="1122" height="1402" loading="lazy" decoding="async"></figure>
    <figure class="hero-model"><img src="assets/gabs-hq/hero-team-navy-v2.png" alt="Equipe usando scrubs marinho Gabs" width="1122" height="1402" loading="lazy" decoding="async"></figure>
    <figure class="hero-model"><img src="assets/gabs-hq/detail-sleeve-v2.png" alt="Detalhe de manga e acabamento do scrub Gabs" width="1122" height="1402" loading="lazy" decoding="async"></figure>
  </div>'''
html, count = re.subn(r'<div class="hero-marquee-track"[^>]*>.*?</div>\s*<div class="hero-marquee-copy">', hero_track + '\n  <div class="hero-marquee-copy">', html, count=1, flags=re.S)
if count != 1:
    raise SystemExit('Could not replace hero track')

preload = '<link rel="preload" as="image" href="assets/gabs-hq/hero-beige-mirror-v2.png" fetchpriority="high">'
if preload not in html:
    html = html.replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">\n' + preload, 1)

replacements = [
    (r'(<a class="mega-feature" href="feminino\.html"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-beige-mirror-v2.png"'),
    (r'(<a class="category-tile" href="feminino\.html"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-red-v2.png"'),
    (r'(<a class="category-tile" href="masculino\.html"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-team-navy-v2.png"'),
    (r'(<a class="category-tile wide" href="feminino\.html"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-blue-client-v2.png"'),
    (r'(<div class="editorial-media"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-blue-client-v2.png"'),
    (r'(<section class="look"><img )src="[^"]+"', r'\1src="assets/gabs-hq/hero-red-v2.png"'),
    (r'(<div class="tech-media"><img )src="[^"]+"', r'\1src="assets/gabs-hq/detail-sleeve-v2.png"'),
]
for pattern, replacement in replacements:
    html, n = re.subn(pattern, replacement, html, count=1)
    if n != 1:
        raise SystemExit(f'Expected one replacement for {pattern}, got {n}')

instagram = '''<div class="instagram-grid"><a href="https://www.instagram.com/gabscrubs" target="_blank"><img src="assets/gabs-hq/hero-beige-mirror-v2.png" alt="Comunidade Gabs" loading="lazy" width="1122" height="1402"></a><a href="https://www.instagram.com/gabscrubs" target="_blank"><img src="assets/gabs-hq/hero-beige-portrait-v2.png" alt="Comunidade Gabs" loading="lazy" width="1122" height="1402"></a><a href="https://www.instagram.com/gabscrubs" target="_blank"><img src="assets/gabs-hq/hero-red-v2.png" alt="Comunidade Gabs" loading="lazy" width="1122" height="1402"></a><a href="https://www.instagram.com/gabscrubs" target="_blank"><img src="assets/gabs-hq/hero-blue-client-v2.png" alt="Comunidade Gabs" loading="lazy" width="1122" height="1402"></a></div>'''
html, n = re.subn(r'<div class="instagram-grid">.*?</div>', instagram, html, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace Instagram grid')
index.write_text(html, encoding='utf-8')

css = Path('gabs-scrubs/hero-slider.css')
text = css.read_text(encoding='utf-8')
marker = '/* HQ Gabs photography v2 — originals preserved, CSS crop only */'
if marker not in text:
    text += '''\n\n/* HQ Gabs photography v2 — originals preserved, CSS crop only */
.hero-model:nth-child(-n+6){background-image:none!important}
.hero-model img{opacity:1!important;z-index:0!important;object-fit:cover!important}
.hero-model:nth-child(1) img{object-position:center 20%!important}
.hero-model:nth-child(2) img{object-position:center 18%!important}
.hero-model:nth-child(3) img{object-position:center 16%!important}
.hero-model:nth-child(4) img{object-position:center 24%!important}
.hero-model:nth-child(5) img{object-position:center 22%!important}
.hero-model:nth-child(6) img{object-position:center 50%!important}
.hero-model:nth-child(1)::after{content:'Feito para vestir bem.'!important}
.hero-model:nth-child(2)::after{content:'Leve no corpo.'!important}
.hero-model:nth-child(3)::after{content:'Cor que sai do automático.'!important}
.hero-model:nth-child(4)::after{content:'Para horas em movimento.'!important}
.hero-model:nth-child(5)::after{content:'Uma equipe. A mesma identidade.'!important}
.hero-model:nth-child(6)::after{content:'O detalhe muda tudo.'!important}
.categories .category-tile:first-child,
.categories .category-tile.wide,
.editorial-media,
.look{background-image:none!important}
.categories .category-tile:first-child>img,
.categories .category-tile.wide>img,
.editorial-media>img,
.look>img{opacity:1!important}
@media (max-width:820px){
  .hero-model:nth-child(1) img{object-position:center 18%!important}
  .hero-model:nth-child(2) img{object-position:center 17%!important}
  .hero-model:nth-child(3) img{object-position:center 16%!important}
  .hero-model:nth-child(4) img{object-position:center 22%!important}
  .hero-model:nth-child(5) img{object-position:center 20%!important}
  .hero-model:nth-child(6) img{object-position:center 50%!important}
}
'''
    css.write_text(text, encoding='utf-8')
PY

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add gabs-scrubs/assets/gabs-hq gabs-scrubs/index.html gabs-scrubs/hero-slider.css
git diff --cached --stat
git commit -m 'Publish lossless HQ Gabs photography'
git push origin HEAD:main
