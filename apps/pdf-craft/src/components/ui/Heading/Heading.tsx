import '../../../styles/typography.css'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingVariant = 'display' | 'page' | 'section' | 'subsection' | 'caption' | 'cta';

type HeadingProps = {
  level?: HeadingLevel,
  variant?: HeadingVariant,
  children: React.ReactNode,
  className?: string,
  style?: React.CSSProperties
}
export default function Heading({
  level = 'h2',
  variant = 'section',
  children,
  className,
  style,
}: HeadingProps) {

  const Component = level;
  const appliedVariant = variant === 'cta' ? 'display' : variant;
  return (
    <Component
      className={`heading heading--${appliedVariant} ${className || ''}`}
      style={style}
    >
      {children}
    </Component>
  )
}