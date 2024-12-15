let colors = [];
let paletteSize = 5; // Number of colors in the palette
let colorBoxes = []; // Store each box's position and size
let hexCodesP;
let sizeSlider;

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

  createP('Press Spacebar to generate a new palette').style(
    'color',
    'lightgrey'
  );

  // Create a slider to control the palette size
  createP('Palette Size:').style('color', 'lightgrey').style('margin', '5px 0');
  sizeSlider = createSlider(2, 8, paletteSize, 1);
  sizeSlider.input(() => {
    paletteSize = sizeSlider.value();
    generatePalette();
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
  }
}

function generatePalette() {
  colors = [];
  colorBoxes = [];

  // Generate new colors and their boxes
  for (let i = 0; i < paletteSize; i++) {
    let r = random(255);
    let g = random(255);
    let b = random(255);
    let col = color(r, g, b);
    let hexCode = `#${hex(floor(r), 2)}${hex(floor(g), 2)}${hex(floor(b), 2)}`;
    colors.push({ color: col, hex: hexCode });

    // Define box size and position
    let boxX = (width / paletteSize) * i;
    let boxW = width / paletteSize;
    colorBoxes.push({ x: boxX, y: 0, w: boxW, h: height });
  }

  // Update the <p> element with hex codes and color them
  hexCodesP.html(
    colors
      .map((c) => `<span style="color: ${c.hex};">${c.hex}</span>`)
      .join(' ')
  );
}

function keyPressed() {
  if (key === ' ') {
    generatePalette();
  }
}
