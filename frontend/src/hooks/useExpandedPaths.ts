import { useState, useCallback } from 'react'

export function useExpandedPaths() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  /** Expands all ancestor paths so the target node becomes visible in the tree. */
  const expandToNode = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      const segments = path.split(' > ')
      for (let i = 1; i < segments.length; i++) {
        next.add(segments.slice(0, i).join(' > '))
      }
      return next
    })
  }, [])

  return { expandedPaths, toggleExpanded, collapseAll, expandToNode }
}
