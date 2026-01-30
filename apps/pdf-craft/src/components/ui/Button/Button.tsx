import './button.css'

export type ButtonProps = {
  type: 'button' | 'linkButton' | 'submit'
  text: string
  url?: string
  kind?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button({ type, text, url, kind = 'primary', size = 'md', onClick }: ButtonProps) {
  const className = `btn ${kind} ${size}`

  return type === 'linkButton' ? (
    <a href={url} className={className}>
      {text}
    </a>
  ) : (
    <button type={type} className={className} onClick={onClick}>
      {text}
    </button>
  )
}
