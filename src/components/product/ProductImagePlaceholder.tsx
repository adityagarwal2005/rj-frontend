/**
 * Shown wherever a product has no uploaded photo yet. A plain gray box with
 * "No image yet" reads as broken; this reads as an intentional, on-brand
 * placeholder instead - a simple chocolate-square glyph on a soft gradient.
 */
export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-beige-200),var(--color-cream-100))] ${className ?? ''}`}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="opacity-70">
        <rect x="10" y="14" width="52" height="44" rx="6" stroke="var(--color-gold-500)" strokeWidth="1.5" />
        <path d="M10 36h52M36 14v44M23 14v44M49 14v44" stroke="var(--color-gold-500)" strokeWidth="1" strokeOpacity="0.55" />
        <circle cx="36" cy="36" r="3.5" fill="var(--color-gold-500)" fillOpacity="0.6" />
      </svg>
    </div>
  )
}
