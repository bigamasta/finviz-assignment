import { useState, useCallback } from 'react';

export function useExpandedPaths() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [navTargetPaths, setNavTargetPaths] = useState<string[]>([]);

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
    setNavTargetPaths([]);
  }, []);

  /** Add a path to the nav targets list so the tree reveals the ancestor chain without fetching siblings. */
  const expandToNode = useCallback((path: string) => {
    setNavTargetPaths((prev) => [...prev, path]);
  }, []);

  const clearNavTarget = useCallback(() => {
    setNavTargetPaths([]);
  }, []);

  return { expandedPaths, navTargetPaths, toggleExpanded, collapseAll, expandToNode, clearNavTarget };
}
