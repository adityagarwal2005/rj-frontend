import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Heart, MapPin, Menu, Package, Sparkles, Truck, User, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useScrolled } from '@/hooks/useScrolled'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { buttonClasses } from '@/components/ui/Button'
import { CartButton } from './CartButton'
import { UserMenu } from './UserMenu'

const NAV_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Shop', to: ROUTES.products },
  { label: 'About', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
]

const ACCOUNT_LINKS = [
  { label: 'My Profile', to: ROUTES.profile, icon: User },
  { label: 'My Orders', to: ROUTES.orders, icon: Package },
  { label: 'My Wishlist', to: ROUTES.wishlist, icon: Heart },
  { label: 'Address Book', to: ROUTES.addresses, icon: MapPin },
  { label: 'Notifications', to: ROUTES.notifications, icon: Bell },
]

// Repeated inside the marquee to make the scroll seamless. Kept intentionally
// short so the loop reads as a heritage motto strip, not a promo blast.
const ANNOUNCEMENTS = [
  { icon: Sparkles, text: 'Handcrafted in Jaipur — small batches, royal recipes' },
  { icon: Truck, text: 'Same-day delivery across the Pink City' },
  { icon: Sparkles, text: '5% off orders over ₹800, automatically' },
  { icon: Truck, text: 'Made fresh to order, never off-the-shelf' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const isScrolled = useScrolled()

  async function handleLogout() {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-cream-50/85 backdrop-blur-md transition-shadow duration-300',
        isScrolled ? 'border-beige-300 shadow-[0_1px_0_0_rgba(36,22,16,0.04),0_12px_24px_-16px_rgba(36,22,16,0.15)]' : 'border-transparent',
      )}
    >
      {/* Royal announcement strip - dark chocolate with a gold/pink hairline
          above and below. Hides on scroll so the header stays compact.
          A duplicated track supplies the seamless marquee loop; each half
          is aria-hidden after the first so screen readers hear it once. */}
      <div
        className={cn(
          'relative overflow-hidden bg-chocolate-950 text-cream-50/80 transition-[max-height,opacity] duration-300',
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-9 opacity-100',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-jaipur-500/40 to-transparent" />
        <div className="marquee-track py-2 text-[10.5px] font-medium uppercase tracking-[0.24em]">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center gap-10 px-6" aria-hidden={half === 1}>
              {ANNOUNCEMENTS.map(({ icon: Icon, text }, i) => (
                <span key={`${half}-${i}`} className="flex items-center gap-2">
                  <Icon size={12} className="text-gold-400" />
                  <span>{text}</span>
                  <span className="mx-4 text-gold-500/50">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-300 sm:px-6 lg:px-8',
          isScrolled ? 'h-16' : 'h-20',
        )}
      >
        <Link
          to={ROUTES.home}
          className="group flex items-center gap-2.5 text-chocolate-950"
          aria-label="RajwadiTukda home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 bg-gradient-to-br from-cream-50 to-beige-200 text-gold-600 shadow-[0_2px_10px_-4px_rgba(175,138,72,0.4)] transition-transform duration-500 group-hover:rotate-[8deg]">
            <TurbanIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[22px] font-semibold tracking-tight">
              Rajwadi<span className="text-gold-500">Tukda</span>
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-ink-900/50">
              Chocolate of the Pink City
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'group relative py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
                  isActive ? 'text-gold-600' : 'text-chocolate-900 hover:text-gold-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-500 to-transparent transition-all duration-500 ease-out',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center md:flex">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-4">
                <Link to={ROUTES.login} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chocolate-900 hover:text-gold-600">
                  Login
                </Link>
                <Link to={ROUTES.register} className={buttonClasses('primary', 'sm')}>
                  Register
                </Link>
              </div>
            )}
          </div>

          <CartButton />

          <button
            type="button"
            className="rounded-full p-2 hover:bg-beige-200 md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-beige-200 bg-cream-50 shadow-[0_12px_24px_-16px_rgba(36,22,16,0.25)] md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-4 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === ROUTES.home}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-chocolate-900"
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="border-beige-200" />
              {isAuthenticated ? (
                <>
                  {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-chocolate-900"
                    >
                      <Icon size={16} className="text-gold-600" /> {label}
                    </Link>
                  ))}
                  <hr className="border-beige-200" />
                  <button type="button" onClick={handleLogout} className="text-left text-sm font-medium text-red-800">
                    Logout ({user?.full_name.split(' ')[0]})
                  </button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.login} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-chocolate-900">
                    Login
                  </Link>
                  <Link to={ROUTES.register} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-chocolate-900">
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
