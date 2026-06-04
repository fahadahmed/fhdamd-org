import type { CSSProperties, ReactNode } from 'react'

export function TypeRow({ token, px, children, sampleStyle }: { token: string; px: string; children: ReactNode; sampleStyle?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', paddingBlock: '14px', borderBottom: '1px solid var(--th-color-border-subtle)' }}>
      <div style={{ minWidth: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--th-color-text-3)' }}>{token}</span>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', color: 'var(--th-color-text-4)' }}>{px}</span>
      </div>
      <div style={Object.assign({ flex: 1, lineHeight: 1.2 }, sampleStyle)}>{children}</div>
    </div>
  )
}

export function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: 'var(--th-color-surface-1)', border: '1px solid var(--th-color-border-default)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '220px' }}>
      <div style={{ fontVariationSettings: '"wdth" 92, "wght" 650', fontSize: '1.0625rem', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontVariationSettings: '"wdth" 90, "wght" 380', fontSize: '1.0625rem', lineHeight: 1.55, color: 'var(--th-color-text-2)' }}>{body}</div>
    </div>
  )
}
