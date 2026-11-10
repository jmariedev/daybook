import { CATEGORIES, DONE_STACK, STACK_COUNT } from './categories';
import type { CategorySlug } from './categories';
import { daysBetween, todayISO } from './dates';
import type { Card, Persistence, SavedState } from './persistence';

/** Each stack holds this many prompts, and fills back up to it every morning. */
const DAILY_CARDS = 4;

export interface Snapshot {
  current: number;
  /** One list per stack, top card first. The last list is Done. */
  stacks: Card[][];
}

/** Things the card stack animates and plays sounds for. */
export type MotionEvent =
  | { type: 'flip'; card: Card; reverse: boolean }
  | { type: 'shuffle'; cards: Card[] }
  | { type: 'select'; previous: number; next: number }
  | { type: 'cardChanged'; card: Card };

type Bank = Record<CategorySlug, string[]>;

const newId = () => crypto.randomUUID();

export class DaybookStore {
  private stacks: Card[][] = Array.from({ length: STACK_COUNT }, () => []);
  private current = 0;
  private dealt: Record<number, number> = {};
  private lastDeal = '';
  private snapshot!: Snapshot;
  private listeners = new Set<() => void>();
  private motionListeners = new Set<(event: MotionEvent) => void>();

  constructor(
    private persistence: Persistence,
    private bank: Bank,
    private today: () => string = todayISO,
  ) {
    this.replaceState(persistence.load());
  }

  /** Loads saved progress, or starts fresh when given nothing. */
  replaceState(saved: Partial<SavedState> | null) {
    const date = this.today();
    this.stacks = Array.from({ length: STACK_COUNT }, () => []);
    this.lastDeal = saved?.lastDeal ?? date;
    this.dealt = { ...saved?.dealt };

    if (saved?.cards?.length) {
      for (const card of saved.cards) {
        const withId = { ...card, id: card.id ?? newId() };
        this.stacks[withId.doneAt ? DONE_STACK : withId.cat].push(withId);
      }
    } else {
      CATEGORIES.forEach((category, cat) => {
        const opening = this.bank[category.slug].slice(0, DAILY_CARDS);
        this.stacks[cat] = opening.map((text) => ({ id: newId(), cat, text, date, doneAt: null }));
        this.dealt[cat] = opening.length;
      });
    }
    CATEGORIES.forEach((_, cat) => {
      this.dealt[cat] ??= DAILY_CARDS;
    });

    this.stacks.slice(0, CATEGORIES.length).forEach((stack) => {
      stack.length = Math.min(stack.length, DAILY_CARDS);
    });
    this.dealNewDay();
    this.commit();
  }

  /** The dealing progress that gets saved alongside the cards. */
  getProgress() {
    return { dealt: this.dealt, lastDeal: this.lastDeal };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  onMotion(listener: (event: MotionEvent) => void) {
    this.motionListeners.add(listener);
    return () => this.motionListeners.delete(listener);
  }

  getSnapshot = () => this.snapshot;

  next() {
    const stack = this.stacks[this.current];
    if (stack.length < 2) return;
    const card = stack.shift()!;
    stack.push(card);
    this.emitMotion({ type: 'flip', card, reverse: false });
    this.commit();
  }

  back() {
    const stack = this.stacks[this.current];
    if (stack.length < 2) return;
    const card = stack.pop()!;
    stack.unshift(card);
    this.emitMotion({ type: 'flip', card, reverse: true });
    this.commit();
  }

  shuffle() {
    const stack = this.stacks[this.current];
    if (stack.length < 2) return;
    const previousTop = stack[0];
    for (let i = stack.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [stack[i], stack[j]] = [stack[j], stack[i]];
    }
    // A shuffle that leaves the same card on top would look like nothing happened.
    if (stack[0] === previousTop) {
      const swap = 1 + Math.floor(Math.random() * (stack.length - 1));
      [stack[0], stack[swap]] = [stack[swap], stack[0]];
    }
    this.emitMotion({ type: 'shuffle', cards: [...stack] });
    this.commit();
  }

  /** On the current stack: finishes the top card, or puts a done card back. */
  actOnTopCard() {
    const top = this.stacks[this.current][0];
    if (!top) return;
    if (this.current === DONE_STACK) this.putBack(top.id);
    else this.markDone(top.id);
  }

  markDone(id: string) {
    const card = this.findCard(id);
    if (!card || card.doneAt) return;
    this.stacks[card.cat] = this.stacks[card.cat].filter((c) => c !== card);
    card.doneAt = this.today();
    this.stacks[DONE_STACK].unshift(card);
    this.emitMotion({ type: 'cardChanged', card });
    this.commit();
  }

  putBack(id: string) {
    const card = this.stacks[DONE_STACK].find((c) => c.id === id);
    if (!card) return;
    this.stacks[DONE_STACK] = this.stacks[DONE_STACK].filter((c) => c !== card);
    card.doneAt = null;
    this.stacks[card.cat].unshift(card);
    this.emitMotion({ type: 'cardChanged', card });
    this.commit();
  }

  /** Undoes the most recent done card and shows its stack. */
  undoLast() {
    const card = this.stacks[DONE_STACK][0];
    if (!card) return;
    this.putBack(card.id);
    this.select(card.cat);
  }

  /** Moves a card to the top of its stack and shows that stack. */
  openCard(id: string) {
    const card = this.findCard(id);
    if (!card) return;
    const index = card.doneAt ? DONE_STACK : card.cat;
    this.stacks[index] = [card, ...this.stacks[index].filter((c) => c !== card)];
    this.commit();
    this.select(index);
  }

  select(next: number) {
    if (next === this.current) return;
    const previous = this.current;
    this.current = next;
    this.emitMotion({ type: 'select', previous, next });
    this.commit();
  }

  private findCard(id: string) {
    return this.stacks.flat().find((c) => c.id === id);
  }

  /** On a new day, tops each stack back up. Prompts still waiting stay where they are. */
  private dealNewDay() {
    const date = this.today();
    if (daysBetween(this.lastDeal, date) <= 0) return;

    CATEGORIES.forEach((category, cat) => {
      const list = this.bank[category.slug];
      const stack = this.stacks[cat];
      // Stepping through the whole list at most once skips any prompt already in the stack.
      for (let tries = 0; stack.length < DAILY_CARDS && tries < list.length; tries++) {
        const text = list[this.dealt[cat] % list.length];
        this.dealt[cat]++;
        if (!stack.some((c) => c.text === text)) {
          stack.unshift({ id: newId(), cat, text, date, doneAt: null });
        }
      }
    });
    this.lastDeal = date;
  }

  private emitMotion(event: MotionEvent) {
    this.motionListeners.forEach((listener) => listener(event));
  }

  private commit() {
    this.snapshot = { current: this.current, stacks: this.stacks.map((stack) => [...stack]) };
    this.persistence.save({
      cards: this.stacks.flat(),
      dealt: this.dealt,
      lastDeal: this.lastDeal,
    });
    this.listeners.forEach((listener) => listener());
  }
}
