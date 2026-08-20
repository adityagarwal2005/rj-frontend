import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ForgotPasswordFormValues {
  email: string
}

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password', { noindex: true })
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>()

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await authService.requestPasswordReset({ email: values.email })
      setIsSent(true)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message })
      }
    }
  }

  if (isSent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="If an account exists for that email, a reset link is on its way.">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 size={40} className="text-emerald-600" strokeWidth={1.5} />
          <p className="text-sm text-ink-900/70">
            The link expires in 30 minutes. Don't see it? Check your spam folder.
          </p>
          <Link to={ROUTES.login} className="font-medium text-gold-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        {errors.root && <p className="text-sm text-red-800">{errors.root.message}</p>}

        <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} className="mt-2">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        Remembered it after all?{' '}
        <Link to={ROUTES.login} className="font-medium text-gold-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
