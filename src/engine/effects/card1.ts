import type { PipelineState, CardEffect } from './effectTypes';

export class Card1Effect implements CardEffect {
  id = '1';

  apply(state: PipelineState): void {
    this.processPlayer(state, 'player1', 'player2');
    this.processPlayer(state, 'player2', 'player1');
  }

  private processPlayer(state: PipelineState, me: 'player1' | 'player2', opp: 'player1' | 'player2') {
    const oneCards = state[me].cards.filter(c => c.value === '1' && !state[me].disabledSkills.has(c.id));
    
    if (state[opp].isImmuneToDebuffs && oneCards.length > 0) {
      state.events.push({
        type: 'TEXT_POPUP',
        targetPlayer: opp,
        skillName: 'TRỰC GIAO',
        description: 'Bảo vệ bởi Trực Giao!',
        priority: 1
      });
      return;
    }

    oneCards.forEach(card => {
      const rarity = card.rarity;
      if (rarity === 'normal') return;

      // Tìm toán tử của đối thủ để vô hiệu hóa (Bỏ qua lá Normal vì không có kỹ năng)
      const targetOp = state[opp].cards.find(c => {
        if (c.type !== 'operator' || state[opp].disabledSkills.has(c.id) || c.rarity === 'normal') return false;
        if (rarity === 'rare')  return c.value === '*';           // R: Vô hiệu Nhân (*)
        if (rarity === 'super') return c.value === '/';           // SR: Vô hiệu Chia (/)
        return c.value === '*' || c.value === '/';                // UR: Vô hiệu cả Nhân và Chia
      });

      if (targetOp) {
        state[opp].disabledSkills.add(targetOp.id);
        state.events.push({
          type: 'NEUTRALIZED',
          sourceCardId: card.id,
          targetCardId: targetOp.id,
          targetPlayer: opp,
          skillName: 'ĐƠN VỊ',
          description: `Vô hiệu hóa phép tính [${targetOp.value}]`,
          priority: 1
        });
      }
    });
  }
}
