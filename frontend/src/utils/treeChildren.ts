import type { FlatNode } from '../api/client.ts'

/**
 * Inserts a node into a sorted children array by name, preserving sort order.
 */
function insertSorted(children: FlatNode[], node: FlatNode): FlatNode[] {
  const insertAt = children.findIndex(
    (c) => c.name.localeCompare(node.name) > 0,
  )
  if (insertAt === -1) return [...children, node]
  return [...children.slice(0, insertAt), node, ...children.slice(insertAt)]
}

/**
 * Merges navigated-to immediate children into the fetched list.
 * Handles two cases in one pass:
 *   1. Fetch disabled — no API data; expandedPaths is the only source.
 *   2. Fetch enabled but child is beyond the loaded pages (out-of-page).
 */
export function mergeExpandedChildren(
  fetchedChildren: FlatNode[],
  expandedPaths: Set<string>,
  nodePath: string,
  selectedPath: string | null,
): FlatNode[] {
  let result = fetchedChildren
  const prefix = nodePath + ' > '
  const fetchedPaths = new Set(fetchedChildren.map((c) => c.path))
  for (const expandedPath of expandedPaths) {
    const isDescendant = expandedPath.startsWith(prefix)
    const isDirectChild = !expandedPath.slice(prefix.length).includes(' > ')
    if (isDescendant && isDirectChild && !fetchedPaths.has(expandedPath)) {
      result = insertSorted(result, {
        path: expandedPath,
        name: expandedPath.split(' > ').pop() ?? '',
        size: null, // unknown — synthetic node not yet returned by the API
        hasChildren: expandedPath !== selectedPath,
      })
    }
  }
  return result
}
