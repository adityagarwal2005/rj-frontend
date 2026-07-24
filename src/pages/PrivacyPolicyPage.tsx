import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function PrivacyPolicyPage() {
  useDocumentTitle('Privacy Policy')

  return (
    <LegalPageLayout title="Privacy Policy" updatedOn="24 July 2026">
      <p>
        RajwadiTukda ("we", "us", "our") operates rajwaditukda.com. This page explains what information we
        collect when you use our site, why we collect it, and how you can control it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account details: your name, email address, and phone number when you register.</li>
        <li>Delivery details: the addresses you save to your account for delivery within Jaipur.</li>
        <li>Order details: what you've ordered, quantities, and order status.</li>
        <li>
          Payment details: we do not store your card, UPI PIN, or bank credentials. Payments are completed
          directly through your UPI app or, where enabled, through Razorpay - a payment processor that
          handles your payment details on its own secure systems.
        </li>
        <li>Basic usage analytics (pages viewed, add-to-cart events) if analytics is enabled on the site.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To process, prepare, and deliver your order.</li>
        <li>To contact you about your order via email, phone, or WhatsApp.</li>
        <li>To maintain your account and order history.</li>
        <li>To improve the site and understand what's popular.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share only what's needed to fulfil your order: your name, phone, and address with whoever
        delivers your order, and payment amount/reference with our payment processor (Razorpay, if you pay
        that way) to confirm your payment. We do not sell your data to anyone.
      </p>

      <h2>Data security</h2>
      <p>
        Your data is stored on secured infrastructure. Access is limited to what's needed to run
        RajwadiTukda. No online system is 100% secure, but we take reasonable steps to protect your
        information.
      </p>

      <h2>Your choices</h2>
      <p>
        You can review and update your account details and saved addresses any time from your profile. To
        request a copy of your data or ask us to delete your account, email{' '}
        <a href="mailto:hello@rajwaditukda.com">hello@rajwaditukda.com</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this page as RajwadiTukda grows. We'll update the date at the top when we do.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach us at{' '}
        <a href="mailto:hello@rajwaditukda.com">hello@rajwaditukda.com</a> or{' '}
        <a href="tel:+917014253541">+91 70142 53541</a>.
      </p>
    </LegalPageLayout>
  )
}
