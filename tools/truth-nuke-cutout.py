import subprocess, sys
from collections import deque

SRC = "/home/kaimikan/Projects/p5-playground/truth-nuke/truth-nuke.jpg"
OUT = "/home/kaimikan/Projects/p5-playground/truth-nuke/character.png"
PREVIEW = "/tmp/cutout_preview.jpg"
W, H = 856, 631

# decode jpg -> raw RGB
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    capture_output=True, check=True).stdout
px = raw  # bytes, len W*H*3

def warm(i):
    r = px[i]; g = px[i+1]; b = px[i+2]
    if r > 175 and g > 175 and b > 175:
        return False                      # white-ish -> keep
    return (r - b > 48) and (r > 85) and (g <= r + 12)

# pass 1: warm map
warmmap = bytearray(W * H)
for p in range(W * H):
    warmmap[p] = 1 if warm(p * 3) else 0

# pass 2: flood fill warm background inward from the borders
bg = bytearray(W * H)
dq = deque()
def push(x, y):
    p = y * W + x
    if warmmap[p] and not bg[p]:
        bg[p] = 1
        dq.append(p)
for x in range(W):
    push(x, 0); push(x, H - 1)
for y in range(H):
    push(0, y); push(W - 1, y)
while dq:
    p = dq.popleft()
    x = p % W; y = p // W
    if x > 0:
        q = p - 1
        if warmmap[q] and not bg[q]: bg[q] = 1; dq.append(q)
    if x < W - 1:
        q = p + 1
        if warmmap[q] and not bg[q]: bg[q] = 1; dq.append(q)
    if y > 0:
        q = p - W
        if warmmap[q] and not bg[q]: bg[q] = 1; dq.append(q)
    if y < H - 1:
        q = p + W
        if warmmap[q] and not bg[q]: bg[q] = 1; dq.append(q)

removed = sum(bg)
print(f"removed {removed} / {W*H} px ({100*removed//(W*H)}%) as warm background")

# force-clear obvious background corners that the warm key missed (stray lava
# lines / a small blast in the top-right), so they don't bridge into the
# character via the cigar smoke
for y in range(H):
    for x in range(W):
        if x > 600 and y < 240:
            bg[y * W + x] = 1

# Keep only the largest connected component of what remains — that's the
# character. The leftover dark cloud/lava bits are separate islands.
label = bytearray(W * H)  # 0 = unvisited foreground, 1 = will-keep, 2 = dropped
best_size = 0
best_pixels = None
visited = bytearray(W * H)
for start in range(W * H):
    if bg[start] or visited[start]:
        continue
    # BFS this component
    comp = []
    visited[start] = 1
    stack = [start]
    while stack:
        p = stack.pop()
        comp.append(p)
        x = p % W; y = p // W
        for q in (p-1 if x > 0 else -1, p+1 if x < W-1 else -1,
                  p-W if y > 0 else -1, p+W if y < H-1 else -1,
                  p-W-1 if x>0 and y>0 else -1, p-W+1 if x<W-1 and y>0 else -1,
                  p+W-1 if x>0 and y<H-1 else -1, p+W+1 if x<W-1 and y<H-1 else -1):
            if q >= 0 and not bg[q] and not visited[q]:
                visited[q] = 1
                stack.append(q)
    if len(comp) > best_size:
        best_size = len(comp)
        best_pixels = comp

keep = bytearray(W * H)
for p in best_pixels:
    keep[p] = 1
# anything not in the largest component is background too
for p in range(W * H):
    if not keep[p]:
        bg[p] = 1
print(f"largest component (character) = {best_size} px; total kept {sum(keep)}")

# build RGBA
rgba = bytearray(W * H * 4)
prev = bytearray(W * H * 3)  # preview over grey
GREY = 90
for p in range(W * H):
    s = p * 3; d = p * 4
    if bg[p]:
        rgba[d+3] = 0
        prev[s] = GREY; prev[s+1] = GREY; prev[s+2] = GREY
    else:
        rgba[d] = px[s]; rgba[d+1] = px[s+1]; rgba[d+2] = px[s+2]; rgba[d+3] = 255
        prev[s] = px[s]; prev[s+1] = px[s+1]; prev[s+2] = px[s+2]

subprocess.run(["ffmpeg", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba",
                "-s", f"{W}x{H}", "-i", "-", "-y", OUT], input=bytes(rgba), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                "-s", f"{W}x{H}", "-i", "-", "-vf", "scale=400:-1", "-y", PREVIEW],
               input=bytes(prev), check=True)
print("wrote", OUT, "and", PREVIEW)
