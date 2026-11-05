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
  const recent = new WeakMap();

  function power(next) {
    if (!next || card !== next) return;
    next.setAttribute('data-powered', '');
    document.dispatchEvent(new CustomEvent('portfolio:card-power', { detail: next }));
  }
  function clear() {
    burst?.kill();
    burst = null;
    gsap.set(particles, { opacity: 0 });
    stream.dataset.state = 'idle';
    card?.removeAttribute('data-powered');
    card?.removeAttribute('data-energized');
    document.dispatchEvent(new CustomEvent('portfolio:card-power', { detail: null }));
    card = null;
  }
  function activate(next) {
    if (next === card) return;
    clear();
    card = next;
    if (!next) return;
    next.setAttribute('data-energized', '');
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
    const allowed = pointer.matches && !motion.matches && cursor.present && !scrolling && cursor.y > header;
    main.toggleAttribute('data-pointer-energy', allowed);
    const pointed = allowed ? document.elementFromPoint(cursor.x, cursor.y)?.closest('[data-energy-card]') : null;
    const heroPaused = pointed?.matches('.hero-feature') && pointed.querySelector('[data-feature-playback]')?.getAttribute('aria-pressed') === 'true';
    activate(pointed && main.contains(pointed) && !heroPaused ? pointed : null);
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  document.addEventListener('pointermove', event => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    cursor.present = event.pointerType === 'mouse' && !event.target.closest('dialog');
    queue();
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) { cursor.present = false; queue(); } });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') { cursor.present = false; queue(); } });
  window.addEventListener('scroll', () => {
    scrolling = true;
    clearTimeout(scrollTimer);
    queue();
    scrollTimer = setTimeout(() => { scrolling = false; queue(); }, 140);
  }, { passive: true });
  window.addEventListener('resize', () => { clear(); queue(); }, { passive: true });
  [motion, pointer].forEach(query => query.addEventListener('change', () => { cursor.present = false; clear(); queue(); }));
  document.addEventListener('portfolio:hero-motion', queue);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cursor.present = false; clear(); main.removeAttribute('data-pointer-energy'); }
    else queue();
  });
  const observer = new ResizeObserver(queue);
  observer.observe(main);
  if (contact) observer.observe(contact);
  queue();
}
