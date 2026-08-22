import type { SVGProps } from 'react'

/**
 * Small centered lotus/kalash flourish - three cusps rising off a
 * horizontal baseline with a diamond keystone. Used as a compact
 * heading ornament (above section headlines) where PaisleyDivider would
 * be too wide.
 */
export function LotusOrnament(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="26" x2="30" y2="26" opacity="0.55" />
      <line x1="50" y1="26" x2="76" y2="26" opacity="0.55" />
      <path d="M40 26 C 34 22 32 14 40 6 C 48 14 46 22 40 26 Z" />
      <path d="M40 26 C 46 24 52 20 56 14" opacity="0.7" />
      <path d="M40 26 C 34 24 28 20 24 14" opacity="0.7" />
      <g fill="currentColor" stroke="none">
        <rect x="38" y="4" width="4" height="4" transform="rotate(45 40 6)" />
      </g>
    </svg>
  )
}
