import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../api/client.ts";
import { useInjectedChildren } from "./useInjectedChildren.ts";
import type { FlatNode } from "../api/client.ts";

const PAGE_SIZE = 100;

/** For nav-expanded nodes, builds synthetic children for each nav target that passes through this node. */
function buildNavChildren(
  nodePath: string,
  navTargetPaths: string[],
): FlatNode[] {
  const prefix = nodePath + " > ";
  const seen = new Set<string>();
  const children: FlatNode[] = [];

  for (const targetPath of navTargetPaths) {
    if (!targetPath.startsWith(prefix)) continue;

    const nextSegment = targetPath.slice(prefix.length).split(" > ")[0];
    const childPath = `${prefix}${nextSegment}`;
    if (seen.has(childPath)) continue;

    seen.add(childPath);
    const isLeaf = childPath === targetPath;
    children.push({
      path: childPath,
      name: nextSegment,
      size: 0,
      hasChildren: !isLeaf,
    });
  }

  return children;
}

export function useChildren(
  nodePath: string,
  selectedPath: string | null,
  isExpanded: boolean,
  isNavExpanded: boolean,
  navTargetPaths: string[],
) {
  // Only fetch from the API when manually expanded (not nav-expanded, which uses synthetic children).
  const shouldFetch = isExpanded && !isNavExpanded;

  const query = useInfiniteQuery({
    queryKey: ["children", shouldFetch ? nodePath : null],
    queryFn: ({ pageParam }) => api.getChildren(nodePath, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const nextOffset = lastPageParam + lastPage.children.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: shouldFetch,
  });

  const fetchedChildren: FlatNode[] =
    query.data?.pages.flatMap((p) => p.children) ?? [];
  const childrenWithInjections = useInjectedChildren(
    nodePath,
    selectedPath,
    isExpanded,
    query.isLoading,
    fetchedChildren,
    !!query.data,
  );
  const displayChildren = isNavExpanded
    ? buildNavChildren(nodePath, navTargetPaths)
    : childrenWithInjections;

  return { ...query, displayChildren };
}

export function useRoot() {
  return useQuery({
    queryKey: ["root"],
    queryFn: () => api.getRoot(),
  });
}
