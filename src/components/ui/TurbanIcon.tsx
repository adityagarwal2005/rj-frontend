import type { SVGProps } from 'react'

/**
 * Stylized Rajasthani safa (turban) mark, hand-drawn to match Lucide's
 * outline style so it sits naturally next to the rest of the icon set.
 * Used as a small brand accent next to the "RajwadiTukda" wordmark.
 */
export function TurbanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 16.5c0-5.5 3.4-9.5 8-9.5s8 4 8 9.5" />
      <path d="M3 16.5h18" />
      <path d="M3 16.5c0 1.7 1.3 2.5 3 2.5h12c1.7 0 3-.8 3-2.5" />
      <path d="M7.5 13.5 9.5 10" />
      <path d="M11 12.5 13 8" />
      <path d="M14.5 13.5 16.5 10" />
      <path d="M15 8c1-2.5 2.8-4 4.5-4-.3 2-1.6 3.7-3.3 4.6" />
      <circle cx="15.7" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
