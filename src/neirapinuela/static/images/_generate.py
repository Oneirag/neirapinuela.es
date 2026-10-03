#!/usr/bin/env python3
"""Generate favicon assets for neirapinuela.es.

The brand mark is a rounded green tile with a centered, bold "NP" monogram.
There is no white house body — only the green tile and the white letters —
so the canvas corners stay fully transparent and the monogram is readable
even at 16x16.

Outputs:
    favicon-16x16.png
    favicon-32x32.png
    apple-touch-icon.png         (180x180)
    android-chrome-192x192.png
    android-chrome-512x512.png
    favicon.ico                  (multi-resolution: 16, 32, 48)

Re-run this script to regenerate after design changes.
"""

from __future__ import annotations

import os
import struct
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent
PRIMARY = (25, 135, 84, 255)  # #198754
PRIMARY_DARK = (46, 204, 113, 255)  # #2ecc71 (dark-mode reference; PNG is light)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def _font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def _draw_text_centered(
    d: ImageDraw.ImageDraw,
    text: str,
    cx: int,
    cy: int,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
) -> None:
    """Draw text centered on (cx, cy) accounting for font bbox offsets."""
    l, t, r, b = d.textbbox((0, 0), text, font=font, anchor="lt")
    tw, th = r - l, b - t
    d.text((cx - tw / 2 - l, cy - th / 2 - t), text, font=font, fill=fill)


def _hard_round_mask(size: int, radius: int) -> Image.Image:
    """Build a rounded-rectangle alpha mask.

    Thresholded so corners are *fully* transparent (alpha=0) and the interior
    is *fully* opaque (alpha=255). The shape is rendered at high resolution
    and downsampled with LANCZOS, so the final edge ends up smoothly
    anti-aliased without the speckle that a 1-bit threshold at low resolution
    would produce.
    """
    mask = Image.new("RGBA", (size, size), TRANSPARENT)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=WHITE)
    alpha = mask.split()[3].point(lambda v: 255 if v > 0 else 0)
    mask.putalpha(alpha)
    return mask


def draw_icon(size: int) -> Image.Image:
    # Render at the target size, then upsample the mask for the outer
    # rounded clip. The mask's anti-aliased edge gives a clean perimeter
    # without semi-transparent "halo" pixels at the tile edge.
    radius = int(size * 14 / 64)

    # 1. Build the content layer (green tile + roof + NP).
    content = Image.new("RGBA", (size, size), TRANSPARENT)
    cd = ImageDraw.Draw(content)
    cd.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=PRIMARY)

    def s(v: int | float) -> int:
        return int(round(v * size / 64))

    show_roof = size > 16
    if show_roof:
        cd.polygon(
            [(s(32), s(6)), (s(10), s(22)), (s(54), s(22))],
            fill=WHITE,
        )
        text_cy = s(38)
    else:
        text_cy = size // 2

    font_size = int(size * 22 / 64) if show_roof else int(size * 30 / 64)
    font = _font(max(8, font_size))
    _draw_text_centered(cd, "NP", size // 2, text_cy, font, WHITE)

    # 2. Build a 4x supersampled mask with hard corners (alpha 0 / 255),
    #    downsample to the target size for a clean anti-aliased edge.
    mask_scale = 4
    big_mask = _hard_round_mask(size * mask_scale, radius * mask_scale)
    mask = big_mask.resize((size, size), Image.LANCZOS)

    # 3. Apply the mask: corners of the result become fully transparent.
    out = Image.new("RGBA", (size, size), TRANSPARENT)
    out.paste(content, (0, 0), mask)
    return out


def main() -> None:
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512,
    }
    for name, size in sizes.items():
        out = OUT_DIR / name
        draw_icon(size).save(out, format="PNG", optimize=True)
        print(
            f"wrote {out.relative_to(OUT_DIR.parent.parent.parent.parent)} ({size}x{size})"
        )

    ico_sizes = [16, 32, 48]
    ico_path = OUT_DIR / "favicon.ico"
    _write_multi_res_ico(ico_path, [draw_icon(n) for n in ico_sizes])
    print(f"wrote {ico_path.name} (multi-res: 16, 32, 48)")


def _write_multi_res_ico(path: Path, images: list[Image.Image]) -> None:
    """Write a multi-resolution .ico file with embedded PNG frames.

    Pillow's built-in ICO writer drops the 32/48 frames in favour of the
    smallest; we hand-pack ICONDIR + ICONDIRENTRY entries for full control.
    """
    png_blobs: list[bytes] = []
    for im in images:
        buf = BytesIO()
        im.save(buf, format="PNG", optimize=True)
        png_blobs.append(buf.getvalue())

    n = len(images)
    header = struct.pack("<HHH", 0, 1, n)

    offset = 6 + 16 * n
    entries = b""
    for im, blob in zip(images, png_blobs):
        w, h = im.size
        entry = struct.pack(
            "<BBBBHHII",
            w & 0xFF,
            h & 0xFF,
            0,
            0,
            1,
            32,
            len(blob),
            offset,
        )
        entries += entry
        offset += len(blob)

    with open(path, "wb") as f:
        f.write(header + entries + b"".join(png_blobs))


if __name__ == "__main__":
    main()
