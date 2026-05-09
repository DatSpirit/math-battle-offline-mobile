import { computeTurnResult } from './matchEngine';
import type { GameCard } from '../../types/game';
import type { AbilityContext } from './abilityEngine';

// MOCK DATA: Hai bộ bài giống hệt nhau về chỉ số
const createMockCard = (id: string, value: string, stars: number): GameCard => ({
  id,
  value,
  type: isNaN(parseInt(value)) ? 'operator' : 'number',
  rarity: 'rare',
  stars,
  level: 1,
  name: 'Test Card',
});

const testFairness = () => {
  const turn = 2;
  // Cả hai đều dùng lá '9' có 2 sao và lá '9' có 2 sao
  const pCards = [createMockCard('p1', '9', 2), createMockCard('p2', '9', 2)];
  const aCards = [createMockCard('a1', '9', 2), createMockCard('a2', '9', 2)];

  const context: AbilityContext = {
    currentTurn: turn,
    playerCards: pCards,
    aiCards: aCards,
    playerScore: 0,
    aiScore: 0,
    history: []
  };

  const result = computeTurnResult(turn, pCards, aCards, context);

  console.log('--- KIỂM TRA TÍNH CÔNG BẰNG ---');
  console.log(`Kết quả Người: ${result.playerExpression} = ${result.playerValue}`);
  console.log(`Điểm Người: ${result.playerPointsEarned}`);
  console.log(`Kết quả Máy: ${result.aiExpression} = ${result.aiValue}`);
  console.log(`Điểm Máy: ${result.aiPointsEarned}`);

  if (result.playerPointsEarned === result.aiPointsEarned) {
    console.log('=> KẾT LUẬN: LOGIC HOÀN TOÀN CÔNG BẰNG!');
  } else {
    console.log('=> KẾT LUẬN: CÓ SỰ LỆCH ĐIỂM TRONG LOGIC!');
  }
};

testFairness();
