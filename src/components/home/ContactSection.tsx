import { Mail, MessageCircle, Send, Clock, Phone } from 'lucide-react'
import { shopContact } from '../../data/shopContact'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GlassCard } from '../ui/GlassCard'
import { OrderButton } from '../auth/OrderButton'

function buildContactCards() {
  const cards = [
    {
      icon: Mail,
      title: 'Email',
      value: shopContact.email,
      href: `mailto:${shopContact.email}`,
      description: 'For orders & support',
    },
    {
      icon: Send,
      title: 'Telegram',
      value: shopContact.telegramUsername,
      href: shopContact.telegramUrl,
      description: 'Fastest reply — recommended',
    },
    {
      icon: Clock,
      title: 'Hours',
      value: shopContact.hours,
      href: undefined,
      description: 'Philippine Time',
    },
  ]

  if (shopContact.messengerEnabled && shopContact.messengerUrl) {
    cards.splice(1, 0, {
      icon: MessageCircle,
      title: 'Messenger',
      value: shopContact.messengerLabel,
      href: shopContact.messengerUrl,
      description: 'Facebook Messenger',
    })
  }

  return cards
}

export function ContactSection() {
  const contactCards = buildContactCards()

  return (
    <section id="contact" className="section-padding relative">
      <div className="absolute inset-0 mesh-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Contact"
            title="Get in Touch"
            subtitle={shopContact.tagline}
          />
        </ScrollReveal>

        <div
          className={`grid gap-4 sm:grid-cols-2 ${
            contactCards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          }`}
        >
          {contactCards.map((card, i) => {
            const Icon = card.icon
            const content = (
              <GlassCard hover className="h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/20">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  {card.description}
                </p>
                <h3 className="mt-1 font-display font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{card.value}</p>
              </GlassCard>
            )

            return (
              <ScrollReveal key={card.title} delay={i * 0.08}>
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </ScrollReveal>
            )
          })}
        </div>

        {shopContact.phone && (
          <ScrollReveal delay={0.2}>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50">
              <Phone className="h-4 w-4" />
              {shopContact.phone}
            </p>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.25}>
          <div className="mt-10 text-center">
            <OrderButton size="lg">
              Place an Order
            </OrderButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
