#!/usr/bin/env python3
"""Regenerate the gallery poster thumbnails (thumbnails/<sketch>.jpg).

Each poster is a still frame of the sketch, captured *after letting it run for
a couple of seconds* so progressive sketches (phyllotaxis, flow fields, the
genetic-algorithm demos, ...) actually develop. The gallery shows this poster
at rest and swaps to the live sketch on hover.

Why it works this way:
  - Chrome's one-shot `--screenshot` freezes at the first painted frame, and
    `--virtual-time-budget` does NOT advance p5's requestAnimationFrame loop.
    So we drive a persistent headless Chrome over the DevTools Protocol, sleep
    in real time, then capture — giving each sketch real animation time.
  - WebGL/3D sketches render black without a GPU, so we force software WebGL
    via SwiftShader (works headless, no GPU needed).
  - We clip to each sketch's actual <canvas> rect (canvases vary in size), and
    hide the "Back to Navigation" link so it doesn't appear in the poster.

Usage:
  1. Serve the repo root:   python -m http.server 8077
  2. Run:                   python tools/capture-thumbnails.py [sketch ...]
     (no args = every folder containing an index.html)

Env overrides: CHROME_BIN, BASE_URL (default http://localhost:8077).
Output: JPEG (quality 82), ~360px wide, written to thumbnails/.
"""
import json, os, socket, subprocess, sys, time, base64, struct, urllib.request, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thumbnails")
BASE = os.environ.get("BASE_URL", "http://localhost:8077")
PORT = 9333
RUN_SECONDS = 2.6           # default animate time before the shot
W, H = 1000, 960            # generous window; we clip to the canvas itself
TARGET_W = 360              # poster width in px

# Per-sketch recipes for sketches that are blank/unrepresentative by default.
# Coords are normalised (0..1) within the canvas.
#   seconds : run time before capture (overrides RUN_SECONDS)
#   drag    : press, move through points with the button held, release
#   move    : move the mouse (no button) through points (e.g. mouse-followers)
RECIPES = {
    "flappy-evolution": {"seconds": 7},           # let a few generations pass
    "q-learning": {"seconds": 12, "keys": ["f"]}, # fast-forward to a learned policy
    "image-evolution": {"seconds": 14, "keys": ["f"]},  # fast-forward to a clear image
    "self-driving-car": {"seconds": 16, "keys": ["f"]},  # fast-forward to trained cars
    "flow-field": {"seconds": 10},                # slow to build trails
    "howard": {"seconds": 6},                     # let the video load + play
    # mouseDragged() drops only a 3x3 cluster per event, so pour a dense
    # zig-zag over one spot to build a visible mound of sand.
    "falling-sand": {"seconds": 4.5, "drag":
        [(0.5 + 0.06 * (1 if k % 2 else -1), 0.12 + 0.0015 * k)
         for k in range(90)]},
    "kaleidoscope": {"seconds": 2.5, "drag": [
        (0.4, 0.3), (0.62, 0.42), (0.45, 0.6), (0.6, 0.66), (0.5, 0.45),
        (0.35, 0.55)]},
    "drawing": {"seconds": 2.5, "drag": [
        (0.3, 0.4), (0.5, 0.28), (0.7, 0.5), (0.52, 0.62), (0.34, 0.5),
        (0.5, 0.45)]},
    "soft-body": {"seconds": 2.5, "move": [
        (0.5, 0.5), (0.68, 0.42), (0.38, 0.58), (0.58, 0.48), (0.5, 0.55)]},
}


def find_chrome():
    cand = os.environ.get("CHROME_BIN")
    if cand and os.path.exists(cand):
        return cand
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        p = shutil.which(name)
        if p:
            return p
    # playwright's bundled chromium, if present
    import glob
    hits = glob.glob(os.path.expanduser(
        "~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome"))
    if hits:
        return sorted(hits)[-1]
    sys.exit("No Chrome/Chromium found; set CHROME_BIN.")


CHROME = find_chrome()

# Sketches that can't be captured here. Howard is an H.264 video and headless
# Chromium has no H.264 codec, so it decodes to black — its poster is built by
# tools/howard-thumbnail.py instead.
SKIP = {"howard"}

dirs = sys.argv[1:]
if not dirs:
    dirs = sorted(
        d for d in os.listdir(ROOT)
        if os.path.isfile(os.path.join(ROOT, d, "index.html")) and d not in SKIP
    )
else:
    skipped = [d for d in dirs if d in SKIP]
    for d in skipped:
        print(f"  skip {d} (use tools/howard-thumbnail.py)")
    dirs = [d for d in dirs if d not in SKIP]
os.makedirs(OUT, exist_ok=True)

proc = subprocess.Popen([
    CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars",
    "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader",
    "--mute-audio", "--autoplay-policy=no-user-gesture-required",
    f"--remote-debugging-port={PORT}", "--remote-allow-origins=*",
    f"--window-size={W},{H}", "--user-data-dir=/tmp/chrome-shoot", "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def get_ws():
    for _ in range(50):
        try:
            data = urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json").read()
            for t in json.loads(data):
                if t.get("type") == "page":
                    return t["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.2)
    raise RuntimeError("no chrome devtools")


ws_url = get_ws()
m = re.match(r"ws://([^:/]+):(\d+)(/.*)", ws_url)
host, port, path = m.group(1), int(m.group(2)), m.group(3)

sock = socket.create_connection((host, port))
key = base64.b64encode(b"0123456789abcdef").decode()
sock.sendall((
    f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\n"
    "Upgrade: websocket\r\nConnection: Upgrade\r\n"
    f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
).encode())
buf = b""
while b"\r\n\r\n" not in buf:
    buf += sock.recv(4096)


def send(obj):
    payload = json.dumps(obj).encode()
    header = bytearray([0x81])  # FIN + text
    n = len(payload)
    if n < 126:
        header.append(0x80 | n)
    elif n < 65536:
        header.append(0x80 | 126); header += struct.pack(">H", n)
    else:
        header.append(0x80 | 127); header += struct.pack(">Q", n)
    sock.sendall(bytes(header) + b"\x00\x00\x00\x00" + payload)


def recv_frame():
    def rd(n):
        b = b""
        while len(b) < n:
            chunk = sock.recv(n - len(b))
            if not chunk:
                raise RuntimeError("socket closed")
            b += chunk
        return b
    rd(1)                       # opcode byte (CDP replies are single text frames)
    ln = rd(1)[0] & 0x7F
    if ln == 126:
        ln = struct.unpack(">H", rd(2))[0]
    elif ln == 127:
        ln = struct.unpack(">Q", rd(8))[0]
    return rd(ln)


_id = 0
def cmd(method, params=None, wait=True):
    global _id
    _id += 1
    mid = _id
    send({"id": mid, "method": method, "params": params or {}})
    if not wait:
        return None
    while True:
        msg = json.loads(recv_frame())
        if msg.get("id") == mid:
            return msg.get("result", {})


cmd("Page.enable")
cmd("Runtime.enable")

PROBE = (
    "(()=>{var e=document.getElementById('back-to-main-page');"
    "if(e)e.style.display='none';"
    "var c=document.querySelector('canvas');"
    "if(!c)return '';"
    "var r=c.getBoundingClientRect();"
    "return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height});})()"
)

def mouse(kind, x, y, held=False):
    cmd("Input.dispatchMouseEvent", {
        "type": kind, "x": x, "y": y,
        "button": "left" if held else "none",
        "buttons": 1 if held else 0,
        "clickCount": 1 if kind == "mousePressed" else 0,
    })


def to_px(pt, rect):
    return rect["x"] + pt[0] * rect["w"], rect["y"] + pt[1] * rect["h"]


def keypress(k):
    up = k.upper()
    p = {"key": k, "code": "Key" + up,
         "windowsVirtualKeyCode": ord(up), "nativeVirtualKeyCode": ord(up)}
    cmd("Input.dispatchKeyEvent", dict(p, type="keyDown"))
    cmd("Input.dispatchKeyEvent", dict(p, type="keyUp"))


def run_recipe(rec, rect):
    if "drag" in rec:
        pts = [to_px(p, rect) for p in rec["drag"]]
        mouse("mousePressed", *pts[0], held=True)
        for p in pts[1:]:
            mouse("mouseMoved", *p, held=True)
            time.sleep(0.12)
        mouse("mouseReleased", *pts[-1], held=True)
    if "move" in rec:
        for p in rec["move"]:
            mouse("mouseMoved", *to_px(p, rect))
            time.sleep(0.25)
    if "keys" in rec:
        for k in rec["keys"]:
            keypress(k)


ok, fail = [], []
for d in dirs:
    try:
        rec = RECIPES.get(d, {})
        cmd("Page.navigate", {"url": f"{BASE}/{d}/index.html"})
        # Poll for the canvas rather than guessing a fixed delay — some sketches
        # (e.g. ones that load addons or media in setup) take a moment.
        val = None
        for _ in range(20):  # up to ~6s
            time.sleep(0.3)
            r = cmd("Runtime.evaluate",
                    {"expression": PROBE, "returnByValue": True})
            val = r.get("result", {}).get("value")
            if val:
                break
        if not val:
            raise RuntimeError("no canvas")
        rect = json.loads(val)
        run_recipe(rec, rect)
        time.sleep(rec.get("seconds", RUN_SECONDS))
        scale = min(1.0, TARGET_W / rect["w"])
        res = cmd("Page.captureScreenshot", {
            "format": "jpeg", "quality": 82, "captureBeyondViewport": True,
            "clip": {"x": rect["x"], "y": rect["y"],
                     "width": rect["w"], "height": rect["h"], "scale": scale},
        })
        img = base64.b64decode(res["data"])
        with open(os.path.join(OUT, f"{d}.jpg"), "wb") as f:
            f.write(img)
        ok.append(d)
        print(f"  ok  {d}  ({len(img)//1024}KB, {int(rect['w'])}x{int(rect['h'])})")
    except Exception as e:
        fail.append((d, str(e)))
        print(f"  FAIL {d}: {e}")

print(f"\n{len(ok)} ok, {len(fail)} failed")
for d, e in fail:
    print("   ", d, e)
proc.terminate()
