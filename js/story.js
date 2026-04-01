// Story section: header reveal + horizontal scroll + card animations

gsap.registerPlugin(ScrollTrigger);

// Story header reveal
gsap.from('.story-label', {
  opacity: 0, y: 30, duration: 0.8,
  scrollTrigger: { trigger: '.story-header', start: 'top 80%' }
});
gsap.from('.story-title', {
  opacity: 0, y: 40, duration: 1,
  scrollTrigger: { trigger: '.story-header', start: 'top 75%' }
});

// Horizontal scroll
const panels = gsap.utils.toArray('.story-panel');
const track = document.querySelector('.story-track');
const progressDots = document.querySelectorAll('.story-dot');
const progressContainer = document.getElementById('storyProgress');

const storyScroll = gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: '.story-track-wrapper',
    pin: true,
    scrub: 1,
    end: () => "+=" + (track.scrollWidth - window.innerWidth),
    onEnter: () => progressContainer.classList.add('active'),
    onLeave: () => progressContainer.classList.remove('active'),
    onEnterBack: () => progressContainer.classList.add('active'),
    onLeaveBack: () => progressContainer.classList.remove('active'),
    onUpdate: (self) => {
      const activeIndex = Math.min(3, Math.floor(self.progress * 4));
      progressDots.forEach((dot, i) => { dot.classList.toggle('active', i === activeIndex); });
    }
  }
});

// Card entrance animations
panels.forEach((panel) => {
  const stepNum = panel.querySelector('.story-step-number');
  const inner = panel.querySelector('.story-card-inner');
  const orb = panel.querySelector('.story-orb');

  gsap.from(stepNum, {
    opacity: 0, x: -60, duration: 0.8, ease: "power3.out",
    scrollTrigger: { trigger: panel, containerAnimation: storyScroll, start: "left 70%", toggleActions: "play none none reverse" }
  });

  gsap.from(inner, {
    opacity: 0, y: 40, scale: 0.96, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: panel, containerAnimation: storyScroll, start: "left 65%", toggleActions: "play none none reverse" }
  });

  if (orb) {
    gsap.from(orb, {
      opacity: 0, scale: 0.5, duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: panel, containerAnimation: storyScroll, start: "left 80%", toggleActions: "play none none reverse" }
    });
  }
});
