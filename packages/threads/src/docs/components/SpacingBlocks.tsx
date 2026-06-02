export function SpaceRow({ token, px, note }: { token: string; px: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBlock: '6px' }}>
      <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--th-color-text-3)', minWidth: '112px', textAlign: 'right', flexShrink: 0 }}>
        {token}
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--th-color-accent-subtle)', borderLeft: '3px solid var(--th-color-accent)', height: '28px', width: `var(${token})`, borderRadius: '0 4px 4px 0', minWidth: '3px', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', color: 'var(--th-color-text-4)', flexShrink: 0 }}>{px}</span>
        {note && <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.625rem', color: 'var(--th-color-text-4)' }}>— {note}</span>}
      </div>
    </div>
  )
}

export function RadiusSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '72px', height: '72px', background: 'var(--th-color-surface-2)', border: '1px solid var(--th-color-border-default)', borderRadius: `var(${token})` }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--th-color-text-3)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.5rem', color: 'var(--th-color-text-4)', marginTop: '2px' }}>{token}</div>
      </div>
    </div>
  )
}

export function ShadowSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '80px', height: '56px', background: 'var(--th-color-surface-1)', borderRadius: '14px', boxShadow: `var(${token})` }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--th-color-text-3)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--th-font-mono)', fontSize: '0.5rem', color: 'var(--th-color-text-4)', marginTop: '2px' }}>{token}</div>
      </div>
    </div>
  )
}
