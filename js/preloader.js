// Spiral galaxy preloader + particle text + reveal sequence

(function() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let size;

  const CHANGE_EVENT_TIME = 0.32;
  const CAMERA_Z = -400;
  const CAMERA_TRAVEL_DISTANCE = 3400;
  const START_DOT_Y_OFFSET = 28;
  const VIEW_ZOOM = 100;
  const NUMBER_OF_STARS = 5000;
  const TRAIL_LENGTH = 80;

  let animTime = 0;
  let spiralTimeline;
  let stars = [];

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    size = Math.max(w, h);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ease(p, g) {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  function map(value, s1, e1, s2, e2) {
    return s2 + (e2 - s2) * ((value - s1) / (e1 - s1));
  }

  function constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(a, b, t) { return a * (1 - t) + b * t; }

  function randRange(min, max) { return min + Math.random() * (max - min); }

  function spiralPath(p) {
    p = constrain(1.2 * p, 0, 1);
    p = ease(p, 1.8);
    const turns = 6;
    const theta = 2 * Math.PI * turns * Math.sqrt(p);
    const r = 280 * Math.sqrt(p);
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) + START_DOT_Y_OFFSET };
  }

  function rotate(v1, v2, p, orientation) {
    const middle = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
    const dx = v1.x - middle.x;
    const dy = v1.y - middle.y;
    const angle = Math.atan2(dy, dx);
    const o = orientation ? -1 : 1;
    const r = Math.sqrt(dx * dx + dy * dy);
    const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);
    return {
      x: middle.x + r * (1 + bounce) * Math.cos(angle + o * Math.PI * easeOutElastic(p)),
      y: middle.y + r * (1 + bounce) * Math.sin(angle + o * Math.PI * easeOutElastic(p))
    };
  }

  function showProjectedDot(pos) {
    const t2 = constrain(map(animTime, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
    const newCameraZ = CAMERA_Z + ease(Math.pow(t2, 1.2), 1.8) * CAMERA_TRAVEL_DISTANCE;
    if (pos.z > newCameraZ) {
      const depth = pos.z - newCameraZ;
      const x = VIEW_ZOOM * pos.x / depth;
      const y = VIEW_ZOOM * pos.y / depth;
      const sw = 400 * pos.sizeFactor / depth;
      ctx.lineWidth = sw;
      ctx.beginPath();
      ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < NUMBER_OF_STARS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 * Math.random() + 15;
      const rotDir = Math.random() > 0.5 ? 1 : -1;
      const expRate = 1.2 + Math.random() * 0.8;
      const finalScale = 0.7 + Math.random() * 0.6;
      const dx = distance * Math.cos(angle);
      const dy = distance * Math.sin(angle);
      const spiralLoc = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
      let z = randRange(0.5 * CAMERA_Z, CAMERA_TRAVEL_DISTANCE + CAMERA_Z);
      z = lerp(z, CAMERA_TRAVEL_DISTANCE / 2, 0.3 * spiralLoc);
      const swFactor = Math.pow(Math.random(), 2.0);
      stars.push({ angle, distance, rotDir, expRate, finalScale, dx, dy, spiralLoc, z, swFactor });
    }
  }

  function renderStar(star) {
    const sp = spiralPath(star.spiralLoc);
    const q = constrain(map(animTime, 0, CHANGE_EVENT_TIME + 0.25, 0, 1), 0, 1) - star.spiralLoc;
    if (q <= 0) return;
    const dp = constrain(4 * q, 0, 1);
    const linE = dp, elE = easeOutElastic(dp), powE = Math.pow(dp, 2);
    let easing;
    if (dp < 0.3) easing = lerp(linE, powE, dp / 0.3);
    else if (dp < 0.7) easing = lerp(powE, elE, (dp - 0.3) / 0.4);
    else easing = elE;
    let sx, sy;
    if (dp < 0.3) {
      sx = lerp(sp.x, sp.x + star.dx * 0.3, easing / 0.3);
      sy = lerp(sp.y, sp.y + star.dy * 0.3, easing / 0.3);
    } else if (dp < 0.7) {
      const mid = (dp - 0.3) / 0.4;
      const curve = Math.sin(mid * Math.PI) * star.rotDir * 1.5;
      const bx = sp.x + star.dx * 0.3, by = sp.y + star.dy * 0.3;
      const tx = sp.x + star.dx * 0.7, ty = sp.y + star.dy * 0.7;
      const px = -star.dy * 0.4 * curve, py = star.dx * 0.4 * curve;
      sx = lerp(bx, tx, mid) + px * mid;
      sy = lerp(by, ty, mid) + py * mid;
    } else {
      const fp = (dp - 0.7) / 0.3;
      const bx = sp.x + star.dx * 0.7, by = sp.y + star.dy * 0.7;
      const td = star.distance * star.expRate * 1.5;
      const spiralTurns = 1.2 * star.rotDir;
      const spiralAngle = star.angle + spiralTurns * fp * Math.PI;
      const tx = sp.x + td * Math.cos(spiralAngle);
      const ty = sp.y + td * Math.sin(spiralAngle);
      sx = lerp(bx, tx, fp);
      sy = lerp(by, ty, fp);
    }
    const depth = star.z - CAMERA_Z;
    const vx = depth * sx / VIEW_ZOOM;
    const vy = depth * sy / VIEW_ZOOM;
    let sizeMul = 1.0;
    if (dp < 0.6) sizeMul = 1.0 + dp * 0.2;
    else { const t = (dp - 0.6) / 0.4; sizeMul = 1.2 * (1.0 - t) + star.finalScale * t; }
    showProjectedDot({ x: vx, y: vy, z: star.z, sizeFactor: 8.5 * star.swFactor * sizeMul });
  }

  function drawTrail(t1) {
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const f = map(i, 0, TRAIL_LENGTH, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
      ctx.fillStyle = 'white';
      ctx.lineWidth = sw;
      const pathTime = t1 - 0.00015 * i;
      const pos = spiralPath(pathTime);
      const offset = { x: pos.x + 5, y: pos.y + 5 };
      const rotated = rotate(pos, offset, Math.sin(animTime * Math.PI * 2) * 0.5 + 0.5, i % 2 === 0);
      ctx.beginPath();
      ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStartDot() {
    if (animTime > CHANGE_EVENT_TIME) {
      const dy = CAMERA_Z * START_DOT_Y_OFFSET / VIEW_ZOOM;
      showProjectedDot({ x: 0, y: dy, z: CAMERA_TRAVEL_DISTANCE, sizeFactor: 2.5 });
    }
  }

  function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const t1 = constrain(map(animTime, 0, CHANGE_EVENT_TIME + 0.25, 0, 1), 0, 1);
    const t2 = constrain(map(animTime, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * ease(t2, 2.7));
    ctx.fillStyle = 'white';
    drawTrail(t1);
    ctx.fillStyle = 'white';
    for (const star of stars) renderStar(star);
    drawStartDot();
    ctx.restore();
  }

  resize();
  createStars();
  window.addEventListener('resize', () => { resize(); createStars(); });

  spiralTimeline = gsap.timeline();
  spiralTimeline.to({ val: 0 }, {
    val: 1, duration: 10, ease: "none",
    onUpdate: function() { animTime = this.targets()[0].val; render(); }
  });

  // --- Particle Text ---
  const ptCanvas = document.getElementById('particle-text');
  const ptCtx = ptCanvas.getContext('2d');
  const ptParticles = [];
  let ptAnimId;
  const ptW = window.innerWidth;
  const ptH = window.innerHeight;
  ptCanvas.width = ptW;
  ptCanvas.height = ptH;
  const PIXEL_STEPS = ptW < 600 ? 4 : 8;
  const PT_COLOR = { r: 57, g: 255, b: 20 };

  class Particle {
    constructor() {
      this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 }; this.acc = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 }; this.closeEnoughTarget = 100;
      this.maxSpeed = 1.0; this.maxForce = 0.1; this.particleSize = 2;
      this.isKilled = false; this.killOpacity = 1;
      this.startColor = { r: 0, g: 0, b: 0 }; this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0; this.colorBlendRate = 0.01;
    }
    move() {
      let proximityMult = 1;
      const dx = this.pos.x - this.target.x, dy = this.pos.y - this.target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.closeEnoughTarget) proximityMult = distance / this.closeEnoughTarget;
      const toTarget = { x: this.target.x - this.pos.x, y: this.target.y - this.pos.y };
      const mag = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y);
      if (mag > 0) { toTarget.x = (toTarget.x / mag) * this.maxSpeed * proximityMult; toTarget.y = (toTarget.y / mag) * this.maxSpeed * proximityMult; }
      const steer = { x: toTarget.x - this.vel.x, y: toTarget.y - this.vel.y };
      const sMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
      if (sMag > 0) { steer.x = (steer.x / sMag) * this.maxForce; steer.y = (steer.y / sMag) * this.maxForce; }
      this.acc.x += steer.x; this.acc.y += steer.y;
      this.vel.x += this.acc.x; this.vel.y += this.acc.y;
      this.pos.x += this.vel.x; this.pos.y += this.vel.y;
      this.acc.x = 0; this.acc.y = 0;
    }
    draw(ctx) {
      if (this.colorWeight < 1.0) this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
      const cr = Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight);
      const cg = Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight);
      const cb = Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight);
      let alpha;
      if (this.isKilled) { this.killOpacity = Math.max(0, this.killOpacity - 0.025); alpha = this.killOpacity; }
      else { const dx = this.pos.x - this.target.x, dy = this.pos.y - this.target.y; const dist = Math.sqrt(dx * dx + dy * dy); const fadeRadius = Math.max(ptW, ptH) * 0.6; alpha = Math.min(1, Math.max(0, 1 - dist / fadeRadius)); }
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    }
    kill(w, h) {
      if (!this.isKilled) {
        const angle = Math.random() * Math.PI * 2; const dist = (w + h) / 2;
        this.target.x = w / 2 + Math.cos(angle) * dist; this.target.y = h / 2 + Math.sin(angle) * dist;
        this.startColor = { r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight, g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight, b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight };
        this.targetColor = { r: 0, g: 0, b: 0 }; this.colorWeight = 0; this.isKilled = true;
      }
    }
  }

  function spawnText(word) {
    const fontSize = Math.max(16, Math.min(52, ptW * 0.036));
    const textW = Math.min(900, ptW * 0.9);
    const textH = Math.max(60, fontSize * 2.5);
    const offscreen = document.createElement('canvas');
    offscreen.width = textW; offscreen.height = textH;
    const oCtx = offscreen.getContext('2d');
    oCtx.fillStyle = 'white';
    oCtx.font = `600 ${fontSize}px Orbitron, sans-serif`;
    oCtx.textAlign = 'center'; oCtx.textBaseline = 'middle';
    oCtx.fillText(word, textW / 2, textH / 2);
    const imageData = oCtx.getImageData(0, 0, textW, textH);
    const pixels = imageData.data;
    const offsetX = (ptW - textW) / 2;
    const offsetY = (ptH - textH) / 2;
    const coords = [];
    for (let i = 0; i < pixels.length; i += PIXEL_STEPS * 4) {
      if (pixels[i + 3] > 0) { const idx = i / 4; coords.push({ x: (idx % textW) + offsetX, y: Math.floor(idx / textW) + offsetY }); }
    }
    for (let i = coords.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [coords[i], coords[j]] = [coords[j], coords[i]]; }
    let pi = 0;
    for (const coord of coords) {
      let p;
      if (pi < ptParticles.length) { p = ptParticles[pi]; p.isKilled = false; }
      else {
        p = new Particle();
        p.pos.x = Math.random() * ptW;
        p.pos.y = Math.random() * ptH;
        // Faster on mobile so text forms before dispersal
        const isMobile = ptW < 600;
        p.maxSpeed = isMobile ? Math.random() * 3 + 2.5 : Math.random() * 1.5 + 1.0;
        p.maxForce = p.maxSpeed * (isMobile ? 0.06 : 0.03);
        p.colorBlendRate = isMobile ? Math.random() * 0.02 + 0.008 : Math.random() * 0.008 + 0.002;
        ptParticles.push(p);
      }
      p.startColor = { r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight, g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight, b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight };
      p.targetColor = PT_COLOR; p.colorWeight = 0; p.target.x = coord.x; p.target.y = coord.y; pi++;
    }
    for (let i = pi; i < ptParticles.length; i++) ptParticles[i].kill(ptW, ptH);
  }

  function animateParticleText() {
    ptCtx.clearRect(0, 0, ptW, ptH);
    for (let i = ptParticles.length - 1; i >= 0; i--) {
      const p = ptParticles[i]; p.move(); p.draw(ptCtx);
      if (p.isKilled) { if (p.pos.x < -50 || p.pos.x > ptW + 50 || p.pos.y < -50 || p.pos.y > ptH + 50) ptParticles.splice(i, 1); }
    }
    ptAnimId = requestAnimationFrame(animateParticleText);
  }

  setTimeout(() => { spawnText('ENTERING THE COSMOS'); animateParticleText(); }, 300);

  // --- Reveal ---
  const revealTL = gsap.timeline({ delay: 5 });
  revealTL
    .call(() => { ptParticles.forEach(p => { p.maxSpeed = Math.random() * 4 + 3; p.maxForce = p.maxSpeed * 0.08; p.kill(ptW, ptH); }); })
    .to('#preloader', { opacity: 0, duration: 0.6, delay: 1.2, ease: "power2.in",
      onComplete: () => { spiralTimeline.kill(); cancelAnimationFrame(ptAnimId); document.getElementById('preloader').style.display = 'none'; }
    })
    .to('.reveal-left', { xPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.1")
    .to('.reveal-right', { xPercent: 100, duration: 1, ease: "power4.inOut" }, "<")
    .call(() => {
      document.body.classList.remove('loading');
      document.querySelector('.reveal-left').style.display = 'none';
      document.querySelector('.reveal-right').style.display = 'none';
      window.heroEntrance();
    }, [], "-=0.4");
})();
