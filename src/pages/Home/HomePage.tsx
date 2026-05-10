import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { useInteractionDelay } from '../../hooks/useInteractionDelay';
import MobileHomePage from './MobileHomePage';
import RulesModal from '../../components/modals/RulesModal';
import TutorialOverlay from '../../components/shared/TutorialOverlay';
import { HOME_TUTORIAL_STEPS } from '../../data/tutorialSteps';
import './Home.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const showContent = useInteractionDelay(150);
  const { user, completeTutorial: completeAuthTutorial } = useAuthStore();
  const hasCompletedTutorial = user?.hasCompletedTutorial || false;
  const { phase, surrenderGame, tutorialId, tutorialStep, setTutorialId, setTutorialStep } = useGameStore();
  const [isRulesOpen, setIsRulesOpen] = React.useState(false);

  // Auto-start tutorial for new players
  React.useEffect(() => {
    if (!hasCompletedTutorial && tutorialId === null) {
      setTutorialId('home');
      setTutorialStep(0);
    }
  }, [hasCompletedTutorial, tutorialId, setTutorialId, setTutorialStep]);

  // Reset match status if we are on Home page but game is technically "in progress"
  React.useEffect(() => {
    if (phase !== 'start_screen' && phase !== 'game_over') {
      surrenderGame();
    }
  }, [phase, surrenderGame]);

  const handleStartAIBattle = (difficulty: 'easy' | 'medium' | 'hard') => {
    navigate('/battle/arena', { state: { mode: 'vs_ai', difficulty, isTutorial: !hasCompletedTutorial } });
  };

  const handleStartPassPlay = () => {
    navigate('/battle/arena', { state: { mode: 'pass_play' } });
  };

  const handleStartLogicMode = () => {
    navigate('/battle/arena', { state: { mode: 'logic', difficulty: 'hard' } });
  };

  const handleStartTutorial = () => {
    navigate('/battle/arena', { state: { mode: 'vs_ai', difficulty: 'easy', isTutorial: true } });
  };

  const commonProps = {
    onStartAIBattle: handleStartAIBattle,
    onStartPassPlay: handleStartPassPlay,
    onStartLogicMode: handleStartLogicMode,
    onStartTutorial: handleStartTutorial,
    onOpenRules: () => setIsRulesOpen(true),
    hasCompletedTutorial
  };

  if (!showContent) {
    return <div className="flex-1 bg-[#fcf9f2]" />;
  }

  return (
    <>
      <MobileHomePage {...commonProps} />
      
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {tutorialId === 'home' && (
        <TutorialOverlay
          steps={HOME_TUTORIAL_STEPS}
          currentStepIndex={tutorialStep}
          onNext={() => {
            if (tutorialStep < HOME_TUTORIAL_STEPS.length - 1) {
              setTutorialStep(tutorialStep + 1);
            } else {
              setTutorialId(null);
              handleStartTutorial();
            }
          }}
          onSkip={() => {
            setTutorialId(null);
            completeAuthTutorial();
          }}
          isActive={true}
        />
      )}
    </>
  );
};

export default HomePage;
