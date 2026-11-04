import { gsap } from 'gsap';

export function initSectionLight() {
  const root = document.querySelector('[data-section-light]');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const main = root.closest('main');
  const sections = [...main.querySelectorAll(':scope > .section')];
  const anchor = root.querySelector('[data-section-light-anchor]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const yTo = gsap.quickTo(anchor, 'y', { duration: 0.8, ease: 'power3.out' });
  let active = null;
  let targetY = NaN;
  let frame = 0;

  function update() {
    frame = 0;
    if (document.hidden) return;
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 74;
    const focus = Math.max(header + 100, window.innerHeight * 0.34);
    const selected = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= focus && bounds.bottom > focus;
    }) || null;
    if (selected !== active) {
      active = selected;
      sections.forEach(section => section.toggleAttribute('data-illuminated', section === active));
      root.dataset.activeSection = active?.id || '';
      gsap.to(root, { opacity: active ? 1 : 0, duration: motion.matches ? 0 : 0.45, overwrite: true });
    }
    root.dataset.mode = motion.matches ? 'static' : 'follow';
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
  motion.addEventListener('change', () => {
    yTo.tween.pause();
    gsap.killTweensOf(root);
    gsap.set(root, { opacity: active ? 1 : 0 });
    targetY = NaN;
    queue();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      yTo.tween.pause();
      gsap.killTweensOf(root);
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
