export interface Category {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  display_order: number
}

/** Shape returned by GET /api/products/ (list) */
export interface ProductListItem {
  id: number
  name: string
  slug: string
  category: string
  price: string
  discount_price: string | null
  effective_price: string
  weight_label: string
  in_stock: boolean
  is_featured: boolean
  primary_image: string | null
}

/** Shape returned by GET /api/products/{slug}/ (detail) */
export interface ProductDetail {
  id: number
  name: string
  slug: string
  description: string
  ingredients: string
  category: Category
  price: string
  discount_price: string | null
  effective_price: string
  weight_label: string
  stock_quantity: number
  in_stock: boolean
  is_active: boolean
  is_featured: boolean
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ProductListParams {
  category?: string
  min_price?: number
  max_price?: number
  is_featured?: boolean
  search?: string
  ordering?: 'price' | '-price' | 'created_at' | '-created_at' | 'name' | '-name'
  page?: number
  page_size?: number
}
