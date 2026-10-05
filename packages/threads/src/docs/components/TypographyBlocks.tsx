import type { CSSProperties, ReactNode } from 'react'

export function TypeRow({ token, px, children, sampleStyle }: { token: string; px: string; children: ReactNode; sampleStyle?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', paddingBlock: '14px', borderBottom: '1px solid var(--th-line-subtle)' }}>
      <div style={{ minWidth: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontWeight: 500, fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase', color: 'var(--th-ink-3)' }}>{token}</span>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', color: 'var(--th-ink-3)' }}>{px}</span>
      </div>
      <div style={Object.assign({ flex: 1, lineHeight: 1.2 }, sampleStyle)}>{children}</div>
    </div>
  )
}

export function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: 'var(--th-card)', border: '1px solid var(--th-line)', borderRadius: 'var(--th-radius-card)', padding: '16px 20px', flex: 1, minWidth: '220px' }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--th-body-size)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: 'var(--th-body-size)', lineHeight: 1.55, color: 'var(--th-ink-2)' }}>{body}</div>
    </div>
  )
}
