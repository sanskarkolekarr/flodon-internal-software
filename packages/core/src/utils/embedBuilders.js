// ─────────────────────────────────────────────
//  Spacious Minimalist Corporate Embed Builders
// ─────────────────────────────────────────────

/**
 * Builds a spacious, minimalist embed for website leads.
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
    { name: 'FULL NAME', value: `**${name.toUpperCase()}**`, inline: false },
    
    { name: 'EMAIL', value: `\`${email}\``, inline: true },
    { name: 'PHONE', value: `\`${phone}\``, inline: true },
    { name: 'DOMAIN', value: `[Visit Website](${website.startsWith('http') ? website : `https://${website}`})`, inline: true },

    { name: '\u200B', value: '---', inline: false },

    q.businessDescription ? { name: 'BUSINESS OVERVIEW', value: `> ${q.businessDescription}`, inline: false } : null,
    
    q.monthlyRevenue ? { name: 'CURRENT REVENUE', value: `**${q.monthlyRevenue}**`, inline: true },
    q.investmentLevel ? { name: 'TARGET BUDGET', value: `**${q.investmentLevel}**`, inline: true },
    
    // Line break
    { name: '\u200B', value: '\u200B', inline: false },

    q.readyToImplement ? { name: 'IMPLEMENTATION', value: `**${q.readyToImplement}**`, inline: true },
    q.decisionMaker ? { name: 'DECISION MAKER', value: `**${q.decisionMaker}**`, inline: true },

    (date !== 'N/A') ? {
      name: 'APPOINTMENT SCHEDULE',
      value: `\`${date}\`  |  \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHighValue ? 'PRIORITY CLIENT RECORD' : 'NEW CLIENT RECORD',
    color: isHighValue ? 0x000000 : 0x2b2d31,
    fields,
    footer: { text: `SYSTEM LOG • ID: ${lead.id?.slice(0, 8) || 'AUTO'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a spacious, minimalist cancellation alert.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: 'CANCELLED CLIENT RECORD',
    color: 0x000000, 
    fields: [
      { name: 'CLIENT NAME', value: `**${payload.name.toUpperCase()}**`, inline: false },
      { name: 'SCHEDULED DATE', value: `\`${payload.date || 'N/A'}\``, inline: true },
      { name: 'SCHEDULED TIME', value: `\`${payload.startTime || 'N/A'}\``, inline: true },
      { name: '\u200B', value: '\u200B', inline: false },
      payload.reason ? { name: 'CANCELLATION REASON', value: `> ${payload.reason}`, inline: false } : null,
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
    title: 'CLOSED DEAL RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `**${deal.client_name.toUpperCase()}**`, inline: false },
      { name: 'MONTHLY REVENUE', value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'VENTURE', value: deal.venture, inline: true },
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
    title: 'OUTREACH PERFORMANCE RECORD',
    color: 0x2b2d31,
    fields: [
      { name: 'PLATFORM', value: data.platform.toUpperCase(), inline: true },
      { name: 'SUCCESS RATE', value: `**${rate}%**`, inline: true },
      { name: '\u200B', value: '\u200B', inline: false },
      { name: 'SENT', value: `**${data.sent_count}**`, inline: true },
      { name: 'REPLIES', value: `**${data.reply_count}**`, inline: true },
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
    title: `CALL STATUS: ${config.title}`,
    color: config.color,
    fields: [
      { name: 'PROSPECT NAME', value: `**${data.prospect_name.toUpperCase()}**`, inline: false },
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
    title: 'PAYMENT RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `**${data.client_name.toUpperCase()}**`, inline: false },
      { name: 'GROSS AMOUNT', value: `**₹${data.amount.toLocaleString('en-IN')}**`, inline: true },
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
    title: 'CHURN RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `**${data.client_name.toUpperCase()}**`, inline: false },
      { name: 'REVENUE LOSS', value: `**-₹${data.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'REASON', value: data.reason ? data.reason.toUpperCase() : 'N/A', inline: true },
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds the minimalist cancellation/rejection alert.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? 'SESSION CANCELLED' : 'SESSION REJECTED',
    color: 0x000000,
    fields: [
      { name: 'PROSPECT IDENTITY', value: `**${call.prospect_name.toUpperCase()}**`, inline: false },
      { name: 'SCHEDULED TIME', value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, inline: false },
      { name: 'FORMAL REASON', value: `> ${call.outcome || 'N/A'}`, inline: false }
    ],
    footer: { text: `ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
