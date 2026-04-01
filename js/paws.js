// Paw print cursor trail — exact port of original

(function() {
  const svgEl = document.getElementById('paw-svg');
  let feetEls = [];

  const pointer = { x: 0, y: 0, dx: 0, dy: 0, angle: 0, moving: false, justStopped: false };

  const stepsNumber = 9;
  const iconSize = 50;
  const mouseRepel = 35;
  const feetPositions = [];

  updateLayout();
  window.addEventListener('resize', updateLayout);
  createFeet();

  let stepsCnt = 0;
  let accumDx = 0;
  let accumDy = 0;
  let accumDist = 0;

  render();

  window.addEventListener('mousemove', function(e) { onPointerMove(e.clientX, e.clientY); });
  window.addEventListener('touchmove', function(e) { onPointerMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY); });

  function updateLayout() {
    svgEl.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
  }

  function createFeet() {
    for (let i = 0; i < stepsNumber; i++) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      el.setAttribute('href', i % 2 ? '#paw-left' : '#paw-right');
      el.setAttribute('x', '-' + (.5 * iconSize));
      el.setAttribute('y', '-' + (.5 * iconSize));
      el.setAttribute('width', '' + iconSize);
      el.setAttribute('height', '' + iconSize);
      el.style.filter = 'drop-shadow(0 0 4px rgba(57,255,20,0.6))';
      svgEl.appendChild(el);
      feetPositions.push({ x: 0, y: 0, angle: 0, age: 0 });
      feetEls.push(el);
      gsap.set(el, { opacity: 0, transformOrigin: 'center center' });
    }
  }

  function onPointerMove(x, y) {
    pointer.dx = x - pointer.x;
    pointer.dy = y - pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.moving = true;

    accumDx += pointer.dx;
    accumDy += pointer.dy;
    pointer.angle = Math.atan2(pointer.dx, pointer.dy);
    accumDist = Math.sqrt(Math.pow(accumDx, 2) + Math.pow(accumDy, 2));

    if (accumDist > 70) {
      stepsCnt++;
      accumDx = 0;
      accumDy = 0;
      accumDist = 0;

      feetPositions.unshift({
        x: pointer.x,
        y: pointer.y,
        angle: (1 - pointer.angle / Math.PI) * 180,
        age: 1
      });
      feetPositions.length = stepsNumber;

      feetPositions[0].x -= Math.sin(pointer.angle) * mouseRepel;
      feetPositions[0].y -= Math.cos(pointer.angle) * mouseRepel;

      for (let fIdx = 1; fIdx < stepsNumber; fIdx++) {
        updateFootEl(feetEls[fIdx], fIdx, (fIdx % 2 === stepsCnt % 2));
      }
      gsap.set(feetEls[0], { opacity: 0 });
    }
  }

  function render() {
    for (let fIdx = 1; fIdx < stepsNumber; fIdx++) {
      feetPositions[fIdx].age -= (pointer.moving ? .05 : .1);
    }
    for (let fIdx = 2; fIdx < stepsNumber; fIdx++) {
      gsap.set(feetEls[fIdx], { opacity: Math.max(0, feetPositions[fIdx].age) });
    }

    if (pointer.moving) {
      pointer.moving = false;
      pointer.justStopped = true;
    } else if (pointer.justStopped) {
      pointer.justStopped = false;
      updateFootEl(feetEls[0], 0, (0 === stepsCnt % 2));
      gsap.set(feetEls[0], { opacity: 1 });
      updateFootEl(feetEls[1], 0, (1 === stepsCnt % 2), .1);
      gsap.set(feetEls[1], { delay: .1, opacity: 1 });
      for (let fIdx = 2; fIdx < stepsNumber; fIdx++) {
        updateFootEl(feetEls[fIdx], fIdx - 1, ((fIdx - 1) % 2 === stepsCnt % 2));
      }
    }

    requestAnimationFrame(render);
  }

  function updateFootEl(el, posIdx, isLeft, delay) {
    gsap.set(el, {
      delay: delay || 0,
      x: feetPositions[posIdx].x,
      y: feetPositions[posIdx].y,
      rotation: feetPositions[posIdx].angle,
      attr: { href: isLeft ? '#paw-left' : '#paw-right' },
    });
  }
})();
