import { apiClient } from './apiClient'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { Category, ProductDetail, ProductListItem, ProductListParams } from '@/types/product'

export const productService = {
  async list(params: ProductListParams = {}): Promise<Paginated<ProductListItem>> {
    const res = await apiClient.get<ApiSuccess<Paginated<ProductListItem>>>('/products/', {
      params,
    })
    return res.data.data
  },

  async getBySlug(slug: string): Promise<ProductDetail> {
    const res = await apiClient.get<ApiSuccess<ProductDetail>>(`/products/${slug}/`)
    return res.data.data
  },

  async listCategories(): Promise<Paginated<Category>> {
    const res = await apiClient.get<ApiSuccess<Paginated<Category>>>('/products/categories/')
    return res.data.data
  },
}
