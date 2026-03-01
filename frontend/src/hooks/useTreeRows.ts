import { useEffect, useMemo, useReducer } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTreeStore } from '../store/treeStore.ts'
import { directChildSegment } from '../lib/tree.ts'
import type { FlatNode } from '../api/client.ts'
import type {
  VisibleRow,
  LoadingVisibleRow,
  LoadVisibleRow,
  LoadMoreVisibleRow,
} from '../types/rows.ts'

type InfiniteData = {
  pages: Array<{ children: FlatNode[]; total: number }>
}

function insertSorted(children: FlatNode[], node: FlatNode): FlatNode[] {
  const insertAt = children.findIndex(
    (c) => c.name.localeCompare(node.name) > 0,
  )
  if (insertAt === -1) return [...children, node]
  return [
    ...children.slice(0, insertAt),
    node,
    ...children.slice(insertAt),
  ]
}

/**
 * Inserts stub FlatNodes for paths that should appear as children of `nodePath`
 * but aren't yet in fetched data. Checks both expandedPaths (currently expanded)
 * and syntheticPaths (navigated-to paths that survive collapse).
 */
function mergeSyntheticChildren(
  fetchedChildren: FlatNode[],
  expandedPaths: Set<string>,
  syntheticPaths: Set<string>,
  nodePath: string,
): FlatNode[] {
  let result = fetchedChildren
  const fetchedPaths = new Set(fetchedChildren.map((c) => c.path))
  const inserted = new Set<string>()

  for (const pathSet of [expandedPaths, syntheticPaths]) {
    for (const candidatePath of pathSet) {
      if (inserted.has(candidatePath)) continue
      const childSegment = directChildSegment(nodePath, candidatePath)
      if (childSegment !== null && !fetchedPaths.has(candidatePath)) {
        inserted.add(candidatePath)
        result = insertSorted(result, {
          path: candidatePath,
          name: candidatePath.split(' > ').pop() ?? '',
          size: null,
          // Always true: we have no real data yet; real node replaces stub on fetch
          hasChildren: true,
        })
      }
    }
  }

  return result
}

type StackEntry =
  | { kind: 'node'; node: FlatNode; depth: number }
  | { kind: 'flush'; rows: VisibleRow[] }

function buildRows(
  firstLevelChildren: FlatNode[],
  expandedPaths: Set<string>,
  syntheticPaths: Set<string>,
  queryClient: ReturnType<typeof useQueryClient>,
): VisibleRow[] {
  const rows: VisibleRow[] = []
  const stack: StackEntry[] = []

  for (let i = firstLevelChildren.length - 1; i >= 0; i--) {
    stack.push({ kind: 'node', node: firstLevelChildren[i], depth: 1 })
  }

  while (stack.length > 0) {
    const entry = stack.pop()!

    if (entry.kind === 'flush') {
      for (const row of entry.rows) rows.push(row)
      continue
    }

    const { node, depth } = entry
    const isExpanded = expandedPaths.has(node.path)
    const isSynthetic = syntheticPaths.has(node.path)

    rows.push({ kind: 'node', node, depth, isExpanded, isSynthetic })

    if (!isExpanded) continue

    const queryData = queryClient.getQueryData<InfiniteData>([
      'children',
      node.path,
    ])
    const queryState = queryClient.getQueryState(['children', node.path])

    const fetchedChildren: FlatNode[] =
      queryData?.pages.flatMap((p) => p.children) ?? []

    const mergedChildren = mergeSyntheticChildren(
      fetchedChildren,
      expandedPaths,
      syntheticPaths,
      node.path,
    )

    const isLoading = queryState?.status === 'pending' && !isSynthetic
    const total = queryData?.pages[queryData.pages.length - 1]?.total ?? 0
    const hasNextPage =
      !isSynthetic && fetchedChildren.length < total && total > 0
    const isFetchingNextPage =
      queryState?.fetchStatus === 'fetching' && queryData != null

    const trailingRows: VisibleRow[] = []
    if (isLoading) {
      const r: LoadingVisibleRow = {
        kind: 'loading',
        parentPath: node.path,
        depth: depth + 1,
      }
      trailingRows.push(r)
    }
    if (isSynthetic) {
      const r: LoadVisibleRow = {
        kind: 'load',
        parentPath: node.path,
        depth: depth + 1,
      }
      trailingRows.push(r)
    }
    if (hasNextPage) {
      const r: LoadMoreVisibleRow = {
        kind: 'load-more',
        parentPath: node.path,
        depth: depth + 1,
        isFetchingNextPage,
      }
      trailingRows.push(r)
    }

    if (trailingRows.length > 0) {
      stack.push({ kind: 'flush', rows: trailingRows })
    }
    for (let i = mergedChildren.length - 1; i >= 0; i--) {
      stack.push({ kind: 'node', node: mergedChildren[i], depth: depth + 1 })
    }
  }

  return rows
}

export function useTreeRows(firstLevelChildren: FlatNode[]): VisibleRow[] {
  const queryClient = useQueryClient()
  const expandedPaths = useTreeStore((s) => s.expandedPaths)
  const syntheticPaths = useTreeStore((s) => s.syntheticPaths)

  const [cacheVersion, bumpCache] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.queryKey[0] === 'children' &&
        (event.type === 'updated' || event.type === 'removed')
      ) {
        bumpCache()
      }
    })
  }, [queryClient])

  return useMemo(
    () =>
      buildRows(firstLevelChildren, expandedPaths, syntheticPaths, queryClient),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstLevelChildren, expandedPaths, syntheticPaths, queryClient, cacheVersion],
  )
}
