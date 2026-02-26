import type { MouseEvent } from 'react';
import { useChildren } from '../hooks/useChildren.ts';
import { useInjectedChildren } from '../hooks/useInjectedChildren.ts';
import { useScrollIntoView } from '../hooks/useScrollIntoView.ts';
import type { FlatNode } from '../api/client.ts';

type Props = {
  node: FlatNode;
  depth: number;
  onSelect: (node: FlatNode) => void;
  selectedPath: string | null;
  scrollTargetPath: string | null;
  onScrollComplete: () => void;
  expandedPaths: Set<string>;
  toggleExpanded: (path: string) => void;
};

export default function TreeNode({ node, depth, onSelect, selectedPath, scrollTargetPath, onScrollComplete, expandedPaths, toggleExpanded }: Props) {
  const isExpanded = expandedPaths.has(node.path);

  // Only fetches when expanded; stays disabled (returns undefined) otherwise
  const { data, isLoading } = useChildren(isExpanded ? node.path : null);

  const canExpand = node.hasChildren ?? false;
  const isSelected = selectedPath === node.path;

  // Indentation: base offset (for root-level items) + per-level step
  const paddingLeft = 8 + (depth - 1) * 14 + (depth > 1 ? 4 : 0);

  const rowRef = useScrollIntoView(node.path, scrollTargetPath, onScrollComplete);

  const displayChildren = useInjectedChildren(node.path, selectedPath, isExpanded, isLoading, data);

  function handleChevronClick(e: MouseEvent) {
    e.stopPropagation();
    if (canExpand) toggleExpanded(node.path);
  }

  function handleRowClick() {
    // Don't overwrite a real selection with a synthetic node's data.
    // If this node is already selected, just toggle expansion.
    if (!isSelected) onSelect(node);
    if (canExpand) toggleExpanded(node.path);
  }

  return (
    <div>
      <div
        ref={rowRef}
        className={`flex items-center gap-1 pr-3 py-[5px] cursor-pointer hover:bg-surface-hover transition-colors text-sm ${isSelected ? '!bg-accent-dim' : ''}`}
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

      {isExpanded && (
        <div className="animate-fade-slide-in">
          {isLoading && (
            <LoadingRow depth={depth + 1} />
          )}
          {displayChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              scrollTargetPath={scrollTargetPath}
              onScrollComplete={onScrollComplete}
              expandedPaths={expandedPaths}
              toggleExpanded={toggleExpanded}
            />
          ))}
          {!isLoading && displayChildren.length === 0 && (
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
