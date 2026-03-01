type StatCardProps = {
  label: string
  value: string | number
  valueClassName?: string
}

export function StatCard({
  label,
  value,
  valueClassName = 'text-text-1',
}: StatCardProps) {
  return (
    <div className="bg-surface rounded border border-border p-4">
      <div className="text-xs uppercase tracking-wider text-text-3 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-semibold font-mono ${valueClassName}`}>
        {value}
      </div>
    </div>
  )
}
