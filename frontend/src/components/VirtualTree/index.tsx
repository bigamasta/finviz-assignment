import { useEffect, useRef } from 'react'
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual'
import { useTreeStore } from '../../store/treeStore.ts'
import { useTreeRows } from '../../hooks/useTreeRows.ts'
import { QueryKeepers } from './QueryKeepers.tsx'
import { TreeRow } from './TreeRow.tsx'
import type { FlatNode } from '../../api/client.ts'
import { VisibleRow } from '../../types/rows.ts'

type Props = {
  firstLevelChildren: FlatNode[]
}

function useScrollToIndex(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  rows: VisibleRow[],
) {
  const scrollTargetPath = useTreeStore((s) => s.scrollTargetPath)
  const clearScrollTargetPath = useTreeStore((s) => s.clearScrollTargetPath)

  // O(1) index-based scroll — replaces DOM scrollIntoView traversal
  useEffect(() => {
    if (!scrollTargetPath) return
    const idx = rows.findIndex(
      (r) => r.kind === 'node' && r.node.path === scrollTargetPath,
    )
    // Don't clear — wait for rows to update when ancestor data arrives
    if (idx === -1) return
    virtualizer.scrollToIndex(idx, { behavior: 'smooth', align: 'start' })
    clearScrollTargetPath()
  }, [scrollTargetPath, rows, virtualizer, clearScrollTargetPath])
}

export function VirtualTree({ firstLevelChildren }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rows = useTreeRows(firstLevelChildren)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    overscan: 5,
  })

  useScrollToIndex(virtualizer, rows)

  return (
    <>
      {/* Invisible query holders — one per expanded path */}
      <QueryKeepers />

      {/* Scroll container — owns overflow, VirtualTree fills 100% of aside */}
      <div
        ref={scrollRef}
        style={{ overflow: 'auto', height: '100%', contain: 'strict' }}
      >
        {/* Spacer that gives the virtualizer its total scroll height */}
        <div
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <TreeRow row={row} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
