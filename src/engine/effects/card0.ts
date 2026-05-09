import type { PipelineState, CardEffect } from './effectTypes';

export class Card0Effect implements CardEffect {
  id = '0';

  apply(state: PipelineState): void {
    // Tìm các thẻ số 0 của cả 2 bên
    this.processPlayer(state, 'player1', 'player2');
    this.processPlayer(state, 'player2', 'player1');
  }

  private processPlayer(state: PipelineState, me: 'player1' | 'player2', opp: 'player1' | 'player2') {
    const zeroCards = state[me].cards.filter(c => c.value === '0' && c.rarity !== 'normal');
    
    if (state[opp].isImmuneToDebuffs && state[opp].blockedSkillsCount < state[opp].maxBlockedSkills && zeroCards.length > 0) {
      state[opp].blockedSkillsCount++;
      state.events.push({
        type: 'TEXT_POPUP',
        targetPlayer: opp,
        skillName: 'TRỰC GIAO',
        description: `Bảo vệ bởi Trực Giao! (${state[opp].blockedSkillsCount}/${state[opp].maxBlockedSkills})`,
        priority: 1
      });
      return;
    }

    zeroCards.forEach(card => {
      const rarity = card.rarity;
      
      // Tìm 1 lá bài của đối thủ để vô hiệu hóa (ưu tiên lá có giá trị lớn nhất)
      const target = [...state[opp].cards]
        .filter(c => {
          // Nếu mình là Rare: Chỉ vô hiệu kỹ năng -> Bỏ qua lá Normal vì không có kỹ năng
          if (rarity === 'rare' && c.rarity === 'normal') return false;
          
          // Nếu mình là Super/Ultra: Vô hiệu giá trị -> Chấp nhận lá Normal vì vô hiệu giá trị vẫn có ích
          return !state[opp].disabledCardIds.has(c.id);
        })
        .sort((a, b) => parseInt(b.value || '0') - parseInt(a.value || '0'))[0];

      if (!target) return;

      let desc = '';

      if (rarity === 'rare') {
        state[opp].disabledSkills.add(target.id);
        desc = `Vô hiệu kỹ năng lá [${target.value}]`;
      } else if (rarity === 'super') {
        state[opp].disabledCardIds.add(target.id); // Vô hiệu giá trị
        desc = `Vô hiệu giá trị lá [${target.value}]`;
      } else if (rarity === 'ultra') {
        state[opp].disabledCardIds.add(target.id);
        state[opp].disabledSkills.add(target.id);
        desc = `Xóa sổ hoàn toàn lá [${target.value}]`;
      }

      state.events.push({
        type: 'NEUTRALIZED',
        sourceCardId: card.id,
        targetCardId: target.id,
        targetPlayer: opp,
        skillName: 'GỐC TỌA ĐỘ',
        description: `Gốc Tọa Độ: ${desc}`,
        priority: 1
      });
    });
  }
}
