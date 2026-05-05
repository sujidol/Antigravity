-- ============================================================
--  Antigravity — Partner Management Dashboard
--  Migration 001: Initial Schema + Seed Data
-- ============================================================

-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM Types ──────────────────────────────────────────────

CREATE TYPE partner_status  AS ENUM ('active', 'inactive', 'suspended', 'prospect');
CREATE TYPE partner_tier    AS ENUM ('A', 'B', 'C');
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated', 'pending');
CREATE TYPE activity_type   AS ENUM ('meeting', 'call', 'email', 'issue', 'milestone', 'other');

-- ─── Partners ────────────────────────────────────────────────

CREATE TABLE partners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  industry      TEXT NOT NULL,
  status        partner_status NOT NULL DEFAULT 'prospect',
  tier          partner_tier,
  description   TEXT,
  website       TEXT,
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_status   ON partners(status);
CREATE INDEX idx_partners_industry ON partners(industry);
CREATE INDEX idx_partners_tier     ON partners(tier);

-- ─── Contracts ───────────────────────────────────────────────

CREATE TABLE contracts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      contract_status NOT NULL DEFAULT 'pending',
  value       NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency    CHAR(3) NOT NULL DEFAULT 'KRW',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_contracts_partner_id ON contracts(partner_id);
CREATE INDEX idx_contracts_status     ON contracts(status);
CREATE INDEX idx_contracts_end_date   ON contracts(end_date);

-- ─── Revenue ──────────────────────────────────────────────────
-- amount 단위: M KRW (백만원). 예) 820 = ₩820,000,000 = ₩8.2억

CREATE TABLE revenues (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  amount      NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency    CHAR(3) NOT NULL DEFAULT 'KRW',
  category    TEXT,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenues_partner_id   ON revenues(partner_id);
CREATE INDEX idx_revenues_date         ON revenues(date);
CREATE INDEX idx_revenues_partner_date ON revenues(partner_id, date DESC);

-- ─── Activities ───────────────────────────────────────────────

CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  type        activity_type NOT NULL DEFAULT 'other',
  title       TEXT NOT NULL,
  description TEXT,
  meeting_at  TIMESTAMPTZ,
  created_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_partner_id ON activities(partner_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- ─── Risk Scores ──────────────────────────────────────────────

CREATE TABLE risk_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id      UUID NOT NULL UNIQUE REFERENCES partners(id) ON DELETE CASCADE,
  score           SMALLINT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  revenue_trend   SMALLINT DEFAULT 0 CHECK (revenue_trend   BETWEEN 0 AND 100),
  contract_health SMALLINT DEFAULT 0 CHECK (contract_health BETWEEN 0 AND 100),
  activity_level  SMALLINT DEFAULT 0 CHECK (activity_level  BETWEEN 0 AND 100),
  note            TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_partner_id ON risk_scores(partner_id);
CREATE INDEX idx_risk_scores_score      ON risk_scores(score DESC);

-- ─── Auto-update updated_at ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── KPI Views ────────────────────────────────────────────────

CREATE VIEW vw_monthly_revenue AS
SELECT
  DATE_TRUNC('month', date)   AS month,
  SUM(amount)                 AS total_amount,
  COUNT(DISTINCT partner_id)  AS partner_count
FROM revenues
GROUP BY 1
ORDER BY 1;

CREATE VIEW vw_partner_ltv AS
SELECT
  p.id,
  p.name,
  p.industry,
  p.tier,
  COALESCE(SUM(r.amount), 0) AS ltv,
  COUNT(DISTINCT c.id)       AS contract_count,
  MAX(c.end_date)            AS latest_contract_end
FROM partners p
LEFT JOIN revenues  r ON r.partner_id = p.id
LEFT JOIN contracts c ON c.partner_id = p.id
GROUP BY p.id, p.name, p.industry, p.tier;

CREATE VIEW vw_retention AS
SELECT
  p.id,
  p.name,
  p.status,
  COUNT(c.id) FILTER (WHERE c.status = 'active')  AS active_contracts,
  COUNT(c.id) FILTER (WHERE c.status = 'expired') AS expired_contracts,
  ROUND(
    100.0 * COUNT(c.id) FILTER (WHERE c.status = 'active')
    / NULLIF(COUNT(c.id), 0),
    1
  ) AS retention_rate
FROM partners p
LEFT JOIN contracts c ON c.partner_id = p.id
GROUP BY p.id, p.name, p.status;

-- ─── Row Level Security (RLS) ─────────────────────────────────

ALTER TABLE partners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

-- 개발용 전체 허용 정책 — 운영 환경에서는 RBAC 정책으로 교체
CREATE POLICY "dev_allow_all_partners"    ON partners    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_contracts"   ON contracts   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_revenues"    ON revenues    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_activities"  ON activities  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_risk_scores" ON risk_scores FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
--  Seed Data — mockData.js 와 동일한 15개 파트너 데이터
--  amount 단위: M KRW (백만원)
-- ============================================================

DO $$
DECLARE
  id_p1  UUID; id_p2  UUID; id_p3  UUID; id_p4  UUID; id_p5  UUID;
  id_p6  UUID; id_p7  UUID; id_p8  UUID; id_p9  UUID; id_p10 UUID;
  id_p11 UUID; id_p12 UUID; id_p13 UUID; id_p14 UUID; id_p15 UUID;
BEGIN

-- ─── Partners ─────────────────────────────────────────────────

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('삼성전자', '전자/반도체', 'active', 'A', '김철수', 'cs.kim@samsung.example.com', '2022-01-15', '2022-01-15')
RETURNING id INTO id_p1;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('현대자동차', '자동차/모빌리티', 'active', 'A', '이영희', 'yh.lee@hyundai.example.com', '2022-03-20', '2022-03-20')
RETURNING id INTO id_p2;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('SK하이닉스', '반도체', 'active', 'A', '박준영', 'jy.park@skhynix.example.com', '2022-06-01', '2022-06-01')
RETURNING id INTO id_p3;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('LG에너지솔루션', '에너지/배터리', 'active', 'A', '최수진', 'sj.choi@lges.example.com', '2022-09-10', '2022-09-10')
RETURNING id INTO id_p4;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('포스코홀딩스', '철강/소재', 'active', 'A', '정해준', 'hj.jung@posco.example.com', '2023-01-05', '2023-01-05')
RETURNING id INTO id_p5;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('카카오', 'IT/플랫폼', 'active', 'B', '강민아', 'ma.kang@kakao.example.com', '2023-03-14', '2023-03-14')
RETURNING id INTO id_p6;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('네이버', 'IT/플랫폼', 'active', 'B', '윤서준', 'sj.yoon@naver.example.com', '2023-04-22', '2023-04-22')
RETURNING id INTO id_p7;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('이마트', '유통/리테일', 'active', 'B', '한지수', 'js.han@emart.example.com', '2023-07-11', '2023-07-11')
RETURNING id INTO id_p8;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('CJ제일제당', '식품/생활', 'active', 'B', '임도현', 'dh.lim@cj.example.com', '2023-09-05', '2023-09-05')
RETURNING id INTO id_p9;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('롯데케미칼', '화학/소재', 'active', 'B', '서지원', 'jw.seo@lotte.example.com', '2023-11-20', '2023-11-20')
RETURNING id INTO id_p10;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('한화솔루션', '에너지/방산', 'active', 'B', '오민준', 'mj.oh@hanwha.example.com', '2024-01-08', '2024-01-08')
RETURNING id INTO id_p11;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('GS에너지', '에너지', 'inactive', 'B', '송가은', 'ge.song@gsenergy.example.com', '2023-02-17', '2023-02-17')
RETURNING id INTO id_p12;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('빙그레', '식품/음료', 'active', 'C', '조현우', 'hw.cho@binggrae.example.com', '2024-03-30', '2024-03-30')
RETURNING id INTO id_p13;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('코오롱인더', '화학/섬유', 'inactive', 'C', '권나연', 'ny.kwon@kolon.example.com', '2023-06-25', '2023-06-25')
RETURNING id INTO id_p14;

INSERT INTO partners (name, industry, status, tier, contact_name, contact_email, created_at, updated_at)
VALUES ('두산에너빌리티', '중공업/방산', 'suspended', 'C', '유재석', 'js.yu@doosan.example.com', '2023-08-14', '2023-08-14')
RETURNING id INTO id_p15;

-- ─── Contracts ────────────────────────────────────────────────
-- value 단위: M KRW (백만원). 예) 120000 = ₩1,200억

INSERT INTO contracts (partner_id, title, status, value, currency, start_date, end_date) VALUES
  (id_p1,  '전략 기술 파트너십 계약',   'active',     120000, 'KRW', '2023-01-01', '2027-12-31'),
  (id_p2,  '모빌리티 솔루션 공급 계약', 'active',      85000, 'KRW', '2024-03-01', '2027-02-28'),
  (id_p3,  '반도체 협력 프레임워크',    'active',      70000, 'KRW', '2024-06-01', '2027-05-31'),
  (id_p4,  '배터리 소재 공급 계약',     'active',      90000, 'KRW', '2022-07-01', '2027-06-30'),
  (id_p5,  '소재 기술 협력 계약',       'active',      60000, 'KRW', '2025-01-01', '2026-12-31'),
  (id_p6,  '플랫폼 광고 솔루션 계약',   'active',      30000, 'KRW', '2026-01-01', '2026-12-31'),
  (id_p7,  '클라우드 인프라 공급 계약', 'active',      35000, 'KRW', '2025-06-01', '2027-05-31'),
  (id_p8,  '리테일 데이터 파트너십',    'active',      20000, 'KRW', '2026-03-01', '2027-02-28'),
  (id_p9,  '공급망 최적화 계약',        'active',      18000, 'KRW', '2026-01-01', '2026-12-31'),
  (id_p10, '화학소재 연구개발 계약',    'active',      25000, 'KRW', '2025-09-01', '2027-08-31'),
  (id_p11, '에너지 솔루션 파트너십',    'active',      28000, 'KRW', '2024-01-01', '2026-12-31'),
  (id_p12, '에너지 공급 기본 계약',     'expired',     18000, 'KRW', '2023-01-01', '2025-06-30'),
  (id_p13, '식품유통 채널 계약',        'active',       5500, 'KRW', '2026-04-01', '2027-03-31'),
  (id_p14, '소재 구매 계약',            'expired',     10000, 'KRW', '2022-01-01', '2025-09-30'),
  (id_p15, '중공업 파트너십',           'terminated',  15000, 'KRW', '2023-01-01', '2025-12-31');

-- ─── Revenues ─────────────────────────────────────────────────
-- 17개월 시계열: 2025-01 ~ 2026-05
-- amount 단위: M KRW (백만원). 0인 달은 INSERT 제외.
-- UNNEST(dates[], amounts[]) 패턴으로 파트너별 일괄 삽입

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p1, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[820,850,890,930,960,1000,1040,1080,1120,1170,1220,1270,1310,1360,1410,1460,1500]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p2, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[620,630,650,660,680,700,720,740,760,780,800,830,850,870,890,910,930]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p3, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[480,490,520,500,540,570,600,580,620,650,680,710,720,750,780,810,840]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p4, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[460,470,490,510,520,540,560,580,600,620,640,660,680,700,720,740,760]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p5, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p6, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p7, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[230,240,245,250,260,270,275,285,295,305,315,325,335,345,355,365,375]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p8, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[170,175,180,183,187,191,195,199,203,207,211,215,219,223,227,231,235]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p9, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[155,158,161,164,167,170,173,176,179,182,185,188,191,194,197,200,203]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p10, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[160,158,155,153,150,148,145,143,140,138,135,133,130,127,124,121,118]
) AS t(d TEXT, a INT);

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p11, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161]
) AS t(d TEXT, a INT);

-- GS에너지 (p12): 2025-01~06 까지만 매출, 이후 0 → INSERT 제외
INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p12, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01'],
  ARRAY[110,90,70,50,30,10]
) AS t(d TEXT, a INT)
WHERE a > 0;

INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p13, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01',
        '2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01'],
  ARRAY[42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58]
) AS t(d TEXT, a INT);

-- 코오롱인더 (p14): 2025-01~09 까지만 매출
INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p14, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01',
        '2025-07-01','2025-08-01','2025-09-01','2025-10-01'],
  ARRAY[58,52,46,40,34,28,22,16,10,5]
) AS t(d TEXT, a INT)
WHERE a > 0;

-- 두산에너빌리티 (p15): 2025-01~06 까지만 매출
INSERT INTO revenues (partner_id, date, amount, currency)
SELECT id_p15, d::DATE, a, 'KRW'
FROM UNNEST(
  ARRAY['2025-01-01','2025-02-01','2025-03-01','2025-04-01','2025-05-01','2025-06-01'],
  ARRAY[48,40,32,24,16,8]
) AS t(d TEXT, a INT)
WHERE a > 0;

-- ─── Activities ───────────────────────────────────────────────

INSERT INTO activities (partner_id, type, title, created_at) VALUES
  (id_p1,  'meeting',   'Q2 전략 검토 회의',          '2026-05-04T10:00:00Z'),
  (id_p2,  'call',      '모빌리티 로드맵 협의',        '2026-05-03T14:30:00Z'),
  (id_p6,  'issue',     '계약 갱신 조건 이슈 발생',    '2026-05-03T09:15:00Z'),
  (id_p5,  'milestone', '철강 공급 1,000억 달성',      '2026-05-02T16:00:00Z'),
  (id_p3,  'email',     'HBM4 협력 제안 이메일',       '2026-05-02T11:20:00Z'),
  (id_p9,  'meeting',   '공급망 KPI 분기 리뷰',        '2026-05-01T13:00:00Z'),
  (id_p11, 'call',      '계약 만료 전 협의 통화',      '2026-04-30T15:45:00Z'),
  (id_p4,  'meeting',   '배터리 소재 신규 라인 협의',  '2026-04-29T10:30:00Z'),
  (id_p7,  'milestone', '클라우드 마이그레이션 완료',  '2026-04-28T17:00:00Z'),
  (id_p12, 'issue',     '거래 중단 사후 처리 회의',    '2026-04-25T09:00:00Z'),
  (id_p1,  'milestone', '연간 매출 1,000억 돌파',      '2026-04-20T12:00:00Z'),
  (id_p8,  'meeting',   '리테일 데이터 활용 방안',     '2026-04-18T14:00:00Z');

-- ─── Risk Scores ──────────────────────────────────────────────

INSERT INTO risk_scores (partner_id, score, revenue_trend, contract_health, activity_level, updated_at) VALUES
  (id_p1,  12, 10, 8,  18, '2026-05-01'),
  (id_p2,  18, 15, 12, 27, '2026-05-01'),
  (id_p3,  22, 18, 15, 33, '2026-05-01'),
  (id_p4,  15, 12, 10, 23, '2026-05-01'),
  (id_p5,  28, 22, 30, 32, '2026-05-01'),
  (id_p6,  45, 38, 55, 42, '2026-05-01'),
  (id_p7,  31, 25, 28, 40, '2026-05-01'),
  (id_p8,  29, 24, 20, 43, '2026-05-01'),
  (id_p9,  33, 28, 40, 31, '2026-05-01'),
  (id_p10, 52, 65, 35, 56, '2026-05-01'),
  (id_p11, 48, 40, 62, 42, '2026-05-01'),
  (id_p12, 78, 90, 80, 64, '2026-05-01'),
  (id_p13, 25, 20, 18, 37, '2026-05-01'),
  (id_p14, 72, 85, 78, 53, '2026-05-01'),
  (id_p15, 88, 95, 92, 77, '2026-05-01');

END;
$$;
