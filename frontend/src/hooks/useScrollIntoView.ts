import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to a DOM element. When `nodePath` matches
 * `scrollTargetPath`, scrolls the element into view and calls `onScrollComplete`
 * to clear the target so it doesn't re-trigger on subsequent renders.
 */
export function useScrollIntoView(
  nodePath: string,
  scrollTargetPath: string | null,
  onScrollComplete: () => void,
) {
  const ref = useRef<HTMLDivElement>(null);
  const isScrollTarget = scrollTargetPath === nodePath;

  useEffect(() => {
    if (isScrollTarget && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onScrollComplete();
    }
  }, [isScrollTarget, onScrollComplete]);

  return ref;
}
