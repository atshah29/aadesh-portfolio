import { gsap } from 'gsap';

export function initFeaturedProjects() {
  const root = document.querySelector('[data-featured-carousel]');
  if (!root || root.dataset.enhanced) return;
  const slides = [...root.querySelectorAll('[data-feature-slide]')];
  const selectors = [...root.querySelectorAll('[data-feature-select]')];
  const playback = root.querySelector('[data-feature-playback]');
  const label = root.querySelector('[data-playback-label]');
  const counter = root.querySelector('[data-feature-index]');
  const progress = root.querySelector('[data-feature-progress]');
  const announcement = root.querySelector('[data-feature-announcement]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 7000;
  const illustrations = new Map();
  let current = 0;
  let userPaused = false;
  let pointerPaused = false;
  let focusPaused = false;
  let visible = false;
  let timer;

  root.dataset.enhanced = 'true';

  function illustration(index) {
    if (illustrations.has(index)) return illustrations.get(index);
    const slide = slides[index];
    const timeline = gsap.timeline({ paused: true, repeat: -1 });
    const prediction = slide.querySelector('[data-prediction-pulse]');
    const optimizer = slide.querySelector('[data-optimizer-pulse]');
    const wave = slide.querySelector('[data-audio-wave]');
    const route = slide.querySelector('.feature-route');
    if (prediction) {
      const stages = [...slide.querySelectorAll('.pipeline-stage')];
      const predictor = slide.querySelector('.pipeline-predictor');
      const producer = slide.querySelector('[data-producer-instruction]');
      const dependent = slide.querySelector('[data-dependent-instruction]');
      const validation = slide.querySelector('[data-pipeline-validation]');
      const length = prediction.getTotalLength();
      // A conceptual cycle: a confident prediction makes consumers ready before
      // the producer finishes; execution validates it, and retirement trains it.
      timeline.to(stages[0], { stroke: '#b9e4c9', duration: 0.3 }, 0)
        .to(stages[1], { stroke: '#b9e4c9', duration: 0.3 }, 0.35)
        .to(predictor, { stroke: '#b9e4c9', fill: '#29453f', duration: 0.3 }, 0.7)
        .fromTo(prediction, { strokeDasharray: `24 ${length}`, strokeDashoffset: length + 24, opacity: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'none' }, 0.85)
        .to(prediction, { opacity: 0, duration: 0.2 }, 1.65)
        .to(stages[2], { stroke: '#b9e4c9', duration: 0.25 }, 1.45)
        .to(dependent, { fill: '#b9e4c9', duration: 0.3 }, 1.65)
        .to(producer, { fill: '#b9e4c9', duration: 0.3 }, 2.3)
        .to(stages[3], { stroke: '#b9e4c9', duration: 0.25 }, 2.65)
        .to(validation, { opacity: 1, duration: 0.25 }, 2.8)
        .to(stages[4], { stroke: '#b9e4c9', duration: 0.3 }, 3.1)
        .to(stages, { stroke: '#466663', duration: 0.5 }, 4.1)
        .to(predictor, { stroke: '#658778', fill: '#172b2d', duration: 0.5 }, 4.1)
        .to([producer, dependent], { fill: '#466663', duration: 0.5 }, 4.1)
        .to(validation, { opacity: 0.25, duration: 0.5 }, 4.1);
    } else if (optimizer) {
      timeline.fromTo(optimizer, { strokeDashoffset: 390 }, { strokeDashoffset: -45, duration: 3.2, ease: 'none' }, 0);
      timeline.fromTo(slide.querySelectorAll('[data-optimizer-node] rect'), { stroke: '#466663' }, { stroke: '#b9e4c9', duration: 0.55, stagger: 0.55, repeat: 1, yoyo: true }, 0);
    } else if (wave) {
      timeline.fromTo(wave, { strokeDashoffset: 420 }, { strokeDashoffset: 0, duration: 3.2, ease: 'none' }, 0);
      timeline.to(slide.querySelectorAll('[data-mel-bins] rect'), { opacity: 0.25, duration: 0.45, stagger: 0.12, repeat: 3, yoyo: true }, 0);
    } else if (route) {
      const distance = route.getTotalLength();
      const position = { progress: 0 };
      const point = slide.querySelector('[data-vehicle-point]');
      const halo = slide.querySelector('[data-vehicle-halo]');
      timeline.to(position, { progress: 1, duration: 5.5, ease: 'none', onUpdate: () => {
        const at = route.getPointAtLength(distance * position.progress);
        for (const marker of [point, halo]) {
          marker.setAttribute('cx', String(at.x));
          marker.setAttribute('cy', String(at.y));
        }
      }});
    }
    illustrations.set(index, timeline);
    return timeline;
  }

  function clearClock() {
    window.clearTimeout(timer);
    timer = undefined;
    gsap.killTweensOf(progress);
    gsap.set(progress, { scaleX: 0 });
  }
  function sync() {
    clearClock();
    const canAnimate = !motion.matches && !userPaused && visible && !document.hidden;
    const canRotate = canAnimate && !pointerPaused && !focusPaused;
    root.dataset.playing = String(canRotate);
    playback.disabled = motion.matches;
    playback.setAttribute('aria-pressed', String(userPaused || motion.matches));
    playback.setAttribute('aria-label', motion.matches ? 'Automatic rotation disabled for reduced motion' : userPaused ? 'Resume automatic rotation and animation' : 'Pause automatic rotation and animation');
    label.textContent = motion.matches ? 'Manual' : userPaused ? 'Play' : 'Pause';
    illustrations.forEach((timeline, index) => { if (index !== current || !canAnimate) timeline.pause(); });
    if (canAnimate) illustration(current).play();
    if (canRotate) {
      gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: interval / 1000, ease: 'none' });
      timer = window.setTimeout(() => select((current + 1) % slides.length), interval);
    }
  }
  function select(index, manual = false) {
    const next = (index + slides.length) % slides.length;
    if (next === current) { sync(); return; }
    illustrations.get(current)?.pause();
    current = next;
    slides.forEach((slide, i) => {
      gsap.killTweensOf(slide);
      gsap.set(slide, { clearProps: 'opacity,transform,visibility' });
      slide.hidden = i !== current;
      slide.inert = i !== current;
    });
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (!motion.matches) gsap.fromTo(slides[current], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', clearProps: 'opacity,transform' });
    if (manual) announcement.textContent = `${current + 1} of ${slides.length}: ${slides[current].dataset.title}`;
    sync();
  }
  selectors.forEach((button, index) => button.addEventListener('click', () => select(index, true)));
  playback.addEventListener('click', () => {
    userPaused = !userPaused;
    // Explicitly pressing Play can resume even while the control has focus.
    if (!userPaused) { focusPaused = false; pointerPaused = false; }
    sync();
  });
  root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { pointerPaused = true; sync(); } });
  root.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { pointerPaused = false; sync(); } });
  root.addEventListener('focusin', () => { focusPaused = true; sync(); });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) { focusPaused = false; sync(); } });
  root.addEventListener('keydown', event => {
    const index = selectors.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % slides.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + slides.length) % slides.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = slides.length - 1;
    else return;
    event.preventDefault();
    selectors[next].focus();
    select(next, true);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      slides.forEach(slide => { gsap.killTweensOf(slide); gsap.set(slide, { clearProps: 'opacity,transform,visibility' }); });
    }
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35);
    sync();
  }, { threshold: [0, 0.35] });
  observer.observe(root);
  sync();
}
