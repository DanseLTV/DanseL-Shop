import { useState } from 'react'
import {
  User,
  LogOut,
  ShoppingBag,
  MessageCircle,
  Trash2,
  Shield,
  FileText,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLogoutConfirm } from '../hooks/useLogoutConfirm'
import { LogoutConfirmModal } from '../components/auth/LogoutConfirmModal'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GradientButton } from '../components/ui/GradientButton'
import { GlassCard } from '../components/ui/GlassCard'
import { BackNavLink } from '../components/ui/BackNavLink'
import { DeleteAccountModal } from '../components/account/DeleteAccountModal'
import { AccountNavRow } from '../components/account/AccountNavRow'
import { useOrderNavigation } from '../hooks/useOrderNavigation'
export function AccountPage() {
  const { user, profile, isAdmin } = useAuth()
  const { logoutConfirmOpen, requestLogout, cancelLogout, confirmLogout } = useLogoutConfirm()
  const goToOrder = useOrderNavigation()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const username = profile?.username ?? 'customer'
  const displayName = profile?.username ?? 'customer'

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-lg px-4 pb-24 sm:px-6">
        <BackNavLink to="/shop" label="Back to home" className="mb-5" />

        <ScrollReveal>
          <SectionHeading
            badge="Account"
            title="My Profile"
            subtitle="Your saved details are used automatically when you order."
            align="left"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <GlassCard className="mt-6 overflow-hidden">
            <div className="flex items-center gap-4 border-b border-white/10 bg-gradient-to-br from-brand/15 via-white/[0.02] to-brand-bright/10 px-5 py-5 sm:px-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-bright shadow-lg shadow-brand/20">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-semibold text-white">
                  @{displayName}
                </p>
                <p className="mt-0.5 truncate text-sm text-white/55">{user?.email}</p>
                {isAdmin && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5">
              <GradientButton to="/orders" className="w-full">
                <MessageCircle className="h-4 w-4" />
                My Orders & Messages
              </GradientButton>

              <AccountNavRow
                to="/shop"
                icon={ShoppingBag}
                title="Browse Shop"
                subtitle="View all products"
              />
              <AccountNavRow
                icon={ShoppingBag}
                title="Place New Order"
                subtitle="Go to checkout"
                onClick={() => goToOrder()}
              />
              <AccountNavRow
                to="/policies"
                icon={FileText}
                title="Policies & FAQ"
                subtitle="Terms, refunds, and guarantees"
              />

              {isAdmin && (
                <AccountNavRow
                  to="/admin"
                  icon={Shield}
                  title="Admin Dashboard"
                  subtitle="Manage orders and messages"
                  iconClassName="text-brand"
                />
              )}
            </div>

            <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={requestLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </GlassCard>
        </ScrollReveal>

        {!isAdmin && (
          <ScrollReveal delay={0.12}>
            <GlassCard className="mt-5 border border-red-500/20 p-5 sm:p-6">
              <h3 className="font-display text-base font-semibold text-red-300">Danger zone</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                Permanently delete your account, profile, and order history. Type your username to
                confirm.
              </p>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            </GlassCard>
          </ScrollReveal>
        )}

        <DeleteAccountModal
          open={deleteModalOpen}
          username={username}
          onClose={() => setDeleteModalOpen(false)}
        />
        <LogoutConfirmModal
          open={logoutConfirmOpen}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
          placement="center"
        />
      </div>
    </div>
  )
}
