'use client';

import { useEffect, useState } from 'react';
import Particles from './Particles.jsx';

export default function HeroParticles() {
  const [compact, setCompact] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia('(max-width: 640px)');
    const sync = () => setCompact(media.matches);
    sync();
    const onPlayback = event => setPaused(event.detail.paused);
    const playback = document.querySelector('[data-feature-playback]');
    setPaused(playback?.getAttribute('aria-pressed') === 'true');
    document.addEventListener('portfolio:hero-motion', onPlayback);
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
      document.removeEventListener('portfolio:hero-motion', onPlayback);
    };
  }, []);
  return <Particles
    particleCount={compact ? 48 : 96}
    particleSpread={4}
    particleColors={['#91eab9', '#659fbb', '#c3f5db']}
    particleBaseSize={64}
    sizeRandomness={0.5}
    cameraDistance={30}
    shape="square"
    glow={0.65}
    opacity={0.65}
    twinkle={0.1}
    speed={0.28}
    pixelRatio={1}
    drift="up"
    driftSpeed={0.12}
    disableRotation
    moveParticlesOnHover
    particleHoverFactor={0.2}
    connections={false}
    clickBurst={false}
    intro={false}
    paused={paused}
  />;
}
