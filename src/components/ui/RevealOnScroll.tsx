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
 * it's visible by default and only animates once via `viewport.once`.
 */
export function RevealOnScroll({ children, delay = 0, className, y = 24 }: RevealOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
