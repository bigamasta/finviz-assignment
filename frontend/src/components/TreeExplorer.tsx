import { useRoot } from '../hooks/useChildren.ts'
import { useTreeStore } from '../store/treeStore.ts'
import TreeNode from './TreeNode.tsx'
import type { FlatNode } from '../api/client.ts'

function RootNode({ node }: { node: FlatNode }) {
  const selectedNode = useTreeStore((s) => s.selectedNode)
  const setSelectedNode = useTreeStore((s) => s.setSelectedNode)
  const isSelected = selectedNode?.path === node.path

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

export default function TreeExplorer() {
  const { data, isLoading, error } = useRoot()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2.5 p-6 text-text-2 text-sm">
        <span className="w-3.5 h-3.5 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
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
    <div>
      <TreeToolbar />

      {/* Root node — always visible, acts as tree header */}
      <RootNode node={data.node} />

      {/* First-level children — pre-loaded from useRoot */}
      <div>
        {data.children.map((child) => (
          <TreeNode key={child.path} node={child} depth={1} />
        ))}
      </div>
    </div>
  )
}
