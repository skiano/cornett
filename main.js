import './style.css'
import viteLogo from '/vite.svg'
import p5 from 'p5';

const YELLOW = '#faf290';
const BLACK = '#231f20';

console.log(viteLogo);

function getDarks(p) {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  return [
    p.lerpColor(y, b, 0.6),
    p.lerpColor(y, b, 0.7),
    p.lerpColor(y, b, 0.8),
    p.lerpColor(y, b, 0.9),
    b
  ];
}

function getLights(p) {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  return [
    y,
    p.lerpColor(y, b, 0.1),
    p.lerpColor(y, b, 0.2),
    p.lerpColor(y, b, 0.3),
    p.lerpColor(y, b, 0.4),
  ];
}

// Function for second canvas
function sketch(p) {

  const darks = getDarks(p);
  const lights = getLights(p);
  const bg = p.random(darks);
  const fg = p.random(lights);

  p.setup = function () {
    let s = p.drawingContext.canvas.parentNode;
    let w = s.offsetWidth;
    let h = s.offsetHeight;

    

    p.pixelDensity(2);
    p.createCanvas(w, h);
    p.background(p.random(darks));
    p.fill(fg);
    p.noStroke();
  };
  p.draw = function () {
    p.background(bg);
    p.circle(p.random(0, p.width), p.random(0, p.height), p.random(50, 200));
    p.push();
    p.noFill();
    p.stroke(fg);
    p.square(0, 0, p.width);
    p.pop();

    // if (p.mouseX > 0 && p.mouseY > 0) {
    //   p.square(p.mouseX, p.mouseY, 50);
    // }
  };
}

const app = document.getElementById('app');

for (let i = 0; i < 12; i += 1) {
  const mys = document.createElement('div');
  mys.classList.add('sq');
  app.appendChild(mys);
  new p5(sketch, mys);
}

