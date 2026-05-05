import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// GET /api/risk-scores
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('risk_scores')
    .select('*, partners(name, industry, status, tier)')
    .order('score', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/risk-scores/:partnerId
router.get('/:partnerId', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('risk_scores')
    .select('*')
    .eq('partner_id', req.params.partnerId)
    .single()

  if (error) return res.status(404).json({ error: 'Risk score not found' })
  res.json(data)
})

// PUT /api/risk-scores/:partnerId  — upsert
router.put('/:partnerId', async (req, res) => {
  const payload = {
    partner_id: req.params.partnerId,
    ...req.body,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('risk_scores')
    .upsert(payload, { onConflict: 'partner_id' })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
