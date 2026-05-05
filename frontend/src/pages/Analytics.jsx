import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { BarChart2 } from 'lucide-react'
import {
  MONTHLY_TOTALS, PARTNERS_WITH_META, INDUSTRY_REVENUE, LAST_12_MONTHS,
} from '../data/mockData.js'

const TT = {
  contentStyle: { background: '#111111', border: '1px solid #1f1f1f', borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: '#6b7280' },
}
const AXIS = { fill: '#4b5563', fontSize: 11 }

const fmtAmt  = (v) => v >= 100 ? `₩${(v/100).toFixed(1)}억` : `₩${v}M`
const fmtFull = (v) => v >= 10000 ? `₩${(v/10000).toFixed(1)}조` : v >= 100 ? `₩${(v/100).toFixed(0)}억` : `₩${v}M`

// MoM growth data (last 12 months)
const MOM_DATA = LAST_12_MONTHS.map((m, i, arr) => {
  if (i === 0) return { label: m.label, growth: 0 }
  const prev = arr[i - 1].total
  return { label: m.label, growth: +((m.total - prev) / prev * 100).toFixed(1) }
}).slice(1)

// Top 8 partners by total LTV
const TOP8 = [...PARTNERS_WITH_META]
  .sort((a, b) => b.ltv - a.ltv)
  .slice(0, 8)
  .map(p => ({ name: p.name.replace('홀딩스', '').replace('에너지솔루션', '에솔'), ltv: p.ltv, tier: p.tier }))

function StatCard({ label, value, sub, accent = 'text-indigo-400' }) {
  return (
    <div className="card">
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-600 mt-1">{sub}</p>}
    </div>
  )
}

const TIER_COLOR = { A: '#6366f1', B: '#f59e0b', C: '#6b7280' }

// Annual totals
const YTD_2026 = MONTHLY_TOTALS.slice(12).reduce((s, m) => s + m.total, 0)
const FULL_2025 = MONTHLY_TOTALS.slice(0, 12).reduce((s, m) => s + m.total, 0)

// Best month
const bestMonth = [...LAST_12_MONTHS].sort((a, b) => b.total - a.total)[0]

export default function Analytics() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-neutral-500 text-sm mt-0.5">매출 분석 및 성장률 추적</p>
        </div>
        <BarChart2 size={20} className="text-neutral-600" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="2025 연간 매출"   value={fmtFull(FULL_2025)} sub="전체 12개월 합산" accent="text-indigo-400" />
        <StatCard label="2026 YTD 매출"    value={fmtFull(YTD_2026)}  sub="1–5월 누적"       accent="text-emerald-400" />
        <StatCard label="최고 월 매출"     value={fmtAmt(bestMonth.total)} sub={bestMonth.label} accent="text-amber-400" />
        <StatCard
          label="YoY 성장"
          value={`+${(((YTD_2026 / 5) / (FULL_2025 / 12) - 1) * 100).toFixed(1)}%`}
          sub="월평균 기준"
          accent="text-blue-400"
        />
      </div>

      {/* MoM Growth */}
      <div className="card">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">월별 성장률 (MoM %)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MOM_DATA} barSize={22} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              {...TT}
              formatter={(v) => [`${v > 0 ? '+' : ''}${v}%`, 'MoM 성장률']}
              cursor={{ fill: '#1f1f1f' }}
            />
            <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
              {MOM_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.growth >= 0 ? '#6366f1' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top 8 partners by LTV */}
        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">파트너별 LTV 비교 (Top 8)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TOP8} layout="vertical" barSize={14} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
              <XAxis type="number" tickFormatter={fmtFull} tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                {...TT}
                formatter={(v) => [fmtFull(v), 'LTV']}
                cursor={{ fill: '#1a1a1a' }}
              />
              <Bar dataKey="ltv" radius={[0, 4, 4, 0]}>
                {TOP8.map((p) => (
                  <Cell key={p.name} fill={TIER_COLOR[p.tier]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-800">
            {['A', 'B', 'C'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: TIER_COLOR[t] }} />
                Tier {t}
              </div>
            ))}
          </div>
        </div>

        {/* Industry Revenue Breakdown */}
        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">산업군별 누적 매출</p>
          <div className="space-y-3">
            {INDUSTRY_REVENUE.map((row, i) => {
              const pct = (row.amount / INDUSTRY_REVENUE[0].amount * 100).toFixed(0)
              const colors = ['#6366f1','#818cf8','#a5b4fc','#c7d2fe','#e0e7ff','#f5f3ff','#fafafa']
              return (
                <div key={row.industry}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-neutral-300">{row.industry}</span>
                    <span className="text-xs font-mono text-neutral-400">{fmtFull(row.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: colors[i] ?? '#374151' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trend multi-line by tier */}
      <div className="card">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">월별 매출 추이 (최근 12개월)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={LAST_12_MONTHS} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtAmt} tick={AXIS} axisLine={false} tickLine={false} width={68} />
            <Tooltip {...TT} formatter={(v) => [fmtAmt(v), '매출']} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#818cf8', stroke: '#000', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
