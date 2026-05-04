// ─────────────────────────────────────────────
//  Premium Corporate Intelligence Briefings
// ─────────────────────────────────────────────

/**
 * Builds a premium, list-style intelligence briefing for website leads.
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
    { name: 'Name', value: `**${name.toUpperCase()}**`, inline: false },
    { name: 'Email', value: `\`${email}\``, inline: false },
    { name: 'Phone', value: `\`${phone}\``, inline: false },
    { name: 'Date & Time', value: `\`${date}\`  |  \`${start}${end ? ` - ${end}` : ''}\``, inline: false },
    { name: 'Website', value: `[${website.replace(/^https?:\/\//, '')}](${website.startsWith('http') ? website : `https://${website}`})`, inline: false },

    { name: '\u200B', value: '---', inline: false },

    { name: 'Business Description', value: `> ${q.businessDescription || 'N/A'}`, inline: false },
    { name: 'Revenue', value: `**${q.monthlyRevenue || 'N/A'}**`, inline: false },
    { name: 'Investment', value: `**${q.investmentLevel || 'N/A'}**`, inline: false },
    { name: 'Timeline', value: `**${q.readyToImplement || 'N/A'}**`, inline: false },
    { name: 'Decision Maker', value: `**${q.decisionMaker || 'N/A'}**`, inline: false },

    { name: '\u200B', value: '---', inline: false },

    { name: 'Lead Sources', value: `> ${q.leadSources || 'N/A'}`, inline: false },
    { name: 'Biggest Bottleneck', value: `> ${q.biggestBottleneck || 'N/A'}`, inline: false },
    { name: '90-Day Goal', value: `> ${q.ninetyDayGoal || q.goal || 'N/A'}`, inline: false },
  ].filter(Boolean)

  return {
    title: isHighValue ? 'PRIORITY CLIENT BRIEFING' : 'CLIENT INTELLIGENCE BRIEFING',
    color: isHighValue ? 0x000000 : 0x2b2d31,
    fields,
    footer: { text: `REF: ${lead.id?.slice(0, 8) || 'AUTO'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a premium cancellation briefing.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: 'TERMINATION BRIEFING',
    color: 0x000000, 
    fields: [
      { 
        name: 'Name', 
        value: `**${payload.name.toUpperCase()}**`, 
        inline: false 
      },
      {
        name: 'Date & Time',
        value: `\`${payload.date || 'N/A'}\` at \`${payload.startTime || 'N/A'}\``,
        inline: false
      },
      { 
        name: 'Termination Rationale', 
        value: `> ${payload.reason || 'N/A'}`, 
        inline: false 
      },
    ].filter(Boolean),
    footer: { text: 'RECORD TERMINATED' },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist deal log.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: 'DEAL EXECUTION LOG',
    color: 0x000000,
    fields: [
      { 
        name: 'Name', 
        value: `**${deal.client_name.toUpperCase()}**`, 
        inline: false 
      },
      {
        name: 'Revenue',
        value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`,
        inline: false
      },
      {
        name: 'Venture',
        value: deal.venture,
        inline: false
      }
    ].filter(Boolean),
    footer: { text: `EXECUTED BY: ${username.toUpperCase()}` },
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
    title: 'OUTREACH PERFORMANCE SUMMARY',
    color: 0x2b2d31,
    fields: [
      { name: 'Channel', value: data.platform.toUpperCase(), inline: false },
      { name: 'Conversion Rate', value: `**${rate}%**`, inline: false },
      { name: 'Sent', value: `**${data.sent_count}**`, inline: false },
      { name: 'Replies', value: `**${data.reply_count}**`, inline: false },
    ],
    footer: { text: `METRICS BY: ${username.toUpperCase()}` },
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
    title: `SESSION STATUS: ${config.title}`,
    color: config.color,
    fields: [
      { 
        name: 'Name', 
        value: `**${data.prospect_name.toUpperCase()}**`, 
        inline: false 
      },
      {
        name: 'Source',
        value: data.source ? data.source.toUpperCase() : 'MANUAL',
        inline: false
      },
      data.outcome ? { 
        name: 'Outcome', 
        value: data.outcome.replace(/_/g, ' ').toUpperCase(), 
        inline: false 
      } : null,
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
    title: 'REVENUE COLLECTION LOG',
    color: 0x000000,
    fields: [
      { 
        name: 'Name', 
        value: `**${data.client_name.toUpperCase()}**`, 
        inline: false 
      },
      {
        name: 'Amount',
        value: `**₹${data.amount.toLocaleString('en-IN')}**`,
        inline: false
      },
      {
        name: 'Gateway',
        value: data.provider.toUpperCase(),
        inline: false
      },
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
    title: 'REVENUE CHURN LOG',
    color: 0x000000,
    fields: [
      { 
        name: 'Name', 
        value: `**${data.client_name.toUpperCase()}**`, 
        inline: false 
      },
      {
        name: 'Impact',
        value: `**-₹${data.amount_monthly.toLocaleString('en-IN')}**`,
        inline: false
      },
      {
        name: 'Reason',
        value: data.reason ? data.reason.toUpperCase() : 'N/A',
        inline: false
      },
    ].filter(Boolean),
    footer: { text: `LOGGED BY: ${username.toUpperCase()}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a minimalist cancellation/rejection alert.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? 'SESSION CANCELLED' : 'SESSION REJECTED',
    color: 0x000000,
    fields: [
      { 
        name: 'Name', 
        value: `**${call.prospect_name.toUpperCase()}**`, 
        inline: false 
      },
      { 
        name: 'Date & Time', 
        value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, 
        inline: false 
      },
      { 
        name: 'Reason', 
        value: `> ${call.outcome || 'N/A'}`, 
        inline: false 
      }
    ],
    footer: { text: `ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
