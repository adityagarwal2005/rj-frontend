import { useEffect, useState } from 'react'
import { Star, User } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Review } from '@/types/product'
import { formatDate } from '@/utils/formatDate'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

interface ReviewListProps {
  productSlug: string
  refreshKey: number
}

export function ReviewList({ productSlug, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[] | null>(null)

  useEffect(() => {
    let isMounted = true
    setReviews(null)
    productService
      .listReviews(productSlug)
      .then((data) => {
        if (isMounted) setReviews(data.results)
      })
      .catch(() => {
        if (isMounted) setReviews([])
      })
    return () => {
      isMounted = false
    }
  }, [productSlug, refreshKey])

  if (reviews === null) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-ink-900/60">No reviews yet - be the first to try it and share your thoughts!</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-beige-200 bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-beige-200 text-chocolate-900">
                <User size={14} />
              </span>
              <span className="text-sm font-medium text-chocolate-950">{review.user_name}</span>
            </div>
            <span className="text-xs text-ink-900/50">{formatDate(review.created_at)}</span>
          </div>
          <div className="mt-2 flex items-center gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                size={14}
                aria-hidden="true"
                className={cn(value <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-beige-300')}
              />
            ))}
          </div>
          {review.comment && <p className="mt-2 text-sm text-ink-900/70">{review.comment}</p>}
        </div>
      ))}
    </div>
  )
}
