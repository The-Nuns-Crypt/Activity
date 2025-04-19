import express from 'express'
import cors from 'cors'
import 'dotenv/config'

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
      const channel = await client.channels.fetch('1293714092476993546')
      await channel.send(`\`${username}\` has joined the game.`)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[API] Failed to send join message:', err)
      return res.status(500).json({ error: 'Failed to send message' })
    }
  })

  app.listen(PORT, () => {
    console.log(`[API] Running on port ${PORT}`)
  })
}
