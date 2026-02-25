const BASE = '/api';

export type FlatNode = {
  path: string;
  name: string;
  size: number;
  hasChildren?: boolean;
};

export type RootResponse = {
  node: FlatNode;
  children: FlatNode[];
};

export type ChildrenResponse = {
  children: FlatNode[];
  total: number;
};

export type SearchResponse = {
  results: FlatNode[];
  total: number;
  query: string;
  limit: number;
  offset: number;
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getRoot(): Promise<RootResponse> {
    return get(`${BASE}/nodes/root`);
  },

  getChildren(path: string, limit = 100, offset = 0): Promise<ChildrenResponse> {
    const params = new URLSearchParams({ path, limit: String(limit), offset: String(offset) });
    return get(`${BASE}/nodes/children?${params}`);
  },

  search(q: string, limit = 20, offset = 0): Promise<SearchResponse> {
    const params = new URLSearchParams({ q, limit: String(limit), offset: String(offset) });
    return get(`${BASE}/search?${params}`);
  },
};
