import type { FlatNode } from '../api/client.ts';

type Props = {
  node: FlatNode;
  rootSize: number;
};

export default function NodeDetail({ node, rootSize }: Props) {
  const segments = node.path.split(' > ');
  const depth = segments.length - 1;
  const pct = rootSize > 0 ? (node.size / rootSize) * 100 : 0;
  const pctDisplay = pct < 0.01 ? '<0.01' : pct.toFixed(2);

  return (
    <div className="animate-fade-in" key={node.path}>
      {/* Breadcrumb path */}
      <div className="flex flex-wrap items-center gap-1 text-xs text-text-3 mb-3">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-text-3">›</span>}
            <span className={i === segments.length - 1 ? 'text-text-2 font-medium' : ''}>
              {seg}
            </span>
          </span>
        ))}
      </div>

      {/* Node name */}
      <h1 className="text-xl font-semibold text-text-1 mb-5">{node.name}</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-text-3 mb-1">Subtree Images</div>
          <div className="text-2xl font-semibold font-mono text-teal">
            {node.size.toLocaleString()}
          </div>
        </div>

        <div className="bg-surface rounded border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-text-3 mb-1">Depth</div>
          <div className="text-2xl font-semibold font-mono text-accent">{depth}</div>
        </div>

        <div className="bg-surface rounded border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-text-3 mb-1">% of Root</div>
          <div className="text-2xl font-semibold font-mono text-text-1">{pctDisplay}%</div>
        </div>
      </div>

      {/* Size bar */}
      {rootSize > 0 && (
        <div className="bg-surface rounded border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-text-3 mb-3">Proportion of full dataset</div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full size-bar-gradient rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max(pct, 0.05)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-3 mt-2">
            <span>{node.size.toLocaleString()} images in subtree</span>
            <span>of {rootSize.toLocaleString()} total</span>
          </div>
        </div>
      )}
    </div>
  );
}
