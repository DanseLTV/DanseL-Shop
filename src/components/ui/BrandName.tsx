interface BrandNameProps {
  className?: string
}

/** Site wordmark — full gold gradient, consistent across all pages. */
export function BrandName({ className = '' }: BrandNameProps) {
  return (
    <span className={`text-royal-gold ${className}`.trim()}>
      DANSEL SHOP
    </span>
  )
}
