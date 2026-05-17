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
 * Sử dụng safe evaluator thay vì new Function() để tránh code injection.
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

  // Safe math evaluation (no new Function!)
  try {
    const result = safeEval(cards);
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

/**
 * Safe recursive descent parser for simple math expressions.
 * Supports: +, -, *, / with correct precedence.
 * NO code execution — purely arithmetic.
 */
function safeEval(cards: ServerCard[]): number {
  // Build tokens: multi-digit numbers + operators
  const tokens: { type: 'num' | 'op'; value: string }[] = [];
  let currentNum = '';

  for (const card of cards) {
    if (card.type === 'number') {
      currentNum += card.value;
    } else {
      if (currentNum) {
        tokens.push({ type: 'num', value: currentNum });
        currentNum = '';
      }
      tokens.push({ type: 'op', value: card.value });
    }
  }
  if (currentNum) tokens.push({ type: 'num', value: currentNum });

  // Parse with operator precedence: * / first, then + -
  let pos = 0;

  function parseExpr(): number {
    let left = parseTerm();
    while (pos < tokens.length && tokens[pos].type === 'op' && (tokens[pos].value === '+' || tokens[pos].value === '-')) {
      const op = tokens[pos++].value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePrimary();
    while (pos < tokens.length && tokens[pos].type === 'op' && (tokens[pos].value === '*' || tokens[pos].value === '/')) {
      const op = tokens[pos++].value;
      const right = parsePrimary();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parsePrimary(): number {
    if (pos >= tokens.length || tokens[pos].type !== 'num') throw new Error('Expected number');
    return parseFloat(tokens[pos++].value);
  }

  return parseExpr();
}
