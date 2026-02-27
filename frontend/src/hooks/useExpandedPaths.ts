import { useReducer, useCallback } from 'react'

type State = {
  expandedPaths: Set<string>
  pathsWithDisabledFetch: Set<string>
}

type Action =
  | { type: 'toggle'; path: string }
  | { type: 'expandToNode'; path: string }
  | { type: 'removeFromDisabledFetch'; path: string }
  | { type: 'collapseAll' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle': {
      const { path } = action
      const nextExpanded = new Set(state.expandedPaths)
      const nextDisabled = new Set(state.pathsWithDisabledFetch)
      if (nextExpanded.has(path)) {
        // Collapsing: remove node, remove all descendants from disabled fetch
        nextExpanded.delete(path)
        for (const p of nextDisabled) {
          if (p.startsWith(path + ' > ')) nextDisabled.delete(p)
        }
      } else {
        // Manual expand: add to expandedPaths, enable fetch
        nextExpanded.add(path)
        nextDisabled.delete(path)
      }
      return { expandedPaths: nextExpanded, pathsWithDisabledFetch: nextDisabled }
    }
    case 'expandToNode': {
      const { path } = action
      const nextExpanded = new Set(state.expandedPaths)
      const nextDisabled = new Set(state.pathsWithDisabledFetch)
      const segments = path.split(' > ')
      for (let i = 1; i < segments.length; i++) {
        const ancestor = segments.slice(0, i).join(' > ')
        if (!state.expandedPaths.has(ancestor)) {
          nextDisabled.add(ancestor)
        }
        nextExpanded.add(ancestor)
      }
      // Also track the leaf itself so it stays visible in the tree across
      // subsequent navigations (the merge loop in Children relies on this)
      if (!state.expandedPaths.has(path)) {
        nextDisabled.add(path)
      }
      nextExpanded.add(path)
      return { expandedPaths: nextExpanded, pathsWithDisabledFetch: nextDisabled }
    }
    case 'removeFromDisabledFetch': {
      const nextDisabled = new Set(state.pathsWithDisabledFetch)
      nextDisabled.delete(action.path)
      return { ...state, pathsWithDisabledFetch: nextDisabled }
    }
    case 'collapseAll':
      return { expandedPaths: new Set(), pathsWithDisabledFetch: new Set() }
    default:
      return state
  }
}

const initialState: State = {
  expandedPaths: new Set(),
  pathsWithDisabledFetch: new Set(),
}

export function useExpandedPaths() {
  const [{ expandedPaths, pathsWithDisabledFetch }, dispatch] = useReducer(
    reducer,
    initialState,
  )

  const toggleExpanded = useCallback(
    (path: string) => dispatch({ type: 'toggle', path }),
    [],
  )

  const collapseAll = useCallback(() => dispatch({ type: 'collapseAll' }), [])

  const expandToNode = useCallback(
    (path: string) => dispatch({ type: 'expandToNode', path }),
    [],
  )

  const removeFromDisabledFetch = useCallback(
    (path: string) => dispatch({ type: 'removeFromDisabledFetch', path }),
    [],
  )

  return {
    expandedPaths,
    pathsWithDisabledFetch,
    toggleExpanded,
    collapseAll,
    expandToNode,
    removeFromDisabledFetch,
  }
}
