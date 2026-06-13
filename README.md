# p5-playground

A repository for building different small projects using p5.js.

Most of the projects are runnable straight out of the box.

But in order to run projects require images, sounds, and/or video you need to host a local server:

**Option 1 (requires Python 3.x):**

- type the following in the root directory of the repo

```
python -m http.server
```

- open [http://localhost:8000/index.html](http://localhost:8000/index.html)

**Option 2 (requires Node.js):**

- install http-server globally through the terminal/command prompt (might need admin rights)

```
npm install -g http-server
```

- type the following in the root directory of the repo

```
http-server
```

- open [http://127.0.0.1:8080/index.html](http://127.0.0.1:8080/index.html)

## Sketch catalog

The repo root's `index.html` is a browsable gallery of every sketch, grouped
into categories (Learning, Generative & Art, Simulation & Physics, 3D, Games,
Algorithms & Math, Tools & Toys). **Hover any card to run the sketch live in
place**; click it to open the sketch fullscreen in an overlay on top of the
gallery (Esc or Back closes it, your scroll position is kept, and the URL hash
makes each sketch shareable/deep-linkable). Filter chips and a search box are at
the top. Serve it via a local server (see above) so the previews and any
media-backed sketches work.

Each card's still poster lives in `thumbnails/`. To regenerate them (e.g. after
adding or changing a sketch), serve the repo and run the capture tool:

```
python -m http.server 8077        # in one terminal, from the repo root
python tools/capture-thumbnails.py   # in another; omit args for all sketches
python tools/howard-thumbnail.py     # Howard's poster (H.264; built with ffmpeg)
```

- **10PRINT** — the classic C64 one-liner maze of random diagonal slashes
- **2D Raycasting** — rays from a mouse-driven light source hitting random walls
- **2D Snake** — classic snake game with increasing speed and high-score tracking
- **2D Supershapes** — morphing curves generated from the superformula
- **Audio Recording** — record from the microphone, play back and manage clips
- **Audio Recordings** — near-identical copy of Audio Recording
- **Barnsley Fern** — fern fractal grown from an iterated function system
- **Blank Project** — empty starter template for new sketches
- **Blurry Lines** — drifting particles joined by soft blurred lines
- **Brick Pong** — Breakout-style paddle/ball/bricks game with lives and score
- **Clock** — a drawn clock face tracking the real time
- **Collatz Conjecture** — Collatz sequences rendered as organic branching strands
- **Color Palettes** — random palette generator with lockable swatches and hex codes
- **Curse Words** — click to spawn curse words, each voiced by an audio clip
- **Double Pendulum** — chaotic double pendulum tracing its path
- **Drawing** — freehand drawing pad with random adjective–noun–verb prompts
- **Evolving Walkers** — a genetic algorithm whose walkers learn to weave an obstacle course; live fitness graph climbs generation by generation
- **Falling Sand** — falling-sand cellular automaton; pour sand with the mouse
- **Fireworks** — particle fireworks bursting in HSB color over a night sky
- **Flocking Simulation** — boids with alignment, cohesion and separation
- **Flow Field Gradient** — 1000 particles riding a Perlin-noise flow field with HSB trails
- **Flow Field Color Intervals** — flow field with interval-based color changes and sliders
- **Flow Field RGB** — flow field with selectable particle colors and canvas download
- **Flower Equation** — polar flower plotter with editable equation and sliders
- **Fourier Series** — rotating epicycles summing into a square wave
- **Fractal Trees (Recursive)** — recursive fractal tree with controllable branch angle
- **Gabriel's Horn** — the infinite-surface horn in 3D with drag-to-rotate
- **Game of Life** — Conway's Game of Life from a random seed
- **Holy Moly** — a mysterious button that plays a sound and spawns visual quirks
- **Howard** — green-screen (chroma key) video experiment with a backing tune
- **Infinite Stairs** — endlessly scrolling staircase illusion
- **Kaleidoscope** — mirrored-symmetry drawing with adjustable sides and save button
- **Langton's Ant** — the two-rule turmite that eventually builds its highway
- **Loading Screen** — minimal fake loading screen with progress bar
- **Lorenz Attractor** — the Lorenz butterfly traced in 2D with cycling hues
- **Lorenz Attractor 3D** — the Lorenz attractor in 3D with an orbit camera
- **Magic 8 Ball** — shake for one of the twenty classic answers
- **Maurer Rose** — petal patterns from points stepped around a rose curve
- **Maze Generator** — playable recursive-backtracker maze with hints
- **Minesweeper** — classic Minesweeper with left/right-click controls
- **Möbius Strip** — a Möbius strip rendered in 3D
- **Möbius Strip V2** — animated Möbius strip variant
- **Perlin Noise Lines** — stacked lines undulating with Perlin noise
- **Phyllotaxis** — the golden-angle sunflower-seed spiral
- **Piano** — playable on-screen piano with sampled mp3 notes
- **Platformer** — multi-level platformer with enemies, hazards and a finish star
- **Pong** — two-player Pong with scoring
- **Quicksort Visualization** — animated quicksort (Lomuto partition) on bars
- **Raining Rainbow** — pixelated rain over a shifting rainbow background
- **Random Walker** — a single random walker leaving a dotted trail
- **Random Walker 2** — fifty grid-snapped walkers with fading trails
- **Rendering Raycasting** — pseudo-3D first-person view from 2D raycasting
- **Rotating Bricks** — a row of 3D bricks; drag to rotate, scroll to zoom
- **Smart Rockets** — genetic algorithm evolving rockets toward a target
- **Snowflakes** — snow drifting over a night-blue gradient sky
- **Soft Body** — springy soft-body blob that follows the mouse
- **Solar System** — 3D solar system with orbiting planets and a starfield
- **Sprites** — sprite-sheet walk-cycle animation
- **Starfield** — warp-speed starfield simulator
- **TV Static** — old-TV per-pixel noise at a retro 30 fps
- **Unfolding Fractals** — recursively unfolding fractal segments (don't run too long)
- **Wordle** — Wordle clone with on-screen keyboard and color feedback
