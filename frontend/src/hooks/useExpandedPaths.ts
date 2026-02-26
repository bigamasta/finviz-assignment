import { useState, useCallback } from 'react';

/** Returns the paths of all ancestors that must be expanded to make `path` visible. */
function getAncestorsToExpand(path: string): string[] {
  const parts = path.split(' > ');
  const toExpand: string[] = [];
  // parts[0] = root (always visible); start from depth-1 nodes (index 1)
  // We need to expand each ancestor so its children become visible.
  // e.g. path = "fall11 > A > B > C" → expand "fall11 > A" and "fall11 > A > B"
  for (let i = 2; i < parts.length; i++) {
    toExpand.push(parts.slice(0, i).join(' > '));
  }
  return toExpand;
}

export function useExpandedPaths() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  /** Expand all ancestors of `path` so the node becomes visible in the tree. */
  const expandToNode = useCallback((path: string) => {
    const ancestors = getAncestorsToExpand(path);
    if (ancestors.length > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        ancestors.forEach((p) => next.add(p));
        return next;
      });
    }
  }, []);

  return { expandedPaths, toggleExpanded, collapseAll, expandToNode };
}
