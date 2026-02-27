type Props = {
  size: number | null
  depth: number
  percentOfRootLabel: string
}

export default function Stats({ size, depth, percentOfRootLabel }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-surface rounded border border-border p-4">
        <div className="text-xs uppercase tracking-wider text-text-3 mb-1">
          Subtree Images
        </div>
        <div className="text-2xl font-semibold font-mono text-teal">
          {size?.toLocaleString() ?? '—'}
        </div>
      </div>

      <div className="bg-surface rounded border border-border p-4">
        <div className="text-xs uppercase tracking-wider text-text-3 mb-1">
          Depth
        </div>
        <div className="text-2xl font-semibold font-mono text-accent">
          {depth}
        </div>
      </div>

      <div className="bg-surface rounded border border-border p-4">
        <div className="text-xs uppercase tracking-wider text-text-3 mb-1">
          % of Root
        </div>
        <div className="text-2xl font-semibold font-mono text-text-1">
          {percentOfRootLabel}%
        </div>
      </div>
    </div>
  )
}
