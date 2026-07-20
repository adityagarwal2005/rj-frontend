import { apiClient } from './apiClient'
import type { ApiSuccess } from '@/types/api'
import type {
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  ManualPaymentDetails,
  Payment,
} from '@/types/payment'

export const paymentService = {
  async initiate(payload: InitiatePaymentPayload): Promise<InitiatePaymentResponse> {
    const res = await apiClient.post<ApiSuccess<InitiatePaymentResponse>>(
      '/payments/initiate/',
      payload,
    )
    return res.data.data
  },

  async getManualPaymentDetails(): Promise<ManualPaymentDetails> {
    const res = await apiClient.get<ApiSuccess<ManualPaymentDetails>>('/payments/details/')
    return res.data.data
  },

  async get(id: string): Promise<Payment> {
    const res = await apiClient.get<ApiSuccess<Payment>>(`/payments/${id}/`)
    return res.data.data
  },
}
