type Props = {
  size: number
  rootSize: number
  percentOfRoot: number
}

export default function SizeBar({ size, rootSize, percentOfRoot }: Props) {
  return (
    <div className="bg-surface rounded border border-border p-4">
      <div className="text-xs uppercase tracking-wider text-text-3 mb-3">
        Proportion of full dataset
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full size-bar-gradient rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(percentOfRoot, 0.05)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-3 mt-2">
        <span>{size.toLocaleString()} images in subtree</span>
        <span>of {rootSize.toLocaleString()} total</span>
      </div>
    </div>
  )
}
