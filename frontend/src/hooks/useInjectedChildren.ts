import type { FlatNode } from '../api/client.ts';

/**
 * When a node is expanded and `selectedPath` is a descendant of it,
 * returns the path of the immediate child that leads toward selectedPath.
 * Returns null otherwise.
 */
function getNextPathStep(nodePath: string, selectedPath: string | null): string | null {
  if (!selectedPath) return null;
  const prefix = nodePath + ' > ';
  if (!selectedPath.startsWith(prefix)) return null;
  const remainder = selectedPath.slice(prefix.length);
  const nextSegment = remainder.split(' > ')[0];
  return `${prefix}${nextSegment}`;
}

/**
 * Returns the children list to render for a tree node, with a synthetic node
 * injected when the next ancestor toward `selectedPath` is missing from the
 * loaded pages (happens when a parent has >100 children and the target falls
 * outside the fetched pages).
 *
 * The injected node is a placeholder that triggers `useChildren` for the real
 * path, allowing the expand cascade to continue past the pagination boundary.
 */
export function useInjectedChildren(
  nodePath: string,
  selectedPath: string | null,
  isExpanded: boolean,
  isLoading: boolean,
  children: FlatNode[],
  hasData: boolean,
): FlatNode[] {
  const nextPathStepPath =
    isExpanded && !isLoading && hasData
      ? getNextPathStep(nodePath, selectedPath)
      : null;

  const injectedPathStep: FlatNode | null =
    nextPathStepPath && !children.some((c) => c.path === nextPathStepPath)
      ? {
          path: nextPathStepPath,
          name: nextPathStepPath.split(' > ').pop() ?? '',
          size: 0,
          hasChildren: nextPathStepPath !== selectedPath,
        }
      : null;

  if (!injectedPathStep) return children;
  const insertAt = children.findIndex((c) => c.name.localeCompare(injectedPathStep.name) > 0);
  return insertAt === -1
    ? [...children, injectedPathStep]
    : [...children.slice(0, insertAt), injectedPathStep, ...children.slice(insertAt)];
}
