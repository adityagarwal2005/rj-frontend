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
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'

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
        aria-label={itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Cart'}
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-beige-200/70"
      >
        <ShoppingBag size={21} strokeWidth={1.6} className="text-chocolate-950" />
        {itemCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold tabular-nums text-chocolate-950 ring-2 ring-cream-50">
            {itemCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-20 z-50 max-h-[75vh] overflow-y-auto rounded-[22px] border border-beige-200 bg-cream-50 p-5 shadow-luxury-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-none sm:w-[360px]"
          >
            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <ShoppingBag size={28} strokeWidth={1.4} className="text-gold-500" />
                <p className="mt-3 font-display text-2xl text-chocolate-950">Your cart is empty</p>
                <p className="mt-1 text-sm text-ink-900/55">Something sweet is waiting in the shop.</p>
                <Link to={ROUTES.products} onClick={() => setIsOpen(false)} className={`${buttonClasses('gold', 'sm')} mt-5`}>
                  Browse Chocolates
                </Link>
              </div>
            ) : (
              <>
                <p className="eyebrow text-ink-900/45">
                  Your cart &middot; {itemCount} item{itemCount === 1 ? '' : 's'}
                </p>
                <div className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige-200">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <ProductImagePlaceholder />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-chocolate-950">{item.product_name}</p>
                        <p className="text-xs text-ink-900/50">Qty {item.quantity}</p>
                      </div>
                      <span className="shrink-0 font-medium tabular-nums text-chocolate-950">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-beige-200 pt-4">
                  <PriceBreakdown
                    subtotalAmount={cart.subtotal_amount}
                    discountPercentage={cart.discount_percentage}
                    discountAmount={cart.discount_amount}
                    referralDiscountAmount={cart.referral_discount_amount}
                    totalAmount={cart.total_amount}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link to={ROUTES.cart} onClick={() => setIsOpen(false)} className={buttonClasses('outline', 'sm')}>
                    View Cart
                  </Link>
                  <Link to={ROUTES.checkout} onClick={() => setIsOpen(false)} className={buttonClasses('gold', 'sm')}>
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
