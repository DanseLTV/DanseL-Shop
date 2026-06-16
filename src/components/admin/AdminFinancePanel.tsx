import {
  TrendingUp,
  Calendar,
  Wallet,
  PiggyBank,
  Loader2,
  RefreshCw,
  Receipt,
  Check,
} from 'lucide-react'
import { formatPrice } from '../../data/products'
import { useAdminFinance } from '../../hooks/useAdminFinance'
import { netProfit } from '../../utils/financeHelpers'

const capitalInputClass =
  'w-full min-w-[7rem] rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30 focus:outline-none'

export function AdminFinancePanel() {
  const {
    revenue,
    capitalSpent,
    products,
    capitalDrafts,
    setCapitalDraft,
    loading,
    savingProductId,
    savedProductId,
    error,
    usesDatabase,
    schemaRequired,
    reload,
  } = useAdminFinance()

  const profitToday = netProfit(revenue.today, capitalSpent.today)
  const profitAllTime = netProfit(revenue.allTime, capitalSpent.allTime)

  const revenueCards = [
    {
      icon: Calendar,
      label: "Today's revenue",
      value: revenue.today,
      sub: `${revenue.orderCountToday} order(s) · paid/delivered`,
      highlight: true,
    },
    {
      icon: TrendingUp,
      label: 'Revenue this month',
      value: revenue.thisMonth,
      sub: 'Paid & delivered orders',
    },
    {
      icon: Wallet,
      label: 'Total revenue',
      value: revenue.allTime,
      sub: `${revenue.orderCountAllTime} confirmed order(s)`,
    },
    {
      icon: Receipt,
      label: 'Pending payment',
      value: revenue.pending,
      sub: 'Not counted in revenue yet',
    },
  ]

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">Revenue & Capital</h2>
          <p className="text-caption mt-1">
            Revenue is calculated automatically · Set capital cost per product manually
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {revenueCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border px-4 py-3 ${
                  card.highlight
                    ? 'border-emerald-500/30 bg-emerald-500/[0.08]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <card.icon
                  className={`mb-2 h-5 w-5 ${card.highlight ? 'text-emerald-400' : 'text-brand-bright'}`}
                />
                <p className="text-price !text-xl sm:!text-2xl">
                  {formatPrice(card.value)}
                </p>
                <p className="text-sm font-medium tracking-tight text-white/80">{card.label}</p>
                <p className="text-caption mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand/10 to-transparent p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Net profit today
              </p>
              <p
                className={`mt-2 font-display text-3xl font-bold ${
                  profitToday >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatPrice(profitToday)}
              </p>
              <p className="mt-2 text-sm text-white/55">
                Revenue ({formatPrice(revenue.today)}) − Capital on sales (
                {formatPrice(capitalSpent.today)})
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Net profit (all time)
              </p>
              <p
                className={`mt-2 font-display text-3xl font-bold ${
                  profitAllTime >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatPrice(profitAllTime)}
              </p>
              <p className="mt-2 text-sm text-white/55">
                Total revenue ({formatPrice(revenue.allTime)}) − Capital on sales (
                {formatPrice(capitalSpent.allTime)})
              </p>
              <p className="mt-3 text-xs text-white/40">
                Capital on sales uses each product&apos;s cost × paid/delivered orders.
              </p>
            </div>
          </div>

          {/* Per-product capital */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="font-medium text-white">Capital per product</p>
                  <p className="text-xs text-white/50">
                    Type a value — saves automatically · Used to calculate profit
                  </p>
                </div>
              </div>
            </div>

            {!usesDatabase && schemaRequired && (
              <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90">
                Run{' '}
                <code className="text-amber-100">supabase/schema-shop-finance.sql</code> in the
                Supabase SQL Editor, then click <strong>Refresh</strong>. Until then, capital is
                stored only in this browser.
              </p>
            )}

            {usesDatabase && (
              <p className="mb-3 text-[11px] text-emerald-300/80">
                Capital cost saves to your Supabase database automatically.
              </p>
            )}

            {!usesDatabase && !schemaRequired && !loading && (
              <p className="mb-3 text-[11px] text-white/45">
                Using local catalog — connect Supabase and add products to sync capital to the
                database.
              </p>
            )}

            <div className="scroll-x rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-white/45">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Sell price</th>
                    <th className="px-4 py-3 font-medium">Capital cost</th>
                    <th className="px-4 py-3 font-medium">Margin</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-white/45">
                        No products found. Add products in the catalog first.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const draft = capitalDrafts[product.id] ?? String(product.capital_cost)
                      const capital = Number(draft) || 0
                      const margin = product.price - capital
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-[11px] text-white/35">{product.id}</p>
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={draft}
                              onChange={(e) => setCapitalDraft(product.id, e.target.value)}
                              aria-label={`Capital cost for ${product.name}`}
                              className={capitalInputClass}
                              placeholder="0"
                            />
                          </td>
                          <td
                            className={`px-4 py-3 font-medium ${
                              margin >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {formatPrice(margin)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {savingProductId === product.id ? (
                              <span className="inline-flex items-center gap-1 text-amber-300">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving…
                              </span>
                            ) : savedProductId === product.id ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <Check className="h-3.5 w-3.5" />
                                Saved
                              </span>
                            ) : (
                              <span className="text-white/30">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
