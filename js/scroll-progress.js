// Scroll progress bar with asteroid handle

const scrollFill = document.getElementById('scrollFill');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollFill.style.width = progress + '%';
}, { passive: true });
