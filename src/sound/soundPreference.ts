import { useState } from 'react';

const KEY = 'daybook:sound';

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function useSoundPreference() {
  const [on, setOn] = useState(isSoundOn);

  const set = (next: boolean) => {
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off');
    } catch {
      // Without storage, sound stays on after the page reloads.
    }
  };

  return [on, set] as const;
}
