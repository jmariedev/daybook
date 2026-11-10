import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import type { CSSProperties, MutableRefObject, ReactNode } from 'react';
import type { CloudSync } from '../data/cloudSync';
import { CloseIcon, HelpIcon } from './Icons';
import {
  DoneCardScene,
  FlipCardsScene,
  Illustration,
  NewDayScene,
  NotebookScene,
} from './Illustrations';

/** Bumped when the how-to changes a lot, so everyone sees the new one once. */
const SEEN_KEY = 'daybook:how-to-seen:2';

const noCloud = { email: null as string | null, recovering: false };
const noSubscribe = () => () => undefined;

const SLIDES: Array<{
  art: ReactNode;
  wide?: boolean;
  title: string;
  text: string;
  note?: string;
}> = [
  {
    wide: true,
    art: [0, 1, 2, 3].map((cat) => <Illustration cat={cat} key={cat} />),
    title: 'Choose for today',
    text: 'Gratitude, Reflection, Creative, or Story for your own fantasy world. Pick whichever feels right.',
  },
  {
    art: <FlipCardsScene />,
    title: 'Flip through the cards',
    text: 'Use the arrows, your arrow keys, or drag a card aside. Shuffle when you want a surprise.',
  },
  {
    art: <NotebookScene />,
    title: 'Answer your way',
    text: 'Think it over, say it out loud, or write it in your favorite notebook. Daybook just asks.',
  },
  {
    art: <DoneCardScene />,
    title: 'Mark it done',
    text: 'Finished cards rest in the Done stack. Tap Undo if you want one back.',
  },
  {
    art: <NewDayScene />,
    title: 'Come back tomorrow',
    text: 'Each type has 4 options, fresh every morning. You never have to do them all.',
    note: 'Without an account, your cards stay only in this browser and can be lost. Sign in to save them.',
  },
];

function hasSeen(key: string) {
  try {
    return localStorage.getItem(key) === 'yes';
  } catch {
    return true;
  }
}

function remember(key: string) {
  try {
    localStorage.setItem(key, 'yes');
  } catch {
    // Without storage, this simply shows again on the next visit.
  }
}

/**
 * A short slideshow of how Daybook works. It opens by itself on a first visit and on an
 * account's first sign-in here, and any time from the ? button.
 */
export function HowTo({
  cloud,
  opener,
}: {
  cloud: CloudSync | null;
  /** Filled in with a function that opens the how-to, for buttons elsewhere on the page. */
  opener: MutableRefObject<() => void>;
}) {
  const { email, recovering } = useSyncExternalStore(
    cloud?.subscribe ?? noSubscribe,
    cloud?.getSnapshot ?? (() => noCloud),
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const last = SLIDES.length - 1;

  // Starts on Next, so a keyboard moves through the slides and the close button stays calm.
  const show = () => {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLElement>('.how-to-next')?.focus();
  };
  // Back on step one while still closed, so opening never sweeps across the other steps.
  const restart = () => flushSync(() => setIndex(0));
  const open = () => {
    restart();
    show();
  };
  opener.current = open;
  const close = () => dialog.current?.close();
  const goTo = setIndex;

  useEffect(() => {
    if (!hasSeen(SEEN_KEY) && !window.location.hash) {
      remember(SEEN_KEY);
      show();
    }
  }, []);

  useEffect(() => {
    if (!email || recovering) return;
    const accountKey = `${SEEN_KEY}:${email}`;
    if (hasSeen(accountKey)) return;
    remember(accountKey);
    if (!dialog.current?.open) restart();
    show();
  }, [email, recovering]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' && index < last) goTo(index + 1);
    if (event.key === 'ArrowLeft' && index > 0) goTo(index - 1);
  };

  return (
    <>
      <button
        type="button"
        className="help-button"
        title="How Daybook works"
        aria-label="How Daybook works"
        onClick={open}
      >
        <HelpIcon />
      </button>

      <dialog className="how-to" ref={dialog} aria-label="How Daybook works" onKeyDown={onKeyDown}>
        <button
          type="button"
          className="how-to-close"
          aria-label="Close"
          title="Close"
          onClick={close}
        >
          <CloseIcon />
        </button>

        <div className="how-to-window">
          <div className="how-to-track" style={{ '--slide': index } as CSSProperties}>
            {SLIDES.map((item, position) => (
              <div
                className={position === index ? 'how-to-slide is-active' : 'how-to-slide'}
                aria-hidden={position !== index}
                key={item.title}
              >
                <div className={item.wide ? 'how-to-art is-grid' : 'how-to-art'}>{item.art}</div>
                <div className="how-to-words" aria-live={position === index ? 'polite' : undefined}>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                  {item.note && <p className="how-to-note">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-to-dots">
          {SLIDES.map((item, dot) => (
            <button
              type="button"
              key={item.title}
              aria-label={`Go to step ${dot + 1}: ${item.title}`}
              aria-current={dot === index ? 'step' : undefined}
              onClick={() => goTo(dot)}
            />
          ))}
        </div>

        <div className="how-to-buttons">
          {index > 0 ? (
            <button type="button" className="how-to-back" onClick={() => goTo(index - 1)}>
              Back
            </button>
          ) : (
            <button type="button" className="how-to-back" onClick={close}>
              Skip
            </button>
          )}
          {index < last ? (
            <button type="button" className="how-to-next" onClick={() => goTo(index + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className="how-to-next" onClick={close}>
              Get started
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
