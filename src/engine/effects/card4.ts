import type { PipelineState, CardEffect } from './effectTypes';

/**
 * Kỹ năng Thẻ 4 (Góc Vuông - Trực Giao):
 * Bảo vệ bài và điểm của bản thân khỏi các kỹ năng gây hại từ đối thủ.
 */
export class Card4Effect implements CardEffect {
  id = '4';

  apply(state: PipelineState): void {
    this.processPlayer(state, 'player1');
    this.processPlayer(state, 'player2');
  }

  private processPlayer(state: PipelineState, pKey: 'player1' | 'player2') {
    // Tìm thẻ 4 đang hoạt động (không bị khóa bởi thẻ 0 chẳng hạn)
    const card4 = state[pKey].cards.find(c => c.value === '4' && !state[pKey].disabledSkills.has(c.id));
    
    if (card4 && card4.rarity !== 'normal') {
      state[pKey].isImmuneToDebuffs = true;
      state[pKey].maxBlockedSkills = card4.rarity === 'rare' ? 1 : card4.rarity === 'super' ? 2 : 3;
      
      state.events.push({
        type: 'SKILL_ACTIVATED',
        sourceCardId: card4.id,
        targetPlayer: pKey,
        skillName: 'TRỰC GIAO',
        description: `Kích hoạt từ trường bảo vệ (Tối đa chặn ${state[pKey].maxBlockedSkills} kỹ năng)`,
        priority: 0 
      });
    }
  }
}
