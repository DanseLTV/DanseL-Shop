import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { shopContact } from '../../data/shopContact'

const footerLinks = {
  shop: [
    { label: 'All Products', to: '/' },
    { label: 'Streaming', to: '/shop?category=Streaming' },
    { label: 'AI Tools', to: '/shop?category=AI Tools' },
    { label: 'Writing Tools', to: '/shop?category=Writing Tools' },
  ],
  support: [
    { label: 'FAQ', to: '/home#faq' },
    { label: 'Reviews', to: '/home#reviews' },
    { label: 'How to Order', to: '/home#how-to-order' },
    { label: 'Contact', to: '/home#contact' },
  ],
  legal: [
    { label: 'Policies', to: '/policies' },
    { label: 'Replacement Policy', to: '/policies#replacement' },
    { label: 'Refund Policy', to: '/policies#refund' },
    { label: 'Terms of Service', to: '/policies#terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-midnight-900">
      <div className="absolute inset-0 mesh-bg opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan">
                <span className="font-display text-sm font-bold">D</span>
              </div>
              <span className="font-display text-lg font-bold tracking-wider">
                DANSEL <span className="gradient-text">SHOP</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Premium authorized digital accounts and subscription access. Trusted,
              affordable, and delivered fast.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/60">
              <a
                href={`mailto:${shopContact.email}`}
                className="flex items-center gap-2 transition-colors hover:text-accent-violet"
              >
                <Mail className="h-4 w-4" />
                {shopContact.email}
              </a>
              {shopContact.messengerEnabled && shopContact.messengerUrl && (
                <a
                  href={shopContact.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-accent-violet"
                >
                  <MessageCircle className="h-4 w-4" />
                  Messenger
                </a>
              )}
              <a
                href={shopContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-accent-violet"
              >
                <Send className="h-4 w-4" />
                {shopContact.telegramUsername}
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/50 transition-colors hover:text-accent-violet"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/50 transition-colors hover:text-accent-violet"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/50 transition-colors hover:text-accent-violet"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-white/40">
              Business Hours: {shopContact.hours}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} DANSEL SHOP. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Premium digital access · Authorized subscriptions · Fast delivery
          </p>
        </div>
      </div>
    </footer>
  )
}
