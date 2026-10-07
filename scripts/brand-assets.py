"""Builds the favicon, app icons and Organization logo from the master logo.

    python scripts/brand-assets.py

Source: brand/catalunyainfo-logo.png (the stacked logo: the Catalonia mark
above the wordmark). The icons use the mark alone, because the wordmark is
illegible at favicon sizes. Re-run after replacing the source; every output
is overwritten.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "brand", "catalunyainfo-logo.png")
PUBLIC = os.path.join(ROOT, "public")
# The wordmark starts below this row in the source; the mark sits above it.
WORDMARK_TOP = 0.66


def flatten(im):
    """Composite onto white: the source is RGBA but drawn for a white page."""
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im.convert("RGBA"))
    return bg


def ink_bbox(im, bottom):
    """Bounding box of everything that is not near-white, above `bottom`."""
    px = im.load()
    w, _ = im.size
    xs, ys = [], []
    for y in range(bottom):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if min(r, g, b) < 235:
                xs.append(x)
                ys.append(y)
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def square(im, pad):
    """Centre on a white square with `pad` (fraction of side) of margin."""
    side = int(max(im.size) / (1 - 2 * pad))
    out = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    out.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return out


src = flatten(Image.open(SOURCE))
mark = src.crop(ink_bbox(src, int(src.height * WORDMARK_TOP)))
icon = square(mark, 0.08)
full = square(src.crop(ink_bbox(src, src.height)), 0.06)

for name, size, img in [
    ("favicon-16.png", 16, icon),
    ("favicon-32.png", 32, icon),
    ("favicon-48.png", 48, icon),
    ("apple-touch-icon.png", 180, icon),
    ("icon-192.png", 192, icon),
    ("icon-512.png", 512, icon),
    ("logo.png", 512, full),
]:
    img.resize((size, size), Image.LANCZOS).convert("RGB").save(os.path.join(PUBLIC, name), optimize=True)

icon.convert("RGB").save(os.path.join(PUBLIC, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("mark", mark.size)
