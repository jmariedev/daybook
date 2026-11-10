import { describe, expect, it } from 'vitest';
import { DONE_STACK } from './categories';
import type { Persistence, SavedState } from './persistence';
import { DaybookStore } from './store';

const list = (name: string) => Array.from({ length: 12 }, (_, i) => `${name} ${i}`);
const bank = {
  gratitude: list('g'),
  reflection: list('r'),
  creative: list('c'),
  story: list('s'),
};

function memory(
  start: Partial<SavedState> | null = null,
): Persistence & { saved: SavedState | null } {
  return {
    saved: null,
    load: () => start,
    save(state) {
      this.saved = JSON.parse(JSON.stringify(state));
    },
  };
}

describe('DaybookStore', () => {
  it('always puts a different card on top when shuffling', () => {
    const store = new DaybookStore(memory(), bank, () => '2026-11-04');
    const size = store.getSnapshot().stacks[0].length;
    for (let i = 0; i < 200; i++) {
      const before = store.getSnapshot().stacks[0];
      store.shuffle();
      const after = store.getSnapshot().stacks[0];
      expect(after[0].id).not.toBe(before[0].id);
      expect(after).toHaveLength(size);
      expect(new Set(after.map((card) => card.id))).toEqual(new Set(before.map((card) => card.id)));
    }
  });

  it('starts each stack with four cards', () => {
    const store = new DaybookStore(memory(), bank, () => '2026-11-04');
    const { stacks } = store.getSnapshot();
    expect(stacks.slice(0, 4).map((s) => s.length)).toEqual([4, 4, 4, 4]);
    expect(stacks[DONE_STACK]).toEqual([]);
  });

  it('fills a stack back up to four on a new day, keeping what was waiting', () => {
    const first = memory();
    const today = new DaybookStore(first, bank, () => '2026-11-04');
    today.actOnTopCard();
    today.actOnTopCard();
    const waiting = today.getSnapshot().stacks[0].map((card) => card.id);
    const store = new DaybookStore(memory(first.saved), bank, () => '2026-11-05');
    const gratitude = store.getSnapshot().stacks[0];
    expect(gratitude).toHaveLength(4);
    expect(gratitude.map((card) => card.text).slice(0, 2)).toEqual(['g 5', 'g 4']);
    expect(gratitude.slice(2).map((card) => card.id)).toEqual(waiting);
    expect(store.getSnapshot().stacks[DONE_STACK]).toHaveLength(2);
  });

  it('adds nothing on a new day when nothing was finished', () => {
    const first = memory();
    const today = new DaybookStore(first, bank, () => '2026-11-04');
    const before = today.getSnapshot().stacks[0].map((card) => card.id);
    const store = new DaybookStore(memory(first.saved), bank, () => '2026-11-09');
    expect(store.getSnapshot().stacks[0].map((card) => card.id)).toEqual(before);
  });

  it('trims stacks saved before the four card limit, and leaves Done alone', () => {
    const cards = Array.from({ length: 9 }, (_, i) => ({
      id: `c${i}`,
      cat: 0,
      text: `old ${i}`,
      date: '2026-11-01',
      doneAt: i > 5 ? '2026-11-02' : null,
    }));
    const store = new DaybookStore(
      memory({ cards, dealt: { 0: 9, 1: 0, 2: 0, 3: 0 }, lastDeal: '2026-11-04' }),
      bank,
      () => '2026-11-04',
    );
    const { stacks } = store.getSnapshot();
    expect(stacks[0].map((card) => card.id)).toEqual(['c0', 'c1', 'c2', 'c3']);
    expect(stacks[DONE_STACK]).toHaveLength(3);
  });

  it('does not deal twice on the same day', () => {
    const first = memory();
    const today = new DaybookStore(first, bank, () => '2026-11-04');
    today.actOnTopCard();
    const store = new DaybookStore(memory(first.saved), bank, () => '2026-11-04');
    expect(store.getSnapshot().stacks[0]).toHaveLength(3);
  });

  it('moves cards to Done with a date, and back', () => {
    const saved = memory();
    const store = new DaybookStore(saved, bank, () => '2026-11-04');
    const top = store.getSnapshot().stacks[0][0];
    store.actOnTopCard();
    expect(store.getSnapshot().stacks[DONE_STACK][0].id).toBe(top.id);
    expect(saved.saved?.cards.find((c) => c.id === top.id)?.doneAt).toBe('2026-11-04');
    store.putBack(top.id);
    expect(store.getSnapshot().stacks[0][0].id).toBe(top.id);
    expect(store.getSnapshot().stacks[DONE_STACK]).toEqual([]);
  });

  it('restores progress and adds ids to older saved cards', () => {
    const store = new DaybookStore(
      memory({
        cards: [
          { cat: 1, text: 'old', date: '2026-11-01', doneAt: '2026-11-02' } as never,
          { cat: 0, text: 'open', date: '2026-11-01', doneAt: null } as never,
        ],
        dealt: { 0: 5, 1: 5, 2: 5, 3: 5 },
        lastDeal: '2026-11-04',
      }),
      bank,
      () => '2026-11-04',
    );
    const { stacks } = store.getSnapshot();
    expect(stacks[DONE_STACK][0].text).toBe('old');
    expect(stacks[DONE_STACK][0].id).toBeTruthy();
    expect(stacks[0][0].text).toBe('open');
  });

  it('flips the top card to the bottom and back', () => {
    const store = new DaybookStore(memory(), bank, () => '2026-11-04');
    const top = store.getSnapshot().stacks[0][0];
    store.next();
    expect(store.getSnapshot().stacks[0].at(-1)?.id).toBe(top.id);
    store.back();
    expect(store.getSnapshot().stacks[0][0].id).toBe(top.id);
  });
});

describe('replaceState', () => {
  it('swaps in an account copy and fills it up for a new day', () => {
    const store = new DaybookStore(memory(), bank, () => '2026-11-06');
    store.replaceState({
      cards: [{ id: 'x', cat: 0, text: 'mine', date: '2026-11-01', doneAt: null }],
      dealt: { 0: 5, 1: 5, 2: 5, 3: 5 },
      lastDeal: '2026-11-05',
    });
    const gratitude = store.getSnapshot().stacks[0];
    expect(gratitude.map((c) => c.text)).toEqual(['g 7', 'g 6', 'g 5', 'mine']);
  });

  it('starts fresh when given nothing', () => {
    const store = new DaybookStore(memory(), bank, () => '2026-11-04');
    store.actOnTopCard();
    store.replaceState(null);
    expect(store.getSnapshot().stacks[DONE_STACK]).toEqual([]);
    expect(store.getSnapshot().stacks[0]).toHaveLength(4);
  });
});
