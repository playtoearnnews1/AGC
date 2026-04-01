// Divider particles
(function() {
  const container = document.getElementById('dividerParticles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'divider-particle';
    p.style.left = (8 + Math.random() * 84) + '%';
    p.style.top = '50%';
    p.style.animationDelay = (Math.random() * 3) + 's';
    p.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(p);
  }
})();

// Footer animation: arm pushes ball to center, content fades in

(function() {
  const footer = document.getElementById('footer');
  const arm = document.getElementById('footerArm');
  const ball = document.getElementById('footerBall');
  const content = document.getElementById('footerContent');
  const stage = document.querySelector('.footer-stage');

  function getCenterX() {
    const stageW = stage.offsetWidth;
    const ballW = ball.offsetWidth;
    return (stageW - ballW) / 2;
  }

  // Hide each reveal element individually
  var reveals = content.querySelectorAll('.footer-reveal');
  gsap.set(reveals, { opacity: 0, y: 20 });

  ScrollTrigger.create({
    trigger: footer,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      // Fade in arm
      gsap.to(arm, { opacity: 1, duration: 0.4, ease: 'power2.out' });

      // After arm appears, trigger the push
      gsap.delayedCall(0.5, () => {
        stage.classList.add('playing');

        // Ball slides to center
        gsap.to(ball, {
          left: getCenterX(),
          duration: 2,
          delay: 0.25,
          ease: 'power2.out',
        });

        // Ball glow on arrival
        gsap.to(ball, {
          boxShadow: '0 0 30px rgba(57,255,20,0.4), 0 0 60px rgba(57,255,20,0.2)',
          borderColor: 'rgba(57,255,20,0.5)',
          duration: 0.5,
          delay: 1.8,
          ease: 'power2.out',
        });


        // Content reveals one by one
        gsap.to(reveals, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 2.1,
          stagger: 0.2,
          ease: 'power3.out',
        });
      });
    }
  });

  // Recalculate on resize if animation already played
  window.addEventListener('resize', () => {
    if (stage.classList.contains('playing')) {
      gsap.set(ball, { left: getCenterX() });
    }
  });
})();
