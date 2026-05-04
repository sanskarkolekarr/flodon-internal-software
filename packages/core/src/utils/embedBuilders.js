// ─────────────────────────────────────────────
//  Vertical Corporate Intelligence Records
// ─────────────────────────────────────────────

/**
 * Builds a strictly vertical, list-style embed for website leads.
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
    { name: 'IDENTITY', value: `## ${name.toUpperCase()}`, inline: false },
    { name: 'EMAIL ADDRESS', value: `\`${email}\``, inline: false },
    { name: 'PHONE NUMBER', value: `\`${phone}\``, inline: false },
    { name: 'DIGITAL DOMAIN', value: `[Visit Website](${website.startsWith('http') ? website : `https://${website}`})`, inline: false },

    { name: '\u200B', value: '---', inline: false },

    q.businessDescription ? { name: 'BUSINESS ANALYSIS', value: `> ${q.businessDescription}`, inline: false } : null,
    
    q.monthlyRevenue ? { name: 'ESTIMATED REVENUE', value: `**${q.monthlyRevenue}**`, inline: false } : null,
    q.investmentLevel ? { name: 'ALLOCATED BUDGET', value: `**${q.investmentLevel}**`, inline: false } : null,
    q.readyToImplement ? { name: 'DEPLOYMENT WINDOW', value: `**${q.readyToImplement}**`, inline: false } : null,
    q.decisionMaker ? { name: 'AUTHORITY STATUS', value: `**${q.decisionMaker}**`, inline: false } : null,

    { name: '\u200B', value: '---', inline: false },

    (date !== 'N/A') ? {
      name: 'OPERATIONAL SCHEDULE',
      value: `\`${date}\`  |  \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHighValue ? 'PRIORITY CLIENT RECORD' : 'NEW CLIENT RECORD',
    color: isHighValue ? 0x000000 : 0x2b2d31,
    fields,
    footer: { text: `INTELLIGENCE LOG • ID: ${lead.id?.slice(0, 8) || 'AUTO'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical cancellation alert.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: 'CANCELLED CLIENT RECORD',
    color: 0x000000, 
    fields: [
      { name: 'CLIENT IDENTITY', value: `## ${payload.name.toUpperCase()}`, inline: false },
      { name: 'SCHEDULED DATE', value: `\`${payload.date || 'N/A'}\``, inline: false },
      { name: 'SCHEDULED TIME', value: `\`${payload.startTime || 'N/A'}\``, inline: false },
      payload.reason ? { name: 'TERMINATION RATIONALE', value: `> ${payload.reason}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: 'RECORD TERMINATED' },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical deal log.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: 'CLOSED DEAL RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `## ${deal.client_name.toUpperCase()}`, inline: false },
      { name: 'MONTHLY REVENUE', value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`, inline: false },
      { name: 'VENTURE', value: deal.venture, inline: false },
    ].filter(Boolean),
    footer: { text: `EXECUTED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical outreach log.
 */
export function buildOutreachEmbed(data, username) {
  const rate = data.sent_count > 0
    ? ((data.reply_count / data.sent_count) * 100).toFixed(1)
    : '0.0'

  return {
    title: 'OUTREACH PERFORMANCE RECORD',
    color: 0x2b2d31,
    fields: [
      { name: 'PLATFORM CHANNEL', value: data.platform.toUpperCase(), inline: false },
      { name: 'CONVERSION RATE', value: `**${rate}%**`, inline: false },
      { name: 'UNITS SENT', value: `**${data.sent_count}**`, inline: false },
      { name: 'REPLY VOLUME', value: `**${data.reply_count}**`, inline: false },
    ],
    footer: { text: `METRICS BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical call log.
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
    title: `SESSION STATUS: ${config.title}`,
    color: config.color,
    fields: [
      { name: 'PROSPECT IDENTITY', value: `## ${data.prospect_name.toUpperCase()}`, inline: false },
      { name: 'ACQUISITION SOURCE', value: data.source ? data.source.toUpperCase() : 'MANUAL', inline: false },
      data.outcome ? { name: 'SESSION OUTCOME', value: data.outcome.replace(/_/g, ' ').toUpperCase(), inline: false } : null,
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical payment log.
 */
export function buildPaymentEmbed(data, username) {
  return {
    title: 'PAYMENT RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `## ${data.client_name.toUpperCase()}`, inline: false },
      { name: 'GROSS AMOUNT', value: `**₹${data.amount.toLocaleString('en-IN')}**`, inline: false },
      { name: 'PAYMENT GATEWAY', value: data.provider.toUpperCase(), inline: false },
    ],
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical churn log.
 */
export function buildChurnEmbed(data, username) {
  return {
    title: 'REVENUE CHURN RECORD',
    color: 0x000000,
    fields: [
      { name: 'CLIENT ENTITY', value: `## ${data.client_name.toUpperCase()}`, inline: false },
      { name: 'REVENUE IMPACT', value: `**-₹${data.amount_monthly.toLocaleString('en-IN')}**`, inline: false },
      { name: 'CHURN RATIONALE', value: data.reason ? data.reason.toUpperCase() : 'N/A', inline: false },
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a strictly vertical cancellation/rejection alert.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? 'SESSION CANCELLED' : 'SESSION REJECTED',
    color: 0x000000,
    fields: [
      { name: 'PROSPECT IDENTITY', value: `## ${call.prospect_name.toUpperCase()}`, inline: false },
      { name: 'SCHEDULED TIME', value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, inline: false },
      { name: 'FORMAL REASON', value: `> ${call.outcome || 'N/A'}`, inline: false }
    ],
    footer: { text: `ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
