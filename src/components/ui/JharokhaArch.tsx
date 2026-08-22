import type { SVGProps } from 'react'

/**
 * Jharokha - the ogee/multifoil arch you see on Rajasthani palace
 * balconies and doorways. Drawn as an outlined frame with a subtle
 * secondary inner arch; used as a decorative border behind hero product
 * shots and around the About page's story quote.
 */
export function JharokhaArch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 320"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Outer arch frame - ogee cusped shape narrowing to a peak */}
      <path d="M20 315 L20 150 C 20 105 42 70 78 55 C 100 45 108 30 120 12 C 132 30 140 45 162 55 C 198 70 220 105 220 150 L220 315" />
      {/* Inner arch, slightly inset, hints at layered stonework */}
      <path
        d="M40 315 L40 156 C 40 118 58 90 88 78 C 106 71 112 60 120 46 C 128 60 134 71 152 78 C 182 90 200 118 200 156 L200 315"
        opacity="0.55"
      />
      {/* Keystone diamond */}
      <g fill="currentColor" stroke="none" opacity="0.85">
        <rect x="116" y="10" width="8" height="8" transform="rotate(45 120 14)" />
      </g>
      {/* Corner ornament pips */}
      <g fill="currentColor" stroke="none" opacity="0.7">
        <circle cx="26" cy="150" r="2" />
        <circle cx="214" cy="150" r="2" />
      </g>
    </svg>
  )
}
