import { useMemo } from 'react';
import { evaluate } from 'mathjs';

interface ParseResult {
  result: number | null;
  expression: string;
  error: string | null;
}

/**
 * Parses a list of card values into a math expression based on the current turn mode.
 * Turn 1: single digit comparison.
 * Turn 2: concatenation mode (e.g. [3, 8] → 38).
 * Turn 3+: full math expression evaluation.
 */
export const useMathParser = (cards: string[], turn: number): ParseResult => {
  const cardsKey = cards.join('|');

  return useMemo((): ParseResult => {
    if (cards.length === 0) {
      return { result: null, expression: '', error: null };
    }

    if (turn === 1) {
      const val = parseInt(cards[0]);
      return {
        result: isNaN(val) ? null : val,
        expression: cards[0],
        error: isNaN(val) ? 'Number card only' : null,
      };
    }

    if (turn === 2) {
      const expression = cards.join('');
      const val = parseInt(expression);
      return {
        result: isNaN(val) ? null : val,
        expression,
        error: isNaN(val) ? 'Number cards only' : null,
      };
    }

    // Turns 3-6: math expression
    const expression = cards.join('');
    try {
      const raw = evaluate(expression);
      if (typeof raw !== 'number' || !isFinite(raw)) {
        return { result: null, expression, error: 'Invalid' };
      }
      return { result: raw, expression, error: null };
    } catch {
      return { result: null, expression, error: 'Incomplete' };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsKey, turn]);
};
