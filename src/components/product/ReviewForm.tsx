import { useState } from 'react'
import { Star } from 'lucide-react'
import { productService } from '@/services/productService'
import { ApiError } from '@/services/apiError'
import { useToast } from '@/context/ToastContext'
import type { Review } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { cn } from '@/utils/cn'

const COMMENT_MAX_LENGTH = 1000

interface ReviewFormProps {
  productSlug: string
  orderId: string
  onSubmitted: (review: Review) => void
}

export function ReviewForm({ productSlug, orderId, onSubmitted }: ReviewFormProps) {
  const { showToast } = useToast()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const review = await productService.submitReview(productSlug, { order_id: orderId, rating, comment })
      showToast('Thanks for your review!', 'success')
      onSubmitted(review)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not submit your review.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              className={cn(
                'transition-colors',
                (hoverRating || rating) >= value ? 'fill-gold-500 text-gold-500' : 'text-beige-300',
              )}
            />
          </button>
        ))}
      </div>
      <TextArea
        label="Your review (optional)"
        value={comment}
        onChange={(event) => setComment(event.target.value.slice(0, COMMENT_MAX_LENGTH))}
        placeholder="How was the chocolate?"
        maxLength={COMMENT_MAX_LENGTH}
      />
      <p className="-mt-2 text-right text-xs text-ink-900/40">
        {comment.length}/{COMMENT_MAX_LENGTH}
      </p>
      <Button variant="gold" isLoading={isSubmitting} onClick={handleSubmit} className="self-end">
        Submit Review
      </Button>
    </div>
  )
}
