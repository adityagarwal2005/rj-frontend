import { useEffect, useState } from 'react'
import { Copy, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { paymentService } from '@/services/paymentService'
import { useToast } from '@/context/ToastContext'
import type { ManualPaymentDetails } from '@/types/payment'
import { formatCurrency } from '@/utils/formatCurrency'
import { buildUpiIntentUrl } from '@/utils/upiIntent'
import { Spinner } from '@/components/ui/Spinner'
import { buttonClasses } from '@/components/ui/Button'

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
  const [details, setDetails] = useState<ManualPaymentDetails | null>(null)

  useEffect(() => {
    paymentService.getManualPaymentDetails().then(setDetails).catch(() => setDetails(null))
  }, [])

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
    </div>
  )
}
