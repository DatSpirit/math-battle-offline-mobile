// pvp/eloCalculator.ts — ELO Rating System for PvP
// K-factor = 32 (standard for new players)

const K = 32;

/**
 * Tính ELO mới cho cả 2 người chơi sau trận đấu.
 * @param winnerElo ELO hiện tại của người thắng
 * @param loserElo  ELO hiện tại của người thua
 * @returns [winnerChange, loserChange] — số điểm thay đổi
 */
export function calculateEloChange(winnerElo: number, loserElo: number): [number, number] {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));

  return [winnerChange, loserChange]; // [+positive, -negative]
}

/**
 * Tính ELO cho trận hòa
 */
export function calculateEloChangeDraw(elo1: number, elo2: number): [number, number] {
  const expected1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
  const expected2 = 1 - expected1;

  return [
    Math.round(K * (0.5 - expected1)),
    Math.round(K * (0.5 - expected2)),
  ];
}
