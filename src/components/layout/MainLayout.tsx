import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Spinner } from '@/components/ui/Spinner'
import { trackPageView } from '@/utils/analytics'
import { recordPageView } from '@/services/analyticsService'

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  )
}

export function MainLayout() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
    recordPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* keyed by pathname so react re-mounts the tree on route change,
          which re-runs the .page-in animation for a gentle fade-in on
          every navigation without any per-page setup. */}
      <main key={location.pathname} className="page-in flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
