import type { CSSProperties } from 'react'

declare const __THREADS_VERSION__: string

export function PackageVersion() {
  return <>{__THREADS_VERSION__}</>
}

export function Chip({ children }: { children: string }) {
  return (
    <span style={{
      fontFamily: 'var(--th-font-mono)', fontWeight: 500, fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)',
      textTransform: 'uppercase', padding: '5px 12px', borderRadius: 'var(--th-radius-pill)',
      border: '1px solid var(--th-line-2)', color: 'var(--th-ink-3)',
      background: 'var(--th-sidebar)',
    }}>
      {children}
    </span>
  )
}

export function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div style={{
      background: 'var(--th-card)', border: '1px solid var(--th-line)',
      borderRadius: 'var(--th-radius-card)', padding: '20px',
    }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--th-body-size)', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: 'var(--th-body-size)', lineHeight: 1.55, color: 'var(--th-ink-2)' }}>
        {body}
      </div>
    </div>
  )
}

type StatusKey = 'done' | 'stories' | 'pending'

const badgeMap: Record<StatusKey, { bg: string; color: string; label: string }> = {
  done:    { bg: 'var(--th-d1)',                  color: 'var(--th-accent)', label: 'Done' },
  stories: { bg: 'var(--th-color-accent-subtle)', color: 'var(--th-terra)',  label: 'No tests' },
  pending: { bg: 'var(--th-d1)',                  color: 'var(--th-ink-2)',  label: 'Pending' },
}

export function StatusBadge({ status }: { status: StatusKey }) {
  const { bg, color, label } = badgeMap[status] ?? badgeMap.pending
  return (
    <span style={{
      fontFamily: 'var(--th-font-mono)', fontWeight: 500, fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)',
      textTransform: 'uppercase', background: bg, color,
      padding: '3px 10px', borderRadius: 'var(--th-radius-pill)', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-text-sm)', lineHeight: 1.65,
      background: 'var(--th-deep)', color: 'var(--th-on-deep)',
      borderRadius: 'var(--th-radius-card)', padding: '24px', overflowX: 'auto', whiteSpace: 'pre',
    }}>
      {children}
    </pre>
  )
}

/** Components migrated to Threads 2.0 (component CSS on v2 names). Update as the migration lands. */
const migratedToV2 = new Set([
  'Button', 'Badge + Tag', 'Toggle', 'Card', 'Input', 'Textarea', 'Select', 'Checkbox',
  'Hero', 'SectionHeader', 'DarkStrip', 'SiteNav', 'SiteFooter',
  'PriceCard', 'StepCard', 'Accordion', 'Callout', 'Banner', 'Toast',
])

export function StatusTable() {
  const done = 'done' as StatusKey
  const pending = 'pending' as StatusKey

  const rows = [
    // ── Atoms ──────────────────────────────────────────────────────────
    { name: 'Button',           used: 'All',               stories: done, tests: done },
    { name: 'Badge + Tag',      used: 'All',               stories: done, tests: done },
    { name: 'Toggle',           used: 'All',               stories: done, tests: done },
    { name: 'AvailabilityPill', used: 'fhdamd',            stories: done, tests: done },
    { name: 'Text',             used: 'All',               stories: done, tests: done },
    // ── Layout ─────────────────────────────────────────────────────────
    { name: 'Container',        used: 'All',               stories: done, tests: done },
    { name: 'Stack',            used: 'All',               stories: done, tests: done },
    { name: 'Cluster',          used: 'All',               stories: done, tests: done },
    { name: 'Grid / AutoGrid',  used: 'All',               stories: done, tests: done },
    { name: 'Section',          used: 'All',               stories: done, tests: done },
    { name: 'Divider',          used: 'All',               stories: done, tests: done },
    // ── Navigation ─────────────────────────────────────────────────────
    { name: 'Tabs',             used: 'All',               stories: done, tests: done },
    { name: 'Breadcrumb',       used: 'Riqa',         stories: done, tests: done },
    { name: 'Stepper',          used: 'Riqa, Jamaal', stories: done, tests: done },
    // ── Components ─────────────────────────────────────────────────────
    { name: 'Card',             used: 'All',               stories: done, tests: done },
    { name: 'OpCard',           used: 'Riqa',         stories: done, tests: done },
    { name: 'Accordion',        used: 'Riqa',         stories: done, tests: done },
    { name: 'PriceCard',        used: 'Riqa',         stories: done, tests: done },
    { name: 'Testimonial',      used: 'Riqa',         stories: done, tests: done },
    { name: 'StepCard',         used: 'Riqa',         stories: done, tests: done },
    { name: 'ProjectCard',      used: 'fhdamd',            stories: done, tests: done },
    { name: 'ClientWorkRow',    used: 'fhdamd',            stories: done, tests: done },
    { name: 'EssayRow',         used: 'fhdamd',            stories: done, tests: done },
    { name: 'Progress',         used: 'Riqa, Jamaal', stories: done, tests: done },
    { name: 'DataTable',        used: 'Riqa',         stories: done, tests: done },
    { name: 'SectionHeader',    used: 'All',               stories: done, tests: done },
    { name: 'Hero',             used: 'Riqa, fhdamd', stories: done, tests: done },
    { name: 'DarkStrip',        used: 'Riqa',         stories: done, tests: done },
    // ── Feedback ───────────────────────────────────────────────────────
    { name: 'Callout',          used: 'All',               stories: done, tests: done },
    { name: 'Banner',           used: 'All',               stories: done, tests: done },
    { name: 'Toast',            used: 'Riqa',         stories: done, tests: done },
    // ── Forms ──────────────────────────────────────────────────────────
    { name: 'Input',            used: 'Riqa, fhdamd', stories: done, tests: done },
    { name: 'Textarea',         used: 'Riqa, fhdamd', stories: done, tests: done },
    { name: 'Select',           used: 'Riqa',         stories: done, tests: done },
    { name: 'Checkbox',         used: 'All',               stories: done, tests: done },
    { name: 'Radio',            used: 'All',               stories: done, tests: done },
    { name: 'FileDropzone',     used: 'Riqa',         stories: done, tests: done },
    // ── Overlays ───────────────────────────────────────────────────────
    { name: 'Dialog',           used: 'All',               stories: done, tests: done },
    { name: 'Tooltip',          used: 'All',               stories: done, tests: done },
    // ── Site chrome ────────────────────────────────────────────────────
    { name: 'SiteNav',          used: 'Riqa',         stories: done, tests: done },
    { name: 'SiteFooter',       used: 'Riqa',         stories: done, tests: done },
    // ── Jamaal-specific (pending) ───────────────────────────────────────
    { name: 'Task row',         used: 'Jamaal',            stories: pending, tests: pending },
    { name: 'Habit row',        used: 'Jamaal',            stories: pending, tests: pending },
    { name: 'Setting row',      used: 'Jamaal',            stories: pending, tests: pending },
    { name: 'SparklineCard',    used: 'Jamaal',            stories: pending, tests: pending },
    { name: 'HeatmapCell',      used: 'Jamaal',            stories: pending, tests: pending },
    { name: 'Mobile tab bar',   used: 'Jamaal',            stories: pending, tests: pending },
  ]

  const th: CSSProperties = {
    fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)',
    textTransform: 'uppercase', color: 'var(--th-ink-3)', padding: '10px 16px',
    textAlign: 'start', borderBottom: '1px solid var(--th-line)', fontWeight: 500,
  }
  const td: CSSProperties = {
    padding: '10px 16px', color: 'var(--th-ink-2)',
    borderBottom: '1px solid var(--th-line-subtle)', fontSize: 'var(--th-body-size)',
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--th-body-size)', marginBottom: '48px' }}>
      <thead>
        <tr>
          <th style={th}>Component</th>
          <th style={th}>Used by</th>
          <th style={th}>Stories</th>
          <th style={th}>Tests</th>
          <th style={th}>Threads 2.0</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.name}>
            <td style={{ ...td, fontWeight: 600, color: 'var(--th-ink)' }}>{row.name}</td>
            <td style={{ ...td, fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', color: 'var(--th-ink-3)' }}>{row.used}</td>
            <td style={td}><StatusBadge status={row.stories} /></td>
            <td style={td}><StatusBadge status={row.tests} /></td>
            <td style={td}><StatusBadge status={row.stories === pending ? pending : migratedToV2.has(row.name) ? done : pending} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
