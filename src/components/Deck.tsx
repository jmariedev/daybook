import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { CATEGORIES, DONE_INK, DONE_STACK } from '../data/categories';
import { formatDate } from '../data/dates';
import type { Card } from '../data/persistence';
import type { DaybookStore, Snapshot } from '../data/store';
import { playFlipSound, playShuffleSound } from '../sound/cardSounds';
import { CategoryIcon, CheckIcon, ChevronLeft, ChevronRight } from './Icons';
import { Illustration } from './Illustrations';

/** These match the card animations in styles.css. */
const MOTION_MS = 500;
const SHUFFLE_MS = 860;
const SWIPE_PIXELS = 56;
const DRAG_START_PIXELS = 6;
const MAX_DOTS = 10;

type Leaving = { card: Card; to: 'left' | 'right' | 'up' | 'shuffle' };

function CardFace({ card, live }: { card: Card; live?: boolean }) {
  const category = CATEGORIES[card.cat];
  const style = { '--band': card.doneAt ? DONE_INK : category.ink } as CSSProperties;
  return (
    <div className="card-face" style={style}>
      <span className="card-icon">
        <CategoryIcon category={category} />
      </span>
      <p className="prompt" aria-live={live ? 'polite' : undefined}>
        {card.text}
      </p>
      <Illustration cat={card.cat} />
      <div className="band">
        <span>
          <CategoryIcon category={category} />
          {category.name}
        </span>
        {card.doneAt ? (
          <span>
            <CheckIcon width={2.6} />
            Done
          </span>
        ) : (
          <span>{formatDate(card.date)}</span>
        )}
      </div>
    </div>
  );
}

/** Shows which card of the stack is on top, as words and a row of dots. */
function CardPlace({ place, total }: { place: number; total: number }) {
  return (
    <div className="card-place" aria-label={`Card ${place + 1} of ${total}`} role="status">
      {total <= MAX_DOTS && (
        <span
          className="place-dots"
          aria-hidden="true"
          style={{ '--place': place } as CSSProperties}
        >
          {Array.from({ length: total }, (_, dot) => (
            <i key={dot} />
          ))}
          <b />
        </span>
      )}
      <span aria-hidden="true">
        {place + 1} of {total}
      </span>
    </div>
  );
}

interface Props {
  store: DaybookStore;
  snapshot: Snapshot;
}

/** The current stack: its top card, the cards behind it, and the arrows. */
export function Deck({ store, snapshot }: Props) {
  const cards = snapshot.stacks[snapshot.current];
  const top = cards[0];
  const canFlip = cards.length > 1;
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const [motion, setMotion] = useState('');
  // The stack turns as cards flip, so its place in the round is counted here.
  const [turned, setTurned] = useState(0);
  const stack = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    let timer = 0;
    const animate = (next: Leaving | null, enter: string, duration = MOTION_MS) => {
      window.clearTimeout(timer);
      setLeaving(next);
      setMotion(enter);
      timer = window.setTimeout(() => {
        setLeaving(null);
        setMotion('');
        stack.current?.style.removeProperty('--thrown-from');
        stack.current?.style.removeProperty('--thrown-tilt');
      }, duration);
    };
    const stop = store.onMotion((event) => {
      if (event.type === 'flip') {
        playFlipSound();
        setTurned((count) => count + (event.reverse ? -1 : 1));
        // Dragged to the right: the old top card carries on out while the next comes in.
        const thrownRight = stack.current?.style.getPropertyValue('--thrown-from');
        const previousTop = store.getSnapshot().stacks[store.getSnapshot().current][0];
        if (event.reverse) {
          animate(thrownRight ? { card: previousTop, to: 'right' } : null, 'from-left');
        } else animate({ card: event.card, to: 'left' }, 'from-behind');
      } else if (event.type === 'shuffle') {
        playShuffleSound();
        setTurned(0);
        // The store has not published the change yet, so this is still the old top card.
        const previousTop = store.getSnapshot().stacks[store.getSnapshot().current][0];
        animate({ card: previousTop, to: 'shuffle' }, 'shuffling', SHUFFLE_MS);
      } else if (event.type === 'select') {
        setTurned(0);
        // The store has not published the change yet, so this is still the old stack.
        const previousTop = store.getSnapshot().stacks[event.previous][0];
        const forward = event.next > event.previous;
        animate(
          previousTop ? { card: previousTop, to: forward ? 'left' : 'right' } : null,
          forward ? 'from-right' : 'from-left',
        );
      } else if (event.card.doneAt) {
        animate({ card: event.card, to: 'up' }, 'from-behind');
      } else {
        animate(null, 'from-above');
      }
    });
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [store]);

  useEffect(() => {
    if (!canFlip) return;
    const flipFromKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select')) return;
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') store.back();
      else store.next();
    };
    window.addEventListener('keydown', flipFromKey);
    return () => window.removeEventListener('keydown', flipFromKey);
  }, [store, canFlip]);

  // The card follows your finger or mouse, then flips or springs back when you let go.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canFlip || !event.isPrimary || event.button !== 0) return;
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const moved = event.clientX - dragStart.current;
    if (Math.abs(moved) < DRAG_START_PIXELS && !event.currentTarget.dataset.dragging) return;
    // Kept as an attribute, because React rewrites the class when a card animation ends.
    event.currentTarget.dataset.dragging = 'true';
    event.currentTarget.style.setProperty('--drag', `${moved}px`);
    event.currentTarget.style.setProperty('--tilt', `${moved / 46}deg`);
  };
  const endDrag = (element: HTMLDivElement) => {
    delete element.dataset.dragging;
    element.style.removeProperty('--drag');
    element.style.removeProperty('--tilt');
    dragStart.current = null;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const moved = event.clientX - dragStart.current;
    const element = event.currentTarget;
    const thrown = Math.abs(moved) >= SWIPE_PIXELS;
    // A thrown card keeps going from where you let go of it.
    if (thrown) {
      element.style.setProperty('--thrown-from', `${moved}px`);
      element.style.setProperty('--thrown-tilt', `${moved / 46}deg`);
    }
    endDrag(element);
    if (thrown && moved < 0) store.next();
    else if (thrown) store.back();
  };

  const place = cards.length ? ((turned % cards.length) + cards.length) % cards.length : 0;

  return (
    <div className="deck-area">
      <div className="deck">
        <button
          type="button"
          className="arrow arrow-left"
          aria-label="Previous card"
          disabled={!canFlip}
          onClick={() => store.back()}
        >
          <ChevronLeft />
        </button>

        <div
          className={motion ? `stack in-motion ${motion}` : 'stack'}
          ref={stack}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={(event) => endDrag(event.currentTarget)}
        >
          {cards.length > 2 && <i className="behind far" />}
          {cards.length > 1 && <i className="behind near" />}
          {top ? (
            <div className="card top-card" key={top.id}>
              <CardFace card={top} live />
            </div>
          ) : (
            <div className="card empty-card">
              <p>
                {snapshot.current === DONE_STACK
                  ? 'Cards you mark done will rest here.'
                  : 'Every card here is done. New prompts arrive tomorrow.'}
              </p>
            </div>
          )}
          {leaving && (
            <div className={`card leaving to-${leaving.to}`} aria-hidden="true">
              <CardFace card={leaving.card} />
            </div>
          )}
        </div>

        <button
          type="button"
          className="arrow arrow-right"
          aria-label="Next card"
          disabled={!canFlip}
          onClick={() => store.next()}
        >
          <ChevronRight />
        </button>
      </div>
      {canFlip && <CardPlace place={place} total={cards.length} />}
    </div>
  );
}
