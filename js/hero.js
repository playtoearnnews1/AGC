// Anti-gravity particle system + hero entrance animation

(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const heroEl = document.getElementById('hero');
  let w, h;

  const PARTICLE_DENSITY = 0.00015;
  const BG_PARTICLE_DENSITY = 0.00005;
  const MOUSE_RADIUS = 180;
  const RETURN_SPEED = 0.08;
  const DAMPING = 0.90;
  const REPULSION_STRENGTH = 1.2;

  let mainParticles = [];
  let bgParticles = [];
  const mouse = { x: -1000, y: -1000, isActive: false };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = heroEl.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles() {
    const count = Math.floor(w * h * PARTICLE_DENSITY);
    mainParticles = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      mainParticles.push({
        x, y, originX: x, originY: y,
        vx: 0, vy: 0,
        size: Math.random() * 1.5 + 1,
        isGreen: Math.random() > 0.88,
      });
    }

    const bgCount = Math.floor(w * h * BG_PARTICLE_DENSITY);
    bgParticles = [];
    for (let i = 0; i < bgCount; i++) {
      bgParticles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const pulseOpacity = Math.sin(time * 0.0008) * 0.015 + 0.025;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    grd.addColorStop(0, `rgba(57, 255, 20, ${pulseOpacity})`);
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    for (const p of bgParticles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
      ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const p of mainParticles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (mouse.isActive && dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * REPULSION_STRENGTH;
        p.vx -= (dx / dist) * force * 5;
        p.vy -= (dy / dist) * force * 5;
      }
      p.vx += (p.originX - p.x) * RETURN_SPEED;
      p.vy += (p.originY - p.y) * RETURN_SPEED;
      p.vx *= DAMPING; p.vy *= DAMPING;
      p.x += p.vx; p.y += p.vy;

      const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const opacity = Math.min(0.3 + vel * 0.1, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.isGreen
        ? `rgba(57, 255, 20, ${Math.min(opacity + 0.2, 1)})`
        : `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  heroEl.style.cursor = 'crosshair';
  heroEl.addEventListener('mousemove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.isActive = true;
  });
  heroEl.addEventListener('mouseleave', () => { mouse.isActive = false; });

  resize();
  requestAnimationFrame(animate);
  window.addEventListener('resize', resize);
})();

// Hero badge glitch effect — every 6 seconds
(function() {
  var badge = document.getElementById('heroBadge');
  if (!badge) return;
  setInterval(function() {
    badge.classList.add('glitching');
    setTimeout(function() { badge.classList.remove('glitching'); }, 450);
  }, 6000);
})();

// Hero entrance — called by preloader after reveal
window.heroEntrance = function() {
  document.querySelector('.hero-content').style.visibility = 'visible';
  const tl = gsap.timeline();
  tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" })
    .from('.hero-title', { opacity: 0, y: 40, scale: 0.95, duration: 1, ease: "power3.out" }, "-=0.4")
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, "-=0.5")
    .from('.hero-cta, .hero-cta-secondary', { opacity: 0, y: 20, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "-=0.4");
};
