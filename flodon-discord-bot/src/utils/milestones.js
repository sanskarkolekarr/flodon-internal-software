import { supabase } from '../supabase.js'
import { CHANNELS, MILESTONES } from '../config.js'
import { log } from './logger.js'

// Persists across restarts — store in Supabase (table: milestones_celebrated)
async function getCelebratedMilestones() {
  const { data } = await supabase.from('milestones_celebrated').select('amount')
  return new Set(data?.map(m => m.amount) || [])
}

async function markMilestoneCelebrated(amount) {
  await supabase.from('milestones_celebrated').insert({ amount })
}

export async function checkMilestones(guild) {
  try {
    const { data: deals } = await supabase.from('deals').select('amount_monthly')
    const totalMRR = deals?.reduce((s, d) => s + (d.amount_monthly || 0), 0) || 0

    const celebrated = await getCelebratedMilestones()
    const channel = guild.channels.cache.get(CHANNELS.milestones)

    for (const milestone of MILESTONES) {
      if (totalMRR >= milestone.amount && !celebrated.has(milestone.amount)) {
        await markMilestoneCelebrated(milestone.amount)

        if (!channel) continue

        await channel.send({
          embeds: [{
            title: `${milestone.emoji} MILESTONE ACHIEVED!`,
            description: `# ${milestone.name}\n\n**Flodon just crossed ₹${milestone.amount.toLocaleString('en-IN')} in MRR!**\n\n**Current MRR:** ₹${totalMRR.toLocaleString('en-IN')}/mo`,
            color: 0xFFD700,
            timestamp: new Date().toISOString(),
          }],
        })

        // Celebration GIF
        await channel.send('https://media.giphy.com/media/g9582DNuQppxC/giphy.gif')
        log(`Milestone celebrated: ${milestone.name}`, 'ok')
      }
    }
  } catch (err) {
    log(`Milestone check failed: ${err.message}`, 'error')
  }
}
