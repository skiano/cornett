import './style.css'
import p5 from 'p5';

////////////////
// BASIC JUNK //
////////////////

const ROOT = document.getElementById('app');
const YELLOW = '#faf290';
const BLACK = '#231f20';
const SKETCHES = [];

////////////////////
// COMMON HELPERS //
////////////////////

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

function standardSetup(p) {
  let s = p.drawingContext.canvas.parentNode;
  let w = s.offsetWidth;
  let h = s.offsetHeight;
  p.createCanvas(w, h);
}

function draw8x8(p, cx, cy, d) {
  p.push();
  p.noFill();
  p.stroke(p.lerpColor(p.color(YELLOW), p.color(BLACK), 0.5));
  p.strokeWeight(1);
  let t = cy - d / 2;
  let b = t + d;
  let l = cx - d / 2;
  let r = l + d;
  let s = 8;
  let g = d / s;
  for (let x = 0; x <= s; x += 1) {
    p.line(l + (x * g), t, l + (x * g), b);
  }
  for (let y = 0; y <= s; y += 1) {
    p.line(l, t + (y * g), r, t + (y * g));
  }
  p.strokeWeight(2);
  p.rectMode(p.CENTER);
  p.rect(cx, cy, d, d);
  p.pop();
}

function drawTarget(p, cx, cy, d, mask = [1, 2, 3, 4]) {
  p.push();
  p.noFill();

  let s = 4;
  let g = d / s;
  mask.forEach(((i) => {
    p.circle(cx, cy, (i * g));
  }));

  p.pop();
}

function drawFlower(p, cx, cy, d, min = 0, max = 7, polarity = -1) {
  p.push();
  p.noFill();
  p.translate(cx, cy);
  let spin = p.TAU / 8 * polarity;

  if (max < min) {
    [max, min] = [min, max];
  }

  p.rotate(spin * min);
  for (let a = min; a <= max; a += 1) {
    p.ellipse(d / 4, 0, d / 2, d / 4);
    p.rotate(spin);
  }
  p.pop();
}

//////////////
// SKETCHES //
//////////////

// SKETCHES.push(function randomDots(p) {
//   const darks = getDarks(p);
//   const lights = getLights(p);
//   const bg = p.random(darks);
//   const fg = p.random(lights);

//   p.setup = function () {
//     standardSetup(p);
//     p.background(bg);
//     p.fill(fg);
//     p.noStroke();
//   };

//   p.draw = function () {
//     p.background(bg);
//     p.circle(p.random(0, p.width), p.random(0, p.height), p.random(50, 200));
//     p.push();
//     p.noFill();
//     p.stroke(fg);
//     p.square(0, 0, p.width);
//     p.pop();
//   };
// });

SKETCHES.push(function basicGrid(p) {
  const darks = getDarks(p);
  const lights = getLights(p);
  const bg = p.random(darks);
  const fg = p.random(lights);

  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.fill(fg);
    p.noStroke();
  };

  p.draw = function () {
    p.background(bg);
    p.stroke(fg);
    p.noFill();
    p.frameRate(10);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height - 100;

    draw8x8(p, cx, cy, d);
    p.strokeWeight(4);
    drawFlower(p, cx, cy, d, p.frameCount, p.frameCount + 3);
  };
});

SKETCHES.push(function basicGrid(p) {
  const darks = getDarks(p);
  const lights = getLights(p);
  const bg = p.random(darks);
  const fg = p.random(lights);

  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.fill(fg);
    p.noStroke();
  };

  p.draw = function () {
    p.background(bg);
    p.stroke(fg);
    p.noFill();
    p.frameRate(5);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height - 100;

    draw8x8(p, cx, cy, d);

    const masks = [
      [1],
      [1, 2],
      [1, 2, 3, 4],
      [2, 3, 4],
      [3, 4],
      [4],
      [4],
      [1, 4],
      [1, 4],
      [4],
      [4],
      [1, 4],
      [1, 4],
      [4],
      [4],
      [1, 4],
    ];

    p.strokeWeight(6);
    drawTarget(p, cx, cy, d, masks[p.frameCount % masks.length]);
  };
});

for (let i = 0; i < 12; i += 1) {
  const sq = document.createElement('div');
  sq.classList.add('sq');
  ROOT.appendChild(sq);
  new p5((p) => {
    p.random(SKETCHES)(p);
  }, sq);
}

