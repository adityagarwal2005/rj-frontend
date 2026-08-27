import { useEffect, useRef } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface OtpCodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
  label?: string
  autoFocus?: boolean
  disabled?: boolean
}

/**
 * Six individually-boxed digit inputs instead of one plain text field - a
 * code is not a sentence, and a single generic <input> gave no visual cue
 * for where to type or how many digits were expected. Supports paste
 * (splits a full code across every box), backspace-to-previous, and
 * arrow-key navigation.
 */
export function OtpCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  label = 'Code',
  autoFocus = true,
  disabled = false,
}: OtpCodeInputProps) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const hasFiredComplete = useRef(false)

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (value.length === length && !hasFiredComplete.current) {
      hasFiredComplete.current = true
      onComplete?.(value)
    } else if (value.length < length) {
      hasFiredComplete.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length])

  function commit(nextDigits: string[]) {
    onChange(nextDigits.join('').slice(0, length))
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = digits.slice()
    next[index] = digit
    commit(next)
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      const next = digits.slice()
      next[index - 1] = ''
      commit(next)
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus())
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-chocolate-900/80">{label}</span>
      )}
      <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              'h-14 w-full min-w-0 rounded-xl border border-beige-300 bg-cream-50 text-center font-display text-2xl font-semibold text-chocolate-950 transition-colors duration-200',
              'focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30',
              error && 'border-red-700 focus:border-red-700 focus:ring-red-400/40',
              disabled && 'opacity-50',
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-800">{error}</p>}
    </div>
  )
}
