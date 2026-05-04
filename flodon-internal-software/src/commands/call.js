import { SlashCommandBuilder } from 'discord.js'
import { supabase } from '../supabase.js'
import { CHANNELS, CALL_SOURCES } from '../config.js'
import { buildCallEmbed } from '../utils/embedBuilders.js'
import { updateWarRoom } from '../utils/warroom.js'

export default {
  data: new SlashCommandBuilder()
    .setName('call')
    .setDescription('Log a sales call')
    .addStringOption(o => o.setName('prospect').setDescription('Prospect name').setRequired(true))
    .addStringOption(o =>
      o.setName('status').setDescription('Call status').setRequired(true)
        .addChoices(
          { name: 'Booked',    value: 'booked'    },
          { name: 'Completed', value: 'completed' },
          { name: 'No-showed', value: 'noshowed'  },
          { name: 'Cancelled', value: 'cancelled' },
        )
    )
    .addStringOption(o =>
      o.setName('source').setDescription('How was it booked?').setRequired(false)
        .addChoices(...CALL_SOURCES.map(s => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: s })))
    )
    .addStringOption(o => o.setName('company').setDescription('Company name').setRequired(false))
    .addStringOption(o =>
      o.setName('outcome').setDescription('Outcome (completed calls only)').setRequired(false)
        .addChoices(
          { name: 'Interested',       value: 'interested'        },
          { name: 'Not Interested',   value: 'not_interested'    },
          { name: 'Follow-up Needed', value: 'follow_up_needed'  },
        )
    ),

  async execute(interaction, client) {
    const prospect = interaction.options.getString('prospect')
    const status   = interaction.options.getString('status')
    const source   = interaction.options.getString('source') || 'manual'
    const company  = interaction.options.getString('company')
    const outcome  = interaction.options.getString('outcome')

    const data = {
      prospect_name: prospect,
      company,
      status,
      source,
      outcome,
      scheduled_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      logged_by:    interaction.user.username,
      logged_by_id: interaction.user.id,
    }

    const { error } = await supabase.from('calls').insert(data)

    if (error) {
      console.error(error)
      return interaction.reply({ content: '❌ Error logging call.', ephemeral: true })
    }

    const channel = interaction.guild.channels.cache.get(CHANNELS.calls)
    if (channel) await channel.send({ embeds: [buildCallEmbed(data, interaction.user.username)] })

    await updateWarRoom(interaction.guild)

    await interaction.reply({
      content: `✅ Call logged — **${prospect}** · ${status}`,
      ephemeral: true,
    })
  },
}
