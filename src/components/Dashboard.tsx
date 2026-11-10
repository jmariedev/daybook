import type { CSSProperties } from 'react';
import { CATEGORIES } from '../data/categories';
import { todayISO } from '../data/dates';
import type { Snapshot } from '../data/store';
import { CheckIcon, CategoryIcon, ChevronRight, HelpIcon } from './Icons';
import { Illustration } from './Illustrations';

const INVITES = [
  'Notice something good',
  'Think something through',
  'Make something up',
  'Build your fantasy world',
];

/** The home screen: four kinds of journaling to choose from today, with no need to do them all. */
export function Dashboard({
  snapshot,
  onChoose,
  onHowTo,
}: {
  snapshot: Snapshot;
  onHowTo: () => void;
  onChoose: (stack: number) => void;
}) {
  const today = todayISO();
  const finished = snapshot.stacks.flat().filter((card) => card.doneAt === today);

  return (
    <div className="dashboard">
      <div className="dashboard-intro">
        <h2>What do you want to journal today?</h2>
        <p>Pick whichever feels right. You don't have to do them all.</p>
        <button type="button" className="how-it-works" onClick={onHowTo}>
          <HelpIcon />
          How it works
        </button>
      </div>
      <div className="dashboard-choices">
        {CATEGORIES.map((category, stack) => {
          const doneToday = finished.filter((card) => card.cat === stack).length;
          return (
            <button
              type="button"
              className="choice"
              key={category.slug}
              style={{ '--ink-color': category.ink } as CSSProperties}
              onClick={() => onChoose(stack)}
            >
              <Illustration cat={stack} />
              <span className="choice-words">
                <b>
                  <CategoryIcon category={category} />
                  {category.name}
                </b>
                <span>{INVITES[stack]}</span>
                {doneToday > 0 && (
                  <small>
                    <CheckIcon width={3} />
                    {doneToday} done today
                  </small>
                )}
              </span>
              <i className="choice-go" aria-hidden="true">
                <ChevronRight />
              </i>
            </button>
          );
        })}
      </div>
    </div>
  );
}
