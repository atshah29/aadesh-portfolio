import { gsap } from 'gsap';

export function initSectionLight() {
  const root = document.querySelector('[data-section-light]');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const main = root.closest('main');
  const sections = [...main.querySelectorAll(':scope > .section')];
  const anchor = root.querySelector('[data-section-light-anchor]');
  const lamp = main.querySelector('[data-section-lamp]');
  const lampField = lamp.querySelector('[data-section-lamp-field]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const yTo = gsap.quickTo(anchor, 'y', { duration: 0.8, ease: 'power3.out' });
  const setLampX = gsap.quickSetter(lampField, 'x', 'px');
  const setLampY = gsap.quickSetter(lampField, 'y', 'px');
  const cursor = { x: 0, y: 0, present: false };
  let active = null;
  let mode = '';
  let targetY = NaN;
  let frame = 0;

  function update() {
    frame = 0;
    if (document.hidden) return;
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 74;
    const mainBounds = main.getBoundingClientRect();
    const pointerMode = finePointer.matches && cursor.present && !motion.matches && cursor.x >= 0 && cursor.x <= innerWidth && cursor.y >= header && cursor.y <= innerHeight && cursor.y >= mainBounds.top && cursor.y < mainBounds.bottom;
    const nextMode = motion.matches ? 'static' : pointerMode ? 'pointer' : 'follow';
    const focus = pointerMode ? cursor.y : Math.max(header + 100, window.innerHeight * 0.34);
    const selected = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= focus && bounds.bottom > focus;
    }) || null;
    if (nextMode !== mode) {
      mode = nextMode;
      main.toggleAttribute('data-pointer-lamp', pointerMode);
      if (motion.matches) {
        gsap.killTweensOf(lamp);
        gsap.set(lamp, { opacity: 0 });
      } else {
        gsap.to(lamp, { opacity: pointerMode ? 1 : 0, duration: 0.18, overwrite: true });
      }
      root.dataset.mode = mode;
    }
    if (selected !== active) {
      active = selected;
      sections.forEach(section => section.toggleAttribute('data-illuminated', section === active));
      root.dataset.activeSection = active?.id || '';
      gsap.to(root, { opacity: active ? 1 : 0, duration: motion.matches ? 0 : 0.45, overwrite: true });
    }
    if (pointerMode) {
      // Direct setters keep the light centered on the cursor, with no trailing
      // position tween. Pointer events are coalesced to one update per frame.
      setLampX(cursor.x - 210);
      setLampY(cursor.y - 210);
      yTo.tween.pause();
      targetY = NaN;
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
    gsap.killTweensOf([root, lamp]);
    gsap.set(root, { opacity: active ? 1 : 0 });
    gsap.set(lamp, { opacity: 0 });
    mode = '';
    targetY = NaN;
    queue();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      yTo.tween.pause();
      cursor.present = false;
      mode = '';
      main.removeAttribute('data-pointer-lamp');
      gsap.killTweensOf([root, lamp]);
      gsap.set(lamp, { opacity: 0 });
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
