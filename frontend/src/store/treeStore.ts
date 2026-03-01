import { create } from 'zustand'
import type { FlatNode } from '../api/client.ts'

type TreeState = {
  expandedPaths: Set<string>
  // Tracks paths added via expandToNode. Serves two purposes:
  //   1. fetch disabled  — QueryKeeper won't auto-fetch while path is here
  //   2. stub survival   — synthetic stubs remain visible even after collapse
  // Removed on manual expand (enabling fetch) or "Load" click.
  // Never removed on collapse — only cleared by collapseAll.
  syntheticPaths: Set<string>
  selectedNode: FlatNode | null
  scrollTargetPath: string | null
}

type TreeActions = {
  toggleExpanded: (path: string) => void
  collapseAll: () => void
  expandToNode: (path: string) => void
  enableFetch: (path: string) => void
  setSelectedNode: (node: FlatNode | null) => void
  setScrollTargetPath: (path: string | null) => void
  clearScrollTargetPath: () => void
}

export const useTreeStore = create<TreeState & TreeActions>((set) => ({
  expandedPaths: new Set(),
  syntheticPaths: new Set(),
  selectedNode: null,
  scrollTargetPath: null,

  toggleExpanded: (path) =>
    set((state) => {
      const nextExpanded = new Set(state.expandedPaths)

      if (nextExpanded.has(path)) {
        // Collapse: remove from expandedPaths only.
        // syntheticPaths is NOT touched — stubs survive collapse.
        nextExpanded.delete(path)
        for (const p of nextExpanded) {
          if (p.startsWith(path + ' > ')) nextExpanded.delete(p)
        }
        const nextScroll =
          state.scrollTargetPath === path ||
          (state.scrollTargetPath?.startsWith(path + ' > ') ?? false)
            ? null
            : state.scrollTargetPath
        return { expandedPaths: nextExpanded, scrollTargetPath: nextScroll }
      } else {
        // Manual expand: remove from syntheticPaths to enable fetch
        const nextSynthetic = new Set(state.syntheticPaths)
        nextSynthetic.delete(path)
        return { expandedPaths: nextExpanded.add(path), syntheticPaths: nextSynthetic }
      }
    }),

  collapseAll: () =>
    set({
      expandedPaths: new Set(),
      syntheticPaths: new Set(),
      scrollTargetPath: null,
    }),

  expandToNode: (path) =>
    set((state) => {
      const nextExpanded = new Set(state.expandedPaths)
      const nextSynthetic = new Set(state.syntheticPaths)
      const segments = path.split(' > ')
      for (let i = 1; i < segments.length; i++) {
        const ancestor = segments.slice(0, i).join(' > ')
        if (!state.expandedPaths.has(ancestor)) {
          nextSynthetic.add(ancestor)
        }
        nextExpanded.add(ancestor)
      }
      if (!state.expandedPaths.has(path)) {
        nextSynthetic.add(path)
      }
      nextExpanded.add(path)
      return { expandedPaths: nextExpanded, syntheticPaths: nextSynthetic }
    }),

  // Called when user clicks "Load" — removes path from syntheticPaths to enable fetch
  enableFetch: (path) =>
    set((state) => {
      const nextSynthetic = new Set(state.syntheticPaths)
      nextSynthetic.delete(path)
      return { syntheticPaths: nextSynthetic }
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  setScrollTargetPath: (path) => set({ scrollTargetPath: path }),

  clearScrollTargetPath: () => set({ scrollTargetPath: null }),
}))
