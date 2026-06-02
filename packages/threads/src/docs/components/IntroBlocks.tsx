import type { CSSProperties } from 'react'

export function Chip({ children }: { children: string }) {
  return (
    <span style={{
      fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '5px 12px', borderRadius: '9999px',
      border: '1px solid var(--th-color-border-strong)', color: 'var(--th-color-text-3)',
      background: 'var(--th-color-surface-2)',
    }}>
      {children}
    </span>
  )
}

export function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div style={{
      background: 'var(--th-color-surface-1)', border: '1px solid var(--th-color-border-default)',
      borderRadius: '14px', padding: '20px',
    }}>
      <div style={{ fontVariationSettings: '"wdth" 92, "wght" 650', fontSize: '1.0625rem', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontVariationSettings: '"wdth" 90, "wght" 380', fontSize: '1.0625rem', lineHeight: 1.55, color: 'var(--th-color-text-2)' }}>
        {body}
      </div>
    </div>
  )
}

type StatusKey = 'done' | 'stories' | 'pending'

const badgeMap: Record<StatusKey, { bg: string; color: string; label: string }> = {
  done:    { bg: 'var(--th-color-sage-subtle)',   color: 'var(--th-color-sage-text)',   label: 'Done' },
  stories: { bg: 'var(--th-color-accent-subtle)', color: 'var(--th-color-accent-text)', label: 'No tests' },
  pending: { bg: 'var(--th-color-surface-3)',     color: 'var(--th-color-text-3)',       label: 'Pending' },
}

export function StatusBadge({ status }: { status: StatusKey }) {
  const { bg, color, label } = badgeMap[status] ?? badgeMap.pending
  return (
    <span style={{
      fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em',
      textTransform: 'uppercase', background: bg, color,
      padding: '3px 10px', borderRadius: '9999px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: 'var(--th-font-mono)', fontSize: '0.875rem', lineHeight: 1.65,
      background: 'var(--th-color-surface-inverse)', color: '#e8e4dc',
      borderRadius: '14px', padding: '24px', overflowX: 'auto', whiteSpace: 'pre',
    }}>
      {children}
    </pre>
  )
}

export function StatusTable() {
  const rows = [
    { name: 'Button',          used: 'All',               stories: 'done'    as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Card',            used: 'All',               stories: 'done'    as StatusKey, tests: 'pending' as StatusKey },
    { name: 'OpCard',          used: 'PDF-Craft',         stories: 'done'    as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Badge + Tag',     used: 'All',               stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'SiteNav',         used: 'PDF-Craft, fhdamd', stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'SiteFooter',      used: 'PDF-Craft, fhdamd', stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'PriceCard',       used: 'PDF-Craft',         stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Testimonial',     used: 'PDF-Craft',         stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Toast',           used: 'PDF-Craft',         stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Callout / Banner',used: 'All',               stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Progress bar',    used: 'PDF-Craft, Jamaal', stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Toggle',          used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Accordion',       used: 'PDF-Craft',         stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Form elements',   used: 'PDF-Craft, fhdamd', stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Tabs',            used: 'All',               stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Breadcrumb',      used: 'PDF-Craft',         stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Stepper',         used: 'PDF-Craft, Jamaal', stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Dialog',          used: 'All',               stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Tooltip',         used: 'All',               stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Task row',        used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Habit row',       used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'SparklineCard',   used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'HeatmapCell',     used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
    { name: 'Mobile tab bar',  used: 'Jamaal',            stories: 'pending' as StatusKey, tests: 'pending' as StatusKey },
  ]

  const th: CSSProperties = {
    fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--th-color-text-3)', padding: '10px 16px',
    textAlign: 'left', borderBottom: '1px solid var(--th-color-border-default)', fontWeight: 400,
  }
  const td: CSSProperties = {
    padding: '10px 16px', color: 'var(--th-color-text-2)',
    borderBottom: '1px solid var(--th-color-border-subtle)', fontSize: '1.0625rem',
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.0625rem', marginBottom: '48px' }}>
      <thead>
        <tr>
          <th style={th}>Component</th>
          <th style={th}>Used by</th>
          <th style={th}>Stories</th>
          <th style={th}>Tests</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.name}>
            <td style={{ ...td, fontVariationSettings: '"wdth" 92, "wght" 550', color: 'var(--th-color-text-1)' }}>{row.name}</td>
            <td style={{ ...td, fontFamily: 'var(--th-font-mono)', fontSize: '0.75rem', color: 'var(--th-color-text-3)' }}>{row.used}</td>
            <td style={td}><StatusBadge status={row.stories} /></td>
            <td style={td}><StatusBadge status={row.tests} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
