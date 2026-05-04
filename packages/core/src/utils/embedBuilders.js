// ─────────────────────────────────────────────
//  Corporate Intelligence Embed Builders
// ─────────────────────────────────────────────

/**
 * Builds a minimalist, corporate-standard embed for website leads.
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
    { name: 'CONTACT EMAIL', value: `\`${email}\``, inline: true },
    { name: 'PHONE NUMBER', value: `\`${phone}\``, inline: true },
    { name: 'DIGITAL DOMAIN', value: `[Link](${website.startsWith('http') ? website : `https://${website}`})`, inline: true },

    { name: '---', value: isHighValue ? '**PRIORITY QUALIFICATION METRICS**' : '**QUALIFICATION METRICS**', inline: false },

    q.businessDescription ? { name: 'BUSINESS DESCRIPTION', value: `> ${q.businessDescription}`, inline: false } : null,
    q.monthlyRevenue ? { name: 'MONTHLY REVENUE', value: `**${q.monthlyRevenue}**`, inline: true } : null,
    q.investmentLevel ? { name: 'INVESTMENT LEVEL', value: `**${q.investmentLevel}**`, inline: true } : null,
    q.readyToImplement ? { name: 'IMPLEMENTATION TIMELINE', value: `**${q.readyToImplement}**`, inline: true } : null,

    q.goal90Days ? { name: 'STRATEGIC OBJECTIVE', value: q.goal90Days, inline: true } : null,
    q.biggestBottleneck ? { name: 'OPERATIONAL BOTTLENECK', value: q.biggestBottleneck, inline: true } : null,
    q.decisionMaker ? { name: 'DECISION AUTHORITY', value: q.decisionMaker, inline: true } : null,

    (date !== 'N/A') ? {
      name: 'SCHEDULED STRATEGY SESSION',
      value: `\`${date}\` | \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHighValue ? 'SYSTEM ALERT: PRIORITY INBOUND' : 'SYSTEM NOTIFICATION: NEW INBOUND',
    description: `### ${name.toUpperCase()}${lead.brand_name ? `\n*${lead.brand_name}*` : ''}`,
    color: isHighValue ? 0x0F172A : 0x334155, // Navy vs Slate
    fields,
    footer: { text: `FLODON INTERNAL OPERATIONS • ID: ${lead.id?.slice(0, 8) || 'SYSTEM'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a professional corporate cancellation alert.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: 'OPERATIONAL ALERT: SESSION TERMINATED',
    description: `### ${payload.name.toUpperCase()}`,
    color: 0x450a0a, // Deep Dark Red
    fields: [
      { name: 'PROSPECT NAME', value: `\`${payload.name}\``, inline: true },
      { name: 'EMAIL ADDRESS', value: `\`${payload.email || 'N/A'}\``, inline: true },
      { name: 'SCHEDULED DATE', value: `\`${payload.date || 'N/A'}\``, inline: true },
      { name: 'SCHEDULED TIME', value: `\`${payload.startTime || 'N/A'}\``, inline: true },
      payload.reason ? { name: 'CANCELLATION REASON', value: `> ${payload.reason}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: 'FLODON AUTOMATED LOGISTICS' },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a corporate-level deal log.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: 'REVENUE RECOGNITION: DEAL SECURED',
    description: `### ${deal.client_name.toUpperCase()}`,
    color: 0x0F172A,
    fields: [
      { name: 'MONTHLY RECURRING REVENUE', value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'ENTITY VENTURE', value: deal.venture, inline: true },
      deal.notes ? { name: 'ENGAGEMENT NOTES', value: `> ${deal.notes}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `EXECUTED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a corporate outreach log.
 */
export function buildOutreachEmbed(data, username) {
  const rate = data.sent_count > 0
    ? ((data.reply_count / data.sent_count) * 100).toFixed(1)
    : '0.0'

  return {
    title: 'KPI UPDATE: OUTREACH PERFORMANCE',
    color: 0x334155,
    fields: [
      { name: 'PLATFORM CHANNEL', value: data.platform.toUpperCase(), inline: true },
      { name: 'VOLUME SENT', value: `**${data.sent_count}**`, inline: true },
      { name: 'REPLY COUNT', value: `**${data.reply_count}**`, inline: true },
      { name: 'CONVERSION RATE', value: `**${rate}%**`, inline: true },
    ],
    footer: { text: `REPORTED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a corporate call log.
 */
export function buildCallEmbed(data, username) {
  const statusConfig = {
    booked: { color: 0x334155, title: 'BOOKED' },
    completed: { color: 0x0F172A, title: 'COMPLETED' },
    noshowed: { color: 0x450a0a, title: 'NO SHOW' },
    cancelled: { color: 0x1e293b, title: 'CANCELLED' },
  }
  const config = statusConfig[data.status] || { color: 0x334155, title: 'LOGGED' }

  return {
    title: `SESSION STATUS: ${config.title}`,
    color: config.color,
    fields: [
      { name: 'PROSPECT IDENTITY', value: `**${data.prospect_name.toUpperCase()}**${data.company ? ` (${data.company.toUpperCase()})` : ''}`, inline: false },
      { name: 'ACQUISITION SOURCE', value: data.source ? data.source.toUpperCase() : 'MANUAL', inline: true },
      data.outcome ? { name: 'SESSION OUTCOME', value: data.outcome.replace(/_/g, ' ').toUpperCase(), inline: true } : null,
    ].filter(Boolean),
    footer: { text: `OFFICIAL LOG BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a corporate payment received log.
 */
export function buildPaymentEmbed(data, username) {
  return {
    title: 'FINANCIAL UPDATE: CAPITAL RECEIVED',
    color: 0x0F172A,
    fields: [
      { name: 'CLIENT ENTITY', value: data.client_name.toUpperCase(), inline: true },
      { name: 'GROSS AMOUNT', value: `**₹${data.amount.toLocaleString('en-IN')}**`, inline: true },
      { name: 'PAYMENT GATEWAY', value: data.provider.toUpperCase(), inline: true },
      { name: 'TRANSACTION CATEGORY', value: data.type.toUpperCase(), inline: true },
    ],
    footer: { text: `ACCOUNTING UPDATE BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a corporate churn log.
 */
export function buildChurnEmbed(data, username) {
  return {
    title: 'OFFBOARDING NOTIFICATION: REVENUE LOSS',
    color: 0x450a0a,
    fields: [
      { name: 'FORMER ENTITY', value: data.client_name.toUpperCase(), inline: true },
      { name: 'REVENUE IMPACT', value: `**-₹${data.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: 'CHURN RATIONALE', value: data.reason ? data.reason.toUpperCase() : 'NOT SPECIFIED', inline: true },
      data.notes ? { name: 'RETENTION ANALYSIS', value: `> ${data.notes}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `OFFBOARDING LOG BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds the corporate cancellation/rejection alert.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? 'SESSION NOTIFICATION: CANCELLATION' : 'SESSION NOTIFICATION: REJECTION',
    description: `### ${call.prospect_name.toUpperCase()}${call.company ? ` | ${call.company.toUpperCase()}` : ''}`,
    color: isCancel ? 0x450a0a : 0x78350f,
    fields: [
      { name: 'ORIGINAL SCHEDULE', value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, inline: false },
      { name: 'FORMAL REASON', value: `> ${call.outcome || 'NO REASON PROVIDED'}`, inline: false }
    ],
    footer: { text: `TRACKING ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
