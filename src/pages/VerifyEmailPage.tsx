import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface VerifyEmailFormValues {
  code: string
}

const RESEND_COOLDOWN_SECONDS = 30

export function VerifyEmailPage() {
  useDocumentTitle('Verify Your Email', { noindex: true })
  const { verifyEmail } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const email = (location.state as { email?: string } | null)?.email ?? searchParams.get('email') ?? ''
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function onSubmit(values: VerifyEmailFormValues) {
    try {
      await verifyEmail({ email, code: values.code })
      showToast("Email verified! You're all set.", 'success')
      navigate(ROUTES.home)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('code', { message: error.message })
      }
    }
  }

  async function handleResend() {
    setIsResending(true)
    try {
      await authService.resendOtp({ email })
      showToast('A new code is on its way to your inbox.', 'success')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      showToast('Could not resend the code. Please try again shortly.', 'error')
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <AuthLayout title="Verify Your Email" subtitle="Something went wrong.">
        <p className="text-center text-sm text-ink-900/70">
          We couldn't tell which account to verify.{' '}
          <Link to={ROUTES.register} className="font-medium text-gold-600 hover:underline">
            Try creating your account again
          </Link>
          .
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Verify Your Email" subtitle={`We sent a 6-digit code to ${email}.`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          label="Verification Code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          error={errors.code?.message}
          {...register('code', {
            required: 'Enter the code from your email',
            pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code' },
          })}
        />

        <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} className="mt-2">
          Verify Email
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        Didn't get a code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="font-medium text-gold-600 hover:underline disabled:cursor-not-allowed disabled:text-ink-900/40 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </AuthLayout>
  )
}
