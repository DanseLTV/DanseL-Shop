import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Package,
  CreditCard,
  Upload,
  CheckCircle,
  ArrowLeft,
  Send,
  ListOrdered,
} from 'lucide-react'
import { products, getProductById, formatPrice } from '../data/products'
import type { PaymentMethod } from '../types'
import { enabledPaymentMethods, shopPayments } from '../data/shopPayments'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadPaymentProof, validateProofFile } from '../utils/orderProof'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GradientButton } from '../components/ui/GradientButton'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { PaymentInstructions } from '../components/order/PaymentInstructions'

export function OrderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedId = searchParams.get('product') || ''
  const { user, profile } = useAuth()

  const customerName = profile?.username ? `@${profile.username}` : ''
  const customerEmail = user?.email ?? ''
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const defaultMethod: PaymentMethod | '' = enabledPaymentMethods.includes(shopPayments.defaultMethod)
    ? shopPayments.defaultMethod
    : enabledPaymentMethods[0] ?? ''

  const [form, setForm] = useState({
    productId: preselectedId,
    paymentMethod: defaultMethod,
    notes: '',
    proofFile: null as File | null,
  })

  const selectedProduct = form.productId ? getProductById(form.productId) : null

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

    if (!supabase || !user) {
      setSubmitError('Please sign in to place an order.')
      return
    }
    if (!selectedProduct) {
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

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        amount: selectedProduct.price,
        payment_method: form.paymentMethod,
        notes: form.notes || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error || !data) {
      setSubmitError(error?.message ?? 'Could not save order. Please try again.')
      setSubmitting(false)
      return
    }

    const orderId = data.id
    const { url: proofUrl, error: proofError } = await uploadPaymentProof(
      form.proofFile,
      user.id,
      orderId
    )

    if (proofUrl) {
      await supabase.from('orders').update({ proof_url: proofUrl }).eq('id', orderId)
    }

    const proofNote = proofUrl
      ? 'Payment proof uploaded.'
      : proofError
        ? `Payment proof upload failed (${proofError}) — please send screenshot in chat.`
        : ''

    await supabase.from('order_messages').insert({
      order_id: orderId,
      sender_id: user.id,
      sender_role: 'customer',
      body: [
        `New order: ${selectedProduct.name}`,
        `Payment: ${form.paymentMethod}`,
        `Amount: ${formatPrice(selectedProduct.price)}`,
        proofNote,
        form.notes ? `Notes: ${form.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    })

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => navigate(`/orders/${orderId}`), 2000)
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors focus:border-accent-violet/50 focus:outline-none focus:ring-1 focus:ring-accent-violet/30'

  const labelClass = 'mb-2 block text-sm font-medium text-white/80'

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-2xl px-4 pb-20 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-accent-violet"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <ScrollReveal>
          <SectionHeading
            badge="Checkout"
            title="Place Your Order"
            subtitle="Select product, pay, upload proof, then message admin here on the site."
            align="left"
          />
        </ScrollReveal>

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
                Order Submitted!
              </h3>
              <p className="mt-3 text-white/60">
                Thank you, {customerName}! We've received your order
                {selectedProduct && ` for ${selectedProduct.name}`}. Admin will
                verify your payment and message you in My Orders within 15–60 minutes.
              </p>
              <p className="mt-4 text-sm text-white/50">
                Taking you to <strong className="text-white">My Orders</strong> to chat with
                admin…
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <GradientButton to="/orders">
                  <Send className="h-4 w-4" />
                  Open Messages
                </GradientButton>
                <GradientButton to="/" variant="outline">
                  Continue Shopping
                </GradientButton>
              </div>
            </motion.div>
          ) : (
            <>
              <ScrollReveal delay={0.05}>
                <div className="glass-card mb-6 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-accent-violet" />
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
                  <p className="mt-3 text-xs text-white/40">
                    Update details in{' '}
                    <Link to="/account" className="text-accent-violet hover:underline">
                      My Account
                    </Link>
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <div className="glass-card mb-6 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-accent-violet" />
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
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-midnight-900">
                        {p.name} — {formatPrice(p.price)} / {p.duration}
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="mt-3 rounded-xl border border-accent-violet/20 bg-accent-violet/5 p-4">
                      <p className="text-sm text-white/70">
                        {selectedProduct.description}
                      </p>
                      <p className="mt-2 font-display text-xl font-bold text-white">
                        Total: {formatPrice(selectedProduct.price)}
                      </p>
                    </div>
                  )}
                </div>

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
                    amount={selectedProduct?.price}
                    productName={selectedProduct?.name}
                  />
                )}

                <div>
                  <label className={labelClass}>
                    <Upload className="mr-1 inline h-4 w-4" />
                    Proof of Payment *
                  </label>
                  <div className="relative rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition-colors hover:border-accent-violet/30">
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
                        : 'Upload screenshot of your payment'}
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      PNG, JPG, or PDF — max 5MB
                    </p>
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

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/40">
                  By submitting, you agree to our{' '}
                  <Link to="/policies" className="text-accent-violet hover:underline">
                    Terms & Policies
                  </Link>
                  . After submitting, you can chat with admin in My Orders inside the website.
                </div>

                <GradientButton type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Order'}
                </GradientButton>
              </motion.form>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
