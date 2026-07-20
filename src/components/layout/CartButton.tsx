import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { buttonClasses } from '@/components/ui/Button'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { PriceBreakdown } from '@/components/orders/PriceBreakdown'

export function CartButton() {
  const { cart, itemCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(containerRef, () => setIsOpen(false))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Cart"
        aria-expanded={isOpen}
        className="relative rounded-full p-2 hover:bg-beige-200"
      >
        <ShoppingBag size={22} className="text-chocolate-950" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-chocolate-950">
            {itemCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-beige-200 bg-cream-50 p-4 shadow-luxury"
          >
            {!cart || cart.items.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-ink-900/60">Your cart is empty.</p>
                <Link
                  to={ROUTES.products}
                  onClick={() => setIsOpen(false)}
                  className={`${buttonClasses('gold', 'sm')} mt-4`}
                >
                  Browse Chocolates
                </Link>
              </div>
            ) : (
              <>
                <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-chocolate-950">
                        {item.product_name} <span className="text-ink-900/50">&times; {item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium text-chocolate-950">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-beige-200 pt-3">
                  <PriceBreakdown
                    subtotalAmount={cart.subtotal_amount}
                    discountPercentage={cart.discount_percentage}
                    discountAmount={cart.discount_amount}
                    totalAmount={cart.total_amount}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={ROUTES.cart}
                    onClick={() => setIsOpen(false)}
                    className={`${buttonClasses('outline', 'sm')} flex-1`}
                  >
                    View Cart
                  </Link>
                  <Link
                    to={ROUTES.checkout}
                    onClick={() => setIsOpen(false)}
                    className={`${buttonClasses('gold', 'sm')} flex-1`}
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
