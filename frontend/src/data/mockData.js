// All monetary amounts stored in M KRW (백만원).
// Display helper: (amount / 100).toFixed(1) + '억'

export const PARTNERS = [
  { id: 'p1',  name: '삼성전자',       industry: '전자/반도체',    status: 'active',    tier: 'A', contact_name: '김철수', contact_email: 'cs.kim@samsung.example.com',   created_at: '2022-01-15' },
  { id: 'p2',  name: '현대자동차',     industry: '자동차/모빌리티', status: 'active',    tier: 'A', contact_name: '이영희', contact_email: 'yh.lee@hyundai.example.com',   created_at: '2022-03-20' },
  { id: 'p3',  name: 'SK하이닉스',     industry: '반도체',         status: 'active',    tier: 'A', contact_name: '박준영', contact_email: 'jy.park@skhynix.example.com',  created_at: '2022-06-01' },
  { id: 'p4',  name: 'LG에너지솔루션', industry: '에너지/배터리',  status: 'active',    tier: 'A', contact_name: '최수진', contact_email: 'sj.choi@lges.example.com',     created_at: '2022-09-10' },
  { id: 'p5',  name: '포스코홀딩스',   industry: '철강/소재',       status: 'active',    tier: 'A', contact_name: '정해준', contact_email: 'hj.jung@posco.example.com',    created_at: '2023-01-05' },
  { id: 'p6',  name: '카카오',         industry: 'IT/플랫폼',       status: 'active',    tier: 'B', contact_name: '강민아', contact_email: 'ma.kang@kakao.example.com',    created_at: '2023-03-14' },
  { id: 'p7',  name: '네이버',         industry: 'IT/플랫폼',       status: 'active',    tier: 'B', contact_name: '윤서준', contact_email: 'sj.yoon@naver.example.com',    created_at: '2023-04-22' },
  { id: 'p8',  name: '이마트',         industry: '유통/리테일',     status: 'active',    tier: 'B', contact_name: '한지수', contact_email: 'js.han@emart.example.com',     created_at: '2023-07-11' },
  { id: 'p9',  name: 'CJ제일제당',     industry: '식품/생활',       status: 'active',    tier: 'B', contact_name: '임도현', contact_email: 'dh.lim@cj.example.com',        created_at: '2023-09-05' },
  { id: 'p10', name: '롯데케미칼',     industry: '화학/소재',       status: 'active',    tier: 'B', contact_name: '서지원', contact_email: 'jw.seo@lotte.example.com',     created_at: '2023-11-20' },
  { id: 'p11', name: '한화솔루션',     industry: '에너지/방산',     status: 'active',    tier: 'B', contact_name: '오민준', contact_email: 'mj.oh@hanwha.example.com',     created_at: '2024-01-08' },
  { id: 'p12', name: 'GS에너지',       industry: '에너지',          status: 'inactive',  tier: 'B', contact_name: '송가은', contact_email: 'ge.song@gsenergy.example.com', created_at: '2023-02-17' },
  { id: 'p13', name: '빙그레',         industry: '식품/음료',       status: 'active',    tier: 'C', contact_name: '조현우', contact_email: 'hw.cho@binggrae.example.com',  created_at: '2024-03-30' },
  { id: 'p14', name: '코오롱인더',     industry: '화학/섬유',       status: 'inactive',  tier: 'C', contact_name: '권나연', contact_email: 'ny.kwon@kolon.example.com',    created_at: '2023-06-25' },
  { id: 'p15', name: '두산에너빌리티', industry: '중공업/방산',     status: 'suspended', tier: 'C', contact_name: '유재석', contact_email: 'js.yu@doosan.example.com',     created_at: '2023-08-14' },
]

// Monthly revenue series per partner (17 months: Jan2025–May2026, index 0–16)
// Unit: M KRW (백만원)
const REV_SERIES = {
  p1:  [820, 850, 890, 930, 960, 1000, 1040, 1080, 1120, 1170, 1220, 1270, 1310, 1360, 1410, 1460, 1500],
  p2:  [620, 630, 650, 660, 680,  700,  720,  740,  760,  780,  800,  830,  850,  870,  890,  910,  930],
  p3:  [480, 490, 520, 500, 540,  570,  600,  580,  620,  650,  680,  710,  720,  750,  780,  810,  840],
  p4:  [460, 470, 490, 510, 520,  540,  560,  580,  600,  620,  640,  660,  680,  700,  720,  740,  760],
  p5:  [400, 410, 420, 430, 440,  450,  460,  470,  480,  490,  500,  510,  520,  530,  540,  550,  560],
  p6:  [260, 270, 280, 290, 300,  310,  320,  330,  340,  350,  360,  370,  380,  390,  400,  410,  420],
  p7:  [230, 240, 245, 250, 260,  270,  275,  285,  295,  305,  315,  325,  335,  345,  355,  365,  375],
  p8:  [170, 175, 180, 183, 187,  191,  195,  199,  203,  207,  211,  215,  219,  223,  227,  231,  235],
  p9:  [155, 158, 161, 164, 167,  170,  173,  176,  179,  182,  185,  188,  191,  194,  197,  200,  203],
  p10: [160, 158, 155, 153, 150,  148,  145,  143,  140,  138,  135,  133,  130,  127,  124,  121,  118],
  p11: [145, 146, 147, 148, 149,  150,  151,  152,  153,  154,  155,  156,  157,  158,  159,  160,  161],
  p12: [110,  90,  70,  50,  30,   10,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
  p13: [ 42,  43,  44,  45,  46,   47,   48,   49,   50,   51,   52,   53,   54,   55,   56,   57,   58],
  p14: [ 58,  52,  46,  40,  34,   28,   22,   16,   10,    5,    0,    0,    0,    0,    0,    0,    0],
  p15: [ 48,  40,  32,  24,  16,    8,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
}

const MONTH_LABELS = [
  '25.01','25.02','25.03','25.04','25.05','25.06',
  '25.07','25.08','25.09','25.10','25.11','25.12',
  '26.01','26.02','26.03','26.04','26.05',
]

export const REVENUES = Object.entries(REV_SERIES).flatMap(([pid, vals]) =>
  vals.map((amount, i) => ({
    id: `${pid}_${i}`,
    partner_id: pid,
    date: `20${MONTH_LABELS[i].replace('.', '-')}-01`,
    month_label: MONTH_LABELS[i],
    month_index: i,
    amount,
    currency: 'KRW',
  }))
)

export const CONTRACTS = [
  { id: 'c1',  partner_id: 'p1',  title: '전략 기술 파트너십 계약',  status: 'active',     value: 120000, currency: 'KRW', start_date: '2023-01-01', end_date: '2027-12-31' },
  { id: 'c2',  partner_id: 'p2',  title: '모빌리티 솔루션 공급 계약', status: 'active',     value:  85000, currency: 'KRW', start_date: '2024-03-01', end_date: '2027-02-28' },
  { id: 'c3',  partner_id: 'p3',  title: '반도체 협력 프레임워크',    status: 'active',     value:  70000, currency: 'KRW', start_date: '2024-06-01', end_date: '2027-05-31' },
  { id: 'c4',  partner_id: 'p4',  title: '배터리 소재 공급 계약',     status: 'active',     value:  90000, currency: 'KRW', start_date: '2022-07-01', end_date: '2027-06-30' },
  { id: 'c5',  partner_id: 'p5',  title: '소재 기술 협력 계약',       status: 'active',     value:  60000, currency: 'KRW', start_date: '2025-01-01', end_date: '2026-12-31' },
  { id: 'c6',  partner_id: 'p6',  title: '플랫폼 광고 솔루션 계약',   status: 'active',     value:  30000, currency: 'KRW', start_date: '2026-01-01', end_date: '2026-12-31' },
  { id: 'c7',  partner_id: 'p7',  title: '클라우드 인프라 공급 계약', status: 'active',     value:  35000, currency: 'KRW', start_date: '2025-06-01', end_date: '2027-05-31' },
  { id: 'c8',  partner_id: 'p8',  title: '리테일 데이터 파트너십',    status: 'active',     value:  20000, currency: 'KRW', start_date: '2026-03-01', end_date: '2027-02-28' },
  { id: 'c9',  partner_id: 'p9',  title: '공급망 최적화 계약',        status: 'active',     value:  18000, currency: 'KRW', start_date: '2026-01-01', end_date: '2026-12-31' },
  { id: 'c10', partner_id: 'p10', title: '화학소재 연구개발 계약',    status: 'active',     value:  25000, currency: 'KRW', start_date: '2025-09-01', end_date: '2027-08-31' },
  { id: 'c11', partner_id: 'p11', title: '에너지 솔루션 파트너십',    status: 'active',     value:  28000, currency: 'KRW', start_date: '2024-01-01', end_date: '2026-12-31' },
  { id: 'c12', partner_id: 'p12', title: '에너지 공급 기본 계약',     status: 'expired',    value:  18000, currency: 'KRW', start_date: '2023-01-01', end_date: '2025-06-30' },
  { id: 'c13', partner_id: 'p13', title: '식품유통 채널 계약',        status: 'active',     value:   5500, currency: 'KRW', start_date: '2026-04-01', end_date: '2027-03-31' },
  { id: 'c14', partner_id: 'p14', title: '소재 구매 계약',            status: 'expired',    value:  10000, currency: 'KRW', start_date: '2022-01-01', end_date: '2025-09-30' },
  { id: 'c15', partner_id: 'p15', title: '중공업 파트너십',           status: 'terminated', value:  15000, currency: 'KRW', start_date: '2023-01-01', end_date: '2025-12-31' },
]

export const ACTIVITIES = [
  { id: 'a1',  partner_id: 'p1',  type: 'meeting',   title: 'Q2 전략 검토 회의',         created_at: '2026-05-04T10:00:00Z' },
  { id: 'a2',  partner_id: 'p2',  type: 'call',      title: '모빌리티 로드맵 협의',       created_at: '2026-05-03T14:30:00Z' },
  { id: 'a3',  partner_id: 'p6',  type: 'issue',     title: '계약 갱신 조건 이슈 발생',   created_at: '2026-05-03T09:15:00Z' },
  { id: 'a4',  partner_id: 'p5',  type: 'milestone', title: '철강 공급 1,000억 달성',    created_at: '2026-05-02T16:00:00Z' },
  { id: 'a5',  partner_id: 'p3',  type: 'email',     title: 'HBM4 협력 제안 이메일',     created_at: '2026-05-02T11:20:00Z' },
  { id: 'a6',  partner_id: 'p9',  type: 'meeting',   title: '공급망 KPI 분기 리뷰',      created_at: '2026-05-01T13:00:00Z' },
  { id: 'a7',  partner_id: 'p11', type: 'call',      title: '계약 만료 전 협의 통화',     created_at: '2026-04-30T15:45:00Z' },
  { id: 'a8',  partner_id: 'p4',  type: 'meeting',   title: '배터리 소재 신규 라인 협의', created_at: '2026-04-29T10:30:00Z' },
  { id: 'a9',  partner_id: 'p7',  type: 'milestone', title: '클라우드 마이그레이션 완료', created_at: '2026-04-28T17:00:00Z' },
  { id: 'a10', partner_id: 'p12', type: 'issue',     title: '거래 중단 사후 처리 회의',   created_at: '2026-04-25T09:00:00Z' },
  { id: 'a11', partner_id: 'p1',  type: 'milestone', title: '연간 매출 1,000억 돌파',    created_at: '2026-04-20T12:00:00Z' },
  { id: 'a12', partner_id: 'p8',  type: 'meeting',   title: '리테일 데이터 활용 방안',    created_at: '2026-04-18T14:00:00Z' },
]

export const RISK_SCORES = [
  { partner_id: 'p1',  score: 12, revenue_trend: 10, contract_health: 8,  activity_level: 18, updated_at: '2026-05-01' },
  { partner_id: 'p2',  score: 18, revenue_trend: 15, contract_health: 12, activity_level: 27, updated_at: '2026-05-01' },
  { partner_id: 'p3',  score: 22, revenue_trend: 18, contract_health: 15, activity_level: 33, updated_at: '2026-05-01' },
  { partner_id: 'p4',  score: 15, revenue_trend: 12, contract_health: 10, activity_level: 23, updated_at: '2026-05-01' },
  { partner_id: 'p5',  score: 28, revenue_trend: 22, contract_health: 30, activity_level: 32, updated_at: '2026-05-01' },
  { partner_id: 'p6',  score: 45, revenue_trend: 38, contract_health: 55, activity_level: 42, updated_at: '2026-05-01' },
  { partner_id: 'p7',  score: 31, revenue_trend: 25, contract_health: 28, activity_level: 40, updated_at: '2026-05-01' },
  { partner_id: 'p8',  score: 29, revenue_trend: 24, contract_health: 20, activity_level: 43, updated_at: '2026-05-01' },
  { partner_id: 'p9',  score: 33, revenue_trend: 28, contract_health: 40, activity_level: 31, updated_at: '2026-05-01' },
  { partner_id: 'p10', score: 52, revenue_trend: 65, contract_health: 35, activity_level: 56, updated_at: '2026-05-01' },
  { partner_id: 'p11', score: 48, revenue_trend: 40, contract_health: 62, activity_level: 42, updated_at: '2026-05-01' },
  { partner_id: 'p12', score: 78, revenue_trend: 90, contract_health: 80, activity_level: 64, updated_at: '2026-05-01' },
  { partner_id: 'p13', score: 25, revenue_trend: 20, contract_health: 18, activity_level: 37, updated_at: '2026-05-01' },
  { partner_id: 'p14', score: 72, revenue_trend: 85, contract_health: 78, activity_level: 53, updated_at: '2026-05-01' },
  { partner_id: 'p15', score: 88, revenue_trend: 95, contract_health: 92, activity_level: 77, updated_at: '2026-05-01' },
]

// ─── Pre-computed Aggregates ──────────────────────────────────────────────────

const byPartnerId = (arr, key = 'partner_id') =>
  arr.reduce((m, r) => { (m[r[key]] ??= []).push(r); return m }, {})

const revByPartner = byPartnerId(REVENUES)

export function getPartnerWithMeta(id) {
  const p = PARTNERS.find(x => x.id === id)
  const revs = revByPartner[id] ?? []
  const ltv   = revs.reduce((s, r) => s + r.amount, 0)
  const risk  = RISK_SCORES.find(r => r.partner_id === id)
  const ctrs  = CONTRACTS.filter(c => c.partner_id === id)
  return { ...p, ltv, risk, contracts: ctrs, revenues: revs }
}

export const PARTNERS_WITH_META = PARTNERS.map(p => getPartnerWithMeta(p.id))

// Monthly totals (last 12 months: Jun2025=idx5 → May2026=idx16)
export const MONTHLY_TOTALS = MONTH_LABELS.map((label, i) => ({
  label,
  total: Object.values(REV_SERIES).reduce((s, arr) => s + arr[i], 0),
}))

export const LAST_12_MONTHS = MONTHLY_TOTALS.slice(5) // Jun2025–May2026

export const THIS_MONTH_REVENUE  = MONTHLY_TOTALS[16].total  // May 2026
export const PREV_MONTH_REVENUE  = MONTHLY_TOTALS[15].total  // Apr 2026
export const MOM_GROWTH = ((THIS_MONTH_REVENUE - PREV_MONTH_REVENUE) / PREV_MONTH_REVENUE * 100).toFixed(1)

export const ACTIVE_PARTNERS = PARTNERS.filter(p => p.status === 'active').length
export const TOTAL_PARTNERS  = PARTNERS.length

const totalLTV = REVENUES.reduce((s, r) => s + r.amount, 0)
export const AVG_LTV = Math.round(totalLTV / ACTIVE_PARTNERS)

export const AVG_RISK = +(RISK_SCORES.reduce((s, r) => s + r.score, 0) / RISK_SCORES.length).toFixed(1)

// Tier distribution
export const TIER_DISTRIBUTION = ['A', 'B', 'C'].map(tier => ({
  tier,
  count: PARTNERS.filter(p => p.tier === tier).length,
}))

// Top 5 partners by LTV
export const TOP_PARTNERS_LTV = PARTNERS_WITH_META
  .sort((a, b) => b.ltv - a.ltv)
  .slice(0, 5)

// Industry revenue
export const INDUSTRY_REVENUE = Object.entries(
  PARTNERS_WITH_META.reduce((m, p) => {
    m[p.industry] = (m[p.industry] ?? 0) + p.ltv; return m
  }, {})
).map(([industry, amount]) => ({ industry, amount }))
 .sort((a, b) => b.amount - a.amount)
 .slice(0, 7)

// Risk level counts
export const RISK_LEVELS = {
  low:    RISK_SCORES.filter(r => r.score < 30).length,
  medium: RISK_SCORES.filter(r => r.score >= 30 && r.score < 60).length,
  high:   RISK_SCORES.filter(r => r.score >= 60).length,
}

// Partners with risk sorted desc
export const PARTNERS_BY_RISK = PARTNERS_WITH_META
  .map(p => ({ ...p, riskScore: p.risk?.score ?? 0 }))
  .sort((a, b) => b.riskScore - a.riskScore)
