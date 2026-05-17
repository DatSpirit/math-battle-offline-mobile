// pvp/validator.ts — Server-side play validation (Anti-cheat)
// Server giữ hand state, kiểm tra card ownership trước khi chấp nhận

interface ServerCard {
  id: string;
  value: string;
  type: 'number' | 'operator';
}

/**
 * Kiểm tra tính hợp lệ của bài đánh từ client.
 * Anti-cheat: Server giữ hand state, client chỉ gửi card IDs.
 */
export function validatePlay(
  submittedCardIds: string[],
  serverHand: ServerCard[],
  turn: number
): { valid: boolean; error?: string; cards: ServerCard[] } {
  // 1. Kiểm tra đúng số lượng
  if (submittedCardIds.length !== turn) {
    return { valid: false, error: `Cần đúng ${turn} lá, nhận ${submittedCardIds.length}`, cards: [] };
  }

  // 2. Kiểm tra không có duplicate
  const uniqueIds = new Set(submittedCardIds);
  if (uniqueIds.size !== submittedCardIds.length) {
    return { valid: false, error: 'Phát hiện lá bài trùng lặp', cards: [] };
  }

  // 3. Kiểm tra card ownership — TẤT CẢ card phải nằm trong serverHand
  const handMap = new Map(serverHand.map(c => [c.id, c]));
  const resolvedCards: ServerCard[] = [];

  for (const cardId of submittedCardIds) {
    const card = handMap.get(cardId);
    if (!card) {
      return { valid: false, error: `Card ${cardId} không tồn tại trong hand`, cards: [] };
    }
    resolvedCards.push(card);
  }

  // 4. Validate thể loại theo turn
  if (turn <= 2) {
    if (resolvedCards.some(c => c.type !== 'number')) {
      return { valid: false, error: 'Lượt 1-2: chỉ dùng thẻ số', cards: [] };
    }
  } else {
    const ops = resolvedCards.filter(c => c.type === 'operator');
    if (turn <= 4 && ops.length !== 1) {
      return { valid: false, error: 'Lượt 3-4: cần đúng 1 thẻ phép tính', cards: [] };
    }
    if (turn >= 5 && ops.length < 2) {
      return { valid: false, error: 'Lượt 5-6: cần ít nhất 2 thẻ phép tính', cards: [] };
    }
  }

  return { valid: true, cards: resolvedCards };
}

/**
 * Tính giá trị biểu thức từ cards (server-side version)
 * Giống evaluatePlay() bên client nhưng simplified cho server.
 */
export function evaluateServerPlay(cards: ServerCard[], turn: number): number | null {
  if (cards.length === 0) return null;

  if (turn === 1) {
    const val = parseInt(cards[0].value);
    return isNaN(val) ? null : val;
  }

  if (turn === 2) {
    const expression = cards.map(c => c.value).join('');
    const val = parseInt(expression);
    return isNaN(val) ? null : val;
  }

  // Validate operator placement
  if (cards[0].type === 'operator' || cards[cards.length - 1].type === 'operator') return null;
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].type === 'operator' && cards[i + 1].type === 'operator') return null;
  }

  const expression = cards.map(c => c.value).join('');

  try {
    if (/[^0-9+\-*/.\\s]/.test(expression)) return null;
    if (/\/0(?!\.)/.test(expression)) return null;
    const result = new Function(`"use strict"; return (${expression})`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}
