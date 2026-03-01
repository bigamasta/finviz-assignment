import type { MouseEvent } from 'react'
import { memo } from 'react'
import { useTreeStore } from '../../store/treeStore.ts'
import { useQueryKeeperRegistry } from '../../context/QueryKeeperContext.ts'
import { indentPadding } from '../../lib/tree.ts'
import { formatSize } from '../../lib/format.ts'
import { Spinner } from '../ui/Spinner.tsx'
import type { VisibleRow } from '../../types/rows.ts'

type Props = {
  row: VisibleRow
}

export const TreeRow = memo(function TreeRow({ row }: Props) {
  if (row.kind === 'node') return <NodeRow row={row} />
  if (row.kind === 'loading') return <LoadingRow row={row} />
  if (row.kind === 'load') return <LoadRow row={row} />
  return <LoadMoreRow row={row} />
})

const NodeRow = memo(function NodeRow({
  row,
}: {
  row: Extract<VisibleRow, { kind: 'node' }>
}) {
  const { node, depth, isExpanded } = row
  const isSelected = useTreeStore((s) => s.selectedNode?.path === node.path)
  const setSelectedNode = useTreeStore((s) => s.setSelectedNode)
  const toggleExpanded = useTreeStore((s) => s.toggleExpanded)

  const canExpand = node.hasChildren ?? false
  const paddingLeft = indentPadding(depth)

  function handleChevronClick(e: MouseEvent) {
    e.stopPropagation()
    if (canExpand) toggleExpanded(node.path)
  }

  function handleRowClick() {
    if (!isSelected) setSelectedNode(node)
    if (canExpand) toggleExpanded(node.path)
  }

  return (
    <div
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

      {node.size != null && node.size > 0 && (
        <span className="ml-auto shrink-0 text-xs font-mono text-text-2">
          {formatSize(node.size)}
        </span>
      )}
    </div>
  )
})

function LoadingRow({
  row,
}: {
  row: Extract<VisibleRow, { kind: 'loading' }>
}) {
  const paddingLeft = indentPadding(row.depth, true)
  return (
    <div
      className="flex items-center gap-2 py-1.5 text-xs text-text-3"
      style={{ paddingLeft }}
    >
      <Spinner />
      Loading...
    </div>
  )
}

function LoadRow({ row }: { row: Extract<VisibleRow, { kind: 'load' }> }) {
  const enableFetch = useTreeStore((s) => s.enableFetch)
  const paddingLeft = indentPadding(row.depth, true)
  return (
    <button
      className="flex items-center gap-1.5 py-1.5 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer bg-transparent border-none w-full text-left"
      style={{ paddingLeft }}
      onClick={() => enableFetch(row.parentPath)}
    >
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 1v10M1 6h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      Load
    </button>
  )
}

function LoadMoreRow({
  row,
}: {
  row: Extract<VisibleRow, { kind: 'load-more' }>
}) {
  const registry = useQueryKeeperRegistry()
  const paddingLeft = indentPadding(row.depth, true)
  const isLoading = row.isFetchingNextPage

  return (
    <button
      className="flex items-center gap-1.5 py-1.5 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
      style={{ paddingLeft }}
      onClick={() => registry.fetchNextPage(row.parentPath)}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner />
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
