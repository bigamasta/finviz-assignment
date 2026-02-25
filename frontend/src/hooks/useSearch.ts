import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.ts';

export function useSearch(query: string, offset = 0) {
  return useQuery({
    queryKey: ['search', query, offset],
    queryFn: () => api.search(query, 20, offset),
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
  });
}
