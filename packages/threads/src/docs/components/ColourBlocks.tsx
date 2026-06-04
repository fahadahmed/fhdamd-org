export function ColorSwatch({ token, name, hex, desc }: { token: string; name: string; hex: string; desc?: string }) {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--th-color-border-subtle)' }}>
      <div style={{ height: '64px', background: `var(${token})` }} />
      <div style={{ background: 'var(--th-color-surface-1)', padding: '10px 12px' }}>
        <div style={{ fontVariationSettings: '"wdth" 92, "wght" 550', fontSize: '1.0625rem', color: 'var(--th-color-text-1)', marginBottom: '2px' }}>{name}</div>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', letterSpacing: '0.1em', color: 'var(--th-color-text-3)', display: 'block' }}>{token}</span>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', color: 'var(--th-color-text-4)', display: 'block', marginTop: '2px' }}>
          {hex}{desc ? ` · ${desc}` : ''}
        </span>
      </div>
    </div>
  )
}

export function ColorGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 1fr))', gap: '10px', marginBottom: '32px' }}>
      {children}
    </div>
  )
}

export function PrimRamp({ label, swatches }: { label: string; swatches: [string, string][] }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--th-color-text-3)', marginBottom: '8px', display: 'block' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {swatches.map(([bg, tip]) => (
          <div key={tip} title={tip} style={{ flex: 1, height: '36px', borderRadius: '4px', background: bg }} />
        ))}
      </div>
    </div>
  )
}

export function BorderTokens() {
  const items = [
    { token: '--th-color-border-subtle',  val: 'rgba(46,44,40,0.08)' },
    { token: '--th-color-border-default', val: 'rgba(46,44,40,0.14)' },
    { token: '--th-color-border-strong',  val: 'rgba(46,44,40,0.24)' },
  ]
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
      {items.map(({ token, val }) => (
        <div key={token} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--th-color-surface-1)', border: '1px solid var(--th-color-border-default)', borderRadius: '10px', padding: '12px 16px', minWidth: '240px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: `3px solid var(${token})`, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', letterSpacing: '0.1em', color: 'var(--th-color-text-3)' }}>{token}</div>
            <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', color: 'var(--th-color-text-4)', marginTop: '2px' }}>{val}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
