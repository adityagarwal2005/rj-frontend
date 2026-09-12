import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronRight, Heart, MapPin, Menu, Package, User, X } from 'lucide-react'
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
  { label: 'Our Story', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
]

const ACCOUNT_LINKS = [
  { label: 'Profile', to: ROUTES.profile, icon: User },
  { label: 'Orders', to: ROUTES.orders, icon: Package },
  { label: 'Wishlist', to: ROUTES.wishlist, icon: Heart },
  { label: 'Addresses', to: ROUTES.addresses, icon: MapPin },
  { label: 'Notifications', to: ROUTES.notifications, icon: Bell },
]

// A static line rather than the old scrolling marquee: a ticker is the
// visual language of a sale, and it was the last animation running
// permanently on every page. Phones show only the first message.
const ANNOUNCEMENTS = [
  'Same-day delivery across Jaipur',
  '5% off orders over ₹800, automatically',
  'Handmade fresh in small batches',
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const isScrolled = useScrolled()

  function closeMenu() {
    setIsMenuOpen(false)
  }

  async function handleLogout() {
    await logout()
    closeMenu()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-cream-50 transition-shadow duration-300',
        isScrolled
          ? 'shadow-[0_1px_0_0_rgba(36,22,16,0.06),0_12px_30px_-20px_rgba(36,22,16,0.3)]'
          : 'shadow-[0_1px_0_0_rgba(36,22,16,0.06)]',
      )}
    >
      <div
        className={cn(
          'overflow-hidden bg-chocolate-950 text-cream-50/80 transition-[max-height,opacity] duration-300',
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
        )}
      >
        <p className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-5 px-4 text-[10px] font-medium uppercase tracking-[0.22em] sm:text-[10.5px]">
          {ANNOUNCEMENTS.map((text, index) => (
            <span key={text} className={cn('items-center gap-5', index === 0 ? 'flex' : 'hidden lg:flex')}>
              {index > 0 && (
                <span className="text-[8px] text-gold-500/70" aria-hidden="true">
                  ◆
                </span>
              )}
              {text}
            </span>
          ))}
        </p>
      </div>

      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-8',
          isScrolled ? 'h-16' : 'h-[68px] sm:h-20',
        )}
      >
        <Link to={ROUTES.home} onClick={closeMenu} className="group flex items-center gap-2.5 text-chocolate-950" aria-label="RajwadiTukda home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 bg-gradient-to-br from-cream-50 to-beige-200 text-gold-600 transition-transform duration-500 group-hover:rotate-[8deg]">
            <TurbanIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[25px] font-semibold tracking-tight">
              Rajwadi<span className="text-gold-500">Tukda</span>
            </span>
            <span className="mt-0.5 hidden text-[8.5px] font-medium uppercase tracking-[0.3em] text-ink-900/45 sm:block">
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
                  'group relative py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
                  isActive ? 'text-chocolate-950' : 'text-chocolate-900/70 hover:text-chocolate-950',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-gold-500 transition-all duration-500 ease-[var(--ease-luxe)]',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center md:flex">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  to={ROUTES.login}
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chocolate-900/70 transition-colors hover:text-chocolate-950"
                >
                  Log in
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
            className="flex h-10 w-10 items-center justify-center rounded-full text-chocolate-950 transition-colors hover:bg-beige-200/70 md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-beige-200 bg-cream-50 shadow-[0_28px_40px_-24px_rgba(36,22,16,0.4)] md:hidden"
            aria-label="Mobile"
          >
            <div className="px-5 pb-7 pt-2">
              <ul className="divide-y divide-beige-200">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === ROUTES.home}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between py-4 font-display text-[26px] leading-none',
                          isActive ? 'text-gold-600' : 'text-chocolate-950',
                        )
                      }
                    >
                      {link.label}
                      <ChevronRight size={18} className="text-gold-500" />
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isAuthenticated ? (
                  <>
                    <p className="eyebrow text-ink-900/45">Hello, {user?.full_name.split(' ')[0]}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMenu}
                          className="flex items-center gap-2.5 rounded-xl border border-beige-200 bg-white px-3.5 py-3 text-sm font-medium text-chocolate-900"
                        >
                          <Icon size={16} className="text-gold-600" /> {label}
                        </Link>
                      ))}
                    </div>
                    <button type="button" onClick={handleLogout} className="mt-5 text-sm font-medium text-red-800">
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={ROUTES.login} onClick={closeMenu} className={buttonClasses('outline', 'md')}>
                      Log in
                    </Link>
                    <Link to={ROUTES.register} onClick={closeMenu} className={buttonClasses('primary', 'md')}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
