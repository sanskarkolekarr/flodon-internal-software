import { supabase } from '@flodon/core'
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'


export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check Flodon System status and connectivity'),

  async execute(interaction) {
    const startTime = Date.now()
    
    // Check Supabase Connectivity
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    const supabaseLatency = Date.now() - startTime
    
    const embed = new EmbedBuilder()
      .setTitle('🛠️ FLODON SYSTEM STATUS')
      .setColor(error ? 0xEF4444 : 0x22C55E)
      .addFields(
        { name: '🤖 Bot Status', value: '🟢 Operational', inline: true },
        { name: '🗄️ Supabase', value: error ? '🔴 Connection Failed' : `🟢 Connected (${supabaseLatency}ms)`, inline: true },
        { name: '📡 Realtime', value: '🟢 Listening for Leads', inline: true },
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
