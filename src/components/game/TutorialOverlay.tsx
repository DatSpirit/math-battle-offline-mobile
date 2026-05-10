import React from 'react';
import TutorialOverlayShared from '../shared/TutorialOverlay';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import './TutorialOverlay.css';
import { HOME_TUTORIAL_STEPS, BATTLE_TUTORIAL_STEPS } from '../../data/tutorialSteps';

interface TutorialOverlayProps {
  step?: number;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const tutorialId = useGameStore(s => s.tutorialId);
  const tutorialStep = useGameStore(s => s.tutorialStep);
  const setTutorialStep = useGameStore(s => s.setTutorialStep);
  const setTutorialId = useGameStore(s => s.setTutorialId);
  const setTutorialPaused = useGameStore(s => s.setTutorialPaused);
  const setIsTutorial = useGameStore(s => s.setIsTutorial);

  const completeTutorial = useAuthStore(s => s.completeTutorial);

  const steps = tutorialId === 'home' ? HOME_TUTORIAL_STEPS : BATTLE_TUTORIAL_STEPS;
  
  React.useEffect(() => {
    if (tutorialId === 'battle') {
      setTutorialPaused(true);
      return () => setTutorialPaused(false);
    }
  }, [tutorialId, setTutorialPaused]);

  if (!tutorialId) return null;

  return (
    <TutorialOverlayShared
      isActive={!!tutorialId}
      steps={steps}
      currentStepIndex={tutorialStep}
      onNext={() => {
        if (tutorialStep < steps.length - 1) {
          setTutorialStep(tutorialStep + 1);
        } else {
          setTutorialId(null);
          if (tutorialId === 'battle') {
            completeTutorial();
            setIsTutorial(false);
          }
          onClose();
        }
      }}
      onSkip={() => {
        setTutorialId(null);
        completeTutorial();
        setIsTutorial(false);
        onClose();
      }}
    />
  );
};

export default TutorialOverlay;
