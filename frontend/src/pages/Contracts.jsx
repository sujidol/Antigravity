import { useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { CONTRACTS, PARTNERS } from '../data/mockData.js'

const fmtFull = (v) => v >= 100 ? `₩${(v/100).toFixed(0)}억` : `₩${v}M`

const STATUS_CLS = {
  active:     'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  expired:    'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30',
  terminated: 'bg-red-500/20     text-red-300     border border-red-500/30',
  pending:    'bg-blue-500/20    text-blue-300    border border-blue-500/30',
}
const STATUS_LABEL = { active: '활성', expired: '만료', terminated: '해지', pending: '대기' }
const TIER_CLS     = {
  A: 'bg-indigo-500/20 text-indigo-300',
  B: 'bg-amber-500/20  text-amber-300',
  C: 'bg-neutral-500/20 text-neutral-400',
}

const TODAY = new Date('2026-05-05')

const CONTRACTS_WITH_PARTNER = CONTRACTS.map(c => {
  const p = PARTNERS.find(x => x.id === c.partner_id)
  const daysLeft = Math.ceil((new Date(c.end_date) - TODAY) / 86400000)
  return { ...c, partnerName: p?.name, tier: p?.tier, daysLeft }
}).sort((a, b) => new Date(a.end_date) - new Date(b.end_date))

const STATUSES = ['active', 'expired', 'terminated', 'pending']

export default function Contracts() {
  const [filterStatus, setFilterStatus] = useState('')

  const contracts = useMemo(() =>
    filterStatus ? CONTRACTS_WITH_PARTNER.filter(c => c.status === filterStatus) : CONTRACTS_WITH_PARTNER,
    [filterStatus]
  )

  // Summary
  const counts = STATUSES.reduce((m, s) => {
    m[s] = CONTRACTS.filter(c => c.status === s).length; return m
  }, {})

  const totalActiveValue = CONTRACTS.filter(c => c.status === 'active').reduce((s, c) => s + c.value, 0)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contracts</h1>
          <p className="text-neutral-500 text-sm mt-0.5">계약 현황 및 만료 관리</p>
        </div>
        <FileText size={20} className="text-neutral-600" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map(s => (
          <div key={s} className={`card cursor-pointer transition-all hover:border-neutral-600 ${filterStatus === s ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}
            onClick={() => setFilterStatus(f => f === s ? '' : s)}>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{STATUS_LABEL[s]}</p>
            <p className={`text-2xl font-bold font-mono ${STATUS_CLS[s].split(' ')[1]}`}>{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Active contract total value */}
      <div className="card flex items-center gap-4 bg-indigo-500/5 border-indigo-500/20">
        <div className="flex-1">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">활성 계약 총 규모</p>
          <p className="text-2xl font-bold text-indigo-300 font-mono mt-1">{fmtFull(totalActiveValue)}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{counts.active}건 계약 합산</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
              {['파트너', '계약명', '등급', '상태', '계약 규모', '시작일', '만료일', '잔여일'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => {
              const urgency = c.status === 'active' && c.daysLeft <= 30 ? 'text-red-400'
                            : c.status === 'active' && c.daysLeft <= 90 ? 'text-amber-400'
                            : 'text-neutral-400'
              return (
                <tr key={c.id} className="border-b border-neutral-800/40 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{c.partnerName}</td>
                  <td className="px-5 py-3 text-neutral-400 max-w-[180px] truncate">{c.title}</td>
                  <td className="px-5 py-3">
                    {c.tier && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${TIER_CLS[c.tier]}`}>
                        {c.tier}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLS[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-emerald-400">{fmtFull(c.value)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{c.start_date}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-300">{c.end_date}</td>
                  <td className="px-5 py-3">
                    {c.status === 'active' ? (
                      <span className={`font-mono text-xs ${urgency}`}>
                        {c.daysLeft > 0 ? `${c.daysLeft}일` : '오늘'}
                      </span>
                    ) : <span className="text-neutral-700 text-xs">—</span>}
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
