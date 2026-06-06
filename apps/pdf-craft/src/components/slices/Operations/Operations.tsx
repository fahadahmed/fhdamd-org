import { AutoGrid, OpCard, type OpCardIconVariant } from '@fhdamd/threads'
import type { Operation } from '../../../utils'

export const iconMap: Record<string, React.ReactNode> = {
  merge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3" />
      <path d="M15 3H9l-1 3h8l-1-3z" />
      <path d="M12 11v6M9 14l3 3 3-3" />
    </svg>
  ),
  convert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  encrypt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x={3} y={11} width={18} height={11} rx={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  decrypt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x={3} y={11} width={18} height={11} rx={2} />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  ),
  compress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </svg>
  ),
  sign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  summary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
      <path d="M17 17l1.5 1.5L21 16" />
    </svg>
  ),
}

export function deriveVariant(op: Operation, index: number): OpCardIconVariant {
  if (!op.active) return 'muted'
  return index % 2 === 0 ? 'terra' : 'sage'
}

export function OperationsContainer({
  operations,
  activeOnly = false,
  minColWidth = '280px',
}: {
  operations: Operation[]
  activeOnly?: boolean
  minColWidth?: string
}) {
  const visible = activeOnly ? operations.filter(op => op.active) : operations

  if (visible.length === 0) return null

  return (
    <AutoGrid minColWidth={minColWidth} gap={4}>
      {visible.map((op, i) => (
        <OpCard
          key={op.id}
          name={op.title}
          description={op.detail}
          credits={op.creditCost}
          href={op.active ? op.actionRoute : undefined}
          ctaLabel={op.actionLabel}
          icon={iconMap[op.iconKey]}
          iconVariant={deriveVariant(op, i)}
          status={op.active ? 'live' : 'soon'}
        />
      ))}
    </AutoGrid>
  )
}

export default function Operations({ operations }: { operations: Operation[] }) {
  return <OperationsContainer operations={operations} />
}
