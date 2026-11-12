import { gsap } from 'gsap';
import { createDiagramExplorer } from './featured-exploration';

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
  const illustrationContexts = new Map();
  const explorers = new Map();
  let current = 0;
  let userPaused = false;
  let exploring = false;
  let manualHold = false;
  let pointerPaused = false;
  let focusPaused = false;
  let visible = false;
  let timer;

  root.dataset.enhanced = 'true';

  function illustration(index) {
    if (illustrations.has(index)) return illustrations.get(index);
    const slide = slides[index];
    let timeline;
    const context = gsap.context(() => {
      timeline = gsap.timeline({ paused: true, repeat: -1 });
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
        // A conceptual cycle: a confident prediction makes consumers ready before
        // the producer finishes; execution validates it, and retirement trains it.
        const stageCycle = gsap.timeline({ repeat: -1 });
        stageCycle.to(stages[0], { stroke: '#b9e4c9', duration: 0.3 }, 0)
          .to(stages[1], { stroke: '#b9e4c9', duration: 0.3 }, 0.35)
          .to(predictor, { stroke: '#b9e4c9', fill: '#29453f', duration: 0.3 }, 0.7)
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
        timeline.add(stageCycle, 0)
          .fromTo(slide.querySelectorAll('[data-prediction-pulse], [data-prediction-branch]'), { strokeDashoffset: 36 }, { strokeDashoffset: 0, duration: 1.1, ease: 'none', repeat: -1 }, 0)
          .fromTo(slide.querySelector('[data-pipeline-flow]'), { strokeDashoffset: 10 }, { strokeDashoffset: 0, duration: 0.7, ease: 'none', repeat: -1 }, 0);
      } else if (optimizer) {
        const length = optimizer.getTotalLength();
        const duration = 4.2;
        // The closed path and dash pattern share an exact period at the seam.
        timeline.fromTo(optimizer, { strokeDasharray: `24 ${length - 24}`, strokeDashoffset: length }, { strokeDashoffset: 0, duration, ease: 'none' }, 0);
        slide.querySelectorAll('[data-optimizer-node] rect').forEach((node, index) => {
          const arrival = duration * index * 100 / length;
          timeline.to(node, { stroke: '#b9e4c9', duration: 0.2 }, arrival)
            .to(node, { stroke: '#466663', duration: 0.35 }, arrival + 0.2);
        });
      } else if (wave) {
        const flow = slide.querySelector('[data-audio-flow]');
        const chip = slide.querySelector('[data-cnn-chip]');
        const bins = [...slide.querySelectorAll('[data-mel-bins] rect')];
        const duration = 4.6;
        const length = flow.getTotalLength();
        const waveLength = wave.getTotalLength();
        const travelTime = distance => duration * distance / (length + 24);
        // One uninterrupted packet crosses every stage. The fixed waveform stays
        // visible between packets, and the CNN activates when the packet arrives.
        timeline.fromTo(flow, { strokeDasharray: `24 ${length}`, strokeDashoffset: length + 24 }, { strokeDashoffset: 0, duration, ease: 'none' }, 0);
        bins.forEach((bin, index) => {
          const arrival = travelTime(waveLength + 17 + index * 10);
          timeline.to(bin, { opacity: 1, duration: 0.14 }, arrival)
            .to(bin, { opacity: 0.6, duration: 0.24 }, arrival + 0.14);
        });
        const cnnArrival = travelTime(waveLength + 101);
        const cnnExit = travelTime(length - 41);
        timeline.to(chip, { fill: '#29453f', stroke: '#b9e4c9', duration: 0.18 }, cnnArrival)
          .to(chip, { fill: '#111d22', stroke: '#466663', duration: 0.24 }, cnnExit);
      } else if (route) {
        const distance = route.getTotalLength();
        const position = { progress: 0 };
        const point = slide.querySelector('[data-vehicle-point]');
        const halo = slide.querySelector('[data-vehicle-halo]');
        gsap.set([point, halo], { x: 0, y: 0 });
        const setX = gsap.quickSetter([point, halo], 'x', 'px');
        const setY = gsap.quickSetter([point, halo], 'y', 'px');
        timeline.to(position, { progress: 1, duration: 5.5, ease: 'none', onUpdate: () => {
          const at = route.getPointAtLength(distance * position.progress);
          setX(at.x - 55);
          setY(at.y - 60);
        }});
      }
    }, slide);
    illustrationContexts.set(index, context);
    illustrations.set(index, timeline);
    return timeline;
  }

  function resetIllustration(index) {
    illustrationContexts.get(index)?.revert();
    illustrationContexts.delete(index);
    illustrations.delete(index);
  }

  function setStep(step, immediate = false, announce = true) {
    const slide = slides[current];
    const buttons = [...slide.querySelectorAll('[data-feature-step]')];
    const panels = [...slide.querySelectorAll('[data-feature-explanation]')];
    const selected = buttons[step];
    if (!selected) return;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === step)));
    panels.forEach((panel, i) => {
      gsap.killTweensOf(panel);
      gsap.set(panel, { clearProps: 'opacity' });
      panel.hidden = i !== step;
      if (i === step) panel.removeAttribute('aria-hidden');
      else panel.setAttribute('aria-hidden', 'true');
    });
    slide.dataset.explorationStep = String(step);
    slide.querySelector('[data-explore-caption-text]').textContent = selected.dataset.stepCaption;
    if (!explorers.has(current)) explorers.set(current, createDiagramExplorer(slide));
    const animate = !immediate && !motion.matches && !userPaused && visible && !document.hidden;
    explorers.get(current).show(step, animate);
    if (animate) gsap.fromTo(panels[step], { opacity: 0.65 }, { opacity: 1, duration: 0.18, clearProps: 'opacity' });
    if (announce) announcement.textContent = `${selected.textContent}. ${panels[step].textContent}`;
  }

  function setExploring(open, immediate = false, restoreFocus = false) {
    if (open === exploring) return;
    exploring = open;
    manualHold = true;
    root.toggleAttribute('data-exploring', open);
    slides.forEach((slide, index) => {
      resetIllustration(index);
      explorers.get(index)?.reset();
      slide.querySelectorAll('[data-feature-explanation]').forEach(panel => {
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: 'opacity' });
      });
      const toggle = slide.querySelector('[data-explore-toggle]');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('[data-explore-toggle-label]').textContent = open ? 'Back to overview' : 'Explore how it works';
      slide.querySelector('.feature-exploration').hidden = !open;
      slide.querySelector('[data-overview-labels]').hidden = open;
      slide.querySelector('[data-explore-caption]').hidden = !open;
    });
    if (open) setStep(0, immediate);
    else announcement.textContent = 'Overview. Automatic rotation is paused until you press Play.';
    if (restoreFocus) slides[current].querySelector('[data-explore-toggle]').focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('portfolio:layout-change'));
    sync();
  }

  function clearClock() {
    window.clearTimeout(timer);
    timer = undefined;
    gsap.killTweensOf(progress);
    gsap.set(progress, { scaleX: 0 });
  }
  function sync() {
    clearClock();
    const paused = userPaused || manualHold || exploring || motion.matches;
    const canAnimate = !paused && visible && !document.hidden;
    const canRotate = canAnimate && !pointerPaused && !focusPaused;
    root.dataset.playing = String(canRotate);
    root.toggleAttribute('data-hero-motion-paused', userPaused || motion.matches);
    playback.disabled = motion.matches;
    playback.setAttribute('aria-pressed', String(paused));
    playback.setAttribute('aria-label', motion.matches ? 'Manual switching: hero animations disabled for reduced motion' : paused ? 'Play overview and automatic project rotation' : 'Pause featured projects and background animation');
    document.dispatchEvent(new CustomEvent('portfolio:hero-motion', { detail: { paused } }));
    label.textContent = motion.matches ? 'Manual' : paused ? 'Play' : 'Pause';
    illustrations.forEach((timeline, index) => { if (index !== current || !canAnimate) timeline.pause(); });
    if (canAnimate) illustration(current).play();
    if (motion.matches || userPaused || !visible || document.hidden) explorers.get(current)?.settle();
    if (canRotate) {
      gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: interval / 1000, ease: 'none' });
      timer = window.setTimeout(() => select((current + 1) % slides.length), interval);
    }
  }
  function select(index, manual = false, immediate = false) {
    const next = (index + slides.length) % slides.length;
    if (next === current) { sync(); return; }
    illustrations.get(current)?.pause();
    explorers.get(current)?.reset();
    current = next;
    slides.forEach((slide, i) => {
      gsap.killTweensOf(slide);
      gsap.set(slide, { clearProps: 'opacity,transform,visibility' });
      slide.hidden = i !== current;
      slide.inert = i !== current;
      if (i === current) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (!motion.matches && !immediate) gsap.fromTo(slides[current], { opacity: 0.5, y: 8 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out', clearProps: 'opacity,transform' });
    if (manual) announcement.textContent = `${current + 1} of ${slides.length}: ${slides[current].dataset.title}`;
    if (exploring) setStep(0, immediate, false);
    sync();
  }
  const swipeArea = root.querySelector('.feature-slides');
  let gesture = null;
  let suppressClickUntil = 0;
  swipeArea.addEventListener('pointerdown', event => {
    if (exploring || event.target.closest('button') || event.pointerType === 'mouse' || !event.isPrimary) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }, { passive: true });
  swipeArea.addEventListener('pointerup', event => {
    const start = gesture;
    gesture = null;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClickUntil = performance.now() + 400;
    select(current + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
  swipeArea.addEventListener('pointercancel', () => { gesture = null; }, { passive: true });
  swipeArea.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  selectors.forEach((button, index) => button.addEventListener('click', event => select(index, true, event.detail === 0)));
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-explore-toggle]');
    const step = event.target.closest('[data-feature-step]');
    if (toggle) setExploring(!exploring, event.detail === 0);
    else if (step && exploring) setStep(Number(step.dataset.featureStep), event.detail === 0);
  });
  playback.addEventListener('click', () => {
    const resume = userPaused || manualHold || exploring;
    if (exploring) setExploring(false, true);
    userPaused = !resume;
    manualHold = false;
    // Explicitly pressing Play can resume even while the control has focus.
    if (!userPaused) { focusPaused = false; pointerPaused = false; }
    sync();
  });
  root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { pointerPaused = true; sync(); } });
  root.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { pointerPaused = false; sync(); } });
  root.addEventListener('focusin', () => { focusPaused = true; sync(); });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) { focusPaused = false; sync(); } });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && exploring) {
      event.preventDefault();
      setExploring(false, true, true);
      return;
    }
    const stepButtons = [...slides[current].querySelectorAll('[data-feature-step]')];
    const group = stepButtons.includes(event.target) ? stepButtons : selectors;
    const index = group.indexOf(event.target);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % group.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + group.length) % group.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = group.length - 1;
    else return;
    event.preventDefault();
    group[next].focus();
    if (group === selectors) select(next, true, true);
    else setStep(next, true);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      slides.forEach(slide => { gsap.killTweensOf(slide); gsap.set(slide, { clearProps: 'opacity,transform,visibility' }); });
      root.querySelectorAll('[data-feature-explanation]').forEach(panel => {
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: 'opacity' });
      });
    }
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35);
    sync();
  }, { threshold: [0, 0.35] });
  observer.observe(root);
  // Release animation contexts when navigating away; bfcache can resume safely.
  window.addEventListener('pagehide', () => {
    clearClock();
    illustrations.forEach(timeline => timeline.pause());
    explorers.forEach(explorer => explorer.settle());
  });
  window.addEventListener('pageshow', sync);
  sync();
}
