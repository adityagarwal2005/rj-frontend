import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function RefundPolicyPage() {
  useDocumentTitle('Refund & Cancellation Policy')

  return (
    <LegalPageLayout title="Refund & Cancellation Policy" updatedOn="24 July 2026">
      <p>
        Our chocolate is made fresh, in small batches, after you order - so this policy looks a little
        different from a typical retail return policy.
      </p>

      <h2>Cancelling an order</h2>
      <ul>
        <li>
          You can cancel free of charge before your order has started being prepared. Message us on{' '}
          <a href="https://wa.me/917014253541" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{' '}
          right away, or use the Cancel option on your order page if it's still showing as pending or
          confirmed.
        </li>
        <li>Once your order has been prepared or dispatched, it can no longer be cancelled.</li>
      </ul>

      <h2>Returns</h2>
      <p>
        Because chocolate is a perishable food item, we can't accept returns once it's delivered - for
        hygiene and food-safety reasons.
      </p>

      <h2>When you're eligible for a refund</h2>
      <ul>
        <li>Your order was paid for but never delivered.</li>
        <li>You received the wrong item.</li>
        <li>Your order arrived damaged, melted, or spoiled due to handling in transit.</li>
        <li>You cancelled before preparation began, per the section above.</li>
      </ul>
      <p>
        For damaged or incorrect items, contact us within 24 hours of delivery with a photo, via{' '}
        <a href="mailto:hello@rajwaditukda.com">hello@rajwaditukda.com</a> or{' '}
        <a href="https://wa.me/917014253541" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        .
      </p>

      <h2>What isn't covered</h2>
      <ul>
        <li>Change of mind after your order has been prepared or dispatched.</li>
        <li>Delivery issues caused by an incorrect address or contact number you provided.</li>
        <li>Minor natural variation in appearance between batches of a handmade product.</li>
      </ul>

      <h2>How refunds are issued</h2>
      <p>
        Approved refunds are sent back to the original UPI or payment method you used, usually within 5-7
        business days.
      </p>

      <h2>Contact</h2>
      <p>
        For any order issue, the fastest way to reach us is{' '}
        <a href="https://wa.me/917014253541" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>{' '}
        at <a href="tel:+917014253541">+91 70142 53541</a>, or email{' '}
        <a href="mailto:hello@rajwaditukda.com">hello@rajwaditukda.com</a>.
      </p>
    </LegalPageLayout>
  )
}
