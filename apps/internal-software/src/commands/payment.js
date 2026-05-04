import { supabase, CHANNELS, PAYMENT_PROVIDERS, buildPaymentEmbed, updateWarRoom } from '@flodon/core'
import { SlashCommandBuilder } from 'discord.js'





export default {
  data: new SlashCommandBuilder()
    .setName('payment')
    .setDescription('Log a payment received')
    .addStringOption(o => o.setName('client').setDescription('Client name').setRequired(true))
    .addNumberOption(o => o.setName('amount').setDescription('Amount in ₹').setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName('provider').setDescription('Payment provider').setRequired(true)
        .addChoices(...PAYMENT_PROVIDERS.map(p => ({ name: p.charAt(0).toUpperCase() + p.slice(1), value: p })))
    )
    .addStringOption(o =>
      o.setName('type').setDescription('Payment type').setRequired(false)
        .addChoices(
          { name: 'New Client',  value: 'new'     },
          { name: 'Renewal',     value: 'renewal' },
          { name: 'Add-on',      value: 'addon'   },
        )
    ),

  async execute(interaction, client) {
    const clientName = interaction.options.getString('client')
    const amount     = interaction.options.getNumber('amount')
    const provider   = interaction.options.getString('provider')
    const type       = interaction.options.getString('type') || 'renewal'

    const data = {
      client_name:  clientName,
      amount,
      provider,
      type,
      received_at:  new Date().toISOString(),
      logged_by:    interaction.user.username,
      logged_by_id: interaction.user.id,
    }

    const { error } = await supabase.from('payments').insert(data)

    if (error) {
      console.error(error)
      return interaction.reply({ content: '❌ Error logging payment.', ephemeral: true })
    }

    const channel = interaction.guild.channels.cache.get(CHANNELS.payments)
    if (channel) await channel.send({ embeds: [buildPaymentEmbed(data, interaction.user.username)] })

    await interaction.reply({
      content: `✅ Payment logged — **${clientName}** · ₹${amount.toLocaleString('en-IN')} via ${provider}`,
      ephemeral: true,
    })
  },
}