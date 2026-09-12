import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}

/**
 * Fades/slides content in the first time it scrolls into view. Used across
 * marketing sections (Home, About) for the gentle, editorial reveal common
 * to premium DTC sites - purely decorative, no effect on content/SEO since
 * it only animates once via `viewport.once`.
 *
 * Kept short and starting early (a small positive margin, so it begins just
 * before the element enters): a slow reveal that waits until content is
 * well inside the viewport leaves blank space on screen during a fast
 * scroll, which reads as lag rather than polish.
 */
export function RevealOnScroll({ children, delay = 0, className, y = 14 }: RevealOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px 80px 0px' }}
      transition={{ duration: 0.5, delay: Math.min(delay, 0.2), ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
