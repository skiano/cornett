import './style.css'
import viteLogo from '/vite.svg'
import p5 from 'p5';

console.log(viteLogo);

// Function for second canvas
function sketch(p) {
  p.setup = function () {
    let s = p.drawingContext.canvas.parentNode;
    let w = s.offsetWidth;
    let h = s.offsetHeight;
    console.log(w, h)

    p.createCanvas(w, h);
    p.background(255);
    p.fill(0);
    p.stroke(255);
  };

  p.draw = function () {
    p.square(p.mouseX, p.mouseY, 50);
  };
}

const app = document.getElementById('app');



for (let i = 0; i < 9; i += 1) {
  const mys = document.createElement('div');
  mys.classList.add('sq');
  app.appendChild(mys);
  new p5(sketch, mys);
}

