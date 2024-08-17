var rocket;
var population;
var lifespan = 375;
var lifeP;
var count = 0;
var target;
var maxForce = 0.25;

var recX = 250;
var recY = 350;
var recW = 200;
var recH = 10;

function setup() {
  createCanvas(700, 650);
  rocket = new Rocket();
  population = new Population();
  lifeP = createP();
  target = createVector(width / 2, 50);
}

function draw() {
  background(0);
  population.run();
  lifeP.html(count);

  count++;
  if (count == lifespan) {
    population.evaluate();
    population.naturalSelection();
    count = 0;
  }
  fill(255);
  rect(recX, recY, recW, recH);

  ellipse(target.x, target.y, 16, 16);
}

function DNA(genes) {
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];
    for (let i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxForce);
    }
  }

  this.crossover = function (partner) {
    var newGenes = [];
    var midpoint = floor(random(this.genes.length));
    for (let i = 0; i < this.genes.length; i++) {
      if (i > midpoint) {
        newGenes[i] = this.genes[i];
      } else {
        newGenes[i] = partner.genes[i];
      }
    }
    return new DNA(newGenes);
  };

  this.mutation = function () {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.05) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxForce);
      }
    }
  };
}

function Population() {
  this.rockets = [];
  this.popSize = 100;
  this.matingPool = [];

  for (var i = 0; i < this.popSize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function () {
    var maxFit = 0;
    for (var i = 0; i < this.popSize; i++) {
      this.rockets[i].calcFitness();
      if (this.rockets[i].fitness > maxFit) {
        maxFit = this.rockets[i].fitness;
      }
    }
    createP(maxFit);

    for (var i = 0; i < this.popSize; i++) {
      this.rockets[i].fitness /= maxFit;
    }

    this.matingPool = [];
    for (var i = 0; i < this.popSize; i++) {
      var n = this.rockets[i].fitness * 100;
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i]);
      }
    }
  };

  this.naturalSelection = function () {
    var newRockets = [];
    for (let i = 0; i < this.rockets.length; i++) {
      var parentA = random(this.matingPool).dna;
      var parentB = random(this.matingPool).dna;
      var child = parentA.crossover(parentB);
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  };

  this.run = function () {
    for (var i = 0; i < this.popSize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

function Rocket(dna) {
  this.pos = createVector(width / 2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.hasReachedTarget = false;
  this.targetReachTime = 9999;
  this.crashed = false;
  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;

  this.applyForce = function (force) {
    this.acc.add(force);
  };

  this.calcFitness = function () {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);

    if (this.hasReachedTarget) {
      var speed = lifespan - this.targetReachTime;
      this.fitness += speed * 10;
      this.fitness *= 5;
    }
    if (this.crashed) {
      this.fitness /= 50;
    }
  };

  this.update = function () {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
      if (!this.hasReachedTarget) {
        this.targetReachTime = count;
      }
      this.hasReachedTarget = true;
      this.pos = target.copy();
    }

    if (
      this.pos.x > recX &&
      this.pos.x < recX + recW &&
      this.pos.y > recY &&
      this.pos.y < recY + recH
    ) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    this.applyForce(this.dna.genes[count]);

    if (!this.hasReachedTarget && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  };

  this.show = function () {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };
}
