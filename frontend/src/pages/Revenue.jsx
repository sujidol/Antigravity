import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { revenueApi } from '../lib/supabase.js'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Revenue() {
  const [monthly, setMonthly] = useState(Array(12).fill(0).map((_, i) => ({ month: MONTHS[i], amount: 0 })))
  const [ltv,     setLtv]     = useState([])
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

  useEffect(() => {
    async function load() {
      const [rev, ltvData] = await Promise.all([
        revenueApi.getMonthly(year),
        revenueApi.getTotalLTV(),
      ])

      const byMonth = Array(12).fill(0)
      ;(rev.data ?? []).forEach(r => {
        const m = new Date(r.date).getMonth()
        byMonth[m] += Number(r.amount)
      })
      setMonthly(MONTHS.map((m, i) => ({ month: m, amount: byMonth[i] })))

      // LTV per partner
      const map = {}
      ;(ltvData.data ?? []).forEach(r => {
        map[r.partner_id] = (map[r.partner_id] ?? 0) + Number(r.amount)
      })
      setLtv(Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const fmtKRW = (v) => `₩${(v / 1e8).toFixed(1)}억`

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Revenue</h1>
        <p className="text-neutral-500 text-sm">{year}년 매출 현황</p>
      </div>

      {loading ? (
        <div className="text-neutral-600 text-sm font-mono">Loading…</div>
      ) : (
        <>
          <div className="card">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">Monthly Revenue</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtKRW} tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: 8 }}
                  labelStyle={{ color: '#a3a3a3' }}
                  formatter={(v) => [fmtKRW(v), 'Revenue']}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {ltv.length > 0 && (
            <div className="card">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Top Partner LTV</p>
              <div className="space-y-3">
                {ltv.map(([id, amount], i) => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-4 text-xs text-neutral-600 font-mono">{i + 1}</span>
                    <span className="flex-1 text-sm text-neutral-300 font-mono truncate">{id.slice(0, 8)}…</span>
                    <span className="text-sm font-mono text-emerald-400">{fmtKRW(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
