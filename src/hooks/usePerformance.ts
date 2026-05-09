import { usePlayerStore } from '../store/playerStore';
import { getPerfFlags, type PerformanceMode } from '../utils/performance';

/**
 * Hook giúp quản lý các thiết lập tối ưu hiệu suất cho Mobile.
 */
export const usePerformance = () => {
  const performanceMode = usePlayerStore((s) => s.performanceMode) as PerformanceMode;
  const flags = getPerfFlags(performanceMode);
  
  return {
    mode: performanceMode,
    isEco: performanceMode === 'ECO',
    isBalanced: performanceMode === 'BALANCED',
    isUltra: performanceMode === 'ULTRA',
    ...flags,
    // Helper cũ để tương thích
    showHeavyEffects: flags.enableBlur,
    showUltraEffects: flags.enableHeavyAnimations,
  };
};
