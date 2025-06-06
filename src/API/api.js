import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import noblox from 'noblox.js'
import pkg from 'pg'
const { Pool } = pkg

export function startAPI(client) {
  const app = express()
  const PORT = process.env.PORT || 3000

  const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

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
    if (!username || !message || !date || !time)
      return res.status(400).json({ error: 'Missing fields' })

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

  app.post('/startShift', async (req, res) => {
    const { username, roblox_userid, rank } = req.body
    if (!username || !roblox_userid)
      return res.status(400).json({ error: 'Missing fields' })

    const start_time = new Date().toISOString()

    try {
      await db.query(`
        INSERT INTO "shift data" (username, roblox_userid, rank, start_time, all_time)
        VALUES ($1, $2, $3, $4, 0)
      `, [username, roblox_userid, rank || 'Unknown', start_time])

      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[API] startShift error:', err)
      return res.status(500).json({ error: 'DB error' })
    }
  })

  app.post('/endShift', async (req, res) => {
    const { roblox_userid, afk_minutes = 0, messages_sent = 0 } = req.body
    if (!roblox_userid) return res.status(400).json({ error: 'Missing roblox_userid' })

    const end_time = new Date()
    const end_time_str = end_time.toISOString()

    const formatTime = (iso) =>
      new Date(iso).toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'UTC'
      }) + ' UTC'

    try {
      const result = await db.query(`
        SELECT id, username, rank, start_time FROM "shift data"
        WHERE roblox_userid = $1 AND end_time IS NULL
        ORDER BY id DESC LIMIT 1
      `, [roblox_userid])

      if (!result.rows.length)
        return res.status(404).json({ error: 'No active shift found' })

      const { id, username, rank, start_time } = result.rows[0]
      const start = new Date(start_time)
      const duration = Math.floor((end_time - start) / 60000)

      // fetch latest all_time from previous shifts
      const prev = await db.query(`
        SELECT all_time FROM "shift data"
        WHERE roblox_userid = $1 AND id != $2
        ORDER BY id DESC LIMIT 1
      `, [roblox_userid, id])

      const previousAllTime = prev.rows[0]?.all_time || 0
      const newAllTime = previousAllTime + duration
      const quotaMet = newAllTime >= 60 ? 'true' : 'false'

      await db.query(`
        UPDATE "shift data"
        SET end_time = $1,
            duration_minutes = $2,
            all_time = $3
        WHERE id = $4
      `, [end_time_str, duration, newAllTime, id])

      const userId = await noblox.getIdFromUsername(username)
      const avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`

      const embed = client.discord.embed({
        title: 'Shift Data',
        color: 0x2f3136,
        description: [
          `**Core**`,
          `Username: \`${username}\``,
          `Rank: \`${rank || 'Unknown'}\``,
          ``,
          `**Session**`,
          `Start time: \`${formatTime(start_time)}\``,
          `End time: \`${formatTime(end_time_str)}\``,
          `Shift: \`${duration}\` minutes`,
          `All time: \`${newAllTime}\` minutes`,
          ``,
          `**Quality**`,
          `AFK: \`${afk_minutes}\` minutes`,
          `Messages sent: \`${messages_sent}\``,
          ``,
          `**Requirements**`,
          `Weekly quota met: \`${quotaMet}\``
        ].join('\n')
      }).setThumbnail(avatar)

      const channel = await client.channels.fetch('1163237752549158912')
      await channel.send({ embeds: [embed] })

      return res.status(200).json({ success: true, duration })
    } catch (err) {
      console.error('[API] endShift error:', err)
      return res.status(500).json({ error: 'DB error' })
    }
  })

  app.listen(PORT, () => {
    console.log(`[API] Running on port ${PORT}`)
  })
}
