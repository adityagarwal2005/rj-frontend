import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Bell, Copy, Gift, MapPin, MessageCircle, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/apiError'
import type { ReferralSummary, UpdateProfilePayload } from '@/types/auth'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const QUICK_LINKS = [
  { to: ROUTES.orders, icon: Package, label: 'My Orders', description: 'Track and review past orders' },
  { to: ROUTES.addresses, icon: MapPin, label: 'Address Book', description: 'Manage saved delivery addresses' },
  { to: ROUTES.notifications, icon: Bell, label: 'Notifications', description: 'Updates on your orders' },
]

export function ProfilePage() {
  useDocumentTitle('My Profile')
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null)

  useEffect(() => {
    authService.getReferralSummary().then(setReferrals).catch(() => setReferrals(null))
  }, [])

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfilePayload>({
    defaultValues: { full_name: user?.full_name, phone: user?.phone },
  })

  async function onSubmit(values: UpdateProfilePayload) {
    try {
      const updated = await updateProfile(values)
      reset({ full_name: updated.full_name, phone: updated.phone })
      showToast('Profile updated successfully.', 'success')
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message })
      }
    }
  }

  if (!user) return null

  const referralLink = referrals ? `${window.location.origin}${ROUTES.register}?ref=${referrals.referral_code}` : ''

  function handleCopyLink() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => showToast('Referral link copied.', 'success'))
  }

  function handleShareOnWhatsApp() {
    if (!referralLink) return
    const message = `Hey! Use my link to get ₹30 off your first RajwadiTukda order: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <h1 className="mb-8 font-serif text-4xl text-chocolate-950">My Profile</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Input label="Email" value={user.email} disabled readOnly />
          <Input
            label="Full Name"
            error={errors.full_name?.message}
            {...register('full_name', { required: 'Full name is required' })}
          />
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />

          {errors.root && <p className="text-sm text-red-800">{errors.root.message}</p>}

          <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} disabled={!isDirty} className="mt-2 self-start">
            Save Changes
          </Button>
        </form>
      </Card>

      {referrals && (
        <Card className="mt-8">
          <div className="flex items-center gap-2.5">
            <Gift size={20} className="text-gold-600" />
            <h2 className="font-serif text-xl text-chocolate-950">Refer &amp; Earn</h2>
          </div>
          <p className="mt-2 text-sm text-ink-900/70">
            Share your link - your friend gets ₹30 off their first order, and you get ₹30 off your next one once
            they've paid.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-beige-300 bg-cream-50 px-4 py-3 text-sm text-chocolate-950">
            <span className="flex-1 truncate font-mono">{referralLink}</span>
            <button type="button" onClick={handleCopyLink} aria-label="Copy referral link" className="shrink-0 text-gold-600 hover:text-gold-700">
              <Copy size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="gold" size="md" onClick={handleShareOnWhatsApp}>
              <MessageCircle size={16} /> Share on WhatsApp
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-beige-200 pt-5 text-center">
            <div>
              <p className="font-serif text-2xl text-chocolate-950">{referrals.referred_count}</p>
              <p className="text-xs text-ink-900/60">Referred</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-chocolate-950">{referrals.successful_referrals}</p>
              <p className="text-xs text-ink-900/60">Successful</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-gold-600">{formatCurrency(referrals.available_credit)}</p>
              <p className="text-xs text-ink-900/60">Credit available</p>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ to, icon: Icon, label, description }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col gap-2 rounded-2xl border border-beige-200 bg-white/60 p-5 transition-colors hover:border-gold-400"
          >
            <Icon size={20} className="text-gold-600" strokeWidth={1.5} />
            <span className="font-medium text-chocolate-950">{label}</span>
            <span className="text-xs text-ink-900/60">{description}</span>
          </Link>
        ))}
      </div>
    </Container>
  )
}
