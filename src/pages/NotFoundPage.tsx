import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'

export function NotFoundPage() {
  useDocumentTitle('Page Not Found')

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-7xl text-gold-500">404</p>
      <h1 className="mt-4 font-serif text-2xl text-chocolate-950">This page has wandered off</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-900/70">
        The page you're looking for doesn't exist, or may have been moved.
      </p>
      <Link to={ROUTES.home} className={`${buttonClasses('gold', 'md')} mt-6`}>
        Back to Home
      </Link>
    </Container>
  )
}
