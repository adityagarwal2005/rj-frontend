import type { SVGProps } from 'react'

/**
 * Single stylized peacock feather - a curved rachis with soft barbs, an
 * almond eye, and a small crescent highlight. Used as a floating
 * decorative accent (rotate + position it via className). Colored with
 * currentColor for the stroke; the eye picks up whatever text color is
 * set on the wrapping element via CSS custom properties inherited from
 * the theme.
 */
export function PeacockFeather(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      {/* Rachis - a gentle S-curve */}
      <path d="M40 195 C 44 150 30 110 40 60 C 48 30 42 15 40 8" strokeWidth="1.2" />

      {/* Barbs - short stroked ticks fanning off the rachis on both sides */}
      <g strokeWidth="0.6" opacity="0.6">
        <path d="M40 180 L 30 176 M 40 165 L 28 160 M 40 150 L 26 144 M 40 135 L 26 128 M 40 120 L 28 112 M 40 105 L 30 96 M 40 90 L 32 80 M 40 75 L 34 65" />
        <path d="M40 180 L 50 176 M 40 165 L 52 160 M 40 150 L 54 144 M 40 135 L 54 128 M 40 120 L 52 112 M 40 105 L 50 96 M 40 90 L 48 80 M 40 75 L 46 65" />
      </g>

      {/* Almond "eye" at the top of the feather */}
      <path d="M40 60 C 22 50 22 22 40 12 C 58 22 58 50 40 60 Z" strokeWidth="1.3" />
      <path d="M40 50 C 30 44 30 26 40 20 C 50 26 50 44 40 50 Z" strokeWidth="0.9" opacity="0.75" />
      <ellipse cx="40" cy="35" rx="4" ry="7" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M38 30 C 40 28 42 28 44 30" strokeWidth="0.7" stroke="var(--color-cream-50)" opacity="0.9" />
    </svg>
  )
}
