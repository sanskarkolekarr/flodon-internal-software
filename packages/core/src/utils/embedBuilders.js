// ─────────────────────────────────────────────
//  Discord Embed Builders
// ─────────────────────────────────────────────

/**
 * Builds the rich intel embed for a new website lead.
 * Surfaces qualification signals so agents can prep for the call instantly.
 */
export function buildWebLeadEmbed(lead) {
  // Normalize data
  const q = lead.qualification || lead || {}
  const name = lead.name || 'N/A'
  const email = lead.email || 'N/A'
  const phone = lead.phone || lead.phone_number || 'N/A'
  const website = lead.website || q.website || lead.source_url || 'N/A'
  
  const date = lead.date || lead.booked_date || 'N/A'
  const start = lead.startTime || lead.booked_start || 'N/A'
  const end = lead.endTime || lead.booked_end || ''

  const isHot = (q.readyToMoveForward === 'Yes' || lead.readyToImplement === 'Immediately') && (q.investmentLevel || q.monthlyRevenue)

  const fields = [
    // Primary Contact Info
    { name: '📧 Contact Email', value: `\`${email}\``, inline: true },
    { name: '📱 Phone Number', value: `\`${phone}\``, inline: true },
    { name: '🌐 Digital Presence', value: `[Visit Website](${website.startsWith('http') ? website : `https://${website}`})`, inline: true },

    // Separator with dynamic title
    { 
      name: '\u200B', 
      value: isHot ? '✨ **ELITE QUALIFICATION DATA** ✨' : '📋 **QUALIFICATION DATA**', 
      inline: false 
    },

    q.businessDescription ? { name: '💼 Business Model', value: `> ${q.businessDescription}`, inline: false } : null,
    
    // Financials
    q.monthlyRevenue ? { name: '💵 Current Revenue', value: `**${q.monthlyRevenue}**`, inline: true } : null,
    q.investmentLevel ? { name: '💳 Budget Range', value: `**${q.investmentLevel}**`, inline: true } : null,
    q.readyToImplement ? { name: '⏱️ Deployment', value: `**${q.readyToImplement}**`, inline: true } : null,

    // Strategy
    q.goal90Days ? { name: '🎯 90-Day Vision', value: q.goal90Days, inline: true } : null,
    q.biggestBottleneck ? { name: '📉 Growth Blocker', value: q.biggestBottleneck, inline: true } : null,
    q.decisionMaker ? { name: '🤝 Decision Authority', value: q.decisionMaker, inline: true } : null,

    // Schedule
    (date !== 'N/A') ? {
      name: '📅 Scheduled Strategy Session',
      value: `\`${date}\`  ·  \`${start}${end ? ` - ${end}` : ''}\``,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHot ? '🔥 HIGH-PRIORITY INBOUND — FLODON.IN' : '🌐 NEW INBOUND LEAD — FLODON.IN',
    description: `## ${name.toUpperCase()}${lead.brand_name ? `\n*${lead.brand_name}*` : ''}`,
    color: isHot ? 0x10B981 : 0x6366F1, // Premium Emerald vs Indigo
    fields,
    footer: { text: `System Intelligent Routing • ID: ${lead.id?.slice(0, 8) || 'N/A'}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a professional cancellation alert.
 */
export function buildWebhookCancelEmbed(payload) {
  return {
    title: '⚠️ CALL CANCELLED & REMOVED',
    description: `## ${payload.name.toUpperCase()}`,
    color: 0xF43F5E, // Rose Red
    fields: [
      { name: '👤 Prospect', value: `\`${payload.name}\``, inline: true },
      { name: '📧 Email', value: `\`${payload.email || 'N/A'}\``, inline: true },
      { name: '📅 Date', value: `\`${payload.date || 'N/A'}\``, inline: true },
      { name: '🕒 Time', value: `\`${payload.startTime || 'N/A'}\``, inline: true },
      payload.reason ? { name: '❓ Cancellation Reason', value: `> ${payload.reason}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: 'Automated Sales Alert System' },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a deal embed for the #deals channel.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: '💰 NEW REVENUE SECURED',
    description: `## ${deal.client_name.toUpperCase()}`,
    color: 0x10B981,
    fields: [
      { name: '💵 Monthly Recurring', value: `**₹${deal.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: '🏢 Project Venture', value: deal.venture, inline: true },
      deal.notes ? { name: '📝 Deal Intelligence', value: `> ${deal.notes}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `Strategic Win by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds an outreach log embed.
 */
export function buildOutreachEmbed(data, username) {
  const rate = data.sent_count > 0
    ? ((data.reply_count / data.sent_count) * 100).toFixed(1)
    : '0.0'

  return {
    title: '📨 PERFORMANCE LOGGED',
    color: 0x6366F1,
    fields: [
      { name: '📡 Channel', value: data.platform.toUpperCase(), inline: true },
      { name: '📤 Sent', value: `**${data.sent_count}**`, inline: true },
      { name: '💬 Replies', value: `**${data.reply_count}**`, inline: true },
      { name: '📊 Success', value: `**${rate}%**`, inline: true },
    ],
    footer: { text: `Growth metrics by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a call log embed.
 */
export function buildCallEmbed(data, username) {
  const statusConfig = {
    booked: { emoji: '📅', color: 0x6366F1, title: 'BOOKED' },
    completed: { emoji: '✅', color: 0x10B981, title: 'COMPLETED' },
    noshowed: { emoji: '❌', color: 0xF43F5E, title: 'NO SHOW' },
    cancelled: { emoji: '🚫', color: 0x64748B, title: 'CANCELLED' },
  }
  const config = statusConfig[data.status] || { emoji: '📞', color: 0x6366F1, title: 'LOGGED' }

  return {
    title: `${config.emoji} CALL ${config.title}`,
    color: config.color,
    fields: [
      { name: '👤 Prospect', value: `**${data.prospect_name}**${data.company ? ` (${data.company})` : ''}`, inline: false },
      { name: '📡 Source', value: data.source || 'Manual', inline: true },
      data.outcome ? { name: '🎯 Outcome', value: data.outcome.replace(/_/g, ' '), inline: true } : null,
    ].filter(Boolean),
    footer: { text: `Call Intel by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a payment received embed.
 */
export function buildPaymentEmbed(data, username) {
  return {
    title: '💳 CAPITAL INBOUND',
    color: 0xF59E0B, // Amber
    fields: [
      { name: '👤 Partner', value: data.client_name, inline: true },
      { name: '💵 Gross Amount', value: `**₹${data.amount.toLocaleString('en-IN')}**`, inline: true },
      { name: '🏦 Gateway', value: data.provider.toUpperCase(), inline: true },
      { name: '📋 Category', value: data.type, inline: true },
    ],
    footer: { text: `Finance update by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a churn log embed.
 */
export function buildChurnEmbed(data, username) {
  return {
    title: '📉 CLIENT OFFBOARDED',
    color: 0xF43F5E,
    fields: [
      { name: '👤 Former Client', value: data.client_name, inline: true },
      { name: '💸 Lost MRR', value: `**₹${data.amount_monthly.toLocaleString('en-IN')}**`, inline: true },
      { name: '❓ Primary Reason', value: data.reason || 'No specific reason', inline: true },
      data.notes ? { name: '📝 Retention Notes', value: `> ${data.notes}`, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `Account status change by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds the cancellation or rejection alert embed.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? '⚠️ SESSION CANCELLED' : '❌ SESSION REJECTED',
    description: `### ${call.prospect_name.toUpperCase()}${call.company ? `  ·  ${call.company}` : ''}`,
    color: isCancel ? 0xF43F5E : 0xF59E0B,
    fields: [
      { name: '📅 Original Date', value: `\`${new Date(call.scheduled_at).toLocaleDateString()}\``, inline: true },
      { name: '🕒 Original Time', value: `\`${new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\``, inline: true },
      { name: '❓ Reason', value: `> ${call.outcome || 'No reason provided'}`, inline: false }
    ],
    footer: { text: `Reference ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
