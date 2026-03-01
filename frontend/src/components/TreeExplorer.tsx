import { memo } from 'react'
import { useRoot } from '../hooks/useChildren.ts'
import { useTreeStore } from '../store/treeStore.ts'
import { VirtualTree } from './VirtualTree/index.tsx'
import { Spinner } from './ui/Spinner.tsx'
import type { FlatNode } from '../api/client.ts'

function RootNode({ node }: { node: FlatNode }) {
  const isSelected = useTreeStore((s) => s.selectedNode?.path === node.path)
  const setSelectedNode = useTreeStore((s) => s.setSelectedNode)

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border hover:bg-surface-hover transition-colors ${isSelected ? 'bg-accent-dim' : ''}`}
      onClick={() => setSelectedNode(node)}
      title={node.path}
    >
      <span className="text-accent text-sm">◈</span>
      <span className="font-semibold text-sm text-text-1 truncate">
        {node.name}
      </span>
      <span className="ml-auto text-xs font-mono text-text-3 bg-surface-2 px-1.5 py-0.5 rounded-sm">
        {node.size?.toLocaleString() ?? '—'}
      </span>
    </div>
  )
}

function TreeToolbar() {
  const collapseAll = useTreeStore((s) => s.collapseAll)

  return (
    <div className="flex items-center justify-end px-3 py-1 border-b border-border bg-surface-2">
      <button
        className="flex items-center gap-1 text-[11px] text-text-3 hover:text-text-2 transition-colors cursor-pointer"
        onClick={collapseAll}
        title="Collapse all expanded nodes"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 3.5h6M2 5h4M2 6.5h2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        Collapse all
      </button>
    </div>
  )
}

export const TreeExplorer = memo(function TreeExplorer() {
  const { data, isLoading, error } = useRoot()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2.5 p-6 text-text-2 text-sm">
        <Spinner size="md" />
        Loading taxonomy...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red text-sm leading-relaxed">
        Failed to connect to backend.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TreeToolbar />
      <RootNode node={data.node} />
      {/* VirtualTree fills the remaining height and owns its own scroll */}
      <div className="flex-1 min-h-0">
        <VirtualTree firstLevelChildren={data.children} />
      </div>
    </div>
  )
})
