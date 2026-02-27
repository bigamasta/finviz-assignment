import { useSearch } from '../../hooks/useSearch.ts'
import type { FlatNode } from '../../api/client.ts'
import { ResultItem } from './ResultItem.tsx'
import { ResultsHeader } from './ResultsHeader.tsx'
import { Pagination } from './Pagination.tsx'

type Props = {
  query: string
  onSelect: (node: FlatNode) => void
}

export default function SearchResults({ query, onSelect }: Props) {
  const { data, isLoading, isFetching, page, totalPages, setPage } =
    useSearch(query)

  // Reset to page 0 when query changes
  // (handled by parent re-mounting via key — no explicit effect needed)

  if (isLoading) return <SearchLoading />

  if (!data || data.results.length === 0) {
    return <SearchEmpty query={query} />
  }

  return (
    <div className="animate-fade-in">
      <ResultsHeader
        query={query}
        total={data.total}
        isFetching={isFetching}
      />

      <div className="flex flex-col gap-1">
        {data.results.map((node) => (
          <ResultItem
            key={node.path}
            node={node}
            query={query}
            onSelect={onSelect}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center gap-2.5 p-6 text-text-2 text-sm">
      <span className="w-3.5 h-3.5 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
      Searching...
    </div>
  )
}

function SearchEmpty({ query }: { query: string }) {
  return (
    <div className="flex items-center justify-center p-6 text-text-3 text-sm">
      No results for <strong className="text-text-2 ml-1">"{query}"</strong>
    </div>
  )
}
