import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { CATEGORIES, DONE_INK, DONE_STACK } from '../data/categories';
import { formatDate } from '../data/dates';
import type { Card } from '../data/persistence';
import type { DaybookStore, Snapshot } from '../data/store';
import { CategoryIcon, CheckIcon } from './Icons';
import { Illustration } from './Illustrations';
import { smoothly } from './smooth';

export type CollectionView = 'grid' | 'list';

interface Props {
  store: DaybookStore;
  snapshot: Snapshot;
  view: CollectionView;
  onOpenCard: (id: string) => void;
}

const inkOf = (card: Card) => (card.doneAt ? DONE_INK : CATEGORIES[card.cat].ink);

/** Each item gets its own name, so the browser can glide it to its new spot. */
const itemStyle = (card: Card) =>
  ({ '--ink-color': inkOf(card), viewTransitionName: `card-${card.id}` }) as CSSProperties;

function CategoryName({ card }: { card: Card }) {
  const category = CATEGORIES[card.cat];
  return (
    <span className="category-name">
      <CategoryIcon category={category} />
      {category.name}
    </span>
  );
}

function GridCard({ card, store }: { card: Card; store: DaybookStore }) {
  return (
    <article className="grid-card" style={itemStyle(card)}>
      <span className="card-icon">
        <CategoryIcon category={CATEGORIES[card.cat]} />
      </span>
      <p>{card.text}</p>
      <Illustration cat={card.cat} />
      <div className="grid-card-footer">
        <CategoryName card={card} />
        {card.doneAt ? (
          <button
            type="button"
            className="pill"
            onClick={() => smoothly(() => store.putBack(card.id))}
          >
            Undo
          </button>
        ) : (
          <button
            type="button"
            className="pill"
            onClick={() => smoothly(() => store.markDone(card.id))}
          >
            <CheckIcon width={2.6} />
            Mark done
          </button>
        )}
      </div>
    </article>
  );
}

function ListRow({
  card,
  store,
  onOpenCard,
}: {
  card: Card;
  store: DaybookStore;
  onOpenCard: (id: string) => void;
}) {
  const done = Boolean(card.doneAt);
  return (
    <div className={done ? 'list-row is-done' : 'list-row'} style={itemStyle(card)}>
      <button
        type="button"
        className="check"
        aria-label={done ? 'Undo' : 'Mark done'}
        onClick={() => smoothly(() => (done ? store.putBack(card.id) : store.markDone(card.id)))}
      >
        <CheckIcon width={3} />
      </button>
      <div className="list-row-text">
        <b>
          {done ? (
            card.text
          ) : (
            <button type="button" className="link" onClick={() => onOpenCard(card.id)}>
              {card.text}
            </button>
          )}
        </b>
        <CategoryName card={card} />
      </div>
    </div>
  );
}

/** Done cards group by the day they were finished, newest first. */
function groupCards(cards: Card[], isDone: boolean) {
  const groups: { label: string; cards: Card[] }[] = [];
  for (const card of cards) {
    const label = isDone && card.doneAt ? formatDate(card.doneAt, true) : '';
    const last = groups[groups.length - 1];
    if (last?.label === label) last.cards.push(card);
    else groups.push({ label, cards: [card] });
  }
  return groups;
}

export function CardCollection({ store, snapshot, view, onOpenCard }: Props) {
  const isDone = snapshot.current === DONE_STACK;
  const cards = snapshot.stacks[snapshot.current];

  return (
    <div className={`collection is-${view}`}>
      {!cards.length && (
        <div className="empty">
          {isDone
            ? 'Cards you mark done will show up here.'
            : 'Every card in this category is done.'}
        </div>
      )}
      {groupCards(cards, isDone).map((group) => (
        <Fragment key={group.label || 'all'}>
          {isDone && <h3 className="day-heading">{group.label}</h3>}
          {view === 'grid' ? (
            <div className="grid">
              {group.cards.map((card) => (
                <GridCard key={card.id} card={card} store={store} />
              ))}
            </div>
          ) : (
            <div className="list">
              {group.cards.map((card) => (
                <ListRow key={card.id} card={card} store={store} onOpenCard={onOpenCard} />
              ))}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
