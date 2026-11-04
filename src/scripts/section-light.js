import { gsap } from 'gsap';

export function initSectionLight() {
  const root = document.querySelector('[data-section-light]');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const main = root.closest('main');
  const sections = [...main.querySelectorAll(':scope > .section')];
  const anchor = root.querySelector('[data-section-light-anchor]');
  const current = main.querySelector('[data-section-current]');
  const currentPaths = [...current.querySelectorAll('path')];
  const lead = current.querySelector('.section-current-lead');
  let charge = null;
  const beacon = root.querySelector('.section-light-beacon');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const yTo = gsap.quickTo(anchor, 'y', { duration: 0.8, ease: 'power3.out' });
  const setSideY = gsap.quickSetter(anchor, 'y', 'px');
  const cursor = { x: 0, y: 0, present: false };
  let active = null;
  let energized = null;
  let mode = '';
  let targetY = NaN;
  let frame = 0;

  function energize(next) {
    if (next === energized) return false;
    charge?.kill();
    charge = null;
    gsap.set(lead, { opacity: 0 });
    current.removeAttribute('data-live');
    energized?.removeAttribute('data-powered');
    energized?.removeAttribute('data-energized');
    energized = next;
    energized?.setAttribute('data-energized', '');
    return true;
  }

  function update() {
    frame = 0;
    if (document.hidden) return;
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 74;
    const mainBounds = main.getBoundingClientRect();
    const pointerMode = finePointer.matches && cursor.present && !motion.matches && cursor.x >= 0 && cursor.x <= innerWidth && cursor.y >= header && cursor.y <= innerHeight && cursor.y >= mainBounds.top && cursor.y < mainBounds.bottom;
    const nextMode = motion.matches ? 'static' : pointerMode ? 'pointer' : 'follow';
    const focus = Math.max(header + 100, window.innerHeight * 0.34);
    const selected = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= focus && bounds.bottom > focus;
    }) || null;
    const pointedCard = pointerMode ? document.elementFromPoint(cursor.x, cursor.y)?.closest('[data-energy-card]') : null;
    const cardChanged = energize(pointedCard && main.contains(pointedCard) ? pointedCard : null);
    if (nextMode !== mode) {
      mode = nextMode;
      main.toggleAttribute('data-pointer-energy', pointerMode);
      root.dataset.mode = mode;
    }
    if (selected !== active) {
      active = selected;
      sections.forEach(section => section.toggleAttribute('data-illuminated', section === active));
      root.dataset.activeSection = active?.id || '';
    }
    // A single source stays on the rail. Desktop tracks the pointer directly;
    // touch and keyboard navigation retain the section-heading position.
    gsap.set(root, { opacity: pointerMode || active ? 1 : 0 });
    current.toggleAttribute('data-connected', !!energized);
    if (pointerMode) {
      yTo.tween.pause();
      targetY = NaN;
      setSideY(cursor.y - 140);
      if (energized) {
        const bounds = energized.getBoundingClientRect();
        const rail = beacon.getBoundingClientRect();
        const x = rail.left + rail.width / 2;
        const endX = Math.max(x + 6, bounds.left - 3);
        const endY = Math.max(bounds.top + 16, Math.min(bounds.bottom - 16, cursor.y));
        const bend = Math.min(14, (endX - x) / 3);
        // Distant columns receive current through the gutter above the card,
        // rather than drawing a wire through neighbouring cards or their text.
        const d = bounds.left - x > 100
          ? `M${x} ${cursor.y}V${Math.max(header + 6, bounds.top - 12)}H${bounds.left + 16}V${bounds.top - 3}`
          : `M${x} ${cursor.y}H${endX - bend}L${endX} ${endY}`;
        currentPaths.forEach(path => path.setAttribute('d', d));
        if (cardChanged) {
          const card = energized;
          const length = lead.getTotalLength();
          lead.style.strokeDasharray = `6 ${length + 6}`;
          charge = gsap.fromTo(lead, { strokeDashoffset: 6, opacity: 1 }, {
            strokeDashoffset: -length,
            duration: Math.min(.48, Math.max(.12, length / 1500)),
            ease: 'none',
            onComplete: () => {
              if (energized !== card) return;
              gsap.set(lead, { opacity: 0 });
              card.setAttribute('data-powered', '');
              current.setAttribute('data-live', '');
              charge = null;
            },
          });
        }
      }
      return;
    }
    if (!active) { yTo.tween.pause(); targetY = NaN; return; }
    const heading = active.querySelector('.sectionhead, h2').getBoundingClientRect();
    const center = Math.max(header + 100, Math.min(window.innerHeight * 0.5, heading.top + heading.height / 2));
    const nextY = center - 140;
    if (motion.matches) {
      yTo.tween.pause();
      gsap.set(anchor, { y: nextY });
    } else if (!Number.isFinite(targetY) || Math.abs(nextY - targetY) > 0.5) {
      yTo(nextY);
    }
    targetY = nextY;
  }
  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  document.addEventListener('pointermove', event => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    cursor.present = event.pointerType === 'mouse' && !(event.target instanceof Element && event.target.closest('dialog'));
    queue();
  }, { passive: true });
  document.addEventListener('pointerout', event => {
    if (!event.relatedTarget) { cursor.present = false; queue(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') { cursor.present = false; queue(); }
  });
  finePointer.addEventListener('change', () => { cursor.present = false; queue(); });
  motion.addEventListener('change', () => {
    yTo.tween.pause();
    gsap.killTweensOf(root);
    gsap.set(root, { opacity: active ? 1 : 0 });
    current.removeAttribute('data-connected');
    mode = '';
    targetY = NaN;
    queue();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      yTo.tween.pause();
      cursor.present = false;
      energize(null);
      mode = '';
      main.removeAttribute('data-pointer-energy');
      gsap.killTweensOf(root);
      current.removeAttribute('data-connected');
    } else {
      gsap.set(root, { opacity: active ? 1 : 0 });
      targetY = NaN;
      queue();
    }
  });
  const resize = new ResizeObserver(queue);
  resize.observe(main);
  queue();
}
