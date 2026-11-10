export type CategorySlug = 'gratitude' | 'reflection' | 'creative' | 'story';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Footer band and accent color. */
  ink: string;
  /** Line icon path, drawn in a 24 by 24 box. */
  icon: string;
  /** The part of that box the drawing fills, so icons line up with text at their real edges. */
  iconBox: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'gratitude',
    name: 'Gratitude',
    ink: '#a9623c',
    icon: 'M4 11h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 12.5h1.5a2.7 2.7 0 0 1 0 5.4h-2M10.5 8.3S7.8 6.7 7.8 4.8A1.5 1.5 0 0 1 10.5 4a1.5 1.5 0 0 1 2.7.8c0 1.9-2.7 3.5-2.7 3.5z',
    iconBox: '3 2.4 19.2 19.6',
  },
  {
    slug: 'reflection',
    name: 'Reflection',
    ink: '#4f6f7e',
    icon: 'M20 14.2A8 8 0 1 1 10 4.2a6.5 6.5 0 0 0 10 10zM17.5 3.5v4M15.5 5.5h4',
    iconBox: '3.45 2.55 17.5 18.2',
  },
  {
    slug: 'creative',
    name: 'Creative',
    ink: '#83637f',
    icon: 'M12 3.5C7 3.5 3 7.3 3 12s3.8 8.5 8.3 8.5c1.5 0 2.3-1 2.3-2.1 0-1.1-.7-1.6-.3-2.6.4-.8 1.3-.9 2.4-.9h2.3c2.5 0 3.9-1.7 3.9-3.9 0-4.4-4-8-9-8zM8 11h.01M11.5 7.5h.01M16 9.5h.01',
    iconBox: '2.05 2.05 20.8 19.4',
  },
  {
    slug: 'story',
    name: 'Story',
    ink: '#4f7267',
    icon: 'M4 21V8l2.5-1.5L9 8v3h6V8l2.5-1.5L20 8v13zM10 21v-4a2 2 0 0 1 4 0v4M6.5 6.5v-4l3 1.2-3 1.2',
    iconBox: '3.05 1.55 17.9 20.4',
  },
];

/** The Done stack sits after the category stacks. */
export const DONE_STACK = CATEGORIES.length;
export const STACK_COUNT = CATEGORIES.length + 1;

export const DONE_INK = '#667479';
