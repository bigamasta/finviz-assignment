import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSearch } from '../hooks/useSearch.ts';
import type { FlatNode } from '../api/client.ts';

type Props = {
  query: string;
  onSelect: (node: FlatNode) => void;
};

const PAGE_SIZE = 20;

export default function SearchResults({ query, onSelect }: Props) {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;

  const { data, isLoading, isFetching } = useSearch(query, offset);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  // Reset to page 0 when query changes
  // (handled by parent re-mounting via key — no explicit effect needed)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2.5 p-6 text-text-2 text-sm">
        <span className="w-3.5 h-3.5 border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0" />
        Searching...
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-text-3 text-sm">
        No results for <strong className="text-text-2 ml-1">"{query}"</strong>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-1">Results for "{query}"</h2>
        <span className="text-xs text-text-3">
          {isFetching ? '…' : `${data.total.toLocaleString()} matches`}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {data.results.map((node) => (
          <div
            key={node.path}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-border bg-surface hover:bg-surface-hover hover:border-border-bright cursor-pointer transition-colors"
            onClick={() => onSelect(node)}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text-1 truncate">
                {highlightMatch(node.name, query)}
              </div>
              <div className="text-xs text-text-3 truncate mt-0.5" title={node.path}>
                {node.path}
              </div>
            </div>
            {node.size > 0 && (
              <span className="shrink-0 text-xs font-mono text-teal bg-teal-dim px-2 py-0.5 rounded-sm">
                {node.size.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border">
          <button
            className="px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface-2 text-text-2 cursor-pointer transition-colors enabled:hover:bg-surface-hover enabled:hover:text-text-1 disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
          >
            ← Prev
          </button>

          <span className="text-xs text-text-3 font-mono">
            {page + 1} / {totalPages}
          </span>

          <button
            className="px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface-2 text-text-2 cursor-pointer transition-colors enabled:hover:bg-surface-hover enabled:hover:text-text-1 disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isFetching}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/** Highlights the first occurrence of `query` in `text` with a <mark> element. */
function highlightMatch(text: string, query: string): ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
