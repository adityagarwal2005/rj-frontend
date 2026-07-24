import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROUTES } from '@/constants/routes'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function TermsPage() {
  useDocumentTitle('Terms of Service')

  return (
    <LegalPageLayout title="Terms of Service" updatedOn="24 July 2026">
      <p>
        These terms apply when you use rajwaditukda.com or place an order with RajwadiTukda. By using the
        site or placing an order, you agree to them.
      </p>

      <h2>Our products</h2>
      <p>
        We sell handcrafted chocolate, made fresh in small batches after an order is placed. Photos are
        representative - small variations in appearance between batches are normal for a handmade product.
      </p>

      <h2>Orders and payment</h2>
      <ul>
        <li>All orders are prepaid - we do not offer cash on delivery.</li>
        <li>
          You can pay via UPI (any app - GPay, PhonePe, Paytm, etc.), or via card/UPI/wallet through
          Razorpay where that option is shown at checkout.
        </li>
        <li>We confirm your order once payment is verified on our end.</li>
        <li>
          We reserve the right to refuse or cancel an order - for example if an item is out of stock, if we
          suspect fraud, or if delivery falls outside our serviceable area.
        </li>
        <li>Prices are listed in INR and are inclusive of applicable taxes unless stated otherwise.</li>
      </ul>

      <h2>Delivery</h2>
      <p>
        We currently deliver only within Jaipur, Rajasthan, to guarantee same-day freshness. Delivery
        windows shared at checkout or over WhatsApp are estimates, not guarantees, and can shift due to
        weather, traffic, or high order volume.
      </p>

      <h2>Cancellations and refunds</h2>
      <p>
        See our{' '}
        <Link to={ROUTES.refundPolicy} className="font-medium text-gold-600 underline">
          Refund &amp; Cancellation Policy
        </Link>{' '}
        for how this works.
      </p>

      <h2>Your account</h2>
      <p>
        You're responsible for keeping your login credentials confidential and for the accuracy of the
        address and contact details you provide - we can't guarantee delivery to an incorrect address you
        supplied.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        RajwadiTukda's liability for any order is limited to the amount you paid for that order. We are not
        liable for indirect or consequential loss.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms as the business grows. Continued use of the site means you accept any changes.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, with courts in Jaipur, Rajasthan having jurisdiction.</p>

      <h2>Contact</h2>
      <p>
        Questions? Reach us at <a href="mailto:hello@rajwaditukda.com">hello@rajwaditukda.com</a> or{' '}
        <a href="tel:+917014253541">+91 70142 53541</a>.
      </p>
    </LegalPageLayout>
  )
}
