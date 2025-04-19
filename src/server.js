import { Client, GatewayIntentBits, Partials } from 'discord.js'
import 'dotenv/config'
import chalk from 'chalk'
import { discordHandler } from './handlers/discordHandler.js'
import './API/api.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
})

client.discord = discordHandler

client.once('ready', () => {
  console.clear()
  console.log(chalk.hex('#ff66cc')(`logged in as ${client.user.tag}`))
  client.user.setPresence({
    activities: [{ name: 'coded by ayden', type: 2 }],
    status: 'dnd'
  })
})

client.login(process.env.TOKEN)
