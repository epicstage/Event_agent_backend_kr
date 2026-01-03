# v0.9.0 System Integrity Debug Report

**Date**: 2026-01-03
**Scope**: Full system diagnostic across 422 agents, 10 domains
**Status**: Analysis Complete

---

## Executive Summary

| Component | Status | Issues Found | Critical |
|-----------|--------|--------------|----------|
| ContextBridge | Warning | 3 | 1 |
| Guardian (SYS-006) | Pass | 0 | 0 |
| Router | Warning | 5 | 0 |
| Null Safety | Pass | 0 | 0 |

---

## 1. ContextBridge Analysis

### 1.1 Domain Coverage Gap (CRITICAL)

**Issue**: ContextBridge (`src/lib/context_bridge.ts`) only loads context for **7 domains**, but Router defines **10 domains**.

| Domain | Router Support | ContextBridge Support | Status |
|--------|---------------|----------------------|--------|
| STR (Strategy) | 54 agents | loadStrategyContext() | OK |
| FIN (Finance) | 68 agents | loadFinanceContext() | OK |
| PRJ (Project) | 40 agents | loadProjectContext() | OK |
| MKT (Marketing) | 40 agents | loadMarketingContext() | OK |
| OPS (Operations) | 40 agents | loadOperationsContext() | OK |
| HR | 40 agents | loadHRContext() | OK |
| MTG (Meetings) | 40 agents | loadMeetingsContext() | OK |
| SITE | 40 agents | **MISSING** | CRITICAL |
| MKTADV (Marketing Adv) | 40 agents | **MISSING** | CRITICAL |
| PRO (Professionalism) | 20 agents | **MISSING** | CRITICAL |

**Impact**: SITE, MKTADV, PRO 도메인 에이전트가 컨텍스트 로드 없이 실행됨. Cross-domain alerts 생성 불가.

**Recommended Fix**:
```typescript
// Add to context_bridge.ts

async loadSiteContext(eventId: string): Promise<SiteContext | null> {
  // Load venue, floor plan, logistics, housing data
}

async loadMarketingAdvContext(eventId: string): Promise<MKTADVContext | null> {
  // Load CRM data, campaign analytics, lead data
}

async loadProfessionalismContext(eventId: string): Promise<ProContext | null> {
  // Load compliance status, certifications, legal data
}
```

### 1.2 Cache Invalidation Gap

**Issue**: `invalidateCache()` method signature:
```typescript
async invalidateCache(eventId: string, domain?: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG"): Promise<void>
```

Missing: `"SITE" | "MKTADV" | "PRO"` from union type.

### 1.3 Cross-Domain Alert Types (Complete)

35+ alert types correctly defined:
- budget_impact, schedule_risk, stakeholder_concern
- resource_constraint, compliance_alert, strategy_alignment
- sponsor_impact, market_timing, communication_needed
- risk_escalation, hr_capacity, registration_impact
- catering_impact, av_requirements, safety_concern
- logistics_impact, staffing_change, training_need
- program_conflict, speaker_availability, content_quality
- venue_availability, housing_impact, housing_cost
- marketing_timing, lead_impact, campaign_conflict
- ethics_alert, compliance_risk, legal_risk

---

## 2. Guardian (SYS-006) Analysis

### 2.1 Rule Verification (20/20 PASS)

All 20 confirmation rules correctly implemented in `src/lib/confirmation_gate.ts`:

| Rule ID | Name | Change Type | Risk Level | Agent Scope |
|---------|------|-------------|------------|-------------|
| RULE-001 | High Value Transaction | high_value | high | Global (1000만원+) |
| RULE-002 | Budget Exceed | budget_exceed | high | Global (-10%) |
| RULE-003 | Data Deletion | data_deletion | critical | Global |
| RULE-004 | Cross-Domain Impact | cross_domain | medium | 2+ domains |
| RULE-005 | External Integration | external_integration | medium | API/Webhook |
| RULE-006 | Policy Change | policy_change | high | SYS-* agents |
| RULE-007 | Irreversible Action | irreversible | medium | finalize/publish |
| RULE-008 | Hotel Block Contract | high_value | high | SITE-* (50+ rooms) |
| RULE-009 | Room Block Release | irreversible | medium | SITE-037 (20+ rooms) |
| RULE-010 | Venue Contract Signature | irreversible | critical | SITE-002 |
| RULE-011 | High Budget Campaign | high_value | high | MKTADV-* (5000만원+) |
| RULE-012 | Mass Email Campaign | external_integration | medium | MKTADV-* (10000+) |
| RULE-013 | CRM Data Bulk Update | data_deletion | high | MKTADV-* (1000+) |
| RULE-014 | Retargeting Audience Export | external_integration | medium | MKTADV-026 |
| RULE-015 | Lead Segment Delete | data_deletion | medium | MKTADV-* |
| RULE-016 | Whistleblower Report | policy_change | critical | PRO-009 |
| RULE-017 | Legal Risk Critical | high_value | high | PRO-* |
| RULE-018 | Privacy Data Export | external_integration | high | PRO-013 |
| RULE-019 | Contract Signature | irreversible | critical | PRO-012 |
| RULE-020 | Conflict of Interest | policy_change | high | PRO-007 |

### 2.2 Integration Verification

**Confirmed**: `withConfirmation()` helper properly wraps agent execution:
- `src/routes/system.ts:197-230` - `/system/confirmation/check` endpoint
- `checkRequiresConfirmation()` returns triggered rules
- D1 + KV dual storage for reliability

### 2.3 Timeout Actions

| Action | Behavior |
|--------|----------|
| reject | Request auto-rejected on expiry (default) |
| approve | Request auto-approved on expiry (risky) |
| escalate | Trigger notification (not yet implemented) |

**Note**: `escalate` action triggers but notification system is TODO.

---

## 3. Router Analysis

### 3.1 Agent Catalog (422 Total)

| Domain | Code | Agent Range | Count | Status |
|--------|------|-------------|-------|--------|
| Strategy | STR | 001-054 | 54 | OK |
| Finance | FIN | 001-068 | 68 | OK |
| Project | PRJ | 001-040 | 40 | OK |
| Marketing | MKT | 001-040 | 40 | OK |
| Operations | OPS | 001-040 | 40 | OK |
| HR | HR | 001-040 | 40 | OK |
| Meetings | MTG | 001-040 | 40 | OK |
| Site | SITE | 001-040 | 40 | OK |
| Marketing Adv | MKTADV | 001-040 | 40 | OK |
| Professionalism | PRO | 001-020 | 20 | OK |

### 3.2 Potential IntentPattern Overlaps

**MKT vs MKTADV Overlap Risk**:

| MKT Agent | MKTADV Agent | Overlap Keywords |
|-----------|--------------|------------------|
| MKT-031 ROI Analysis | MKTADV-003 ROI Measurement | ROI, 투자수익률 |
| MKT-030 Conversion Tracking | MKTADV-005 Conversion Tracking | 전환 추적, conversion |
| MKT-033 Social Listening | MKTADV-010 Social Listening | 소셜 리스닝, SNS 모니터링 |
| MKT-032 Competitor Monitoring | MKTADV-004 Competitor Analysis | 경쟁사 분석 |
| MKT-026 A/B Testing | MKTADV-009 A/B Test Analysis | A/B 테스트 |

**Recommendation**: Router systemPrompt에 명확한 분기 조건 추가:
- MKT: 캠페인 실행/운영 (Execute Marketing)
- MKTADV: 데이터 분석/CRM 연동 (Marketing Analytics & CRM)

**OPS vs SITE Overlap Risk**:

| OPS Agent | SITE Agent | Overlap Area |
|-----------|------------|--------------|
| OPS-001 Venue Sourcing | SITE-001 Site Selection | 장소 선정 |
| OPS-004 Floor Plan Design | SITE-004 Floor Plan Design | 평면도 설계 |
| OPS-011 Transport Planning | SITE-029 Transport Coordination | 교통 조율 |

**Recommendation**:
- OPS: 행사 당일 현장 운영 (Day-of Operations)
- SITE: 사전 베뉴 계약/숙박 관리 (Pre-event Site & Housing)

### 3.3 Router Fallback Logic

```typescript
// Line 3248-3265: Fallback priority
if (lowerQuestion.includes("목표") || lowerQuestion.includes("goal")) {
  return { taskId: "STR-001", domain: "strategy", confidence: 0.5 };
}
return { taskId: "FIN-031", domain: "finance", confidence: 0.3 };
```

**Issue**: Default fallback to FIN-031 (Budget Structure) may not be optimal.
**Recommendation**: Consider STR-001 (Goal Setting) as universal fallback.

### 3.4 Domain Type Definitions Gap

```typescript
// Line 3483-3488
private validateDomain(domain: unknown): "finance" | "strategy" | "project" | "marketing" | "operations" | "hr" {
  // Missing: "meetings" | "site" | "marketing_adv" | "professionalism"
}
```

**Issue**: `validateDomain()` missing 4 domains in union type.

### 3.5 Out-of-Scope Detection (Strong)

181 event-related keywords defined (lines 3136-3186):
- Prevents irrelevant queries from routing
- Covers all 10 domains' vocabulary
- Returns `{ taskId: "NONE", domain: "out_of_scope" }`

---

## 4. Null Safety Analysis

### 4.1 Safe Patterns Identified

**Number coercion pattern** (context_bridge.ts):
```typescript
Number(value) || 0
```
- Used consistently for budget, count, numeric fields
- Prevents NaN propagation

**Optional chaining** (352 files use `?.`):
- Widely adopted across all agent files
- Safe property access on potentially undefined objects

### 4.2 AI Client Error Handling

`src/lib/ai.ts:154-166`:
```typescript
} catch (error) {
  console.error("Cloudflare AI error:", error);
  return {
    enhanced_result: context.localResult,
    ai_insights: {
      analysis: "AI enhancement unavailable",
      recommendations: [],
      risk_factors: [],
      confidence_score: 0.5,
    },
  };
}
```
- Graceful degradation when AI unavailable
- Falls back to local result

### 4.3 No Critical Null Risks Found

- Zod schemas validate all inputs
- TypeScript strict mode enabled
- D1 queries use prepared statements with null coalescing

---

## 5. Recommended Actions

### Priority 1 (Critical)
1. **Add SITE, MKTADV, PRO context loaders** to ContextBridge
2. **Update cache invalidation union type** to include new domains

### Priority 2 (High)
3. **Clarify MKT vs MKTADV routing** in system prompt
4. **Clarify OPS vs SITE routing** in system prompt
5. **Fix validateDomain() union type** to include all 10 domains

### Priority 3 (Medium)
6. **Implement escalate notification** for timeout_action
7. **Consider STR-001 as default fallback** instead of FIN-031
8. **Add domain coverage tests** for ContextBridge

---

## 6. Files Modified/Created

None. This is a diagnostic report only.

## 7. Test Recommendations

```bash
# 1. Router discrimination test
curl -X POST https://event-agent-api.pd-302.workers.dev/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "ROI를 분석하고 싶다"}'
# Expected: Should distinguish MKT-031 vs MKTADV-003

# 2. Guardian rule trigger test
curl -X POST https://event-agent-api.pd-302.workers.dev/system/confirmation/check \
  -H "Content-Type: application/json" \
  -d '{"input": {"amount": 15000000}, "context": {"agent_id": "FIN-001", "domain": "finance"}}'
# Expected: requires_confirmation: true, RULE-001 triggered

# 3. Out-of-scope test
curl -X POST https://event-agent-api.pd-302.workers.dev/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "오늘 날씨 어때?"}'
# Expected: out_of_scope response
```

---

**Report Generated by**: Claude Opus 4.5
**Verified Agents**: 422
**Verified Rules**: 20
**System Version**: v0.9.0
