import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const apiKey = process.env.API_KEY

const authMiddleware = (req, res, next) => {
  const key = req.headers['authorization']
  if (key !== apiKey) return res.status(403).json({ error: 'Unauthorized' })
  next()
}

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is live.' })
})

app.post('/log', authMiddleware, (req, res) => {
  const { username, action, timestamp, rank } = req.body

  if (!username || !action || !timestamp || !rank) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  console.log(`[LOG] ${username} (${rank}) → ${action} @ ${timestamp}`)
  res.status(200).json({ success: true, received: true })
})

app.listen(PORT, () => {
  console.clear()
  console.log(`The Nun’s Crypt API is running on port ${PORT}`)
})
