let colors = [];
let paletteSize = 5; // Number of colors in the palette
let colorBoxes = []; // Store each box's position and size
let hexCodesP;
let sizeSlider;
let lockedColors = []; // Keep track of locked colors

function setup() {
  createCanvas(1000, 400);
  textAlign(CENTER, CENTER);

  // Create a <p> element for hex codes
  hexCodesP = createP('')
    .style('display', 'flex')
    .style('justify-content', 'space-around')
    .style('width', '1000px')
    .style('font-size', '30px')
    .style('font-family', 'monospace')
    .style('margin', '0')
    .style(
      'text-shadow',
      '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'
    )
    .style('background-color', 'gray');

  createP(
    'Press Spacebar to generate a new palette. Click a color to lock it.'
  ).style('color', 'lightgrey');

  // Create a slider to control the palette size
  createP('Palette Size:').style('color', 'lightgrey').style('margin', '5px 0');
  sizeSlider = createSlider(2, 8, paletteSize, 1);
  sizeSlider.input(() => {
    const lockedCount = lockedColors.filter((c) => c !== null).length;
    if (sizeSlider.value() >= lockedCount) {
      paletteSize = sizeSlider.value();
      if (paletteSize < colors.length) {
        // Remove non-locked colors first if palette size decreases
        const unlockedColors = colors.filter((_, i) => !lockedColors[i]);
        const locked = colors.filter((_, i) => lockedColors[i]);
        colors = [
          ...locked,
          ...unlockedColors.slice(0, paletteSize - locked.length),
        ];
        lockedColors = [
          ...locked,
          ...Array(paletteSize - locked.length).fill(null),
        ];
      }
      generatePalette(false); // Prevent regenerating locked colors
      updateHexCodes(); // Adjust hex codes display
    } else {
      sizeSlider.value(paletteSize); // Prevent slider from going below locked colors count
    }
  });

  generatePalette();
}

function draw() {
  background(255);

  // Draw each color box
  for (let i = 0; i < paletteSize; i++) {
    let { x, y, w, h } = colorBoxes[i];

    // Draw color box
    fill(colors[i].color);
    noStroke();
    rect(x, y, w, h);

    // Indicate locked colors
    if (lockedColors[i]) {
      stroke(0);
      strokeWeight(3);
      noFill();
      rect(x + 5, y + 5, w - 10, h - 10);
    }
  }
}

function generatePalette(regenerateAll = true) {
  const locked = lockedColors.filter((c) => c !== null);
  const unlocked = regenerateAll
    ? []
    : colors.filter((_, i) => !lockedColors[i]);

  colors = [...locked, ...unlocked];
  colorBoxes = [];

  // Fill the rest of the colors array with new colors if needed
  while (colors.length < paletteSize) {
    let r = random(255);
    let g = random(255);
    let b = random(255);
    let col = color(r, g, b);
    let hexCode = `#${hex(floor(r), 2)}${hex(floor(g), 2)}${hex(floor(b), 2)}`;
    colors.push({ color: col, hex: hexCode });
  }

  // Trim to match palette size
  colors = colors.slice(0, paletteSize);

  // Update lockedColors to match new palette size
  lockedColors = colors.map((c, i) => (i < locked.length ? c : null));

  // Define box size and position
  for (let i = 0; i < paletteSize; i++) {
    let boxX = (width / paletteSize) * i;
    let boxW = width / paletteSize;
    colorBoxes[i] = { x: boxX, y: 0, w: boxW, h: height };
  }

  updateHexCodes();
}

function mousePressed() {
  // Check if a color box was clicked
  for (let i = 0; i < paletteSize; i++) {
    let { x, y, w, h } = colorBoxes[i];
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
      // Toggle lock for the clicked color
      if (lockedColors[i]) {
        lockedColors[i] = null;
      } else {
        lockedColors[i] = colors[i];
      }
      generatePalette(false); // Regenerate to reorder locked colors to the left
      break;
    }
  }
}

function updateHexCodes() {
  // Update the <p> element with hex codes and color them
  const locked = lockedColors.filter((c) => c !== null);
  const unlocked = colors.filter((_, i) => !lockedColors[i]);

  // Concatenate locked and unlocked hex codes in display order
  hexCodesP.html(
    [...locked, ...unlocked]
      .map((c) => `<span style="color: ${c.hex};">${c.hex}</span>`)
      .join(' ')
  );
}

function keyPressed() {
  if (key === ' ') {
    generatePalette();
  }
}
