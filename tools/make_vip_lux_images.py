"""Generate ulang aset glossy untuk halaman VIP (images/vip-lux/).

Jalankan dari folder project:  python tools/make_vip_lux_images.py
Sumber: images/prod-*.png, images/logo-white.png, images/hero-model.jpg
"""
import math
import os
import random

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'images')
OUT = os.path.join(ROOT, 'images', 'vip-lux')
os.makedirs(OUT, exist_ok=True)
random.seed(7)

PRODUCTS = ['micellar', 'facewash', 'serum', 'sunscreen']
GOLD = (232, 196, 120)


def arr(im):
    return np.asarray(im).astype(np.float32) / 255.0


def img(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def glossify(im: Image.Image) -> Image.Image:
    """Tambah kilap: kontras, specular stripe, rim light, dan clear-coat atas."""
    im = im.convert('RGBA')
    rgb = im.convert('RGB')
    rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    rgb = ImageEnhance.Color(rgb).enhance(1.15)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
    a = arr(rgb)
    alpha = arr(im.getchannel('A'))
    h, w = alpha.shape

    # Lebar objek per baris (untuk stripe yang mengikuti bentuk botol)
    xs = np.arange(w)[None, :].repeat(h, 0)
    mask = alpha > 0.5
    left = np.where(mask.any(1), np.argmax(mask, 1), 0)
    right = np.where(mask.any(1), w - 1 - np.argmax(mask[:, ::-1], 1), w - 1)
    width = np.maximum(right - left, 1)
    u = (xs - left[:, None]) / width[:, None]  # 0..1 dari kiri ke kanan objek

    # Specular utama (strip lebar lembut) + strip tipis tajam
    s1 = np.exp(-((u - 0.22) ** 2) / (2 * 0.06 ** 2)) * 0.55
    s2 = np.exp(-((u - 0.30) ** 2) / (2 * 0.012 ** 2)) * 0.45
    s3 = np.exp(-((u - 0.86) ** 2) / (2 * 0.025 ** 2)) * 0.22
    spec = (s1 + s2 + s3)[..., None]
    # Bayangan silinder di kanan untuk volume
    shade = (1 - 0.28 * np.clip((u - 0.6) / 0.4, 0, 1) ** 1.6)[..., None]
    a = a * shade
    a = 1 - (1 - a) * (1 - spec)  # screen blend

    # Rim light cyan di tepi kanan, hangat di kiri
    edge = img(alpha).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(2))
    e = arr(edge)[..., None] * 1.6
    rim = np.where(u[..., None] > 0.5, np.array([0.55, 0.9, 1.0]), np.array([1.0, 0.9, 0.7]))
    a = 1 - (1 - a) * (1 - np.clip(e, 0, 1) * rim * 0.55)

    out = img(a).convert('RGBA')
    out.putalpha(im.getchannel('A'))
    return out


def reflect(im: Image.Image, strength=0.35, length=0.32) -> Image.Image:
    r = im.transpose(Image.FLIP_TOP_BOTTOM)
    h = int(im.height * length)
    r = r.crop((0, 0, im.width, h))
    grad = np.linspace(strength, 0, h)[:, None]
    ra = arr(r.getchannel('A')) * grad
    r.putalpha(img(ra))
    return r.filter(ImageFilter.GaussianBlur(1.5))


def radial(size, center, radius, color, alpha=1.0):
    w, h = size
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt((x - center[0]) ** 2 + (y - center[1]) ** 2) / radius
    a = np.clip(1 - d, 0, 1) ** 2 * alpha
    layer = np.zeros((h, w, 4), np.float32)
    layer[..., :3] = np.array(color) / 255.0
    layer[..., 3] = a
    return img(layer)


def load_products(height):
    res = {}
    for k in PRODUCTS:
        p = Image.open(os.path.join(SRC, f'prod-{k}.png')).convert('RGBA')
        p = p.crop(p.getbbox())
        p = p.resize((int(p.width * height / p.height), height), Image.LANCZOS)
        res[k] = glossify(p)
    return res


def gold_logo(width):
    logo = Image.open(os.path.join(SRC, 'logo-white.png')).convert('RGBA')
    logo = logo.crop(logo.getbbox())
    logo = logo.resize((width, int(logo.height * width / logo.width)), Image.LANCZOS)
    h = logo.height
    g = np.zeros((h, width, 3), np.float32)
    t = np.linspace(0, 1, h)[:, None, None]
    top, mid, bot = np.array([255, 240, 190]), np.array([226, 182, 98]), np.array([150, 106, 40])
    col = np.where(t < 0.5, top + (mid - top) * (t / 0.5), mid + (bot - mid) * ((t - 0.5) / 0.5))
    g[:] = col / 255.0
    src = arr(logo.convert('RGB'))
    sat = (src.max(2) - src.min(2))[..., None]
    g = np.where(sat > 0.25, src, g)  # bagian berwarna (label MEN) tetap warna asli
    out = img(g).convert('RGBA')
    out.putalpha(logo.getchannel('A'))
    return out


def font(size, bold=True):
    for f in (['bahnschrift.ttf', 'segoeuib.ttf', 'arialbd.ttf'] if bold else ['seguisb.ttf', 'arial.ttf']):
        try:
            return ImageFont.truetype(os.path.join('C:\\Windows\\Fonts', f), size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_box(w, h):
    """Box eksklusif hitam doff + foil emas (tampak depan + sisi miring)."""
    depth = int(w * 0.16)
    W, H = w + depth + 10, h + depth + 10
    box = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(box)
    fx, fy = 0, depth
    # Sisi atas
    d.polygon([(fx, fy), (fx + depth, fy - depth), (fx + w + depth, fy - depth), (fx + w, fy)], fill=(34, 40, 52, 255))
    # Sisi kanan
    d.polygon([(fx + w, fy), (fx + w + depth, fy - depth), (fx + w + depth, fy + h - depth), (fx + w, fy + h)], fill=(10, 13, 19, 255))
    # Depan: gradien
    front = np.zeros((h, w, 4), np.float32)
    t = np.linspace(0, 1, h)[:, None]
    sx = np.linspace(0, 1, w)[None, :]
    base = 0.07 + 0.06 * (1 - t) + 0.03 * np.exp(-((sx - 0.3) ** 2) / 0.02)
    front[..., 0] = base * 1.0
    front[..., 1] = base * 1.08
    front[..., 2] = base * 1.3
    front[..., 3] = 1
    fr = img(front)
    box.alpha_composite(fr, (fx, fy))
    d = ImageDraw.Draw(box)
    # Garis foil emas
    m = int(w * 0.06)
    d.rectangle([fx + m, fy + m, fx + w - m, fy + h - m], outline=GOLD + (255,), width=3)
    d.rectangle([fx + m + 8, fy + m + 8, fx + w - m - 8, fy + h - m - 8], outline=GOLD + (120,), width=1)
    # Tepi atas berkilau
    d.line([(fx + depth, fy - depth), (fx + w + depth, fy - depth)], fill=(255, 230, 170, 200), width=2)
    d.line([(fx, fy), (fx + w, fy)], fill=(255, 230, 170, 160), width=2)
    # Logo emas + tulisan
    lg = gold_logo(int(w * 0.34))
    box.alpha_composite(lg, (fx + (w - lg.width) // 2, fy + int(h * 0.065)))
    f1, f2 = font(int(w * 0.055)), font(int(w * 0.032))
    for txt, f, y, col in [
        ('V I P   E D I T I O N', f1, 0.258, (240, 210, 150, 255)),
    ]:
        tw = d.textlength(txt, font=f)
        d.text((fx + (w - tw) / 2, fy + h * y), txt, font=f, fill=col)
    # Kilap diagonal di depan
    sheen = np.zeros((h, w, 4), np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    band = np.exp(-(((xx / w) - (yy / h) * 0.6 - 0.18) ** 2) / 0.004) * 0.22
    sheen[..., :3] = 1
    sheen[..., 3] = band
    box.alpha_composite(img(sheen), (fx, fy))
    return box


def hero_bundle(light=False):
    """light=True: versi untuk latar putih (tanpa glow gelap & bintang, bayangan lembut)."""
    S = 1400
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # Glow latar
    if light:
        c.alpha_composite(radial((S, S), (S * 0.5, S * 0.52), S * 0.5, (85, 200, 246), 0.22))
        c.alpha_composite(radial((S, S), (S * 0.66, S * 0.36), S * 0.3, (240, 200, 120), 0.30))
    else:
        c.alpha_composite(radial((S, S), (S * 0.5, S * 0.55), S * 0.55, (40, 110, 255), 0.55))
        c.alpha_composite(radial((S, S), (S * 0.68, S * 0.38), S * 0.32, (232, 190, 110), 0.35))
        c.alpha_composite(radial((S, S), (S * 0.3, S * 0.45), S * 0.28, (85, 217, 246), 0.30))

    floor_y = int(S * 0.80)
    # Lantai: kaca biru (gelap) / marmer putih-abu lembut (terang)
    fl = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(fl).ellipse([S * 0.08, floor_y - 70, S * 0.92, floor_y + 90],
                               fill=(150, 165, 190, 60) if light else (120, 170, 255, 70))
    c.alpha_composite(fl.filter(ImageFilter.GaussianBlur(30)))
    ring = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([S * 0.14, floor_y - 52, S * 0.86, floor_y + 62], outline=GOLD + (190,), width=3)
    c.alpha_composite(ring.filter(ImageFilter.GaussianBlur(1)))

    # Box di belakang
    box = make_box(int(S * 0.56), int(S * 0.56))
    bx, by = int(S * 0.20), floor_y - box.height + 4
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([bx - 30, floor_y - 30, bx + box.width + 40, floor_y + 40], fill=(0, 0, 0, 170))
    c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(25)))
    c.alpha_composite(box, (bx, by))
    c.alpha_composite(reflect(box, 0.22, 0.25), (bx, floor_y + 4))

    # Produk di depan (urutan kedalaman)
    H = int(S * 0.40)
    prods = load_products(H)
    layout = [  # (key, x center ratio, scale, y offset)
        ('micellar', 0.17, 0.95, 0),
        ('sunscreen', 0.83, 0.95, 0),
        ('facewash', 0.38, 1.0, 22),
        ('serum', 0.62, 0.86, 34),
    ]
    for k, xr, sc, yo in layout:
        p = prods[k]
        p = p.resize((int(p.width * sc), int(p.height * sc)), Image.LANCZOS)
        x = int(S * xr - p.width / 2)
        y = floor_y + yo - p.height
        s = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(s).ellipse([x - 10, floor_y + yo - 22, x + p.width + 10, floor_y + yo + 22], fill=(0, 0, 0, 200))
        c.alpha_composite(s.filter(ImageFilter.GaussianBlur(14)))
        c.alpha_composite(p, (x, y))
        c.alpha_composite(reflect(p, 0.30, 0.28), (x, floor_y + yo))

    if light:
        c = c.crop((0, int(S * 0.10), S, S))
        c.save(os.path.join(OUT, 'hero-bundle-light.webp'), 'WEBP', quality=86, method=6)
        print('hero-bundle-light.webp', c.size)
        return

    # Partikel kilau
    sp = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(sp)
    for _ in range(70):
        x, y = random.uniform(0.05, 0.95) * S, random.uniform(0.08, 0.75) * S
        r = random.uniform(1, 3.2)
        col = random.choice([(255, 236, 190), (180, 235, 255), (255, 255, 255)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=col + (int(random.uniform(90, 230)),))
    c.alpha_composite(sp.filter(ImageFilter.GaussianBlur(0.8)))
    for (x, y, L) in [(0.16, 0.30, 46), (0.86, 0.22, 60), (0.74, 0.62, 34), (0.30, 0.66, 28)]:
        star = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(star)
        cx, cy = x * S, y * S
        d.line([(cx - L, cy), (cx + L, cy)], fill=(255, 245, 220, 220), width=2)
        d.line([(cx, cy - L), (cx, cy + L)], fill=(255, 245, 220, 220), width=2)
        d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255, 255))
        c.alpha_composite(star.filter(ImageFilter.GaussianBlur(1.2)))
    c = c.crop((0, int(S * 0.10), S, S))
    c.save(os.path.join(OUT, 'hero-bundle.webp'), 'WEBP', quality=86, method=6)
    print('hero-bundle.webp', c.size)


def singles():
    prods = load_products(900)
    for k, p in prods.items():
        p.save(os.path.join(OUT, f'prod-{k}.webp'), 'WEBP', quality=88, method=6)
        print(f'prod-{k}.webp', p.size)


def model():
    m = Image.open(os.path.join(SRC, 'hero-model.jpg')).convert('RGB')
    m = ImageEnhance.Contrast(m).enhance(1.08)
    m = ImageEnhance.Color(m).enhance(1.06)
    m = m.resize((720, int(m.height * 720 / m.width)), Image.LANCZOS)
    m.save(os.path.join(OUT, 'model.webp'), 'WEBP', quality=82, method=6)
    print('model.webp', m.size)


def logo_gold():
    lg = gold_logo(360)
    lg.save(os.path.join(OUT, 'logo-gold.webp'), 'WEBP', quality=90, method=6)
    w = Image.open(os.path.join(SRC, 'logo-white.png')).convert('RGBA')
    w = w.crop(w.getbbox())
    w = w.resize((300, int(w.height * 300 / w.width)), Image.LANCZOS)
    w.save(os.path.join(OUT, 'logo-white.webp'), 'WEBP', quality=90, method=6)
    dk = Image.open(os.path.join(ROOT, 'logo.png')).convert('RGBA')
    a = np.asarray(dk).astype(np.float32)
    whiteness = a[..., :3].min(2)  # latar putih bawaan file → transparan
    alpha = np.clip((255 - whiteness) / 40.0, 0, 1) * (a[..., 3] / 255.0)
    a[..., 3] = alpha * 255
    dk = Image.fromarray(a.astype(np.uint8), 'RGBA')
    dk = dk.crop(dk.getbbox())
    dk = dk.resize((300, int(dk.height * 300 / dk.width)), Image.LANCZOS)
    dk.save(os.path.join(OUT, 'logo-dark.webp'), 'WEBP', quality=90, method=6)
    print('logos ok')


if __name__ == '__main__':
    singles()
    hero_bundle()
    hero_bundle(light=True)
    model()
    logo_gold()
