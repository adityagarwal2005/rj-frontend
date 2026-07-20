import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Bell, MapPin, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { UpdateProfilePayload } from '@/types/auth'
import { ROUTES } from '@/constants/routes'
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
