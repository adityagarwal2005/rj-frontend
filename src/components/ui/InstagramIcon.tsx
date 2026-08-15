import type { SVGProps } from 'react'

interface InstagramIconProps extends SVGProps<SVGSVGElement> {
  /** Mirrors Lucide's `size` prop (maps to width/height) so this drops in wherever a Lucide icon is expected. */
  size?: number | string
}

/**
 * Lucide dropped brand/logo icons (trademark reasons), so this is a
 * hand-drawn Instagram glyph matched to Lucide's outline style (rounded
 * square + circle + viewfinder dot) - see TurbanIcon for the same approach.
 */
export function InstagramIcon({ size, ...props }: InstagramIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
