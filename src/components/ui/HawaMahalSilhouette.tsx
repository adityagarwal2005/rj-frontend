import type { SVGProps } from 'react'

/**
 * Line-art silhouette of Hawa Mahal (Jaipur's "Palace of Winds") - a
 * stepped, five-tier facade honeycombed with small jharokha windows and
 * capped with chattri domes. Used as a background watermark (see
 * HomePage). Each tier is a single solid-fill path with the windows cut
 * out as real holes (fillRule="evenodd") rather than drawn on top with a
 * blend mode, so the honeycomb silhouette stays crisp and correctly
 * inherits whatever color/opacity is set on the wrapping <svg>, no matter
 * how low.
 */

interface Tier {
  x: number
  y: number
  width: number
  height: number
  cols: number
}

const TIERS: Tier[] = [
  { x: 410, y: 70, width: 180, height: 60, cols: 4 },
  { x: 320, y: 125, width: 360, height: 62, cols: 8 },
  { x: 210, y: 182, width: 580, height: 66, cols: 13 },
  { x: 100, y: 243, width: 800, height: 70, cols: 18 },
  { x: 20, y: 308, width: 960, height: 78, cols: 22 },
]

const CHATRIS = [
  { cx: 500, r: 16 },
  { cx: 340, r: 12 },
  { cx: 660, r: 12 },
  { cx: 210, r: 10 },
  { cx: 790, r: 10 },
]

function tierPath(tier: Tier): string {
  const { x, y, width, height, cols } = tier
  const archR = 14
  let d = `M ${x} ${y + height} L ${x} ${y + archR} A ${archR} ${archR} 0 0 1 ${x + archR} ${y} L ${x + width - archR} ${y} A ${archR} ${archR} 0 0 1 ${x + width} ${y + archR} L ${x + width} ${y + height} Z`

  const cellWidth = width / cols
  const margin = cellWidth * 0.16
  const winWidth = cellWidth - margin * 2
  const winR = winWidth / 2
  const winTop = y + height * 0.2
  const winBottom = y + height * 0.85

  for (let i = 0; i < cols; i++) {
    const wx = x + i * cellWidth + margin
    d += ` M ${wx} ${winBottom} L ${wx} ${winTop + winR} A ${winR} ${winR} 0 0 1 ${wx + winR} ${winTop} A ${winR} ${winR} 0 0 1 ${wx + winWidth} ${winTop + winR} L ${wx + winWidth} ${winBottom} Z`
  }

  return d
}

export function HawaMahalSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1000 400" fill="currentColor" {...props}>
      {CHATRIS.map(({ cx, r }) => (
        <g key={cx}>
          <rect x={cx - r * 0.7} y={52 - r * 0.5} width={r * 1.4} height={r * 0.7} rx={1} />
          <circle cx={cx} cy={52 - r * 0.5} r={r * 0.7} />
          <rect x={cx - 1.2} y={52 - r * 1.5} width={2.4} height={r * 0.7} />
        </g>
      ))}
      {TIERS.map((tier) => (
        <path key={tier.y} d={tierPath(tier)} fillRule="evenodd" />
      ))}
      <rect x={0} y={378} width={1000} height={22} />
    </svg>
  )
}
