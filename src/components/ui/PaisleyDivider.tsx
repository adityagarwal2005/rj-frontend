import type { SVGProps } from 'react'

/**
 * Slim horizontal ornament used between story sections - two gold hairlines
 * meeting a central paisley/buta with small diamond pips. Purely
 * decorative; consumers pass width/color via SVG props.
 */
export function PaisleyDivider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="0" y1="20" x2="120" y2="20" opacity="0.55" />
      <line x1="200" y1="20" x2="320" y2="20" opacity="0.55" />
      <g transform="translate(160 20)">
        <path
          d="M0 -14 C 8 -12 14 -6 14 2 C 14 10 6 14 -1 12 C -8 10 -12 4 -10 -4 C -8 -12 -2 -14 0 -14 Z"
          strokeWidth="1.2"
        />
        <path d="M-3 4 C 0 2 4 -2 4 -6" strokeWidth="0.9" opacity="0.85" />
        <circle cx="0" cy="-4" r="1.4" fill="currentColor" stroke="none" />
      </g>
      <g fill="currentColor" stroke="none">
        <rect x="118" y="18" width="4" height="4" transform="rotate(45 120 20)" />
        <rect x="198" y="18" width="4" height="4" transform="rotate(45 200 20)" />
      </g>
    </svg>
  )
}
