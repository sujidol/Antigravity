import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Activity } from 'lucide-react'
import { useAppData } from '../hooks/useAppData.js'

const TT_STYLE = { background: '#111111', border: '1px solid #1f1f1f', borderRadius: 10, fontSize: 12 }
const AXIS     = { fill: '#4b5563', fontSize: 11 }
const TIER_PALETTE = ['#6366f1', '#f59e0b', '#6b7280']
const TIER_COLORS  = { A: '#6366f1', B: '#f59e0b', C: '#6b7280' }

const ACTIVITY_ICONS = {
  meeting:   { bg: 'bg-indigo-500/20',  text: 'text-indigo-400',  label: '미팅' },
  call:      { bg: 'bg-blue-500/20',    text: 'text-blue-400',    label: '통화' },
  email:     { bg: 'bg-sky-500/20',     text: 'text-sky-400',     label: '이메일' },
  issue:     { bg: 'bg-red-500/20',     text: 'text-red-400',     label: '이슈' },
  milestone: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '마일스톤' },
  other:     { bg: 'bg-neutral-500/20', text: 'text-neutral-400', label: '기타' },
}

const fmtAmt  = (v) => v >= 100 ? `₩${(v / 100).toFixed(1)}억` : `₩${v}M`
const fmtFull = (v) => v >= 10000 ? `₩${(v / 10000).toFixed(1)}조` : v >= 100 ? `₩${(v / 100).toFixed(0)}억` : `₩${v}M`

function KPICard({ icon: Icon, label, value, sub, trend, color }) {
  const up = parseFloat(trend) >= 0
  return (
    <div className="card group hover:border-neutral-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.bg}`}>
          <Icon size={17} className={color.text} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-xs text-neutral-600 mt-1">{sub}</p>}
    </div>
  )
}

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{fmtAmt(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data, loading, error } = useAppData()

  if (loading) return <PageShell><p className="text-neutral-600 text-sm font-mono">데이터 로딩 중…</p></PageShell>
  if (error)   return <PageShell><p className="text-red-400 text-sm">{error}</p></PageShell>

  const {
    THIS_MONTH_REVENUE, MOM_GROWTH,
    ACTIVE_PARTNERS, TOTAL_PARTNERS,
    AVG_LTV, AVG_RISK,
    LAST_12_MONTHS, TIER_DISTRIBUTION, TOP_PARTNERS_LTV, ACTIVITIES,
  } = data

  const riskLevel = AVG_RISK < 30 ? 'Low' : AVG_RISK < 60 ? 'Medium' : 'High'
  const maxLtv    = TOP_PARTNERS_LTV[0]?.ltv ?? 1

  const kpis = [
    { icon: DollarSign,    label: '이번달 매출',  value: fmtAmt(THIS_MONTH_REVENUE), sub: '2026년 5월', trend: MOM_GROWTH, color: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' } },
    { icon: Users,         label: '활성 파트너',  value: `${ACTIVE_PARTNERS}개사`, sub: `전체 ${TOTAL_PARTNERS}개사 중`,                     color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' } },
    { icon: TrendingUp,    label: '평균 LTV',     value: fmtFull(AVG_LTV),           sub: '파트너당 누적 매출',                               color: { bg: 'bg-blue-500/15',    text: 'text-blue-400'    } },
    { icon: AlertTriangle, label: '평균 리스크',  value: `${AVG_RISK}점`,            sub: riskLevel,                                          color: { bg: 'bg-amber-500/15',   text: 'text-amber-400'   } },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <p className="text-neutral-500 text-sm mt-0.5">파트너 네트워크 현황 · 2026년 5월 기준</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Activity size={13} /><span>Live · 방금 업데이트</span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card">
          <div className="mb-5">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">월별 매출 추이</p>
            <p className="text-xs text-neutral-600 mt-0.5">최근 12개월 (2025.06 – 2026.05)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={LAST_12_MONTHS} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtAmt} tick={AXIS} axisLine={false} tickLine={false} width={68} />
              <Tooltip content={<AreaTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)"
                dot={false} activeDot={{ r: 5, fill: '#818cf8', stroke: '#1a1a2e', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card flex flex-col">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">파트너 등급 분포</p>
          <p className="text-xs text-neutral-600 mb-4">전체 {TOTAL_PARTNERS}개사</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <PieChart width={160} height={160}>
                <Pie data={TIER_DISTRIBUTION} dataKey="count" nameKey="tier"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3}>
                  {TIER_DISTRIBUTION.map((_, i) => <Cell key={i} fill={TIER_PALETTE[i]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => [`${v}개사`, `Tier ${n}`]} />
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white font-mono">{TOTAL_PARTNERS}</span>
                <span className="text-[10px] text-neutral-500">파트너</span>
              </div>
            </div>
          </div>
          <div className="flex justify-around mt-4">
            {TIER_DISTRIBUTION.map((t, i) => (
              <div key={t.tier} className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_PALETTE[i] }} />
                <span className="text-xs font-bold text-white">{t.count}</span>
                <span className="text-[10px] text-neutral-500">Tier {t.tier}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">파트너 LTV 순위 (Top 5)</p>
          <div className="space-y-4">
            {TOP_PARTNERS_LTV.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-mono text-neutral-600">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white font-medium truncate">{p.name}</span>
                    <span className="text-xs font-mono text-indigo-300 ml-2 shrink-0">{fmtFull(p.ltv)}</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(p.ltv / maxLtv) * 100}%`, background: `linear-gradient(90deg, ${TIER_COLORS[p.tier]}, ${TIER_COLORS[p.tier]}88)` }} />
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${p.tier === 'A' ? 'bg-indigo-500/20 text-indigo-300' : p.tier === 'B' ? 'bg-amber-500/20 text-amber-300' : 'bg-neutral-500/20 text-neutral-400'}`}>
                  {p.tier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-5">최근 활동</p>
          <div className="space-y-3">
            {ACTIVITIES.slice(0, 8).map(a => {
              const meta = ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.other
              const ago  = Math.round((Date.now() - new Date(a.created_at)) / 3600000)
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <span className={`text-[10px] font-bold ${meta.text}`}>{meta.label[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-200 leading-tight truncate">{a.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{a.partnerName} · {ago < 24 ? `${ago}h 전` : `${Math.floor(ago / 24)}d 전`}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.bg} ${meta.text} shrink-0`}>{meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PageShell({ children }) {
  return <div className="p-8">{children}</div>
}
