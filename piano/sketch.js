let notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
let keyboardMap = ['A', 'S', 'D', 'F', 'G', 'H', 'J']; // Map for natural notes
let octave = 3;
let keys = [];
let sounds = {};
let btnDown, btnUp;

function preload() {
  // Load piano sounds dynamically
  loadSounds();
}

function setup() {
  createCanvas(800, 300);

  // Create initial keys
  createKeys();
}

function draw() {
  background(220);

  // Display piano keys
  for (let key of keys) {
    key.display();
  }

  // Show instructions
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(
    'Press the corresponding keyboard keys or click with the mouse to play notes:',
    10,
    20
  );
  let keyText = `${keyboardMap[0]}: ${notes[0]}${octave} `;
  for (let i = 1; i < notes.length; i++) {
    keyText += `| ${keyboardMap[i]}: ${notes[i]}${octave} `;
  }
  text(keyText, 10, 40);
  text(
    'Use UP and DOWN arrow keys to change octaves (3, 4, 5).',
    10,
    height - 20
  );
}

// Change octave and reload sounds
function changeOctave(direction) {
  let newOctave = octave + direction;
  if (newOctave >= 3 && newOctave <= 5) {
    octave = newOctave;
    loadSounds();
    createKeys();
    updateButtons();
  }
}

// Load sounds for the current octave
function loadSounds() {
  for (let note of notes) {
    sounds[`${note}${octave}`] = loadSound(`notes/${note}${octave}.mp3`);
  }
}

// Create piano keys
function createKeys() {
  keys = [];
  let keyWidth = width / notes.length;

  for (let i = 0; i < notes.length; i++) {
    let x = i * keyWidth;
    keys.push(new PianoKey(x, 50, keyWidth, 200, notes[i] + octave));
  }
}

// Handle mouse interaction
function mousePressed() {
  for (let key of keys) {
    if (key.isClicked(mouseX, mouseY)) {
      key.playNote();
    }
  }
}

// Handle keyboard input
function keyPressed() {
  if (keyCode === UP_ARROW) {
    changeOctave(1);
  } else if (keyCode === DOWN_ARROW) {
    changeOctave(-1);
  } else {
    let index = keyboardMap.indexOf(key.toUpperCase());
    if (index !== -1) {
      let note = notes[index] + octave;
      if (sounds[note]) {
        sounds[note].play();
        highlightKey(note);
      }
    }
  }
}

// Highlight key when played
function highlightKey(note) {
  for (let key of keys) {
    if (key.note === note) {
      key.active = true;
      setTimeout(() => (key.active = false), 100);
      break;
    }
  }
}

// PianoKey class
class PianoKey {
  constructor(x, y, w, h, note) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.note = note;
    this.active = false;
  }

  display() {
    stroke(0);
    fill(this.active ? 'yellow' : 'white');
    rect(this.x, this.y, this.w, this.h);

    // Display note labels
    fill(0);
    textSize(12);
    textAlign(CENTER);
    text(this.note, this.x + this.w / 2, this.y + this.h - 10);
  }

  isClicked(mx, my) {
    return (
      mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h
    );
  }

  playNote() {
    this.active = true;
    if (sounds[this.note]) {
      sounds[this.note].play();
    }
    setTimeout(() => (this.active = false), 100);
  }
}
