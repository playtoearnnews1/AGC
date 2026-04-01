// Branching adventure: start screen, typewriter, cinematic transitions, alien symbols

gsap.registerPlugin(ScrollTrigger);

(function() {
  var viewport = document.getElementById('adventureViewport');
  var isTransitioning = false;
  var typewriterTimer = null;

  // --- Typewriter effect ---
  function typewrite(el, text, speed, callback) {
    el.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.appendChild(cursor);

    var i = 0;
    var charSpeed = speed || 18;

    function tick() {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        typewriterTimer = setTimeout(tick, charSpeed);
      } else {
        cursor.remove();
        if (callback) callback();
      }
    }
    tick();
  }

  // --- Show choices with fade ---
  function revealChoices(cardEl) {
    var choices = cardEl.querySelector('.adventure-choices');
    if (choices) choices.classList.add('visible');
  }

  // --- Alien symbol renderer ---
  function renderAlienSymbols(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    if (w === 0 || h === 0) return;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'square';
    var cellSize = 40, unit = cellSize * 0.2, r = 0.3, sz = 5;
    for (var x = cellSize / 2; x < w; x += cellSize) {
      for (var y = cellSize / 2; y < h; y += cellSize) {
        ctx.save();
        ctx.translate(x, y);
        if (Math.random() > r) {
          if (Math.random() > r) { ctx.beginPath(); ctx.moveTo(-unit, 0); ctx.lineTo(unit, 0); ctx.stroke(); }
          if (Math.random() > r) { ctx.beginPath(); ctx.moveTo(0, -unit); ctx.lineTo(0, unit); ctx.stroke(); }
        } else {
          if (Math.random() > r) { ctx.beginPath(); ctx.moveTo(-unit, -unit); ctx.lineTo(unit, unit); ctx.stroke(); }
          if (Math.random() > r) { ctx.beginPath(); ctx.moveTo(-unit, unit); ctx.lineTo(unit, -unit); ctx.stroke(); }
        }
        if (Math.random() > r) {
          if (Math.random() > r + 0.2) { ctx.strokeRect(-sz, -sz, sz * 2, sz * 2); }
          else { var rad = unit * 1.2; if (Math.random() > r) { ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.stroke(); } }
        }
        if (Math.random() > r) { ctx.beginPath(); ctx.arc(0, 0, sz / 2, 0, Math.PI * 2); ctx.stroke(); }
        for (var k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); if (Math.random() > r + 0.3) { ctx.beginPath(); ctx.arc(-unit * 1.4, 0, sz / 2, 0, Math.PI * 2); ctx.stroke(); } }
        ctx.restore();
      }
    }
  }

  // --- Skip: instantly complete typewriter for this card ---
  function skipTypewriter(cardEl) {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    typewriterTimer = null;
    var textEl = cardEl.querySelector('.adventure-card-text');
    var skipBtn = cardEl.querySelector('.adventure-skip');
    if (textEl && textEl.dataset.story) {
      textEl.textContent = textEl.dataset.story;
    }
    if (skipBtn) skipBtn.classList.add('hidden');
    revealChoices(cardEl);
  }

  // --- Activate a card: typewriter + symbols ---
  function activateCard(cardEl) {
    var textEl = cardEl.querySelector('.adventure-card-text');
    var choices = cardEl.querySelector('.adventure-choices');
    var canvas = cardEl.querySelector('.alien-symbols');
    var skipBtn = cardEl.querySelector('.adventure-skip');

    if (choices) choices.classList.remove('visible');
    if (skipBtn) skipBtn.classList.remove('hidden');
    if (typewriterTimer) clearTimeout(typewriterTimer);

    var storyText = textEl ? textEl.dataset.story : '';

    if (textEl && storyText) {
      typewrite(textEl, storyText, 18, function() {
        if (skipBtn) skipBtn.classList.add('hidden');
        revealChoices(cardEl);
      });
    } else if (choices) {
      choices.classList.add('visible');
      if (skipBtn) skipBtn.classList.add('hidden');
    }

    if (canvas) setTimeout(function() { renderAlienSymbols(canvas); }, 50);
  }

  // --- Prepare card before showing (clear text, hide choices) ---
  function prepareCard(cardEl) {
    var textEl = cardEl.querySelector('.adventure-card-text');
    var choices = cardEl.querySelector('.adventure-choices');
    var skipBtn = cardEl.querySelector('.adventure-skip');
    if (textEl) textEl.textContent = '';
    if (choices) choices.classList.remove('visible');
    if (skipBtn) skipBtn.classList.remove('hidden');
  }

  // --- Scroll to viewport top ---
  function snapToViewport() {
    var top = viewport.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  // --- Cinematic transition ---
  function goToCard(targetId) {
    if (isTransitioning) return;

    var currentEl = viewport.querySelector('.active');
    var targetEl = viewport.querySelector('[data-card="' + targetId + '"]');
    if (!currentEl || !targetEl || currentEl === targetEl) return;

    isTransitioning = true;
    if (typewriterTimer) clearTimeout(typewriterTimer);

    var isStart = currentEl.classList.contains('adventure-start');

    // Get content panels for separate animation
    var curImg = currentEl.querySelector('.adventure-card-content .adventure-card-img');
    var curBody = currentEl.querySelector('.adventure-card-content .adventure-card-body');
    var curHeader = currentEl.querySelector('.adventure-card-header');
    var tarImg = targetEl.querySelector('.adventure-card-content .adventure-card-img');
    var tarBody = targetEl.querySelector('.adventure-card-content .adventure-card-body');
    var tarHeader = targetEl.querySelector('.adventure-card-header');

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        activateCard(targetEl);
      }
    });

    if (isStart) {
      // Start screen: zoom in + fade
      tl.to(currentEl, {
        scale: 1.1, opacity: 0, duration: 0.6, ease: 'power2.in',
        onComplete: function() {
          currentEl.classList.remove('active');
          gsap.set(currentEl, { clearProps: 'all' });
        }
      });
    } else {
      // Card exit: header fades, image slides left, body slides right
      if (curHeader) tl.to(curHeader, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 0);
      if (curImg) tl.to(curImg, { x: '-10%', opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);
      if (curBody) tl.to(curBody, { x: '10%', opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);
      tl.call(function() {
        currentEl.classList.remove('active');
        gsap.set([curImg, curBody, curHeader].filter(Boolean), { clearProps: 'all' });
      });
    }

    // Card enter — clear stale content first, then show
    tl.call(function() {
      prepareCard(targetEl);
      targetEl.classList.add('active');
      snapToViewport();
    });

    // Header fades in, image from left, body from right
    if (tarHeader) {
      tl.fromTo(tarHeader, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
    if (tarImg) {
      tl.fromTo(tarImg, { x: '-8%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }, '<');
    }
    if (tarBody) {
      tl.fromTo(tarBody, { x: '8%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }, '<0.1');
    }
    if (!tarImg && !tarBody) {
      tl.fromTo(targetEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }

  // --- Event delegation ---
  viewport.addEventListener('click', function(e) {
    var startBtn = e.target.closest('.adventure-start-btn');
    if (startBtn) { goToCard(startBtn.dataset.goto); return; }

    var skipBtn = e.target.closest('.adventure-skip');
    if (skipBtn) {
      var card = skipBtn.closest('.adventure-card');
      if (card) skipTypewriter(card);
      return;
    }

    var btn = e.target.closest('.adventure-btn');
    if (btn && btn.dataset.goto) { goToCard(btn.dataset.goto); }
  });
})();
