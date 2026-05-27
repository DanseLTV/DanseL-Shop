import type { PaymentMethod } from '../types'

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PAYMENT DETAILS — EDIT HERE (GCash / Maya / Bank)
 * ═══════════════════════════════════════════════════════════════════
 *  Ilagay ang tunay na account numbers at QR image path.
 *  Place your real QR code under `public/payments/` and update `qrImage`.
 */

export const shopPayments = {
  /** Pangalan sa GCash/Maya receipt */
  accountName: 'DANSEL SHOP',

  /** Default selected payment method on order page */
  defaultMethod: 'GCash' as PaymentMethod,

  gcash: {
    enabled: true,
    number: '09481913107',
    /** Path under /public — replace gcash-qr.svg with your real GCash QR image (png/jpg/svg). */
    qrImage: '/payments/gcash-qr.svg',
    qrCaption: 'Scan this QR in your GCash app, or send to the number below.',
  },

  maya: {
    enabled: true,
    number: '09481913107',
    qrImage: '',
    qrCaption: '',
  },

  bankTransfer: {
    enabled: false,
    bankName: '',
    accountName: 'DANSEL SHOP',
    accountNumber: '',
  },

  paypal: {
    enabled: false,
    email: '',
  },

  /** Steps na lalabas sa order page (no Telegram step) */
  steps: [
    'Choose the product and your preferred payment method (GCash is default).',
    'Scan the QR or send the exact amount to the number shown.',
    'Upload a clear screenshot of the payment as proof.',
    'Submit your order — admin will reply via in-site chat in My Orders.',
  ],
}

export function getPaymentDetails(method: PaymentMethod) {
  switch (method) {
    case 'GCash':
      return {
        title: 'GCash',
        lines: [
          `Account name: ${shopPayments.accountName}`,
          `GCash number: ${shopPayments.gcash.number}`,
        ],
        qrImage: shopPayments.gcash.qrImage,
        qrCaption: shopPayments.gcash.qrCaption,
      }
    case 'Maya':
      return {
        title: 'Maya',
        lines: [
          `Account name: ${shopPayments.accountName}`,
          `Maya number: ${shopPayments.maya.number}`,
        ],
        qrImage: shopPayments.maya.qrImage,
        qrCaption: shopPayments.maya.qrCaption,
      }
    case 'Bank Transfer':
      return {
        title: 'Bank Transfer',
        lines: shopPayments.bankTransfer.enabled
          ? [
              `Bank: ${shopPayments.bankTransfer.bankName}`,
              `Account name: ${shopPayments.bankTransfer.accountName}`,
              `Account number: ${shopPayments.bankTransfer.accountNumber}`,
            ]
          : ['Message admin in My Orders for bank details.'],
        qrImage: '',
        qrCaption: '',
      }
    case 'PayPal':
      return {
        title: 'PayPal',
        lines: shopPayments.paypal.enabled
          ? [`PayPal: ${shopPayments.paypal.email}`]
          : ['Message admin in My Orders for PayPal details.'],
        qrImage: '',
        qrCaption: '',
      }
    default:
      return { title: '', lines: [], qrImage: '', qrCaption: '' }
  }
}

export const enabledPaymentMethods: PaymentMethod[] = [
  ...(shopPayments.gcash.enabled ? (['GCash'] as const) : []),
  ...(shopPayments.maya.enabled ? (['Maya'] as const) : []),
  ...(shopPayments.bankTransfer.enabled ? (['Bank Transfer'] as const) : []),
  ...(shopPayments.paypal.enabled ? (['PayPal'] as const) : []),
]
