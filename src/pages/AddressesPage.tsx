import { useEffect, useState } from 'react'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { Address } from '@/types/order'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { AddressForm } from '@/components/checkout/AddressForm'

type LoadState = 'loading' | 'success' | 'error'

export function AddressesPage() {
  useDocumentTitle('Address Book')
  const { showToast } = useToast()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [modalMode, setModalMode] = useState<'closed' | 'create' | Address>('closed')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  function loadAddresses() {
    setState('loading')
    orderService
      .listAddresses()
      .then((data) => {
        setAddresses(data.results)
        setState('success')
      })
      .catch(() => setState('error'))
  }

  function handleSaved(address: Address) {
    setAddresses((current) => {
      const exists = current.some((a) => a.id === address.id)
      return exists ? current.map((a) => (a.id === address.id ? address : a)) : [...current, address]
    })
    setModalMode('closed')
    showToast('Address saved successfully.', 'success')
  }

  async function handleDelete(address: Address) {
    setDeletingId(address.id)
    try {
      await orderService.deleteAddress(address.id)
      setAddresses((current) => current.filter((a) => a.id !== address.id))
      showToast('Address removed.', 'info')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not remove address.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl text-chocolate-950">Address Book</h1>
        <Button variant="gold" size="sm" onClick={() => setModalMode('create')}>
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {state === 'loading' && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {state === 'error' && <ErrorState title="Couldn't load your addresses" onRetry={loadAddresses} />}

      {state === 'success' && addresses.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout next time."
        />
      )}

      {state === 'success' && addresses.length > 0 && (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between gap-4 rounded-2xl border border-beige-200 bg-white/60 p-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-chocolate-950">{address.full_name}</span>
                  {address.is_default && <Badge tone="gold">Default</Badge>}
                </div>
                <p className="text-sm text-ink-900/70">{address.phone}</p>
                <p className="text-sm text-ink-900/70">
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}, {address.city}, {address.state}{' '}
                  {address.postal_code}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setModalMode(address)}
                  aria-label={`Edit address for ${address.full_name}`}
                  className="rounded-full p-2 text-chocolate-900 hover:bg-beige-200"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address)}
                  disabled={deletingId === address.id}
                  aria-label={`Delete address for ${address.full_name}`}
                  className="rounded-full p-2 text-red-800 hover:bg-red-50 disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalMode !== 'closed'}
        onClose={() => setModalMode('closed')}
        title={modalMode !== 'closed' && modalMode !== 'create' ? 'Edit Address' : 'Add Address'}
      >
        <AddressForm
          editingAddress={modalMode !== 'closed' && modalMode !== 'create' ? modalMode : undefined}
          onSaved={handleSaved}
          onCancel={() => setModalMode('closed')}
        />
      </Modal>
    </Container>
  )
}
