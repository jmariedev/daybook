import { DONE_STACK } from '../data/categories';
import type { DaybookStore, Snapshot } from '../data/store';
import { CheckIcon, ShuffleIcon, UndoIcon } from './Icons';

/** The cheerful line above the stack, with the count in the stack's own color. */
export function StackStatus({ snapshot }: { snapshot: Snapshot }) {
  const count = snapshot.stacks[snapshot.current].length;
  const onDone = snapshot.current === DONE_STACK;

  let words = onDone ? 'finished so far' : 'options to choose from';
  let extra = onDone ? '' : ' today';
  if (count === 1) {
    words = onDone ? 'finished so far' : 'option left';
    extra = onDone ? '' : ' today';
  }

  return (
    <p className="stack-status" aria-live="polite">
      <b key={count} className={count ? undefined : 'is-zero'}>
        {count}
      </b>
      <span className="status-long">
        {count ? (
          <>
            {words}
            <i>{extra}</i>
          </>
        ) : onDone ? (
          'Your finished cards will rest here'
        ) : (
          'All caught up, time for tea'
        )}
      </span>
      <span className="status-short">{onDone ? 'done' : 'left'}</span>
    </p>
  );
}

export function DeckActions({ store, snapshot }: { store: DaybookStore; snapshot: Snapshot }) {
  const onDone = snapshot.current === DONE_STACK;
  const count = snapshot.stacks[snapshot.current].length;

  return (
    <div className="actions">
      <button
        type="button"
        className="round"
        aria-label="Shuffle"
        title="Shuffle"
        disabled={count < 2}
        onClick={() => store.shuffle()}
      >
        <ShuffleIcon />
      </button>
      {!onDone && (
        <button
          type="button"
          className="round"
          aria-label="Undo"
          title="Undo"
          disabled={!snapshot.stacks[DONE_STACK].length}
          onClick={() => store.undoLast()}
        >
          <UndoIcon />
        </button>
      )}
      {count > 0 && (
        <button type="button" className="primary" onClick={() => store.actOnTopCard()}>
          <CheckIcon />
          {onDone ? 'Put back' : 'Mark done'}
        </button>
      )}
    </div>
  );
}
