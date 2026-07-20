import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, LogOut, MapPin, Package, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications'
import { ROUTES } from '@/constants/routes'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

const MENU_LINKS = [
  { to: ROUTES.profile, icon: User, label: 'My Profile' },
  { to: ROUTES.orders, icon: Package, label: 'My Orders' },
  { to: ROUTES.addresses, icon: MapPin, label: 'Address Book' },
]

export function UserMenu() {
  const { user, logout } = useAuth()
  const unreadCount = useUnreadNotifications()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(containerRef, () => setIsOpen(false))

  async function handleLogout() {
    setIsOpen(false)
    await logout()
    navigate(ROUTES.home)
  }

  if (!user) return null

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <Link to={ROUTES.notifications} aria-label="Notifications" className="relative rounded-full p-2 hover:bg-beige-200">
        <Bell size={20} className="text-chocolate-950" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-gold-500" />
        )}
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-chocolate-900 hover:bg-beige-200"
      >
        <User size={16} /> {user.full_name.split(' ')[0]}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-beige-200 bg-cream-50 py-2 shadow-luxury"
          >
            {MENU_LINKS.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-chocolate-900 hover:bg-beige-200"
              >
                <Icon size={16} className="text-gold-600" /> {label}
              </Link>
            ))}
            <hr className="my-2 border-beige-200" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-800 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
