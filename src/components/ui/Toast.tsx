import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToast, type ToastVariant } from '@/context/ToastContext'

const VARIANT_ICONS: Record<ToastVariant, { icon: typeof Info; iconClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-400' },
  error: { icon: XCircle, iconClass: 'text-red-400' },
  info: { icon: Info, iconClass: 'text-gold-400' },
}

/**
 * One consistent dark toast with a colored icon, rather than three
 * differently colored boxes. Sits near the bottom on phones - where it no
 * longer covers the header and cart button, and floats clear of the pinned
 * add-to-cart / checkout bars - and top-center on desktop.
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-auto sm:top-5">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, iconClass } = VARIANT_ICONS[toast.variant]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role={toast.variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-cream-50/10 bg-chocolate-950/95 px-4 py-3 text-cream-50 shadow-luxury-lg"
            >
              <Icon size={18} className={`shrink-0 ${iconClass}`} />
              <p className="flex-1 text-sm leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="-mr-1 shrink-0 rounded-full p-1 text-cream-50/60 transition-colors hover:text-cream-50"
              >
                <X size={15} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
