import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '../api/client.ts'
import { useOutOfPageChild, insertSorted } from './useOutOfPageChild.ts'
import type { FlatNode } from '../api/client.ts'

const PAGE_SIZE = 100

export function useChildren(
  nodePath: string,
  selectedPath: string | null,
  isExpanded: boolean,
) {
  const query = useInfiniteQuery({
    queryKey: ['children', isExpanded ? nodePath : null],
    queryFn: ({ pageParam }) => api.getChildren(nodePath, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.children.length
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    enabled: isExpanded,
  })

  const fetchedChildren: FlatNode[] =
    query.data?.pages.flatMap((p) => p.children) ?? []

  const outOfPageChild = useOutOfPageChild(
    nodePath,
    selectedPath,
    isExpanded,
    query.isLoading,
    fetchedChildren,
    !!query.data,
  )
  const displayChildren = outOfPageChild
    ? insertSorted(fetchedChildren, outOfPageChild)
    : fetchedChildren

  return { ...query, displayChildren }
}

export function useRoot() {
  return useQuery({
    queryKey: ['root'],
    queryFn: () => api.getRoot(),
  })
}
