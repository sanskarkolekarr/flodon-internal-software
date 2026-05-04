import { Client, GatewayIntentBits } from 'discord.js'
import * as dotenv from 'dotenv'

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

client.once('ready', () => {
  console.log('--- DISCORD CHANNEL SCAN START ---')
  console.log(`Logged in as: ${client.user.tag}`)
  
  client.guilds.cache.forEach(guild => {
    console.log(`\nSERVER: ${guild.name} (${guild.id})`)
    console.log('-----------------------------------')
    
    guild.channels.cache.forEach(channel => {
      // Only list text channels
      if (channel.type === 0) {
        console.log(`#${channel.name.padEnd(20)} | ID: ${channel.id}`)
      }
    })
  })
  
  process.exit(0)
})

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Login Failed:', err.message)
  process.exit(1)
})
