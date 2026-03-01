// Indentation layout for the tree — internal constants, not exported.
const INDENT_BASE = 8
const INDENT_STEP = 14
const INDENT_GUTTER = 4 // extra gutter applied when depth > 1
const CHEVRON_WIDTH = 22 // space reserved for rows that have no chevron

/**
 * Calculates left padding (px) for a tree row at the given depth.
 * Pass `innerContent = true` for rows without a chevron — adds CHEVRON_WIDTH
 * so their text aligns with node names.
 */
export function indentPadding(depth: number, innerContent = false): number {
  return (
    INDENT_BASE +
    (depth - 1) * INDENT_STEP +
    (depth > 1 ? INDENT_GUTTER : 0) +
    (innerContent ? CHEVRON_WIDTH : 0)
  )
}

/**
 * Returns the direct-child path segment of `candidatePath` relative to
 * `parentPath`, or `null` if it is not an immediate child.
 *
 * Example: parentPath="a > b", candidatePath="a > b > c" → "c"
 *          parentPath="a > b", candidatePath="a > b > c > d" → null (grandchild)
 */
export function directChildSegment(
  parentPath: string,
  candidatePath: string,
): string | null {
  const prefix = parentPath + ' > '
  if (!candidatePath.startsWith(prefix)) return null
  const remainder = candidatePath.slice(prefix.length)
  return remainder.includes(' > ') ? null : remainder
}
