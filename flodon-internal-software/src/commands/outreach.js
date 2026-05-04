import { SlashCommandBuilder } from 'discord.js'
import { supabase } from '../supabase.js'
import { CHANNELS, PLATFORMS } from '../config.js'
import { buildOutreachEmbed } from '../utils/embedBuilders.js'
import { updateWarRoom } from '../utils/warroom.js'

export default {
  data: new SlashCommandBuilder()
    .setName('outreach')
    .setDescription('Log daily outreach volume')
    .addStringOption(o =>
      o.setName('platform').setDescription('Platform used').setRequired(true)
        .addChoices(...PLATFORMS.map(p => ({ name: p.charAt(0).toUpperCase() + p.slice(1), value: p })))
    )
    .addIntegerOption(o => o.setName('sent').setDescription('Messages sent').setRequired(true).setMinValue(1))
    .addIntegerOption(o => o.setName('replies').setDescription('Replies received').setRequired(false).setMinValue(0)),

  async execute(interaction, client) {
    const platform = interaction.options.getString('platform')
    const sent     = interaction.options.getInteger('sent')
    const replies  = interaction.options.getInteger('replies') || 0

    const data = {
      platform,
      sent_count:   sent,
      reply_count:  replies,
      logged_by:    interaction.user.username,
      logged_by_id: interaction.user.id,
      logged_at:    new Date().toISOString().split('T')[0],
    }

    const { error } = await supabase.from('outreach').insert(data)

    if (error) {
      console.error(error)
      return interaction.reply({ content: '❌ Error logging outreach.', ephemeral: true })
    }

    const channel = interaction.guild.channels.cache.get(CHANNELS.outreach)
    if (channel) await channel.send({ embeds: [buildOutreachEmbed(data, interaction.user.username)] })

    await updateWarRoom(interaction.guild)

    await interaction.reply({
      content: `✅ Outreach logged — **${sent}** messages on **${platform}** (${replies} replies)`,
      ephemeral: true,
    })
  },
}
