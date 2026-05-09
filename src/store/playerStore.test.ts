import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from './playerStore';
import { QUEST_POOL } from '../data/questData';

describe('PlayerStore Logic', () => {
  beforeEach(() => {
    // Reset state before each test
    usePlayerStore.setState({
        activeQuests: QUEST_POOL.slice(0, 3).map(q => ({ ...q })),
        coins: 1000,
        xp: 0,
        lastQuestReset: new Date().toISOString()
    });
  });

  it('initially has 3 quests from pool', () => {
    const { activeQuests } = usePlayerStore.getState();
    expect(activeQuests.length).toBe(3);
  });

  it('increases quest progress', () => {
    const { activeQuests, updateQuestProgress } = usePlayerStore.getState();
    const firstQuestId = activeQuests[0].id;
    
    updateQuestProgress(firstQuestId, 1);
    
    const updatedQuests = usePlayerStore.getState().activeQuests;
    expect(updatedQuests[0].current).toBe(1);
    
    // Check if completion works if target is 1
    if (updatedQuests[0].goal === 1) {
        expect(updatedQuests[0].completed).toBe(true);
    }
  });

  it('claims reward if quest is completed', () => {
    const { activeQuests } = usePlayerStore.getState();
    const q = activeQuests[0];
    
    // Manually complete quest
    usePlayerStore.setState({
      activeQuests: [{ ...q, current: q.goal, completed: true, claimed: false }]
    });
    
    const { claimQuestReward, coins: initialCoins } = usePlayerStore.getState();
    const result = claimQuestReward(q.id);
    
    expect(result.success).toBe(true);
    expect(usePlayerStore.getState().coins).toBe(initialCoins + q.reward);
    expect(usePlayerStore.getState().activeQuests[0].claimed).toBe(true);
  });

  it('cannot claim reward twice', () => {
    const { activeQuests } = usePlayerStore.getState();
    const q = activeQuests[0];
    
    usePlayerStore.setState({
      activeQuests: [{ ...q, current: q.goal, completed: true, claimed: true }]
    });
    
    const { claimQuestReward } = usePlayerStore.getState();
    const result = claimQuestReward(q.id);
    
    expect(result.success).toBe(false);
  });

  it('resets quests after 24 hours', () => {
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - 25);
    
    usePlayerStore.setState({
      lastQuestReset: oldDate.toISOString()
    });
    
    const { checkAndResetQuests } = usePlayerStore.getState();
    checkAndResetQuests();
    
    const newQuests = usePlayerStore.getState().activeQuests;
    const newResetTime = usePlayerStore.getState().lastQuestReset;
    
    expect(new Date(newResetTime).getTime()).toBeGreaterThan(oldDate.getTime());
    expect(newQuests.length).toBe(3);
  });
});
