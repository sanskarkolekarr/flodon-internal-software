import { REST, Routes } from 'discord.js'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { readdirSync } from 'fs'
import '@flodon/core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const commands = []
const commandsPath = join(__dirname, 'commands')
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
  const command = await import(pathToFileURL(join(commandsPath, file)).href)
  commands.push(command.default.data.toJSON())
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🔄 Registering ${commands.length} slash commands GLOBALLY...`)

    // We use applicationCommands instead of applicationGuildCommands for global deployment
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    )

    console.log(`✅ Successfully registered ${data.length} commands GLOBALLY!\n`)
    console.log(`💡 NOTE: Global commands can take a few minutes to appear in Discord.`)
    data.forEach(cmd => console.log(`   /${cmd.name}`))
  } catch (error) {
    console.error('❌ Error registering commands:', error)
  }
})()
