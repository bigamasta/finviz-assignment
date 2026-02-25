import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useChildren } from '../hooks/useChildren.ts';
import type { FlatNode } from '../api/client.ts';

type Props = {
  node: FlatNode;
  depth: number;
  onSelect: (node: FlatNode) => void;
  selectedPath: string | null;
};

export default function TreeNode({ node, depth, onSelect, selectedPath }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Only fetches when expanded === true; stays disabled (returns undefined) otherwise
  const { data, isLoading } = useChildren(expanded ? node.path : null);

  const canExpand = node.hasChildren ?? false;
  const isSelected = selectedPath === node.path;

  // Indentation: base offset (for root-level items) + per-level step
  const paddingLeft = 8 + (depth - 1) * 14 + (depth > 1 ? 4 : 0);

  function handleChevronClick(e: MouseEvent) {
    e.stopPropagation();
    if (canExpand) setExpanded((prev) => !prev);
  }

  function handleRowClick() {
    onSelect(node);
    // Also expand if it has children and isn't expanded yet
    if (canExpand && !expanded) setExpanded(true);
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1 pr-3 py-[5px] cursor-pointer hover:bg-surface-hover transition-colors text-sm ${isSelected ? '!bg-accent-dim' : ''}`}
        style={{ paddingLeft }}
        onClick={handleRowClick}
        title={node.path}
      >
        <button
          className={`w-[18px] h-[18px] flex items-center justify-center bg-transparent border-none text-text-3 cursor-pointer shrink-0 transition-transform ${expanded ? 'rotate-90' : ''} ${!canExpand ? 'invisible' : ''}`}
          onClick={handleChevronClick}
          tabIndex={canExpand ? 0 : -1}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="truncate text-text-1">{node.name}</span>

        {node.size > 0 && (
          <span className="ml-auto shrink-0 text-xs font-mono text-text-2">
            {node.size >= 1000
              ? `${(node.size / 1000).toFixed(1)}k`
              : node.size}
          </span>
        )}
      </div>

      {expanded && (
        <div className="animate-fade-slide-in">
          {isLoading && (
            <LoadingRow depth={depth + 1} />
          )}
          {data?.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
          {!isLoading && data?.children.length === 0 && (
            <EmptyChildrenRow depth={depth + 1} />
          )}
        </div>
      )}
    </div>
  );
}

function LoadingRow({ depth }: { depth: number }) {
  const paddingLeft = 8 + (depth - 1) * 14 + (depth > 1 ? 4 : 0) + 22;
  return (
    <div className="flex items-center gap-2 py-1.5 text-xs text-text-3" style={{ paddingLeft }}>
      <span className="w-3 h-3 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
      Loading...
    </div>
  );
}

function EmptyChildrenRow({ depth }: { depth: number }) {
  const paddingLeft = 8 + (depth - 1) * 14 + (depth > 1 ? 4 : 0) + 22;
  return (
    <div className="flex items-center gap-2 py-1.5 text-xs text-text-3 opacity-40" style={{ paddingLeft }}>
      No children
    </div>
  );
}
