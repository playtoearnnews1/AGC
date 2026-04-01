// Fortune Cookie — alien cat edition

(function() {
  var fortunes = [
    // Positive
    "A mysterious green light will guide your next decision. Trust it.",
    "The cosmos has checked your vibe. You passed. Big things are coming.",
    "You were early once and didn't know it. This time you know.",
    "Your patience will be rewarded with something the impatient will never understand.",
    "A community of legends is forming. You're already in it.",
    // Roast
    "You will sell before the token moons. As is tradition.",
    "The cat has looked into your wallet. It laughed. Then it cried.",
    "Somewhere in a parallel universe, you sold at the right time. Not this one though.",
    "You will tell your family at dinner you missed out on the green alien cat. Nobody will speak to you for a week.",
    "You will check the chart 100 times today. The one hour you leave it alone, it will moon."
  ];

  var cookie = document.getElementById('fortuneCookie');
  var result = document.getElementById('fortuneResult');
  var text = document.getElementById('fortuneText');
  var tooltip = document.getElementById('fortuneTooltip');

  function crackCookie() {
    cookie.classList.add('cracked');
    tooltip.classList.remove('visible');

    setTimeout(function() {
      cookie.style.display = 'none';
      text.textContent = fortunes[Math.floor(Math.random() * fortunes.length)];
      result.classList.add('visible');
    }, 400);
  }

  cookie.addEventListener('click', crackCookie);

  // Tooltip appears on scroll
  ScrollTrigger.create({
    trigger: '#fortune-section',
    start: 'top 80%',
    once: true,
    onEnter: function() {
      tooltip.classList.add('visible');
    }
  });
})();
