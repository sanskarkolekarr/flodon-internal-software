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
    { 
      name: 'CLIENT PROFILE', 
      value: `**${name.toUpperCase()}**\n${email}\n${phone}\n[${website.replace(/^https?:\/\//, '')}](${website.startsWith('http') ? website : `https://${website}`})`, 
      inline: false 
    },

    { name: '\u200B', value: '---', inline: false },

    q.businessDescription ? { 
      name: 'BUSINESS ANALYSIS', 
      value: `> ${q.businessDescription}`, 
      inline: false 
    } : null,
    
    { 
      name: 'FINANCIAL DATA', 
      value: `• REVENUE: **${q.monthlyRevenue || 'N/A'}**\n• BUDGET: **${q.investmentLevel || 'N/A'}**`, 
      inline: false 
    },

    { 
      name: 'STRATEGIC INTEL', 
      value: `• TIMELINE: **${q.readyToImplement || 'N/A'}**\n• AUTHORITY: **${q.decisionMaker || 'N/A'}**`, 
      inline: false 
    },

    { name: '\u200B', value: '---', inline: false },

    (date !== 'N/A') ? {
      name: 'OPERATIONAL SCHEDULE',
      value: `\`${date}\`  |  \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
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
        name: 'CLIENT IDENTITY', 
        value: `**${payload.name.toUpperCase()}**\n\`${payload.date || 'N/A'}\` at \`${payload.startTime || 'N/A'}\``, 
        inline: false 
      },
      payload.reason ? { 
        name: 'TERMINATION RATIONALE', 
        value: `> ${payload.reason}`, 
        inline: false 
      } : null,
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
        name: 'ENTITY', 
        value: `**${deal.client_name.toUpperCase()}**\nMRR: **₹${deal.amount_monthly.toLocaleString('en-IN')}**\nVenture: ${deal.venture}`, 
        inline: false 
      },
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
      { 
        name: 'CHANNEL: ' + data.platform.toUpperCase(), 
        value: `• CONVERSION: **${rate}%**\n• SENT: **${data.sent_count}**\n• REPLIES: **${data.reply_count}**`, 
        inline: false 
      },
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
        name: 'PROSPECT', 
        value: `**${data.prospect_name.toUpperCase()}**\nSource: ${data.source ? data.source.toUpperCase() : 'MANUAL'}${data.outcome ? `\nOutcome: ${data.outcome.replace(/_/g, ' ').toUpperCase()}` : ''}`, 
        inline: false 
      },
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
        name: 'CLIENT', 
        value: `**${data.client_name.toUpperCase()}**\nAmount: **₹${data.amount.toLocaleString('en-IN')}**\nGateway: ${data.provider.toUpperCase()}`, 
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
        name: 'CLIENT', 
        value: `**${data.client_name.toUpperCase()}**\nImpact: **-₹${data.amount_monthly.toLocaleString('en-IN')}**\nReason: ${data.reason ? data.reason.toUpperCase() : 'N/A'}`, 
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
        name: 'PROSPECT', 
        value: `**${call.prospect_name.toUpperCase()}**\nTime: \`${new Date(call.scheduled_at).toLocaleDateString()}\` | \`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, 
        inline: false 
      },
      { 
        name: 'REASON', 
        value: `> ${call.outcome || 'N/A'}`, 
        inline: false 
      }
    ],
    footer: { text: `ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
