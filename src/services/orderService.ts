import { apiClient } from './apiClient'
import type { ApiSuccess, Paginated } from '@/types/api'
import type {
  Address,
  AddressPayload,
  Cart,
  CreateOrderPayload,
  CreateWhatsAppOrderPayload,
  Order,
} from '@/types/order'

export const orderService = {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<ApiSuccess<Cart>>('/orders/cart/')
    return res.data.data
  },

  async addCartItem(productId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.post<ApiSuccess<Cart>>('/orders/cart/items/', {
      product_id: productId,
      quantity,
    })
    return res.data.data
  },

  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.patch<ApiSuccess<Cart>>(`/orders/cart/items/${itemId}/`, {
      quantity,
    })
    return res.data.data
  },

  async removeCartItem(itemId: number): Promise<Cart> {
    const res = await apiClient.delete<ApiSuccess<Cart>>(`/orders/cart/items/${itemId}/`)
    return res.data.data
  },

  async listAddresses(): Promise<Paginated<Address>> {
    const res = await apiClient.get<ApiSuccess<Paginated<Address>>>('/orders/addresses/')
    return res.data.data
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const res = await apiClient.post<ApiSuccess<Address>>('/orders/addresses/', payload)
    return res.data.data
  },

  async updateAddress(id: number, payload: AddressPayload): Promise<Address> {
    const res = await apiClient.patch<ApiSuccess<Address>>(`/orders/addresses/${id}/`, payload)
    return res.data.data
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/orders/addresses/${id}/`)
  },

  async listOrders(page = 1): Promise<Paginated<Order>> {
    const res = await apiClient.get<ApiSuccess<Paginated<Order>>>('/orders/', { params: { page } })
    return res.data.data
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await apiClient.post<ApiSuccess<Order>>('/orders/', payload)
    return res.data.data
  },

  async createWhatsAppOrder(payload: CreateWhatsAppOrderPayload = {}): Promise<Order> {
    const res = await apiClient.post<ApiSuccess<Order>>('/orders/checkout-whatsapp/', payload)
    return res.data.data
  },

  async getOrder(id: string): Promise<Order> {
    const res = await apiClient.get<ApiSuccess<Order>>(`/orders/${id}/`)
    return res.data.data
  },

  async cancelOrder(id: string): Promise<Order> {
    const res = await apiClient.post<ApiSuccess<Order>>(`/orders/${id}/cancel/`)
    return res.data.data
  },
}
