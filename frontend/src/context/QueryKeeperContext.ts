import { createContext, useContext } from 'react'

export class QueryKeeperRegistry {
  private map = new Map<string, () => Promise<unknown>>()

  register(path: string, fn: () => Promise<unknown>) {
    this.map.set(path, fn)
  }

  unregister(path: string) {
    this.map.delete(path)
  }

  fetchNextPage(path: string) {
    void this.map.get(path)?.()
  }
}

// Module-level singleton — stable identity, no useMemo needed in provider
const defaultRegistry = new QueryKeeperRegistry()

export const QueryKeeperContext =
  createContext<QueryKeeperRegistry>(defaultRegistry)

export const useQueryKeeperRegistry = () => useContext(QueryKeeperContext)
