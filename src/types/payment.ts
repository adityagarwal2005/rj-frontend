export type PaymentGateway = 'manual' | 'cod' | 'razorpay'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Payment {
  id: string
  order: string
  gateway: PaymentGateway
  status: PaymentStatus
  amount: string
  currency: string
  utr_reference: string
  created_at: string
}

export interface ManualPaymentDetails {
  upi_id: string
  bank_account_name: string
  bank_account_number: string
  bank_ifsc: string
  bank_name: string
  whatsapp_number: string
  instructions: string
  razorpay_enabled: boolean
  razorpay_key_id: string
}

export interface InitiatePaymentPayload {
  order_id: string
  gateway: PaymentGateway
}

export interface InitiatePaymentResponse {
  payment: Payment
  gateway_data: ManualPaymentDetails & {
    gateway: PaymentGateway
    amount: string
    razorpay_order_id?: string
    key_id?: string
    currency?: string
  }
}

export interface SubmitUtrPayload {
  order_id: string
  utr_reference: string
}
