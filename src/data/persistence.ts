export interface Card {
  id: string;
  /** Index into CATEGORIES. */
  cat: number;
  text: string;
  /** Date the card was dealt, YYYY-MM-DD. */
  date: string;
  /** Date the card was finished, or null while it is still in its stack. */
  doneAt: string | null;
}

export interface SavedState {
  /** Stack order is kept by the order of this list. */
  cards: Card[];
  /** How many prompts have been dealt from each category's list. */
  dealt: Record<number, number>;
  lastDeal: string;
}

/** Where progress lives. A Supabase version can implement this same shape. */
export interface Persistence {
  load(): Partial<SavedState> | null;
  save(state: SavedState): void;
}

const KEY = 'daybook:v1';

export const browserPersistence: Persistence = {
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      return saved && Array.isArray(saved.cards) ? saved : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private browsing or full storage: the app keeps working for this visit.
    }
  },
};
