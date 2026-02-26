import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../api/client.ts";
import { useInjectedChildren } from "./useInjectedChildren.ts";
import type { FlatNode } from "../api/client.ts";

const PAGE_SIZE = 100;

export function useChildren(nodePath: string, selectedPath: string | null, isExpanded: boolean) {
  const path = isExpanded ? nodePath : null;

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
  const displayChildren = useInjectedChildren(nodePath, selectedPath, isExpanded, query.isLoading, allChildren, !!query.data);

  return { ...query, displayChildren };
}

export function useRoot() {
  return useQuery({
    queryKey: ["root"],
    queryFn: () => api.getRoot(),
  });
}
