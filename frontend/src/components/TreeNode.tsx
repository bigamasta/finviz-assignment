import type { MouseEvent } from 'react'
import { memo } from 'react'
import { useChildren } from '../hooks/useChildren.ts'
import { useScrollIntoView } from '../hooks/useScrollIntoView.ts'
import type { FlatNode } from '../api/client.ts'

type Props = {
  node: FlatNode
  depth: number
  onSelect: (node: FlatNode) => void
  selectedPath: string | null
  scrollTargetPath: string | null
  onScrollComplete: () => void
  expandedPaths: Set<string>
  toggleExpanded: (path: string) => void
}

/**
 * Calculates left padding for tree indentation at a given depth.
 * Pass `innerContent = true` for rows without a chevron (adds 22px to clear it).
 */
function indentPadding(depth: number, innerContent = false): number {
  return 8 + (depth - 1) * 14 + (depth > 1 ? 4 : 0) + (innerContent ? 22 : 0)
}

/** Formats a node size for compact display (e.g. 1200 -> "1.2k"). */
function formatSize(size: number): string {
  if (size >= 1000) return `${(size / 1000).toFixed(1)}k`
  return String(size)
}

export default function TreeNode({
  node,
  depth,
  onSelect,
  selectedPath,
  scrollTargetPath,
  onScrollComplete,
  expandedPaths,
  toggleExpanded,
}: Props) {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedPath === node.path

  return (
    <div>
      <NodeRow
        node={node}
        depth={depth}
        isSelected={isSelected}
        isExpanded={isExpanded}
        scrollTargetPath={scrollTargetPath}
        onScrollComplete={onScrollComplete}
        onSelect={onSelect}
        toggleExpanded={toggleExpanded}
      />
      {isExpanded && (
        <Children
          node={node}
          depth={depth}
          selectedPath={selectedPath}
          scrollTargetPath={scrollTargetPath}
          onScrollComplete={onScrollComplete}
          onSelect={onSelect}
          expandedPaths={expandedPaths}
          toggleExpanded={toggleExpanded}
        />
      )}
    </div>
  )
}

type ChildrenProps = {
  node: FlatNode
  depth: number
  selectedPath: string | null
  scrollTargetPath: string | null
  onScrollComplete: () => void
  onSelect: (node: FlatNode) => void
  expandedPaths: Set<string>
  toggleExpanded: (path: string) => void
}

const Children = memo(function Children({
  node,
  depth,
  selectedPath,
  scrollTargetPath,
  onScrollComplete,
  onSelect,
  expandedPaths,
  toggleExpanded,
}: ChildrenProps) {
  const {
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    displayChildren,
  } = useChildren(node.path, selectedPath, true)
  const childDepth = depth + 1

  return (
    <div className="animate-fade-slide-in">
      {isLoading && <LoadingRow depth={childDepth} />}

      {displayChildren.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={childDepth}
          onSelect={onSelect}
          selectedPath={selectedPath}
          scrollTargetPath={scrollTargetPath}
          onScrollComplete={onScrollComplete}
          expandedPaths={expandedPaths}
          toggleExpanded={toggleExpanded}
        />
      ))}

      {!isLoading && displayChildren.length === 0 && (
        <EmptyChildrenRow depth={childDepth} />
      )}

      {hasNextPage && (
        <LoadMoreRow
          depth={childDepth}
          isLoading={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      )}
    </div>
  )
})

type NodeRowProps = {
  node: FlatNode
  depth: number
  isSelected: boolean
  isExpanded: boolean
  scrollTargetPath: string | null
  onScrollComplete: () => void
  onSelect: (node: FlatNode) => void
  toggleExpanded: (path: string) => void
}

function NodeRow({
  node,
  depth,
  isSelected,
  isExpanded,
  scrollTargetPath,
  onScrollComplete,
  onSelect,
  toggleExpanded,
}: NodeRowProps) {
  const canExpand = node.hasChildren ?? false
  const paddingLeft = indentPadding(depth)
  const ref = useScrollIntoView(node.path, scrollTargetPath, onScrollComplete)

  function handleChevronClick(e: MouseEvent) {
    e.stopPropagation()
    if (canExpand) toggleExpanded(node.path)
  }

  function handleRowClick() {
    if (!isSelected) onSelect(node)
    if (canExpand) toggleExpanded(node.path)
  }

  return (
    <div
      ref={ref}
      className={`flex items-center gap-1 pr-3 py-[5px] cursor-pointer hover:bg-surface-hover transition-colors text-sm ${isSelected ? 'bg-accent-dim!' : ''}`}
      style={{ paddingLeft }}
      onClick={handleRowClick}
      title={node.path}
    >
      <button
        className={`w-[18px] h-[18px] flex items-center justify-center bg-transparent border-none text-text-3 cursor-pointer shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''} ${!canExpand ? 'invisible' : ''}`}
        onClick={handleChevronClick}
        tabIndex={canExpand ? 0 : -1}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
          <path
            d="M3 2l4 3-4 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className="truncate text-text-1">{node.name}</span>

      {node.size > 0 && (
        <span className="ml-auto shrink-0 text-xs font-mono text-text-2">
          {formatSize(node.size)}
        </span>
      )}
    </div>
  )
}

function LoadingRow({ depth }: { depth: number }) {
  const paddingLeft = indentPadding(depth, true)
  return (
    <div
      className="flex items-center gap-2 py-1.5 text-xs text-text-3"
      style={{ paddingLeft }}
    >
      <span className="w-3 h-3 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
      Loading...
    </div>
  )
}

function EmptyChildrenRow({ depth }: { depth: number }) {
  const paddingLeft = indentPadding(depth, true)
  return (
    <div
      className="flex items-center gap-2 py-1.5 text-xs text-text-3 opacity-40"
      style={{ paddingLeft }}
    >
      No children
    </div>
  )
}

function LoadMoreRow({
  depth,
  isLoading,
  onLoadMore,
}: {
  depth: number
  isLoading: boolean
  onLoadMore: () => void
}) {
  const paddingLeft = indentPadding(depth, true)
  return (
    <button
      className="flex items-center gap-1.5 py-1.5 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
      style={{ paddingLeft }}
      onClick={onLoadMore}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="w-3 h-3 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
          Loading...
        </>
      ) : (
        <>
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2v8M2 6h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Load more
        </>
      )}
    </button>
  )
}
