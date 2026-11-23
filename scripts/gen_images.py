"""Generate monochrome editorial images for 3 fictional AI characters.
Usage: python3 gen_images.py <out_dir>
"""
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
W = 1200
RATIOS = [1.4, 1.0, 1.25, 1.6, 0.8, 1.33]  # height / width, for a lively masonry


def grain(img: Image.Image, amount: float, seed: int) -> Image.Image:
    rng = np.random.default_rng(seed)
    a = np.asarray(img, dtype=np.float32)
    a += rng.normal(0, amount, a.shape)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def vignette(img: Image.Image, strength: float) -> Image.Image:
    w, h = img.size
    y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    v = 1 - strength * np.clip(d - 0.4, 0, 1) ** 1.5
    a = np.asarray(img, dtype=np.float32) * v
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# --- Style A: NOA VALE - silk / draped fabric, soft light -----------------------
def style_soft(w, h, seed):
    r = random.Random(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x, y = xx / w, yy / w
    ang = r.uniform(-0.6, 0.6)
    u = x * math.cos(ang) + y * math.sin(ang)
    v = -x * math.sin(ang) + y * math.cos(ang)
    warp = 0.08 * np.sin(v * r.uniform(2, 4) + r.uniform(0, 6)) + 0.05 * np.sin(v * 7 + u * 2)
    f = np.zeros_like(u)
    for k in range(4):
        freq = r.uniform(3, 9) * (1 + k * 0.4)
        f += np.sin((u + warp * (k + 1)) * freq + r.uniform(0, 6)) / (k + 1)
    f = (f - f.min()) / (f.max() - f.min())
    f = f ** 1.4
    lo, hi = r.randint(70, 110), r.randint(225, 245)
    a = lo + (hi - lo) * f
    light = 1 - 0.25 * np.clip((y / (h / w)) - 0.3, 0, 1)
    out = Image.fromarray(np.clip(a * light, 0, 255).astype(np.uint8))
    out = out.filter(ImageFilter.GaussianBlur(w * 0.004))
    return grain(vignette(out, 0.35), 6, seed)


# --- Style B: MONOLITH - hard geometry, architectural light ---------------------
def style_geo(w, h, seed):
    r = random.Random(seed)
    img = Image.new("L", (w, h), r.randint(18, 40))
    d = ImageDraw.Draw(img)
    # light falling diagonally
    grad = np.linspace(0, 1, w)[None, :] * np.linspace(1, 0.3, h)[:, None]
    a = np.asarray(img, np.float32) + grad * r.randint(30, 70)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    kind = seed % 3
    if kind == 0:  # stacked slabs
        y = h * 0.85
        for _ in range(r.randint(3, 5)):
            bw, bh = r.uniform(0.3, 0.7) * w, r.uniform(0.08, 0.2) * h
            x = r.uniform(0.1, 0.9) * w - bw / 2
            d.rectangle([x, y - bh, x + bw, y], fill=r.randint(150, 245))
            d.rectangle([x + bw * 0.75, y - bh, x + bw, y], fill=r.randint(70, 120))
            y -= bh
    elif kind == 1:  # arch
        cx, top = w / 2, h * 0.2
        aw = w * r.uniform(0.35, 0.5)
        d.rectangle([cx - aw / 2, top + aw / 2, cx + aw / 2, h * 0.9], fill=235)
        d.ellipse([cx - aw / 2, top, cx + aw / 2, top + aw], fill=235)
        d.rectangle([cx - aw / 2, h * 0.9, cx + aw / 2, h], fill=90)
    else:  # sphere + plinth
        s = w * r.uniform(0.25, 0.4)
        cx, cy = w * r.uniform(0.35, 0.65), h * 0.45
        sphere = Image.new("L", (w, h), 0)
        sd = ImageDraw.Draw(sphere)
        sd.ellipse([cx - s, cy - s, cx + s, cy + s], fill=255)
        yy, xx = np.ogrid[:h, :w]
        shade = np.clip(1 - np.sqrt((xx - (cx - s * 0.35)) ** 2 + (yy - (cy - s * 0.35)) ** 2) / (s * 1.8), 0.1, 1)
        base = np.asarray(img, np.float32)
        m = np.asarray(sphere, np.float32) / 255
        base = base * (1 - m) + (shade * 245) * m
        img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
        d = ImageDraw.Draw(img)
        d.rectangle([cx - s * 1.2, cy + s, cx + s * 1.2, h], fill=200)
        d.rectangle([cx + s * 0.6, cy + s, cx + s * 1.2, h], fill=110)
    # hard cast shadow band
    shadow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(shadow).polygon([(0, h * 0.6), (w * 0.4, h), (0, h)], fill=90)
    a = np.asarray(img, np.float32) - np.asarray(shadow, np.float32) * 0.5
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return grain(out, 5, seed)


# --- Style C: IRIS NULL - foggy horizons, sun discs, dark sea -------------------
def style_horizon(w, h, seed):
    r = random.Random(seed)
    hz = r.uniform(0.45, 0.68) * h
    y = np.arange(h)[:, None].astype(np.float32)
    top, mid = r.randint(25, 70), r.randint(150, 215)
    sky = top + (mid - top) * np.clip(y / hz, 0, 1) ** 1.6
    sea = mid * 0.55 - (y - hz) / (h - hz) * r.randint(40, 80)
    a = np.where(y < hz, sky, sea) * np.ones((1, w), np.float32)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # sun / moon disc with glow
    disc = Image.new("L", (w, h), 0)
    s = w * r.uniform(0.06, 0.14)
    cx, cy = w * r.uniform(0.3, 0.7), hz - r.uniform(0.05, 0.25) * h
    ImageDraw.Draw(disc).ellipse([cx - s, cy - s, cx + s, cy + s], fill=255)
    glow = disc.filter(ImageFilter.GaussianBlur(s * 1.2))
    a = np.asarray(img, np.float32)
    a = np.maximum(a, np.asarray(disc, np.float32) * 0.95)
    a += np.asarray(glow, np.float32) * 0.35
    # reflection streak on water
    refl = Image.new("L", (w, h), 0)
    rd = ImageDraw.Draw(refl)
    for i in range(14):
        yy = hz + (i + 1) * (h - hz) / 16
        ww = s * (1.2 - i * 0.06)
        rd.line([(cx - ww, yy), (cx + ww, yy)], fill=200, width=max(2, int(h * 0.004)))
    refl = refl.filter(ImageFilter.GaussianBlur(3))
    a += np.asarray(refl, np.float32) * 0.4 * (y > hz)
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # fog band
    fog = Image.new("L", (w, h), 0)
    ImageDraw.Draw(fog).rectangle([0, hz - h * 0.04, w, hz + h * 0.02], fill=255)
    fog = fog.filter(ImageFilter.GaussianBlur(h * 0.03))
    a = np.asarray(out, np.float32) + np.asarray(fog, np.float32) * 0.18
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return grain(vignette(out, 0.5), 9, seed)


CHARACTERS = {
    "noa-vale": (style_soft, 100),
    "monolith": (style_geo, 200),
    "iris-null": (style_horizon, 300),
}

for slug, (fn, seed0) in CHARACTERS.items():
    d = OUT / slug
    d.mkdir(parents=True, exist_ok=True)
    for i, ratio in enumerate(RATIOS, start=1):
        img = fn(W, int(W * ratio), seed0 + i)
        img.convert("RGB").save(d / f"{i:02d}.jpg", quality=84, optimize=True, progressive=True)
    av = fn(600, 600, seed0 + 99)
    av.convert("RGB").save(d / "avatar.jpg", quality=84, optimize=True, progressive=True)
    print("done", slug)
