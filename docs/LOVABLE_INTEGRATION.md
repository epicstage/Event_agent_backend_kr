# Lovable Integration Guide - CMP UI 가이드 툴팁 시스템

## 개요

이 문서는 Lovable 프론트엔드에서 `cmp_ui_guide.json` 파일을 활용하여
에이전트별 전문가 툴팁(?)을 구현하는 방법을 안내합니다.

---

## API 엔드포인트

### 1. 가이드 JSON 직접 로드 (권장)
```javascript
// Lovable에서 JSON 파일을 직접 import하거나 fetch
const CMP_GUIDE = await fetch('/docs/cmp_ui_guide.json').then(r => r.json());
```

### 2. 시스템 통계 API
```
GET https://event-agent-api.pd-302.workers.dev/system/stats
```

**응답 예시:**
```json
{
  "success": true,
  "total_agents": 122,
  "domains": {
    "finance": { "total": 68, "by_type": {"AI": 36, "Human": 12, "Hybrid": 20} },
    "strategy": { "total": 54, "by_type": {"AI": 54} }
  }
}
```

---

## 툴팁 컴포넌트 구현 예시

### React + Tailwind 컴포넌트

```tsx
// components/AgentTooltip.tsx
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import CMP_GUIDE from '@/data/cmp_ui_guide.json';

interface AgentTooltipProps {
  agentId: string; // "STR-001", "FIN-031" 등
}

export function AgentTooltip({ agentId }: AgentTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const guide = CMP_GUIDE[agentId];

  if (!guide) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 text-gray-400 hover:text-blue-500 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200 -translate-x-1/2 left-1/2 mt-2">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{guide.title}</h4>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {guide.cmp_ref.split(',')[0]}
            </span>
          </div>

          {/* CMP 표준 정의 */}
          <p className="text-sm text-gray-600 mb-3">
            {guide.definition}
          </p>

          {/* 전문가 팁 */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
            <p className="text-xs font-medium text-yellow-800 mb-1">Pro Tip</p>
            <p className="text-sm text-yellow-700">{guide.pro_tip}</p>
          </div>

          {/* 관련 에이전트 */}
          {guide.related_agents && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                관련 에이전트: {guide.related_agents.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 사용 예시

```tsx
// pages/AgentDashboard.tsx
import { AgentTooltip } from '@/components/AgentTooltip';

function AgentCard({ agent }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center">
        <h3 className="font-medium">{agent.taskName}</h3>
        <AgentTooltip agentId={agent.taskId} />
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {agent.domain === 'strategy' ? 'Strategic Planning' : 'Financial Management'}
      </p>
    </div>
  );
}
```

---

## 데이터 구조 설명

### JSON 필드

| 필드 | 타입 | 설명 | 용도 |
|------|------|------|------|
| `title` | string | 한국어 에이전트 이름 | 툴팁 헤더 |
| `title_en` | string | 영어 에이전트 이름 | 국제화 지원 |
| `definition` | string | CMP 표준 기반 정의 | 메인 설명 |
| `cmp_ref` | string | CMP-IS 표준 참조 | 뱃지/태그 |
| `pro_tip` | string | 전문가 실무 팁 | 하이라이트 박스 |
| `keywords` | array | 검색/매칭용 키워드 | 검색 기능 |
| `related_agents` | array | 연관 에이전트 ID | 네비게이션 |

### 도메인별 구조

```
Strategic Planning (Domain A)
├── Skill 1: Goal Setting (STR-001 ~ STR-013) - 13개
├── Skill 2: Stakeholder Analysis (STR-014 ~ STR-026) - 13개
├── Skill 3: Risk Management (STR-027 ~ STR-040) - 14개
└── Skill 4: Strategic Alignment (STR-041 ~ STR-054) - 14개

Financial Management (Domain D)
├── Skill 7: Event Funding (FIN-001 ~ FIN-030) - 30개
├── Skill 8: Budget Management (FIN-031 ~ FIN-057) - 27개
└── Skill 9: Monetary Transactions (FIN-058 ~ FIN-068) - 11개
```

---

## UI/UX 권장사항

### 1. 툴팁 트리거
- `?` 아이콘은 에이전트 이름 옆에 배치
- Hover 대신 Click으로 열기 (모바일 호환)
- ESC 또는 외부 클릭으로 닫기

### 2. 시각적 계층
```
┌─────────────────────────────────────┐
│ [Domain Badge] 에이전트 이름        │ ← 헤더
├─────────────────────────────────────┤
│ CMP 표준 정의 (2-3줄)               │ ← 정의
├─────────────────────────────────────┤
│ 💡 Pro Tip                          │
│ 전문가 실무 조언                     │ ← 노란색 배경
├─────────────────────────────────────┤
│ 관련: STR-002, FIN-031              │ ← 푸터 (클릭 가능)
└─────────────────────────────────────┘
```

### 3. 색상 체계
- **Strategy Domain**: 파란색 계열 (`#3B82F6`)
- **Finance Domain**: 녹색 계열 (`#10B981`)
- **Pro Tip 배경**: 노란색 (`#FEF3C7`)
- **Out-of-Scope**: 회색 (`#6B7280`)

### 4. 애니메이션
```css
.tooltip-enter {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 검색/필터 기능 활용

### 키워드 검색 구현

```typescript
function searchAgents(query: string) {
  const lowerQuery = query.toLowerCase();

  return Object.entries(CMP_GUIDE)
    .filter(([id, guide]) => {
      if (id === 'metadata') return false;

      const matchTitle = guide.title.toLowerCase().includes(lowerQuery);
      const matchKeywords = guide.keywords?.some(k =>
        k.toLowerCase().includes(lowerQuery)
      );
      const matchDefinition = guide.definition.toLowerCase().includes(lowerQuery);

      return matchTitle || matchKeywords || matchDefinition;
    })
    .map(([id, guide]) => ({ id, ...guide }));
}
```

### 스킬별 필터

```typescript
function getAgentsBySkill(skillNumber: number) {
  const skillRanges = {
    1: ['STR-001', 'STR-013'],
    2: ['STR-014', 'STR-026'],
    3: ['STR-027', 'STR-040'],
    4: ['STR-041', 'STR-054'],
    7: ['FIN-001', 'FIN-030'],
    8: ['FIN-031', 'FIN-057'],
    9: ['FIN-058', 'FIN-068'],
  };

  const [start, end] = skillRanges[skillNumber] || [];
  if (!start) return [];

  const prefix = start.split('-')[0];
  const startNum = parseInt(start.split('-')[1]);
  const endNum = parseInt(end.split('-')[1]);

  return Object.entries(CMP_GUIDE)
    .filter(([id]) => {
      if (!id.startsWith(prefix)) return false;
      const num = parseInt(id.split('-')[1]);
      return num >= startNum && num <= endNum;
    })
    .map(([id, guide]) => ({ id, ...guide }));
}
```

---

## 실시간 에이전트 카운트 표시

### 대시보드 헤더 예시

```tsx
function DashboardHeader() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('https://event-agent-api.pd-302.workers.dev/system/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold">Event Agent Dashboard</h1>
      {stats && (
        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
          {stats.total_agents} Agents Active
        </span>
      )}
    </div>
  );
}
```

---

## 체크리스트

Lovable 구현 전 확인사항:

- [ ] `cmp_ui_guide.json` 파일을 프로젝트에 포함
- [ ] 툴팁 컴포넌트 생성
- [ ] 에이전트 카드/리스트에 툴팁 연결
- [ ] 모바일 반응형 처리
- [ ] 다국어 지원 (title_en 활용)
- [ ] 관련 에이전트 링크 네비게이션
- [ ] 검색/필터 기능 구현
- [ ] `/system/stats` API 연동

---

## API 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-03 | 초기 122개 에이전트 가이드 생성 |

---

## 문의

- API 문서: https://event-agent-api.pd-302.workers.dev
- 이슈: GitHub Repository
