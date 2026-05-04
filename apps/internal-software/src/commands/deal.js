import { supabase, CHANNELS, VENTURES, buildDealEmbed, updateWarRoom, checkMilestones } from '@flodon/core'
import { SlashCommandBuilder } from 'discord.js'






export default {
  data: new SlashCommandBuilder()
    .setName('deal')
    .setDescription('Log a closed deal and update MRR')
    .addStringOption(o => o.setName('client').setDescription('Client name').setRequired(true))
    .addNumberOption(o => o.setName('amount').setDescription('Monthly value in ₹ (MRR)').setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName('venture').setDescription('Which venture?').setRequired(true)
        .addChoices(...VENTURES.map(v => ({ name: v, value: v })))
    )
    .addStringOption(o => o.setName('company').setDescription('Company name').setRequired(false))
    .addStringOption(o => o.setName('notes').setDescription('Additional notes').setRequired(false)),

  async execute(interaction, client) {
    const clientName = interaction.options.getString('client')
    const amount     = interaction.options.getNumber('amount')
    const venture    = interaction.options.getString('venture')
    const company    = interaction.options.getString('company')
    const notes      = interaction.options.getString('notes')

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        client_name:    clientName,
        company,
        amount_monthly: amount,
        venture,
        notes,
        logged_by:      interaction.user.username,
        logged_by_id:   interaction.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return interaction.reply({ content: '❌ Error logging deal. Check logs.', ephemeral: true })
    }

    // Post to #deals
    const channel = interaction.guild.channels.cache.get(CHANNELS.deals)
    if (channel) await channel.send({ embeds: [buildDealEmbed(deal, interaction.user.username)] })

    await updateWarRoom(interaction.guild)
    await checkMilestones(interaction.guild)

    await interaction.reply({
      content: `✅ Deal logged — **${clientName}** · ₹${amount.toLocaleString('en-IN')}/mo · ${venture}`,
      ephemeral: true,
    })
  },
}