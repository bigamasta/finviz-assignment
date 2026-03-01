import { memo, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../../api/client.ts'
import { CHILDREN_PAGE_SIZE } from '../../lib/constants.ts'
import { useQueryKeeperRegistry } from '../../context/QueryKeeperContext.ts'
import { useTreeStore } from '../../store/treeStore.ts'

type KeeperProps = {
  path: string
  isFetchDisabled: boolean
}

/**
 * Invisible component that holds useInfiniteQuery for one expanded path.
 * Registers fetchNextPage into the QueryKeeperRegistry so TreeRow can
 * trigger pagination without mounting a query itself.
 */
const QueryKeeper = memo(function QueryKeeper({
  path,
  isFetchDisabled,
}: KeeperProps) {
  const registry = useQueryKeeperRegistry()

  const { fetchNextPage } = useInfiniteQuery({
    queryKey: ['children', path],
    queryFn: ({ pageParam }) => api.getChildren(path, CHILDREN_PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.children.length
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    enabled: !isFetchDisabled,
  })

  useEffect(() => {
    registry.register(path, fetchNextPage)
    return () => registry.unregister(path)
  }, [registry, path, fetchNextPage])

  return null
})

/**
 * Renders one invisible QueryKeeper per active (non-disabled) expanded path.
 */
export const QueryKeepers = memo(function QueryKeepers() {
  const expandedPaths = useTreeStore((s) => s.expandedPaths)
  const syntheticPaths = useTreeStore((s) => s.syntheticPaths)

  return (
    <>
      {[...expandedPaths].map((path) => (
        <QueryKeeper
          key={path}
          path={path}
          isFetchDisabled={syntheticPaths.has(path)}
        />
      ))}
    </>
  )
})
