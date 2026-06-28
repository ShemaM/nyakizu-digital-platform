from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

out = Path('docs/screenshots')
out.mkdir(parents=True, exist_ok=True)

placeholders = [
    ('buyer-home-PLACEHOLDER-20260623-120000.png', 'Buyer Home - PLACEHOLDER'),
    ('seller-dashboard-PLACEHOLDER-20260623-120000.png', 'Seller Dashboard - PLACEHOLDER'),
    ('login-PLACEHOLDER-20260623-120000.png', 'Login - PLACEHOLDER'),
    ('order-PLACEHOLDER-20260623-120000.png', 'Order Page - PLACEHOLDER'),
]

for name, text in placeholders:
    p = out / name
    if p.exists():
        print(f'{p} exists, skipping')
        continue
    img = Image.new('RGB', (1280, 720), color=(240,240,240))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('arial.ttf', 40)
    except Exception:
        font = ImageFont.load_default()
    try:
        bbox = d.textbbox((0,0), text, font=font)
        text_w = bbox[2]-bbox[0]
        text_h = bbox[3]-bbox[1]
    except Exception:
        text_w, text_h = font.getsize(text)
    d.text(((1280-text_w)/2, (720-text_h)/2), text, fill=(40,40,40), font=font)
    # draw a small footer instruction
    footer = 'Replace this image with a real screenshot including your system taskbar time.'
    try:
        fb = d.textbbox((0,0), footer, font=font)
        fw = fb[2]-fb[0]
        fh = fb[3]-fb[1]
    except Exception:
        fw, fh = font.getsize(footer)
    d.text(((1280-fw)/2, 720-60), footer, fill=(80,80,80), font=font)
    img.save(p)
    print(f'Wrote placeholder: {p}')
print('Done')

