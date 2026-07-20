import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { TurbanIcon } from '@/components/ui/TurbanIcon'

export function Footer() {
  return (
    <footer className="bg-grain relative border-t border-beige-200 bg-chocolate-950 text-cream-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="flex items-center gap-2 font-serif text-2xl font-semibold">
            Rajwadi<span className="text-gold-400">Tukda</span>
            <TurbanIcon className="h-6 w-6 text-gold-400" aria-hidden="true" />
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-50/60">
            Premium chocolate infused with Rajasthani flavors, handcrafted and delivered fresh to your door.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm text-cream-50/70">
            <li><Link to={ROUTES.products} className="transition-colors hover:text-gold-400">Shop</Link></li>
            <li><Link to={ROUTES.about} className="transition-colors hover:text-gold-400">About Us</Link></li>
            <li><Link to={ROUTES.contact} className="transition-colors hover:text-gold-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Get in touch</h3>
          <ul className="mt-5 space-y-3 text-sm text-cream-50/70">
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="shrink-0 text-gold-400" /> Jaipur, Rajasthan, India
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-gold-400" /> +91 90000 00000
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0 text-gold-400" /> hello@rajwaditukda.com
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-cream-50/10 px-4 py-6 text-center text-[11px] uppercase tracking-[0.12em] text-cream-50/40">
        &copy; {new Date().getFullYear()} RajwadiTukda. All rights reserved.
      </div>
    </footer>
  )
}
