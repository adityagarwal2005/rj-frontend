import { formatCurrency } from '@/utils/formatCurrency'

interface OrderLineItem {
  product_name: string
  quantity: number
}

/**
 * Builds a wa.me deep link with the order pre-filled in the message text,
 * so the customer doesn't have to retype their cart when they land in chat.
 * Accepts both CartItem[] and OrderItem[] - only product_name/quantity are used.
 */
export function buildWhatsAppOrderUrl(
  whatsappNumber: string,
  orderId: string,
  items: OrderLineItem[],
  totalAmount: string,
): string {
  const lines = [
    `Hi RajwadiTukda! I'd like to complete order ${orderId.slice(0, 8)}:`,
    ...items.map((item) => `- ${item.product_name} x ${item.quantity}`),
    `Total: ${formatCurrency(totalAmount)}`,
    '',
    "Here's my name, phone number, and delivery address (Jaipur only):",
  ]
  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${whatsappNumber}?text=${text}`
}

/**
 * Bulk orders (see utils/bulkOrder.ts) skip the catalog checkout entirely -
 * pricing and delivery need a human conversation, so this just opens a chat
 * with the cart contents pre-filled, no Order/Payment record involved.
 */
export function buildBulkEnquiryWhatsAppUrl(whatsappNumber: string, items: OrderLineItem[]): string {
  const lines = [
    "Hi RajwadiTukda! I'd like to place a bulk order:",
    ...items.map((item) => `- ${item.product_name} x ${item.quantity}`),
    '',
    'Could you share bulk pricing and delivery timing?',
  ]
  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${whatsappNumber}?text=${text}`
}

export function buildBulkEnquiryMailtoUrl(email: string, items: OrderLineItem[]): string {
  const subject = encodeURIComponent('Bulk Order Enquiry - RajwadiTukda')
  const bodyLines = [
    'Hi RajwadiTukda,',
    '',
    "I'd like to place a bulk order:",
    ...items.map((item) => `- ${item.product_name} x ${item.quantity}`),
    '',
    'Could you share bulk pricing and delivery timing?',
  ]
  const body = encodeURIComponent(bodyLines.join('\n'))
  return `mailto:${email}?subject=${subject}&body=${body}`
}
