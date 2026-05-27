import { Link } from 'react-router-dom'
import { User, LogOut, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GradientButton } from '../components/ui/GradientButton'
import { GlassCard } from '../components/ui/GlassCard'
import { useOrderNavigation } from '../hooks/useOrderNavigation'

export function AccountPage() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const goToOrder = useOrderNavigation()

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-lg px-4 pb-20 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            badge="Account"
            title="My Profile"
            subtitle="Your saved details are used automatically when you order."
            align="left"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <GlassCard className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  @{profile?.username ?? 'customer'}
                </p>
                <p className="text-sm text-white/50">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <GradientButton onClick={() => goToOrder()}>
                <ShoppingBag className="h-4 w-4" />
                Place New Order
              </GradientButton>
              {isAdmin && (
                <GradientButton to="/admin" variant="outline">
                  Admin Dashboard
                </GradientButton>
              )}
              <GradientButton onClick={() => signOut()} variant="outline">
                <LogOut className="h-4 w-4" />
                Sign Out
              </GradientButton>
            </div>
          </GlassCard>
        </ScrollReveal>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link to="/shop" className="text-accent-violet hover:underline">
            ← Back to shop
          </Link>
        </p>
      </div>
    </div>
  )
}
