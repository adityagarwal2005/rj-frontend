import type { ManualPaymentDetails } from '@/types/payment'

/**
 * Builds a standard UPI deep link (the same format every UPI QR code
 * encodes). Any UPI app (PhonePe, GPay, Paytm, ...) registers this URI
 * scheme, so opening it on mobile launches the user's app chooser with the
 * payee/amount pre-filled; scanning it as a QR code does the same thing.
 * No payment gateway or merchant account needed - this is just a URI format.
 */
export function buildUpiIntentUrl(details: ManualPaymentDetails, amount: string, note: string): string {
  const params = new URLSearchParams({
    pa: details.upi_id,
    pn: details.bank_account_name,
    am: amount,
    cu: 'INR',
    tn: note,
  })
  return `upi://pay?${params.toString()}`
}
