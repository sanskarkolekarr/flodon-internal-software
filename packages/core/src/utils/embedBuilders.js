// ─────────────────────────────────────────────
//  Ultra-Minimalist Corporate Embed Builders
// ─────────────────────────────────────────────

/**
 * Builds an ultra-minimalist embed for website leads.
 */
export function buildWebLeadEmbed(lead) {
  const q = lead.qualification || lead || {}
  const name = lead.name || 'N/A'
  const email = lead.email || 'N/A'
  const phone = lead.phone || lead.phone_number || 'N/A'
  const website = lead.website || q.website || lead.source_url || 'N/A'
  
  const date = lead.date || lead.booked_date || 'N/A'
  const start = lead.startTime || lead.booked_start || 'N/A'
  const end = lead.endTime || lead.booked_end || ''

  const isHighValue = (q.readyToMoveForward === 'Yes' || lead.readyToImplement === 'Immediately') && (q.investmentLevel || q.monthlyRevenue)

  const fields = [
    { name: 'EMAIL', value: `\`${email}\``, inline: true },
    { name: 'PHONE', value: `\`${phone}\``, inline: true },
    { name: 'DOMAIN', value: `[Link](${website.startsWith('http') ? website : `https://${website}`})`, inline: true },

    q.businessDescription ? { name: 'BUSINESS', value: `> ${q.businessDescription}`, inline: false } : null,
    q.monthlyRevenue ? { name: 'REVENUE', value: `**${q.monthlyRevenue}**`, inline: true } : null,
    q.investmentLevel ? { name: 'BUDGET', value: `**${q.investmentLevel}**`, inline: true } : null,
    q.readyToImplement ? { name: 'TIMELINE', value: `**${q.readyToImplement}**`, inline: true } : null,

    (date !== 'N/A') ? {
      name: 'SCHEDULE',
      value: `\`${date}\` | \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHighValue ? 'PRIORITY BOOKING' : 'STRATEGY SESSION',
    description: `### ${name.toUpperCase()}`,
    color: isHighValue ? 0x000000 : 0x2b2d31, // Black vs Dark Grey
    fields,
    footer: { text: `REF: ${lead.id?.slice(0, 8) || 'AUTO'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds an ultra-minimalist cancellation alert.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: 'CALL CANCELLED',
    description: `### ${payload.name.toUpperCase()}`,
    color: 0x000000, 
    fields: [
      { name: 'IDENTIFIER', value: `\`${payload.name}\``, inline: true },
      { name: 'SCHEDULE', value: `\`${payload.date || 'N/A'}\` | \`${payload.startTime || 'N/A'}\``, inline: true },
      payload.reason ? { name: 'REASON', value: `> ${payload.reason}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: 'TERMINATED' },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist deal log.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: 'DEAL SECURED',
    description: `### ${deal.client_name.toUpperCase()}`,
    color: 0x000000,
    fields: [
      { name: 'MRR', value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'ENTITY', value: deal.venture, inline: true },
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist outreach log.
 */
export function buildOutreachEmbed(data, username) {
  const rate = data.sent_count > 0
    ? ((data.reply_count / data.sent_count) * 100).toFixed(1)
    : '0.0'

  return {
    title: 'OUTREACH LOG',
    color: 0x2b2d31,
    fields: [
      { name: 'CHANNEL', value: data.platform.toUpperCase(), inline: true },
      { name: 'SENT', value: `**${data.sent_count}**`, inline: true },
      { name: 'REPLIES', value: `**${data.reply_count}**`, inline: true },
      { name: 'RATE', value: `**${rate}%**`, inline: true },
    ],
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist call log.
 */
export function buildCallEmbed(data, username) {
  const statusConfig = {
    booked: { color: 0x2b2d31, title: 'BOOKED' },
    completed: { color: 0x000000, title: 'COMPLETED' },
    noshowed: { color: 0x000000, title: 'NO SHOW' },
    cancelled: { color: 0x000000, title: 'CANCELLED' },
  }
  const config = statusConfig[data.status] || { color: 0x2b2d31, title: 'LOGGED' }

  return {
    title: `CALL ${config.title}`,
    color: config.color,
    fields: [
      { name: 'PROSPECT', value: `**${data.prospect_name.toUpperCase()}**`, inline: false },
      { name: 'SOURCE', value: data.source ? data.source.toUpperCase() : 'MANUAL', inline: true },
      data.outcome ? { name: 'OUTCOME', value: data.outcome.replace(/_/g, ' ').toUpperCase(), inline: true } : null,
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist payment log.
 */
export function buildPaymentEmbed(data, username) {
  return {
    title: 'PAYMENT RECEIVED',
    color: 0x000000,
    fields: [
      { name: 'CLIENT', value: data.client_name.toUpperCase(), inline: true },
      { name: 'AMOUNT', value: `**₹${data.amount.toLocaleString('en-IN')}**`, inline: true },
      { name: 'GATEWAY', value: data.provider.toUpperCase(), inline: true },
    ],
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist churn log.
 */
export function buildChurnEmbed(data, username) {
  return {
    title: 'CLIENT CHURN',
    color: 0x000000,
    fields: [
      { name: 'CLIENT', value: data.client_name.toUpperCase(), inline: true },
      { name: 'IMPACT', value: `**-₹${data.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'REASON', value: data.reason ? data.reason.toUpperCase() : 'N/A', inline: true },
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds the minimalist cancellation alert.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? 'SESSION CANCELLED' : 'SESSION REJECTED',
    description: `### ${call.prospect_name.toUpperCase()}`,
    color: 0x000000,
    fields: [
      { name: 'SCHEDULE', value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, inline: false },
      { name: 'REASON', value: `> ${call.outcome || 'N/A'}`, inline: false }
    ],
    footer: { text: `ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
