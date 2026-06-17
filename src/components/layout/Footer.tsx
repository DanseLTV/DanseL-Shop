import { Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import { shopContact } from '../../data/shopContact'
import { FireFooterEffect } from './FireFooterEffect'
import { BrandName } from '../ui/BrandName'

const footerLinks = {
  shop: [
    { label: 'Products', to: '/shop' },
    { label: 'Streaming', to: '/shop?category=Streaming' },
    { label: 'AI Tools', to: '/shop?category=AI Tools' },
  ],
  support: [
    { label: 'FAQ', to: '/home#faq' },
    { label: 'How to Order', to: '/home#how-to-order' },
    { label: 'Contact', to: '/home#contact' },
  ],
  legal: [
    { label: 'Policies', to: '/policies' },
    { label: 'Terms', to: '/policies#terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/10 bg-midnight-950">
      <div className="relative h-24 overflow-hidden sm:h-28">
        <FireFooterEffect />
      </div>

      <div className="relative border-t border-white/5 px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pb-6 lg:pt-5">
        {/* Mobile: compact 3-column links */}
        <div className="lg:hidden">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link to="/shop">
              <BrandName className="font-display text-sm font-bold tracking-wider" />
            </Link>
            <div className="flex items-center gap-3 text-[10px] text-white/45">
              <a href={`mailto:${shopContact.email}`} className="hover:text-amber-200">
                <Mail className="h-3.5 w-3.5" />
              </a>
              <a
                href={shopContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-200"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wider text-white/70">Shop</p>
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className="block py-0.5 text-white/45 hover:text-amber-200/90"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wider text-white/70">
                Support
              </p>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className="block py-0.5 text-white/45 hover:text-amber-200/90"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wider text-white/70">Legal</p>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className="block py-0.5 text-white/45 hover:text-amber-200/90"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-3 border-t border-white/10 pt-2 text-center text-[10px] text-white/35">
            © {new Date().getFullYear()} DANSEL SHOP
          </p>
        </div>

        {/* Desktop: full footer */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          <div>
            <Link to="/shop" className="inline-flex items-center gap-2">
              <img
                src="/shop-logo.png"
                alt="Dansel Shop logo"
                className="h-8 w-8 rounded-lg border border-white/10 object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <BrandName className="font-display text-base font-bold tracking-wider" />
            </Link>
            <p className="mt-2 text-xs text-white/50">
              Premium digital accounts · Fast delivery
            </p>
            <div className="mt-3 flex flex-col gap-1 text-xs text-white/55">
              <a
                href={`mailto:${shopContact.email}`}
                className="inline-flex items-center gap-1.5 hover:text-amber-200"
              >
                <Mail className="h-3.5 w-3.5" />
                {shopContact.email}
              </a>
              <a
                href={shopContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-amber-200"
              >
                <Send className="h-3.5 w-3.5" />
                {shopContact.telegramUsername}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              Shop
            </h4>
            <ul className="mt-2 space-y-1">
              {footerLinks.shop.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-amber-200/90">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/shop?category=Writing Tools"
                  className="text-xs text-white/50 hover:text-amber-200/90"
                >
                  Writing Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              Support
            </h4>
            <ul className="mt-2 space-y-1">
              {footerLinks.support.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-amber-200/90">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/home#reviews" className="text-xs text-white/50 hover:text-amber-200/90">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              Legal
            </h4>
            <ul className="mt-2 space-y-1">
              {footerLinks.legal.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-amber-200/90">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/policies#refund"
                  className="text-xs text-white/50 hover:text-amber-200/90"
                >
                  Refund
                </Link>
              </li>
            </ul>
            <p className="mt-2 text-[10px] text-white/35">Hours: {shopContact.hours}</p>
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-between border-t border-white/10 pt-3 lg:flex">
          <p className="text-[11px] text-white/40">© {new Date().getFullYear()} DANSEL SHOP</p>
          <p className="text-[10px] text-white/30">Authorized subscriptions · Secure checkout</p>
        </div>
      </div>
    </footer>
  )
}
