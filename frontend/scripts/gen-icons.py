"""
One-off generator for PWA app icons — placeholder brand mark (blue #2563EB
square + white "N") until real artwork exists. Run with:
    python scripts/gen-icons.py
Regenerate any time the placeholder needs to change; output is committed
to public/ so the app doesn't depend on this script at build/runtime.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BRAND_BLUE = (37, 99, 235)  # #2563EB — live --primary/--ring token
WHITE = (255, 255, 255)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"
APPLE_OUT = Path(__file__).resolve().parent.parent / "public" / "apple-touch-icon.png"

FONT_CANDIDATES = [
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/segoeuib.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_glyph(size: int, glyph_scale: float) -> Image.Image:
    """Solid brand-blue square with a centered white 'N', sized so the
    glyph's bounding box occupies `glyph_scale` of the canvas (use a
    smaller scale for maskable icons to stay inside the safe zone)."""
    img = Image.new("RGB", (size, size), BRAND_BLUE)
    draw = ImageDraw.Draw(img)

    target_h = size * glyph_scale
    font_size = int(target_h)
    font = load_font(font_size)

    # Shrink until the glyph's actual rendered bbox fits target_h — TTF
    # cap-height varies per font, so a fixed font_size overshoots.
    while font_size > 4:
        font = load_font(font_size)
        bbox = draw.textbbox((0, 0), "N", font=font)
        h = bbox[3] - bbox[1]
        if h <= target_h:
            break
        font_size -= 2

    bbox = draw.textbbox((0, 0), "N", font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), "N", fill=WHITE, font=font)
    return img


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # "any" purpose — safe to fill most of the canvas
    draw_glyph(192, 0.62).save(OUT_DIR / "icon-192.png")
    draw_glyph(512, 0.62).save(OUT_DIR / "icon-512.png")

    # "maskable" — OS crops to a circle/squircle, so keep content inside
    # the ~80%-diameter safe zone (generous margin here: 0.42 scale).
    draw_glyph(512, 0.42).save(OUT_DIR / "icon-512-maskable.png")

    # iOS ignores maskable/manifest icons entirely; wants its own square,
    # no transparency, at 180x180.
    draw_glyph(180, 0.6).save(APPLE_OUT)

    print("Wrote:", *sorted(p.name for p in OUT_DIR.iterdir()), APPLE_OUT.name)


if __name__ == "__main__":
    main()
