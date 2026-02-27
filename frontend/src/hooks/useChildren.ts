import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '../api/client.ts'
import type { FlatNode } from '../api/client.ts'

const PAGE_SIZE = 100

export function useChildren(nodePath: string, isFetchDisabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ['children', nodePath],
    queryFn: ({ pageParam }) => api.getChildren(nodePath, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.children.length
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    enabled: !isFetchDisabled,
  })

  const fetchedChildren: FlatNode[] =
    query.data?.pages.flatMap((p) => p.children) ?? []

  return { ...query, fetchedChildren }
}

export function useRoot() {
  return useQuery({
    queryKey: ['root'],
    queryFn: () => api.getRoot(),
  })
}
