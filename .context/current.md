# Event_Agent_kr 프로젝트 현황

## 개요
- **목적**: 이벤트 기획/실행을 위한 AI-Native Agent System
- **버전**: 0.1.0 (백엔드), 0.8.0+ (TypeScript Workers)
- **기반**: 미국향 v1.0 → 한국향 포팅 시작
- **커밋**: 2026-01-04 초기 커밋 1개

## 아키텍처

### 백엔드 (2개 버전 공존)
1. **Python FastAPI** (`main.py`, `routers/`)
   - CMP-IS, EMBOK, APEX 표준 준수
   - 현재 Finance 도메인만 구현

2. **TypeScript Hono** (`src/`) - 메인
   - Cloudflare Workers 배포 (`wrangler.toml`)
   - D1 DB + KV + Workers AI 연동
   - **7개 도메인 + System 에이전트** 구현 완료

### 프론트엔드 (`frontend/`)
- React + Vite + TypeScript
- Shadcn/UI + Tailwind CSS
- Lovable 연동 (`lovable-tagger`)
- 빌드된 dist 존재

## 도메인 구조 (CMP-IS 기반)

| 코드 | 도메인 | Skills | 상태 |
|------|--------|--------|------|
| A | Strategic Planning | 1-4 | Active |
| B | Project Management | 5-6 | Active |
| C | Marketing Management | 7-8 | Active |
| D | Financial Management | 7-9 | Active |
| E | Operations Management | 9-10 | Active |
| F | Human Resources | 11-12 | Active |
| G | Meetings & Contents | 13-14 | Active |
| SYS | System Orchestration | - | Active |

### 에이전트 폴더 구조
```
src/agents/
├── finance/skill7,8,9
├── strategy/
├── project/skill5,6
├── marketing/skill7,8
├── operations/skill9,10
├── hr/skill11,12
├── meetings/skill13,14
├── site/skill15,16
├── marketing_adv/skill17,18
├── pro/skill19,20
└── system/
```

## 인프라

- **배포**: Cloudflare Workers
- **DB**: D1 (`event-agent-db`)
- **KV**: 캐시/세션
- **AI**: Workers AI 바인딩
- **스키마**: `schema.sql` (budget_items, sponsorship_packages, sponsors, financial_reports)

## 주요 엔드포인트

- `/` - API 상태
- `/health` - 헬스체크 + 도메인별 에이전트 수
- `/ask` - 자연어 라우팅
- `/finance`, `/strategy`, `/project`, `/marketing`, `/operations`, `/hr`, `/meetings` - 도메인별 라우터
- `/system` - 관리자 오케스트레이션

## 기능

- Intelligent Router (자연어 → 에이전트 매핑)
- Session Memory
- Gap Detection
- Out-of-Scope Detection
- Agent Orchestration
- Knowledge Learning

## 진행 중: EPIC_Master 통합 프로젝트

### 분석 완료 (2025-01-04)

**EPIC_Master 구조**:
- 9개 Orchestration Agent (Admin, Sales, Project, Onsite, Settlement, Content, Management, Solution, Product)
- 86개 Task Agent
- MicroTask 패턴 (LLM/Code 분리)
- MessageBus 기반 Agent 통신

**Event_Agent_kr 구조**:
- 7개 Domain, ~350개 에이전트
- CMP-IS Skill 1-20 기반
- executeAgentWithLLM 패턴

### 생성 문서
- `.context/integration-interview.md` - 40개 핵심 질문 + 60개 상세 질문

### 현재 상태
**인터뷰 응답 대기 중**

핵심 결정 필요:
1. Orchestration Agent 도입 여부 (Q001)
2. MicroTask 패턴 도입 여부 (Q002)
3. Lifecycle 기반 라우팅 (Q003)
4. Sales Agent 통합 범위 (Q007)

### 다음 단계
인터뷰 응답 완료 후:
- Phase 계획 수립
- 에이전트 통합 작업 시작

---

## 최근 완료 작업

### PRJ-041 ScheduleShift 에이전트 생성 (2025-01-04)

**문제**: "전체 일정 2일 미뤄줘" 요청 시 적합한 에이전트 없어서 오류 발생

**해결**: PRJ-041_ScheduleShift 에이전트 신규 생성

#### 생성/수정된 파일
1. `src/agents/project/skill6/PRJ_041_ScheduleShift.ts` (NEW)
   - 한국어 자연어 파싱 지원 ("2일 미뤄줘", "3일 앞당겨" 등)
   - 전체/부분 일정 조정 가능
   - 태스크 및 마일스톤 일괄 조정

2. `src/lib/router.ts` (MODIFIED)
   - AGENT_CATALOG에 PRJ-041 추가
   - 시스템 프롬프트에 PRJ-041 설명 추가

3. `src/agents/project/registry.ts` (MODIFIED)
   - PRJ-041 import 및 등록
   - totalAgents: 41, agentCount: 28

#### 테스트 결과
```
입력: "기획회의 일정이 2일 뒤로 밀렸어. 전체적으로 다 2일 미워줘"
라우팅: PRJ-041 (confidence: 0.95)
결과: 10개 태스크, 4개 마일스톤 2일 연기 완료
```

---
*Updated: 2025-01-04*
