import type { SVGProps } from 'react'

/**
 * Stylized silhouette of Hawa Mahal (Jaipur's "Palace of Winds") - the
 * stepped, honeycomb-windowed facade rendered as a few tiers of scalloped
 * arches topped with small chatri domes. Meant purely as a very low-opacity
 * background watermark (see HomePage), not a literal architectural drawing.
 */
function scallopedTier(x: number, yTop: number, width: number, height: number, bumps: number): string {
  const bumpWidth = width / bumps
  const r = bumpWidth / 2
  let d = `M ${x} ${yTop + height} L ${x} ${yTop + r}`
  for (let i = 0; i < bumps; i++) {
    const cx = x + i * bumpWidth + r
    d += ` A ${r} ${r} 0 0 1 ${cx + r} ${yTop + r}`
  }
  d += ` L ${x + width} ${yTop + height} Z`
  return d
}

const TIERS = [
  { x: 430, y: 40, width: 140, height: 55, bumps: 3 },
  { x: 340, y: 90, width: 320, height: 55, bumps: 7 },
  { x: 230, y: 140, width: 540, height: 60, bumps: 11 },
  { x: 120, y: 195, width: 760, height: 65, bumps: 15 },
  { x: 30, y: 255, width: 940, height: 75, bumps: 19 },
]

const CHATRIS = [130, 260, 390, 500, 610, 740, 870]

export function HawaMahalSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1000 340" fill="currentColor" {...props}>
      {CHATRIS.map((cx) => (
        <g key={cx}>
          <rect x={cx - 9} y={22} width={18} height={10} rx={1} />
          <circle cx={cx} cy={16} r={10} />
          <rect x={cx - 1.5} y={2} width={3} height={8} />
        </g>
      ))}
      {TIERS.map((tier) => (
        <path key={tier.y} d={scallopedTier(tier.x, tier.y, tier.width, tier.height, tier.bumps)} />
      ))}
      <rect x={0} y={325} width={1000} height={15} />
    </svg>
  )
}
