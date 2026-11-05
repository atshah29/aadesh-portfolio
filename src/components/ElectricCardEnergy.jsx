'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ElectricBorder from './ElectricBorder.jsx';

// One decorative React Bits border, portalled into the active Astro card.
// Retain one canvas between activations; inactive and offscreen cards do no work.
export default function ElectricCardEnergy() {
  const [target, setTarget] = useState(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const allowed = !motion.matches;
      setEnabled(allowed);
      if (!allowed) { setTarget(null); setActive(false); }
    };
    const power = event => {
      const card = event.detail;
      if (card instanceof HTMLElement && card.matches('[data-energy-card][data-powered]')) {
        setTarget(card);
        setActive(true);
      } else setActive(false);
    };
    document.addEventListener('portfolio:card-power', power);
    motion.addEventListener('change', sync);
    sync();
    const initial = document.querySelector('[data-energy-card][data-powered]');
    if (initial) power({ detail: initial });
    return () => {
      document.removeEventListener('portfolio:card-power', power);
      motion.removeEventListener('change', sync);
    };
  }, []);

  if (!target || !enabled) return null;
  return createPortal(
    <ElectricBorder
      className="work-card-electric"
      color="#8cf3b5"
      active={active}
      speed={0.8}
      chaos={0.14}
      borderRadius={target.matches('.experience-row') ? 0 : 10}
    />,
    target.matches('details') ? target.querySelector(':scope > summary') : target
  );
}
