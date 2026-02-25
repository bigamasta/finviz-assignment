import type { FlatNode } from '../db/index.js';

export type TreeNode = {
  name: string;
  size: number;
  children: TreeNode[];
};

/**
 * Reconstructs a nested tree from flat DB rows.
 *
 * Algorithm: O(n) — single pass with a HashMap keyed by full path.
 * Rows must be sorted by depth ASC (parents before children).
 * parent_path is stored directly on each row, so no string splitting is needed.
 *
 * If parent_path were not stored, we'd split path on ' > ' at O(d) per node,
 * giving O(n*d) formally — but with d bounded to ~15, it's practically O(n).
 */
export function buildTree(nodes: FlatNode[]): TreeNode | null {
  const map = new Map<string, TreeNode>();
  let root: TreeNode | null = null;

  for (const item of nodes) {
    const node: TreeNode = {
      name: item.name,
      size: item.size,
      children: [],
    };

    map.set(item.path, node);

    if (item.parent_path === null) {
      root = node;
    } else {
      const parent = map.get(item.parent_path);
      parent?.children.push(node);
    }
  }

  return root;
}
