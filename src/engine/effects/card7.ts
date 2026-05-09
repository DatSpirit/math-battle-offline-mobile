import type { PipelineState, CardEffect } from './effectTypes';

export class Card7Effect implements CardEffect {
  id = '7';

  apply(state: PipelineState): void {
    // Xử lý đối kháng 7-vs-7 trước
    this.resolveDuels(state);
    
    // Xử lý kỹ năng truy vết lẻ của các thẻ 7 còn hiệu lực
    this.processPrimeSkills(state, 'player1', 'player2');
    this.processPrimeSkills(state, 'player2', 'player1');
  }

  private resolveDuels(state: PipelineState) {
    const p1Sevens = state.player1.cards.filter(c => c.value === '7');
    const p2Sevens = state.player2.cards.filter(c => c.value === '7');

    if (p1Sevens.length === 0 || p2Sevens.length === 0) return;

    // Luật đối kháng: So sánh rarity
    const rarityMap: Record<string, number> = { 'ultra': 3, 'super': 2, 'rare': 1, 'normal': 0 };
    
    // Theo dõi các lá đã "hành động" hoặc "bị hạ" trong lượt so này để đảm bảo 1-đối-1
    const p1Processed = new Set<string>();
    const p2Processed = new Set<string>();

    for (const c1 of p1Sevens) {
      if (state.player1.disabledSkills.has(c1.id) || p1Processed.has(c1.id)) continue;

      for (const c2 of p2Sevens) {
        if (state.player2.disabledSkills.has(c2.id) || p2Processed.has(c2.id)) continue;

        const r1 = rarityMap[c1.rarity || 'normal'];
        const r2 = rarityMap[c2.rarity || 'normal'];

        if (r1 === r2 && r1 > 0) {
          // Triệt tiêu nhau: Cả 2 đều mất hiệu lực
          const p1Blocked = state.player1.isImmuneToDebuffs;
          const p2Blocked = state.player2.isImmuneToDebuffs;

          if (!p1Blocked) state.player1.disabledSkills.add(c1.id);
          if (!p2Blocked) state.player2.disabledSkills.add(c2.id);
          
          p1Processed.add(c1.id);
          p2Processed.add(c2.id);

          if (!p1Blocked || !p2Blocked) {
            state.events.push({
              type: 'NEUTRALIZED',
              sourceCardId: c1.id,
              targetCardId: c2.id,
              targetPlayer: 'player1',
              skillName: 'ĐỐI KHÁNG',
              description: `Hai thẻ 7 triệt tiêu nhau!${p1Blocked || p2Blocked ? ' (Bảo vệ kích hoạt)' : ''}`,
              priority: 1
            });
          }
          break; // c1 đã xong việc
        } else if (r1 > r2) {
          // c1 thắng: c2 bị vô hiệu, c1 tiêu hao 1 lượt áp chế
          if (state.player2.isImmuneToDebuffs) {
            state.events.push({ type: 'TEXT_POPUP', targetPlayer: 'player2', skillName: 'TRỰC GIAO', description: 'Chặn áp chế 7!', priority: 1 });
            p1Processed.add(c1.id);
            break;
          }
          state.player2.disabledSkills.add(c2.id);
          p1Processed.add(c1.id);
          p2Processed.add(c2.id);

          state.events.push({
            type: 'NEUTRALIZED',
            sourceCardId: c1.id,
            targetCardId: c2.id,
            targetPlayer: 'player2',
            skillName: 'ÁP CHẾ',
            description: `Thẻ 7 áp chế thẻ đối thủ`,
            priority: 1
          });
          break; // c1 đã xong việc
        } else if (r2 > r1) {
          // c2 thắng: c1 bị vô hiệu, c2 tiêu hao 1 lượt áp chế
          if (state.player1.isImmuneToDebuffs) {
            state.events.push({ type: 'TEXT_POPUP', targetPlayer: 'player1', skillName: 'TRỰC GIAO', description: 'Chặn áp chế 7!', priority: 1 });
            p2Processed.add(c2.id);
            continue; // Thử c1 này với c2 khác? Không, c2 này đã "phòng thủ" xong.
          }
          state.player1.disabledSkills.add(c1.id);
          p1Processed.add(c1.id);
          p2Processed.add(c2.id);

          state.events.push({
            type: 'NEUTRALIZED',
            sourceCardId: c2.id,
            targetCardId: c1.id,
            targetPlayer: 'player1',
            skillName: 'ÁP CHẾ',
            description: `Thẻ 7 áp chế thẻ đối thủ`,
            priority: 1
          });
          break; // c1 đã bị hạ, không so với c2 khác nữa
        }
      }
    }
  }

  private processPrimeSkills(state: PipelineState, me: 'player1' | 'player2', opp: 'player1' | 'player2') {
    const activeSevens = state[me].cards.filter(c => c.value === '7' && !state[me].disabledSkills.has(c.id));
    
    if (state[opp].isImmuneToDebuffs && state[opp].blockedSkillsCount < state[opp].maxBlockedSkills && activeSevens.length > 0) {
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

    activeSevens.forEach(card => {
      const rarity = card.rarity || 'normal';
      if (rarity === 'normal') return;

      // Tìm lá số lẻ của đối thủ thỏa mãn điều kiện (Bỏ qua lá Normal vì không có kỹ năng)
      const target = state[opp].cards.find(c => {
        if (state[opp].disabledSkills.has(c.id) || c.rarity === 'normal') return false;
        const val = parseInt(c.value);
        if (isNaN(val) || val % 2 === 0) return false;

        if (rarity === 'rare') return val < 7;
        if (rarity === 'super') return val <= 7;
        return true; // Ultra: Bất kỳ lá lẻ nào
      });

      if (target) {
        state[opp].disabledSkills.add(target.id);
        
        // Cộng bonus % điểm (sẽ được cộng vào activeBonuses để tính ở bước sau)
        const bonusMap: Record<string, number> = { 'rare': 0.1, 'super': 0.2, 'ultra': 0.3 };
        const bonus = bonusMap[rarity] || 0;
        state[me].activeBonuses += bonus;

        const bonusDesc = bonus > 0 ? ` và +${Math.round(bonus * 100)}% điểm` : '';
        state.events.push({
          type: 'NEUTRALIZED',
          sourceCardId: card.id,
          targetCardId: target.id,
          targetPlayer: opp,
          skillName: 'SỐ LẺ',
          description: `Khóa kỹ năng thẻ [${target.value}]${bonusDesc}`,
          priority: 1
        });
      }
    });
  }
}
