type ResultsHeaderProps = {
  query: string
  total: number
  isFetching: boolean
}

export function ResultsHeader({ query, total, isFetching }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-text-1">
        Results for "{query}"
      </h2>
      <span className="text-xs text-text-3">
        {isFetching ? '…' : `${total.toLocaleString()} matches`}
      </span>
    </div>
  )
}
