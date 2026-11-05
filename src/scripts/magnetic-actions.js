import { gsap } from 'gsap';

export function initMagneticActions() {
  const query = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.hero .actions .btn, .links .resume, .contact-email').forEach(action => {
    const xTo = gsap.quickTo(action, 'x', { duration: .28, ease: 'power3.out' });
    const yTo = gsap.quickTo(action, 'y', { duration: .28, ease: 'power3.out' });
    const reset = () => { xTo(0); yTo(0); };
    const sync = () => {
      action.toggleAttribute('data-magnetic', query.matches && !motion.matches);
      xTo.tween.pause(); yTo.tween.pause(); gsap.set(action, { x: 0, y: 0 });
    };
    sync();
    action.addEventListener('pointermove', event => {
      if (!query.matches || motion.matches || event.pointerType !== 'mouse') return;
      const r = action.getBoundingClientRect();
      xTo(gsap.utils.clamp(-4, 4, (event.clientX - r.left - r.width / 2) * .08));
      yTo(gsap.utils.clamp(-3, 3, (event.clientY - r.top - r.height / 2) * .12));
    }, { passive: true });
    action.addEventListener('pointerleave', reset);
    action.addEventListener('blur', reset);
    [query, motion].forEach(media => media.addEventListener('change', sync));
  });
}
