import { apiClient } from './apiClient'
import type { ApiSuccess } from '@/types/api'
import type {
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  ManualPaymentDetails,
  Payment,
  SubmitUtrPayload,
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

  async submitUtr(payload: SubmitUtrPayload): Promise<Payment> {
    const res = await apiClient.post<ApiSuccess<Payment>>('/payments/utr/', payload)
    return res.data.data
  },

  async confirmWebhook(
    paymentId: string,
    payload: { gateway_payment_id: string; gateway_signature: string },
  ): Promise<Payment> {
    const res = await apiClient.post<ApiSuccess<Payment>>(`/payments/${paymentId}/webhook/`, payload)
    return res.data.data
  },

  /**
   * Called the moment Razorpay reports a successful payment. If this one
   * request is lost (a flaky mobile connection right after switching back
   * from a UPI app), the customer has paid but the order still reads
   * unpaid - and the order page would offer them "Pay Now" a second time.
   * Confirming is idempotent on the backend, so a couple of retries is safe.
   */
  async confirmWebhookWithRetry(
    paymentId: string,
    payload: { gateway_payment_id: string; gateway_signature: string },
    attempts = 3,
  ): Promise<Payment> {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await paymentService.confirmWebhook(paymentId, payload)
      } catch (error) {
        if (attempt >= attempts) throw error
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
      }
    }
  },
}
