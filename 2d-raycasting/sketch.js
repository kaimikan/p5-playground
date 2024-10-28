let wall;
let ray;

function setup() {
  createCanvas(400, 400);
  wall = new Boundary(300, 100, 300, 300);
  ray = new Ray(100, 200);
}

function draw() {
  background(0);
  wall.show();
  ray.show();

  let pnt = ray.cast(wall);
  ray.lookAt(mouseX, mouseY);
  if (pnt) {
    fill(255);
    ellipse(pnt.x, pnt.y, 8, 8);
  }
}
