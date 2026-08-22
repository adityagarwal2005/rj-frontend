import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { ROUTES } from '@/constants/routes'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'

export function Footer() {
  return (
    <footer className="bg-grain relative overflow-hidden border-t border-beige-200 bg-chocolate-950 text-cream-50">
      {/* Scallop top edge - a row of tiny multifoil arches instead of a
          flat rule, so the transition from the light body to the dark
          footer picks up the heritage arch language used elsewhere. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -top-px h-6 w-full text-cream-50"
      >
        <path
          d="M0 24 L 0 12 Q 24 0 48 12 Q 72 24 96 12 Q 120 0 144 12 Q 168 24 192 12 Q 216 0 240 12 Q 264 24 288 12 Q 312 0 336 12 Q 360 24 384 12 Q 408 0 432 12 Q 456 24 480 12 Q 504 0 528 12 Q 552 24 576 12 Q 600 0 624 12 Q 648 24 672 12 Q 696 0 720 12 Q 744 24 768 12 Q 792 0 816 12 Q 840 24 864 12 Q 888 0 912 12 Q 936 24 960 12 Q 984 0 1008 12 Q 1032 24 1056 12 Q 1080 0 1104 12 Q 1128 24 1152 12 Q 1176 0 1200 12 L 1200 24 Z"
          fill="currentColor"
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-6 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      {/* Ghost silhouette of Hawa Mahal along the very bottom, used as
          heritage watermark art without competing with copy above. */}
      <HawaMahalSilhouette
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-gold-300/10 [mask-image:linear-gradient(to_top,black_60%,transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-24 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="flex items-center gap-2 font-serif text-2xl font-semibold">
            Rajwadi<span className="text-gold-400">Tukda</span>
            <TurbanIcon className="h-6 w-6 text-gold-400" aria-hidden="true" />
          </p>
          <p className="mt-4 max-w-xs font-script text-lg leading-snug text-gold-300/90">
            &ldquo;A taste of Rajasthan, folded into every square.&rdquo;
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-50/60">
            Premium chocolate infused with Rajasthani flavors, handcrafted in Jaipur and delivered fresh to your door.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">Explore</h3>
          <PaisleyDivider className="mt-3 h-3 w-24 text-gold-400/70" />
          <ul className="mt-5 space-y-3 text-sm text-cream-50/70">
            <li><Link to={ROUTES.products} className="transition-colors hover:text-gold-400">Shop the Collection</Link></li>
            <li><Link to={ROUTES.about} className="transition-colors hover:text-gold-400">Our Story</Link></li>
            <li><Link to={ROUTES.contact} className="transition-colors hover:text-gold-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">Get in Touch</h3>
          <PaisleyDivider className="mt-3 h-3 w-24 text-gold-400/70" />
          <ul className="mt-5 space-y-3 text-sm text-cream-50/70">
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Bani+Park%2C+Jaipur%2C+Rajasthan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-gold-400"
              >
                <MapPin size={15} className="shrink-0 text-gold-400" /> Bani Park, Jaipur, Rajasthan
              </a>
            </li>
            <li>
              <a href="tel:+917014253541" className="flex items-center gap-2.5 transition-colors hover:text-gold-400">
                <Phone size={15} className="shrink-0 text-gold-400" /> +91 70142 53541
              </a>
            </li>
            <li>
              <a href="mailto:hello@rajwaditukda.com" className="flex items-center gap-2.5 transition-colors hover:text-gold-400">
                <Mail size={15} className="shrink-0 text-gold-400" /> hello@rajwaditukda.com
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/rajwaditukda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-gold-400"
              >
                <InstagramIcon size={15} className="shrink-0 text-gold-400" /> @rajwaditukda
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 border-t border-cream-50/10 px-4 py-6 text-center text-[11px] uppercase tracking-[0.12em] text-cream-50/40 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span>&copy; {new Date().getFullYear()} RajwadiTukda &middot; Crafted in Jaipur</span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <Link to={ROUTES.privacyPolicy} className="transition-colors hover:text-gold-400">
            Privacy Policy
          </Link>
          <Link to={ROUTES.terms} className="transition-colors hover:text-gold-400">
            Terms of Service
          </Link>
          <Link to={ROUTES.refundPolicy} className="transition-colors hover:text-gold-400">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
