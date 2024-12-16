let adjectives = [
  'Happy',
  'Spooky',
  'Colorful',
  'Peaceful',
  'Wild',
  'Enchanted',
  'Mysterious',
  'Brave',
  'Majestic',
  'Quirky',
  'Vivid',
  'Ancient',
  'Gentle',
  'Luminous',
  'Bold',
];
let nouns = [
  'Tree',
  'River',
  'Mountain',
  'Cat',
  'Castle',
  'Dragon',
  'Forest',
  'Star',
  'Bird',
  'Ocean',
  'Robot',
  'Galaxy',
  'Flower',
  'Village',
  'Bridge',
];
let verbs = [
  'Dancing',
  'Sleeping',
  'Running',
  'Flying',
  'Jumping',
  'Singing',
  'Exploring',
  'Dreaming',
  'Hiding',
  'Roaring',
  'Painting',
  'Building',
  'Swimming',
  'Gliding',
  'Chasing',
];
let currentPrompt = '';
let canvas;
let isErasing = false;
let customPalette = [];

function setup() {
  const container = select('#canvasContainer');
  canvas = createCanvas(800, 400);
  canvas.parent(container);
  background(255);

  generatePrompt();

  const newPromptButton = select('#newPrompt');
  newPromptButton.mousePressed(generatePrompt);

  const brushSizeInput = select('#brushSize');
  const brushColorInput = select('#brushColor');

  const eraseButton = select('#erase');
  eraseButton.mousePressed(() => {
    isErasing = !isErasing;
    eraseButton.html(`Eraser Mode ${isErasing ? 'ON' : 'OFF'}`);
  });

  select('#resetCanvas').mousePressed(() => background(255));

  select('#exportDrawing').mousePressed(() => {
    const fileName = `${currentPrompt.replace(/\s+/g, '-').toLowerCase()}.png`;
    saveCanvas(canvas, fileName, 'png');
  });

  brushSizeInput.input(() => {
    strokeWeight(brushSizeInput.value());
  });

  brushColorInput.input(() => {
    if (!isErasing) {
      stroke(brushColorInput.value());
    }
  });

  createColorPalette();
  setupCustomPalette();
}

function draw() {
  if (mouseIsPressed) {
    if (isErasing) {
      stroke(255);
    } else {
      const brushColorInput = select('#brushColor');
      stroke(brushColorInput.value());
    }
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function generatePrompt() {
  const randomAdjective = random(adjectives);
  const randomNoun = random(nouns);
  const randomVerb = random(verbs);
  currentPrompt = `${randomVerb} ${randomAdjective} ${randomNoun}`;
  const promptDiv = select('#prompt');
  promptDiv.html(currentPrompt);
}

function createColorPalette() {
  const colors = [
    '#000000',
    '#FFFFFF',
    '#808080',
    '#FFA500',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ];
  const paletteContainer = createDiv();
  paletteContainer.id('colorPalette');

  colors.forEach((color) => {
    const colorCircle = createDiv('');
    colorCircle.style('width', '30px');
    colorCircle.style('height', '30px');
    colorCircle.style('border-radius', '50%');
    colorCircle.style('display', 'inline-block');
    colorCircle.style('margin', '5px');
    colorCircle.style('background-color', color);
    colorCircle.style('cursor', 'pointer');
    colorCircle.mousePressed(() => {
      select('#brushColor').value(color);
      stroke(color);
    });
    paletteContainer.child(colorCircle);
  });
}

function setupCustomPalette() {
  const addColorButton = select('#addColor');
  const removeColorButton = select('#removeColor');
  const customPaletteContainer = select('#customPalette');
  customPaletteContainer.html('');

  addColorButton.mousePressed(() => {
    if (customPalette.length < 8) {
      const newColor = select('#brushColor').value();
      if (!customPalette.includes(newColor)) {
        customPalette.push(newColor);
        updateCustomPalette(customPaletteContainer);
      }
    } else {
      alert('Custom palette can only have a maximum of 8 colors.');
    }
  });

  removeColorButton.mousePressed(() => {
    const selectedColor = select('#brushColor').value();
    customPalette = customPalette.filter((color) => color !== selectedColor);
    updateCustomPalette(customPaletteContainer);
  });
}

function updateCustomPalette(container) {
  container.html('');
  customPalette.forEach((color) => {
    const colorCircle = createDiv('');
    colorCircle.style('width', '30px');
    colorCircle.style('height', '30px');
    colorCircle.style('border-radius', '50%');
    colorCircle.style('display', 'inline-block');
    colorCircle.style('margin', '5px');
    colorCircle.style('background-color', color);
    colorCircle.style('cursor', 'pointer');
    colorCircle.mousePressed(() => {
      select('#brushColor').value(color);
      stroke(color);
    });
    container.child(colorCircle);
  });
}
