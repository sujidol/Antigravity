# Antigravity — Partner Management Dashboard

> 비즈니스 파트너 매출·리스크·성과 기반 의사결정 시스템  
> Mini-CRM + BI 대시보드 · React + Express + Supabase (PostgreSQL)

---

## 스크린샷

| Overview | Analytics | Risk |
|----------|-----------|------|
| KPI 카드 · 매출 추이 · 등급 분포 | MoM 성장률 · LTV 비교 · 산업군 분석 | 리스크 매트릭스 · 계약 만료 타임라인 |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express, JWT (RBAC) |
| Database | Supabase (PostgreSQL) |
| 인프라 | AWS (확장 대비) |

---

## 프로젝트 구조

```
Antigravity/
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   └── mockData.js        # 목 데이터 (Supabase 없이 동작)
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Sidebar.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Overview — KPI, 차트, 활동 피드
│   │       ├── Partners.jsx       # 파트너 목록 · 검색 · 필터
│   │       ├── Contracts.jsx      # 계약 현황 · 만료 관리
│   │       ├── Analytics.jsx      # 매출 분석 · 성장률 · LTV
│   │       └── Risk.jsx           # 리스크 매트릭스 · 고위험 파트너
│   └── package.json
├── backend/
│   └── src/
│       ├── index.js               # Express 서버
│       ├── routes/                # partners, contracts, revenue, activities, riskScores
│       ├── middleware/auth.js     # JWT 인증
│       └── lib/supabase.js
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # 테이블 · 뷰 · RLS 정책
├── install.txt                    # 설치 명령어 상세 정리
└── README.md
```

---

## 빠른 시작

### Supabase 없이 실행 (목 데이터 모드)

`.env` 파일 없이도 `src/data/mockData.js`의 15개 파트너·17개월 매출 데이터로 모든 페이지가 즉시 동작합니다.

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Supabase 연결 시 전체 실행

#### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → New Project
2. `supabase/migrations/001_initial_schema.sql` 전체를 **SQL Editor**에 붙여넣고 실행
3. Project Settings → API → URL / anon key 복사

#### 2. 환경변수 설정

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example  backend/.env
```

`frontend/.env`
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:4000
```

#### 3. 의존성 설치 및 실행

```bash
# Terminal 1 — Frontend (http://localhost:3000)
cd frontend && npm install && npm run dev

# Terminal 2 — Backend (http://localhost:4000)
cd backend  && npm install && npm run dev
```

---

## 페이지 구성

| 경로 | 페이지 | 주요 기능 |
|------|--------|-----------|
| `/dashboard` | Overview | 이번달 매출 · 활성 파트너 · 평균 LTV · 리스크 지수, 12개월 Area 차트, 등급 Donut, LTV Top 5, 최근 활동 피드 |
| `/partners` | Partners | 검색 · 상태/등급/산업 필터, LTV·리스크 정렬, 전체 파트너 테이블 |
| `/contracts` | Contracts | 계약 상태별 요약, 잔여일 경보 (30일·90일), 총 계약 규모 |
| `/analytics` | Analytics | MoM 성장률 바 차트, 파트너별 LTV 수평 바, 산업군별 매출 분해, YoY 비교 |
| `/risk` | Risk | Low/Medium/High 분포, LTV × 리스크 Scatter 매트릭스, 계약 만료 타임라인, 리스크 구성요소 테이블 |

---

## 데이터 모델

| 테이블 | 주요 필드 | 설명 |
|--------|-----------|------|
| `partners` | id, name, industry, status, tier | 파트너 기본 정보 (ENUM 상태 관리) |
| `contracts` | partner_id, start_date, end_date, value, status | 계약 이력 관리 |
| `revenues` | partner_id, date, amount | 시계열 매출 데이터 |
| `activities` | partner_id, type, title | 미팅·이슈·마일스톤 활동 로그 |
| `risk_scores` | partner_id, score, revenue_trend, contract_health, activity_level | 리스크 점수 및 구성 요소 |

### KPI 뷰 (Supabase)

| View | 설명 |
|------|------|
| `vw_monthly_revenue` | 월별 매출 집계 |
| `vw_partner_ltv` | 파트너 LTV 순위 |
| `vw_retention` | 계약 유지율 계산 |

---

## KPI 정의

| KPI | 정의 | 활용 목적 |
|-----|------|-----------|
| Monthly Revenue | 당월 전체 파트너 매출 합산 | 성장성 모니터링 |
| LTV | 파트너별 누적 매출 합계 | 전략적 투자 판단 |
| Retention Rate | 활성 계약 / 전체 계약 비율 | 파트너 안정성 |
| Risk Score | 매출추세 + 계약건강도 + 활동수준 가중 합산 | 리스크 대응 우선순위 |
| Partner Tier | A (핵심) / B (성장) / C (관찰) | 자원 배분 우선순위 |

---

## API 엔드포인트

모든 `/api/*` 요청에 `Authorization: Bearer <JWT>` 헤더 필요.

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/partners` | 파트너 목록 (status, industry 필터) |
| GET | `/api/partners/:id` | 파트너 상세 (계약·매출·활동 포함) |
| POST | `/api/partners` | 파트너 생성 |
| PATCH | `/api/partners/:id` | 파트너 수정 |
| GET | `/api/contracts/expiring` | 만료 예정 계약 |
| GET | `/api/revenue/monthly` | 월별 매출 |
| GET | `/api/revenue/ltv` | LTV 랭킹 |
| GET | `/api/risk-scores` | 전체 리스크 현황 |
| PUT | `/api/risk-scores/:partnerId` | 리스크 점수 갱신 |

---

## 목 데이터 구성 (`src/data/mockData.js`)

Supabase 없이 즉시 실행 가능한 데이터셋:

- 파트너 **15개사** — Tier A(5) / B(6) / C(3), 다양한 산업군
- **17개월 매출 시계열** — 2025.01 ~ 2026.05, 파트너별 성장/감소 패턴 반영
- **계약 15건** — 만료일·잔여일 자동 계산
- **활동 로그 12건** — 미팅, 통화, 이슈, 마일스톤
- **리스크 점수 15건** — 3개 구성요소(매출추세·계약건강도·활동수준) 포함
