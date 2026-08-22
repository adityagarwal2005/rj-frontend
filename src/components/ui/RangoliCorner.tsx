import type { SVGProps } from 'react'

/**
 * Quarter-mandala rangoli - a single corner of the concentric floral
 * geometry drawn on Rajasthani thresholds during festivals. Meant to
 * anchor a section corner; consumers rotate it (className="rotate-90"
 * etc.) to fill the other three corners.
 */
export function RangoliCorner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.9}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      {/* Concentric arcs radiating from top-left origin */}
      <path d="M0 20 A 20 20 0 0 1 20 0" opacity="0.9" />
      <path d="M0 40 A 40 40 0 0 1 40 0" opacity="0.7" />
      <path d="M0 60 A 60 60 0 0 1 60 0" opacity="0.5" />
      <path d="M0 80 A 80 80 0 0 1 80 0" opacity="0.35" />

      {/* Radial petals - eight spokes fanning across the quadrant */}
      <g strokeWidth="0.7" opacity="0.75">
        <path d="M0 0 L 44 20 M 0 0 L 40 30 M 0 0 L 30 40 M 0 0 L 20 44" />
      </g>

      {/* Corner blossom - three cusps and a small centre pip */}
      <g strokeWidth="1" opacity="0.9">
        <path d="M8 8 C 14 4 22 4 26 10" />
        <path d="M8 8 C 4 14 4 22 10 26" />
        <path d="M12 12 C 18 10 22 10 26 14" />
      </g>
      <circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
