import { describe, expect, it } from 'vitest';
import { cardsToRows, diffRows, rowsToCards } from './cloudRows';
import type { Card } from './persistence';

const card = (id: string, cat: number, doneAt: string | null = null): Card => ({
  id,
  cat,
  text: `prompt ${id}`,
  date: '2026-11-04',
  doneAt,
});

describe('cloud rows', () => {
  it('keeps stack order through a round trip', () => {
    const stacks = [
      [card('a', 0), card('b', 0)],
      [card('c', 1)],
      [],
      [],
      [card('d', 2, '2026-11-04')],
    ];
    const rows = cardsToRows(stacks).sort((x, y) => y.position - x.position);
    const cards = rowsToCards(rows);
    expect(cards.filter((c) => c.cat === 0).map((c) => c.id)).toEqual(['a', 'b']);
    expect(cards.find((c) => c.id === 'd')?.doneAt).toBe('2026-11-04');
  });

  it('only rewrites the row that changed when a card joins the top of Done', () => {
    const before = cardsToRows([
      [],
      [],
      [],
      [],
      [card('a', 0, '2026-11-01'), card('b', 0, '2026-11-01')],
    ]);
    const saved = new Map(before.map((row) => [row.id, row]));
    const after = cardsToRows([
      [],
      [],
      [],
      [],
      [card('c', 0, '2026-11-04'), card('a', 0, '2026-11-01'), card('b', 0, '2026-11-01')],
    ]);
    const { upserts, deletes } = diffRows(saved, after);
    expect(upserts.map((row) => row.id)).toEqual(['c']);
    expect(deletes).toEqual([]);
  });

  it('finds removed cards', () => {
    const saved = new Map(cardsToRows([[card('a', 0), card('b', 0)]]).map((row) => [row.id, row]));
    const { deletes } = diffRows(saved, cardsToRows([[card('a', 0)]]));
    expect(deletes).toEqual(['b']);
  });
});
