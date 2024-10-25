let i = 0;
let w = 10;

// for highlighting pivot elements
let states = [];
let INACTIVE = -1;
let ACTIVE = 0;
let GROUP = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  values = new Array(floor(width / w));
  states = new Array(floor(width / w));
  for (let i = 0; i < values.length; i++) {
    values[i] = random(height);
    states[i] = INACTIVE;
  }
  //frameRate(5);
  quickSort(values, 0, values.length - 1);
}

async function quickSort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let index = await partition(arr, start, end);
  states[index] = INACTIVE;

  // awaiting both at the same time so the visualization is smoother
  await Promise.all([
    quickSort(arr, start, index - 1),
    quickSort(arr, index + 1, end),
  ]);
}

async function partition(arr, start, end) {
  for (let i = start; i < end; i++) {
    states[i] = GROUP;
  }

  let pivotIndex = start;
  let pivotValue = arr[end];
  states[pivotIndex] = ACTIVE;
  for (let i = pivotIndex; i < end; i++) {
    if (arr[i] < pivotValue) {
      await swap(arr, i, pivotIndex);
      states[pivotIndex] = INACTIVE;
      pivotIndex++;
      states[pivotIndex] = ACTIVE;
    }
  }
  await swap(arr, pivotIndex, end);

  for (let i = start; i < end; i++) {
    if (i != pivotIndex) {
      states[i] = INACTIVE;
    }
  }

  return pivotIndex;
}

function draw() {
  background(51);

  for (let i = 0; i < values.length; i++) {
    stroke(0);
    // noStroke();
    if (states[i] == ACTIVE) {
      fill('#E0777D');
    } else if (states[i] == GROUP) {
      fill('#D6FFB7');
    } else {
      fill(255);
    }
    rect(i * w, height - values[i], w, values[i]);
  }
}

async function swap(arr, a, b) {
  // we delay for the visualization part
  await sleep(25);
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
