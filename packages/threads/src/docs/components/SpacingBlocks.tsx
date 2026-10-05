const caption = { fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', color: 'var(--th-ink-3)' } as const

export function SpaceRow({ token, px, note }: { token: string; px: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBlock: '6px' }}>
      <span style={{ ...caption, letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase', minWidth: '168px', textAlign: 'end', flexShrink: 0 }}>
        {token}
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--th-color-accent-subtle)', borderInlineStart: '3px solid var(--th-terra)', height: '28px', width: `var(${token})`, borderRadius: '0 var(--th-radius-cell) var(--th-radius-cell) 0', minWidth: '3px', flexShrink: 0 }} />
        <span style={{ ...caption, flexShrink: 0 }}>{px}</span>
        {note && <span style={caption}>— {note}</span>}
      </div>
    </div>
  )
}

export function RadiusSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '72px', height: '72px', background: 'var(--th-sidebar)', border: '1px solid var(--th-line)', borderRadius: `var(${token})` }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...caption, letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ ...caption, marginTop: '2px' }}>{token}</div>
      </div>
    </div>
  )
}

export function ShadowSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '96px', height: '64px', background: 'var(--th-card)', border: '1px solid var(--th-line-subtle)', borderRadius: 'var(--th-radius-card)', boxShadow: `var(${token})` }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...caption, letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ ...caption, marginTop: '2px' }}>{token}</div>
      </div>
    </div>
  )
}
