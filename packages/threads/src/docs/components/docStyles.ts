import type { CSSProperties } from 'react'

type Styles = Record<string, CSSProperties>

export const shared: Styles = {
  page:     { fontFamily: 'var(--th-font-sans)', color: 'var(--th-ink)', maxWidth: '960px' },
  eyebrow:  { fontFamily: 'var(--th-font-mono)', fontWeight: 500, fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase', color: 'var(--th-ink-3)', paddingBottom: '12px', borderBottom: '1px solid var(--th-line)', marginBottom: '20px' },
  h1:       { fontFamily: 'var(--th-font-serif)', fontVariationSettings: 'var(--th-serif-axes)', fontWeight: 300, fontSize: '2.125rem', letterSpacing: '-0.02em', lineHeight: 1.08, marginBottom: '12px' },
  lead:     { fontSize: 'var(--th-lede-size)', lineHeight: 'var(--th-lede-leading)', color: 'var(--th-ink-2)', maxWidth: '620px', marginBottom: '36px' },
  rule:     { border: 'none', borderTop: '1px solid var(--th-line)', margin: '40px 0' } as CSSProperties,
  subLabel: { fontFamily: 'var(--th-font-mono)', fontWeight: 500, fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase', color: 'var(--th-ink-3)', marginBottom: '12px', display: 'block' },
  note:     { fontSize: 'var(--th-body-size)', lineHeight: 'var(--th-body-leading)', color: 'var(--th-ink-2)', padding: '16px 20px', background: 'var(--th-sidebar)', borderRadius: 'var(--th-radius-card)', borderInlineStart: '3px solid var(--th-terra)', marginBottom: '32px' },
}
