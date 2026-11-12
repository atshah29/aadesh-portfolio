import { gsap } from 'gsap';

// Inspection has finite, named states. It never seeks the overview's looping
// timelines, and reverting its context restores the original SVG completely.
export function createDiagramExplorer(slide) {
  const all = selector => [...slide.querySelectorAll(selector)];
  const one = selector => slide.querySelector(selector);
  const signal = one('[data-explore-signal]');
  const accent = '#b9e4c9';
  let context;
  let cue;

  function reset() {
    context?.revert();
    context = undefined;
    cue = undefined;
  }

  function show(step, animate = false) {
    reset();
    context = gsap.context(() => {
      let path;
      let destination;
      const illuminate = targets => gsap.set(targets, { stroke: accent, fill: '#29453f' });
      if (slide.dataset.project === 'value-prediction') {
        const stages = all('.pipeline-stage');
        const predictor = one('.pipeline-predictor');
        const producer = one('[data-producer-instruction]');
        const dependent = one('[data-dependent-instruction]');
        if (step === 0) {
          illuminate([stages[1], predictor]);
          path = 'M118 57V19H145';
          destination = predictor;
        } else if (step === 1) {
          illuminate([predictor, stages[2]]);
          gsap.set(dependent, { fill: accent });
          path = 'M257 19H274V37H194V57';
          destination = dependent;
        } else {
          illuminate([stages[3], stages[4]]);
          gsap.set([producer, dependent], { fill: accent });
          gsap.set(one('[data-pipeline-validation]'), { opacity: 1 });
          path = 'M303 76H313';
          destination = stages[4];
        }
      } else if (slide.dataset.project === 'cpp-optimizer') {
        const nodes = all('[data-optimizer-node] rect');
        illuminate(nodes[step]);
        path = ['M28 60H50', 'M94 60H150', 'M194 60H250'][step];
        destination = nodes[step];
      } else if (slide.dataset.project === 'bcough') {
        const wave = one('[data-audio-wave]');
        const bins = all('[data-mel-bins] rect');
        const chip = one('[data-cnn-chip]');
        if (step === 0) {
          gsap.set(wave, { stroke: accent });
          path = wave.getAttribute('d');
          destination = wave;
        } else if (step === 1) {
          gsap.set(bins, { opacity: 1 });
          path = 'M160 60H247';
          destination = one('[data-mel-bins]');
        } else {
          illuminate(chip);
          path = 'M257 60H297V48H337V60H302V72H337L349 60H390';
          destination = chip;
        }
      } else {
        const route = one('.feature-route');
        const length = route.getTotalLength();
        const start = route.getPointAtLength(length * 0.12);
        const end = route.getPointAtLength(length * 0.21);
        const markers = all('[data-vehicle-point], [data-vehicle-halo]');
        const position = { progress: 0.12 };
        gsap.set(markers, { x: 0, y: 0 });
        const setX = gsap.quickSetter(markers, 'x', 'px');
        const setY = gsap.quickSetter(markers, 'y', 'px');
        const moveVehicle = () => {
          const point = route.getPointAtLength(length * position.progress);
          setX(point.x - 55);
          setY(point.y - 60);
        };
        // An illustrative segment of the existing course, not a recorded trace.
        path = Array.from({ length: 17 }, (_, i) => {
          const p = route.getPointAtLength(length * (0.12 + i * 0.09 / 16));
          return `${i ? 'L' : 'M'}${p.x} ${p.y}`;
        }).join('');
        moveVehicle();
        if (step === 0) {
          gsap.set(one('[data-vehicle-sensors]'), { x: start.x - 55, y: start.y - 60, opacity: 1 });
          path = `M${start.x} ${start.y - 32}V${start.y - 10}`;
        } else if (step === 1) {
          gsap.set(one('[data-vehicle-correction]'), { attr: { d: `M${start.x} ${start.y}L${end.x} ${end.y}` }, opacity: 1 });
        }
        destination = one('[data-vehicle-halo]');
        gsap.set(destination, { stroke: accent, fill: '#b9e4c92b' });
        if (step === 2) {
          if (animate) {
            cue = gsap.timeline({ defaults: { ease: 'none' } })
              .addLabel('selection', 0)
              .to(position, { progress: 0.21, duration: 0.24, onUpdate: moveVehicle }, 'selection');
          } else { position.progress = 0.21; moveVehicle(); }
        }
      }

      gsap.set(signal, { attr: { d: path }, strokeDasharray: 'none', strokeDashoffset: 0, opacity: 0.7 });
      if (!animate) return;
      const length = signal.getTotalLength();
      cue ||= gsap.timeline();
      cue.addLabel('selection', 0)
        .fromTo(signal, { strokeDasharray: `14 ${length}`, strokeDashoffset: length + 14, opacity: 1 },
          { strokeDashoffset: 0, duration: 0.24, ease: 'none' }, 'selection')
        .addLabel('arrival', 0.24)
        .set(signal, { strokeDasharray: 'none', opacity: 0.7 }, 'arrival')
        .fromTo(destination, { opacity: 0.7 }, { opacity: 1, duration: 0.06, ease: 'power3.out' }, 'arrival');
    }, slide);
  }

  return { show, reset, settle: () => cue?.progress(1).pause() };
}
