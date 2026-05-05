import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// GET /api/partners
router.get('/', async (req, res) => {
  const { status, industry, tier, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('partners')
    .select(`
      *,
      contracts(id, value, status, end_date),
      risk_scores(score)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)   query = query.eq('status', status)
  if (industry) query = query.eq('industry', industry)
  if (tier)     query = query.eq('tier', tier)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json({ data, total: count, page: Number(page), limit: Number(limit) })
})

// GET /api/partners/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('partners')
    .select(`
      *,
      contracts(*),
      revenues(date, amount),
      activities(*),
      risk_scores(*)
    `)
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Partner not found' })
  res.json(data)
})

// POST /api/partners
router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('partners')
    .insert(req.body)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// PATCH /api/partners/:id
router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('partners')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// DELETE /api/partners/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('partners')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
})

export default router
