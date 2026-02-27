type Props = {
  segments: string[]
}

export default function Breadcrumbs({ segments }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-text-3 mb-3">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-text-3">›</span>}
          <span
            className={
              i === segments.length - 1 ? 'text-text-2 font-medium' : ''
            }
          >
            {seg}
          </span>
        </span>
      ))}
    </div>
  )
}
