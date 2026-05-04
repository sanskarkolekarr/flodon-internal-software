// ─────────────────────────────────────────────
//  Flodon Discord Bot — Main Entry Point
// ─────────────────────────────────────────────
import { Client, GatewayIntentBits, Collection, EmbedBuilder } from 'discord.js'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { readdirSync } from 'fs'
import http from 'http'
import { supabase, CHANNELS, ROLES, buildWebLeadEmbed, buildWebhookCancelEmbed, updateWarRoom, log } from '@flodon/core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.BOT_PORT || 10000
const PREFIX = '!'

// Helper to format Role Pings
const tagRole = (roleId) => roleId.startsWith('<@&') ? roleId : `<@&${roleId}>`

http.createServer(async (req, res) => {
  const { method, url, headers } = req

  // 1. Health Check (Heartbeat)
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    return res.end('SYSTEM ONLINE: Flodon Discord Intelligence Active\n')
  }

  // 2. Webhook Handling
  if (method === 'POST' && url.startsWith('/api/webhook/')) {
    // Auth Check
    const auth = headers['authorization']
    if (auth !== `Bearer ${process.env.CRM_WEBHOOK_TOKEN}`) {
      res.writeHead(401)
      return res.end('Unauthorized')
    }

    // Collect Body
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }

    try {
      const payload = JSON.parse(body)
      const endpoint = url.split('/').pop()
      
      // Determine Channel: Both lead and cancel now go to #calls
      let channelId = CHANNELS.calls 
      
      const channel = client.channels.cache.get(channelId)

      if (channel) {
        let messageOptions = {}

        // 1. Raw Lead / Booking Payload
        if (endpoint === 'lead' && payload.name && !payload.embeds) {
          messageOptions = {
            content: tagRole(ROLES.sales),
            embeds: [buildWebLeadEmbed(payload)]
          }
        } 
        // 2. Raw Cancellation Payload
        else if (endpoint === 'cancel' && payload.name && !payload.embeds) {
          messageOptions = {
            content: tagRole(ROLES.sales),
            embeds: [buildWebhookCancelEmbed(payload)]
          }
        }
        // 3. Fallback (Discord pre-formatted payload)
        else {
          messageOptions = {
            content: payload.content || null,
            embeds: payload.embeds || []
          }
        }

        await channel.send(messageOptions)
        log(`Webhook processed: ${endpoint} -> ${channelId}`)
        res.writeHead(200)
        return res.end('OK')
      } else {
        log(`Channel not found for webhook: ${channelId}`, 'error')
        res.writeHead(500)
        return res.end('Target channel not found')
      }
    } catch (err) {
      log(`Webhook error: ${err.message}`, 'error')
      res.writeHead(400)
      return res.end('Invalid JSON')
    }
  }

  // 404
  res.writeHead(404)
  res.end('Not Found')
}).listen(PORT, () => {
  log(`Server listening on port ${PORT} (Webhooks + Heartbeat)`)
})

// ─── Discord Client ───────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required for Prefix Commands
  ],
})

// ─── Load Commands ────────────────────────────
client.commands = new Collection()
const commandsPath = join(__dirname, 'commands')
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
  const command = await import(pathToFileURL(join(commandsPath, file)).href)
  client.commands.set(command.default.data.name, command.default)
  log(`Loaded command: /${command.default.data.name}`)
}

// ─── Load Events ─────────────────────────────
const eventsPath = join(__dirname, 'events')
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'))

for (const file of eventFiles) {
  const event = await import(pathToFileURL(join(eventsPath, file)).href)
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args, client))
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args, client))
  }
}

// ─── Handle Slash Commands ────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction, client)
  } catch (error) {
    log(`Error executing /${interaction.commandName}: ${error.message}`, 'error')
    const msg = { content: '❌ Something went wrong executing this command.', ephemeral: true }
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg)
    } else {
      await interaction.reply(msg)
    }
  }
})

// ─── Handle Prefix Commands ───────────────────
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return

  const args = message.content.slice(PREFIX.length).trim().split(/ +/)
  let commandName = args.shift().toLowerCase()

  // Alias support
  if (commandName === 'deals') commandName = 'deal'
  if (commandName === 'bookings') commandName = 'webleads'
  if (commandName === 'outreaches') commandName = 'outreach'

  const command = client.commands.get(commandName)
  if (!command) return

  // Mock an interaction-like object for compatibility where possible
  // NOTE: This only works for simple commands that only use interaction.reply()
  // More complex commands (modals, options) still need /slash usage.
  const mockInteraction = {
    guild: message.guild,
    channel: message.channel,
    user: message.author,
    member: message.member,
    reply: async (options) => {
      if (typeof options === 'string') return message.reply(options)
      return message.reply(options)
    },
    followUp: async (options) => {
      if (typeof options === 'string') return message.reply(options)
      return message.reply(options)
    },
    options: {
      getString: (name) => null, // Placeholder for prefix args if needed
      getInteger: (name) => null,
      getNumber: (name) => null,
    }
  }

  try {
    await command.execute(mockInteraction, client)
  } catch (error) {
    log(`Error executing !${commandName}: ${error.message}`, 'error')
    message.reply('❌ Something went wrong executing this command. Try using the slash command instead.')
  }
})

client.once('ready', () => {
  log(`Logged in as ${client.user.tag}!`)
})

// ─── Login ────────────────────────────────────
client.login(process.env.DISCORD_TOKEN)
