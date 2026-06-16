const MANILA_TZ = 'Asia/Manila'

/** Revenue counts once payment is verified or order is delivered. */
export const REVENUE_STATUSES = ['paid', 'delivered'] as const

export type RevenueStatus = (typeof REVENUE_STATUSES)[number]

export interface OrderFinanceRow {
  product_id: string
  amount: number
  status: string
  created_at: string
}

export interface RevenueSummary {
  today: number
  thisMonth: number
  allTime: number
  pending: number
  orderCountToday: number
  orderCountAllTime: number
}

export interface CapitalSpentSummary {
  today: number
  allTime: number
}

export interface ProductCapitalRow {
  id: string
  name: string
  price: number
  capital_cost: number
}

function manilaDateKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-CA', { timeZone: MANILA_TZ })
}

function manilaMonthKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-CA', { timeZone: MANILA_TZ, year: 'numeric', month: '2-digit' })
}

function isRevenueOrder(status: string): boolean {
  return REVENUE_STATUSES.includes(status as RevenueStatus)
}

export function summarizeRevenue(orders: OrderFinanceRow[]): RevenueSummary {
  const todayKey = manilaDateKey(new Date())
  const monthKey = manilaMonthKey(new Date())

  let today = 0
  let thisMonth = 0
  let allTime = 0
  let pending = 0
  let orderCountToday = 0
  let orderCountAllTime = 0

  for (const order of orders) {
    const amount = Number(order.amount) || 0
    if (order.status === 'pending') {
      pending += amount
      continue
    }
    if (!isRevenueOrder(order.status)) continue

    allTime += amount
    orderCountAllTime += 1

    if (manilaDateKey(order.created_at) === todayKey) {
      today += amount
      orderCountToday += 1
    }
    if (manilaMonthKey(order.created_at) === monthKey) {
      thisMonth += amount
    }
  }

  return {
    today,
    thisMonth,
    allTime,
    pending,
    orderCountToday,
    orderCountAllTime,
  }
}

export function summarizeCapitalSpent(
  orders: OrderFinanceRow[],
  capitalByProduct: Record<string, number>
): CapitalSpentSummary {
  const todayKey = manilaDateKey(new Date())
  let today = 0
  let allTime = 0

  for (const order of orders) {
    if (!isRevenueOrder(order.status)) continue
    const unitCost = Number(capitalByProduct[order.product_id] ?? 0) || 0
    allTime += unitCost
    if (manilaDateKey(order.created_at) === todayKey) {
      today += unitCost
    }
  }

  return { today, allTime }
}

export function netProfit(revenue: number, capitalSpent: number): number {
  return revenue - capitalSpent
}

export function totalConfiguredCapital(products: ProductCapitalRow[]): number {
  return products.reduce((sum, p) => sum + (Number(p.capital_cost) || 0), 0)
}

const PRODUCT_CAPITAL_STORAGE_KEY = 'dansel-product-capital'

export function readProductCapitalLocal(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PRODUCT_CAPITAL_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Record<string, number> = {}
    for (const [id, value] of Object.entries(parsed)) {
      const n = Number(value)
      if (Number.isFinite(n) && n >= 0) out[id] = n
    }
    return out
  } catch {
    return {}
  }
}

export function writeProductCapitalLocal(map: Record<string, number>): void {
  try {
    localStorage.setItem(PRODUCT_CAPITAL_STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}
