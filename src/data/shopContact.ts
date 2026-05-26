/**
 * ═══════════════════════════════════════════════════════════════════
 *  DANSEL SHOP — CONTACT INFO
 * ═══════════════════════════════════════════════════════════════════
 */

export const shopContact = {
  shopName: 'DANSEL SHOP',

  email: 'danseltvshop@gmail.com',

  phone: '',

  /** false = hindi ipapakita ang Messenger sa site */
  messengerEnabled: false,
  messengerUrl: '',
  messengerLabel: 'Messenger',

  telegramUrl: 'https://t.me/DanseL_VIP',
  telegramUsername: '@DanseL_VIP',

  hours: 'Monday – Sunday, 9:00 AM – 11:00 PM (PHT)',

  tagline:
    'Questions about orders? Email us or message on Telegram — we usually reply within minutes.',
}

export const contactInfo = {
  email: shopContact.email,
  messenger: shopContact.messengerUrl,
  telegram: shopContact.telegramUsername,
  hours: shopContact.hours,
}
