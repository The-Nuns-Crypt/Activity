import { REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commands = []
const commandPath = path.join(__dirname, './commands')
const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandPath, file)
  const command = (await import(filePath)).default
  if (command?.data) commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

try {
  console.log('Uploading slash commands...')
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  )
  console.log('Slash commands deployed.')
} catch (err) {
  console.error('Failed to deploy:', err)
}