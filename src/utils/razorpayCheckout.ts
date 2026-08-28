interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  theme?: { color: string }
  // Fires when the customer closes the checkout sheet (any app - GPay,
  // Paytm, PhonePe, card entry, etc.) without completing payment. Without
  // this, a customer who backs out mid-payment saw nothing at all - no
  // confirmation, no failure, just silence.
  modal?: { ondismiss?: () => void }
}

interface RazorpayCheckoutInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}

let loadingPromise: Promise<boolean> | null = null

/** Loads Razorpay's official checkout widget script once and caches the result. */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true)
  if (loadingPromise) return loadingPromise
  loadingPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
  return loadingPromise
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions): void {
  if (!window.Razorpay) return
  new window.Razorpay(options).open()
}
