export const CHANNELS = {
  webLeads:   process.env.CHANNEL_WEB_LEADS,
  deals:      process.env.CHANNEL_DEALS,
  outreach:   process.env.CHANNEL_OUTREACH,
  calls:      process.env.CHANNEL_CALLS,
  payments:   process.env.CHANNEL_PAYMENTS,
  warroom:    process.env.CHANNEL_WARROOM,
  milestones: process.env.CHANNEL_MILESTONES,
}

export const ROLES = {
  sales: process.env.ROLE_SALES || 'sales',
}

export const MILESTONES = [
  { amount: 10000,   name: '10K MRR',   emoji: '🎯' },
  { amount: 25000,   name: '25K MRR',   emoji: '🚀' },
  { amount: 50000,   name: '50K MRR',   emoji: '🔥' },
  { amount: 100000,  name: '1L MRR',    emoji: '💎' },
  { amount: 250000,  name: '2.5L MRR',  emoji: '👑' },
  { amount: 500000,  name: '5L MRR',    emoji: '🏆' },
  { amount: 1000000, name: '10L MRR',   emoji: '🎊' },
]

export const VENTURES  = ['FLODON', 'SYNTHORY', 'VYRE']
export const PLATFORMS = ['linkedin', 'email', 'twitter', 'whatsapp']
export const CALL_SOURCES    = ['cal.com', 'manual', 'linkedin', 'website']
export const PAYMENT_PROVIDERS = ['razorpay', 'stripe', 'cashfree', 'manual']
