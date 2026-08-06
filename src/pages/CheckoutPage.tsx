import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Mail, MessageCircle, Package, Plus, Smartphone } from 'lucide-react'
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

type CheckoutMethod = 'upi' | 'whatsapp'

export function CheckoutPage() {
  useDocumentTitle('Checkout')
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

  async function handlePlaceOrderViaUpi() {
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
      try {
        await paymentService.initiate({ order_id: order.id, gateway: 'manual' })
      } catch {
        // Order already succeeded; a failed payment-record call isn't fatal -
        // PaymentInstructions still shows the same static UPI/bank details.
      }
      hasPlacedOrderRef.current = true
      navigate(ROUTES.orderSuccess(order.id), { state: { order } })
      void refreshCart()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not place your order.', 'error')
    } finally {
      setIsPlacingOrder(false)
    }
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
  const bulkMailtoUrl = buildBulkEnquiryMailtoUrl('hello@rajwaditukda.com', cart.items)

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="mb-10 font-serif text-4xl text-chocolate-950 sm:text-5xl">Checkout</h1>

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
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <span className="font-medium text-chocolate-950">Continue via UPI</span>
                  <span className="text-xs text-ink-900/60">
                    Enter your delivery address here, then pay instantly with any UPI app.
                  </span>
                </button>
              </div>
            </Card>
          )}

          {!bulk && method === 'upi' && (
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

          {!bulk && method === 'upi' && (
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
            totalAmount={cart.total_amount}
          />
          <p className="mt-3 text-xs text-ink-900/50">Payment: Prepaid via UPI or WhatsApp</p>

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
              onClick={handlePlaceOrderViaUpi}
            >
              Place Order
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
