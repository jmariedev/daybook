import { CATEGORIES } from './categories';
import type { Card } from './persistence';

/** One row of the daybook_cards table. */
export interface CardRow {
  id: string;
  category: string;
  prompt: string;
  added_on: string;
  done_on: string | null;
  position: number;
}

/**
 * Position counts up from the bottom of each stack. Adding a card to the top of
 * a stack then leaves every other row alone, so a long Done history stays cheap.
 */
export function cardsToRows(stacks: Card[][]): CardRow[] {
  return stacks.flatMap((stack) =>
    stack.map((card, index) => ({
      id: card.id,
      category: CATEGORIES[card.cat].slug,
      prompt: card.text,
      added_on: card.date,
      done_on: card.doneAt,
      position: stack.length - 1 - index,
    })),
  );
}

/** Rows must be sorted by position, highest first. Top cards come first per stack. */
export function rowsToCards(rows: CardRow[]): Card[] {
  return rows.flatMap((row) => {
    const cat = CATEGORIES.findIndex((category) => category.slug === row.category);
    if (cat < 0) return [];
    return [{ id: row.id, cat, text: row.prompt, date: row.added_on, doneAt: row.done_on }];
  });
}

/** What must change in the database to get from the last saved rows to the current ones. */
export function diffRows(saved: Map<string, CardRow>, current: CardRow[]) {
  const currentIds = new Set(current.map((row) => row.id));
  return {
    upserts: current.filter((row) => JSON.stringify(saved.get(row.id)) !== JSON.stringify(row)),
    deletes: [...saved.keys()].filter((id) => !currentIds.has(id)),
  };
}
