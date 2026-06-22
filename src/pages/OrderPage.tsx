import { useMemo, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Package,
  CreditCard,
  Upload,
  CheckCircle,
  Send,
  ListOrdered,
  ShoppingCart,
} from 'lucide-react'
import { formatPrice } from '../data/products'
import type { PaymentMethod, Product } from '../types'
import { enabledPaymentMethods, shopPayments } from '../data/shopPayments'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { validateProofFile } from '../utils/orderProof'
import { submitCartOrder, submitOrder } from '../utils/orderSubmit'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { CustomerPageHeader } from '../components/layout/CustomerPageHeader'
import { CheckoutSteps } from '../components/order/CheckoutSteps'
import { PaymentInstructions } from '../components/order/PaymentInstructions'
import { ProductImage } from '../components/shop/ProductImage'
import { useProducts } from '../hooks/useProducts'

export function OrderPage() {
  const { products: liveProducts } = useProducts()
  const { items: cartItems, clearCart } = useCart()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedId = searchParams.get('product') || ''
  const cartMode = searchParams.get('cart') === '1'
  const { user, profile } = useAuth()

  const customerName = profile?.username ? `@${profile.username}` : ''
  const customerEmail = user?.email ?? ''
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitWarnings, setSubmitWarnings] = useState<string[]>([])
  const [submittedOrderCount, setSubmittedOrderCount] = useState(1)
  const defaultMethod: PaymentMethod | '' = enabledPaymentMethods.includes(shopPayments.defaultMethod)
    ? shopPayments.defaultMethod
    : enabledPaymentMethods[0] ?? ''

  const [form, setForm] = useState({
    productId: preselectedId,
    paymentMethod: defaultMethod,
    notes: '',
    proofFile: null as File | null,
  })

  const cartLines = useMemo(() => {
    return cartItems
      .map((line) => {
        const product = liveProducts.find((p) => p.id === line.productId)
        if (!product) return null
        return { line, product }
      })
      .filter((row): row is { line: (typeof cartItems)[number]; product: Product } => row !== null)
  }, [cartItems, liveProducts])

  const cartTotal = cartLines.reduce(
    (sum, { line, product }) => sum + product.price * line.quantity,
    0
  )
  const cartHasUnavailable = cartLines.some(({ product }) => product.availability === 'Out of Stock')

  const selectedProduct = !cartMode && form.productId
    ? liveProducts.find((p) => p.id === form.productId) ?? null
    : null

  const checkoutTotal = cartMode ? cartTotal : selectedProduct?.price ?? 0
  const checkoutItemSummary = cartMode
    ? `${cartLines.length} product${cartLines.length !== 1 ? 's' : ''} · ${cartLines.reduce((n, { line }) => n + line.quantity, 0)} items`
    : selectedProduct?.name

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, proofFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitWarnings([])

    if (!user) {
      setSubmitError('Please sign in to place an order.')
      return
    }

    if (cartMode) {
      if (cartLines.length === 0) {
        setSubmitError('Your cart is empty. Add products first.')
        return
      }
      if (cartHasUnavailable) {
        setSubmitError('Remove out-of-stock items from your cart before checkout.')
        return
      }
    } else if (!selectedProduct) {
      setSubmitError('Please select a product.')
      return
    }

    if (!form.paymentMethod) {
      setSubmitError('Please select a payment method.')
      return
    }
    if (!form.proofFile) {
      setSubmitError('Please upload your payment proof screenshot.')
      return
    }

    const proofValidation = validateProofFile(form.proofFile)
    if (proofValidation) {
      setSubmitError(proofValidation)
      return
    }

    setSubmitting(true)
    try {
      const result = cartMode
        ? await submitCartOrder({
            userId: user.id,
            customerUsername: profile?.username,
            lines: cartLines.map(({ line, product }) => ({
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity: line.quantity,
            })),
            paymentMethod: form.paymentMethod,
            notes: form.notes,
            proofFile: form.proofFile,
          })
        : await submitOrder({
            userId: user.id,
            customerUsername: profile?.username,
            productId: selectedProduct!.id,
            productName: selectedProduct!.name,
            amount: selectedProduct!.price,
            paymentMethod: form.paymentMethod,
            notes: form.notes,
            proofFile: form.proofFile,
          })

      if (result.error || !result.orderId) {
        setSubmitError(result.error ?? 'Could not save order. Please try again.')
        if (result.warnings.length > 0) setSubmitWarnings(result.warnings)
        return
      }

      if (result.warnings.length > 0) {
        setSubmitWarnings(result.warnings)
      }

      if (cartMode) {
        clearCart()
        setSubmittedOrderCount(result.orderIds?.length ?? cartLines.length)
      } else {
        setSubmittedOrderCount(1)
      }

      setSubmitted(true)
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Order submit failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30'

  const labelClass = 'mb-2 block text-sm font-medium text-white/80'

  const hasCheckoutItems = cartMode ? cartLines.length > 0 : Boolean(selectedProduct)
  const checkoutStep: 1 | 2 | 3 = !hasCheckoutItems
    ? 1
    : !form.paymentMethod
      ? 2
      : 3

  return (
    <div className="relative min-h-screen pt-20">
      <div className="relative mx-auto max-w-2xl px-4 pb-20 sm:px-6 lg:px-8">
        <CustomerPageHeader
          backTo={cartMode ? '/cart' : '/shop'}
          backLabel={cartMode ? 'Back to cart' : 'Back to home'}
          badge="Checkout"
          title={cartMode ? 'Checkout your cart' : 'Place your order'}
          subtitle={
            cartMode
              ? 'Review items, pay once, upload one proof — each product becomes its own order in My Orders.'
              : 'Select product, pay, upload proof, then chat with admin in My Orders.'
          }
        />

        {!submitted && <CheckoutSteps activeStep={checkoutStep} />}

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {submittedOrderCount > 1 ? 'Orders Submitted!' : 'Order Submitted!'}
              </h3>
              <p className="mt-3 text-white/60">
                Thank you, {customerName}! We&apos;ve received{' '}
                {submittedOrderCount > 1
                  ? `${submittedOrderCount} orders from your cart`
                  : selectedProduct
                    ? `your order for ${selectedProduct.name}`
                    : 'your order'}
                . Admin will verify your payment and message you in My Orders within 15–60 minutes.
              </p>
              {submitWarnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-200">
                  {submitWarnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm text-white/50">
                Taking you to <strong className="text-white">My Orders</strong>…
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <GradientButton to="/orders">
                  <Send className="h-4 w-4" />
                  Open My Orders
                </GradientButton>
                <GradientButton to="/shop" variant="outline">
                  Continue Shopping
                </GradientButton>
              </div>
            </motion.div>
          ) : (
            <>
              <ScrollReveal delay={0.05}>
                <div className="glass-card mb-6 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-brand" />
                    <h3 className="font-display font-semibold text-white">Ordering as</h3>
                  </div>
                  <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white/40" />
                      {customerName}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/40" />
                      {customerEmail}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <div className="glass-card mb-6 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-brand" />
                    <h3 className="font-display font-semibold text-white">How to pay</h3>
                  </div>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-white/60">
                    {shopPayments.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </ScrollReveal>

              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="glass-card space-y-6 p-6 sm:p-8"
              >
                {submitError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {submitError}
                  </p>
                )}

                {cartMode ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className={labelClass}>
                        <ShoppingCart className="mr-1 inline h-4 w-4" />
                        Cart items *
                      </label>
                      <Link to="/cart" className="text-xs text-brand hover:underline">
                        Edit cart
                      </Link>
                    </div>

                    {cartLines.length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
                        Your cart is empty.{' '}
                        <Link to="/shop" className="text-brand hover:underline">
                          Browse products
                        </Link>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {cartLines.map(({ line, product }) => (
                          <li
                            key={product.id}
                            className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                              <ProductImage product={product} className="h-full w-full" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-caption">
                                Qty {line.quantity} · {formatPrice(product.price)} each
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-white">
                              {formatPrice(product.price * line.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {cartLines.length > 0 && (
                      <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Grand total</span>
                          <p className="font-display text-xl font-bold text-white">
                            {formatPrice(cartTotal)}
                          </p>
                        </div>
                      </div>
                    )}

                    {cartHasUnavailable && (
                      <p className="mt-3 text-sm text-status-error">
                        Some items are out of stock — update your cart before paying.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="productId" className={labelClass}>
                      <Package className="mr-1 inline h-4 w-4" />
                      Select Product *
                    </label>
                    <select
                      id="productId"
                      name="productId"
                      required
                      value={form.productId}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="" className="bg-midnight-900">
                        Choose a product...
                      </option>
                      {liveProducts.map((p) => (
                        <option key={p.id} value={p.id} className="bg-midnight-900">
                          {p.name} — {formatPrice(p.price)} / {p.duration}
                        </option>
                      ))}
                    </select>
                    {selectedProduct && (
                      <div className="mt-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <p className="text-sm text-white/70">{selectedProduct.description}</p>
                        <p className="mt-2 font-display text-xl font-bold text-white">
                          Total: {formatPrice(selectedProduct.price)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="paymentMethod" className={labelClass}>
                    <CreditCard className="mr-1 inline h-4 w-4" />
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className="bg-midnight-900">
                      Select payment method...
                    </option>
                    {enabledPaymentMethods.map((method) => (
                      <option key={method} value={method} className="bg-midnight-900">
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {form.paymentMethod && (
                  <PaymentInstructions
                    method={form.paymentMethod}
                    amount={checkoutTotal}
                    productName={checkoutItemSummary}
                  />
                )}

                <div>
                  <label className={labelClass}>
                    <Upload className="mr-1 inline h-4 w-4" />
                    Proof of Payment *
                  </label>
                  <div className="relative rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition-colors hover:border-brand/30">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={handleFileChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <Upload className="mx-auto h-8 w-8 text-white/30" />
                    <p className="mt-2 text-sm text-white/50">
                      {form.proofFile
                        ? form.proofFile.name
                        : cartMode
                          ? 'Upload one screenshot for the full cart total'
                          : 'Upload screenshot of your payment'}
                    </p>
                    <p className="mt-1 text-xs text-white/30">PNG, JPG, or PDF — max 5MB</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className={labelClass}>
                    Additional Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special requests..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <GradientButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    submitting ||
                    (cartMode ? cartLines.length === 0 || cartHasUnavailable : !selectedProduct)
                  }
                >
                  {submitting
                    ? 'Submitting…'
                    : cartMode
                      ? `Submit ${cartLines.length} order${cartLines.length !== 1 ? 's' : ''}`
                      : 'Submit Order'}
                </GradientButton>
              </motion.form>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
