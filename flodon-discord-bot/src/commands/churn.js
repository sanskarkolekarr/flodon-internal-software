import { SlashCommandBuilder } from 'discord.js'
import { supabase } from '../supabase.js'
import { CHANNELS } from '../config.js'
import { buildChurnEmbed } from '../utils/embedBuilders.js'
import { updateWarRoom } from '../utils/warroom.js'

export default {
  data: new SlashCommandBuilder()
    .setName('churn')
    .setDescription('Log a client churn (lost MRR)')
    .addStringOption(o => o.setName('client').setDescription('Client name').setRequired(true))
    .addNumberOption(o => o.setName('amount').setDescription('Monthly value lost in ₹').setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName('reason').setDescription('Churn reason').setRequired(false)
        .addChoices(
          { name: 'Price',       value: 'price'       },
          { name: 'Service',     value: 'service'     },
          { name: 'Competition', value: 'competition' },
          { name: 'Other',       value: 'other'       },
        )
    )
    .addStringOption(o => o.setName('notes').setDescription('Additional context').setRequired(false)),

  async execute(interaction, client) {
    const clientName = interaction.options.getString('client')
    const amount     = interaction.options.getNumber('amount')
    const reason     = interaction.options.getString('reason') || 'other'
    const notes      = interaction.options.getString('notes')

    const data = {
      client_name:    clientName,
      amount_monthly: amount,
      reason,
      notes,
      logged_by:      interaction.user.username,
      logged_by_id:   interaction.user.id,
    }

    const { error } = await supabase.from('churn').insert(data)

    if (error) {
      console.error(error)
      return interaction.reply({ content: '❌ Error logging churn.', ephemeral: true })
    }

    const channel = interaction.guild.channels.cache.get(CHANNELS.deals) // Post to deals channel
    if (channel) await channel.send({ embeds: [buildChurnEmbed(data, interaction.user.username)] })

    await updateWarRoom(interaction.guild)

    await interaction.reply({
      content: `📉 Churn logged — **${clientName}** · -₹${amount.toLocaleString('en-IN')}/mo · Reason: ${reason}`,
      ephemeral: true,
    })
  },
}
