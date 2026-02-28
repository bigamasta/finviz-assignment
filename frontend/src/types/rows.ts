import type { FlatNode } from '../api/client.ts'

export type NodeVisibleRow = {
  kind: 'node'
  node: FlatNode
  depth: number
  isExpanded: boolean
  isFetchDisabled: boolean
}

export type LoadingVisibleRow = {
  kind: 'loading'
  parentPath: string
  depth: number
}

export type LoadVisibleRow = {
  kind: 'load'
  parentPath: string
  depth: number
}

export type LoadMoreVisibleRow = {
  kind: 'load-more'
  parentPath: string
  depth: number
  isFetchingNextPage: boolean
}

export type VisibleRow =
  | NodeVisibleRow
  | LoadingVisibleRow
  | LoadVisibleRow
  | LoadMoreVisibleRow
