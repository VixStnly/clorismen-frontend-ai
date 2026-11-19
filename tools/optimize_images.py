"""Kompres semua gambar landing utama + VIP ke WebP ringan (images/opt/).

Jalankan dari folder project:  python tools/optimize_images.py
- Ukuran diatur ±2x ukuran tampil (tajam di layar retina) tapi tidak lebih.
- Nama file baru (folder opt/) supaya cache browser lama (immutable 1 tahun) tidak menahan versi lama.
- File asli TIDAK diubah/dihapus.
"""
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'images')
OUT = os.path.join(IMG, 'opt')
os.makedirs(OUT, exist_ok=True)

total_in = total_out = 0


def save(src, name, *, w=None, h=None, q=80, lossless_alpha=False, crop=True):
    global total_in, total_out
    path = os.path.join(IMG, src)
    im = Image.open(path)
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if crop and im.mode == 'RGBA' and im.getbbox():
        im = im.crop(im.getchannel('A').getbbox() or (0, 0, *im.size))
    if w and im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if h and im.height > h:
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    out = os.path.join(OUT, name)
    im.save(out, 'WEBP', quality=q, method=6, alpha_quality=90 if not lossless_alpha else 100)
    a, b = os.path.getsize(path), os.path.getsize(out)
    total_in += a
    total_out += b
    print(f'{src:40s} {a/1024:7.0f} KB -> {name:32s} {b/1024:5.0f} KB  {im.size}')


# ---------- Landing utama ----------
for k in ['micellar', 'facewash', 'serum', 'sunscreen']:
    save(f'prod-{k}.png', f'prod-{k}.webp', h=560, q=82)          # tampil maks ±270px
save('hero-model.jpg', 'hero-model.webp', w=896, q=76)            # desktop
save('hero-model.jpg', 'hero-model-560.webp', w=560, q=74)        # HP
for f in sorted(glob.glob(os.path.join(IMG, 'inf-*.jpg'))):
    n = os.path.basename(f)
    save(n, n.replace('.jpg', '.webp'), w=553, q=74)              # kartu 290x430
save('logo-white.png', 'logo-white.webp', w=320, q=90)
save('ebook-cover.jpg', 'ebook-cover.webp', w=900, q=76)

# ---------- Halaman VIP ----------
save('vip-lux/hero-bundle-light.webp', 'vip-hero-bundle.webp', w=1000, q=80, crop=False)
save('vip-lux/hero-bundle-light.webp', 'vip-hero-bundle-600.webp', w=600, q=78, crop=False)
for k in ['micellar', 'facewash', 'serum', 'sunscreen']:
    save(f'vip-lux/prod-{k}.webp', f'vip-prod-{k}.webp', h=460, q=82)  # rak tampil maks ±220px
save('vip-lux/review-ilustrasi.webp', 'vip-review-ilustrasi.webp', w=720, q=76)
save('vip-lux/logo-dark.webp', 'vip-logo-dark.webp', w=260, q=90)
save('vip-lux/logo-gold.webp', 'vip-logo-gold.webp', w=160, q=90)

print(f'\nTOTAL {total_in/1024:.0f} KB -> {total_out/1024:.0f} KB')
