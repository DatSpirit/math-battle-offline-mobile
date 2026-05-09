import type { GameCard } from '../../types/game';
import { computeTurnResult } from './matchEngine';
import { smartDraw } from './deckLogic';

/**
 * GameFlow Engine - Chứa logic "Kế thừa" dùng chung cho cả AI và PvP.
 * Giúp tránh lặp lại code ở nhiều nơi.
 */
export const GameFlow = {
  /**
   * Xử lý kết quả của một Round đấu (Dùng chung cho cả AI, Local PvP, Online PvP)
   */
  processRoundResult: (
    turn: number,
    p1Cards: GameCard[],
    p2Cards: GameCard[],
    currentScores: { p1: number; p2: number }
  ) => {
    const result = computeTurnResult(turn, p1Cards, p2Cards, {
        currentTurn: turn,
        playerCards: p1Cards,
        aiCards: p2Cards,
        playerScore: currentScores.p1,
        aiScore: currentScores.p2,
        history: []
    }, { playerTimeout: false, aiTimeout: false });
    
    return {
      result,
      newScores: {
        p1: currentScores.p1 + result.playerPointsEarned,
        p2: currentScores.p2 + result.aiPointsEarned
      },
      nextPhase: turn === 6 ? 'game_over' : 'round_result'
    };
  },

  /**
   * Xử lý rút bài tự động sau mỗi round (Dùng chung)
   */
  handlePostRoundDrawing: (
    turn: number,
    hands: { p1: GameCard[]; p2: GameCard[] },
    reserves: { p1: GameCard[]; p2: GameCard[] },
    playedCards: { p1: GameCard[]; p2: GameCard[] }
  ) => {
    // 1. Lọc bỏ bài đã đánh
    let p1Hand = hands.p1.filter(c => !playedCards.p1.some(p => p.id === c.id));
    let p2Hand = hands.p2.filter(c => !playedCards.p2.some(p => p.id === c.id));
    
    let p1Res = [...reserves.p1];
    let p2Res = [...reserves.p2];

    // 2. Rút bài mới nếu chưa phải vòng cuối
    if (turn < 6) {
      [p1Hand, p1Res] = smartDraw(p1Hand, p1Res, turn, turn);
      [p2Hand, p2Res] = smartDraw(p2Hand, p2Res, turn, turn);
    }

    return {
      hands: { p1: p1Hand, p2: p2Hand },
      reserves: { p1: p1Res, p2: p2Res }
    };
  }
};
