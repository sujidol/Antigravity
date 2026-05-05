// Unified data layer.
// Uses Supabase when VITE_SUPABASE_URL is set; falls back to mock data otherwise.

import { supabase } from './supabase.js'
import * as mock from '../data/mockData.js'

const USE_SUPABASE = !!supabase

// ─── Mock fallback ────────────────────────────────────────────────────────────

function getMockData() {
  const ACTIVITIES = mock.ACTIVITIES.map(a => ({
    ...a,
    partnerName: mock.PARTNERS.find(p => p.id === a.partner_id)?.name ?? '',
  }))
  return {
    PARTNERS:          mock.PARTNERS,
    REVENUES:          mock.REVENUES,
    CONTRACTS:         mock.CONTRACTS,
    RISK_SCORES:       mock.RISK_SCORES,
    ACTIVITIES,
    PARTNERS_WITH_META: mock.PARTNERS_WITH_META,
    MONTHLY_TOTALS:    mock.MONTHLY_TOTALS,
    LAST_12_MONTHS:    mock.LAST_12_MONTHS,
    THIS_MONTH_REVENUE: mock.THIS_MONTH_REVENUE,
    PREV_MONTH_REVENUE: mock.PREV_MONTH_REVENUE,
    MOM_GROWTH:        mock.MOM_GROWTH,
    ACTIVE_PARTNERS:   mock.ACTIVE_PARTNERS,
    TOTAL_PARTNERS:    mock.TOTAL_PARTNERS,
    AVG_LTV:           mock.AVG_LTV,
    AVG_RISK:          mock.AVG_RISK,
    TIER_DISTRIBUTION: mock.TIER_DISTRIBUTION,
    TOP_PARTNERS_LTV:  mock.TOP_PARTNERS_LTV,
    INDUSTRY_REVENUE:  mock.INDUSTRY_REVENUE,
    RISK_LEVELS:       mock.RISK_LEVELS,
    PARTNERS_BY_RISK:  mock.PARTNERS_BY_RISK,
  }
}

// ─── Supabase fetch ───────────────────────────────────────────────────────────

async function fetchRaw() {
  const [pRes, rRes, cRes, aRes, rsRes] = await Promise.all([
    supabase.from('partners').select('*').order('created_at'),
    supabase.from('revenues').select('*').order('date'),
    supabase.from('contracts').select('*'),
    supabase.from('activities')
      .select('*, partners(name)')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase.from('risk_scores').select('*'),
  ])

  if (pRes.error) throw new Error(pRes.error.message)

  return {
    partners:   pRes.data  ?? [],
    revenues:   rRes.data  ?? [],
    contracts:  cRes.data  ?? [],
    activities: aRes.data  ?? [],
    riskScores: rsRes.data ?? [],
  }
}

// ─── Compute aggregates (same logic as mockData.js) ───────────────────────────

function genMonths(start, end) {
  const months = []
  let [y, m] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    if (++m > 12) { m = 1; y++ }
  }
  return months
}

function compute({ partners, revenues, contracts, activities, riskScores }) {
  // Monthly totals map
  const monthMap = {}
  revenues.forEach(r => {
    const key = String(r.date).slice(0, 7)
    monthMap[key] = (monthMap[key] ?? 0) + Number(r.amount)
  })

  const allMonths   = genMonths('2025-01', '2026-05')
  const MONTHLY_TOTALS = allMonths.map(m => ({
    label: m.slice(2).replace('-', '.'),   // "2025-01" → "25.01"
    month: m,
    total: monthMap[m] ?? 0,
  }))
  const LAST_12_MONTHS    = MONTHLY_TOTALS.slice(-12)
  const THIS_MONTH_REVENUE = MONTHLY_TOTALS.at(-1)?.total ?? 0
  const PREV_MONTH_REVENUE = MONTHLY_TOTALS.at(-2)?.total ?? 0
  const MOM_GROWTH = PREV_MONTH_REVENUE
    ? ((THIS_MONTH_REVENUE - PREV_MONTH_REVENUE) / PREV_MONTH_REVENUE * 100).toFixed(1)
    : '0.0'

  // Lookup maps
  const revByPartner      = {}
  const riskByPartner     = {}
  const contractsByPartner = {}
  revenues.forEach(r   => { (revByPartner[r.partner_id] ??= []).push(r) })
  riskScores.forEach(r => { riskByPartner[r.partner_id] = r })
  contracts.forEach(c  => { (contractsByPartner[c.partner_id] ??= []).push(c) })

  const PARTNERS_WITH_META = partners.map(p => {
    const revs = revByPartner[p.id]      ?? []
    const ltv  = revs.reduce((s, r) => s + Number(r.amount), 0)
    return { ...p, ltv, risk: riskByPartner[p.id] ?? null, contracts: contractsByPartner[p.id] ?? [], revenues: revs }
  })

  const ACTIVE_PARTNERS = partners.filter(p => p.status === 'active').length
  const TOTAL_PARTNERS  = partners.length
  const totalLTV        = PARTNERS_WITH_META.reduce((s, p) => s + p.ltv, 0)
  const AVG_LTV         = ACTIVE_PARTNERS ? Math.round(totalLTV / ACTIVE_PARTNERS) : 0
  const AVG_RISK        = riskScores.length
    ? +(riskScores.reduce((s, r) => s + r.score, 0) / riskScores.length).toFixed(1)
    : 0

  const TIER_DISTRIBUTION = ['A', 'B', 'C'].map(tier => ({
    tier, count: partners.filter(p => p.tier === tier).length,
  }))

  const TOP_PARTNERS_LTV = [...PARTNERS_WITH_META].sort((a, b) => b.ltv - a.ltv).slice(0, 5)

  const INDUSTRY_REVENUE = Object.entries(
    PARTNERS_WITH_META.reduce((m, p) => { m[p.industry] = (m[p.industry] ?? 0) + p.ltv; return m }, {})
  ).map(([industry, amount]) => ({ industry, amount }))
   .sort((a, b) => b.amount - a.amount).slice(0, 7)

  const RISK_LEVELS = {
    low:    riskScores.filter(r => r.score < 30).length,
    medium: riskScores.filter(r => r.score >= 30 && r.score < 60).length,
    high:   riskScores.filter(r => r.score >= 60).length,
  }

  const PARTNERS_BY_RISK = [...PARTNERS_WITH_META]
    .map(p => ({ ...p, riskScore: p.risk?.score ?? 0 }))
    .sort((a, b) => b.riskScore - a.riskScore)

  const ACTIVITIES = activities.map(a => ({
    ...a,
    partnerName: a.partners?.name ?? partners.find(p => p.id === a.partner_id)?.name ?? '',
  }))

  return {
    PARTNERS: partners, REVENUES: revenues, CONTRACTS: contracts,
    RISK_SCORES: riskScores, ACTIVITIES,
    PARTNERS_WITH_META, MONTHLY_TOTALS, LAST_12_MONTHS,
    THIS_MONTH_REVENUE, PREV_MONTH_REVENUE, MOM_GROWTH,
    ACTIVE_PARTNERS, TOTAL_PARTNERS, AVG_LTV, AVG_RISK,
    TIER_DISTRIBUTION, TOP_PARTNERS_LTV, INDUSTRY_REVENUE,
    RISK_LEVELS, PARTNERS_BY_RISK,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAllData() {
  if (!USE_SUPABASE) return getMockData()
  try {
    return compute(await fetchRaw())
  } catch (err) {
    console.warn('[api] Supabase fetch failed, using mock data:', err.message)
    return getMockData()
  }
}
