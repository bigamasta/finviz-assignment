import { StatCard } from './StatCard.tsx'

type Props = {
  size: number | null
  depth: number
  percentOfRootLabel: string
}

export default function Stats({ size, depth, percentOfRootLabel }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <StatCard
        label="Subtree Images"
        value={size?.toLocaleString() ?? '—'}
        valueClassName="text-teal"
      />
      <StatCard label="Depth" value={depth} valueClassName="text-accent" />
      <StatCard label="% of Root" value={`${percentOfRootLabel}%`} />
    </div>
  )
}
