import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../api/client.ts";
import { useInjectedChildren } from "./useInjectedChildren.ts";
import type { FlatNode } from "../api/client.ts";

const PAGE_SIZE = 100;

/** Returns one synthetic child per nav target that passes through this node. */
function getNavDisplayChildren(nodePath: string, navTargetPaths: string[]): FlatNode[] {
  const prefix = nodePath + ' > ';
  const seen = new Set<string>();
  const result: FlatNode[] = [];
  for (const targetPath of navTargetPaths) {
    if (!targetPath.startsWith(prefix)) continue;
    const nextSegment = targetPath.slice(prefix.length).split(' > ')[0];
    const nextPath = `${prefix}${nextSegment}`;
    if (!seen.has(nextPath)) {
      seen.add(nextPath);
      result.push({ path: nextPath, name: nextSegment, size: 0, hasChildren: nextPath !== targetPath });
    }
  }
  return result;
}

export function useChildren(nodePath: string, selectedPath: string | null, isExpanded: boolean, isNavExpanded: boolean, navTargetPaths: string[]) {
  const path = isExpanded && !isNavExpanded ? nodePath : null;

  const query = useInfiniteQuery({
    queryKey: ["children", path],
    queryFn: ({ pageParam }) => api.getChildren(path!, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.children.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: path !== null,
  });

  const allChildren: FlatNode[] = query.data?.pages.flatMap((p) => p.children) ?? [];
  const normalDisplayChildren = useInjectedChildren(nodePath, selectedPath, isExpanded, query.isLoading, allChildren, !!query.data);
  const displayChildren = isNavExpanded ? getNavDisplayChildren(nodePath, navTargetPaths) : normalDisplayChildren;

  return { ...query, displayChildren };
}

export function useRoot() {
  return useQuery({
    queryKey: ["root"],
    queryFn: () => api.getRoot(),
  });
}
