import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// GET /api/activities?partner_id=&limit=
router.get('/', async (req, res) => {
  const { partner_id, limit = 20 } = req.query

  let query = supabaseAdmin
    .from('activities')
    .select('*, partners(name)')
    .order('created_at', { ascending: false })
    .limit(Number(limit))

  if (partner_id) query = query.eq('partner_id', partner_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/activities
router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .insert(req.body)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// DELETE /api/activities/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('activities')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
})

export default router
