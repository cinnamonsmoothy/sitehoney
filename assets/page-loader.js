(() => {
  'use strict';
  const loader = document.createElement('div');
  loader.className = 'honey-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Loading SiteHoney');
  loader.innerHTML = `<div class="honey-loader-content" aria-hidden="true">
    <div class="honey-loader-flight">
      <svg class="honey-loader-trail" viewBox="0 0 240 150"><path class="honey-loader-route" stroke="none" d="M120 75C32-8 1 126 65 112C113 102 121 36 178 38C245 40 216 143 120 75Z"/><path class="honey-loader-wake"/></svg>
      <svg class="honey-loader-bee" viewBox="0 0 96 78" fill="none" stroke="#201c13" stroke-width="2.7" stroke-linecap="round">
  <g fill="#fffdf6" stroke="currentColor" stroke-width="2.7">
    <g><path class="bee-wing bee-wing--left" d="M44 39 C36 35 26 33 21 25 C16 16 20 7 29 6 C39 5 45 17 46 28 C46 33 45 37 44 39 Z"/><animateTransform attributeName="transform" type="rotate" values="-13 44 39;14 44 39;-13 44 39" dur=".12s" repeatCount="indefinite"/></g>
    <g><path class="bee-wing bee-wing--right" d="M52 39 C60 35 70 33 75 25 C80 16 76 7 67 6 C57 5 51 17 50 28 C50 33 51 37 52 39 Z"/><animateTransform attributeName="transform" type="rotate" values="13 52 39;-14 52 39;13 52 39" dur=".105s" begin="-.052s" repeatCount="indefinite"/></g>
  </g>
  <!-- A subtly domed oval capsule: fuller and softer than a straight pill. -->
  <path d="M29 35 C18 35 11 43 11 53 C11 63 18 70 29 70 Q48 73 67 70 C78 70 85 63 85 53 C85 43 78 35 67 35 Q48 32 29 35 Z" fill="#ffd23f" stroke="currentColor" stroke-width="3"/>
  <!-- Balanced stripes, symmetrically spaced around the body's true centre. -->
  <path d="M41.5 35.2 Q40 52.5 41.5 69.6 M55.5 35.2 Q57 52.5 55.5 69.6" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
    </div>
    <p class="honey-loader-copy">A little buzz. Almost there.</p>
    <div class="honey-loader-dots"><i></i><i></i><i></i></div>
  </div>`;
  document.body.appendChild(loader);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bee = loader.querySelector('.honey-loader-bee');
  const path = loader.querySelector('.honey-loader-route');
  const wake = loader.querySelector('.honey-loader-wake');
  const pathLength = path.getTotalLength();
  let flightFrame;
  let flightStart = performance.now();
  function fly(now) {
    // Surge through the crossing, then ease around each loop without stopping.
    const laps = (now - flightStart) / 1700;
    const phase = laps % 1;
    const progress = phase + .045 * Math.sin(4 * Math.PI * phase);
    const distance = progress * pathLength;
    const point = path.getPointAtLength(distance);
    const behind = path.getPointAtLength((distance - 2 + pathLength) % pathLength);
    const ahead = path.getPointAtLength((distance + 2) % pathLength);
    // Bank into climbs and dives while keeping the landing page's bee upright.
    const bank = Math.atan2(ahead.y - behind.y, Math.abs(ahead.x - behind.x)) * 180 / Math.PI * .42;
    bee.style.transform = `translate(${point.x - 18}px, ${point.y - 14.625}px) rotate(${bank}deg)`;
    // Draw only the most recent stretch of flight, leaving a gap beneath the bee.
    const travelled = (Math.floor(laps) + progress) * pathLength;
    const tailEnd = travelled - 17;
    const tailStart = Math.max(0, tailEnd - 58);
    const trail = [];
    if (!reducedMotion.matches && tailEnd > tailStart) {
      for (let d = tailStart; d < tailEnd; d += 2) {
        const p = path.getPointAtLength(d % pathLength);
        trail.push(`${trail.length ? 'L' : 'M'}${p.x},${p.y}`);
      }
      const end = path.getPointAtLength(tailEnd % pathLength);
      trail.push(`L${end.x},${end.y}`);
    }
    wake.setAttribute('d', trail.join(' '));
    if (!loader.hidden && !reducedMotion.matches) flightFrame = requestAnimationFrame(fly);
  }
  function startFlight() {
    cancelAnimationFrame(flightFrame);
    flightStart = performance.now();
    if (reducedMotion.matches) bee.pauseAnimations();
    else bee.unpauseAnimations();
    fly(flightStart);
  }
  startFlight();
  let started = performance.now();
  let timer;
  let fallback;
  let previousOverflow;
  function lock() {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
  function reveal() {
    clearTimeout(fallback);
    clearTimeout(timer);
    timer = setTimeout(() => {
      loader.classList.add('is-leaving');
      document.documentElement.style.overflow = previousOverflow;
      timer = setTimeout(() => {
        loader.hidden = true;
        cancelAnimationFrame(flightFrame);
        bee.pauseAnimations();
      }, reducedMotion.matches ? 20 : 900);
    }, Math.max(0, (reducedMotion.matches ? 0 : 950) - (performance.now() - started)));
  }
  lock();
  // A slow third-party resource must never leave the page covered indefinitely.
  fallback = setTimeout(reveal, 4500);
  if (document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal, { once: true });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    clearTimeout(timer);
    started = performance.now();
    loader.hidden = false;
    loader.classList.remove('is-leaving');
    startFlight();
    lock();
    reveal();
  });
  reducedMotion.addEventListener('change', startFlight);
})();
