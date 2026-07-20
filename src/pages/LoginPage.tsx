import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import type { RedirectState } from '@/types/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  useDocumentTitle('Login')
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const redirectState = location.state as RedirectState | null
  const redirectPath = redirectState?.from
    ? `${redirectState.from.pathname}${redirectState.from.search}`
    : ROUTES.home

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values)
      showToast('Welcome back!', 'success')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message })
      }
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your order.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        {errors.root && <p className="text-sm text-red-800">{errors.root.message}</p>}

        <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        New to RajwadiTukda?{' '}
        <Link to={ROUTES.register} className="font-medium text-gold-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
