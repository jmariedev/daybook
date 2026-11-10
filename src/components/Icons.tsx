import type { ReactNode } from 'react';
import type { Category } from '../data/categories';

function Line({ children, width = 2 }: { children: ReactNode; width?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = () => (
  <Line>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 9.500V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.500" />
    <path d="M10 20v-5.500h4V20" />
  </Line>
);

export const StackIcon = () => (
  <Line>
    <rect x="8" y="4" width="11" height="15" rx="2.5" />
    <path d="M5 8v9.5A2.5 2.5 0 0 0 7.500 20H15" />
  </Line>
);

export const GridIcon = () => (
  <Line>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Line>
);

export const ListIcon = () => (
  <Line>
    <path d="M9 6h11" />
    <path d="M9 12h11" />
    <path d="M9 18h11" />
    <path d="M4.5 6h.01" />
    <path d="M4.5 12h.01" />
    <path d="M4.5 18h.01" />
  </Line>
);

export const ChevronLeft = () => (
  <Line>
    <path d="M15 5l-7 7 7 7" />
  </Line>
);

export const ChevronRight = () => (
  <Line>
    <path d="M9 5l7 7-7 7" />
  </Line>
);

export const ShuffleIcon = () => (
  <Line>
    <path d="M3 7h3c2 0 3.3 1 4.5 3l2.5 4.5c1.2 2 2.5 2.5 4.5 2.5H21" />
    <path d="M3 17h3c1.3 0 2.3-.5 3.2-1.5" />
    <path d="M14.3 8.5C15 7.5 16 7 17.5 7H21" />
    <path d="M18.5 4.5L21 7l-2.5 2.5" />
    <path d="M18.5 14.5L21 17l-2.5 2.5" />
  </Line>
);

export const UndoIcon = () => (
  <Line>
    <path d="M8 6L4 10l4 4" />
    <path d="M4 10h10a5 5 0 0 1 0 10h-3" />
  </Line>
);

export const CheckIcon = ({ width = 2 }: { width?: number }) => (
  <Line width={width}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Line>
);

export const PersonIcon = () => (
  <Line width={1.9}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
  </Line>
);

export const CloseIcon = () => (
  <Line width={2.4}>
    <path d="M6.500 6.500l11 11M17.500 6.500l-11 11" />
  </Line>
);

export const HelpIcon = () => (
  <Line>
    <path d="M9 9.2a3 3 0 1 1 4.700 2.500c-1 .7-1.700 1.300-1.700 2.800" />
    <path d="M12 18.500h.01" />
  </Line>
);

export const CategoryIcon = ({ category }: { category: Category }) => (
  <svg
    className="category-icon"
    viewBox={category.iconBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={category.icon} />
  </svg>
);
