import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, Gift, Mail, MessageCircle, Package, Plus, Smartphone } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { ApiError } from '@/services/apiError'
import type { Address } from '@/types/order'
import type { ManualPaymentDetails } from '@/types/payment'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { buildBulkEnquiryMailtoUrl, buildBulkEnquiryWhatsAppUrl, buildWhatsAppOrderUrl } from '@/utils/whatsappIntent'
import { BULK_ORDER_THRESHOLD, isBulkOrder } from '@/utils/bulkOrder'
import { COD_FEE } from '@/utils/paymentFees'
import { loadRazorpayCheckoutScript, openRazorpayCheckout } from '@/utils/razorpayCheckout'
import type { Order } from '@/types/order'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button, buttonClasses } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { Spinner } from '@/components/ui/Spinner'
import { AddressForm } from '@/components/checkout/AddressForm'
import { PriceBreakdown } from '@/components/orders/PriceBreakdown'
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate'
import { cn } from '@/utils/cn'

type CheckoutMethod = 'upi' | 'cod' | 'whatsapp'

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

  function handleAddressCreated(address: Address) {
    setAddresses((current) => [...(current ?? []), address])
    setSelectedAddressId(address.id)
    setIsAddingAddress(false)
  }

  async function handlePlaceOrder(gateway: 'pay-online' | 'cod') {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address.', 'error')
      return
    }
    setIsPlacingOrder(true)
    try {
      const order = await orderService.createOrder({
        address_id: selectedAddressId,
        notes,
        is_gift: isGift,
        gift_message: isGift ? giftMessage : '',
      })

      if (gateway === 'cod') {
        try {
          await paymentService.initiate({ order_id: order.id, gateway: 'cod' })
        } catch {
          // Order already succeeded; a failed payment-record call isn't fatal -
          // the order-success page still shows correct fallback instructions.
        }
        hasPlacedOrderRef.current = true
        navigate(ROUTES.orderSuccess(order.id))
        void refreshCart()
        return
      }

      if (paymentDetails?.razorpay_enabled) {
        // Open the real payment widget right here, before ever calling
        // anything "placed". The order already exists (pending/unpaid) so
        // stock is reserved, same as the COD and WhatsApp paths, but the
        // customer sees the payment step first and a success page only
        // once Razorpay actually confirms.
        await payWithRazorpay(order)
      } else {
        // Razorpay isn't configured (e.g. keys not set) - fall back to the
        // manual UPI/QR flow so checkout still works.
        try {
          await paymentService.initiate({ order_id: order.id, gateway: 'manual' })
        } catch {
          // Order already succeeded; a failed payment-record call isn't fatal.
        }
        hasPlacedOrderRef.current = true
        navigate(ROUTES.orderSuccess(order.id))
        void refreshCart()
      }
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not place your order.', 'error')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  async function payWithRazorpay(order: Order) {
    const scriptLoaded = await loadRazorpayCheckoutScript()
    if (!scriptLoaded) {
      showToast('Could not load the payment widget. Please check your connection and try again.', 'error')
      return
    }
    const { payment, gateway_data } = await paymentService.initiate({ order_id: order.id, gateway: 'razorpay' })
    openRazorpayCheckout({
      key: gateway_data.key_id ?? '',
      amount: Number(gateway_data.amount),
      currency: gateway_data.currency ?? 'INR',
      order_id: gateway_data.razorpay_order_id ?? '',
      name: 'RajwadiTukda',
      description: `Order ${order.id.slice(0, 8)}`,
      theme: { color: '#af8a48' },
      handler: (response) => {
        paymentService
          .confirmWebhook(payment.id, {
            gateway_payment_id: response.razorpay_payment_id,
            gateway_signature: response.razorpay_signature,
          })
          .then(() => {
            hasPlacedOrderRef.current = true
            showToast('Payment successful!', 'success')
            navigate(ROUTES.orderSuccess(order.id))
            void refreshCart()
          })
          .catch(() => {
            hasPlacedOrderRef.current = true
            showToast('Payment received but confirmation failed - contact us on WhatsApp.', 'error')
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const bulk = isBulkOrder(totalQuantity)
  const bulkWhatsAppUrl = paymentDetails ? buildBulkEnquiryWhatsAppUrl(paymentDetails.whatsapp_number, cart.items) : ''
  const bulkMailtoUrl = buildBulkEnquiryMailtoUrl('adityakp215@gmail.com', cart.items)

  return (
    <Container className="py-16 sm:py-20">
      <div className="mb-10 flex flex-col items-start gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Almost There</span>
        <h1 className="font-display text-4xl text-chocolate-950 sm:text-5xl">Checkout</h1>
      </div>

      <div className="grid min-w-0 gap-10 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {bulk ? (
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400/10">
                  <Package size={22} className="text-gold-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-chocolate-950">This looks like a bulk order</h2>
                  <p className="mt-2 text-sm text-ink-900/70">
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
              <h2 className="mb-4 font-serif text-xl text-chocolate-950">How would you like to check out?</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setMethod('whatsapp')}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-colors',
                    method === 'whatsapp'
                      ? 'border-gold-500 bg-gold-400/10'
                      : 'border-beige-300 hover:border-beige-400',
                  )}
                >
                  <MessageCircle size={22} className="text-emerald-600" />
                  <span className="font-medium text-chocolate-950">Continue via WhatsApp</span>
                  <span className="text-xs text-ink-900/60">
                    Chat with us directly - share your address and complete payment there.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-colors',
                    method === 'upi' ? 'border-gold-500 bg-gold-400/10' : 'border-beige-300 hover:border-beige-400',
                  )}
                >
                  <Smartphone size={22} className="text-gold-600" />
                  <span className="font-medium text-chocolate-950">Pay Online</span>
                  <span className="text-xs text-ink-900/60">
                    {paymentDetails?.razorpay_enabled
                      ? 'Enter your delivery address, then pay instantly by UPI, card, or wallet.'
                      : 'Enter your delivery address here, then pay instantly with any UPI app.'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cod')}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-colors',
                    method === 'cod' ? 'border-gold-500 bg-gold-400/10' : 'border-beige-300 hover:border-beige-400',
                  )}
                >
                  <Banknote size={22} className="text-gold-600" />
                  <span className="font-medium text-chocolate-950">Cash on Delivery</span>
                  <span className="text-xs text-ink-900/60">
                    Pay in cash when your order arrives - adds a {formatCurrency(COD_FEE)} handling fee.
                  </span>
                </button>
              </div>
            </Card>
          )}

          {!bulk && (method === 'upi' || method === 'cod') && (
            <Card>
              <h2 className="mb-4 font-serif text-xl text-chocolate-950">Delivery Address</h2>

              {addresses.length > 0 && !isAddingAddress && (
                <div className="flex flex-col gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={cn(
                        'flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-sm transition-colors',
                        selectedAddressId === address.id
                          ? 'border-gold-500 bg-gold-400/10'
                          : 'border-beige-300 hover:border-beige-400',
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium text-chocolate-950">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="accent-gold-500"
                        />
                        {address.full_name} &middot; {address.phone}
                      </span>
                      <span className="pl-6 text-ink-900/70">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}, {address.city}, {address.state}{' '}
                        {address.postal_code}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {isAddingAddress ? (
                <div className="mt-4">
                  <AddressForm onSaved={handleAddressCreated} onCancel={() => setIsAddingAddress(false)} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-gold-600 hover:underline"
                >
                  <Plus size={16} /> Add a new address
                </button>
              )}
            </Card>
          )}

          {!bulk && (method === 'upi' || method === 'cod') && (
            <Card>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(event) => setIsGift(event.target.checked)}
                  className="mt-1 accent-gold-500"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-chocolate-950">
                    <Gift size={18} className="text-gold-600" /> This is a gift
                  </span>
                  <span className="text-xs text-ink-900/60">
                    We'll leave the price out of the package and include your message instead.
                  </span>
                </span>
              </label>
              {isGift && (
                <div className="mt-4">
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
              <h2 className="mb-2 font-serif text-xl text-chocolate-950">Continue via WhatsApp</h2>
              <p className="text-sm text-ink-900/70">
                We'll open a WhatsApp chat with your order pre-filled. Just reply with your name, phone number,
                and delivery address (Jaipur only) - we'll confirm your order and share payment details right
                there.
              </p>
            </Card>
          )}

          {!bulk && method && (
            <Card>
              <h2 className="mb-4 font-serif text-xl text-chocolate-950">Order Notes</h2>
              <TextArea
                label="Anything we should know? (optional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                placeholder="E.g. leave at the gate, ring the bell twice..."
                maxLength={500}
              />
            </Card>
          )}
        </div>

        <Card className="h-fit min-w-0">
          <h2 className="font-serif text-xl text-chocolate-950">Order Summary</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-900/70">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.product_name} &times; {item.quantity}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-beige-200" />
          <PriceBreakdown
            subtotalAmount={cart.subtotal_amount}
            discountPercentage={cart.discount_percentage}
            discountAmount={cart.discount_amount}
            referralDiscountAmount={cart.referral_discount_amount}
            codFeeAmount={method === 'cod' ? COD_FEE : undefined}
            totalAmount={cart.total_amount}
          />
          <p className="mt-3 text-xs text-ink-900/50">
            {method === 'cod' ? 'Payment: Cash on Delivery' : 'Payment: Prepaid via UPI or WhatsApp'}
          </p>

          {!bulk && (
            <div className="mt-4">
              <DeliveryEstimate />
            </div>
          )}

          {bulk ? (
            <p className="mt-6 text-center text-xs text-ink-900/50">
              Use WhatsApp or Email on the left to get bulk pricing.
            </p>
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
              <Smartphone size={18} /> {paymentDetails?.razorpay_enabled ? 'Pay Now' : 'Place Order'}
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
              <Banknote size={18} /> Place Order (Cash on Delivery)
            </Button>
          ) : (
            <p className="mt-6 text-center text-xs text-ink-900/50">
              Choose how you'd like to check out above to continue.
            </p>
          )}
        </Card>
      </div>
    </Container>
  )
}
