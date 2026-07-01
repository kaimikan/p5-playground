// Shape Dither — turns an image or video into a grid of SVG glyphs picked by
// brightness. Each cell samples the source, quantizes its luminance into one
// of 7 levels (shadow → highlight), and stamps that level's glyph in that
// level's color. Glyphs are recolored by rasterizing the SVG and compositing
// with source-in, so any single-silhouette SVG works regardless of its
// internal fills. Still images render once (noLoop); video runs the draw
// loop and resamples the current frame each tick.

const LEVELS = 7;
const GLYPH_RASTER = 128; // px glyphs are rasterized at before stamping
const MAX_CANVAS = 640;

// Built-in glyph set: ink coverage grows from level 1 (shadow) to 7 (highlight).
const DEFAULT_GLYPHS = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="10"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="18"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="27"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64 14 114 64 64 114 14 64Z"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="42"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect x="20" y="20" width="88" height="88" rx="22"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect x="8" y="8" width="112" height="112"/></svg>',
];
const DEFAULT_COLORS = [
  '#4a4a4a', '#636363', '#7d7d7d', '#979797', '#b1b1b1', '#d8d8d8', '#ffffff',
];
const SLOT_NAMES = ['shadow', '', '', 'midtone', '', '', 'highlight'];

let src = null; // current still source (p5.Image upload or p5.Graphics demo)
let videoEl = null; // HTMLVideoElement when a video is loaded
let srcKind = 'image'; // 'image' | 'video'
let mediaURL = null; // object URL of the current upload, kept alive for video
let glyphSVGs = DEFAULT_GLYPHS.slice();
let glyphColors = DEFAULT_COLORS.slice();
let glyphs = new Array(LEVELS).fill(null); // recolored canvases, ready to stamp
let previews = new Array(LEVELS).fill(null);

let cols = 0;
let rows = 0;
let samplePixels = null; // cols×rows RGBA from downscaling the cropped source
let sampleCnv = null; // reused between frames so video doesn't churn canvases
let sampleCtx = null;

let ui = {};

function setup() {
  const c = createCanvas(MAX_CANVAS, MAX_CANVAS);
  c.parent('canvas-holder');
  noLoop();
  bindUI();
  src = makeDemoImage();
  for (let i = 0; i < LEVELS; i++) buildGlyph(i);
  fitCanvas();
}

function draw() {
  if (srcKind === 'video' && videoEl && !videoEl.paused) sampleFrame();
  background(ui.bg.value);
  if (!samplePixels) return;

  const ctx = drawingContext;
  const cell = width / cols;
  const minS = ui.minScale.value / 100;
  const maxS = ui.maxScale.value / 100;
  const invert = ui.invert.checked;
  const rotMode = ui.rotation.value;
  const fixedRot = rotMode === 'random' ? 0 : radians(int(rotMode));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = 4 * (y * cols + x);
      let t =
        (0.2126 * samplePixels[p] +
          0.7152 * samplePixels[p + 1] +
          0.0722 * samplePixels[p + 2]) /
        255;
      if (invert) t = 1 - t;

      const level = min(LEVELS - 1, floor(t * LEVELS));
      const glyph = glyphs[level];
      if (!glyph) continue;

      // Continuous brightness (not the quantized level) drives the size,
      // so midtones grade smoothly between min and max scale.
      const s = cell * lerp(minS, maxS, t);
      if (s < 0.5) continue;

      const cx = (x + 0.5) * cell;
      const cy = (y + 0.5) * cell;
      const rot =
        rotMode === 'random' ? (cellHash(x, y) & 3) * HALF_PI : fixedRot;

      if (rot === 0) {
        ctx.drawImage(glyph, cx - s / 2, cy - s / 2, s, s);
      } else {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.drawImage(glyph, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    }
  }
}

// Stable per-cell hash so random rotations don't reshuffle on every redraw.
function cellHash(x, y) {
  let n = (x * 73856093) ^ (y * 19349663);
  n = (n ^ (n >> 13)) >>> 0;
  return n;
}

// ---------------------------------------------------------------------------
// Source image + sampling
// ---------------------------------------------------------------------------

function makeDemoImage() {
  const g = createGraphics(800, 600);
  const ctx = g.drawingContext;

  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, '#000');
  grad.addColorStop(1, '#fff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  const glow = ctx.createRadialGradient(590, 160, 10, 590, 160, 230);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 800, 600);

  const hole = ctx.createRadialGradient(220, 430, 10, 220, 430, 200);
  hole.addColorStop(0, 'rgba(0,0,0,0.95)');
  hole.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hole;
  ctx.fillRect(0, 0, 800, 600);

  return g;
}

function srcW() {
  return srcKind === 'video' ? videoEl.videoWidth : src.width;
}

function srcH() {
  return srcKind === 'video' ? videoEl.videoHeight : src.height;
}

function srcDrawable() {
  return srcKind === 'video' ? videoEl : src.canvas || src.elt;
}

// Size the p5 canvas to the chosen aspect, then resample the source.
function fitCanvas() {
  let w, h;
  if (ui.aspect.value === 'square') {
    w = h = MAX_CANVAS;
  } else {
    const k = MAX_CANVAS / max(srcW(), srcH());
    w = round(srcW() * k);
    h = round(srcH() * k);
  }
  resizeCanvas(w, h, true);
  rebuildSample();
  redraw();
}

// Size the reused sample canvas to the grid, then grab a frame.
function rebuildSample() {
  cols = int(ui.grid.value);
  const cell = width / cols;
  rows = max(1, round(height / cell));

  if (!sampleCnv) {
    sampleCnv = document.createElement('canvas');
    sampleCtx = sampleCnv.getContext('2d', { willReadFrequently: true });
  }
  sampleCnv.width = cols;
  sampleCnv.height = rows;
  // Resizing a canvas resets its context state, so restore smoothing here.
  sampleCtx.imageSmoothingEnabled = true;
  sampleCtx.imageSmoothingQuality = 'high';
  sampleFrame();
}

// Downscale the (cropped) source to cols×rows; the browser's bilinear
// filtering does the per-cell averaging for us.
function sampleFrame() {
  let sx = 0;
  let sy = 0;
  let sw = srcW();
  let sh = srcH();
  if (!sw || !sh) return;
  if (ui.aspect.value === 'square') {
    const side = min(sw, sh);
    sx = (sw - side) / 2;
    sy = (sh - side) / 2;
    sw = sh = side;
  }
  sampleCtx.drawImage(srcDrawable(), sx, sy, sw, sh, 0, 0, cols, rows);
  samplePixels = sampleCtx.getImageData(0, 0, cols, rows).data;
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

function loadVideoSource(url) {
  stopVideo();
  videoEl = document.createElement('video');
  videoEl.muted = true;
  videoEl.loop = true;
  videoEl.playsInline = true;
  videoEl.src = url;
  videoEl.addEventListener(
    'loadeddata',
    () => {
      srcKind = 'video';
      ui.playPause.hidden = false;
      ui.playPause.textContent = 'Pause';
      fitCanvas();
      videoEl.play();
      loop();
    },
    { once: true }
  );
}

function stopVideo() {
  if (!videoEl) return;
  videoEl.pause();
  videoEl.removeAttribute('src');
  videoEl = null;
  ui.playPause.hidden = true;
  noLoop();
}

// ---------------------------------------------------------------------------
// Glyphs
// ---------------------------------------------------------------------------

// Firefox won't rasterize an SVG via drawImage unless the root tag carries
// explicit width/height, so inject them when missing.
function ensureSVGSize(svg) {
  const m = svg.match(/<svg[^>]*>/i);
  if (!m) return svg;
  let tag = m[0];
  if (!/\swidth\s*=/i.test(tag)) {
    tag = tag.replace(/<svg/i, `<svg width="${GLYPH_RASTER}"`);
  }
  if (!/\sheight\s*=/i.test(tag)) {
    tag = tag.replace(/<svg/i, `<svg height="${GLYPH_RASTER}"`);
  }
  return svg.replace(m[0], tag);
}

function buildGlyph(i) {
  const url =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(ensureSVGSize(glyphSVGs[i]));
  const img = new Image();
  img.onload = () => {
    const cnv = document.createElement('canvas');
    cnv.width = GLYPH_RASTER;
    cnv.height = GLYPH_RASTER;
    const ctx = cnv.getContext('2d');

    const ar = img.width / img.height || 1;
    let w = GLYPH_RASTER;
    let h = GLYPH_RASTER;
    if (ar > 1) h = w / ar;
    else w = h * ar;
    ctx.drawImage(img, (GLYPH_RASTER - w) / 2, (GLYPH_RASTER - h) / 2, w, h);

    // Recolor the whole silhouette in one pass.
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = glyphColors[i];
    ctx.fillRect(0, 0, GLYPH_RASTER, GLYPH_RASTER);

    glyphs[i] = cnv;
    updatePreview(i);
    redraw();
  };
  img.onerror = () => console.warn(`Level ${i + 1}: could not parse that SVG`);
  img.src = url;
}

function updatePreview(i) {
  const cnv = previews[i];
  if (!cnv || !glyphs[i]) return;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = ui.bg.value;
  ctx.fillRect(0, 0, cnv.width, cnv.height);
  ctx.drawImage(glyphs[i], 2, 2, cnv.width - 4, cnv.height - 4);
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

function bindUI() {
  ui = {
    mediaUpload: document.getElementById('media-upload'),
    playPause: document.getElementById('play-pause'),
    aspect: document.getElementById('aspect'),
    grid: document.getElementById('grid'),
    gridVal: document.getElementById('grid-val'),
    bg: document.getElementById('bg'),
    invert: document.getElementById('invert'),
    minScale: document.getElementById('min-scale'),
    minScaleVal: document.getElementById('min-scale-val'),
    maxScale: document.getElementById('max-scale'),
    maxScaleVal: document.getElementById('max-scale-val'),
    rotation: document.getElementById('rotation'),
    svgMulti: document.getElementById('svg-multi'),
    download: document.getElementById('download'),
  };

  ui.mediaUpload.addEventListener('change', () => {
    const file = ui.mediaUpload.files[0];
    if (!file) return;
    if (mediaURL) URL.revokeObjectURL(mediaURL);
    mediaURL = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      loadVideoSource(mediaURL);
    } else {
      loadImage(mediaURL, (img) => {
        stopVideo();
        src = img;
        srcKind = 'image';
        fitCanvas();
      });
    }
  });

  ui.playPause.addEventListener('click', () => {
    if (srcKind !== 'video' || !videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      loop();
      ui.playPause.textContent = 'Pause';
    } else {
      videoEl.pause();
      noLoop();
      ui.playPause.textContent = 'Play';
    }
  });

  ui.aspect.addEventListener('change', fitCanvas);

  ui.grid.addEventListener('input', () => {
    ui.gridVal.textContent = ui.grid.value;
    rebuildSample();
    redraw();
  });

  ui.bg.addEventListener('input', () => {
    for (let i = 0; i < LEVELS; i++) updatePreview(i);
    redraw();
  });
  ui.invert.addEventListener('input', redrawOnly);
  ui.rotation.addEventListener('change', redrawOnly);

  ui.minScale.addEventListener('input', () => {
    ui.minScaleVal.textContent = `${ui.minScale.value}%`;
    redraw();
  });
  ui.maxScale.addEventListener('input', () => {
    ui.maxScaleVal.textContent = `${ui.maxScale.value}%`;
    redraw();
  });

  // Bulk upload: files sorted by name fill levels 1..7 in order.
  ui.svgMulti.addEventListener('change', () => {
    const files = Array.from(ui.svgMulti.files)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, LEVELS);
    files.forEach((file, i) => readSlotSVG(file, i));
  });

  ui.download.addEventListener('click', () => saveCanvas('shape-dither', 'png'));

  buildSlotRows();
}

function redrawOnly() {
  redraw();
}

function readSlotSVG(file, i) {
  const reader = new FileReader();
  reader.onload = () => {
    glyphSVGs[i] = reader.result;
    buildGlyph(i);
  };
  reader.readAsText(file);
}

function buildSlotRows() {
  const holder = document.getElementById('slots');
  for (let i = 0; i < LEVELS; i++) {
    const row = document.createElement('div');
    row.className = 'slot';

    const label = document.createElement('span');
    label.className = 'slot-label';
    label.textContent = SLOT_NAMES[i] ? `${i + 1} · ${SLOT_NAMES[i]}` : `${i + 1}`;
    row.appendChild(label);

    const preview = document.createElement('canvas');
    preview.width = 24;
    preview.height = 24;
    previews[i] = preview;
    row.appendChild(preview);

    const color = document.createElement('input');
    color.type = 'color';
    color.value = glyphColors[i];
    color.addEventListener('input', () => {
      glyphColors[i] = color.value;
      buildGlyph(i);
    });
    row.appendChild(color);

    const upload = document.createElement('label');
    upload.className = 'mini-upload';
    upload.textContent = 'SVG';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.svg,image/svg+xml';
    file.addEventListener('change', () => {
      if (file.files[0]) readSlotSVG(file.files[0], i);
    });
    upload.appendChild(file);
    row.appendChild(upload);

    holder.appendChild(row);
  }
}
