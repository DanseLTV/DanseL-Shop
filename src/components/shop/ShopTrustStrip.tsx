import { Shield, Zap, MessageCircle, BadgeCheck } from 'lucide-react'

const items = [
  { icon: BadgeCheck, label: 'Verified access', sub: 'Tested before delivery' },
  { icon: Zap, label: '15–60 min delivery', sub: 'After payment verified' },
  { icon: MessageCircle, label: 'In-site chat', sub: 'Track orders & message admin' },
  { icon: Shield, label: 'Replacement guarantee', sub: 'Within warranty period' },
]

export function ShopTrustStrip() {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-violet/15">
            <item.icon className="h-5 w-5 text-accent-violet" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="text-xs text-white/45">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
