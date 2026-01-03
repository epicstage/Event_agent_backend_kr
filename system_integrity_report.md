# System Integrity Report v0.9.0
## UI-Backend Integration Check

**Generated**: 2026-01-03
**Backend**: event-agent-api.pd-302.workers.dev
**Frontend**: github.com/epicstage/event-finance-hub (Lovable)

---

## Executive Summary

| Check | Status | Details |
|-------|--------|---------|
| Agent Count | **MISMATCH** | Router: 400, Files: 446, Gap: 46 |
| Field Naming | **MATCH** | Both use snake_case consistently |
| Migrations 011-013 | **OK** | All tables properly created |
| API Endpoints | **OK** | UI-Backend aligned |

---

## 1. Agent Routing Completeness

### 1.1 Agent Count by Domain

| Domain | Router | Files | Gap | Status |
|--------|--------|-------|-----|--------|
| STR | 54 | 54 | 0 | OK |
| FIN | 38 | 68 | **-30** | MISSING |
| PRJ | 40 | 40 | 0 | OK |
| MKT | 40 | 40 | 0 | OK |
| OPS | 40 | 40 | 0 | OK |
| HR | 40 | 40 | 0 | OK |
| MTG | 40 | 40 | 0 | OK |
| SITE | 40 | 40 | 0 | OK |
| MKTADV | 40 | 40 | 0 | OK |
| PRO | 20 | 20 | 0 | OK |
| **TOTAL** | **400** | **446** | **-46** | **CRITICAL** |

### 1.2 Missing FIN Agents in Router

**30 FIN agents exist in files but NOT in router.ts:**

```
FIN-004, FIN-007, FIN-008, FIN-009, FIN-010, FIN-011, FIN-012, FIN-013,
FIN-014, FIN-015, FIN-018, FIN-019, FIN-020, FIN-021, FIN-023, FIN-024,
FIN-025, FIN-028, FIN-039, FIN-040, FIN-042, FIN-047, FIN-049, FIN-050,
FIN-051, FIN-053, FIN-055, FIN-059, FIN-061, FIN-063
```

**Impact**: These agents CANNOT be routed to via natural language queries.

### 1.3 Router Header Mismatch

```typescript
// router.ts line 7 states:
// STR-001~054 (54개) + PRJ-001~040 (40개) + MKT-001~040 (40개) +
// FIN-001~068 (68개) + OPS-001~040 (40개) + HR-001~040 (40개) +
// MTG-001~040 (40개) + SITE-001~040 (40개) + MKTADV-001~040 (40개) +
// PRO-001~020 (20개) = 총 422개 에이전트 지원
```

**Calculation**: 54+40+40+68+40+40+40+40+40+20 = **442** (not 422)
**Actual in AGENT_CATALOG**: **400**

---

## 2. Field Name Consistency Analysis

### 2.1 UI Type Definitions (event-finance-hub/src/types/financial.ts)

```typescript
interface BudgetLineItem {
  id?: string;
  event_id: string;           // snake_case
  category: "venue" | "food_beverage" | ...;
  name: string;
  unit_cost: number;          // snake_case
  quantity: number;
  projected_amount?: number;  // snake_case
  actual_amount?: number;     // snake_case
  variance?: number;
  status?: string;
}
```

### 2.2 Backend Schema (src/schemas/financial.ts)

```typescript
const BudgetLineItemSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),      // snake_case
  category: BudgetCategory,
  name: z.string().max(200),
  unit_cost: z.number().min(0),     // snake_case
  quantity: z.number().min(0),
  projected_amount: z.number(),     // snake_case
  actual_amount: z.number(),        // snake_case
  ...
});
```

### 2.3 Verdict

| Field | UI | Backend | Match |
|-------|-----|---------|-------|
| event_id | snake_case | snake_case | YES |
| unit_cost | snake_case | snake_case | YES |
| projected_amount | snake_case | snake_case | YES |
| actual_amount | snake_case | snake_case | YES |
| food_beverage | snake_case | snake_case | YES |

**Status**: Both UI and Backend consistently use **snake_case**. No camelCase/snake_case mismatch found.

---

## 3. Migrations 011-013 Integration

### 3.1 Migration 011: Site Management (Domain H)

**Tables Created**:
- `hotel_blocks` - Hotel block management
- `room_assignments` - Guest room allocation
- `site_inspection_logs` - Venue inspection records
- `facility_inventory` - Equipment/facility tracking
- `site_setup_tasks` - Setup/teardown tasks
- `housing_invoices` - Accommodation billing

**Agent Coverage**:
- SITE-001 to SITE-040 (40 agents) - All in router

### 3.2 Migration 012: Advanced Marketing (Domain I)

**Tables Created**:
- `marketing_analytics` - Campaign metrics
- `crm_lead_segments` - Customer segmentation
- `campaign_performance_logs` - Performance tracking
- `attendee_behavior_data` - Behavior tracking
- `personalization_rules` - Content personalization
- `retargeting_audiences` - Retargeting lists

**Agent Coverage**:
- MKTADV-001 to MKTADV-040 (40 agents) - All in router

### 3.3 Migration 013: Professionalism (Domain J)

**Tables Created**:
- `compliance_audit_trails` - Audit logging
- `ethical_guidelines` - Ethics policies
- `professional_learning_logs` - Training records
- `professional_certifications` - Certification tracking
- `legal_risk_assessments` - Legal risk analysis
- `industry_standards_compliance` - Standards tracking

**Agent Coverage**:
- PRO-001 to PRO-020 (20 agents) - All in router

---

## 4. UI-Backend API Alignment

### 4.1 API Base URL

```typescript
// Frontend (api.ts)
const API_BASE_URL = "https://event-agent-api.pd-302.workers.dev";
```

### 4.2 Endpoint Mapping

| UI Function | Backend Endpoint | Status |
|-------------|-----------------|--------|
| financeAPI.getReport | GET /finance/reports/generate | OK |
| financeAPI.getBudgetItems | GET /finance/budget-items | OK |
| financeAPI.createBudgetItem | POST /finance/budget-items | OK |
| domainAPI.getAgents(domain) | GET /{domain}/agents | OK |
| domainAPI.ask(question) | POST /ask | OK |

### 4.3 Event Context Fields

UI sends these required fields in `/ask` requests:
```typescript
{
  sessionId: string,
  question: string,
  event_id: string,      // Required
  event_name: string,    // Required
  event_type: string,    // Required
}
```

Backend expects same structure - **ALIGNED**.

---

## 5. Critical Issues & Recommendations

### 5.1 CRITICAL: Missing 30 FIN Agents in Router

**Problem**: 30 finance agents cannot be accessed via intelligent routing.

**Recommended Fix**:
```typescript
// Add to AGENT_CATALOG in router.ts:
{ taskId: "FIN-004", taskName: "Legal Review Request", domain: "finance", ... },
{ taskId: "FIN-007", taskName: "Exclusivity Conflict Check", domain: "finance", ... },
// ... (28 more)
```

**Priority**: HIGH - Core finance functionality affected.

### 5.2 MEDIUM: Router Comment Discrepancy

**Problem**: Header states 422 agents, but math shows 442, actual is 400.

**Recommended Fix**: Update comment to reflect actual count.

### 5.3 LOW: Duplicate FIN-031 Entry

**Problem**: FIN-031 appears twice in router.

**Recommended Fix**: Remove duplicate entry.

---

## 6. Context Bridge Status (from debug_report.md)

**Missing Domain Context Loaders**:
- SITE (Domain H) - No loader
- MKTADV (Domain I) - No loader
- PRO (Domain J) - No loader

**Cache Invalidation Type**:
```typescript
domain?: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG"
// Missing: "SITE" | "MKTADV" | "PRO"
```

---

## 7. Verification Checklist

- [x] Frontend repo cloned and analyzed
- [x] Type definitions compared (snake_case match)
- [x] API endpoints verified
- [x] Agent files counted (446 total)
- [x] Router entries counted (400 unique)
- [x] Migration tables verified
- [x] Field naming consistency confirmed
- [x] Missing agents identified (30 FIN)

---

## 8. Next Steps

1. **Immediate**: Add 30 missing FIN agents to router.ts AGENT_CATALOG
2. **Immediate**: Fix FIN-031 duplicate in router.ts
3. **Short-term**: Add SITE, MKTADV, PRO context loaders to context_bridge.ts
4. **Short-term**: Update router.ts header comment with correct count
5. **Medium-term**: Consider automated sync between agent files and router catalog

---

**Report Generated By**: Claude Code v0.9.0 System Integrity Check
