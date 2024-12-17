let mic, recorder, soundFile;
let recordings = [];
let isRecording = false;
let selectedIndex = null;

function setup() {
  createCanvas(600, 400).parent('canvasContainer');

  // Setup mic, recorder, and sound file
  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();

  // HTML Button References
  document.getElementById('start-recording').addEventListener('click', () => {
    ensureAudioContext();
    startRecording();
  });
  document
    .getElementById('stop-recording')
    .addEventListener('click', stopRecording);
  document
    .getElementById('delete-selected')
    .addEventListener('click', deleteSelected);
  document
    .getElementById('rename-selected')
    .addEventListener('click', renameSelected);
  document
    .getElementById('download-selected')
    .addEventListener('click', downloadSelected);
}

// Ensure the audio context is resumed
function ensureAudioContext() {
  if (getAudioContext().state !== 'running') {
    getAudioContext()
      .resume()
      .then(() => {
        console.log('Audio context resumed');
      });
  }
}

function draw() {
  background(220);
  textSize(16);
  textAlign(LEFT);

  // Instructions
  text('Recordings:', 20, 20);
  text('Click on a recording to play/select it.', 20, 40);

  // Display recordings
  for (let i = 0; i < recordings.length; i++) {
    let y = 70 + i * 30;
    let displayText = `${i + 1}. ${recordings[i].name}`;

    // Highlight selected recording
    if (i === selectedIndex) {
      fill(200, 255, 200);
      rect(20, y - 15, 300, 25);
      fill(0);
    } else {
      fill(255);
      rect(20, y - 15, 300, 25);
      fill(0);
    }

    text(displayText, 30, y);
  }
}

function startRecording() {
  if (!isRecording) {
    soundFile = new p5.SoundFile();
    recorder.record(soundFile);
    isRecording = true;
    console.log('Recording started');

    // Update button styles
    const startButton = document.getElementById('start-recording');
    const stopButton = document.getElementById('stop-recording');
    startButton.classList.add('recording');
    stopButton.classList.add('active');
  }
}

function stopRecording() {
  if (isRecording) {
    recorder.stop();
    let newRecording = {
      file: soundFile,
      name: `Recording ${recordings.length + 1}`,
    };
    recordings.push(newRecording);
    isRecording = false;
    console.log('Recording stopped');

    // Update button styles
    const startButton = document.getElementById('start-recording');
    const stopButton = document.getElementById('stop-recording');
    startButton.classList.remove('recording');
    stopButton.classList.remove('active');
  }
}

function deleteSelected() {
  if (selectedIndex !== null) {
    recordings.splice(selectedIndex, 1);
    selectedIndex = null; // Reset selection
    console.log('Recording deleted');
  }
}

function renameSelected() {
  if (selectedIndex !== null) {
    let newName = prompt(
      'Enter new name for the recording:',
      recordings[selectedIndex].name
    );
    if (newName) {
      recordings[selectedIndex].name = newName;
      console.log('Recording renamed to', newName);
    }
  }
}

function downloadSelected() {
  if (selectedIndex !== null) {
    let recording = recordings[selectedIndex];
    let fileName = `${recording.name}.wav`;

    // Use p5's saveSound function to download the recording
    saveSound(recording.file, fileName);
    console.log('Downloading', fileName);
  } else {
    console.warn('No recording selected for download.');
  }
}

function mousePressed() {
  // Check if user clicked on a recording
  for (let i = 0; i < recordings.length; i++) {
    let y = 70 + i * 30;
    if (mouseX > 20 && mouseX < 320 && mouseY > y - 15 && mouseY < y + 10) {
      selectedIndex = i;
      recordings[i].file.play();
      console.log('Playing', recordings[i].name);
    }
  }
}
