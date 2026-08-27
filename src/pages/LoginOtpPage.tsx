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
import { OtpCodeInput } from '@/components/ui/OtpCodeInput'

interface EmailFormValues {
  email: string
}

export function LoginOtpPage() {
  useDocumentTitle('Log in with a Code', { noindex: true })
  const { loginWithOtp } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | undefined>()
  const [isVerifying, setIsVerifying] = useState(false)

  const redirectState = location.state as RedirectState | null
  const redirectPath = redirectState?.from
    ? `${redirectState.from.pathname}${redirectState.from.search}`
    : ROUTES.home

  const emailForm = useForm<EmailFormValues>()

  async function handleRequestCode(values: EmailFormValues) {
    try {
      await authService.requestOtpLogin({ email: values.email })
      setEmail(values.email)
      showToast('A 6-digit code is on its way to your email.', 'success')
    } catch (error) {
      if (!(error instanceof ApiError)) return
      if (error.errors.code === 'email_not_verified') {
        navigate(ROUTES.verifyEmail, { state: { email: values.email } })
        showToast('Please verify your email to continue.', 'info')
        return
      }
      if (error.errors.code === 'account_not_found') {
        emailForm.setError('email', { message: 'No account found with this email.' })
        return
      }
      emailForm.setError('root', { message: error.message })
    }
  }

  async function handleVerifyCode(submittedCode: string) {
    if (!email || isVerifying) return
    setIsVerifying(true)
    setCodeError(undefined)
    try {
      await loginWithOtp({ email, code: submittedCode })
      showToast('Welcome back!', 'success')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setCode('')
      setCodeError(error instanceof ApiError ? error.message : 'Could not verify that code.')
    } finally {
      setIsVerifying(false)
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

          {emailForm.formState.errors.email?.message === 'No account found with this email.' && (
            <p className="-mt-3 text-xs text-ink-900/60">
              <Link to={ROUTES.register} className="font-medium text-gold-600 hover:underline">
                Create an account
              </Link>{' '}
              instead?
            </p>
          )}

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
      <div className="flex flex-col gap-5">
        <OtpCodeInput
          label="Login Code"
          value={code}
          onChange={(next) => {
            setCode(next)
            setCodeError(undefined)
          }}
          onComplete={handleVerifyCode}
          error={codeError}
          disabled={isVerifying}
        />

        <Button
          type="button"
          variant="gold"
          size="lg"
          isLoading={isVerifying}
          disabled={code.length < 6}
          onClick={() => handleVerifyCode(code)}
        >
          Log In
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        <button
          type="button"
          onClick={() => {
            setEmail(null)
            setCode('')
            setCodeError(undefined)
          }}
          className="font-medium text-gold-600 hover:underline"
        >
          Use a different email
        </button>
      </p>
    </AuthLayout>
  )
}
