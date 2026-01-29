import './button.css'

export type ButtonProps = {
  type: 'button' | 'linkButton' | 'submit'
  text: string
  url?: string
  kind?: 'primary' | 'secondary' | 'tertiary'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button({ type, text, url, kind = 'primary', onClick }: ButtonProps) {
  const className = `btn ${kind}`

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
