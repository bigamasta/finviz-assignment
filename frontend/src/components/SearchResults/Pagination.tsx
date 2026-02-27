type PaginationProps = {
  page: number
  totalPages: number
  isFetching: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border">
      <button
        className="px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface-2 text-text-2 cursor-pointer transition-colors enabled:hover:bg-surface-hover enabled:hover:text-text-1 disabled:opacity-35 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0 || isFetching}
      >
        ← Prev
      </button>

      <span className="text-xs text-text-3 font-mono">
        {page + 1} / {totalPages}
      </span>

      <button
        className="px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface-2 text-text-2 cursor-pointer transition-colors enabled:hover:bg-surface-hover enabled:hover:text-text-1 disabled:opacity-35 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1 || isFetching}
      >
        Next →
      </button>
    </div>
  )
}
