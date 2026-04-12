// Evidence Log — 3-at-a-time slider with infinite scroll + lazy media

(function() {
  var slider = document.getElementById('evidenceSlider');
  if (!slider) return;

  var track = document.getElementById('evidenceTrack');
  var viewport = slider.querySelector('.evidence-viewport');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.evidence-card'));
  var prev = slider.querySelector('.evidence-prev');
  var next = slider.querySelector('.evidence-next');

  var ORIGINAL_COUNT = 5; // Number of unique items
  var position = 0;       // Current logical position (0 to ORIGINAL_COUNT - 1)
  var isAnimating = false;
  var mediaLoaded = false;
  var sectionVisible = false;

  // --- Lazy load all media once section is in view ---
  function loadAllMedia() {
    if (mediaLoaded) return;
    mediaLoaded = true;
    cards.forEach(function(card) {
      var media = card.querySelector('.evidence-media');
      if (!media || !media.dataset.src) return;
      if (media.tagName === 'VIDEO') {
        media.src = media.dataset.src;
        media.load();
      } else {
        media.src = media.dataset.src;
      }
    });
  }

  // --- Play videos that are currently visible in the viewport ---
  function playVisibleVideos() {
    if (!sectionVisible) {
      cards.forEach(function(card) {
        var v = card.querySelector('video.evidence-media');
        if (v) v.pause();
      });
      return;
    }

    var viewportRect = viewport.getBoundingClientRect();
    cards.forEach(function(card) {
      var v = card.querySelector('video.evidence-media');
      if (!v) return;
      var cardRect = card.getBoundingClientRect();
      // Card is at least partially visible within the viewport
      var visible = cardRect.right > viewportRect.left + 10 && cardRect.left < viewportRect.right - 10;
      if (visible) {
        var p = v.play();
        if (p && p.catch) p.catch(function() {});
      } else {
        v.pause();
      }
    });
  }

  // --- Get card width including gap ---
  function getCardStep() {
    if (cards.length < 2) return 0;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  // --- Apply transform based on position ---
  function applyTransform(animate) {
    var step = getCardStep();
    track.style.transition = animate ? '' : 'none';
    track.style.transform = 'translateX(' + (-position * step) + 'px)';
    if (!animate) {
      // Force reflow so removing the transition takes effect
      void track.offsetHeight;
      track.style.transition = '';
    }
  }

  // --- Navigate ---
  function go(direction) {
    if (isAnimating) return;
    isAnimating = true;

    position += direction;
    applyTransform(true);

    var onTransitionEnd = function() {
      track.removeEventListener('transitionend', onTransitionEnd);

      // Wrap around using the cloned cards
      if (position >= ORIGINAL_COUNT) {
        position = position - ORIGINAL_COUNT;
        applyTransform(false);
      } else if (position < 0) {
        position = position + ORIGINAL_COUNT;
        applyTransform(false);
      }

      isAnimating = false;
      playVisibleVideos();
    };
    track.addEventListener('transitionend', onTransitionEnd);
  }

  prev.addEventListener('click', function() { go(-1); });
  next.addEventListener('click', function() { go(1); });

  // --- Touch swipe ---
  var touchStartX = 0;
  viewport.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', function(e) {
    var touchEndX = e.changedTouches[0].clientX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
  }, { passive: true });

  // --- Recalculate on resize ---
  window.addEventListener('resize', function() {
    track.style.transition = 'none';
    applyTransform(false);
  });

  // --- Intersection observer for lazy loading + video play/pause ---
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        sectionVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          loadAllMedia();
          // Small delay to ensure media is ready
          setTimeout(playVisibleVideos, 300);
        } else {
          playVisibleVideos();
        }
      });
    }, { rootMargin: '100px', threshold: 0.1 });
    observer.observe(slider);
  } else {
    loadAllMedia();
    sectionVisible = true;
    setTimeout(playVisibleVideos, 300);
  }

  // Initialize
  applyTransform(false);
})();
