비즈니스 파트너 관리 대시보드 설계 (개정판)
1. 🎯 설계 목적 (Execution 중심 재정의)
항목	기존	개선 방향
목표	파트너 정보 관리	매출/리스크/성과 기반 의사결정 시스템
역할	데이터 저장	전략 의사결정 지원 도구 (Mini-CRM + BI)
핵심 KPI	단순 매출	LTV, 유지율, 리스크 점수 포함
2. 🧩 데이터 모델 설계 (실무형 구조)
테이블	주요 필드	설명	설계 포인트
Partner	id, name, industry, status	파트너 기본 정보	상태값 ENUM 관리
Contract	partner_id, start_date, end_date, value	계약 정보	계약 히스토리 관리
Revenue	partner_id, date, amount	매출 데이터	시계열 구조 필수
Activity	partner_id, meeting, issue	활동 로그	CRM 기능
Risk Score	partner_id, score, updated_at	리스크 점수	AI 확장 대비
👉 핵심: Partner 단일 테이블 구조 금지 → 반드시 분리 설계

3. 📈 KPI 및 분석 구조 (경영 의사결정용)
KPI	정의	활용 목적
Monthly Revenue	월별 매출	성장성 분석
Retention Rate	계약 유지율	파트너 안정성
LTV	Lifetime Value	전략적 투자 판단
Risk Score	거래 감소 + 계약 만료 기반	리스크 대응
Partner Tier	A/B/C 등급	우선순위 관리
4. 🏗️ 시스템 아키텍처 (운영 가능한 구조)
레이어	기술	설계 기준
Frontend	React + Tailwind	Admin Dashboard UX
Backend	Node.js (Express)	REST API
DB	PostgreSQL	정규화 구조
Cache	Redis	KPI 성능 개선
Auth	JWT + RBAC	권한 분리
Infra	Amazon Web Services	확장성 확보
5.디자인 느낌
전문가가 만든 것처럼 다크모드(검은색 배경) 디자인으로 만들어주세요.