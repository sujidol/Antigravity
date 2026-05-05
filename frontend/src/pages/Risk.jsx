import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
} from 'recharts'
import { Shield, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react'
import {
  PARTNERS_BY_RISK, RISK_LEVELS, RISK_SCORES, PARTNERS, CONTRACTS,
  PARTNERS_WITH_META,
} from '../data/mockData.js'

const AXIS  = { fill: '#4b5563', fontSize: 11 }
const TT    = {
  contentStyle: { background: '#111111', border: '1px solid #1f1f1f', borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: '#6b7280' },
}

const fmtFull = (v) => v >= 100 ? `₩${(v/100).toFixed(0)}억` : `₩${v}M`

function riskColor(score) {
  if (score < 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', bar: '#10b981' }
  if (score < 60) return { text: 'text-amber-400',   bg: 'bg-amber-500/15',   bar: '#f59e0b' }
  return              { text: 'text-red-400',    bg: 'bg-red-500/15',    bar: '#ef4444' }
}

function riskLabel(score) {
  if (score < 30) return 'Low'
  if (score < 60) return 'Medium'
  return 'High'
}

// Scatter data: x=LTV, y=risk score per partner
const SCATTER_DATA = PARTNERS_WITH_META.map(p => ({
  name:  p.name,
  ltv:   p.ltv,
  score: p.risk?.score ?? 0,
  tier:  p.tier,
}))

const TIER_COLOR = { A: '#6366f1', B: '#f59e0b', C: '#6b7280' }

// Expiring contracts (within 180 days from 2026-05-05)
const TODAY    = new Date('2026-05-05')
const HORIZON  = new Date('2026-11-01')
const EXPIRING = CONTRACTS
  .filter(c => {
    const end = new Date(c.end_date)
    return c.status === 'active' && end >= TODAY && end <= HORIZON
  })
  .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
  .map(c => {
    const partner = PARTNERS.find(p => p.id === c.partner_id)
    const daysLeft = Math.ceil((new Date(c.end_date) - TODAY) / 86400000)
    return { ...c, partnerName: partner?.name, tier: partner?.tier, daysLeft }
  })

const CustomScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-white mb-1">{d.name}</p>
      <p className="text-xs text-neutral-400">LTV: <span className="text-neutral-200">{fmtFull(d.ltv)}</span></p>
      <p className="text-xs text-neutral-400">리스크: <span className={riskColor(d.score).text}>{d.score}점 ({riskLabel(d.score)})</span></p>
    </div>
  )
}

export default function Risk() {
  const highRisk = PARTNERS_BY_RISK.filter(p => p.riskScore >= 60)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Risk Assessment</h1>
          <p className="text-neutral-500 text-sm mt-0.5">파트너 리스크 분석 및 계약 만료 모니터링</p>
        </div>
        <Shield size={20} className="text-neutral-600" />
      </div>

      {/* Risk Level Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Low Risk</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">{RISK_LEVELS.low}</p>
            <p className="text-xs text-neutral-600">점수 0–29</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Medium Risk</p>
            <p className="text-2xl font-bold font-mono text-amber-400">{RISK_LEVELS.medium}</p>
            <p className="text-xs text-neutral-600">점수 30–59</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
            <AlertOctagon size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">High Risk</p>
            <p className="text-2xl font-bold font-mono text-red-400">{RISK_LEVELS.high}</p>
            <p className="text-xs text-neutral-600">점수 60–100</p>
          </div>
        </div>
      </div>

      {/* Scatter + High Risk table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Scatter: LTV vs Risk */}
        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">LTV vs 리스크 매트릭스</p>
          <p className="text-xs text-neutral-600 mb-5">좌측 상단 = 고가치 / 저위험 (이상적)</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ left: -10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                type="number"
                dataKey="ltv"
                name="LTV"
                tickFormatter={fmtFull}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                label={{ value: 'LTV →', position: 'insideBottomRight', offset: -5, fill: '#374151', fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="score"
                name="리스크"
                domain={[0, 100]}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                label={{ value: '리스크 ↑', angle: -90, position: 'insideLeft', offset: 15, fill: '#374151', fontSize: 10 }}
              />
              <Tooltip content={<CustomScatterTooltip />} cursor={{ stroke: '#374151' }} />
              <Scatter data={SCATTER_DATA} fill="#6366f1">
                {SCATTER_DATA.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.score >= 60 ? '#ef4444' : entry.score >= 30 ? '#f59e0b' : '#10b981'}
                    opacity={0.85}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 pt-3 border-t border-neutral-800">
            {[['#10b981', 'Low (< 30)'], ['#f59e0b', 'Medium (30–59)'], ['#ef4444', 'High (≥ 60)']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /> {l}
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Partners */}
        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">고위험 파트너 ({highRisk.length}개사)</p>
          <div className="space-y-3">
            {PARTNERS_BY_RISK.slice(0, 8).map(p => {
              const c    = riskColor(p.riskScore)
              const risk = RISK_SCORES.find(r => r.partner_id === p.id)
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium truncate">{p.name}</span>
                      <span className={`text-xs font-mono font-bold ml-2 ${c.text}`}>{p.riskScore}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.riskScore}%`, background: c.bar }}
                      />
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${c.bg} ${c.text} font-medium shrink-0 w-14 text-center`}>
                    {riskLabel(p.riskScore)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contract Expiry Timeline */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">계약 만료 예정 (180일 이내)</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              {['파트너', '계약명', '계약 규모', '만료일', '잔여일', '긴급도'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-neutral-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EXPIRING.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-neutral-600 text-sm">
                  180일 내 만료 예정 계약 없음
                </td>
              </tr>
            )}
            {EXPIRING.map(c => {
              const urgency = c.daysLeft <= 30 ? { text: 'text-red-400',   bg: 'bg-red-500/15',   label: '긴급' }
                            : c.daysLeft <= 90 ? { text: 'text-amber-400', bg: 'bg-amber-500/15', label: '주의' }
                            :                    { text: 'text-blue-400',  bg: 'bg-blue-500/15',  label: '검토' }
              return (
                <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{c.partnerName}</td>
                  <td className="px-5 py-3 text-neutral-400 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 py-3 font-mono text-emerald-400">{fmtFull(c.value)}</td>
                  <td className="px-5 py-3 font-mono text-sm text-neutral-300">{c.end_date}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs ${urgency.text}`}>{c.daysLeft}일</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${urgency.bg} ${urgency.text}`}>
                      {urgency.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Risk Component Breakdown */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">리스크 구성 요소 (전체 파트너)</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              {['파트너', '종합 점수', '매출 추세', '계약 건전성', '활동 수준'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-neutral-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARTNERS_BY_RISK.map(p => {
              const c = riskColor(p.riskScore)
              return (
                <tr key={p.id} className="border-b border-neutral-800/40 hover:bg-neutral-800/20 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-white">{p.name}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-sm font-mono font-bold ${c.text}`}>{p.riskScore}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <ScoreBar value={p.risk?.revenue_trend ?? 0} />
                  </td>
                  <td className="px-5 py-2.5">
                    <ScoreBar value={p.risk?.contract_health ?? 0} />
                  </td>
                  <td className="px-5 py-2.5">
                    <ScoreBar value={p.risk?.activity_level ?? 0} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScoreBar({ value }) {
  const c = value < 30 ? '#10b981' : value < 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: c }} />
      </div>
      <span className="text-xs font-mono text-neutral-400">{value}</span>
    </div>
  )
}
