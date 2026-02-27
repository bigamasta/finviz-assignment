import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.ts'

const PAGE_SIZE = 20

export function useSearch(query: string) {
  const [page, setPage] = useState(0)
  const offset = page * PAGE_SIZE

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query, offset],
    queryFn: () => api.search(query, PAGE_SIZE, offset),
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return { data, isLoading, isFetching, page, totalPages, setPage }
}
