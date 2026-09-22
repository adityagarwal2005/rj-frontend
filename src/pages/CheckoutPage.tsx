import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  Check,
  Gift,
  Lock,
  Mail,
  MessageCircle,
  Package,
  Plus,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { ApiError } from '@/services/apiError'
import type { Address, Order } from '@/types/order'
import type { ManualPaymentDetails } from '@/types/payment'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { buildBulkEnquiryMailtoUrl, buildBulkEnquiryWhatsAppUrl, buildWhatsAppOrderUrl } from '@/utils/whatsappIntent'
import { BULK_ORDER_THRESHOLD, isBulkOrder } from '@/utils/bulkOrder'
import { COD_FEE } from '@/utils/paymentFees'
import { loadRazorpayCheckoutScript, openRazorpayCheckout } from '@/utils/razorpayCheckout'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/utils/cn'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button, buttonClasses } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { AddressForm } from '@/components/checkout/AddressForm'
import { PriceBreakdown } from '@/components/orders/PriceBreakdown'
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'

type CheckoutMethod = 'upi' | 'cod' | 'whatsapp'

function StepTitle({ step, children }: { step: number; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/60 text-xs font-semibold tabular-nums text-gold-700">
        {step}
      </span>
      <h2 className="font-display text-[26px] leading-none text-chocolate-950">{children}</h2>
    </div>
  )
}

interface MethodCardProps {
  selected: boolean
  onSelect: () => void
  icon: LucideIcon
  title: string
  description: string
  tag?: string
}

function MethodCard({ selected, onSelect, icon: Icon, title, description, tag }: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-col items-start gap-2 rounded-[18px] border bg-white p-5 text-left transition-all duration-300',
        selected
          ? 'border-gold-500 shadow-[0_0_0_3px_rgba(198,161,91,0.2)]'
          : 'border-beige-300 hover:border-gold-400/70',
      )}
    >
      {tag && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-chocolate-950 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gold-300">
          {tag}
        </span>
      )}
      <span className="flex w-full items-center justify-between">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
            selected ? 'bg-chocolate-950 text-gold-300' : 'bg-cream-100 text-gold-700',
          )}
        >
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-gold-500 bg-gold-500 text-chocolate-950' : 'border-beige-300',
          )}
          aria-hidden="true"
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      </span>
      <span className="mt-1.5 font-display text-[21px] leading-tight text-chocolate-950">{title}</span>
      <span className="text-xs leading-relaxed text-ink-900/55">{description}</span>
    </button>
  )
}

export function CheckoutPage() {
  useDocumentTitle('Checkout', { noindex: true })
  const { cart, refresh: refreshCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [method, setMethod] = useState<CheckoutMethod | null>(null)
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<ManualPaymentDetails | null>(null)
  const [notes, setNotes] = useState('')
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const hasPlacedOrderRef = useRef(false)

  useEffect(() => {
    orderService
      .listAddresses()
      .then((data) => {
        setAddresses(data.results)
        const defaultAddress = data.results.find((address) => address.is_default) ?? data.results[0]
        if (defaultAddress) setSelectedAddressId(defaultAddress.id)
      })
      .catch(() => setAddresses([]))
    paymentService.getManualPaymentDetails().then(setPaymentDetails).catch(() => setPaymentDetails(null))
  }, [])

  useEffect(() => {
    if (cart && cart.items.length === 0 && !hasPlacedOrderRef.current) {
      navigate(ROUTES.cart, { replace: true })
    }
  }, [cart, navigate])

  // Preload Razorpay's script as soon as online payment is chosen, so the
  // payment sheet opens instantly on "Pay Now" instead of after a download.
  useEffect(() => {
    if (method === 'upi' && paymentDetails?.razorpay_enabled) void loadRazorpayCheckoutScript()
  }, [method, paymentDetails?.razorpay_enabled])

  function handleAddressCreated(address: Address) {
    setAddresses((current) => [...(current ?? []), address])
    setSelectedAddressId(address.id)
    setIsAddingAddress(false)
  }

  /**
   * Creating an order empties the cart and reserves its stock, so if the
   * step right after that fails (the payment record can't be created, the
   * payment widget won't load), the order has to be released again. Without
   * this the customer was left with an empty cart - retrying said "Your
   * cart is empty" - while an unpaid order sat on their stock for 48 hours.
   */
  async function releaseOrder(orderId: string) {
    try {
      await orderService.abandonOrder(orderId)
    } catch {
      // Nothing more to do here; the stale-order cleanup will still release it.
    }
    await refreshCart()
  }

  async function handlePlaceOrder(gateway: 'pay-online' | 'cod') {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address.', 'error')
      return
    }
    setIsPlacingOrder(true)
    try {
      const useRazorpay = gateway === 'pay-online' && Boolean(paymentDetails?.razorpay_enabled)

      // Load the payment widget before the order exists, not after: a slow
      // or blocked script used to fail only once the cart had already been
      // turned into an order.
      if (useRazorpay && !(await loadRazorpayCheckoutScript())) {
        showToast('Could not load the payment widget. Please check your connection and try again.', 'error')
        return
      }

      const order = await orderService.createOrder({
        address_id: selectedAddressId,
        notes,
        is_gift: isGift,
        gift_message: isGift ? giftMessage : '',
      })

      if (useRazorpay) {
        await payWithRazorpay(order)
        return
      }

      // Cash on delivery, or the manual UPI fallback when Razorpay isn't
      // configured. The payment record is what tells the backend how this
      // order will be paid - a COD order without one would be mistaken for
      // an abandoned online payment - so a failure here undoes the order.
      try {
        await paymentService.initiate({ order_id: order.id, gateway: gateway === 'cod' ? 'cod' : 'manual' })
      } catch (error) {
        await releaseOrder(order.id)
        throw error
      }
      hasPlacedOrderRef.current = true
      navigate(ROUTES.orderSuccess(order.id))
      void refreshCart()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not place your order. Please try again.', 'error')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  async function payWithRazorpay(order: Order) {
    let initiated
    try {
      initiated = await paymentService.initiate({ order_id: order.id, gateway: 'razorpay' })
    } catch (error) {
      await releaseOrder(order.id)
      throw error
    }
    const { payment, gateway_data } = initiated

    openRazorpayCheckout({
      key: gateway_data.key_id ?? '',
      amount: Number(gateway_data.amount),
      currency: gateway_data.currency ?? 'INR',
      order_id: gateway_data.razorpay_order_id ?? '',
      name: 'RajwadiTukda',
      description: `Order ${order.id.slice(0, 8)}`,
      theme: { color: '#af8a48' },
      handler: (response) => {
        hasPlacedOrderRef.current = true
        paymentService
          .confirmWebhookWithRetry(payment.id, {
            gateway_payment_id: response.razorpay_payment_id,
            gateway_signature: response.razorpay_signature,
          })
          .then(() => showToast('Payment successful!', 'success'))
          .catch(() =>
            showToast("Payment received - we're confirming it. If your order still shows unpaid, message us on WhatsApp.", 'info'),
          )
          .finally(() => {
            navigate(ROUTES.orderSuccess(order.id))
            void refreshCart()
          })
      },
      modal: {
        // Closed the widget without paying (any app, any reason) - rather
        // than leaving behind a permanent "pending" order the customer has
        // to notice and deal with later, give up on it right away and put
        // the items straight back in their cart so trying again costs
        // nothing. See services.abandon_pending_order on the backend.
        ondismiss: () => {
          orderService
            .abandonOrder(order.id)
            .then(() => showToast("Payment wasn't completed - your items are back in your cart.", 'info'))
            .catch(() => showToast("Payment wasn't completed.", 'info'))
            .finally(() => {
              void refreshCart()
              navigate(ROUTES.cart)
            })
        },
      },
    })
  }

  async function handleContinueOnWhatsApp() {
    if (!cart || !paymentDetails) return
    setIsPlacingOrder(true)
    try {
      const order = await orderService.createWhatsAppOrder({ notes })
      const whatsappUrl = buildWhatsAppOrderUrl(
        paymentDetails.whatsapp_number,
        order.id,
        cart.items,
        cart.total_amount,
      )
      hasPlacedOrderRef.current = true
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      navigate(ROUTES.orderSuccess(order.id), { state: { order } })
      void refreshCart()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not start your order.', 'error')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!cart || addresses === null) {
    return <BrandLoader label="Preparing checkout" />
  }

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const bulk = isBulkOrder(totalQuantity)
  const bulkWhatsAppUrl = paymentDetails ? buildBulkEnquiryWhatsAppUrl(paymentDetails.whatsapp_number, cart.items) : ''
  const bulkMailtoUrl = buildBulkEnquiryMailtoUrl('adityakp215@gmail.com', cart.items)
  const needsAddress = method === 'upi' || method === 'cod'

  return (
    <Container className="pb-16 pt-10 sm:pt-14 lg:pb-24">
      <PageHeader eyebrow="Almost There" title="Checkout" />

      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          {bulk ? (
            <Card>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chocolate-950 text-gold-300">
                  <Package size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="font-display text-[26px] leading-tight text-chocolate-950">This looks like a bulk order</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/65">
                    For orders of {BULK_ORDER_THRESHOLD}+ units, we handle pricing and delivery directly so you get
                    the best rate. Message us with your order on WhatsApp or email and we'll get back to you
                    quickly.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={bulkWhatsAppUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses('gold', 'md', 'flex-1')}
                  aria-disabled={!bulkWhatsAppUrl}
                >
                  <MessageCircle size={18} /> WhatsApp Us
                </a>
                <a href={bulkMailtoUrl} className={buttonClasses('outline', 'md', 'flex-1')}>
                  <Mail size={18} /> Email Us
                </a>
              </div>
            </Card>
          ) : (
            <Card>
              <StepTitle step={1}>How would you like to check out?</StepTitle>
              <div className="grid gap-4 pt-1 sm:grid-cols-3">
                <MethodCard
                  selected={method === 'upi'}
                  onSelect={() => setMethod('upi')}
                  icon={Smartphone}
                  tag="Fastest"
                  title="Pay Online"
                  description={
                    paymentDetails?.razorpay_enabled
                      ? 'UPI, card or wallet - secured by Razorpay.'
                      : 'Pay instantly with any UPI app.'
                  }
                />
                <MethodCard
                  selected={method === 'cod'}
                  onSelect={() => setMethod('cod')}
                  icon={Banknote}
                  title="Cash on Delivery"
                  description={`Pay when it arrives - adds a ${formatCurrency(COD_FEE)} handling fee.`}
                />
                <MethodCard
                  selected={method === 'whatsapp'}
                  onSelect={() => setMethod('whatsapp')}
                  icon={MessageCircle}
                  title="Order on WhatsApp"
                  description="Share your address and pay with us directly on chat."
                />
              </div>
            </Card>
          )}

          {!bulk && needsAddress && (
            <Card>
              <StepTitle step={2}>Delivery address</StepTitle>

              {addresses.length > 0 && !isAddingAddress && (
                <div className="flex flex-col gap-3">
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id
                    return (
                      <label
                        key={address.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-[16px] border p-4 text-sm transition-all duration-300',
                          isSelected
                            ? 'border-gold-500 bg-gold-400/[0.06] shadow-[0_0_0_3px_rgba(198,161,91,0.14)]'
                            : 'border-beige-300 hover:border-gold-400/70',
                        )}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1 accent-gold-500"
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-chocolate-950">
                            {address.full_name} &middot; {address.phone}
                          </span>
                          <span className="mt-0.5 block leading-relaxed text-ink-900/60">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}, {address.city}, {address.state} {address.postal_code}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {isAddingAddress ? (
                <div className={addresses.length > 0 ? 'mt-4' : undefined}>
                  <AddressForm onSaved={handleAddressCreated} onCancel={() => setIsAddingAddress(false)} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-700 hover:text-chocolate-950"
                >
                  <Plus size={15} /> Add a new address
                </button>
              )}
            </Card>
          )}

          {!bulk && needsAddress && (
            <Card>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(event) => setIsGift(event.target.checked)}
                  className="mt-1.5 accent-gold-500"
                />
                <span>
                  <span className="flex items-center gap-2 font-display text-[22px] leading-tight text-chocolate-950">
                    <Gift size={18} className="text-gold-600" /> This is a gift
                  </span>
                  <span className="mt-1 block text-xs text-ink-900/55">
                    We'll leave the price out of the package and include your message instead.
                  </span>
                </span>
              </label>
              {isGift && (
                <div className="mt-5">
                  <TextArea
                    label="Gift message (optional)"
                    value={giftMessage}
                    onChange={(event) => setGiftMessage(event.target.value)}
                    placeholder="E.g. Happy birthday! Hope you love this."
                    maxLength={500}
                  />
                </div>
              )}
            </Card>
          )}

          {!bulk && method === 'whatsapp' && (
            <Card>
              <StepTitle step={2}>Continue on WhatsApp</StepTitle>
              <p className="text-sm leading-relaxed text-ink-900/65">
                We'll open a WhatsApp chat with your order pre-filled. Just reply with your name, phone number,
                and delivery address (Jaipur only) - we'll confirm your order and share payment details right
                there.
              </p>
            </Card>
          )}

          {!bulk && method && (
            <Card>
              <TextArea
                label="Order notes (optional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                placeholder="E.g. leave at the gate, ring the bell twice..."
                maxLength={500}
              />
            </Card>
          )}
        </div>

        <aside className="h-fit min-w-0 lg:sticky lg:top-28">
          <Card>
            <h2 className="font-display text-[28px] leading-none text-chocolate-950">Order Summary</h2>
            <ul className="mt-5 flex flex-col gap-3.5">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span className="relative h-14 w-14 shrink-0">
                    <span className="block h-full w-full overflow-hidden rounded-xl bg-beige-200">
                      {item.product_image ? (
                        <img src={item.product_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ProductImagePlaceholder />
                      )}
                    </span>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-chocolate-950 px-1 text-[10px] font-semibold tabular-nums text-cream-50">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-chocolate-950">{item.product_name}</span>
                  <span className="shrink-0 tabular-nums text-chocolate-950">{formatCurrency(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-beige-200 pt-5">
              <PriceBreakdown
                subtotalAmount={cart.subtotal_amount}
                discountPercentage={cart.discount_percentage}
                discountAmount={cart.discount_amount}
                referralDiscountAmount={cart.referral_discount_amount}
                codFeeAmount={method === 'cod' ? COD_FEE : undefined}
                totalAmount={cart.total_amount}
              />
            </div>

            {!bulk && (
              <div className="mt-5">
                <DeliveryEstimate />
              </div>
            )}

            {bulk ? (
              <p className="mt-6 text-center text-xs text-ink-900/50">Use WhatsApp or Email to get bulk pricing.</p>
            ) : method === 'whatsapp' ? (
              <Button
                variant="gold"
                size="lg"
                className="mt-6 w-full"
                isLoading={isPlacingOrder}
                disabled={!paymentDetails}
                onClick={handleContinueOnWhatsApp}
              >
                <MessageCircle size={18} /> Continue on WhatsApp
              </Button>
            ) : method === 'upi' ? (
              <Button
                variant="gold"
                size="lg"
                className="mt-6 w-full"
                isLoading={isPlacingOrder}
                disabled={!selectedAddressId}
                onClick={() => handlePlaceOrder('pay-online')}
              >
                <Lock size={16} />
                {paymentDetails?.razorpay_enabled ? `Pay ${formatCurrency(cart.total_amount)}` : 'Place Order'}
              </Button>
            ) : method === 'cod' ? (
              <Button
                variant="gold"
                size="lg"
                className="mt-6 w-full"
                isLoading={isPlacingOrder}
                disabled={!selectedAddressId}
                onClick={() => handlePlaceOrder('cod')}
              >
                <Banknote size={18} /> Place Order
              </Button>
            ) : (
              <p className="mt-6 rounded-xl bg-cream-100 px-4 py-3 text-center text-xs text-ink-900/55">
                Choose how you'd like to check out to continue.
              </p>
            )}

            {!bulk && method && needsAddress && !selectedAddressId && (
              <p className="mt-3 text-center text-xs text-ink-900/50">Add a delivery address to continue.</p>
            )}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-900/45">
              <Lock size={11} /> Payments secured by Razorpay &middot; Jaipur delivery only
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  )
}
