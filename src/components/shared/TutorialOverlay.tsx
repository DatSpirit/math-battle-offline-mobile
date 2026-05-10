import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import type { TutorialStep } from '../../data/tutorialSteps';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStepIndex: number;
  onNext: () => void;
  onSkip: () => void;
  isActive: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  currentStepIndex,
  onNext,
  onSkip,
  isActive
}) => {
  const [spotlightRect, setSpotlightRect] = useState<{ x: number; y: number; width: number; height: number; borderRadius: number } | null>(null);
  const currentStep = steps[currentStepIndex];

  React.useLayoutEffect(() => {
    const updateSpotlight = () => {
      if (!isActive || !currentStep?.targetId) {
        setSpotlightRect(null);
        return;
      }

      const element = document.getElementById(currentStep.targetId!);
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;
        setSpotlightRect({
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: 24
        });
      }
    };

    const handle = requestAnimationFrame(updateSpotlight);
    window.addEventListener('resize', updateSpotlight);
    const timer = setTimeout(updateSpotlight, 300);

    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener('resize', updateSpotlight);
      clearTimeout(timer);
    };
  }, [currentStep, isActive]);

  // Global click blocker to strictly enforce tutorial interaction
  useEffect(() => {
    if (!isActive) return;
    
    const blocker = (e: MouseEvent) => {
      // 1. Always allow clicks on the tutorial box and its buttons
      const box = document.getElementById('tutorial-box');
      if (box?.contains(e.target as Node)) return;
      
      // 2. Always allow clicks on the skip button
      const skipBtn = document.getElementById('tutorial-skip-btn');
      if (skipBtn?.contains(e.target as Node)) return;

      // 3. Allow clicks on the specific target element or required element
      const targetElement = currentStep.targetId ? document.getElementById(currentStep.targetId) : null;
      const requiredElement = currentStep.requiredId ? document.getElementById(currentStep.requiredId) : null;
      
      const isTarget = targetElement?.contains(e.target as Node) || requiredElement?.contains(e.target as Node);
      const isStartButton = currentStep.requiredId === 'home-start-ai-btn';

      if (isTarget) {
        if (isStartButton) {
          // Advance tutorial AND allow original action
          if (e.type === 'click') onNext();
          return; 
        } else {
          // Advance tutorial BUT block original action
          if (e.type === 'click') onNext();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // 4. Block everything else
      e.preventDefault();
      e.stopPropagation();
    };

    // Use capture: true to intercept events before they reach other elements
    window.addEventListener('click', blocker, true);
    // For scroll-related events, we DON'T block them globally to allow scrolling
    // but we still want to block them for specific elements if they trigger actions.
    // However, for mobile, it's safer to only block 'click' to allow scrolling.
    
    return () => {
      window.removeEventListener('click', blocker, true);
    };
  }, [isActive, currentStep, onNext]);

  if (!isActive || !currentStep) return null;

  const getStepPositionStyle = () => {
    if (!spotlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const { x, y, width, height } = spotlightRect;
    const margin = window.innerWidth < 640 ? 12 : 24;

    // Viewport boundaries
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;

    // Force center on mobile to avoid overlapping with interactive elements
    if (isMobile) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%' };

    if (currentStep.position === 'center') return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const position = currentStep.position;
    switch (position) {
      case 'bottom':
        return { 
          top: Math.min(vh - 180, y + height + margin), 
          left: Math.max(margin, Math.min(vw - margin, x + width / 2)), 
          transform: 'translateX(-50%)' 
        };
      case 'top':
        return { 
          bottom: Math.max(margin, vh - (y - margin)), 
          left: Math.max(margin, Math.min(vw - margin, x + width / 2)), 
          transform: 'translateX(-50%)' 
        };
      case 'left':
        return { 
          top: Math.max(margin, Math.min(vh - margin, y + height / 2)), 
          right: Math.max(margin, vw - (x - margin)), 
          transform: 'translateY(-50%)' 
        };
      case 'right':
        return { 
          top: Math.max(margin, Math.min(vh - margin, y + height / 2)), 
          left: Math.max(margin, x + width + margin), 
          transform: 'translateY(-50%)' 
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <div className="fixed inset-0 z-10000 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="global-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: spotlightRect.x,
                  y: spotlightRect.y,
                  width: spotlightRect.width,
                  height: spotlightRect.height
                }}
                rx={spotlightRect.borderRadius}
                ry={spotlightRect.borderRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#global-spotlight-mask)"
        />
      </svg>

      <button
        id="tutorial-skip-btn"
        onClick={onSkip}
        className="fixed top-6 right-6 pointer-events-auto bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-xl"
      >
        SKIP TUTORIAL <X size={14} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          id="tutorial-box"
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="absolute pointer-events-auto"
          style={getStepPositionStyle()}
        >
          <div className="bg-white rounded-4xl p-8 shadow-2xl border-4 border-primary/10 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 text-primary/5">
              <Sparkles size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary font-black text-[9px] tracking-[0.3em] uppercase mb-3">
                <span className="w-8 h-[2px] bg-primary/20" />
                ACADEMY STEP {currentStepIndex + 1}/{steps.length}
              </div>
              
              <h3 className="text-2xl font-headline font-black text-on-surface mb-3 uppercase leading-none">
                {currentStep.title}
              </h3>
              
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">
                {currentStep.content}
              </p>

              {currentStep.actionType !== 'click' ? (
                <button
                  onClick={onNext}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-primary-dim shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  {currentStepIndex === steps.length - 1 ? 'LET\'S GO!' : 'CONTINUE'} <ChevronRight size={18} />
                </button>
              ) : (
                <div className="flex items-center gap-3 text-primary font-black text-[10px] tracking-widest uppercase italic animate-bounce">
                  <ChevronRight size={16} /> PLEASE FOLLOW THE INSTRUCTION!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialOverlay;
