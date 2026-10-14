#!/usr/bin/env python3
"""Draw the 1200x630 social card. No network."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def font(size):
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def body(size):
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    image = Image.new("RGB", (1200, 630), "#07141c")
    draw = ImageDraw.Draw(image)
    for y in range(630):
        shade = int(7 + (y / 630) * 18)
        draw.line([(0, y), (1200, y)], fill=(shade, 20 + shade, 28 + shade))
    draw.rounded_rectangle((48, 48, 1152, 582), radius=36, outline="#e5843b", width=4)
    draw.rounded_rectangle((72, 78, 168, 174), radius=24, fill="#e5843b")
    draw.text((92, 96), "AC", font=font(48), fill="#1a0d06")
    draw.text((196, 88), "FREE · OPEN LAB", font=body(28), fill="#f0c56a")
    draw.text((80, 210), "The contact center,", font=font(68), fill="#f3efe4")
    draw.text((80, 290), "taught as a system.", font=font(68), fill="#3dcfb4")
    draw.text((80, 400), "Foundations, flows, the CCP, a CUCM bridge,", font=body(28), fill="#c9d2cf")
    draw.text((80, 442), "and the ecosystem: WFM, recording, E911, CRM.", font=body(28), fill="#c9d2cf")
    draw.text((80, 520), "One offline HTML file  ·  No CDN  ·  14 Oct 2026", font=body(24), fill="#e5843b")
    for path in (ROOT / "og-card.png", ROOT / "campus" / "og-card.png"):
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path, "PNG")


if __name__ == "__main__":
    main()
