import { useState, useCallback } from 'react';

/**
 * Custom hook for "Game Juice" effects like Screen Shake.
 */
export const useJuice = () => {
  const [shakeIntensity, setShakeIntensity] = useState(0);

  const triggerShake = useCallback((value: number) => {
    // Determine intensity based on the math result
    // > 1000: level 1, > 3000: level 2, > 5000: level 3
    let intensity = 0;
    if (value >= 5000) intensity = 3;
    else if (value >= 3000) intensity = 2;
    else if (value >= 1000) intensity = 1;

    if (intensity > 0) {
      setShakeIntensity(intensity);
      // Reset after animation duration
      setTimeout(() => setShakeIntensity(0), 500);
    }
  }, []);

  return {
    shakeIntensity,
    triggerShake
  };
};
