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

  gsap.set(content, { opacity: 0, y: 30 });

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


        // Content fades in
        gsap.to(content, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 1.5,
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
