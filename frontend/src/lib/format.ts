/** Compact display: 1200 → "1.2k", 999 → "999". */
export function formatSize(size: number): string {
  if (size >= 1000) return `${(size / 1000).toFixed(1)}k`
  return String(size)
}
