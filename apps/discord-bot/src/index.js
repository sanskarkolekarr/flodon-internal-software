// ─────────────────────────────────────────────
//  Flodon Discord Bot — Main Entry Point
// ─────────────────────────────────────────────
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { readdirSync } from 'fs'
import http from 'http'
import { supabase, CHANNELS, buildWebLeadEmbed, buildWebhookCancelEmbed, updateWarRoom, log } from '@flodon/core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.BOT_PORT || 10000

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
            content: '📅 **NEW STRATEGY SESSION BOOKED**',
            embeds: [buildWebLeadEmbed(payload)]
          }
        } 
        // 2. Raw Cancellation Payload
        else if (endpoint === 'cancel' && payload.name && !payload.embeds) {
          messageOptions = {
            content: '⚠️ **URGENT: CALL CANCELLED**\n<@sales>',
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

client.once('ready', () => {
  log(`Logged in as ${client.user.tag}!`)
})

// ─── Login ────────────────────────────────────
client.login(process.env.DISCORD_TOKEN)
