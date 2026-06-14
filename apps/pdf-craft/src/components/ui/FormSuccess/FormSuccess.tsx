interface Props {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export default function FormSuccess({ title, children, action }: Props) {
  return (
    <div style={{
      background: 'var(--th-color-sage-subtle)',
      borderRadius: 'var(--th-radius-lg)',
      padding: 'var(--th-space-8) var(--th-space-6)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--th-font-display)',
        fontSize: 'var(--th-text-lg)',
        fontVariationSettings: '"wdth" 92, "wght" 650',
        color: 'var(--th-color-sage-text)',
        marginBlockEnd: 'var(--th-space-2)',
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: 'var(--th-font-display)',
        fontSize: 'var(--th-text-base)',
        color: 'var(--th-color-text-2)',
        marginBlockEnd: action ? 'var(--th-space-6)' : '0',
      }}>
        {children}
      </p>
      {action}
    </div>
  )
}
