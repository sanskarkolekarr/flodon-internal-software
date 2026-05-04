// ─────────────────────────────────────────────
//  Discord Embed Builders
// ─────────────────────────────────────────────

/**
 * Builds the rich intel embed for a new website lead.
 * Surfaces qualification signals so agents can prep for the call instantly.
 */
export function buildWebLeadEmbed(lead) {
  // Normalize data (check both top-level and nested qualification object)
  const q = lead.qualification || lead || {}
  const name = lead.name || 'N/A'
  const email = lead.email || 'N/A'
  const phone = lead.phone || lead.phone_number || 'N/A'
  const website = lead.website || q.website || lead.source_url || 'N/A'
  
  // Dates/Times
  const date = lead.date || lead.booked_date || 'N/A'
  const start = lead.startTime || lead.booked_start || 'N/A'
  const end = lead.endTime || lead.booked_end || ''

  // Hot lead = ready to move forward AND has set an investment level
  const isHot = (q.readyToMoveForward === 'Yes' || lead.readyToImplement === 'Immediately') && (q.investmentLevel || q.monthlyRevenue)

  const fields = [
    // Contact info
    { name: '📧 Email', value: email, inline: true },
    { name: '📱 Phone', value: phone, inline: true },
    { name: '🔗 Website', value: website, inline: true },

    // Separator
    { name: '\u200B', value: '━━━ QUALIFICATION INTEL ━━━', inline: false },

    q.businessDescription ? { name: '📝 Business', value: q.businessDescription, inline: false } : null,
    q.monthlyRevenue ? { name: '💰 Monthly Revenue', value: q.monthlyRevenue, inline: true } : null,
    q.averageDealSize ? { name: '🎯 Avg Deal Size', value: q.averageDealSize, inline: true } : null,
    q.investmentLevel ? { name: '💳 Investment Level', value: q.investmentLevel, inline: true } : null,
    q.biggestBottleneck ? { name: '📉 Bottleneck', value: q.biggestBottleneck, inline: false } : null,
    q.triedToFix ? { name: '🧠 Tried Before', value: q.triedToFix, inline: true } : null,
    q.goal90Days ? { name: '🚀 90-Day Goal', value: q.goal90Days, inline: true } : null,
    q.whyNow ? { name: '⚡ Why Now', value: q.whyNow, inline: true } : null,
    q.readyToImplement ? { name: '⏱️ Timeline', value: q.readyToImplement, inline: true } : null,
    q.decisionMaker ? { name: '🤝 Decision Maker', value: q.decisionMaker, inline: true } : null,
    q.readyToMoveForward ? { name: '✅ Ready to Move', value: q.readyToMoveForward, inline: true } : null,
    q.currentLeadSources ? { name: '📡 Current Sources', value: q.currentLeadSources, inline: true } : null,

    // Booked call
    (date !== 'N/A') ? {
      name: '📅 Booked Call',
      value: `**${date}** · ${start}${end ? ` – ${end}` : ''}`,
      inline: false,
    } : null,
  ].filter(Boolean)

  return {
    title: isHot ? '🔥 HOT INBOUND LEAD — FLODON.IN' : '🌐 NEW WEBSITE LEAD — FLODON.IN',
    description: `### ${name}${lead.brand_name ? `  ·  ${lead.brand_name}` : ''}`,
    color: isHot ? 0x22C55E : 0x3B82F6,
    fields,
    footer: { text: `Lead ID: ${lead.id?.slice(0, 8) || 'N/A'}   ·   Source: flodon.in` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a deal embed for the #deals channel.
 */
export function buildDealEmbed(deal, username) {
  return {
    title: '✦ DEAL CLOSED',
    description: `**${deal.client_name}**${deal.company ? `  ·  ${deal.company}` : ''}`,
    color: 0x22C55E,
    fields: [
      { name: '💰 Monthly Value', value: `₹${deal.amount_monthly.toLocaleString('en-IN')}/mo`, inline: true },
      { name: '🏢 Venture', value: deal.venture, inline: true },
      deal.notes ? { name: '📝 Notes', value: deal.notes, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `Logged by ${username}` },
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
    title: '📨 OUTREACH LOGGED',
    color: 0x3B82F6,
    fields: [
      { name: '📡 Platform', value: data.platform.toUpperCase(), inline: true },
      { name: '📤 Sent', value: `${data.sent_count}`, inline: true },
      { name: '💬 Replies', value: `${data.reply_count}`, inline: true },
      { name: '📊 Response Rate', value: `${rate}%`, inline: true },
    ],
    footer: { text: `Logged by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a call log embed.
 */
export function buildCallEmbed(data, username) {
  const statusConfig = {
    booked: { emoji: '📅', color: 0x3B82F6 },
    completed: { emoji: '✅', color: 0x22C55E },
    noshowed: { emoji: '❌', color: 0xEF4444 },
    cancelled: { emoji: '🚫', color: 0x6B7280 },
  }
  const { emoji, color } = statusConfig[data.status] || { emoji: '📞', color: 0x3B82F6 }

  return {
    title: `${emoji} CALL ${data.status.toUpperCase()}`,
    color,
    fields: [
      { name: '👤 Prospect', value: `${data.prospect_name}${data.company ? ` (${data.company})` : ''}`, inline: false },
      { name: '📡 Source', value: data.source || 'manual', inline: true },
      data.outcome ? { name: '🎯 Outcome', value: data.outcome.replace(/_/g, ' '), inline: true } : null,
    ].filter(Boolean),
    footer: { text: `Logged by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a payment received embed.
 */
export function buildPaymentEmbed(data, username) {
  return {
    title: '💸 PAYMENT RECEIVED',
    color: 0xFFD700,
    fields: [
      { name: '👤 Client', value: data.client_name, inline: true },
      { name: '💰 Amount', value: `₹${data.amount.toLocaleString('en-IN')}`, inline: true },
      { name: '🏦 Provider', value: data.provider.toUpperCase(), inline: true },
      { name: '📋 Type', value: data.type, inline: true },
    ],
    footer: { text: `Logged by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds a churn log embed.
 */
export function buildChurnEmbed(data, username) {
  return {
    title: '📉 CLIENT CHURNED',
    color: 0xEF4444,
    fields: [
      { name: '👤 Client', value: data.client_name, inline: true },
      { name: '💸 Lost MRR', value: `₹${data.amount_monthly.toLocaleString('en-IN')}/mo`, inline: true },
      { name: '❓ Reason', value: data.reason || 'Not specified', inline: true },
      data.notes ? { name: '📝 Notes', value: data.notes, inline: false } : null,
    ].filter(Boolean),
    footer: { text: `Logged by ${username}` },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Builds the cancellation or rejection alert embed.
 */
export function buildCallStatusEmbed(call, status) {
  const isCancel = status === 'cancelled'
  
  return {
    title: isCancel ? '⚠️ CALL CANCELLED' : '❌ CALL REJECTED',
    description: `### ${call.prospect_name}${call.company ? `  ·  ${call.company}` : ''}`,
    color: isCancel ? 0xEF4444 : 0xF59E0B, // Red for Cancel, Orange for Reject
    fields: [
      { name: '📅 Original Date', value: new Date(call.scheduled_at).toLocaleDateString(), inline: true },
      { name: '🕒 Original Time', value: new Date(call.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), inline: true },
      { name: '❓ Reason', value: call.outcome || 'No reason provided', inline: false }
    ],
    footer: { text: `Call ID: ${call.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  }
}
