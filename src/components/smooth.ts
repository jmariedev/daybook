import { flushSync } from 'react-dom';

interface ViewTransitionDocument {
  startViewTransition?: (update: () => void) => unknown;
}

/**
 * Runs a change so the page glides to its new layout, in browsers that can.
 * Everywhere else, and with reduced motion on, the change just happens.
 */
export function smoothly(update: () => void) {
  const start = (document as ViewTransitionDocument).startViewTransition;
  // A hidden tab draws nothing, so a transition there would hold the change back.
  const hidden = document.visibilityState !== 'visible';
  if (!start || hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  start.call(document, () => flushSync(update));
}
