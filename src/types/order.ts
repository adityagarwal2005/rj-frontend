export interface Address {
  id: number
  full_name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export type AddressPayload = Omit<Address, 'id'>

export interface CartItem {
  id: number
  product: number
  product_name: string
  unit_price: string
  quantity: number
  subtotal: string
  stock_quantity: number
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal_amount: string
  discount_percentage: string
  discount_amount: string
  applied_promo_code: string
  referral_discount_amount: string
  total_amount: string
}

export type OrderStatus =
  | 'awaiting_details'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: number
  product: number | null
  product_name: string
  product_slug: string | null
  unit_price: string
  quantity: number
  subtotal: string
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus
  created_at: string
}

export interface Order {
  id: string
  status: OrderStatus
  subtotal_amount: string
  discount_percentage: string
  discount_amount: string
  referral_discount_amount: string
  total_amount: string
  notes: string
  is_gift: boolean
  gift_message: string
  /** Null while a WhatsApp-checkout order is still awaiting_details. */
  address: Address | null
  items: OrderItem[]
  status_history: OrderStatusHistoryEntry[]
  /** Product IDs from this order the customer has already reviewed. */
  reviewed_product_ids: number[]
  created_at: string
}

export interface CreateOrderPayload {
  address_id: number
  notes?: string
  is_gift?: boolean
  gift_message?: string
}

export interface CreateWhatsAppOrderPayload {
  notes?: string
}
