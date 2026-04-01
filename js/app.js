// Scroll to top on refresh
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(20);
}
