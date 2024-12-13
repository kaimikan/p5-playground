let targetWord;
let guessedWords = [];
let currentGuess = '';
let maxAttempts = 6;
let wordLength = 5;
let availableLetters = 'abcdefghijklmnopqrstuvwxyz';
let keyStates = {}; // Stores the state of each key

let COLOR_CORRECT;
let COLOR_PRESENT;
let COLOR_ABSENT;

function setup() {
  createCanvas(400, 750); // Adjusted height for keyboard and instructions
  textFont('Courier');
  targetWord = randomWord();
  console.log(`Target Word: ${targetWord}`); // For debugging
  initializeKeyStates();
  COLOR_CORRECT = color(0, 255, 0); // Green
  COLOR_PRESENT = color(255, 204, 0); // Yellow
  COLOR_ABSENT = color(200); // Gray
}

function draw() {
  background(240);
  drawGrid();
  drawGuess();
  drawKeyboard();
  drawInstructions();
}

function drawGrid() {
  for (let i = 0; i < maxAttempts; i++) {
    for (let j = 0; j < wordLength; j++) {
      let x = 50 + j * 60;
      let y = 50 + i * 60;
      fill(255);
      stroke(0);
      rect(x, y, 50, 50, 5);

      if (i < guessedWords.length) {
        let char = guessedWords[i][j];
        let bg = getFeedback(guessedWords[i])[j];
        fill(bg);
        rect(x, y, 50, 50, 5);
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(24);
        text(char.toUpperCase(), x + 25, y + 25);
      }
    }
  }
}

function drawGuess() {
  if (guessedWords.length < maxAttempts) {
    for (let i = 0; i < wordLength; i++) {
      let x = 50 + i * 60;
      let y = 50 + guessedWords.length * 60;
      fill(255);
      stroke(0);
      rect(x, y, 50, 50, 5);
      if (i < currentGuess.length) {
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(24);
        text(currentGuess[i].toUpperCase(), x + 25, y + 25);
      }
    }
  }
}

function drawKeyboard() {
  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  const keyWidth = 35;
  const keyHeight = 50;
  let yOffset = 450; // Start drawing keyboard below the grid

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const xOffset = (width - row.length * keyWidth) / 2; // Center keys
    for (let i = 0; i < row.length; i++) {
      const key = row[i];
      const x = xOffset + i * keyWidth;
      const y = yOffset + rowIndex * keyHeight;

      fill(keyStates[key] || 255); // Use the state color or default white
      stroke(0);
      rect(x, y, keyWidth - 5, keyHeight - 5, 5);
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(18);
      text(key.toUpperCase(), x + (keyWidth - 5) / 2, y + (keyHeight - 5) / 2);
    }
  }
}

function drawInstructions() {
  fill(0);
  textAlign(CENTER);
  textSize(15);
  text('Use the keyboard to type your guess.', width / 2, 700);
  text('Press ENTER to submit, BACKSPACE to delete.', width / 2, 725);
}

function keyPressed() {
  if (guessedWords.length >= maxAttempts) return; // Game over

  if (key === 'Enter') {
    if (currentGuess.length === wordLength) {
      guessedWords.push(currentGuess);
      updateKeyStates(currentGuess);
      if (currentGuess === targetWord) {
        alert('You win!');
      } else if (guessedWords.length === maxAttempts) {
        alert('Game over. The word was: ' + targetWord);
      }
      currentGuess = '';
    }
  } else if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
  } else if (
    availableLetters.includes(key.toLowerCase()) &&
    currentGuess.length < wordLength
  ) {
    currentGuess += key.toLowerCase();
  }
}

function getFeedback(guess) {
  let feedback = Array(wordLength).fill(color(200)); // Default: gray
  let targetCopy = targetWord.split('');

  // Correct position
  for (let i = 0; i < wordLength; i++) {
    if (guess[i] === targetWord[i]) {
      feedback[i] = COLOR_CORRECT; // Green
      targetCopy[i] = null; // Prevent double counting
    }
  }

  // Wrong position
  for (let i = 0; i < wordLength; i++) {
    if (feedback[i] !== color(0, 255, 0) && targetCopy.includes(guess[i])) {
      feedback[i] = COLOR_PRESENT; // Yellow
      targetCopy[targetCopy.indexOf(guess[i])] = null;
    }
  }

  return feedback;
}

function updateKeyStates(guess) {
  let feedback = getFeedback(guess);
  for (let i = 0; i < wordLength; i++) {
    const char = guess[i];
    if (feedback[i] === COLOR_CORRECT) {
      keyStates[char] = COLOR_CORRECT; // Green
    } else if (feedback[i] === COLOR_PRESENT) {
      if (keyStates[char] !== COLOR_CORRECT) {
        keyStates[char] = COLOR_PRESENT; // Yellow
      }
    } else {
      keyStates[char] = COLOR_ABSENT; // Gray
    }
  }
}

function initializeKeyStates() {
  for (let char of availableLetters) {
    keyStates[char] = 255; // Default to white
  }
}

function randomWord() {
  const words = [
    'apple',
    'table',
    'chair',
    'grape',
    'world',
    'plant',
    'train',
    'mouse',
    'space',
    'beach',
  ];
  return random(words);
}
