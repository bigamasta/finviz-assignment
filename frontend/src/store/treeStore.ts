import { create } from 'zustand'
import type { FlatNode } from '../api/client.ts'

type TreeState = {
  expandedPaths: Set<string>
  pathsWithDisabledFetch: Set<string>
  selectedNode: FlatNode | null
  scrollTargetPath: string | null
}

type TreeActions = {
  toggleExpanded: (path: string) => void
  collapseAll: () => void
  expandToNode: (path: string) => void
  removeFromDisabledFetch: (path: string) => void
  setSelectedNode: (node: FlatNode | null) => void
  setScrollTargetPath: (path: string | null) => void
  clearScrollTargetPath: () => void
}

export const useTreeStore = create<TreeState & TreeActions>((set) => ({
  expandedPaths: new Set(),
  pathsWithDisabledFetch: new Set(),
  selectedNode: null,
  scrollTargetPath: null,

  toggleExpanded: (path) =>
    set((state) => {
      const nextExpanded = new Set(state.expandedPaths)
      const nextDisabled = new Set(state.pathsWithDisabledFetch)
      if (nextExpanded.has(path)) {
        // Collapsing: remove node and all its descendants from disabled fetch
        nextExpanded.delete(path)
        for (const p of nextDisabled) {
          if (p.startsWith(path + ' > ')) nextDisabled.delete(p)
        }
      } else {
        // Manual expand: enable fetch for this path
        nextExpanded.add(path)
        nextDisabled.delete(path)
      }
      return { expandedPaths: nextExpanded, pathsWithDisabledFetch: nextDisabled }
    }),

  collapseAll: () =>
    set({ expandedPaths: new Set(), pathsWithDisabledFetch: new Set() }),

  expandToNode: (path) =>
    set((state) => {
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
      // Track the leaf itself so it stays visible across navigations
      // (the merge loop in Children relies on it being in expandedPaths)
      if (!state.expandedPaths.has(path)) {
        nextDisabled.add(path)
      }
      nextExpanded.add(path)
      return { expandedPaths: nextExpanded, pathsWithDisabledFetch: nextDisabled }
    }),

  removeFromDisabledFetch: (path) =>
    set((state) => {
      const nextDisabled = new Set(state.pathsWithDisabledFetch)
      nextDisabled.delete(path)
      return { pathsWithDisabledFetch: nextDisabled }
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  setScrollTargetPath: (path) => set({ scrollTargetPath: path }),

  clearScrollTargetPath: () => set({ scrollTargetPath: null }),
}))
