import type { CSSProperties } from 'react'

type Styles = Record<string, CSSProperties>

export const shared: Styles = {
  page:     { fontFamily: 'var(--th-font-display)', color: 'var(--th-color-text-1)', maxWidth: '960px' },
  eyebrow:  { fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--th-color-text-4)', paddingBottom: '12px', borderBottom: '1px solid var(--th-color-border-default)', marginBottom: '20px' },
  h1:       { fontFamily: 'var(--th-font-serif)', fontWeight: 300, fontSize: '2.125rem', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '12px' },
  lead:     { fontVariationSettings: '"wdth" 90, "wght" 380', fontSize: '1.0625rem', lineHeight: 1.65, color: 'var(--th-color-text-2)', maxWidth: '620px', marginBottom: '36px' },
  rule:     { border: 'none', borderTop: '1px solid var(--th-color-border-default)', margin: '40px 0' } as CSSProperties,
  subLabel: { fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--th-color-text-3)', marginBottom: '12px', display: 'block' },
  note:     { fontVariationSettings: '"wdth" 90, "wght" 380', fontSize: '1.0625rem', lineHeight: 1.65, color: 'var(--th-color-text-2)', padding: '16px 20px', background: 'var(--th-color-surface-2)', borderRadius: '12px', borderLeft: '3px solid var(--th-color-accent)', marginBottom: '32px' },
}
