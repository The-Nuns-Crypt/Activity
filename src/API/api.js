import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import noblox from 'noblox.js'

export function startAPI(client) {
  const app = express()
  const PORT = process.env.PORT || 3000

  app.use(cors())
  app.use(express.json())

  app.get('/', (req, res) => {
    res.status(200).json({ message: 'The Nun’s Crypt API is live.' })
  })

  app.post('/join', async (req, res) => {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Missing username' })

    try {
      const channel = await client.channels.fetch('1363238590250750058')
      await channel.send(`\`${username}\` has joined the game.`)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[API] Failed to send join message:', err)
      return res.status(500).json({ error: 'Failed to send message' })
    }
  })

  app.post('/logChat', async (req, res) => {
    const { username, message, date, time } = req.body
    if (!username || !message || !date || !time) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    try {
      const userId = await noblox.getIdFromUsername(username)
      const avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`

      const embed = client.discord.embed({
        title: 'Chat Log',
        color: 0x000000,
        description: `**Username:** \`${username}\`\n**Date:** \`${date}\`\n**Time:** \`${time}\`\n**Message:** \`${message}\``
      }).setThumbnail(avatar)

      const channel = await client.channels.fetch('1293714092476993546')
      await channel.send({ embeds: [embed] })

      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[API] Failed to send chat log embed:', err)
      return res.status(500).json({ error: 'Chat log failed' })
    }
  })

  app.listen(PORT, () => {
    console.log(`[API] Running on port ${PORT}`)
  })
}
