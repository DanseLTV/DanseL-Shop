import type { PolicySection } from '../types'

export const policySections: PolicySection[] = [
  {
    id: 'replacement',
    title: 'Replacement Policy',
    content: [
      'DANSEL SHOP offers free replacement for eligible products that stop working within the warranty period, provided the issue is not caused by customer misuse.',
      'Warranty period: 7 days from the date of delivery for most products. Premium and limited-stock items may have a 3-day warranty — check product details before ordering.',
      'To request a replacement, contact us within the warranty period with your order ID, payment proof, and a description of the issue.',
      'Replacements are processed within 1–24 hours after verification. We may ask for screenshots or additional details to diagnose the problem.',
      'Each order is eligible for up to 2 free replacements within the warranty period. Additional replacements may incur a service fee.',
      'Replacement does not extend the original subscription duration — it restores access for the remaining period of your purchase.',
    ],
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    content: [
      'Refunds are available if we are unable to deliver your order within 24 hours of confirmed payment, or if the delivered product is completely non-functional upon first use.',
      'Partial refunds are not available once the account has been successfully activated and used.',
      'To request a refund, submit your order ID, payment proof, and reason for the request via our contact channels.',
      'Approved refunds are processed within 3–7 business days to the original payment method.',
      'Chargebacks or payment disputes without prior contact will result in permanent ban from our services.',
      'Promotional or discounted items may have modified refund terms — these will be stated at the time of purchase.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: [
      'By using DANSEL SHOP, you agree to these terms and all policies listed on this website.',
      'All products sold are for personal use only unless otherwise agreed in writing. Reselling or sharing account credentials with unauthorized parties is prohibited.',
      'DANSEL SHOP reserves the right to refuse service to anyone who violates our policies or engages in fraudulent activity.',
      'Prices are subject to change without notice. The price at the time of your confirmed order is the price you pay.',
      'We are not affiliated with or endorsed by the brands whose services we provide access to. All trademarks belong to their respective owners.',
      'DANSEL SHOP is not liable for service interruptions caused by third-party platform changes, maintenance, or policy updates beyond our control.',
    ],
  },
  {
    id: 'responsibility',
    title: 'Customer Responsibility',
    content: [
      'Customers must provide accurate contact information to receive order confirmations and account details.',
      'Do not change account passwords, email addresses, or security settings unless instructed — unauthorized changes may void your warranty.',
      'Keep your payment proof and order confirmation safe. These are required for any replacement or refund requests.',
      'Report any issues within the warranty period. Delayed reports may not be eligible for free replacement.',
      'Use accounts responsibly and in accordance with the platform\'s terms of service. Misuse that leads to account suspension is not covered.',
      'Do not share your purchased credentials publicly. DANSEL SHOP is not responsible for access loss due to credential sharing.',
    ],
  },
]

export { contactInfo } from './shopContact'
