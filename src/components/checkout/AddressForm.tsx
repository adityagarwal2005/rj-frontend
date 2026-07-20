import { MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { orderService } from '@/services/orderService'
import { ApiError } from '@/services/apiError'
import type { Address, AddressPayload } from '@/types/order'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AddressFormProps {
  editingAddress?: Address
  onSaved: (address: Address) => void
  onCancel: () => void
}

const DELIVERABLE_CITY = 'Jaipur'

type AddressFormValues = Omit<AddressPayload, 'country' | 'is_default' | 'city'>

export function AddressForm({ editingAddress, onSaved, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    defaultValues: editingAddress
      ? {
          full_name: editingAddress.full_name,
          phone: editingAddress.phone,
          line1: editingAddress.line1,
          line2: editingAddress.line2,
          state: editingAddress.state,
          postal_code: editingAddress.postal_code,
        }
      : { state: 'Rajasthan' },
  })

  async function onSubmit(values: AddressFormValues) {
    try {
      const address = editingAddress
        ? await orderService.updateAddress(editingAddress.id, {
            ...values,
            city: DELIVERABLE_CITY,
            line2: values.line2 ?? '',
            country: editingAddress.country,
            is_default: editingAddress.is_default,
          })
        : await orderService.createAddress({
            ...values,
            city: DELIVERABLE_CITY,
            line2: values.line2 ?? '',
            country: 'India',
            is_default: false,
          })
      onSaved(address)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-2 rounded-xl bg-gold-400/10 px-4 py-3 text-sm text-chocolate-900">
        <MapPin size={16} className="shrink-0 text-gold-600" />
        We currently deliver only within <strong>Jaipur</strong>.
      </div>

      <Input label="Full Name" error={errors.full_name?.message} {...register('full_name', { required: 'Required' })} />
      <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
      <Input label="Address Line 1" error={errors.line1?.message} {...register('line1', { required: 'Required' })} />
      <Input label="Address Line 2 (optional)" {...register('line2')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" value={DELIVERABLE_CITY} disabled readOnly />
        <Input label="State" error={errors.state?.message} {...register('state', { required: 'Required' })} />
      </div>
      <Input
        label="Postal Code"
        error={errors.postal_code?.message}
        {...register('postal_code', { required: 'Required' })}
      />

      {errors.root && <p className="text-sm text-red-800">{errors.root.message}</p>}

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="gold" isLoading={isSubmitting} className="flex-1">
          Save Address
        </Button>
      </div>
    </form>
  )
}
