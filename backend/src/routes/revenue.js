import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// GET /api/revenue?year=2025&partner_id=
router.get('/', async (req, res) => {
  const { year = new Date().getFullYear(), partner_id } = req.query

  let query = supabaseAdmin
    .from('revenues')
    .select('*')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date')

  if (partner_id) query = query.eq('partner_id', partner_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/revenue/monthly — aggregated monthly totals
router.get('/monthly', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('vw_monthly_revenue')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/revenue/ltv — partner LTV ranking
router.get('/ltv', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('vw_partner_ltv')
    .select('*')
    .order('ltv', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/revenue
router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('revenues')
    .insert(req.body)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

export default router
