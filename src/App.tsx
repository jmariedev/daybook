import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { AccountButton } from './components/AccountButton';
import { Brand } from './components/Brand';
import { CardCollection } from './components/CardCollection';
import { Deck } from './components/Deck';
import { Dashboard } from './components/Dashboard';
import { DeckActions, StackStatus } from './components/DeckActions';
import { HowTo } from './components/HowTo';
import { GridIcon, HomeIcon, ListIcon, StackIcon } from './components/Icons';
import { smoothly } from './components/smooth';
import { Segmented } from './components/Segmented';
import type { SegmentOption } from './components/Segmented';
import { CATEGORIES, DONE_INK, DONE_STACK } from './data/categories';
import { CloudSync } from './data/cloudSync';
import { browserPersistence } from './data/persistence';
import { PROMPTS } from './data/prompts';
import { DaybookStore } from './data/store';
import { supabase } from './data/supabase';

type View = 'home' | 'deck' | 'grid' | 'list';

const store = new DaybookStore(browserPersistence, PROMPTS);
const cloud = supabase ? new CloudSync(store, supabase) : null;

const VIEW_OPTIONS: SegmentOption<View>[] = [
  { value: 'home', label: 'Choose for today', icon: true, content: <HomeIcon /> },
  { value: 'deck', label: 'Card stack', icon: true, content: <StackIcon /> },
  { value: 'grid', label: 'Grid view', icon: true, content: <GridIcon /> },
  { value: 'list', label: 'List view', icon: true, content: <ListIcon /> },
];

/** The background circles, in the order styled in styles.css. */
const ORB_KINDS = ['', '', 'deep', '', 'deep', '', 'deep', '', ''];

export function App() {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [view, setView] = useState<View>('home');
  const openHowTo = useRef<() => void>(() => undefined);

  const doneCount = snapshot.stacks[DONE_STACK].length;
  const stackOptions = useMemo<SegmentOption<number>[]>(
    () => [
      ...CATEGORIES.map((category, index) => ({ value: index, content: category.name })),
      {
        value: DONE_STACK,
        content: (
          <>
            Done{' '}
            <span className="badge" key={doneCount}>
              {doneCount}
            </span>
          </>
        ),
      },
    ],
    [doneCount],
  );

  // A filter chosen on the home screen opens that stack.
  const chooseStack = (next: number) => {
    if (view === 'deck') store.select(next);
    else
      smoothly(() => {
        store.select(next);
        if (view === 'home') setView('deck');
      });
  };

  const tint = snapshot.current === DONE_STACK ? DONE_INK : CATEGORIES[snapshot.current].ink;

  return (
    <div className="app" style={{ '--tint': tint } as CSSProperties}>
      <h1 className="sr-only">Daybook</h1>
      <div className="orbs" aria-hidden="true">
        {ORB_KINDS.map((kind, index) => (
          <i key={index} className={kind} />
        ))}
      </div>
      <header className="header">
        <Brand
          onClick={() => {
            smoothly(() => setView('home'));
          }}
        />
        <div className="filters">
          <Segmented
            label="Prompt category"
            value={view === 'home' ? -1 : snapshot.current}
            options={stackOptions}
            onChange={chooseStack}
          />
        </div>
        <div className="header-right">
          <HowTo cloud={cloud} opener={openHowTo} />
          {cloud && <AccountButton cloud={cloud} />}
          <Segmented
            label="View"
            value={view}
            options={VIEW_OPTIONS}
            onChange={(next) => next !== view && smoothly(() => setView(next))}
          />
        </div>
      </header>

      {view === 'home' ? (
        <main className="home-view">
          <Dashboard
            snapshot={snapshot}
            onHowTo={() => openHowTo.current()}
            onChoose={(stack) =>
              smoothly(() => {
                store.select(stack);
                setView('deck');
              })
            }
          />
        </main>
      ) : view === 'deck' ? (
        <main className="deck-view">
          <StackStatus snapshot={snapshot} />
          <Deck store={store} snapshot={snapshot} />
          <DeckActions store={store} snapshot={snapshot} />
        </main>
      ) : (
        <main className="collection-view">
          <CardCollection
            store={store}
            snapshot={snapshot}
            view={view}
            onOpenCard={(id) => {
              smoothly(() => {
                store.openCard(id);
                setView('deck');
              });
            }}
          />
        </main>
      )}
      <a
        className="credit"
        href="https://jmarie-dev-ochre.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
      >
        made by <strong>jmarie.dev</strong>
      </a>
    </div>
  );
}
