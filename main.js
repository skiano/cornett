import './style.css'
import p5 from 'p5';
import addRecorder from './recorder';

addRecorder(p5);

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

function smoothstep (x) {
  return x * x * (3 - 2 * x);
};

function getDarks(p) {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  return [
    // p.lerpColor(y, b, 0.85),
    // p.lerpColor(y, b, 0.9),
    p.lerpColor(y, b, 0.95),
    p.lerpColor(y, b, 0.97),
    b
  ].reverse();
}

function getLights(p) {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  return [
    y,
    p.lerpColor(y, b, 0.05),
    p.lerpColor(y, b, 0.1),
    // p.lerpColor(y, b, 0.15),
    // p.lerpColor(y, b, 0.2),
  ];
}

function standardSetup(p) {
  let s = p.drawingContext.canvas.parentNode;
  let w = s.offsetWidth;
  let h = s.offsetHeight;
  p.createCanvas(w, h);
  p.startRecorder();
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
  // p.strokeWeight(2);
  // p.rectMode(p.CENTER);
  // p.rect(cx, cy, d, d);
  p.pop();
}

function drawTarget(p, cx, cy, d, mask = [1, 2, 3, 4]) {
  p.push();

  let s = 4;
  let g = d / s;
  mask.forEach(((i) => {
    p.circle(cx, cy, (i * g));
  }));

  p.pop();
}

function drawFlower(p, cx, cy, d, min = 0, max = 7, polarity = -1) {
  p.push();
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

function drawDust(p, cx, cy, d, amt = 1, makeColors = (p) => {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  let steps = 6;
  return [...new Array(steps)].map((_, i) => p.lerpColor(y, b, i / steps));
}) {
  let n = d * d / 300 * amt;
  let rad = 6;
  let t = cy - d / 2;
  let b = t + d;
  let l = cx - d / 2;
  let r = l + d;
  let colors = makeColors(p);
  for (let i = 0; i < n; i += 1) {
    p.push();
    p.noStroke();
    p.fill(p.random(colors));
    p.circle(p.random(l, r), p.random(t, b), rad);
    p.pop();
  }
}

function drawBurst(p, cx, cy, d, levels = 3, makeColors = (p) => {
  let y = p.color(YELLOW);
  let b = p.color(BLACK);
  let steps = 6;
  return [...new Array(steps)].map((_, i) => p.lerpColor(y, b, i / steps));
}) {
  let slices = 24;
  let ang = p.TAU / slices;
  let colors = makeColors(p);
  p.push();
  p.translate(cx, cy);
  p.rectMode(p.CENTER);
  p.noStroke();
  for (let l = 0; l < levels; l++) {
    p.fill(p.random(colors));
    p.rotate(p.random(0, p.TAU));
    for (let i = 0; i < slices / 2; i += 1) {
      p.rect(0, 0, 10, p.random(d / (l + 3), d), d * 0.05);
      p.rotate(ang);
    }
  }
  p.pop();
}

function drawLogo(p, cx, cy, d, marker = (p, x, y, s) => {
  drawTarget(p, x, y, s, [4]);
}, ratio = 5.75) {
  let slices = 20;
  let angle = p.TAU / slices;
  let gridSize = d / ratio;
  let radius = (d / 2) - (gridSize / 2);
  let open = 2;
  for (let i = 0 + open; i <= slices - open; i += 1) {
    let a = i * -angle;
    let x = cx + p.cos(a) * radius;
    let y = cy + p.sin(a) * radius;
    marker(p, x, y, gridSize, i);
  }
}

function drawClipLogo(p, cx, cy, d, marker = (p, x, y, s) => {
  drawTarget(p, x, y, s, [4]);
}) {
  let standardRatio = 5.75; // how many circles to fit into the space
  let slices = 20;
  let angle = p.TAU / slices;
  let gridSize = d / standardRatio;
  let radius = (d / 2) - (gridSize / 2);
  let open = 2;
  for (let i = 0 + open; i <= slices - open; i += 1) {
    let a = i * -angle;
    let x = cx + p.cos(a) * radius;
    let y = cy + p.sin(a) * radius;
    let cushion = 0.001;
    p.push();
    p.clip(() => {
      p.fill(0);
      let start = i === slices - open ? 0 : a - (angle/2);
      let end = i === 0 + open ? p.TAU : a + (angle / 2) + cushion;
      p.arc(cx, cy, d + p.width, d + p.height, start, end);
      p.noFill(); // THIS IS SUPER ANNOYING THAT I CANNOT RESTORE TO WHATEVER WAS BEFORE
    });
    marker(p, x, y, gridSize, i);
    p.pop();
  }
}

//////////////
// SKETCHES //
//////////////

SKETCHES.push(function explainTarget(p, [fg, bg]) {
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
  
  const totalFrames = masks.length * 6;

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
    let d = p.height / 5 * 3;

    draw8x8(p, cx, cy, d);

    p.strokeWeight(6);
    drawTarget(p, cx, cy, d, masks[p.frameCount % masks.length]);

    if (p.frameCount === totalFrames) p.stopRecorder('yo-01');
  };
});

SKETCHES.push(function explainFlower(p, [fg, bg]) {
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
    let d = p.height / 5 * 3;

    draw8x8(p, cx, cy, d);
    p.strokeWeight(4);
    drawFlower(p, cx, cy, d, p.frameCount, p.frameCount + 3);
  };
});

SKETCHES.push(function explainBursts(p, [fg, bg]) {
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
    p.frameRate(7);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 5 * 3;

    draw8x8(p, cx, cy, d);
    drawBurst(p, cx, cy, d, 10, () => getDarks(p));
    drawDust(p, cx, cy, d, 0.1);
  };
});

SKETCHES.push(function maskedOutlines(p, [fg, bg]) {
  const markers = p.shuffle([
    (p, x, y, d) => {
      p.strokeWeight(2);
      drawTarget(p, x, y, d, [6]);
    },
    (p, x, y, d) => {
      p.strokeWeight(4);
      drawTarget(p, x, y, d, [...new Array(32)].map((_, i) => i + 2));
    },
    (p, x, y, d) => {
      p.strokeWeight(2);
      drawTarget(p, x, y, d);
    },
    (p, x, y, d) => {
      p.strokeWeight(4);
      drawTarget(p, x, y, d, [1, 2, 3, 4, 5, 6, 7, 8]);
    },
  ])

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
    p.frameRate(2);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 3 * 2;

    drawClipLogo(p, cx, cy, d, markers[p.frameCount % markers.length]);
  };
});

SKETCHES.push(function basicLogos(p, [fg, bg]) {
  const markers = p.shuffle([
    (p, x, y, d) => {
      p.strokeWeight(1);
      drawFlower(p, x, y, d);
    },
    (p, x, y, d) => {
      p.strokeWeight(3);
      drawTarget(p, x, y, d);
    },
    (p, x, y, d) => {
      p.strokeWeight(3);
      drawTarget(p, x, y, d, [1]);
    },
    (p, x, y, d) => {
      p.strokeWeight(1);
      drawTarget(p, x, y, d, [4]);
    },
    (p, x, y, d) => {
      p.strokeWeight(1);
      drawFlower(p, x, y, d * 3.3);
    },
    (p, x, y, d) => {
      p.strokeWeight(3);
      drawTarget(p, x, y, d, [1, 4]);
    },
  ])

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
    p.frameRate(1);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 3 * 2;

    drawLogo(p, cx, cy, d, markers[p.frameCount % markers.length]);
  };
});

SKETCHES.push(function burstLogos(p, [fg, bg]) {
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.fill(fg);
    p.noStroke();
  };

  p.draw = function () {
    p.background(bg);
    p.background(p.lerpColor(p.color(YELLOW), p.color(BLACK), 0.5));
    p.noFill();
    p.frameRate(12);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 3 * 2;

    drawLogo(p, cx, cy, d, (p, x, y, d) => {
      drawBurst(p, x, y, d * 15, 1);
    });

    drawLogo(p, cx, cy, d, (p, x, y, d) => {
      drawBurst(p, x, y, d * 5, 1, () => getLights(p));
    });

    drawLogo(p, cx, cy, d, (p, x, y, d) => {
      drawBurst(p, x, y, d * 2.5, 7, () => getDarks(p));
    });

    drawLogo(p, cx, cy, d, (p, x, y, d) => {
      drawDust(p, x, y, (p.sin(p.frameCount / 14) * d + 2) * 1.5);
    });
  };
});

SKETCHES.push(function ripple(p, [fg, bg]) {
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
    p.frameRate(24);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 4 * 3;

    drawLogo(p, cx, cy, d, (p, x, y, d, i) => {
      p.strokeWeight(1);
      drawTarget(p, x, y, d, [(p.frameCount / 2) % 24 + i / 3]);
    });
  };
});

SKETCHES.push(function gather(p, [fg, bg]) {
  let randomPositions = [];
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.fill(fg);
    p.noStroke();
    let out = p.height;
    randomPositions = [...new Array(30)].map(() => [
      p.random(-out, p.width + out),
      p.random(-out, p.height + out)
    ]);
  };

  p.draw = function () {
    p.background(bg);
    p.stroke(fg);
    p.noFill();
    p.frameRate(24);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 4 * 3;

    for (let l = 0; l < 8; l++) {
      drawLogo(p, cx, cy, d, (p, x, y, d, i) => {
        let t = smoothstep(p.norm(p.sin(p.frameCount / 15), -1, 1));
        p.fill(bg);
        p.stroke(fg);
        p.strokeWeight(4)
        let [ix, iy] = randomPositions[(i + (l * 3)) % randomPositions.length];
        drawTarget(p, p.lerp(ix, x, t), p.lerp(iy, y, t), d, [2]);
      });
    }
  };
});

SKETCHES.push(function gravity(p, [fg, bg]) {
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.stroke(fg);
    p.strokeWeight(1);
    p.noFill();
  };

  p.draw = function () {
    p.background(bg);
    p.frameRate(18);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 4 * 3;

    let t = smoothstep(p.norm(p.sin(p.frameCount / 5), -1, 1));

    let min = p.map(t, 0, 1, 2, 10);
    let max = p.map(t, 0, 1, 10, 40);

    for (let i = min; i < max; i++) {
      drawLogo(p, cx, cy, d, (p, x, y, d) => {
        drawTarget(p, x, y, d, [4]);
      }, i);
    }
  };
});

SKETCHES.push(function gravity(p, [fg, bg]) {
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.stroke(fg);
    p.strokeWeight(2);
    p.noFill();
  };

  p.draw = function () {
    p.background(bg);
    p.frameRate(18);

    let cx = p.width / 2;
    let cy = p.height / 2;
    let d = p.height / 5;
    let t = smoothstep(p.norm(p.frameCount % 20, 0, 20));
    let t2 = smoothstep(p.norm(p.frameCount % 40, 0, 40));

    for (let i = p.map(t2, 0, 1, 0, 50); i < p.map(t, 0, 1, 0, 200); i++) {
      p.fill(i % 2 === 1 ? fg : bg);
      drawLogo(p, cx, cy, d + (i * 25), (p, x, y, d) => {
        drawTarget(p, x, y, d, [2]);
      });
    }
  };
});

SKETCHES.push(function checkers(p, [fg, bg]) {
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.stroke(fg);
    p.noFill();
  };

  p.draw = function () {
    p.background(bg);
    p.frameRate(3);

    let detail = 5;
    let d = p.height / detail;

    for (let ix = 0; ix < detail; ix ++) {
      for (let iy = 0; iy < detail; iy ++) {
        let cx = ix * d + (d / 2);
        let cy = iy * d + (d / 2);
        let r = p.random(1, 4);
        drawLogo(p, cx, cy, d, (p, x, y, d) => {
          if (ix % 2 === iy % 2) {
            p.strokeWeight(1);
            drawTarget(p, x, y, d * 1, [r]);
          } else {
            drawFlower(p, x, y, d * 1);
          }
        });
      }
    }
  };
});

SKETCHES.push(function checkers(p, [fg, bg]) {
  p.setup = function () {
    standardSetup(p);
    p.background(bg);
    p.stroke(fg);
    p.noFill();
  };

  p.draw = function () {
    p.background(bg);
    p.frameRate(24);

    let cx = p.width / 2;
    let cy = p.height / 2;

    p.push();
      p.clip(() => {
        p.arc(cx, cy, p.width * 2, p.height * 2, 0, -p.frameCount / 10, p.PIE);
      });
      p.background(fg)
      p.fill(bg)
      p.noStroke();
      drawLogo(p, cx, cy, p.width / 3 * 2, (p, x, y, d) => {
        drawTarget(p, x, y, d, [10]);
      });

      p.fill(fg)
      drawLogo(p, cx, cy, p.width / 3 * 2, (p, x, y, d) => {
        drawTarget(p, x, y, d, [1]);
      });
    p.pop();

    p.push();
      p.clip(() => {
        p.arc(cx, cy, p.width * 2, p.height * 2, 0, -p.frameCount / 10, p.PIE);
      }, { invert: true });
      p.background(bg)
      p.fill(fg)
      p.noStroke();
      drawLogo(p, cx, cy, p.width / 3 * 2, (p, x, y, d) => {
        drawFlower(p, x, y, d * 2.75);
      });

      p.fill(bg)
      drawLogo(p, cx, cy, p.width / 3 * 2, (p, x, y, d) => {
        drawTarget(p, x, y, d, [1]);
      });
    p.pop();
  };
});

SKETCHES.splice(0, 1).forEach((sketch, idx) => {
  const sq = document.createElement('div');
  sq.classList.add('sq');
  ROOT.appendChild(sq);
  new p5((p) => {
    let darks = getDarks(p);
    let lights = getLights(p);
    const bg = darks[p.floor(idx / 2) % 2];
    const fg = lights[p.floor(idx / 2) % 2];
    sketch(p, idx % 2 ? [bg, fg] : [fg, bg]);
  }, sq);
});
