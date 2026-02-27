import { useState, useCallback } from 'react'
import { useRoot } from './hooks/useChildren.ts'
import { useDebounced } from './hooks/useDebounced.ts'
import { useExpandedPaths } from './hooks/useExpandedPaths.ts'
import TreeExplorer from './components/TreeExplorer.tsx'

import NodeDetail from './components/NodeDetail/index.tsx'
import SearchResults from './components/SearchResults/index.tsx'
import type { FlatNode } from './api/client.ts'

function App() {
  const [selected, setSelected] = useState<FlatNode | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [scrollTargetPath, setScrollTargetPath] = useState<string | null>(null)
  const {
    expandedPaths,
    pathsWithDisabledFetch,
    toggleExpanded,
    collapseAll,
    expandToNode,
    removeFromDisabledFetch,
  } = useExpandedPaths()
  const debouncedSearch = useDebounced(searchInput, 300)

  const { data: rootData } = useRoot()
  const rootSize = rootData?.node.size ?? 0

  const isSearching = debouncedSearch.trim().length >= 2

  const clearScrollTarget = useCallback(() => setScrollTargetPath(null), [])

  const handleTreeSelect = useCallback((node: FlatNode) => {
    setSelected(node)
  }, [])

  function handleSearchSelect(node: FlatNode) {
    setSelected(node)
    setSearchInput('')
    setScrollTargetPath(node.path)
    expandToNode(node.path)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center gap-4 px-5 h-[54px] bg-surface border-b border-border shrink-0 relative header-gradient">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-accent-dim flex items-center justify-center text-accent">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L13 4V10L7 13L1 10V4L7 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-text-1">
            Taxonomy Explorer
          </span>
          <span className="text-[10px] uppercase tracking-widest text-text-3 bg-surface-2 px-2 py-0.5 rounded-sm font-mono">
            ImageNet 2011
          </span>
        </div>

        <div className="relative ml-auto flex items-center">
          <span className="absolute left-3 text-text-3 pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            type="text"
            className="bg-surface-2 border border-border rounded pl-9 pr-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 w-[240px] outline-none focus:border-accent transition-colors"
            placeholder="Search taxonomy..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setSearchInput('')}
            autoComplete="off"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[300px] shrink-0 border-r border-border overflow-y-auto bg-surface">
          <TreeExplorer
            onSelect={handleTreeSelect}
            selectedPath={selected?.path ?? null}
            scrollTargetPath={scrollTargetPath}
            onScrollComplete={clearScrollTarget}
            expandedPaths={expandedPaths}
            toggleExpanded={toggleExpanded}
            collapseAll={collapseAll}
            pathsWithDisabledFetch={pathsWithDisabledFetch}
            removeFromDisabledFetch={removeFromDisabledFetch}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <MainContent
            isSearching={isSearching}
            debouncedSearch={debouncedSearch}
            selected={selected}
            rootSize={rootSize}
            onSearchSelect={handleSearchSelect}
          />
        </main>
      </div>
    </div>
  )
}

function MainContent({
  isSearching,
  debouncedSearch,
  selected,
  rootSize,
  onSearchSelect,
}: {
  isSearching: boolean
  debouncedSearch: string
  selected: FlatNode | null
  rootSize: number
  onSearchSelect: (node: FlatNode) => void
}) {
  if (isSearching) {
    return (
      <SearchResults
        key={debouncedSearch}
        query={debouncedSearch}
        onSelect={onSearchSelect}
      />
    )
  }
  if (selected) {
    return <NodeDetail node={selected} rootSize={rootSize} />
  }
  return <EmptyState />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-3">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M3 7l9 4m0 0l9-4m-9 4v10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-sm">Select a node from the tree to explore it</span>
    </div>
  )
}

export default App
