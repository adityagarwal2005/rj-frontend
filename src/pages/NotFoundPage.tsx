import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'

export function NotFoundPage() {
  useDocumentTitle('Page Not Found', { noindex: true })

  return (
    <div className="bg-heritage-glow">
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <p className="font-display text-[120px] italic leading-none text-gradient-gold sm:text-[168px]">404</p>
        <div className="hairline-gold mt-2 w-48" aria-hidden="true" />
        <h1 className="mt-7 font-display text-[34px] leading-tight text-chocolate-950 sm:text-5xl">
          This page has wandered off the palace map
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-900/60">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or may have been moved. Let&rsquo;s get you back home.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={ROUTES.home} className={buttonClasses('gold', 'md')}>
            Back to Home
          </Link>
          <Link to={ROUTES.products} className={buttonClasses('outline', 'md')}>
            Shop Chocolates
          </Link>
        </div>
        <p className="mt-8 font-script text-xl text-gold-600">Padharo sa &mdash; welcome back</p>
      </Container>
    </div>
  )
}
