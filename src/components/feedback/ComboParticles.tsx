import React, { useEffect, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import { usePlayerStore } from '../../store/playerStore';


interface ComboParticlesProps {
  onComplete?: () => void;
  duration?: number;
}

const ComboParticles: React.FC<ComboParticlesProps> = ({ onComplete, duration = 3000 }) => {
  const [init, setInit] = useState(false);
  const { performanceMode } = usePlayerStore();
  const isEco = performanceMode === 'ECO';
  const isUltra = performanceMode === 'ULTRA';

  useEffect(() => {
    if (isEco) {
      const t = setTimeout(() => onComplete?.(), 100);
      return () => clearTimeout(t);
    }

    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration, isEco]);

  const particlesLoaded = useCallback(async () => {
    // console.log("Particles loaded");
  }, []);

  if (isEco || !init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={{
        fullScreen: { enable: true, zIndex: 1200 },
        fpsLimit: 60,
        particles: {
          number: { value: 0 },
          color: { value: ["#8b5cff", "#4ade80", "#fbbf24", "#f87171"] },
          shape: { type: "square" },
          opacity: { value: 1 },
          size: { value: { min: 4, max: 8 } },
          move: {
            enable: true,
            gravity: { enable: true, acceleration: 15 },
            speed: isUltra ? { min: 25, max: 60 } : { min: 15, max: 35 },
            decay: isUltra ? 0.07 : 0.12,
            direction: "none",
            outModes: { default: "destroy", top: "none" },
          },
        },
        emitters: [
          {
            direction: "top",
            life: { count: 1, duration: 0.1, delay: 0 },
            rate: { delay: 0, quantity: isUltra ? 150 : 60 },
            size: { width: 0, height: 0 },
            position: { x: 50, y: 100 },
          },
        ],
      }}
    />
  );
};

export default ComboParticles;
