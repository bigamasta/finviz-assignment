import type { FlatNode } from '../api/client.ts';

/**
 * Given a parent node path and a selected descendant path, returns the
 * immediate child path that leads toward the selected node.
 * Returns null if selectedPath is not a descendant of nodePath.
 *
 * @example
 * findChildPathToward('fall11 > n00001', 'fall11 > n00001 > n00002 > n00003')
 * // => 'fall11 > n00001 > n00002'
 */
function findChildPathToward(nodePath: string, selectedPath: string | null): string | null {
  if (!selectedPath) return null;
  const prefix = nodePath + ' > ';
  if (!selectedPath.startsWith(prefix)) return null;
  const nextSegment = selectedPath.slice(prefix.length).split(' > ')[0];
  return `${prefix}${nextSegment}`;
}

/**
 * Inserts a node into a sorted children array by name, preserving sort order.
 */
export function insertSorted(children: FlatNode[], node: FlatNode): FlatNode[] {
  const insertAt = children.findIndex((c) => c.name.localeCompare(node.name) > 0);
  if (insertAt === -1) return [...children, node];
  return [...children.slice(0, insertAt), node, ...children.slice(insertAt)];
}

/**
 * Returns the children list to render, with a synthetic placeholder injected
 * when the next ancestor toward `selectedPath` is missing from the loaded pages.
 *
 * This happens when a parent has >100 children and the target child falls
 * outside the fetched pages. The injected placeholder triggers `useChildren`
 * for the real path, allowing the expand cascade to continue past the
 * pagination boundary.
 */
export function useOutOfPageChild(
  nodePath: string,
  selectedPath: string | null,
  isExpanded: boolean,
  isLoading: boolean,
  children: FlatNode[],
  hasData: boolean,
): FlatNode | null {
  const canInject = isExpanded && !isLoading && hasData
  const targetChildPath = canInject
    ? findChildPathToward(nodePath, selectedPath)
    : null

  // If the target child is already in the fetched children, no injection needed.
  if (!targetChildPath || children.some((c) => c.path === targetChildPath)) {
    return null
  }

  return {
    path: targetChildPath,
    name: targetChildPath.split(' > ').pop() ?? '',
    size: 0,
    hasChildren: targetChildPath !== selectedPath,
  }
}
