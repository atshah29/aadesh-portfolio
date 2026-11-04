import { gsap } from 'gsap';

export function initHeroAmbience() {
  const root = document.querySelector('[data-hero-ambience]');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const hero = root.closest('.hero');
  const field = root.querySelector('[data-ambience-field]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)');
  const compact = window.matchMedia('(max-width: 640px)');
  let visible = false;

  // Animate transforms only. Smaller screens need more travel to make the
  // movement perceptible without the desktop pointer response.
  function createDrift() {
    return gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { duration: compact.matches ? 12 : 24, ease: 'sine.inOut' } })
      .to(root.querySelector('[data-ambience-jade]'), { xPercent: compact.matches ? 18 : -7, yPercent: compact.matches ? 14 : 5, scale: 1.06, rotation: -6 }, 0)
      .to(root.querySelector('[data-ambience-blue]'), { xPercent: compact.matches ? -24 : 8, yPercent: compact.matches ? -10 : -4, scale: 1.08 }, 0)
      .to(root.querySelector('[data-ambience-ribbon]'), { xPercent: compact.matches ? 10 : -5, yPercent: 7, rotation: 5 }, 0);
  }
  let drift = createDrift();
  const xTo = gsap.quickTo(field, 'x', { duration: 1.2, ease: 'power3.out' });
  const yTo = gsap.quickTo(field, 'y', { duration: 1.2, ease: 'power3.out' });

  function resetPointer(immediate = false) {
    if (immediate) {
      xTo.tween.pause();
      yTo.tween.pause();
      gsap.set(field, { x: 0, y: 0 });
    } else {
      xTo(0);
      yTo(0);
    }
  }
  function sync() {
    const active = visible && !document.hidden && !motion.matches;
    root.dataset.motion = motion.matches ? 'static' : active ? 'running' : 'paused';
    if (motion.matches) drift.progress(0).pause();
    else drift.paused(!active);
    if (!active || !pointer.matches) resetPointer(true);
  }
  hero.addEventListener('pointermove', event => {
    if (!visible || document.hidden || motion.matches || !pointer.matches || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    xTo(x * 36);
    yTo(y * 24);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => resetPointer(motion.matches || !visible || document.hidden || !pointer.matches));
  motion.addEventListener('change', sync);
  pointer.addEventListener('change', sync);
  compact.addEventListener('change', () => {
    drift.revert();
    drift = createDrift();
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    sync();
  });
  observer.observe(hero);
  sync();
}
