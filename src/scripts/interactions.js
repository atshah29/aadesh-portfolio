import Lenis from 'lenis';
import { initFeaturedProjects } from './featured-projects';
import { initHeroAmbience } from './hero-ambience';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu');
const nav = document.querySelector('.links');
const dialog = document.querySelector('dialog');
let lenis;
let zoomTrigger;

function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}
function refreshLayout() {
  lenis?.resize();
  ScrollTrigger.refresh();
}
function scrollToElement(element, immediate = false) {
  if (!element) return;
  if (lenis) {
    lenis.scrollTo(element, { offset: -110, immediate, duration: 0.8 });
  } else {
    element.scrollIntoView({ behavior: immediate || reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
}
function updateProjectHash(details, open) {
  if (!details.dataset.project) return;
  const hash = `#project-${details.dataset.project}`;
  if (open) history.replaceState(null, '', hash);
  else if (window.location.hash === hash) history.replaceState(null, '', '#projects');
}
function setDisclosure(details, open, { immediate = false, focus = false, updateHash = true } = {}) {
  const panel = details.querySelector(':scope > .disclosure-panel');
  const summary = details.querySelector(':scope > summary');
  const wasOpen = details.dataset.expanded ? details.dataset.expanded === 'true' : details.open;
  details.dataset.expanded = String(open);
  gsap.killTweensOf(panel);
  if (updateHash) updateProjectHash(details, open);
  if (open && !wasOpen && details.dataset.project) {
    window.umami?.track('project_expand', { project: details.dataset.project });
  }
  const finish = () => {
    details.open = open;
    gsap.set(panel, { clearProps: 'height,opacity' });
    refreshLayout();
    if (focus) {
      summary.focus({ preventScroll: true });
      scrollToElement(details);
    }
  };
  if (reducedMotion.matches || immediate) {
    finish();
    return;
  }
  if (open) {
    const height = details.open ? panel.getBoundingClientRect().height : 0;
    details.open = true;
    gsap.fromTo(panel, { height, opacity: height ? 1 : 0 }, {
      height: 'auto', opacity: 1, duration: 0.52, ease: 'power3.inOut', onComplete: finish,
    });
  } else {
    gsap.to(panel, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: finish });
  }
}
function revealHash(immediate = false) {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  let id;
  try { id = decodeURIComponent(hash); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const details = target.matches('details[data-disclosure]') ? target : target.querySelector(':scope > astro-island details[data-disclosure], :scope > details[data-disclosure]') || target.closest('details[data-disclosure]');
  // React islands contain a static Astro slot, so the project can be nested further.
  const project = id.startsWith('project-') ? target.querySelector('details[data-disclosure="project"]') : null;
  const disclosure = project || details;
  if (disclosure && !disclosure.open) setDisclosure(disclosure, true, { immediate: true, updateHash: false });
  requestAnimationFrame(() => scrollToElement(target, immediate));
}

const steps = [
  [
    "Fetch: instruction stream",
    "The existing front end fetches instructions and predicts control flow. Instruction addresses and conditional-branch history provide the context that the value predictor uses later in the pipeline."
  ],
  [
    "Decode: identify operations and operands",
    "Decode identifies operation types and source and destination registers. The predictor uses this information to check eligibility and apply different training and allocation policies to loads, floating-point operations, and generic ALU operations."
  ],
  [
    "Rename 1: form the instruction bundle",
    "The first rename sub-stage transfers an instruction bundle from the fetch queue to the second rename sub-stage. It preserves the simulator’s existing backpressure when the next bundle cannot advance."
  ],
  [
    "Rename 2: predict and checkpoint",
    "I integrated stride and tagged-history lookup with register renaming, provider selection, and in-flight prediction tracking. Branch checkpoints capture speculative history and the prediction-queue position so later recovery can undo wrong-path work."
  ],
  [
    "Dispatch: forward a predicted result",
    "I write a sufficiently confident prediction into the destination physical register and mark it available. Consumers dispatched afterward can see their operands as ready before the producer computes its actual result."
  ],
  [
    "Schedule: issue ready consumers",
    "The existing issue scheduler selects instructions whose operands are ready. Marking predicted values available at dispatch lets dependent instructions become eligible for execution earlier, without waiting for the actual producer result."
  ],
  [
    "Register read: consume speculative operands",
    "Consumers read operands from physical registers, including predicted values. I adjusted the normal producer wakeup path so an instruction with a forwarded prediction does not repeat the usual register-read wakeup."
  ],
  [
    "Execute: validate actual results",
    "I compare predicted values with actual results for loads and arithmetic operations. Correct predictions preserve early execution; mismatches write the actual value and flag recovery. Execution also records actual results for retirement-time training."
  ],
  [
    "Writeback: complete and restore state",
    "I record actual results in the prediction queue as instructions complete. On a branch misprediction, writeback rewinds the queue, undoes wrong-path stride instance counts, and restores checkpointed branch history."
  ],
  [
    "Retire: train and commit safely",
    "I update stride values, VTAGE confidence, usefulness, allocation, and committed branch history at retirement. Value-misprediction handling commits the corrected producer and discards younger speculative work before incorrect consumers can commit."
  ],
  [
    "Recovery: clear speculative bookkeeping",
    "I extended full-pipeline recovery to clear in-flight stride counts, empty the value-prediction queue, and restore committed history. Partial branch recovery instead restores its checkpoint while retaining older valid predictions."
  ]
];

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target;
  const step = target.closest('[data-step]');
  if (step) {
    const stepper = step.closest('.stepper');
    const value = steps[Number(step.dataset.step)];
    if (stepper && value) {
      stepper.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(button === step)));
      stepper.querySelector('h3').textContent = value[0];
      stepper.querySelector('[aria-live] p').textContent = value[1];
      refreshLayout();
    }
    return;
  }
  const zoom = target.closest('[data-zoom]');
  if (zoom && dialog) {
    const source = zoom.querySelector('img');
    const image = dialog.querySelector('img');
    if (source && image) {
      image.src = source.src;
      image.alt = source.alt;
      zoomTrigger = zoom;
      dialog.showModal();
      lenis?.stop();
    }
    return;
  }
  if (target.closest('.close-dialog')) { dialog?.close(); return; }
  if (target.closest('.menu')) {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('open', open);
    return;
  }
  const close = target.closest('[data-close-disclosure]');
  if (close) { setDisclosure(close.closest('details'), false, { focus: true }); return; }
  const summary = target.closest('summary');
  if (summary?.parentElement.matches('details[data-disclosure]')) {
    event.preventDefault();
    const details = summary.parentElement;
    const open = details.dataset.expanded ? details.dataset.expanded === 'true' : details.open;
    setDisclosure(details, !open);
    return;
  }
  const anchor = target.closest('a[href]');
  if (!anchor) return;
  if (anchor.closest('.links')) closeMenu();
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || anchor.target === '_blank') return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
  const destination = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!destination) return;
  event.preventDefault();
  history.pushState(null, '', url.hash);
  revealHash();
  if (event.detail === 0) {
    destination.setAttribute('tabindex', '-1');
    destination.focus({ preventScroll: true });
  }
});
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => {
  lenis?.start();
  zoomTrigger?.focus({ preventScroll: true });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
});
window.addEventListener('hashchange', () => revealHash());

const navigationObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    document.querySelectorAll('[data-nav-section]').forEach(anchor => {
      if (anchor.dataset.navSection === entry.target.id) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-18% 0px -62% 0px' });
document.querySelectorAll('#experience, #projects, #about').forEach(section => navigationObserver.observe(section));

const media = gsap.matchMedia();
media.add({ desktop: '(min-width: 801px) and (pointer: fine)', reduce: '(prefers-reduced-motion: reduce)', all: '(min-width: 0px)' }, context => {
  const { desktop, reduce } = context.conditions;
  let tick;
  if (desktop && !reduce) {
    lenis = new Lenis({ duration: 0.9, smoothWheel: true, syncTouch: false, anchors: false });
    lenis.on('scroll', ScrollTrigger.update);
    tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
    const progress = document.querySelector('.scroll-progress');
    if (progress) progress.style.transform = `scaleX(${self.progress})`;
  }});
  if (!reduce) {
    gsap.from('.hero-kicker, .hero h1, .hero .availability, .hero .intro, .hero .actions', {
      y: 18, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity',
    });
    gsap.from('.hero-feature', { x: 22, opacity: 0, duration: 1, delay: 0.15, ease: 'power3.out', clearProps: 'transform,opacity' });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      gsap.from(element, { y: 22, opacity: 0, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: element, start: 'top 93%', once: true } });
    });
  }
  return () => {
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = undefined;
  };
});
if (window.location.hash) requestAnimationFrame(() => revealHash(true));
window.addEventListener('load', () => {
  refreshLayout();
  if (window.location.hash) revealHash(true);
}, { once: true });

initFeaturedProjects();
initHeroAmbience();
