import { gsap } from 'gsap';

export function initWorkCardEnergy() {
  const stream = document.querySelector('[data-particle-stream]');
  if (!stream || stream.dataset.enhanced) return;
  stream.dataset.enhanced = 'true';
  const main = document.querySelector('.portfolio-main');
  const contact = document.querySelector('#contact');
  const sections = [...main.querySelectorAll(':scope > .section'), ...(contact ? [contact] : [])];
  const particles = [...stream.children];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cursor = { x: 0, y: 0, present: false };
  let card = null;
  let burst = null;
  let frame = 0;
  let scrolling = false;
  let scrollTimer;
  let touchStart = null;
  let touchCard = null;
  let touchTimer;
  const recent = new WeakMap();

  function power(next) {
    if (!next || card !== next) return;
    next.setAttribute('data-powered', '');
    document.dispatchEvent(new CustomEvent('portfolio:card-power', { detail: next }));
  }
  function stopBurst() {
    burst?.kill();
    burst = null;
    gsap.set(particles, { opacity: 0 });
    stream.dataset.state = 'idle';
  }
  function clear() {
    stopBurst();
    card?.removeAttribute('data-powered');
    card?.removeAttribute('data-energized');
    card?.removeAttribute('data-touch-energy');
    document.dispatchEvent(new CustomEvent('portfolio:card-power', { detail: null }));
    card = null;
  }
  function activate(next, touch = false, immediate = false) {
    if (next === card) {
      // Scrolling moves the page under a stationary mouse. Preserve the card
      // and canvas; only finish a travelling burst whose coordinates went stale.
      if (immediate && burst) { stopBurst(); power(next); }
      return;
    }
    clear();
    card = next;
    if (!next) return;
    next.setAttribute('data-energized', '');
    if (touch || immediate) {
      if (touch) next.setAttribute('data-touch-energy', '');
      power(next); return;
    }
    if (performance.now() - (recent.get(next) ?? -Infinity) < 900) { power(next); return; }
    recent.set(next, performance.now());
    const bounds = next.getBoundingClientRect();
    const header = document.querySelector('.site-header').getBoundingClientRect().bottom;
    const y = Math.max(header + 20, Math.min(innerHeight - 30, Math.max(bounds.top + 24, Math.min(bounds.bottom - 24, cursor.y))));
    const end = bounds.left - 5;
    // The stream travels in the open gutter. It never crosses another card or
    // the hero copy, even for a card in the second column.
    let start = Math.max(8, bounds.left - 190);
    main.querySelectorAll('[data-energy-card], .hero-copy').forEach(other => {
      if (other === next || other.contains(next)) return;
      const r = other.getBoundingClientRect();
      if (r.right <= bounds.left && r.top < y + 18 && r.bottom > y - 18) start = Math.max(start, r.right + 10);
    });
    if (end - start < 14) { power(next); return; }
    stream.dataset.state = 'streaming';
    burst = gsap.timeline({ onComplete: () => { stream.dataset.state = 'idle'; burst = null; } });
    particles.forEach((bit, i) => {
      const lane = Math.sin(i * 2.4) * 14;
      const delay = i * .017;
      const duration = .34 + (i % 3) * .035;
      gsap.set(bit, { x: start + (i % 3) * 5, y: y + lane, opacity: 0, scale: .65 });
      burst.to(bit, { opacity: i < 3 ? .95 : .7, scale: 1, duration: .07 }, delay)
        .to(bit, { x: end, y: y + lane * .28, duration, ease: 'power2.in' }, delay)
        .to(bit, { opacity: 0, scale: .3, duration: .12 }, delay + duration);
    });
    burst.call(() => power(next), [], .34);
  }
  function update() {
    frame = 0;
    if (document.hidden) return;
    const header = document.querySelector('.site-header').getBoundingClientRect().height;
    const focus = Math.max(header + 100, innerHeight * .34);
    const atEnd = contact && contact.getBoundingClientRect().top < innerHeight && scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
    const selected = atEnd ? contact : sections.find(section => {
      const r = section.getBoundingClientRect();
      return r.top <= focus && r.bottom > focus;
    });
    sections.forEach(section => section.toggleAttribute('data-illuminated', section === selected));
    const allowed = pointer.matches && !motion.matches && cursor.present && cursor.y > header;
    main.toggleAttribute('data-pointer-energy', allowed);
    const pointed = allowed ? document.elementFromPoint(cursor.x, cursor.y)?.closest('[data-energy-card]') : null;
    const heroPaused = pointed?.matches('.hero-feature') && pointed.querySelector('[data-feature-playback]')?.getAttribute('aria-pressed') === 'true';
    const tapped = !motion.matches && !scrolling && touchCard?.isConnected ? touchCard : null;
    activate(tapped || (pointed && main.contains(pointed) && !heroPaused ? pointed : null), !!tapped, scrolling);
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  document.addEventListener('pointermove', event => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    cursor.present = event.pointerType === 'mouse' && !event.target.closest('dialog');
    if (cursor.present) { touchCard = null; clearTimeout(touchTimer); }
    queue();
  }, { passive: true });
  // A tap expands immediately and gives one short electric response. Gestures
  // that become scrolling, a long press, or a cancelled touch do not activate it.
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now(), summary: event.target.closest('summary') };
  }, { passive: true });
  document.addEventListener('pointerup', event => {
    const start = touchStart;
    touchStart = null;
    if (!start || start.id !== event.pointerId || motion.matches || performance.now() - start.at > 650 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return;
    const summary = event.target.closest('summary');
    if (!summary || summary !== start.summary || summary.closest('dialog')) return;
    touchCard = summary.closest('[data-energy-card]');
    if (!touchCard || !main.contains(touchCard)) { touchCard = null; return; }
    clearTimeout(touchTimer);
    scrolling = false;
    queue();
    touchTimer = setTimeout(() => { touchCard = null; queue(); }, 1000);
  }, { passive: true });
  document.addEventListener('pointercancel', () => { touchStart = null; }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) { cursor.present = false; queue(); } });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') { cursor.present = false; touchCard = null; clearTimeout(touchTimer); queue(); } });
  window.addEventListener('scroll', () => {
    scrolling = true;
    touchCard = null; clearTimeout(touchTimer);
    clearTimeout(scrollTimer);
    queue();
    scrollTimer = setTimeout(() => { scrolling = false; queue(); }, 140);
  }, { passive: true });
  window.addEventListener('resize', () => { touchCard = null; clearTimeout(touchTimer); clear(); queue(); }, { passive: true });
  [motion, pointer].forEach(query => query.addEventListener('change', () => { cursor.present = false; touchCard = null; clearTimeout(touchTimer); clear(); queue(); }));
  document.addEventListener('portfolio:hero-motion', queue);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cursor.present = false; touchCard = null; clearTimeout(touchTimer); clear(); main.removeAttribute('data-pointer-energy'); }
    else queue();
  });
  const observer = new ResizeObserver(queue);
  observer.observe(main);
  if (contact) observer.observe(contact);
  queue();
}
