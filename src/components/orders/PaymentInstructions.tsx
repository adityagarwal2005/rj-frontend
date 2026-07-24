import { useEffect, useState } from 'react'
import { CheckCircle2, Copy, CreditCard, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { paymentService } from '@/services/paymentService'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { ManualPaymentDetails } from '@/types/payment'
import { formatCurrency } from '@/utils/formatCurrency'
import { buildUpiIntentUrl } from '@/utils/upiIntent'
import { loadRazorpayCheckoutScript, openRazorpayCheckout } from '@/utils/razorpayCheckout'
import { Spinner } from '@/components/ui/Spinner'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function CopyableRow({ label, value }: { label: string; value: string }) {
  const { showToast } = useToast()

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => showToast('Copied to clipboard.', 'success'))
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-900/60">{label}</span>
      <button type="button" onClick={handleCopy} className="flex items-center gap-1.5 font-medium text-chocolate-950 hover:text-gold-600">
        {value} <Copy size={13} />
      </button>
    </div>
  )
}

interface PaymentInstructionsProps {
  amount: string
  orderId: string
}

export function PaymentInstructions({ amount, orderId }: PaymentInstructionsProps) {
  const { showToast } = useToast()
  const [details, setDetails] = useState<ManualPaymentDetails | null>(null)
  const [utrInput, setUtrInput] = useState('')
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false)
  const [utrSubmitted, setUtrSubmitted] = useState(false)
  const [isPayingWithRazorpay, setIsPayingWithRazorpay] = useState(false)

  useEffect(() => {
    paymentService.getManualPaymentDetails().then(setDetails).catch(() => setDetails(null))
  }, [])

  async function handleSubmitUtr() {
    if (utrInput.trim().length < 4) {
      showToast('Enter the full UTR/transaction reference from your UPI app.', 'error')
      return
    }
    setIsSubmittingUtr(true)
    try {
      await paymentService.submitUtr({ order_id: orderId, utr_reference: utrInput.trim() })
      setUtrSubmitted(true)
      showToast("Thanks! We'll verify your payment shortly.", 'success')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not submit your reference number.', 'error')
    } finally {
      setIsSubmittingUtr(false)
    }
  }

  async function handlePayWithRazorpay() {
    if (!details) return
    setIsPayingWithRazorpay(true)
    try {
      const scriptLoaded = await loadRazorpayCheckoutScript()
      if (!scriptLoaded) {
        showToast('Could not load the payment widget. Please try UPI instead.', 'error')
        return
      }
      const { payment, gateway_data } = await paymentService.initiate({ order_id: orderId, gateway: 'razorpay' })
      openRazorpayCheckout({
        key: gateway_data.key_id ?? '',
        amount: Number(gateway_data.amount),
        currency: gateway_data.currency ?? 'INR',
        order_id: gateway_data.razorpay_order_id ?? '',
        name: 'RajwadiTukda',
        description: `Order ${orderId.slice(0, 8)}`,
        theme: { color: '#af8a48' },
        handler: (response) => {
          paymentService
            .confirmWebhook(payment.id, {
              gateway_payment_id: response.razorpay_payment_id,
              gateway_signature: response.razorpay_signature,
            })
            .then(() => {
              showToast('Payment successful! Confirming your order...', 'success')
              window.location.reload()
            })
            .catch(() => showToast('Payment received but confirmation failed - contact us on WhatsApp.', 'error'))
        },
      })
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not start Razorpay checkout.', 'error')
    } finally {
      setIsPayingWithRazorpay(false)
    }
  }

  if (!details) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size={20} />
      </div>
    )
  }

  const upiIntentUrl = buildUpiIntentUrl(details, amount, `RajwadiTukda order ${orderId.slice(0, 8)}`)

  return (
    <div className="rounded-2xl bg-gold-400/10 p-4">
      <p className="mb-3 text-sm font-medium text-chocolate-950">
        Pay {formatCurrency(amount)} to complete your order
      </p>

      <div className="flex flex-col items-center gap-3 rounded-xl bg-cream-50 p-4 sm:flex-row sm:justify-center">
        <div className="rounded-lg bg-white p-2">
          <QRCodeSVG value={upiIntentUrl} size={128} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <p className="text-xs text-ink-900/60">Scan with any UPI app, or on your phone:</p>
          <a href={upiIntentUrl} className={buttonClasses('gold', 'sm')}>
            <Smartphone size={16} /> Pay with UPI App
          </a>
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-chocolate-900">
          Prefer to pay manually?
        </summary>
        <div className="mt-2 flex flex-col gap-2 rounded-xl bg-cream-50 p-3">
          <CopyableRow label="UPI ID" value={details.upi_id} />
        </div>
      </details>

      <p className="mt-3 text-xs text-ink-900/60">{details.instructions}</p>

      {details.razorpay_enabled && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          isLoading={isPayingWithRazorpay}
          onClick={handlePayWithRazorpay}
        >
          <CreditCard size={15} /> Pay Instantly (Card / UPI / Wallet)
        </Button>
      )}

      <div className="mt-4 border-t border-gold-400/20 pt-3">
        {utrSubmitted ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={14} /> Reference received - we'll confirm your order shortly.
          </p>
        ) : (
          <>
            <p className="text-xs font-medium text-chocolate-950">Already paid?</p>
            <p className="mt-0.5 text-xs text-ink-900/60">
              Enter the UTR/transaction reference from your UPI app so we can confirm faster.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="UTR / Transaction ID"
                  value={utrInput}
                  onChange={(event) => setUtrInput(event.target.value)}
                  placeholder="e.g. 123456789012"
                  maxLength={35}
                />
              </div>
              <Button variant="ghost" size="sm" isLoading={isSubmittingUtr} onClick={handleSubmitUtr}>
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
