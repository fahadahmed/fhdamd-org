export function RiqaWordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={inverse ? 'brand-wordmark brand-wordmark--inverse' : 'brand-wordmark'}>
      Riqa<em className="brand-wordmark-accent">.</em>
    </span>
  )
}
