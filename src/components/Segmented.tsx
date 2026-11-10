import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface SegmentOption<T> {
  value: T;
  content: ReactNode;
  label?: string;
  icon?: boolean;
}

interface Props<T> {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
}

/** A row of options, with a selection that slides between them. */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  const group = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const element = group.current;
    if (!element) return;
    const measure = () => {
      const selected = element.querySelector<HTMLElement>('button[aria-pressed="true"]');
      if (!selected) {
        setThumb({ opacity: 0 });
        return;
      }
      setThumb({
        width: selected.offsetWidth,
        height: selected.offsetHeight,
        transform: `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // Buttons can change size without the group changing, like when the text size changes.
    element.querySelectorAll('button').forEach((button) => observer.observe(button));
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <div className="segmented" role="group" aria-label={label} ref={group}>
      <span className="segmented-thumb" style={thumb} />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.icon ? 'icon-only' : undefined}
          aria-pressed={option.value === value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.value)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}
