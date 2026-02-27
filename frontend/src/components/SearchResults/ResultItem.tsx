import type { ReactNode } from 'react'
import type { FlatNode } from '../../api/client.ts'

type ResultItemProps = {
  node: FlatNode
  query: string
  onSelect: (node: FlatNode) => void
}

export function ResultItem({ node, query, onSelect }: ResultItemProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-border bg-surface hover:bg-surface-hover hover:border-border-bright cursor-pointer transition-colors"
      onClick={() => onSelect(node)}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm text-text-1 truncate">
          {highlightMatch(node.name, query)}
        </div>
        <div
          className="text-xs text-text-3 truncate mt-0.5"
          title={node.path}
        >
          {node.path}
        </div>
      </div>
      {node.size != null && node.size > 0 && (
        <span className="shrink-0 text-xs font-mono text-teal bg-teal-dim px-2 py-0.5 rounded-sm">
          {node.size.toLocaleString()}
        </span>
      )}
    </div>
  )
}

/** Highlights the first occurrence of `query` in `text` with a <mark> element. */
function highlightMatch(text: string, query: string): ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}
