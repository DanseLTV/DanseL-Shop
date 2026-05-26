import type { PaymentMethod } from '../types'
import { shopContact } from './shopContact'

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PAYMENT DETAILS — EDIT HERE (GCash / Maya / Bank)
 * ═══════════════════════════════════════════════════════════════════
 *  Ilagay ang tunay na account numbers kapag handa ka na.
 */

export const shopPayments = {
  /** Pangalan sa GCash/Maya receipt */
  accountName: 'DANSEL SHOP',

  gcash: {
    enabled: true,
    number: '09481913107',
    qrNote: 'Scan QR sa GCash app o send to number below',
  },

  maya: {
    enabled: true,
    number: '09481913107',
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

  /** Steps na lalabas sa order page */
  steps: [
    'Sign in to your DANSEL SHOP account',
    'Select product and payment method (GCash / Maya)',
    'Pay the exact amount and upload payment proof',
    'Message @DanseL_VIP on Telegram for faster delivery',
  ],

  telegramConfirmNote: `After payment, message us on Telegram ${shopContact.telegramUsername} with your name + product ordered.`,
}

export function getPaymentDetails(method: PaymentMethod) {
  switch (method) {
    case 'GCash':
      return {
        title: 'GCash',
        lines: [
          `Account name: ${shopPayments.accountName}`,
          `GCash number: ${shopPayments.gcash.number}`,
          shopPayments.gcash.qrNote,
        ],
      }
    case 'Maya':
      return {
        title: 'Maya',
        lines: [
          `Account name: ${shopPayments.accountName}`,
          `Maya number: ${shopPayments.maya.number}`,
        ],
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
          : [`Contact ${shopContact.telegramUsername} on Telegram for bank details.`],
      }
    case 'PayPal':
      return {
        title: 'PayPal',
        lines: shopPayments.paypal.enabled
          ? [`PayPal: ${shopPayments.paypal.email}`]
          : [`Contact ${shopContact.email} for PayPal payment.`],
      }
    default:
      return { title: '', lines: [] }
  }
}

export const enabledPaymentMethods: PaymentMethod[] = [
  ...(shopPayments.gcash.enabled ? (['GCash'] as const) : []),
  ...(shopPayments.maya.enabled ? (['Maya'] as const) : []),
  ...(shopPayments.bankTransfer.enabled ? (['Bank Transfer'] as const) : []),
  ...(shopPayments.paypal.enabled ? (['PayPal'] as const) : []),
]
