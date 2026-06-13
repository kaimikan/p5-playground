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
RUN_SECONDS = 2.6           # let each sketch animate before the shot
W, H = 1000, 960            # generous window; we clip to the canvas itself
TARGET_W = 360              # poster width in px


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

dirs = sys.argv[1:]
if not dirs:
    dirs = sorted(
        d for d in os.listdir(ROOT)
        if os.path.isfile(os.path.join(ROOT, d, "index.html"))
    )
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

ok, fail = [], []
for d in dirs:
    try:
        cmd("Page.navigate", {"url": f"{BASE}/{d}/index.html"})
        time.sleep(RUN_SECONDS)
        r = cmd("Runtime.evaluate", {"expression": PROBE, "returnByValue": True})
        val = r.get("result", {}).get("value")
        if not val:
            raise RuntimeError("no canvas")
        rect = json.loads(val)
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
