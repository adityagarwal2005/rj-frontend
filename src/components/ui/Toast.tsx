import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToast, type ToastVariant } from '@/context/ToastContext'
import { cn } from '@/utils/cn'

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  error: { icon: XCircle, classes: 'bg-red-50 text-red-900 border-red-200' },
  info: { icon: Info, classes: 'bg-chocolate-950 text-cream-50 border-chocolate-900' },
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, classes } = VARIANT_STYLES[toast.variant]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-luxury',
                classes,
              )}
            >
              <Icon size={18} className="shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
