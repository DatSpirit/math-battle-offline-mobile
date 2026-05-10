import { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

/**
 * Hook to delay content rendering until the global loading transition is complete.
 * This ensures 60FPS animations on mobile by postponing heavy DOM construction.
 * 
 * @param delay Extra delay in ms after isLoading becomes false
 * @returns boolean showContent
 */
export const useInteractionDelay = (delay: number = 100) => {
  const { isLoading } = useUIStore();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  return showContent;
};
