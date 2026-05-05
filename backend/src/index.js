import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import partnersRouter    from './routes/partners.js'
import contractsRouter   from './routes/contracts.js'
import revenueRouter     from './routes/revenue.js'
import activitiesRouter  from './routes/activities.js'
import riskScoresRouter  from './routes/riskScores.js'
import { authenticate }  from './middleware/auth.js'

const app  = express()
const PORT = process.env.PORT ?? 4000

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// All /api routes require a valid JWT
app.use('/api', authenticate)

app.use('/api/partners',     partnersRouter)
app.use('/api/contracts',    contractsRouter)
app.use('/api/revenue',      revenueRouter)
app.use('/api/activities',   activitiesRouter)
app.use('/api/risk-scores',  riskScoresRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () =>
  console.log(`[backend] Server running on http://localhost:${PORT}`)
)
