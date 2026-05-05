import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// GET /api/contracts?partner_id=&status=
router.get('/', async (req, res) => {
  const { partner_id, status } = req.query

  let query = supabaseAdmin
    .from('contracts')
    .select('*, partners(name, industry)')
    .order('end_date', { ascending: true })

  if (partner_id) query = query.eq('partner_id', partner_id)
  if (status)     query = query.eq('status', status)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/contracts/expiring?days=30
router.get('/expiring', async (req, res) => {
  const days = Number(req.query.days ?? 30)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + days)

  const { data, error } = await supabaseAdmin
    .from('contracts')
    .select('*, partners(name, industry, tier)')
    .eq('status', 'active')
    .lte('end_date', threshold.toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('end_date')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/contracts
router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('contracts')
    .insert(req.body)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// PATCH /api/contracts/:id
router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('contracts')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
