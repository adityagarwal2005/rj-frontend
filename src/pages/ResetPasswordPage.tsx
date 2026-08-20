import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  useDocumentTitle('Reset Password', { noindex: true })
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>()

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!uid || !token) return
    try {
      await authService.confirmPasswordReset({ uid: Number(uid), token, new_password: values.password })
      showToast('Password reset! You can now log in.', 'success')
      navigate(ROUTES.login)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message })
      }
    }
  }

  if (!uid || !token) {
    return (
      <AuthLayout title="Reset Password" subtitle="This link looks incomplete.">
        <p className="text-center text-sm text-ink-900/70">
          Please use the link from your password-reset email, or{' '}
          <Link to={ROUTES.forgotPassword} className="font-medium text-gold-600 hover:underline">
            request a new one
          </Link>
          .
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a New Password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        <Input
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
        />

        {errors.root && <p className="text-sm text-red-800">{errors.root.message}</p>}

        <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} className="mt-2">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  )
}
