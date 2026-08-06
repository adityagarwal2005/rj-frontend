import { apiClient } from './apiClient'
import type { ApiSuccess, Paginated } from '@/types/api'
import type {
  Category,
  CreateReviewPayload,
  ProductDetail,
  ProductListItem,
  ProductListParams,
  Review,
} from '@/types/product'

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

  async listReviews(slug: string): Promise<Paginated<Review>> {
    const res = await apiClient.get<ApiSuccess<Paginated<Review>>>(`/products/${slug}/reviews/`)
    return res.data.data
  },

  async submitReview(slug: string, payload: CreateReviewPayload): Promise<Review> {
    const res = await apiClient.post<ApiSuccess<Review>>(`/products/${slug}/reviews/`, payload)
    return res.data.data
  },

  async addToWishlist(slug: string): Promise<ProductDetail> {
    const res = await apiClient.post<ApiSuccess<ProductDetail>>(`/products/${slug}/wishlist/`)
    return res.data.data
  },

  async removeFromWishlist(slug: string): Promise<ProductDetail> {
    const res = await apiClient.delete<ApiSuccess<ProductDetail>>(`/products/${slug}/wishlist/`)
    return res.data.data
  },

  async listWishlist(page = 1): Promise<Paginated<ProductListItem>> {
    const res = await apiClient.get<ApiSuccess<Paginated<ProductListItem>>>('/products/wishlist/', {
      params: { page },
    })
    return res.data.data
  },
}
