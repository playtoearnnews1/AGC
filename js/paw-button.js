// Paw Follow Button — original animation logic, re-clickable after 2s

(function() {
  var confettiColors = ['#39ff14', '#1aff00', '#00ff88', '#88ff00', '#00ffaa', '#44ff44'];

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function createConfetti(to) {
    var elem = document.createElement('i');
    elem.style.setProperty('--x', random(-260, 260) + 'px');
    elem.style.setProperty('--y', random(-160, 160) + 'px');
    elem.style.setProperty('--r', random(0, 360) + 'deg');
    elem.style.setProperty('--s', random(6, 10) / 10);
    elem.style.setProperty('--b', confettiColors[random(0, 5)]);
    to.appendChild(elem);
  }

  document.querySelectorAll('.paw-button').forEach(function(elem) {
    var cooldown = false;

    elem.addEventListener('click', function(e) {
      e.preventDefault();
      if (cooldown) return;

      if (!elem.classList.contains('animation')) {
        cooldown = true;
        elem.classList.add('animation');

        for (var i = 0; i < 60; i++) {
          createConfetti(elem);
        }

        setTimeout(function() {
          elem.classList.add('confetti');
          setTimeout(function() {
            elem.classList.add('liked');
            window.open(elem.href, '_blank');
          }, 400);
          setTimeout(function() {
            elem.querySelectorAll('i').forEach(function(el) { el.remove(); });
          }, 600);
        }, 260);

        // Reset after 2 seconds so it can be clicked again
        setTimeout(function() {
          elem.classList.remove('animation', 'liked', 'confetti');
          cooldown = false;
        }, 2000);

      }
    });
  });
})();
