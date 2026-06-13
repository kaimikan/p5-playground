#!/usr/bin/env python3
"""Generate thumbnails/howard.jpg.

Howard can't be captured by the generic tool: the clip is H.264 and headless
Chromium has no H.264 codec, so the video decodes to black. Instead we rebuild
the poster the same way the sketch does — extract one real frame with ffmpeg,
apply the sketch's exact chroma key, and composite the alien over the app's
rainbow background.

Usage: python tools/howard-thumbnail.py
Requires ffmpeg on PATH.
"""
import colorsys, os, subprocess, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO = os.path.join(ROOT, "howard", "my-boy-howard.mp4")
OUT = os.path.join(ROOT, "thumbnails", "howard.jpg")
W, H = 640, 360
FRAME_T = 8           # seconds — the iconic front-facing pose
KEY = 90              # must match keyStrength in howard/sketch.js
TARGET_W = 360

ffmpeg = shutil.which("ffmpeg")
if not ffmpeg:
    sys.exit("ffmpeg not found on PATH")
if not os.path.exists(VIDEO):
    sys.exit(f"missing {VIDEO}")


def rainbow_row(y):
    # matches bgRainbow(): 10px stripes, HSB hue by stripe, sat 60, bright 100
    h = ((y // 10 * 10) % 360) / 360.0
    r, g, b = colorsys.hsv_to_rgb(h, 0.60, 1.0)
    return int(r * 255), int(g * 255), int(b * 255)


# 1. pull one raw RGB frame
raw = subprocess.run(
    [ffmpeg, "-hide_banner", "-loglevel", "error", "-ss", str(FRAME_T),
     "-i", VIDEO, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    capture_output=True, check=True).stdout

# 2. apply the sketch's exact chroma key (2g - r - b > KEY => green => background)
out = bytearray(b"P6\n%d %d\n255\n" % (W, H))
for y in range(H):
    br, bg, bb = rainbow_row(y)
    base = y * W * 3
    for x in range(W):
        i = base + x * 3
        r, g, b = raw[i], raw[i + 1], raw[i + 2]
        if 2 * g - r - b > KEY:
            out += bytes((br, bg, bb))
        else:
            out += bytes((r, g, b))

# 3. scale to poster width and write JPEG via ffmpeg
subprocess.run(
    [ffmpeg, "-hide_banner", "-loglevel", "error", "-f", "image2pipe",
     "-i", "-", "-vf", f"scale={TARGET_W}:-1", "-q:v", "3", "-y", OUT],
    input=bytes(out), check=True)
print(f"wrote {OUT} ({os.path.getsize(OUT)} bytes)")
