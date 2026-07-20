import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface RegisterFormValues {
  full_name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  useDocumentTitle('Create Account')
  const { register: registerUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>()

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      })
      showToast('Account created. Welcome to RajwadiTukda!', 'success')
      navigate(ROUTES.home)
    } catch (error) {
      if (error instanceof ApiError) {
        const emailError = error.fieldError('email')
        if (emailError) setError('email', { message: emailError })
        const passwordError = error.fieldError('password')
        if (passwordError) setError('password', { message: passwordError })
        if (!emailError && !passwordError) setError('root', { message: error.message })
      }
    }
  }

  return (
    <AuthLayout title="Create Your Account" subtitle="Join us for premium Rajasthani chocolate.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          label="Full Name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Full name is required' })}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        <Input
          label="Confirm Password"
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
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/70">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-gold-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
