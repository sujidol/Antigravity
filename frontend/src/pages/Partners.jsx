import { useState, useMemo } from 'react'
import { Search, Users } from 'lucide-react'
import { PARTNERS_WITH_META } from '../data/mockData.js'

const fmtFull = (v) => v >= 100 ? `₩${(v/100).toFixed(0)}억` : `₩${v}M`

const TIER_CLS   = {
  A: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  B: 'bg-amber-500/20  text-amber-300  border border-amber-500/30',
  C: 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30',
}
const STATUS_CLS = {
  active:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  inactive:  'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30',
  suspended: 'bg-red-500/20     text-red-300     border border-red-500/30',
  prospect:  'bg-blue-500/20    text-blue-300    border border-blue-500/30',
}
const STATUS_LABEL = { active: '활성', inactive: '비활성', suspended: '정지', prospect: '잠재' }

const STATUSES    = ['active', 'inactive', 'suspended', 'prospect']
const TIERS       = ['A', 'B', 'C']
const INDUSTRIES  = [...new Set(PARTNERS_WITH_META.map(p => p.industry))].sort()

export default function Partners() {
  const [search,    setSearch]    = useState('')
  const [filterSt,  setFilterSt]  = useState('')
  const [filterTier,setFilterTier]= useState('')
  const [filterInd, setFilterInd] = useState('')
  const [sortKey,   setSortKey]   = useState('ltv')
  const [sortDir,   setSortDir]   = useState('desc')

  const partners = useMemo(() => {
    let rows = [...PARTNERS_WITH_META]
    if (search)     rows = rows.filter(p => p.name.includes(search) || p.industry.includes(search))
    if (filterSt)   rows = rows.filter(p => p.status === filterSt)
    if (filterTier) rows = rows.filter(p => p.tier   === filterTier)
    if (filterInd)  rows = rows.filter(p => p.industry === filterInd)
    rows.sort((a, b) => {
      const va = sortKey === 'ltv' ? a.ltv : sortKey === 'risk' ? (a.risk?.score ?? 0) : a.name
      const vb = sortKey === 'ltv' ? b.ltv : sortKey === 'risk' ? (b.risk?.score ?? 0) : b.name
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return rows
  }, [search, filterSt, filterTier, filterInd, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortArrow = ({ k }) => sortKey === k
    ? <span className="text-indigo-400 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>
    : <span className="text-neutral-700 ml-0.5">↕</span>

  // Summary stats
  const counts = {
    active:    PARTNERS_WITH_META.filter(p => p.status === 'active').length,
    inactive:  PARTNERS_WITH_META.filter(p => p.status === 'inactive').length,
    suspended: PARTNERS_WITH_META.filter(p => p.status === 'suspended').length,
    prospect:  PARTNERS_WITH_META.filter(p => p.status === 'prospect').length,
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Partners</h1>
          <p className="text-neutral-500 text-sm mt-0.5">비즈니스 파트너 관리</p>
        </div>
        <Users size={20} className="text-neutral-600" />
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterSt(f => f === s ? '' : s)}
            className={`card text-left transition-all cursor-pointer ${filterSt === s ? 'border-indigo-500/50 bg-indigo-500/5' : 'hover:border-neutral-600'}`}
          >
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{STATUS_LABEL[s]}</p>
            <p className={`text-2xl font-bold font-mono ${STATUS_CLS[s].split(' ')[1]}`}>{counts[s]}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="파트너명 또는 산업 검색…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>
        <Select value={filterTier} onChange={setFilterTier} placeholder="등급" options={TIERS.map(t => ({ value: t, label: `Tier ${t}` }))} />
        <Select value={filterInd}  onChange={setFilterInd}  placeholder="산업군" options={INDUSTRIES.map(i => ({ value: i, label: i }))} />
        {(filterSt || filterTier || filterInd || search) && (
          <button
            onClick={() => { setSearch(''); setFilterSt(''); setFilterTier(''); setFilterInd('') }}
            className="px-3 py-2 text-xs text-neutral-500 hover:text-white border border-neutral-800 rounded-lg hover:border-neutral-600 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <p className="text-xs text-neutral-500">{partners.length}개 파트너</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">파트너명</th>
                <th className="text-left px-5 py-3 font-medium">산업군</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium">등급</th>
                <th
                  className="text-left px-5 py-3 font-medium cursor-pointer hover:text-neutral-300 transition-colors select-none"
                  onClick={() => toggleSort('ltv')}
                >
                  LTV <SortArrow k="ltv" />
                </th>
                <th
                  className="text-left px-5 py-3 font-medium cursor-pointer hover:text-neutral-300 transition-colors select-none"
                  onClick={() => toggleSort('risk')}
                >
                  리스크 <SortArrow k="risk" />
                </th>
                <th className="text-left px-5 py-3 font-medium">담당자</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => {
                const rs = p.risk?.score ?? null
                const riskCl = rs === null ? 'text-neutral-600'
                  : rs < 30 ? 'text-emerald-400' : rs < 60 ? 'text-amber-400' : 'text-red-400'
                return (
                  <tr key={p.id} className="border-b border-neutral-800/40 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-5 py-3 text-neutral-400 text-xs">{p.industry}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {p.tier && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${TIER_CLS[p.tier]}`}>
                          Tier {p.tier}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-indigo-300">{fmtFull(p.ltv)}</td>
                    <td className="px-5 py-3">
                      {rs !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${rs}%`,
                                background: rs < 30 ? '#10b981' : rs < 60 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className={`text-xs font-mono ${riskCl}`}>{rs}</span>
                        </div>
                      ) : <span className="text-neutral-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">{p.contact_name}</td>
                  </tr>
                )
              })}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-600 text-sm">
                    조건에 맞는 파트너가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Select({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-indigo-500/60 transition-colors appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
