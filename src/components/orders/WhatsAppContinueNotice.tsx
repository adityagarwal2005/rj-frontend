import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { paymentService } from '@/services/paymentService'
import type { Order } from '@/types/order'
import { buildWhatsAppOrderUrl } from '@/utils/whatsappIntent'
import { Spinner } from '@/components/ui/Spinner'
import { buttonClasses } from '@/components/ui/Button'

interface WhatsAppContinueNoticeProps {
  order: Order
}

export function WhatsAppContinueNotice({ order }: WhatsAppContinueNoticeProps) {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)

  useEffect(() => {
    paymentService
      .getManualPaymentDetails()
      .then((details) => setWhatsappNumber(details.whatsapp_number))
      .catch(() => setWhatsappNumber(null))
  }, [])

  if (!whatsappNumber) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size={20} />
      </div>
    )
  }

  const whatsappUrl = buildWhatsAppOrderUrl(whatsappNumber, order.id, order.items, order.total_amount)

  return (
    <div className="rounded-2xl bg-gold-400/10 p-4">
      <p className="mb-3 text-sm font-medium text-chocolate-950">
        We're waiting to hear from you on WhatsApp
      </p>
      <p className="text-xs text-ink-900/60">
        Reply with your name, phone number, and delivery address (Jaipur only) so we can confirm your order and
        share payment details.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses('gold', 'sm', 'mt-3')}
      >
        <MessageCircle size={16} /> Open WhatsApp
      </a>
    </div>
  )
}
