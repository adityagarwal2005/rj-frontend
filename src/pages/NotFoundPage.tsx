import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { PeacockFeather } from '@/components/ui/PeacockFeather'

export function NotFoundPage() {
  useDocumentTitle('Page Not Found', { noindex: true })

  return (
    <div className="relative overflow-hidden">
      <PeacockFeather
        className="pointer-events-none absolute -left-6 top-10 hidden h-56 w-auto text-gold-400/25 md:block float-slow"
        aria-hidden="true"
      />
      <PeacockFeather
        className="pointer-events-none absolute -right-6 bottom-10 hidden h-56 w-auto -scale-x-100 text-jaipur-500/20 md:block drift-slow"
        aria-hidden="true"
      />
      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="font-display text-[110px] leading-none text-gradient-gold sm:text-[160px]">404</p>
        <PaisleyDivider className="mt-4 h-4 w-64 text-gold-500/70" />
        <h1 className="mt-6 font-display text-3xl text-chocolate-950 sm:text-4xl">
          This page has wandered off the palace map
        </h1>
        <p className="mt-3 max-w-sm text-sm text-ink-900/65">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or may have been moved. Let&rsquo;s get you back home.
        </p>
        <p className="mt-6 font-script text-lg text-gold-600">Padharo sa &mdash; welcome back</p>
        <Link to={ROUTES.home} className={`${buttonClasses('gold', 'md')} mt-6`}>
          Back to Home
        </Link>
      </Container>
    </div>
  )
}
