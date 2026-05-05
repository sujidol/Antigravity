import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ─── Partners ────────────────────────────────────────────────────────────────

export const partnersApi = {
  getAll: (filters = {}) => {
    let query = supabase
      .from('partners')
      .select(`
        *,
        contracts(id, value, start_date, end_date, status),
        risk_scores(score, updated_at)
      `)
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.industry) query = query.eq('industry', filters.industry)
    return query
  },

  getById: (id) =>
    supabase
      .from('partners')
      .select(`
        *,
        contracts(*),
        revenues(*),
        activities(*),
        risk_scores(*)
      `)
      .eq('id', id)
      .single(),

  create: (data) => supabase.from('partners').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('partners').update(data).eq('id', id).select().single(),

  delete: (id) => supabase.from('partners').delete().eq('id', id),
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export const contractsApi = {
  getByPartner: (partnerId) =>
    supabase
      .from('contracts')
      .select('*')
      .eq('partner_id', partnerId)
      .order('start_date', { ascending: false }),

  getExpiringSoon: (days = 30) => {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + days)
    return supabase
      .from('contracts')
      .select('*, partners(name, industry)')
      .eq('status', 'active')
      .lte('end_date', threshold.toISOString())
      .gte('end_date', new Date().toISOString())
      .order('end_date')
  },

  create: (data) => supabase.from('contracts').insert(data).select().single(),

  update: (id, data) =>
    supabase.from('contracts').update(data).eq('id', id).select().single(),
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export const revenueApi = {
  getMonthly: (year) =>
    supabase
      .from('revenues')
      .select('date, amount, partner_id')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .order('date'),

  getByPartner: (partnerId, limit = 12) =>
    supabase
      .from('revenues')
      .select('*')
      .eq('partner_id', partnerId)
      .order('date', { ascending: false })
      .limit(limit),

  getTotalLTV: () =>
    supabase.from('revenues').select('partner_id, amount'),

  create: (data) => supabase.from('revenues').insert(data).select().single(),
}

// ─── Activities ───────────────────────────────────────────────────────────────

export const activitiesApi = {
  getByPartner: (partnerId, limit = 20) =>
    supabase
      .from('activities')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(limit),

  getRecent: (limit = 10) =>
    supabase
      .from('activities')
      .select('*, partners(name)')
      .order('created_at', { ascending: false })
      .limit(limit),

  create: (data) => supabase.from('activities').insert(data).select().single(),
}

// ─── Risk Scores ──────────────────────────────────────────────────────────────

export const riskApi = {
  getAll: () =>
    supabase
      .from('risk_scores')
      .select('*, partners(name, industry, status)')
      .order('score', { ascending: false }),

  getByPartner: (partnerId) =>
    supabase
      .from('risk_scores')
      .select('*')
      .eq('partner_id', partnerId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),

  upsert: (data) =>
    supabase
      .from('risk_scores')
      .upsert(data, { onConflict: 'partner_id' })
      .select()
      .single(),
}
