import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * A hair-thin gold bar under the header showing how far down the page you
 * are. Driven by framer-motion's scroll value and applied as scaleX only,
 * so it never reads layout on scroll - the mistake that made the old
 * decorative animations expensive on a phone.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="scroll-progress pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[2px]"
    />
  )
}
