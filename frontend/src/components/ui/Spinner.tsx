type SpinnerProps = {
  /** 'sm' = 12px (tree rows), 'md' = 14px (full-panel loading states). */
  size?: 'sm' | 'md'
}

export function Spinner({ size = 'sm' }: SpinnerProps) {
  const dim = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'
  return (
    <span
      className={`${dim} border-2 border-border-bright border-t-accent rounded-full animate-spin shrink-0`}
    />
  )
}
