import { gsap } from 'gsap';

export function initScrollCurrent() {
  const root = document.querySelector('[data-scroll-current]');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const fill = root.querySelector('[data-current-fill]');
  const tip = root.querySelector('[data-current-tip]');
  const flare = root.querySelector('[data-current-flare]');
  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const contact = document.querySelector('#contact');
  const sections = [...document.querySelectorAll('main > section, main > .case-body'), ...(contact ? [contact] : [])];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const setFill = gsap.quickSetter(fill, 'scaleY');
  const setTip = gsap.quickSetter(tip, 'y', 'px');
  let active;
  let frame = 0;

  function update() {
    frame = 0;
    if (document.hidden) return;
    const headerHeight = header?.getBoundingClientRect().height || 74;
    root.style.top = `${headerHeight + 14}px`;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const progress = max ? gsap.utils.clamp(0, 1, scrollY / max) : 0;
    root.hidden = max < 1;
    setFill(progress);
    setTip(progress * root.clientHeight);
    root.dataset.progress = progress.toFixed(5);
    const focus = Math.max(headerHeight + 80, innerHeight * .34);
    const selected = progress >= .999 && contact ? contact : sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= focus && bounds.bottom > focus;
    });
    if (selected !== active) {
      const firstUpdate = active === undefined;
      active = selected;
      root.dataset.section = selected?.id || (selected?.classList.contains('hero') ? 'intro' : '');
      if (!firstUpdate && selected && !motion.matches) {
        gsap.fromTo(flare, { opacity: .85, scaleX: 1.4, scaleY: 1.35 }, { opacity: 0, scaleX: 1, scaleY: 1, duration: .55, ease: 'power2.out', overwrite: true });
      }
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  window.addEventListener('load', queue, { once: true });
  motion.addEventListener('change', () => { gsap.killTweensOf(flare); gsap.set(flare, { opacity: 0 }); queue(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame); frame = 0;
      gsap.killTweensOf(flare); gsap.set(flare, { opacity: 0 });
    } else queue();
  });
  const resize = new ResizeObserver(queue);
  for (const element of [main, contact, header]) if (element) resize.observe(element);
  document.fonts?.ready.then(queue);
  queue();
}
