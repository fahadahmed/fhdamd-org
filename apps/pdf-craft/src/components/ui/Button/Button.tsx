import './button.css'

export type ButtonProps = {
  type: 'button' | 'linkButton' | 'submit'
  text: string
  disabled?: boolean
  url?: string
  kind?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export default function Button({ type, text, url, kind = 'primary', size = 'md', onClick, icon, iconPosition = 'left', disabled = false }: ButtonProps) {
  const className = `btn ${kind} ${size}`

  const content = (
    <span className="btn-content">
      {icon && iconPosition === 'left' && (
        <span className="btn-icon">{icon}</span>
      )}

      <span className="btn-text">{text}</span>

      {icon && iconPosition === 'right' && (
        <span className="btn-icon">{icon}</span>
      )}
    </span>
  );

  return type === 'linkButton' ? (
    <a href={url} className={className}>
      {content}
    </a>
  ) : (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  )
}
