import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

/** Re-runs `read` whenever the Storybook theme toolbar flips `data-theme`. */
function useThemeTick(read: () => void) {
  useEffect(() => {
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function useTokenValue(token: string) {
  const [value, setValue] = useState('')
  useThemeTick(() =>
    setValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim()),
  )
  return value
}

export function ColorSwatch({ token, name, desc }: { token: string; name: string; desc?: string }) {
  const value = useTokenValue(token)
  return (
    <div style={{ borderRadius: 'var(--th-radius-card)', overflow: 'hidden', border: '1px solid var(--th-line)' }}>
      <div style={{ height: '64px', background: 'var(--th-app)' }}>
        <div style={{ height: '100%', background: `var(${token})` }} />
      </div>
      <div style={{ background: 'var(--th-card)', padding: '10px 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--th-body-size)', color: 'var(--th-ink)', marginBottom: '2px' }}>{name}</div>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', color: 'var(--th-ink-3)', display: 'block' }}>{token}</span>
        <span style={{ fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', color: 'var(--th-ink-3)', display: 'block', marginTop: '2px' }}>
          {value}{desc ? ` · ${desc}` : ''}
        </span>
      </div>
    </div>
  )
}

export function ColorGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(192px, 1fr))', gap: '10px', marginBottom: '32px' }}>
      {children}
    </div>
  )
}

/** Deprecated 1.x token -> v2 token, for the migration table. */
export function AliasTable({ rows }: { rows: [string, string, string?][] }) {
  const cell = { padding: '8px 12px', borderBottom: '1px solid var(--th-line-subtle)', fontSize: 'var(--th-meta-size)', color: 'var(--th-ink-2)' } as const
  const mono = { ...cell, fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)' } as const
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
      <thead>
        <tr>
          {['1.x (deprecated)', 'v2', 'Note'].map((h) => (
            <th key={h} style={{ ...mono, textAlign: 'start', color: 'var(--th-ink-3)', textTransform: 'uppercase', letterSpacing: 'var(--th-label-tracking)', fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([from, to, note]) => (
          <tr key={from}>
            <td style={mono}>{from}</td>
            <td style={{ ...mono, color: 'var(--th-ink)' }}>{to}</td>
            <td style={cell}>{note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type RGBA = [number, number, number, number]

function resolveColour(token: string): RGBA {
  const el = document.createElement('span')
  el.style.color = `var(${token})`
  document.body.appendChild(el)
  const c = getComputedStyle(el).color
  el.remove()
  const m = c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : [0, 0, 0, 1]
}

function over(fg: RGBA, bg: RGBA): RGBA {
  const a = fg[3]
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1) as RGBA
}

function luminance([r, g, b]: RGBA) {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

function ratio(fgToken: string, bgToken: string) {
  const page = resolveColour('--th-app')
  const bg = over(resolveColour(bgToken), page)
  const fg = over(resolveColour(fgToken), bg)
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}

/** Live contrast ratios for the current theme. Flip the Theme toolbar to check dark. */
export function ContrastTable({ pairs }: { pairs: [string, string, string?][] }) {
  const [rows, setRows] = useState<number[]>([])
  useThemeTick(() => setRows(pairs.map(([fg, bg]) => ratio(fg, bg))))

  const cell = { padding: '8px 12px', borderBottom: '1px solid var(--th-line-subtle)', fontSize: 'var(--th-meta-size)', color: 'var(--th-ink-2)' } as const
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
      <thead>
        <tr>
          {['Text', 'On', 'Ratio', 'Result'].map((h) => (
            <th key={h} style={{ ...cell, textAlign: 'start', fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)', letterSpacing: 'var(--th-label-tracking)', textTransform: 'uppercase', color: 'var(--th-ink-3)', fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pairs.map(([fg, bg, note], i) => {
          const r = rows[i]
          const pass = r === undefined ? undefined : r >= 4.5
          return (
            <tr key={`${fg}-${bg}`}>
              <td style={{ ...cell, fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--th-radius-field)', background: `var(${bg})`, color: `var(${fg})`, border: '1px solid var(--th-line)' }}>{fg}</span>
              </td>
              <td style={{ ...cell, fontFamily: 'var(--th-font-mono)', fontSize: 'var(--th-label-size)' }}>{bg}</td>
              <td style={cell}>{r === undefined ? '' : `${r.toFixed(2)}:1`}</td>
              <td style={{ ...cell, color: pass === false ? 'var(--th-alert)' : 'var(--th-ink-2)', fontWeight: pass === false ? 600 : 400 }}>
                {pass === undefined ? '' : pass ? 'AA' : r >= 3 ? 'Below AA text (large text / UI only)' : 'Fails'}
                {note ? ` · ${note}` : ''}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
