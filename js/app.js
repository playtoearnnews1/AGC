// Scroll to top on refresh
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Smooth scroll for all anchor links
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var id = link.getAttribute('href');
  if (id === '#' || id.length < 2) return;
  var target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(20);
}
