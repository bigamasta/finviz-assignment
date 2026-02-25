import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.ts';

export function useChildren(path: string | null, enabled = true) {
  return useQuery({
    queryKey: ['children', path],
    queryFn: () => api.getChildren(path!),
    enabled: enabled && path !== null,
  });
}

export function useRoot() {
  return useQuery({
    queryKey: ['root'],
    queryFn: () => api.getRoot(),
  });
}
