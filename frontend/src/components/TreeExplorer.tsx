import { useRoot } from '../hooks/useChildren.ts';
import TreeNode from './TreeNode.tsx';
import type { FlatNode } from '../api/client.ts';

type Props = {
  onSelect: (node: FlatNode) => void;
  selectedPath: string | null;
};

export default function TreeExplorer({ onSelect, selectedPath }: Props) {
  const { data, isLoading, error } = useRoot();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2.5 p-6 text-text-2 text-sm">
        <span className="w-3.5 h-3.5 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
        Loading taxonomy...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red text-sm leading-relaxed">
        Failed to connect to backend.
        <br />
        Make sure it's running on port 3001.
      </div>
    );
  }

  const isRootSelected = selectedPath === data.node.path;

  return (
    <div>
      {/* Root node — always visible, acts as tree header */}
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border hover:bg-surface-hover transition-colors ${isRootSelected ? 'bg-accent-dim' : ''}`}
        onClick={() => onSelect(data.node)}
        title={data.node.path}
      >
        <span className="text-accent text-sm">◈</span>
        <span className="font-semibold text-sm text-text-1 truncate">{data.node.name}</span>
        <span className="ml-auto text-xs font-mono text-text-3 bg-surface-2 px-1.5 py-0.5 rounded-sm">
          {data.node.size.toLocaleString()}
        </span>
      </div>

      {/* First-level children — pre-loaded from useRoot */}
      <div>
        {data.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={1}
            onSelect={onSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
}
