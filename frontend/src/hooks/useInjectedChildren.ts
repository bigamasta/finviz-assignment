import type { FlatNode, ChildrenResponse } from '../api/client.ts';

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
 * API response (happens when a parent has >100 children and the target falls
 * outside the first page).
 *
 * The injected node is a placeholder that triggers `useChildren` for the real
 * path, allowing the expand cascade to continue past the pagination boundary.
 */
export function useInjectedChildren(
  nodePath: string,
  selectedPath: string | null,
  isExpanded: boolean,
  isLoading: boolean,
  data: ChildrenResponse | undefined,
): FlatNode[] {
  const apiChildren = data?.children ?? [];

  const nextPathStepPath =
    isExpanded && !isLoading && data
      ? getNextPathStep(nodePath, selectedPath)
      : null;

  const injectedPathStep: FlatNode | null =
    nextPathStepPath && !apiChildren.some((c) => c.path === nextPathStepPath)
      ? {
          path: nextPathStepPath,
          name: nextPathStepPath.split(' > ').pop() ?? '',
          size: 0,
          hasChildren: nextPathStepPath !== selectedPath,
        }
      : null;

  return injectedPathStep ? [injectedPathStep, ...apiChildren] : apiChildren;
}
