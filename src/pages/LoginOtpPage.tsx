import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import type { RedirectState } from '@/types/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface EmailFormValues {
  email: string
}

interface CodeFormValues {
  code: string
}

export function LoginOtpPage() {
  useDocumentTitle('Log in with a Code', { noindex: true })
  const { loginWithOtp } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState<string | null>(null)

  const redirectState = location.state as RedirectState | null
  const redirectPath = redirectState?.from
    ? `${redirectState.from.pathname}${redirectState.from.search}`
    : ROUTES.home

  const emailForm = useForm<EmailFormValues>()
  const codeForm = useForm<CodeFormValues>()

  async function handleRequestCode(values: EmailFormValues) {
    try {
      await authService.requestOtpLogin({ email: values.email })
      setEmail(values.email)
      showToast('If that account exists, a code is on its way.', 'success')
    } catch (error) {
      if (error instanceof ApiError) {
        emailForm.setError('root', { message: error.message })
      }
    }
  }

  async function handleVerifyCode(values: CodeFormValues) {
    if (!email) return
    try {
      await loginWithOtp({ email, code: values.code })
      showToast('Welcome back!', 'success')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        codeForm.setError('code', { message: error.message })
      }
    }
  }

  if (!email) {
    return (
      <AuthLayout title="Log in with a Code" subtitle="No password needed - we'll email you a one-time code.">
        <form onSubmit={emailForm.handleSubmit(handleRequestCode)} className="flex flex-col gap-5" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register('email', { required: 'Email is required' })}
          />

          {emailForm.formState.errors.root && (
            <p className="text-sm text-red-800">{emailForm.formState.errors.root.message}</p>
          )}

          <Button type="submit" variant="gold" size="lg" isLoading={emailForm.formState.isSubmitting} className="mt-2">
            Send Code
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-900/70">
          Prefer your password?{' '}
          <Link to={ROUTES.login} className="font-medium text-gold-600 hover:underline">
            Sign in instead
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Enter Your Code" subtitle={`We sent a 6-digit code to ${email}.`}>
      <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="flex flex-col gap-5" noValidate>
        <Input
          label="Login Code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          error={codeForm.formState.errors.code?.message}
          {...codeForm.register('code', {
            required: 'Enter the code from your email',
            pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code' },
          })}
        />

        <Button type="submit" variant="gold" size="lg" isLoading={codeForm.formState.isSubmitting} className="mt-2">
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        <button
          type="button"
          onClick={() => setEmail(null)}
          className="font-medium text-gold-600 hover:underline"
        >
          Use a different email
        </button>
      </p>
    </AuthLayout>
  )
}
